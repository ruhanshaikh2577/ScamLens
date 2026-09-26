import { redact } from "./redact";
import { VERSION } from "./version";
import { analyzerStrings, fill, type AnalyzerStrings } from "./analyzer-i18n";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Finding {
  id: string;
  label: string;
  evidence: string;
}

export interface SimilarScam {
  slug: string;
  title: string;
}

export interface AnalysisResult {
  risk: RiskLevel;
  headline: string;
  findings: Finding[];
  nextSteps: string[];
  similarScams: SimilarScam[];
  disclaimer: string;
  meta: AnalysisMeta;
}

export interface AnalysisMeta {
  analyzerVersion: string;
  timestamp: string;
  detectorIds: string[];
  sources: Array<{ label: string; href: string }>;
}

interface Detector {
  id: string;
  label: string;
  weight: number;
  patterns: RegExp[];
  step: string;
  similar?: SimilarScam;
}

export const SIMILAR: Record<string, SimilarScam> = {
  kyc: { slug: "/scams/bank-otp-impersonation", title: "Bank / OTP impersonation" },
  delivery: { slug: "/scams/parcel-delivery-fee", title: "Parcel delivery fee phishing" },
  upiRefund: { slug: "/scams/qr-payment-scam", title: "QR / payment request scam" },
  jobFee: { slug: "/scams/job-task-scam", title: "Job & task-earning scam" },
  digitalArrest: { slug: "/scams/fake-authority-video-call", title: "Fake authority call" },
  toll: { slug: "/scams/toll-road-sms", title: "Toll-road SMS phishing" },
  invest: { slug: "/scams/trading-app-guaranteed-returns", title: "Investment & crypto scam" },
  utility: { slug: "/scams/electricity-bill-disconnection", title: "Utility disconnection scam" },
  familyEmg: { slug: "/scams/family-emergency-message", title: "Family emergency message" },
  loanApp: { slug: "/scams/advance-fee-loan", title: "Advance-fee loan trap" },
  taskPay: { slug: "/scams/job-task-scam", title: "Job & task-earning scam" },
  romance: { slug: "/scams/romance-relationship-scam", title: "Romance & relationship scam" },
  techSupport: { slug: "/scams/tech-support-refund", title: "Tech-support refund scam" },
  lottery: { slug: "/scams/lottery-prize-scam", title: "Lottery & prize scam" },
  apk: { slug: "/scams/malicious-apk-attachment", title: "Malicious app attachment" },
  taxGovt: { slug: "/scams/tax-government-refund", title: "Tax & government refund scam" },
};

export const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "rb.gy", "is.gd",
  "shorturl.at", "rebrand.ly", "tiny.cc", "ow.ly", "buff.ly", "lnkd.in", "s.id",
  "t.ly", "bitly.com", "tiny.one", "short.gy", "lc.chat",
];

