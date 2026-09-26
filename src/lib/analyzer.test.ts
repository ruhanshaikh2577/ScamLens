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

describe("international coverage (library is global, detectors must follow)", () => {
  it("flags a UK credential-harvest refund (NI number + sort code)", () => {
    const r = analyze("HMRC are refunding you 480. Send your national insurance number and sort code to claim", "message");
    expect(r.findings.map((f) => f.id)).toContain("credential-request");
    expect(["high", "critical"]).toContain(r.risk);
  });
  it("flags a US SSA suspension asking to verify an SSN at a link", () => {
    const r = analyze("SSA: your benefits will be suspended. Verify your SSN at http://ssa-verify.top/login within 24 hours", "message");
    expect(r.findings.map((f) => f.id)).toContain("credential-request");
  });
  it("flags a euro-denominated fee (EUR was not a recognised currency)", () => {
    const r = analyze("Zahlung 1,99 € redelivery fee required to release your parcel", "message");
    expect(r.findings.map((f) => f.id)).toContain("payment-request");
  });
  it("does NOT fire credential-request on legitimate self-service wording", () => {
    for (const t of [
      "Please update your Aadhaar details in the official app when convenient",
      "I need to confirm my bank account number with my own bank",
      "Verify your passport details on the official government portal",
    ]) {
      const r = analyze(t, "message");
      expect(r.findings.map((f) => f.id), `false positive on: ${t}`).not.toContain("credential-request");
    }
  });
  it("does not double-count otp/pin under credential-request", () => {
    // otp-pin owns OTP/PIN; if credential-request also matched, the score would inflate.
    const r = analyze("Your OTP is 551203, share it to verify", "message");
    expect(r.findings.map((f) => f.id)).not.toContain("credential-request");
  });
});

describe("redaction must not destroy detection signal", () => {
  // Regression: collectFindings() used to redact() the whole message BEFORE matching.
  // redact() masks UPI handles to "***@***", which is exactly what the qr-upi detector
  // matches on, so a textbook QR/UPI refund scam scored low with zero findings.
  // These cases fail if anyone re-introduces redact-before-match.
  const cases: [string, string][] = [
    ["Scan this QR to receive 499 refund. UPI id scammer@paytm", "qr-upi"],
    ["UPI id ramesh@ybl send money now", "qr-upi"],
    ["Scan this QR code and pay upi id merchant@okaxis to release the refund", "qr-upi"],
  ];
  for (const [text, detector] of cases) {
    it(`still detects ${detector} in a message redact() would mask: ${JSON.stringify(text.slice(0, 40))}…`, () => {
      const r = analyze(text, "message");
      expect(r.findings.map((f) => f.id)).toContain(detector);
      expect(r.risk).not.toBe("low");
    });
  }

  it("still masks the UPI handle in the evidence it emits", () => {
    const r = analyze("Scan this QR to receive 499 refund. UPI id scammer@paytm", "message");
    const upi = r.findings.find((f) => f.id === "qr-upi");
    expect(upi).toBeDefined();
    expect(upi!.evidence).not.toContain("scammer");
    expect(upi!.evidence).toContain("***@***");
  });

  it("does not leak a partially-sliced digit run through the evidence window", () => {
    // Evidence slices are snapped to token boundaries before redaction; a slice that
    // ended mid-number would expose a fragment that the \b\d{6}\b rule cannot match.
    const r = analyze("Refunded. Your OTP is 551203 and UPI id deepak@ybl to claim", "message");
    const all = r.findings.map((f) => f.evidence).join(" | ");
    for (const secret of ["551203", "5512", "55120", "deepak"]) {
      expect(all, `evidence leaked ${secret}`).not.toContain(secret);
    }
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

  it("returns findings, steps, headline and disclaimer in the requested language", () => {
    const input = "DTDC: Your parcel is on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99";
    const en = analyze(input, "message", "en");
    const es = analyze(input, "message", "es");
    expect(es.risk).toBe(en.risk);
    expect(es.headline).not.toBe(en.headline);
    expect(es.findings.map((f) => f.label)).not.toContain("Payment request");
    expect(es.findings.map((f) => f.id)).toEqual(en.findings.map((f) => f.id));
    expect(es.nextSteps).not.toEqual(en.nextSteps);
    expect(es.disclaimer).not.toBe(en.disclaimer);
    // evidence still quotes the raw input, unknown langs fall back to English
    expect(es.findings[0].evidence.length).toBeGreaterThan(0);
    expect(analyze(input, "message", "xx").headline).toBe(en.headline);
  });
});
