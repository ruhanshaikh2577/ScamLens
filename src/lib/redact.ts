const PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:\d[ -]*){16}\b/g, "**** **** **** ****"],
  [/\b[6-9]\d{9}\b/g, "**********"],
  [/\b\d{6}\b/g, "******"],
];

export function redact(input: string): string {
  let out = input;
  for (const [pattern, mask] of PATTERNS) out = out.replace(pattern, mask);
  return out;
}
