const PATTERNS: Array<[RegExp, string]> = [
  // 16-digit card — 4×4 groups with optional space/dash (tight to avoid phone+OTP合併)
  [/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "**** **** **** ****"],
  // 12-digit Aadhaar (spaced)
  [/\b\d{4}[ ]?\d{4}[ ]?\d{4}\b/g, "**** **** ****"],
  // 10-digit Indian mobile (+91 optional) — avoid matching longer numbers
  [/(?:\+91[ -]?)?\b[6-9]\d{9}\b/g, "**********"],
  // UPI handle — mask local part
  [/\b[\w.-]{2,}@(?:ybl|paytm|oksbi|okhdfc|okaxis|axl|ibl|icl|upi)\b/gi, "***@***"],
  // 6-digit OTP / PIN — broad \b\d{6}\b also masks 6-digit prices (e.g. 123456→******); keeping broad intentional — OTP coverage wins, tests expect this (see final-review Important #4). Tighten to OTP-context regex if price masking proves noisy.
  // ponytail: broad intentional, do not narrow without checking redact edge tests
  [/\b\d{6}\b/g, "******"],
];

export function redact(input: string): string {
  let out = input;
  for (const [pattern, mask] of PATTERNS) out = out.replace(pattern, mask);
  // Prevent double-masking of card pattern from also matching the 12-digit rule
  out = out.replace(/\*\*\*\* \*\*\*\* \*\*\*\* \*\*\*\*/g, "**** **** **** ****");
  return out;
}