const DETECTORS: Detector[] = [
  {
    id: "payment-request",
    label: "Payment request",
    weight: 3,
    patterns: [
      /\b(?:pay|send|transfer)\s*(?:rs\.?|₹|inr|\$|£|€|\d)/i,
      /(?:rs\.?|₹|inr|\$|£|€)\s*\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?/i,
      /[$£€]\s*\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?/,
      /\b(?:registration|processing|reschedule|delivery|verification|customs|release|redelivery|customs clearance)\s+fee\b/i,
      /\b(?:advance\s*fee|security\s+deposit)\b/i,
    ],
    step: "Never pay a fee to receive money, a prize, a refund, a parcel or a job offer. Legitimate organisations don't work this way.",
    similar: SIMILAR.delivery,
  },
  {
    id: "otp-pin",
    label: "Asks for OTP, PIN or password",
    weight: 4,
    patterns: [
      /\b(?:otp|o\.t\.p|pin|cvv|password|passcode)\b/i,
      /\b(?:share|send|enter|confirm)[^.?!]*(?:code|otp|pin)\b/i,
    ],
    step: "No bank, wallet or government agency ever asks for your OTP, PIN or password — not by call, SMS or email.",
  },
  {
    // Non-Indian agencies ask for national ID numbers, not OTPs. "Send your national
    // insurance number", "verify your SSN", "enter your Aadhaar" all fit here. Without
    // this, a UK/US/EU credential-harvest message only matched on brand names.
    id: "credential-request",
    label: "Asks for a personal ID or account credential",
    weight: 4,
    patterns: [
      // An imperative to TRANSMIT an identifier: "send your national insurance number".
      // Deliberately excludes otp/pin/cvv — otp-pin already owns those, and listing them
      // here would double-count their weight in the score.
      /\b(?:send|share|forward|email|text|message|whatsapp|post|upload)\b[^.?!]{0,30}\b(?:national insurance|national id|social security|ssn|tax id|tin|nino|aadhaar|pan card|passport|driving licen[cs]e|bank account|sort code|iban|routing number|account number)\b/i,
      // "verify your <id> at <link>". The negative lookahead is load-bearing: it rejects
      // legitimate self-service wording ("update your Aadhaar in the official app",
      // "confirm my account number with my own bank"), which is the main false-positive
      // risk for a pattern this broad.
      /\b(?:verify|confirm|validate|update|re-?enter)\b[^.?!]{0,30}\b(?:ssn|social security|nino|national insurance|aadhaar|pan card|passport|account number|sort code|iban)\b(?![^.?!]{0,40}\b(?:official|my own|our own|your own|on file)\b)/i,
    ],
    step: "No agency, bank or employer asks you to send an ID or account number over SMS, chat or email. Open the official app or site yourself and check there.",
    similar: SIMILAR.kyc,
  },
  {
    id: "urgency",
    label: "Artificial urgency",
    weight: 2,
    patterns: [
      /\b(?:today|tonight|immediately|right now|within \d+\s*(?:hours|minutes)|last (?:chance|day|warning)|(?:only )?\d+\s*(?:hours|minutes) left)\b/i,
      /\b(?:expires?|expiring|clos(?:e|ing)|suspend(?:ed|sion)?|deactivat\w*|block\w*)[^.?!]*(?:today|tomorrow|in \d+|soon|now|24)\b/i,
      /अभी|तुरंत|आज ही/,
    ],
    step: "Slow down. Urgency is the scammer's main tool — real institutions give you time and never punish you for verifying.",
  },
  {
    id: "fear-threat",
    label: "Fear or legal threat",
    weight: 2,
    patterns: [
      /\b(?:legal action|police|arrest|warrant|fir|court|penalty|fine of|tax notice|notice\b[^.?!]*income tax)\b/i,
      /\b(?:account|wallet|card|number)[^.?!]*(?:blocked|frozen|disabled|suspended|will be closed)\b/i,
      /\bdigital arrest\b/i,
    ],
    step: "Police and tax authorities never threaten arrest over WhatsApp or a video call, and never demand payment to 'clear your name'.",
    similar: SIMILAR.digitalArrest,
  },
  {
    id: "impersonation",
    label: "Impersonates a bank, courier or agency",
    weight: 2,
    patterns: [
      /\b(?:hdfc|icici|sbi|state bank|axis|kotak|punjab national|pnb|bank of baroda|r\.b\.i|rbi)\b/i,
      /\b(?:dtdc|delhivery|blue dart|bluedart|india post|speed post|fedex|dhl|ekart|xpressbees)\b/i,
      /\b(?:kyc|e-kyc|re-?know your customer|aadhaar|pan card|fastag|challan|trai|customs department)\b/i,
      /\b(?:usps|united states postal|royal mail|hmrc|inland revenue|gov\.uk|ssa|social security administration|social security)\b/i,
    ],
    step: "Contact the organisation using the number on its official website or app — never the contact details in this message.",
    similar: SIMILAR.kyc,
  },
  {
    id: "reward-bait",
    label: "Prize or reward bait",
    weight: 2,
    patterns: [
      /\b(?:congratulations|you(?:'ve| have)? (?:won|been selected)|prize|lottery|lucky draw|kbc|cashback|gift (?:voucher|card))\b/i,
      /\brefund of (?:rs|₹|inr)?\s*\d+/i,
    ],
    step: "You can't win a lottery you never entered, and refunds are processed inside the official app — never via a link or a 'claim' fee.",
    similar: SIMILAR.upiRefund,
  },
  {
    id: "job-fee",
    label: "Too-good job with upfront fee",
    weight: 3,
    patterns: [
      /\b(?:work[- ]from[- ]home|part[- ]time job|earn (?:rs|₹|\d|daily)|daily payout|registration fee)\b/i,
      /\b(?:prepaid task|telegram (?:task|job)|like videos and earn)\b/i,
    ],
    step: "Real employers never charge you to apply or start. Any 'task pay' that arrives as an instant mobile deposit is bait for a bigger loss.",
    similar: SIMILAR.jobFee,
  },
  {
    id: "qr-upi",
    label: "QR code or UPI handle to 'receive' money",
    weight: 2,
    patterns: [
      /\bupi\s*(?:id|address|handle)?:?\s*[\w.-]+@[\w]+/i,
      /\b(scan(?:ning)? the qr|scan and pay|qr code (?:to |and ))\b/i,
      /[\w.-]+@(?:ybl|paytm|oksbi|okhdfc|okaxis|axl|ibl|icl|upi)\b/i,
    ],
    step: "You never scan a QR code or enter a PIN to RECEIVE money — only to pay. That's the whole trick.",
    similar: SIMILAR.upiRefund,
  },
  {
    id: "investment-bait",
    label: "Guaranteed-return investment bait",
    weight: 3,
    patterns: [
      /\b(?:guaranteed|assured) (?:returns?|profit)/i,
      /\b(?:double|triple) your money\b/i,
      /\b(?:sure ?shot|100% profit|risk[- ]free (?:profit|investment))\b/i,
      /\b(?:trading|forex|crypto) (?:signals?|group|tips|mentor|professor)\b/i,
      /\b(?:daily payout of \d+%|vip trading)\b/i,
    ],
    step: "Guaranteed returns don't exist in real markets, and no registered adviser recruits via chat groups. Verify any adviser with your country's securities regulator before sending money.",
    similar: SIMILAR.invest,
  },
  {
    id: "family-emergency",
    label: "'Family member from a new number' pattern",
    weight: 2,
    patterns: [
      /\b(?:hi|hello|dear)\s+(?:mum|mom|mummy|dad|papa)\b/i,
      /\b(?:mum|mom|mummy|dad|papa)[^.\n]{0,60}\b(?:lost my phone|new number|changed my number)\b/i,
      /\b(?:stuck|stranded|hospital|emergency)[^.\n]{0,80}\b(?:send|transfer|pay)\b/i,
    ],
    step: "Call the person on their old number before replying. No genuine emergency survives a callback to a known number.",
    similar: SIMILAR.familyEmg,
  },
  {
    id: "utility-disconnection",
    label: "Utility disconnection threat tonight",
    weight: 2,
    patterns: [
      /\belectricity[^.?!]{0,40}\bdisconnected?\b/i,
      /\bdisconnection notice\b/i,
      /\b(?:power|electricity) will be (?:cut|disconnected)\b/i,
      /\b(?:bses|adani electricity|mseb|msedcl|tneb|torrent power|bescom|pspcl)\b/i,
    ],
    step: "Utilities never demand instant payment over calls or texts. Open your provider's official app and check the bill yourself.",
    similar: SIMILAR.utility,
  },
  {
    id: "loan-app",
    label: "Instant loan with upfront fee",
    weight: 2,
    patterns: [
      /\binstant (?:loan|cash|approval)\b/i,
      /\bloan (?:approved?|offer|pre-?approved?)[^.\n]{0,30}(?:5 minutes|zero documents|no documents)\b/i,
      /\b(?:processing|insurance) fee[^.\n]{0,40}(?:release|disburse)/i,
    ],
    step: "Real lenders deduct fees at disbursal — they never ask for pre-payment to release funds. Check your country's registered-lender list before touching such an app.",
    similar: SIMILAR.loanApp,
  },
  {
    // Message-kind only (skipped during URL scans so it can't duplicate url-shortener).
    id: "text-shortener",
    label: "Shortened link inside the message",
    weight: 2,
    patterns: [
      new RegExp(
        `\\b(?:${SHORTENERS.map((s) => s.replace(/\./g, "\\.")).join("|")})/`,
        "i"
      ),
    ],
    step: "Don't tap the short link — type the organisation's official address yourself instead. Shorteners exist to hide look-alike domains.",
    similar: SIMILAR.delivery,
  },
];

const BRANDS: Array<{ brand: string; official: string[] }> = [
  { brand: "hdfcbank", official: ["hdfcbank.com"] },
  { brand: "icicibank", official: ["icicibank.com"] },
  { brand: "sbi", official: ["onlinesbi.sbi", "sbi.co.in"] },
  { brand: "axisbank", official: ["axisbank.com"] },
  { brand: "kotak", official: ["kotak.com"] },
  { brand: "paytm", official: ["paytm.com"] },
  { brand: "phonepe", official: ["phonepe.com"] },
  { brand: "amazon", official: ["amazon.in", "amazon.com"] },
  { brand: "flipkart", official: ["flipkart.com"] },
  { brand: "dtdc", official: ["dtdc.in"] },
  { brand: "delhivery", official: ["delhivery.com"] },
  { brand: "indiapost", official: ["indiapost.gov.in"] },
  { brand: "usps", official: ["usps.com"] },
  { brand: "royalmail", official: ["royalmail.com"] },
  { brand: "hmrc", official: ["gov.uk"] },
  { brand: "ssa", official: ["ssa.gov"] },
];

// Characters that can sit INSIDE an identifier: digits plus the space/dash grouping
// separators. Snapping a slice boundary to whitespace is NOT safe here, because a
// space can be internal to a credential ("1234 5678 9012") — a slice starting at
// "5678 9012" matches no mask rule and would leak 8 digits of an Aadhaar. Boundaries
// are therefore pushed outward to the nearest character outside this class.
const IDENT_CHARS = /[\w\s.\-+@]/;

function evidenceAround(text: string, index: number, length: number): string {
  const max = 90;
  let start = Math.max(0, index - 30);
  let end = Math.min(text.length, index + length + 40);
  while (end < text.length && !/[\s,.!?]/.test(text[end]) && end - index - length < 60) end++;
  if (end - start > max) {
    const overflow = end - start - max;
    start += Math.floor(overflow / 2);
    end -= overflow - Math.floor(overflow / 2);
  }
  // Widen BOTH boundaries until they land outside an identifier run, so redaction
  // always sees the credential whole. Bounded to 30 chars so the snippet stays readable.
  let guardStart = 0;
  while (start > 0 && guardStart++ < 30 && IDENT_CHARS.test(text[start - 1] ?? "") && IDENT_CHARS.test(text[start] ?? "")) start--;
  let guardEnd = 0;
  while (end < text.length && guardEnd++ < 30 && IDENT_CHARS.test(text[end] ?? "") && IDENT_CHARS.test(text[end - 1] ?? "")) end++;
  const slice = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

function collectFindings(text: string, skipIds: string[] = [], S: AnalyzerStrings): Finding[] {
  const findings: Finding[] = [];
  // Match against the RAW text and redact only the emitted evidence snippet.
  // Redacting first masks UPI handles to "***@***" — the exact string the qr-upi
  // detector matches on — so a textbook "UPI id scammer@paytm" QR refund scam used
  // to score low with zero findings. Detection needs the signal; only the
  // human-facing snippet needs masking.
  for (const d of DETECTORS) {
    if (skipIds.includes(d.id)) continue;
    for (const p of d.patterns) {
      const m = text.match(p);
      if (m && m.index !== undefined) {
        findings.push({
          id: d.id,
          label: S.labels[d.id] ?? d.label,
          evidence: redact(evidenceAround(text, m.index, m[0].length)),
        });
        break;
      }
    }
  }
  return findings;
}

const HIGH_ABUSE_TLDS = ["zip", "top", "xyz", "icu", "click", "rest", "lol", "monster", "cam", "quest"];

function urlFindings(raw: string, S: AnalyzerStrings): Finding[] {
  const findings: Finding[] = [];
  const trimmed = raw.trim();
  // Only flag insecure http when the user actually typed http:// (we prefix http:// for parsing).
  const explicitlyInsecure = /^http:\/\//i.test(trimmed);
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`);
  } catch {
    return findings;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const full = `${host}${url.pathname.toLowerCase()}`;

  if (SHORTENERS.includes(host)) {
    findings.push({
      id: "url-shortener",
      label: S.labels["url-shortener"] ?? "Shortened link hides the real destination",
      evidence: host,
    });
  }
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    findings.push({
      id: "url-punycode",
      label: S.labels["url-punycode"] ?? "Look-alike characters in domain (possible spoof)",
      evidence: host,
    });
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    findings.push({ id: "url-ip", label: S.labels["url-ip"] ?? "Raw IP address instead of a domain", evidence: host });
  }
  if (explicitlyInsecure) {
    findings.push({
      id: "url-insecure-http",
      label: S.labels["url-insecure-http"] ?? "Insecure http:// link — no encryption for whatever you type next",
      evidence: host,
    });
  }
  if (url.username) {
    findings.push({
      id: "url-userinfo",
      label: S.labels["url-userinfo"] ?? "\u201C@\u201D trick — the real destination hides before the @",
      evidence: host,
    });
  }
  if (/\.apk$/i.test(url.pathname)) {
    findings.push({
      id: "url-apk",
      label: S.labels["url-apk"] ?? "Direct APK download — a common way to install SMS-stealing malware",
      evidence: url.pathname.split("/").pop() || url.pathname,
    });
  }
  const tld = host.includes(".") ? host.slice(host.lastIndexOf(".") + 1) : "";
  if (HIGH_ABUSE_TLDS.includes(tld)) {
    findings.push({
      id: "url-tld",
      label: fill(S.labels["url-tld"] ?? "High-abuse domain ending (.{tld}) — heavily used by phishing kits", { tld }),
      evidence: host,
    });
  }
  if (/[?&](?:password|passwd|otp|pin|cvv|card|token)=/i.test(url.search)) {
    findings.push({
      id: "url-credentials",
      label: S.labels["url-credentials"] ?? "Sensitive fields in the link itself — never enter details on a pre-filled page",
      evidence: url.search.slice(0, 60),
    });
  }
  // Brand-mismatch: host + path both checked (bit.ly/hdfcbank-... should flag), hyphens stripped so hdfc-bank still hits.
  // Legit article example.com/hdfcbank-review would also flag — acceptable false positive tradeoff for phishing; user can verify.
  for (const { brand, official } of BRANDS) {
    const brandInUrl = full.includes(brand) || full.replace(/-/g, "").includes(brand);
    const isOfficial = official.some((d) => host === d || host.endsWith(`.${d}`));
    if (brandInUrl && !isOfficial) {
      findings.push({
        id: "url-brand-mismatch",
        label: fill(S.labels["url-brand-mismatch"] ?? "Domain pretends to be {brand} but isn't the official site", { brand }),
        evidence: full.replace(/\/$/, "") || host,
      });
      break;
    }
  }
  // Match against the raw URL (so masking can never corrupt host parsing) but redact the
  // human-facing evidence snippet. collectFindings() redacts its input at :268; without
  // this, a URL carrying ?password=/otp=/token= emits live credentials into evidence
  // that reaches the share card and the webhook replies.
  return findings.map((f) => ({ ...f, evidence: redact(f.evidence) }));
}

function riskFor(score: number): RiskLevel {
  if (score >= 8) return "critical";
  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function analyze(input: string, kind: "message" | "url", lang = "en"): AnalysisResult {
  const S = analyzerStrings(lang);
  const isUrl = kind === "url";
  const findings = isUrl
    ? // URL scans skip the text-shortener detector — urlFindings covers it without duplicating.
      [...collectFindings(input, ["text-shortener"], S), ...urlFindings(input, S)]
    : collectFindings(input, [], S);

  const weights: Record<string, number> = {};
  for (const d of DETECTORS) weights[d.id] = d.weight;
  weights["url-shortener"] = 2;
  weights["url-punycode"] = 3;
  weights["url-ip"] = 2;
  weights["url-brand-mismatch"] = 3;
  weights["url-insecure-http"] = 1;
  weights["url-userinfo"] = 3;
  weights["url-apk"] = 5;
  weights["url-tld"] = 1;
  weights["url-credentials"] = 2;

  const score = findings.reduce((sum, f) => sum + (weights[f.id] ?? 1), 0);
  // APK alone should be at least high (malware vector)
  const hasApk = findings.some((f) => f.id === "url-apk");
  let risk = riskFor(score);
  if (hasApk && risk === "medium") risk = "high";

  const stepsByWeight = new Map<string, string>();
  for (const f of findings) {
    const d = DETECTORS.find((x) => x.id === f.id);
    if (d && !stepsByWeight.has(f.id)) stepsByWeight.set(f.id, S.steps[f.id] ?? d.step);
  }
  const ordered = [...stepsByWeight.entries()].sort(
    (a, b) => (weights[b[0]] ?? 0) - (weights[a[0]] ?? 0)
  );

  const nextSteps =
    risk === "low"
      ? [...S.lowSteps]
      : [
          ...ordered.slice(0, 3).map(([, step]) => step),
          S.verifyLine,
        ];

  const similarSlugs = new Map<string, SimilarScam>();
  for (const f of findings) {
    const d = DETECTORS.find((x) => x.id === f.id);
    if (d?.similar) similarSlugs.set(d.similar.slug, d.similar);
  }

  const detectorIds = [...new Set(findings.map((f) => f.id))];
  const sourceFor = (id: string) =>
    id.startsWith("url-")
      ? { label: "ScamLens URL checks", href: "/how-it-works#url-signals" }
      : { label: "ScamLens detectors", href: "/how-it-works#detectors" };
  let sources = [...new Map(detectorIds.map((id) => {
    const s = sourceFor(id);
    return [`${s.label}|${s.href}`, s] as const;
  })).values()];
  if (sources.length === 0) sources = [{ label: "ScamLens detectors", href: "/how-it-works#detectors" }];
  if (risk === "critical") {
    const cyber = { label: "Report at cybercrime.gov.in", href: "https://cybercrime.gov.in" };
    if (!sources.some((s) => s.href === cyber.href)) sources.push(cyber);
  }
  sources = sources.slice(0, 3);

  return {
    risk,
    headline: S.headlines[risk],
    findings,
    nextSteps: nextSteps.slice(0, 4),
    similarScams: [...similarSlugs.values()].slice(0, 3),
    disclaimer: S.disclaimer,
    meta: { analyzerVersion: VERSION, timestamp: new Date().toISOString(), detectorIds, sources },
  };
}
