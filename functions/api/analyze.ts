import { validateReportPayload } from "../_shared/validate";
import { isRateLimited } from "../_shared/rateLimit";
import { analyze } from "../../src/lib/analyzer";

import { SHORTENERS } from "../../src/lib/analyzer";
import { VERSION } from "../../src/lib/version";

// new URL(...).hostname KEEPS the brackets on IPv6 literals ("[::1]"). Comparing the
// bare form is what makes the range checks below match at all — previously every
// unbracketed comparison failed, so loopback/ULA/link-local were classified "public".
function bareHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

// Expand an IPv4-mapped IPv6 literal to dotted quad: "::ffff:127.0.0.1" and the
// hex form "::ffff:7f00:1" (which is what the URL parser actually produces).
function mappedV4(h: string): string | null {
  const dotted = h.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) return dotted[1];
  const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return null;
  const hi = parseInt(hex[1], 16);
  const lo = parseInt(hex[2], 16);
  return [hi >> 8, hi & 0xff, lo >> 8, lo & 0xff].join(".");
}

function isPrivateIPv4(h: string): boolean {
  const p = h.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = p;
  if (a === 0 || a === 10 || a === 127) return true;        // this-network, RFC1918, loopback
  if (a === 169 && b === 254) return true;                  // link-local + cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true;        // CGNAT 100.64/10
  if (a === 172 && b >= 16 && b <= 31) return true;         // RFC1918
  if (a === 192 && b === 0 && c === 0) return true;         // 192.0.0.0/24 only — NOT all of 192.0.0.0/16
  if (a === 192 && b === 168) return true;                  // RFC1918
  if (a === 198 && (b === 18 || b === 19)) return true;    // benchmarking 198.18/15
  if (a >= 224) return true;                                // multicast, reserved, broadcast
  return false;
}

function isPrivateHost(hostname: string): boolean {
  const h = bareHost(hostname);
  if (h === "" || h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "::" || h === "::1") return true;               // unspecified, loopback
  if (h.includes(":")) {
    if (h.startsWith("fc") || h.startsWith("fd")) return true;  // unique local fc00::/7
    if (/^fe[89ab]/.test(h)) return true;                      // link-local fe80::/10
    const v4 = mappedV4(h);
    return v4 ? isPrivateIPv4(v4) : false;
  }
  return isPrivateIPv4(h);
}

function extractShortUrl(input: string, kind: string): string | null {
  const trimmed = input.trim();
  // url kind: the whole input is the candidate
  if (kind === "url") {
    try {
      const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      const host = u.hostname.toLowerCase().replace(/^www\./, "");
      if (SHORTENERS.includes(host)) return u.href;
    } catch {}
    return null;
  }
  // message kind: find first shortener URL inside text
  const re = new RegExp(`https?:\\/\\/(?:www\\.)?(?:${SHORTENERS.map(s=>s.replace(/\./g,"\\.")).join("|")})\\/\\S+`, "i");
  const m = trimmed.match(re);
  if (m) return m[0];
  // also bare shortener without scheme (bit.ly/abc)
  const reBare = new RegExp(`\\b(?:${SHORTENERS.map(s=>s.replace(/\./g,"\\.")).join("|")})\\/\\S+`, "i");
  const m2 = trimmed.match(reBare);
  if (m2) {
    const cand = m2[0].startsWith("http") ? m2[0] : `https://${m2[0]}`;
    try { new URL(cand); return cand; } catch { return null; }
  }
  return null;
}

const MAX_HOPS = 2;
const MAX_EXPANDED_LEN = 2048;
const FETCH_TIMEOUT_MS = 2500;
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

async function fetchHop(url: URL, method: string): Promise<Response | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url.href, {
      method,
      // Never "follow". The runtime would resolve the entire chain before we could
      // inspect a single hop, which is exactly what made the SSRF guard ineffective.
      // We walk Location headers ourselves and validate each hop BEFORE fetching it.
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "User-Agent": `ScamLens/${VERSION} (link-expander)`,
        Accept: "*/*",
        ...(method === "GET" ? { Range: "bytes=0-1024" } : {}),
      } as any,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(to);
  }
}

function truncate(href: string): string {
  return href.length > MAX_EXPANDED_LEN ? href.slice(0, MAX_EXPANDED_LEN) : href;
}

