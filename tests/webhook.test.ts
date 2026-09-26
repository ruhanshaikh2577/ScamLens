import { describe, expect, it, vi, afterEach } from "vitest";
import { onRequestGet as waGet, onRequestPost as waPost } from "../functions/webhook/whatsapp";
import { onRequestGet as tgGet, onRequestPost as tgPost } from "../functions/webhook/telegram";

// Delivery stubs must not leak into the other webhook tests.
afterEach(() => vi.unstubAllGlobals());

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

describe("webhook delivery (the reply must actually reach the user)", () => {
  // Previously the computed reply was only returned as the HTTP response body, so the
  // bot produced a verdict and dropped it — nothing was ever delivered to anyone.
  function stubFetchOk() {
    const calls: { url: string; body: any }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, opts: any) => {
      calls.push({ url: String(url), body: JSON.parse(opts.body) });
      return { ok: true, status: 200 } as any;
    }));
    return calls;
  }

  it("telegram posts the reply to the Bot API and reports delivered:true", async () => {
    const calls = stubFetchOk();
    const body = { message: { text: "Pay Rs 99 delivery fee", chat: { id: 555 } } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: { TELEGRAM_BOT_TOKEN: "bot-secret" } } as any);
    const data = await res.json();
    expect(calls.length).toBe(1);
    expect(calls[0].url).toContain("api.telegram.org/botbot-secret/sendMessage");
    expect(calls[0].body.chat_id).toBe(555);
    expect(calls[0].body.text).toContain("Risk");
    expect(data.delivered).toBe(true);
  });

  it("whatsapp posts the reply to the Cloud API and reports delivered:true", async () => {
    const calls = stubFetchOk();
    const body = { entry: [{ changes: [{ value: { messages: [{ from: "919999999999", text: { body: "Pay Rs 99" } }] } }] }] };
    const req = new Request("http://x/webhook/whatsapp", { method: "POST", body: JSON.stringify(body) });
    const res = await waPost({
      request: req,
      env: { WHATSAPP_PHONE_NUMBER_ID: "12345", WHATSAPP_ACCESS_TOKEN: "tok" },
    } as any);
    const data = await res.json();
    expect(calls.length).toBe(1);
    expect(calls[0].url).toContain("graph.facebook.com");
    expect(calls[0].url).toContain("12345/messages");
    expect(calls[0].body.to).toBe("919999999999");
    expect(calls[0].body.text.body).toContain("Risk");
    expect(data.delivered).toBe(true);
  });

  it("reports delivered:false (not a fake success) when unconfigured", async () => {
    const calls = stubFetchOk();
    const body = { message: { text: "Pay Rs 99", chat: { id: 1 } } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: {} } as any);
    const data = await res.json();
    expect(calls.length).toBe(0);
    expect(data.delivered).toBe(false);
    expect(data.deliveryError).toBeTruthy();
  });

  it("reports delivered:false when the upstream API rejects the send", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 403 } as any)));
    const body = { message: { text: "Pay Rs 99", chat: { id: 1 } } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: { TELEGRAM_BOT_TOKEN: "t" } } as any);
    const data = await res.json();
    expect(data.delivered).toBe(false);
    expect(data.reply).toContain("Risk");
  });

  it("still returns a usable reply when delivery throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
    const body = { message: { text: "Pay Rs 99", chat: { id: 1 } } };
    const req = new Request("http://x/webhook/telegram", { method: "POST", body: JSON.stringify(body) });
    const res = await tgPost({ request: req, env: { TELEGRAM_BOT_TOKEN: "t" } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.delivered).toBe(false);
    expect(data.reply).toContain("Risk");
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
