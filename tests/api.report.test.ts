import { describe, expect, it } from "vitest";
import { onRequestPost } from "../functions/api/report";

describe("POST /api/report", () => {
  it("stores redacted only", async () => {
    const KV = new Map<string, string>();
    const req = new Request("http://x/api/report", {
      method: "POST",
      body: JSON.stringify({ input: "OTP 492813 Pay Rs 99", kind: "message" }),
    });
    req.headers.set("content-type", "application/json");
    const res = await onRequestPost({
      request: req,
      env: { REPORTS: { put: (k: string, v: string) => { KV.set(k, v); return Promise.resolve(); } } },
    } as any);
    expect(res.status).toBe(201);
    const stored = JSON.parse([...KV.values()][0]);
    expect(stored.redactedInput).not.toContain("492813");
    expect(stored.redactedInput).toContain("Pay Rs 99");
    expect(stored.detectorIds).toContain("payment-request");
    expect(stored.id).toBeDefined();
    expect(stored.analyzerVersion).toMatch(/\d+\.\d+\.\d+/);
    // never stores raw
    expect(JSON.stringify(stored)).not.toContain("492813");
  });

  it("rejects too long with 413", async () => {
    const req = new Request("http://x/api/report", {
      method: "POST",
      body: JSON.stringify({ input: "a".repeat(10001), kind: "message" }),
    });
    const res = await onRequestPost({ request: req, env: {} } as any);
    expect(res.status).toBe(413);
  });

  it("rejects malformed json with 400", async () => {
    const req = new Request("http://x/api/report", { method: "POST", body: "not json" });
    const res = await onRequestPost({ request: req, env: {} } as any);
    expect(res.status).toBe(400);
  });

  it("rejects unsupported kind with 400", async () => {
    const req = new Request("http://x/api/report", {
      method: "POST",
      body: JSON.stringify({ input: "hi", kind: "foo" }),
    });
    const res = await onRequestPost({ request: req, env: {} } as any);
    expect(res.status).toBe(400);
  });

  it("normalizes legacy text/link", async () => {
    const KV = new Map<string, string>();
    const req = new Request("http://x/api/report", {
      method: "POST",
      body: JSON.stringify({ input: "hello Pay Rs 99", kind: "text" }),
    });
    const res = await onRequestPost({
      request: req,
      env: { REPORTS: { put: (k: string, v: string) => { KV.set(k, v); return Promise.resolve(); } } },
    } as any);
    expect(res.status).toBe(201);
    const stored = JSON.parse([...KV.values()][0]);
    expect(stored.kind).toBe("message");
  });

  it("stores minimal fields and id in response", async () => {
    const KV = new Map<string, string>();
    const req = new Request("http://x/api/report", {
      method: "POST",
      body: JSON.stringify({ input: "test", kind: "message" }),
    });
    const res = await onRequestPost({
      request: req,
      env: { REPORTS: { put: (k: string, v: string) => { KV.set(k, v); return Promise.resolve(); } } },
    } as any);
    const data = await res.json();
    expect(data.id).toBeDefined();
    const stored = JSON.parse([...KV.values()][0]);
    expect(stored).toHaveProperty("id");
    expect(stored).toHaveProperty("kind");
    expect(stored).toHaveProperty("redactedInput");
    expect(stored).toHaveProperty("detectorIds");
    expect(stored).toHaveProperty("analyzerVersion");
    expect(stored).toHaveProperty("timestamp");
  });
});
