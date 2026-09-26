import { describe, expect, it } from "vitest";
import { redact } from "../src/lib/redact";
import { analyze } from "../src/lib/analyzer";

describe("redact edge — Aadhaar/UPI/phone+OTP/card dash", () => {
  it("masks Aadhaar", () => expect(redact("Aadhaar 1234 5678 9012")).not.toContain("1234"));
  it("masks UPI", () => expect(redact("pay ramesh@ybl")).toBe("pay ***@***"));
  it("masks phone+OTP separately not as card", () => expect(redact("9876543210 492813")).toBe("********** ******"));
  it("masks dashed card", () => expect(redact("4111-1111-1111-1111")).toContain("****"));
});

describe("redact — PAN lengths", () => {
  // 15-digit (Amex) and 19-digit (UnionPay) PANs previously matched neither the
  // 16-digit nor the 12-digit rule and were stored verbatim in KV.
  it("masks 15-digit Amex PAN", () => {
    const pan = "378282246310005";
    expect(redact(pan)).not.toContain(pan);
  });
  it("masks 19-digit UnionPay PAN", () => {
    const pan = "4111111111111111111";
    const out = redact(`Card ${pan} end`);
    expect(out).not.toContain(pan);
    expect(out).toContain("Card");
    expect(out).toContain("end");
  });
  it("keeps a 12-digit Aadhaar as a 3-group mask, not a 4-group card", () => {
    expect(redact("1234 5678 9012")).toBe("**** **** ****");
  });
  it("keeps a 16-digit card as a 4-group mask", () => {
    expect(redact("4111111111111111")).toBe("**** **** **** ****");
  });
  it("masks okhdfcbank UPI handles (the old list had only okhdfc)", () => {
    expect(redact("pay to someone@okhdfcbank")).toBe("pay to ***@***");
  });
  it("does not mangle a short order number", () => {
    expect(redact("order 12345")).toBe("order 12345");
  });

  // Regression: a 12-digit rule that runs before the card rule consumes the first three
  // groups of a SPACED 16-digit PAN and leaves the fourth in clear.
  it("masks a SPACED 16-digit PAN completely (no half-mask)", () => {
    expect(redact("4111 1111 1111 1111")).toBe("**** **** **** ****");
  });
  it("masks a DASHED 16-digit PAN completely", () => {
    expect(redact("4111-1111-1111-1111")).toBe("**** **** **** ****");
  });
  it("masks a SPACED 19-digit PAN completely", () => {
    expect(redact("4111 1111 1111 1111 1111")).toBe("**** **** **** ****");
  });

  // Regression: matching 13/14 digit runs masked epoch-ms timestamps. Redacted input is
  // persisted to KV, so a false mask silently destroys real data.
  it("does NOT mask a 14-digit epoch-ms timestamp", () => {
    expect(redact("20260926153000")).toBe("20260926153000");
  });
  it("does NOT mask a 13-digit epoch-ms timestamp", () => {
    expect(redact("1700000000000")).toBe("1700000000000");
  });
  it("keeps phone+OTP as two separate values, not one 16-digit card", () => {
    expect(redact("9876543210 492813")).toBe("********** ******");
  });
});

describe("redact — URL credential parameters", () => {
  // A password pasted in a URL query string used to survive redaction intact, so it
  // reached the evidence snippet, the share-card PNG and the webhook replies.
  it("masks a password query value", () => {
    expect(redact("https://evil.top/login?password=TopSecret123&user=bob")).toBe(
      "https://evil.top/login?password=***&user=bob"
    );
  });
  it("preserves the parameter NAME so the url-credentials detector still fires", () => {
    const r = analyze("https://somesite.io/login?password=TopSecret123", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-credentials");
    const cred = r.findings.find((f) => f.id === "url-credentials");
    expect(cred!.evidence).not.toContain("TopSecret123");
    expect(cred!.evidence).toContain("password=");
  });
  it.each([
    ["token", "https://x.io/?token=abc123"],
    ["secret", "https://x.io/?a=1&secret=s3cr3t&b=2"],
    ["api_key", "https://x.io/?api_key=k1"],
    ["api-key", "https://x.io/?api-key=k1"],
    ["access_token", "https://x.io/?access_token=zzz"],
    ["sessionid", "https://x.io/?sessionid=deadbeef"],
    ["pwd", "https://x.io/?pwd=hunter2"],
  ])("masks %s values", (name, url) => {
    expect(redact(url)).not.toMatch(new RegExp(`(${name})=([^&*])`, "i"));
  });
  it("masks several credential params in one URL", () => {
    const out = redact("https://x.io/?token=aaa&user=bob&password=ccc&ref=1");
    expect(out).toBe("https://x.io/?token=***&user=bob&password=***&ref=1");
  });
  it("does not touch non-credential params", () => {
    expect(redact("https://z.io/?ok=1&q=search+term&page=2")).toBe("https://z.io/?ok=1&q=search+term&page=2");
  });
  it("stops at a fragment delimiter so it cannot eat the rest of the URL", () => {
    expect(redact("https://x.io/?token=abc#section")).toBe("https://x.io/?token=***#section");
  });
  it("does not mask the word password in ordinary prose", () => {
    // A scammer asking for a password is not the user handing one over; masking the
    // word would gut the evidence snippet and protect nothing.
    const out = redact("They asked for your password, do not share it");
    expect(out).toContain("password");
  });
  it("masks a credential that is also PAN-shaped, exactly once", () => {
    const out = redact("https://x.io/?password=4111111111111111");
    expect(out).toBe("https://x.io/?password=***");
  });
});

describe("evidence snippets never expose a partial credential", () => {
  // Regression: evidenceAround() snapped slice boundaries to WHITESPACE, but a space can
  // sit INSIDE a grouped credential. A slice starting at "5678 9012" of "1234 5678 9012"
  // matches no mask rule and leaked 8 digits of an Aadhaar.
  const cases: [string, string[]][] = [
    ["Dear customer, your Aadhaar 1234 5678 9012 has been linked. Your account will be suspended in 24 hours", ["1234", "5678", "9012"]],
    ["card 4111 1111 1111 1111 your bank account is blocked today", ["4111"]],
    ["card 4111-1111-1111-1111 account frozen legal action follows", ["4111"]],
    ["pay to ramesh@ybl or your account will be suspended today", ["ramesh"]],
    ["your OTP is 551203 confirm now to avoid suspension", ["551203"]],
    ["call 9876543210 immediately your wallet is blocked", ["9876543210"]],
  ];
  for (const [text, secrets] of cases) {
    it(`masks every credential in: ${JSON.stringify(text.slice(0, 38))}…`, () => {
      const evidence = analyze(text, "message").findings.map((f) => f.evidence).join(" | ");
      for (const s of secrets) {
        expect(evidence, `evidence leaked ${s}`).not.toContain(s);
      }
    });
  }
});

describe("analyzer edge — brand hyphen", () => {
  it("hdfc-bank hyphen still brand-mismatch", () => {
    const r = analyze("https://hdfc-bank-secure.com/login", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-brand-mismatch");
  });
});
