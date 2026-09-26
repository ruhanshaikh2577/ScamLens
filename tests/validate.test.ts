import { describe, expect, it } from "vitest";
import { validateReportPayload, normalizeKind } from "../functions/_shared/validate";

describe("validateReportPayload", () => {
  it("rejects unsupported kind", () => expect(validateReportPayload({ input: "hi", kind: "foo" }).ok).toBe(false));
  it("rejects >10k", () => expect(validateReportPayload({ input: "a".repeat(10001), kind: "message" }).ok).toBe(false));
  it("rejects empty", () => expect(validateReportPayload({ input: "", kind: "message" }).ok).toBe(false));
  it("normalizes text->message and link->url", () => {
    expect(normalizeKind("text")).toBe("message");
    expect(normalizeKind("link")).toBe("url");
    expect(validateReportPayload({ input: "hello", kind: "text" }).ok).toBe(true);
    expect(validateReportPayload({ input: "https://example.com", kind: "link" }).ok).toBe(true);
    const v = validateReportPayload({ input: "hello", kind: "text" }) as any;
    expect(v.kind).toBe("message");
  });
  it("rejects missing input", () => expect(validateReportPayload({ kind: "message" }).ok).toBe(false));
  it("rejects whitespace only", () => expect(validateReportPayload({ input: "   ", kind: "message" }).ok).toBe(false));
  it("accepts valid message and url", () => {
    expect(validateReportPayload({ input: "hello", kind: "message" }).ok).toBe(true);
    expect(validateReportPayload({ input: "https://example.com", kind: "url" }).ok).toBe(true);
  });
  it("redacts sensitive data", () => {
    const v = validateReportPayload({ input: "OTP 492813", kind: "message" }) as any;
    expect(v.redacted).not.toContain("492813");
  });
  it("rejects malformed body", () => {
    expect(validateReportPayload(null).ok).toBe(false);
    expect(validateReportPayload(undefined).ok).toBe(false);
    expect(validateReportPayload({}).ok).toBe(false);
  });
});
