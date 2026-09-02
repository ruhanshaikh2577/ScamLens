import { describe, expect, it } from "vitest";
import { redact } from "../src/lib/redact";
import { analyze } from "../src/lib/analyzer";

describe("redact edge — Aadhaar/UPI/phone+OTP/card dash", () => {
  it("masks Aadhaar", () => expect(redact("Aadhaar 1234 5678 9012")).not.toContain("1234"));
  it("masks UPI", () => expect(redact("pay ramesh@ybl")).toBe("pay ***@***"));
  it("masks phone+OTP separately not as card", () => expect(redact("9876543210 492813")).toBe("********** ******"));
  it("masks dashed card", () => expect(redact("4111-1111-1111-1111")).toContain("****"));
});

describe("analyzer edge — brand hyphen", () => {
  it("hdfc-bank hyphen still brand-mismatch", () => {
    const r = analyze("https://hdfc-bank-secure.com/login", "url");
    expect(r.findings.map((f) => f.id)).toContain("url-brand-mismatch");
  });
});