// Expand at most MAX_HOPS-1 redirect(s). Every hop is checked with isPrivateHost()
// before it is requested; anything internal, non-http(s) or unparseable aborts.
async function expandShortUrl(urlStr: string): Promise<string | null> {
  let current: URL;
  try {
    current = new URL(urlStr);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(current.protocol)) return null;
  if (isPrivateHost(current.hostname)) return null;

  let expanded = false;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const res = await fetchHop(current, hop === 0 ? "HEAD" : "GET");
    if (!res) break;
    const loc = res.headers.get("location");
    if (!loc || !REDIRECT_STATUSES.includes(res.status)) break;
    let next: URL;
    try {
      next = new URL(loc, current.href);
    } catch {
      break;
    }
    if (!/^https?:$/.test(next.protocol)) break;
    if (isPrivateHost(next.hostname)) break; // validate BEFORE the next request goes out
    current = next;
    expanded = true;
  }
  return expanded ? truncate(current.href) : null;
}

export async function onRequestPost({ request, env }: any) {
  // This handler makes outbound fetches, so it must not be usable as a free
  // open-redirect resolver. report.ts already rate-limits; this one did not.
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (request as any).ip ||
    "";
  if (ip && (await isRateLimited(env, ip, 30, 60, "analyze"))) {
    return new Response(JSON.stringify({ error: "rate limited" }), { status: 429, headers: { "content-type": "application/json" } });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "malformed" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  const v = validateReportPayload(body);
  if (!v.ok) {
    const status = v.error === "input too long" ? 413 : 400;
    return new Response(JSON.stringify({ error: v.error }), { status, headers: { "content-type": "application/json" } });
  }
  let lang = "en";
  try {
    const q = new URL(request.url).searchParams.get("lang");
    if (q && /^[a-z-]{2,5}$/i.test(q)) lang = q.toLowerCase();
  } catch {}
  const base = analyze(v.input, v.kind, lang);

  // ponytail: expand one shortener hop only — one fetch, 2.5s cap, no chain
  const shortUrl = extractShortUrl(v.input, v.kind);
  if (!shortUrl) {
    return new Response(JSON.stringify(base), { status: 200, headers: { "content-type": "application/json" } });
  }
  const expandedUrl = await expandShortUrl(shortUrl);
  if (!expandedUrl || expandedUrl === shortUrl) {
    return new Response(JSON.stringify(base), { status: 200, headers: { "content-type": "application/json" } });
  }

  // Analyze expanded destination and merge — this surfaces brand-mismatch, TLD, apk etc from the real target
  const expanded = analyze(expandedUrl, "url", lang);

  const riskOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
  const highestRisk = (riskOrder[expanded.risk] ?? 0) > (riskOrder[base.risk] ?? 0) ? expanded.risk : base.risk;
  const headline = (riskOrder[expanded.risk] ?? 0) > (riskOrder[base.risk] ?? 0) ? expanded.headline : base.headline;

  // merge findings deduped
  const seen = new Set(base.findings.map(f => `${f.id}|${f.evidence}`));
  const findings = [...base.findings];
  for (const f of expanded.findings) {
    const k = `${f.id}|${f.evidence}`;
    if (!seen.has(k)) { findings.push(f); seen.add(k); }
  }
  // annotate that short link was resolved — keep evidence minimal (host only) to avoid leaking full target in logs
  let expandedHost = "";
  try { expandedHost = new URL(expandedUrl).hostname.replace(/^www\./, ""); } catch {}
  if (expandedHost && !findings.some(f => f.id === "url-shortener" && f.evidence === expandedHost)) {
    // findings already contain url-shortener for original; add resolved host as separate evidence via brand-mismatch etc already present — skip extra noise
  }

  const detectorIds = [...new Set([...base.meta.detectorIds, ...expanded.meta.detectorIds])];
  const sourcesMap = new Map<string, { label: string; href: string }>();
  for (const s of [...base.meta.sources, ...expanded.meta.sources]) sourcesMap.set(`${s.label}|${s.href}`, s);
  const sources = [...sourcesMap.values()].slice(0, 3);
  const similarMap = new Map<string, typeof base.similarScams[number]>();
  for (const s of [...base.similarScams, ...expanded.similarScams]) similarMap.set(s.slug, s);
  const similarScams = [...similarMap.values()].slice(0, 3);
  const nextSteps = [...new Set([...base.nextSteps, ...expanded.nextSteps])].slice(0, 4);

  const merged: any = {
    ...base,
    risk: highestRisk,
    headline,
    findings: findings.slice(0, 8),
    nextSteps,
    similarScams,
    meta: { ...base.meta, detectorIds, sources, expandedUrl, expandedHost },
  };

  return new Response(JSON.stringify(merged), { status: 200, headers: { "content-type": "application/json" } });
}
