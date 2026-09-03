import { analyze } from "../../src/lib/analyzer";

export async function hmacSHA256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await (globalThis.crypto as any).subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const buf = await (globalThis.crypto as any).subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function onRequestGet({ request, env }: any) {
  const u = new URL(request.url);
  const token = u.searchParams.get("hub.verify_token");
  const challenge = u.searchParams.get("hub.challenge") ?? "";
  if (!env?.VERIFY_TOKEN || token !== env.VERIFY_TOKEN) return new Response("forbidden", { status: 401 });
  return new Response(challenge, { status: 200 });
}

export async function onRequestPost({ request, env }: any) {
  let body: any;
  // Full HMAC verify when WHATSAPP_APP_SECRET is set (sha256=hex)
  if (env?.WHATSAPP_APP_SECRET) {
    const sig = request.headers.get("x-hub-signature-256") ?? request.headers.get("X-Hub-Signature-256") ?? "";
    if (!sig) return new Response("forbidden", { status: 401 });
    let raw = "";
    try {
      raw = await request.clone().text();
    } catch {
      return new Response("forbidden", { status: 401 });
    }
    const expected = "sha256=" + (await hmacSHA256(raw, env.WHATSAPP_APP_SECRET));
    if (!timingSafeEqual(sig, expected)) return new Response("forbidden", { status: 401 });
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return new Response("bad", { status: 400 });
    }
  } else {
    try {
      body = await request.json();
    } catch {
      return new Response("bad", { status: 400 });
    }
  }
  const text: string =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
    body?.message?.text ??
    body?.message?.body ??
    "";
  if (!text || !String(text).trim()) return new Response("ok", { status: 200 });
  const str = String(text);
  const kind = str.trim().startsWith("http") ? "url" : "message";
  const r = analyze(str, kind as any);
  const evidenceLines = r.findings.slice(0, 2).map((f) => `• ${f.label}: "${f.evidence}"`).join("\n");
  const reply = `Risk: ${r.risk.toUpperCase()} — ${r.headline}${evidenceLines ? "\n" + evidenceLines : ""}\n→ ${r.nextSteps[0]}\nVerify: https://scamlens.in/how-it-works\n${r.disclaimer}`;
  // anonymized operational log only, no raw input, 30d TTL
  try {
    await env?.REPORTS?.put?.(`webhook:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, JSON.stringify({ kind, risk: r.risk, version: r.meta.analyzerVersion }), { expirationTtl: 2592000 } as any);
  } catch {}
  // no sessions, do not store user id
  return new Response(JSON.stringify({ reply }), { status: 200, headers: { "content-type": "application/json" } });
}
