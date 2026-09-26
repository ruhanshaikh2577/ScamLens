import { redact } from "../../src/lib/redact";

const LEGACY_MAP: Record<string, string> = { text: "message", link: "url" };
const CANONICAL = new Set(["message", "url"]);

export function normalizeKind(k: string): string {
  return LEGACY_MAP[k] ?? k;
}

export function validateReportPayload(b: any) {
  if (!b || typeof b.input !== "string") return { ok: false as const, error: "missing input" };
  const kindRaw = normalizeKind(String(b.kind || ""));
  if (!CANONICAL.has(kindRaw)) return { ok: false as const, error: "unsupported kind" };
  const canon = kindRaw as "message" | "url";
  if (!b.input.trim()) return { ok: false as const, error: "empty input" };
  if (b.input.length > 10000) return { ok: false as const, error: "input too long" };
  return { ok: true as const, input: b.input as string, kind: canon, redacted: redact(b.input) };
}
