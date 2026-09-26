import { describe, expect, it, vi, afterEach } from "vitest";
import { analyze as clientAnalyze } from "../src/lib/analyzer";
import { onRequestPost, resolvesToInternal } from "../functions/api/analyze";

afterEach(() => vi.restoreAllMocks());

function mockFetchNoExpand() {
  vi.stubGlobal("fetch", vi.fn(async () => ({ status: 404, headers: { get: () => null }, url: "", body: { cancel: async () => {} } } as any)));
}

// Stubs fetch so the shortener answers with a single 302 to `target`, and records
// every outbound request so we can assert WHAT was fetched, not just the response.
function mockShortenerRedirect(target: string) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (href: string) => {
      calls.push(String(href));
      if (String(href).startsWith("https://bit.ly")) {
        return { status: 302, headers: { get: (k: string) => (k.toLowerCase() === "location" ? target : null) }, url: "", body: { cancel: async () => {} } } as any;
      }
      return { status: 200, headers: { get: () => null }, url: String(href), body: { cancel: async () => {} } } as any;
    })
  );
  return calls;
}

describe("SSRF guard — DNS resolution (a hostname is not an address)", () => {
  // isPrivateHost() alone cannot see that `localtest.me` resolves to 127.0.0.1.
  // These use an injected resolver, so they need no network and are deterministic.
  it("flags a name that resolves to loopback", async () => {
    expect(await resolvesToInternal("localtest.me", async () => ["127.0.0.1"])).toBe(true);
  });
  it("flags a nip.io-style name resolving to 127.0.0.1", async () => {
    expect(await resolvesToInternal("127.0.0.1.nip.io", async () => ["127.0.0.1"])).toBe(true);
  });
  it("flags a name resolving to cloud metadata", async () => {
    expect(await resolvesToInternal("metadata.example", async () => ["169.254.169.254"])).toBe(true);
  });
  it("flags a name resolving to RFC1918", async () => {
    expect(await resolvesToInternal("internal.example", async () => ["10.0.0.5"])).toBe(true);
  });
  it("flags when ANY resolved address is internal (mixed A record)", async () => {
    expect(await resolvesToInternal("mixed.example", async () => ["93.184.216.34", "127.0.0.1"])).toBe(true);
  });
  it("flags when a v4 and v6 answer disagree", async () => {
    expect(await resolvesToInternal("dual.example", async () => ["8.8.8.8", "::1"])).toBe(true);
  });
  it("allows a name that resolves only to public addresses", async () => {
    expect(await resolvesToInternal("phishy-bank.top", async () => ["104.21.7.168"])).toBe(false);
  });
  it("allows a name with no DNS records (the fetch would fail anyway)", async () => {
    expect(await resolvesToInternal("nx.example", async () => [])).toBe(false);
  });
  it("still rejects literal IPs without consulting DNS", async () => {
    let called = false;
    expect(await resolvesToInternal("127.0.0.1", async () => { called = true; return []; })).toBe(true);
    expect(await resolvesToInternal("[::1]", async () => { called = true; return []; })).toBe(true);
    expect(called).toBe(false);
  });
  it("degrades to the string check when DNS is unavailable", async () => {
    // resolver === null models node:dns being absent (no nodejs_compat).
    expect(await resolvesToInternal("phishy-bank.top", null)).toBe(false);
    expect(await resolvesToInternal("10.0.0.1", null)).toBe(true);
  });

  // Live DNS, matching the Workers runtime's own resolve4/resolve6 path. Node has a
  // working node:dns, so this exercises the real resolver rather than a fake.
  it("resolves localtest.me to loopback with the real resolver", async () => {
    const mod: any = await import("node:dns");
    const dns = mod?.default ?? mod;
    const addrs: string[] = [];
    try { addrs.push(...(await dns.promises.resolve4("localtest.me"))); } catch { /* offline */ }
    if (addrs.length === 0) return; // no network here — the injected cases above cover the logic
    expect(addrs.some((a: string) => a.startsWith("127."))).toBe(true);
    expect(await resolvesToInternal("localtest.me")).toBe(true);
  });
});

