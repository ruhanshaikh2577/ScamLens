import { validateReportPayload } from "../_shared/validate";
import { analyze } from "../../src/lib/analyzer";
import { VERSION } from "../../src/lib/version";

export async function onRequestPost({ request, env }: any) {
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
  await env?.REPORTS?.put?.(`reports:${id}`, JSON.stringify(payload));
  return new Response(JSON.stringify({ id }), { status: 201, headers: { "content-type": "application/json" } });
}
