import { redact } from "../../src/lib/redact";

const ALLOW = new Set(["message", "url", "text", "link"]);

export function normalizeKind(k: string): string {
  const m: Record<string, string> = { text: "message", link: "url" };
  return m[k] ?? k;
}

export function validateReportPayload(b: any) {
  if (!b || typeof b.input !== "string") return { ok: false as const, error: "missing input" };
  const kind = normalizeKind(String(b.kind || ""));
  if (!ALLOW.has(kind)) return { ok: false as const, error: "unsupported kind" };
  const canon = (kind === "text" ? "message" : kind === "link" ? "url" : kind) as "message" | "url";
  if (!b.input.trim()) return { ok: false as const, error: "empty input" };
  if (b.input.length > 10000) return { ok: false as const, error: "input too long" };
  return { ok: true as const, input: b.input as string, kind: canon, redacted: redact(b.input) };
}
