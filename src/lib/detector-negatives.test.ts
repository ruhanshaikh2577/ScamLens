import { describe, expect, it } from "vitest";
import { analyze } from "./analyzer";

describe("per-detector negatives and missing coverage", () => {
  it("punycode xn-- flagged in isolation", () => {
    const r = analyze("https://xn--hdfcbank-sec-xyz.com/login", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-punycode");
  });
  it("url-credentials ?password= flagged", () => {
    const r = analyze("https://example.com/login?password=123456", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-credentials");
  });
  it("url-ip raw IP flagged", () => {
    const r = analyze("http://192.168.1.10/login", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-ip");
  });
  it("legit hdfcbank.com not brand-mismatch", () => {
    const r = analyze("https://www.hdfcbank.com/personal/pay", "url");
    expect(r.findings.map((f) => f.id)).not.toContain("url-brand-mismatch");
  });
  it("legit cybercrime.gov.in not flagged as impersonation", () => {
    const r = analyze("Visit cybercrime.gov.in to file a complaint, call 1930", "message");
    // may trigger impersonation? check not high risk
    expect(r.risk).toBe("low");
  });
  it("benign urgency words without payment not flagged high", () => {
    const r = analyze("Please submit the report today at 5pm, thanks!", "message");
    expect(r.risk).not.toBe("high");
    expect(r.risk).not.toBe("critical");
  });
  it("benign 'pay' without amount not flagged as payment-request high", () => {
    const r = analyze("Please pay attention to the meeting notes", "message");
    expect(r.findings.map((f) => f.id)).not.toContain("payment-request");
  });
  it("secure https hdfcbank not insecure-http", () => {
    const r = analyze("https://www.hdfcbank.com/login", "url");
    expect(r.findings.map((f) => f.id)).not.toContain("url-insecure-http");
  });
});
