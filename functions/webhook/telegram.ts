import { analyze } from "../../src/lib/analyzer";

export async function onRequestGet({ request, env }: any) {
  const u = new URL(request.url);
  const token = u.searchParams.get("hub.verify_token") ?? u.searchParams.get("verify_token");
  const challenge = u.searchParams.get("hub.challenge") ?? "";
  if (!env?.VERIFY_TOKEN || token !== env.VERIFY_TOKEN) return new Response("forbidden", { status: 401 });
  return new Response(challenge, { status: 200 });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function onRequestPost({ request, env }: any) {
  // Telegram secret token verify if TELEGRAM_SECRET_TOKEN is set (X-Telegram-Bot-Api-Secret-Token)
  if (env?.TELEGRAM_SECRET_TOKEN) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token") ?? request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
    if (!timingSafeEqual(secret, env.TELEGRAM_SECRET_TOKEN)) return new Response("forbidden", { status: 401 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response("bad", { status: 400 });
  }
  const text: string =
    body?.message?.text ??
    body?.edited_message?.text ??
    body?.channel_post?.text ??
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
    "";
  if (!text || !String(text).trim()) return new Response("ok", { status: 200 });
  const str = String(text);
  const kind = str.trim().startsWith("http") ? "url" : "message";
  const r = analyze(str, kind as any);
  const evidenceLines = r.findings.slice(0, 2).map((f) => `• ${f.label}: "${f.evidence}"`).join("\n");
  const reply = `Risk: ${r.risk.toUpperCase()} — ${r.headline}${evidenceLines ? "\n" + evidenceLines : ""}\n→ ${r.nextSteps[0]}\nVerify: https://scamlens.in/how-it-works\n${r.disclaimer}`;
  try {
    await env?.REPORTS?.put?.(`webhook:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, JSON.stringify({ kind, risk: r.risk, version: r.meta.analyzerVersion }), { expirationTtl: 2592000 } as any);
  } catch {}
  return new Response(JSON.stringify({ reply }), { status: 200, headers: { "content-type": "application/json" } });
}
