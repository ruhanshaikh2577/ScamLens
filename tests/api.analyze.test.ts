import { describe, expect, it } from "vitest";
import { analyze as clientAnalyze } from "../src/lib/analyzer";
import { onRequestPost } from "../functions/api/analyze";

describe("POST /api/analyze", () => {
  it("client and api produce same risk/detectorIds", async () => {
    const input = "DTDC pay Rs 99 https://bit.ly/x";
    const client = clientAnalyze(input, "message");
    const req = new Request("http://x/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input, kind: "message" }),
    });
    const res = await onRequestPost({ request: req } as any);
    const api = await res.json();
    expect(api.risk).toBe(client.risk);
    expect(api.meta.detectorIds.sort()).toEqual(client.meta.detectorIds.sort());
    expect(api.meta.analyzerVersion).toBe(client.meta.analyzerVersion);
  });

  it("handles legacy text/link normalization", async () => {
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
