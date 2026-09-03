import { validateReportPayload } from "../_shared/validate";
import { analyze } from "../../src/lib/analyzer";

export async function onRequestPost({ request }: any) {
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
  // Pass raw input — analyzer does internal redact so evidence is consistent across client/API/report/webhooks.
  const result = analyze(v.input, v.kind);
  return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
}
