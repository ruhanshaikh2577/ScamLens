import { describe, expect, it } from "vitest";
import { onRequestGet as waGet, onRequestPost as waPost } from "../functions/webhook/whatsapp";
import { onRequestGet as tgGet, onRequestPost as tgPost } from "../functions/webhook/telegram";

describe("webhook verify", () => {
  it("whatsapp rejects bad verify token", async () => {
    const req = new Request("http://x/webhook/whatsapp?hub.verify_token=bad&hub.challenge=123&hub.mode=subscribe");
    const res = await waGet({ request: req, env: { VERIFY_TOKEN: "tok" } } as any);
    expect(res.status).toBe(401);
  });

  it("whatsapp accepts good token and returns challenge", async () => {
    const req = new Request("http://x/webhook/whatsapp?hub.verify_token=tok&hub.challenge=CHAL&hub.mode=subscribe");
    const res = await waGet({ request: req, env: { VERIFY_TOKEN: "tok" } } as any);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("CHAL");
  });

  it("telegram rejects bad verify token", async () => {
    const req = new Request("http://x/webhook/telegram?hub.verify_token=bad&hub.challenge=123");
    const res = await tgGet({ request: req, env: { VERIFY_TOKEN: "tok" } } as any);
    expect(res.status).toBe(401);
  });

  it("telegram accepts good token", async () => {
    const req = new Request("http://x/webhook/telegram?hub.verify_token=tok&hub.challenge=XYZ");
    const res = await tgGet({ request: req, env: { VERIFY_TOKEN: "tok" } } as any);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("XYZ");
  });
});

describe("webhook POST reply", () => {
  it("whatsapp replies with risk and disclaimer on valid message", async () => {
    const body = { entry: [{ changes: [{ value: { messages: [{ text: { body: "Pay Rs 99 delivery fee" } }], contacts: [{ wa_id: "123" }] } }] }] };
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: JSON.stringify(body) });
    const res = await waPost({ request: req, env: { VERIFY_TOKEN: "tok" } } as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain("risk");
    expect(text).toContain("scamlens.in/how-it-works");
    expect(text).toContain("Decision support");
  });

  it("whatsapp falls back to body.message.text", async () => {
    const body = { message: { text: "OTP 492813 Pay Rs 99" } };
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: JSON.stringify(body) });
    const res = await waPost({ request: req, env: {} } as any);
    const data = await res.json();
    expect(data.reply).toBeDefined();
    expect(data.reply).not.toContain("492813"); // redacted evidence should hide OTP
  });

  it("whatsapp returns ok on empty message", async () => {
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: JSON.stringify({ entry: [] }) });
    const res = await waPost({ request: req, env: {} } as any);
    expect(res.status).toBe(200);
  });

  it("telegram replies with risk and disclaimer", async () => {
    const body = { message: { text: "Pay Rs 99 to reschedule", chat: { id: 1 } } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: {} } as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain("risk");
    expect(text).toContain("Decision support");
  });

  it("telegram handles url kind", async () => {
    const body = { message: { text: "https://bit.ly/hdfcbank-kyc" } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: {} } as any);
    const data = await res.json();
    expect(data.reply).toContain("Risk");
  });

  it("anonymized log does not contain raw PII", async () => {
    const KV = new Map<string, string>();
    const body = { message: { text: "OTP 492813 Pay Rs 99" } };
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: JSON.stringify(body) });
    const env = {
      REPORTS: { put: (k: string, v: string) => { KV.set(k, v); return Promise.resolve(); } },
    };
    await waPost({ request: req, env } as any);
    if (KV.size > 0) {
      const stored = [...KV.values()][0];
      expect(stored).not.toContain("492813");
    }
  });

  it("returns 400 on malformed json", async () => {
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: "not json" });
    const res = await waPost({ request: req, env: {} } as any);
    expect(res.status).toBe(400);
  });
});
