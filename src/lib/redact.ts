// Order matters and is load-bearing:
//  1. The 12-19 digit card/Aadhaar rule runs FIRST, and matches a WHOLE digit run in one
//     pass, so a 16-digit PAN can never be half-consumed by a 12-digit rule.
//  2. The 10-digit phone rule only sees runs of exactly 10 digits.
//  3. The 6-digit OTP rule is last so it only sees runs of exactly 6.
// Before this existed, a 15-digit (Amex) or 19-digit (UnionPay) PAN matched neither the
// 16-digit nor the 12-digit rule and was stored verbatim in KV via report.ts redactedInput.
// Grouped (space/dash) forms need a REQUIRED separator so that "9876543210 492813" — a
// phone plus an OTP — is not glued into one 16-digit run and mistaken for a card.
type Replacer = string | ((match: string) => string);

const CARD_MASK = "**** **** **** ****";
const AADHAAR_MASK = "**** **** ****";

const PATTERNS: Array<[RegExp, Replacer]> = [
  // 12/15/16/19 digits, contiguous... or in 4-digit groups separated by space/dash.
  // 13/14 are deliberately NOT matched: a 14-digit run is far more often an epoch-ms
  // timestamp than a card, and redacted input is persisted to KV, so a false mask
  // destroys real data. 12 digits is Aadhaar (3-group mask); 15/16/19 are cards.
  [
    /\b(?:\d{19}|\d{16}|\d{15}|\d{12}|\d{4}(?:[ -]\d{4}){2,4})\b/g,
    (m: string) => (m.replace(/\D/g, "").length === 12 ? AADHAAR_MASK : CARD_MASK),
  ],
  // 10-digit Indian mobile (+91 optional) — must be an exact 10-digit run.
  [/(?:\+91[ -]?)?\b[6-9]\d{9}\b/g, "**********"],
  // UPI handle — mask local part
  [/\b[\w.-]{2,}@(?:ybl|paytm|oksbi|okhdfcbank|okaxis|axl|ibl|icl|upi)\b/gi, "***@***"],
  // 6-digit OTP / PIN — broad \b\d{6}\b also masks 6-digit prices (e.g. 123456 -> ******);
  // keeping broad intentional — OTP coverage wins, tests expect this (see final-review
  // Important #4). Tighten to OTP-context regex if price masking proves noisy.
  // ponytail: broad intentional, do not narrow without checking redact edge tests
  [/\b\d{6}\b/g, "******"],
];

export function redact(input: string): string {
  let out = input;
  for (const [pattern, mask] of PATTERNS) out = out.replace(pattern, mask as any);
  return out;
}
