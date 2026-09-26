import { validateReportPayload } from "../_shared/validate";
import { isRateLimited } from "../_shared/rateLimit";
import { analyze } from "../../src/lib/analyzer";
import { VERSION } from "../../src/lib/version";

export async function onRequestPost({ request, env }: any) {
  // optional KV rate limit: 5/min per IP (CF Rate Limiting preferred in prod)
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || (request as any).ip || "";
  if (ip && (await isRateLimited(env, ip))) {
    return new Response(JSON.stringify({ error: "rate limited" }), { status: 429, headers: { "content-type": "application/json" } });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "malformed" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  const v = validateReportPayload(body);
  if (!v.ok) {
    const status = v.error === "input too long" ? 413 : 400;
    return new Response(JSON.stringify({ error: v.error }), { status, headers: { "content-type": "application/json" } });
  }
  const result = analyze(v.input, v.kind);
  const id = (globalThis.crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const payload = {
    id,
    kind: v.kind,
    redactedInput: v.redacted,
    detectorIds: result.meta.detectorIds,
    analyzerVersion: VERSION,
    timestamp: new Date().toISOString(),
  };
  // KV reports expire in 30 days; no raw PII stored (redactedInput only). Rate-limit via CF or env.RATE_LIMIT if present.
  const putOpts: any = { expirationTtl: 2592000 };
  await env?.REPORTS?.put?.(`reports:${id}`, JSON.stringify(payload), putOpts);
  return new Response(JSON.stringify({ id }), { status: 201, headers: { "content-type": "application/json" } });
}
