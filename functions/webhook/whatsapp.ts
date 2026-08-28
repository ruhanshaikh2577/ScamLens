import { analyze } from "../../src/lib/analyzer";
import { redact } from "../../src/lib/redact";

export async function onRequestGet({ request, env }: any) {
  const u = new URL(request.url);
  const token = u.searchParams.get("hub.verify_token");
  const challenge = u.searchParams.get("hub.challenge") ?? "";
  if (token !== env?.VERIFY_TOKEN) return new Response("forbidden", { status: 401 });
  return new Response(challenge, { status: 200 });
}

export async function onRequestPost({ request, env }: any) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response("bad", { status: 400 });
  }
  const text: string =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
    body?.message?.text ??
    body?.message?.body ??
    "";
  if (!text || !String(text).trim()) return new Response("ok", { status: 200 });
  const str = String(text);
  const redacted = redact(str);
  void redacted;
  const kind = str.trim().startsWith("http") ? "url" : "message";
  const r = analyze(str, kind as any);
  const evidenceLines = r.findings.slice(0, 2).map((f) => `• ${f.label}: "${f.evidence}"`).join("\n");
  const reply = `Risk: ${r.risk.toUpperCase()} — ${r.headline}${evidenceLines ? "\n" + evidenceLines : ""}\n→ ${r.nextSteps[0]}\nVerify: https://scamlens.in/how-it-works\n${r.disclaimer}`;
  // anonymized operational log only, no raw input
  try {
    await env?.REPORTS?.put?.(`webhook:${Date.now()}`, JSON.stringify({ kind, risk: r.risk, version: r.meta.analyzerVersion }));
  } catch {}
  // no sessions, do not store user id
  return new Response(JSON.stringify({ reply }), { status: 200, headers: { "content-type": "application/json" } });
}