describe("SSRF guard — /api/analyze link expansion", () => {
  // Every one of these was previously classified "public" and fetched. new URL().hostname
  // keeps the brackets on IPv6 literals, so the old comparisons never matched.
  const internalTargets = [
    "http://[::1]:8080/admin",
    "http://[fd00::1]/",
    "http://[fe80::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://169.254.169.254/latest/meta-data/",
    "http://100.64.0.1/",
    "http://10.0.0.5/",
    "http://127.0.0.1/",
    "http://192.168.1.1/",
    "http://2130706433/",
    "http://0x7f000001/",
    "file:///etc/passwd",
  ];

  for (const target of internalTargets) {
    it(`refuses to expand a short link pointing at ${target}`, async () => {
      const calls = mockShortenerRedirect(target);
      const req = new Request("http://x/api/analyze", {
        method: "POST",
        body: JSON.stringify({ input: "https://bit.ly/x", kind: "url" }),
      });
      const res = await onRequestPost({ request: req } as any);
      const data = await res.json();
      expect(data.meta.expandedUrl).toBeUndefined();
      // and the internal target was never actually requested
      expect(calls.some((u) => u.includes(target.replace(/^https?:\/\//, "").split("/")[0]))).toBe(false);
    });
  }

  it("still expands a legitimate public redirect (no false negative)", async () => {
    mockShortenerRedirect("https://phishy-bank.top/verify?otp=123456");
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "https://bit.ly/x", kind: "url" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const data = await res.json();
    expect(data.meta.expandedUrl).toContain("phishy-bank.top");
    // evidence coming back from an expanded URL must still be redacted
    for (const f of data.findings) expect(f.evidence).not.toContain("123456");
  });

  it("does not over-block public 192.0.x.x addresses", async () => {
    // 192.0.0.0/24 is reserved; the rest of 192.0.0.0/16 is public and must still expand.
    for (const target of ["https://legit-site.com/x", "http://192.0.2.55/x", "http://192.0.1.1/x"]) {
      mockShortenerRedirect(target);
      const req = new Request("http://x/api/analyze", {
        method: "POST",
        body: JSON.stringify({ input: "https://bit.ly/x", kind: "url" }),
      });
      const res = await onRequestPost({ request: req } as any);
      const data = await res.json();
      expect(data.meta.expandedUrl, `${target} should still expand`).toBeTruthy();
    }
  });

  it("never asks the runtime to follow redirects itself", async () => {
    const seen: string[] = [];
    const spy = vi.fn(async (_href: string, opts: any) => {
      seen.push(opts?.redirect);
      return { status: 302, headers: { get: () => null }, url: "", body: { cancel: async () => {} } } as any;
    });
    vi.stubGlobal("fetch", spy);
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "https://bit.ly/x", kind: "url" }),
    });
    await onRequestPost({ request: req } as any);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((r) => r === "manual")).toBe(true);
  });
});

