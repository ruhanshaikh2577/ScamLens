import { describe, expect, it } from "vitest";
import { analyze } from "./analyzer";
import { redact } from "./redact";

describe("redact", () => {
  it("masks OTP, phone and card numbers", () => {
    const out = redact("Your OTP is 492813. Call 9876543210 from card 4111111111111111");
    expect(out).not.toContain("492813");
    expect(out).not.toContain("9876543210");
    expect(out).not.toContain("4111111111111111");
    expect(out).toContain("OTP");
  });
});

describe("analyze", () => {
  it("flags the classic courier Rs-99 message as high with quoted evidence", () => {
    const r = analyze(
      "DTDC: Your parcel is on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99",
      "message"
    );
    expect(["high", "critical"]).toContain(r.risk);
    expect(r.findings.length).toBeGreaterThanOrEqual(3);
    expect(r.findings.map((f) => f.label)).toContain("Payment request");
    for (const f of r.findings) {
      expect(f.evidence.length).toBeGreaterThan(0);
      expect(f.evidence.toLowerCase()).not.toContain("492813");
    }
  });

  it("catches a shortener inside a plain message without double-flagging URLs", () => {
    const msg = analyze("Pay Rs 99 delivery fee now bit.ly/parcel-fee", "message");
    expect(msg.findings.map((f) => f.id)).toContain("text-shortener");

    const url = analyze("bit.ly/parcel-fee", "url");
    expect(url.findings.map((f) => f.id)).toContain("url-shortener");
    expect(url.findings.map((f) => f.id)).not.toContain("text-shortener");
  });

  it("flags guaranteed-return investment bait", () => {
    const r = analyze(
      "VIP trading group: guaranteed returns, daily profit. Pay Rs 5000 registration fee to join.",
      "message"
    );
    const labels = r.findings.map((f) => f.id);
    expect(labels).toContain("investment-bait");
    expect(["high", "critical"]).toContain(r.risk);
    expect(r.similarScams.some((s) => s.slug === "/scams/trading-app-guaranteed-returns")).toBe(true);
  });

  it("recognises the 'Hi Mum' family-emergency pattern", () => {
    const r = analyze(
      "Hi Mum, my phone broke and this is my new number. I'm stuck at the airport, please send Rs 8000 urgently.",
      "message"
    );
    expect(r.findings.map((f) => f.id)).toContain("family-emergency");
    expect(r.risk).toBe("high");
  });

  it("flags electricity disconnection threats", () => {
    const r = analyze(
      "BSES: Your electricity will be disconnected today at 8 PM for non-payment of bill.",
      "message"
    );
    const labels = r.findings.map((f) => f.id);
    expect(labels).toContain("utility-disconnection");
    expect(["medium", "high"]).toContain(r.risk);
  });

  it("treats a friendly benign message as low risk", () => {
    const r = analyze("Hi Ma, reaching home by 8pm. Send love to everyone.", "message");
    expect(r.risk).toBe("low");
  });

  it("catches shortener + brand look-alike on a URL", () => {
    const r = analyze("bit.ly/hdfcbank-kyc-update", "url");
    const labels = r.findings.map((f) => f.id);
    expect(labels).toContain("url-shortener");
    expect(labels).toContain("url-brand-mismatch");
    expect(["high", "critical"]).toContain(r.risk);
  });

  it("flags direct APK downloads and high-abuse TLDs", () => {
    const r = analyze("https://files.invite-card.top/app-release.apk", "url");
    const labels = r.findings.map((f) => f.id);
    expect(labels).toContain("url-apk");
    expect(labels).toContain("url-tld");
    expect(r.risk).toBe("high");
  });

  it("flags insecure http links and @-userinfo tricks", () => {
    const r = analyze("http://secure-hdfcbank.com@phish.example.top/login", "url");
    const labels = r.findings.map((f) => f.id);
    expect(labels).toContain("url-insecure-http");
    expect(labels).toContain("url-userinfo");
  });

  it("escalates OTP theft attempts to critical", () => {
    const r = analyze(
      "SBI: Your account will be blocked today. Confirm your identity by sharing the OTP 551203 immediately.",
      "message"
    );
    expect(r.risk).toBe("critical");
  });

  it("always returns next steps and disclaimer", () => {
    const r = analyze("Pay Rs 499 registration fee to start work-from-home job", "message");
    expect(r.nextSteps.length).toBeGreaterThan(0);
    expect(r.disclaimer).toMatch(/Decision support/);
  });

  it("adds meta with version, timestamp, detectorIds", () => {
    const r = analyze("Pay Rs 99 fee today", "message");
    expect(r.meta.analyzerVersion).toMatch(/\d+\.\d+\.\d+/);
    expect(new Date(r.meta.timestamp).toString()).not.toBe("Invalid Date");
    expect(r.meta.detectorIds).toContain("payment-request");
    expect(Array.isArray(r.meta.sources)).toBe(true);
  });
});