describe("i18n — analyzer strings follow the requested locale", () => {
  // The checker posts /api/analyze?lang=<locale>. If that param is dropped the server
  // silently defaults to "en" and non-English locales get English verdicts, so pin
  // the whole chain: server honours ?lang, and local analyze() is locale-aware.
  const input = "URGENT: your account is blocked today, share OTP to release Rs 99 delivery fee";

  it("returns locale-specific headlines from the server when ?lang is present", async () => {
    mockFetchNoExpand();
    const results: Record<string, string> = {};
    for (const lang of ["en", "de", "ja", "fr"]) {
      const req = new Request(`http://x/api/analyze?lang=${lang}`, {
        method: "POST",
        body: JSON.stringify({ input, kind: "message" }),
      });
      const res = await onRequestPost({ request: req } as any);
      results[lang] = (await res.json()).headline;
    }
    expect(results.en).toBeTruthy();
    // every non-en locale must differ from the English headline
    for (const lang of ["de", "ja", "fr"]) {
      expect(results[lang], `${lang} headline equals the English one`).not.toBe(results.en);
    }
    expect(new Set(Object.values(results)).size).toBe(4);
  });

  it("falls back to English for an unknown locale instead of crashing", async () => {
    mockFetchNoExpand();
    const req = new Request("http://x/api/analyze?lang=zz", {
      method: "POST",
      body: JSON.stringify({ input, kind: "message" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.risk).toBeTruthy();
    expect(data.headline).toBe(clientAnalyze(input, "message", "en").headline);
  });

  it("local analyze() is locale-aware (offline / extension path)", () => {
    const en = clientAnalyze(input, "message", "en").headline;
    const ja = clientAnalyze(input, "message", "ja").headline;
    const de = clientAnalyze(input, "message", "de").headline;
    expect(ja).not.toBe(en);
    expect(de).not.toBe(en);
    expect(ja).not.toBe(de);
  });
});

describe("rate limiting — /api/analyze", () => {
  it("does not let analyze traffic consume the /api/report budget", async () => {
    const store = new Map<string, string>();
    const env: any = { RATE_LIMIT: { get: async (k: string) => store.get(k), put: async (k: string, v: string) => { store.set(k, v); } } };
    const mk = (ip: string) => ({
      url: "http://x/api/analyze",
      headers: new Headers([["cf-connecting-ip", ip]]),
      json: async () => ({ input: "hello world", kind: "message" }),
    });
    // Hammer /api/analyze far past /api/report's limit of 5, from the same IP.
    for (let i = 0; i < 25; i++) await onRequestPost({ request: mk("7.7.7.7") as any, env });
    // A real reporter on that same IP must still get through.
    const { onRequestPost: report } = await import("../functions/api/report");
    const reportReq = {
      url: "http://x/api/report",
      headers: new Headers([["cf-connecting-ip", "7.7.7.7"]]),
      json: async () => ({ input: "scam message", kind: "message" }),
    };
    const res = await report({ request: reportReq as any, env: { ...env, REPORTS: { put: async () => {} } } });
    expect(res.status).toBe(201);
  });

  it("returns 429 past the limit and leaves other IPs alone", async () => {
    mockFetchNoExpand();
    const store = new Map<string, string>();
    const env: any = { RATE_LIMIT: { get: async (k: string) => store.get(k), put: async (k: string, v: string) => { store.set(k, v); } } };
    // Minimal request stub: the handler reads only headers + json().
    const mk = (ip: string) => ({
      url: "http://x/api/analyze",
      headers: new Headers([["cf-connecting-ip", ip]]),
      json: async () => ({ input: "hello world", kind: "message" }),
    });

    const codes: number[] = [];
    for (let i = 0; i < 32; i++) codes.push((await onRequestPost({ request: mk("9.9.9.9") as any, env })).status);
    expect(codes.slice(0, 30).every((c) => c === 200)).toBe(true);
    expect(codes.slice(30).every((c) => c === 429)).toBe(true);

    const other = await onRequestPost({ request: mk("8.8.8.8") as any, env });
    expect(other.status).toBe(200);
  });
});

describe("URL evidence redaction (privacy invariant)", () => {
  // urlFindings() matches the raw URL but redacts the emitted evidence, so anything
  // redact() covers is masked here too. The 6-digit OTP rule is the deliberate,
  // broad one; a free-form password has no redact() rule and is out of scope here.
  it("masks a 6-digit OTP embedded in URL evidence", () => {
    const r = clientAnalyze("https://evil.top/verify?otp=123456", "url");
    for (const f of r.findings) expect(f.evidence).not.toContain("123456");
  });

  it("masks a 6-digit OTP in a URL's own query string", () => {
    const r = clientAnalyze("https://somesite.io/login?otp=987654", "url");
    const cred = r.findings.find((f) => f.id === "url-credentials");
    expect(cred).toBeDefined();
    expect(cred!.evidence).not.toContain("987654");
  });

  it("does not break URL detection by masking the parsed host", () => {
    const r = clientAnalyze("https://evil.top/free/app.apk", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-apk");
    expect(r.findings.map((f) => f.id)).toContain("url-tld");
  });
});

describe("POST /api/analyze", () => {
  it("client and api produce same risk/detectorIds (api may add expanded-url signals)", async () => {
    mockFetchNoExpand();
    const input = "DTDC pay Rs 99 https://bit.ly/x";
    const client = clientAnalyze(input, "message");
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input, kind: "message" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const api = await res.json();
    const order: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
    expect(order[api.risk] >= order[client.risk]).toBe(true);
    expect(api.meta.detectorIds).toEqual(expect.arrayContaining(client.meta.detectorIds));
    expect(api.meta.analyzerVersion).toBe(client.meta.analyzerVersion);
  });

  it("handles legacy text/link normalization", async () => {
    mockFetchNoExpand();
    const reqText = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "hello Pay Rs 99", kind: "text" }),
    });
    const resText = await onRequestPost({ request: reqText } as any);
    expect(resText.status).toBe(200);
    const dataText = await resText.json();
    expect(dataText.meta.detectorIds).toContain("payment-request");

    const reqLink = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "https://bit.ly/x", kind: "link" }),
    });
    const resLink = await onRequestPost({ request: reqLink } as any);
    expect(resLink.status).toBe(200);
    const dataLink = await resLink.json();
    // link normalized to url should produce url findings
    expect(dataLink.findings.map((f: any) => f.id)).toContain("url-shortener");
  });

  it("expands shortener and merges brand-mismatch from target", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: any, opts: any) => {
      const u = String(url);
      if (u.includes("bit.ly/expand")) {
        if (opts?.method === "HEAD") {
          return { status: 302, headers: { get: (k: string) => k.toLowerCase() === "location" ? "https://hdfcbank-login.evil.com/secure" : null }, url: u } as any;
        }
      }
      return { status: 404, headers: { get: () => null }, url: u, body: { cancel: async () => {} } } as any;
    }));
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "https://bit.ly/expand", kind: "url" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const api = await res.json();
    expect(api.meta.expandedUrl).toBe("https://hdfcbank-login.evil.com/secure");
    expect(api.meta.detectorIds).toContain("url-shortener");
    expect(api.meta.detectorIds).toContain("url-brand-mismatch");
  });

  it("rejects too long with 413", async () => {
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "a".repeat(10001), kind: "message" }),
    });
    const res = await onRequestPost({ request: req } as any);
    expect(res.status).toBe(413);
  });

  it("rejects malformed with 400", async () => {
    const req = new Request("http://x/api/analyze", { method: "POST", body: "bad json" });
    const res = await onRequestPost({ request: req } as any);
    expect(res.status).toBe(400);
  });

  it("returns full AnalysisResult shape with meta identical structure", async () => {
    mockFetchNoExpand();
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input: "Pay Rs 99 fee today", kind: "message" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const api = await res.json();
    expect(api).toHaveProperty("risk");
    expect(api).toHaveProperty("headline");
    expect(api).toHaveProperty("findings");
    expect(api).toHaveProperty("nextSteps");
    expect(api).toHaveProperty("disclaimer");
    expect(api).toHaveProperty("meta");
    expect(api.meta).toHaveProperty("analyzerVersion");
    expect(api.meta).toHaveProperty("timestamp");
    expect(api.meta).toHaveProperty("detectorIds");
    expect(api.meta).toHaveProperty("sources");
  });
});
