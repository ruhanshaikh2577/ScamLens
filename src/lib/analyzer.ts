import { redact } from "./redact";

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
}

const DISCLAIMER =
  "Decision support, not a guarantee. Language patterns alone never prove a scam — verify via official channels.";

interface Detector {
  id: string;
  label: string;
  weight: number;
  patterns: RegExp[];
  step: string;
  similar?: SimilarScam;
}

export const SIMILAR: Record<string, SimilarScam> = {
  kyc: { slug: "/scams/fake-kyc-suspended", title: "Fake KYC / account suspension" },
  delivery: { slug: "/scams/delivery-rs99-reschedule", title: "Courier fee scam (Rs 99 reschedule)" },
  upiRefund: { slug: "/scams/upi-refund-qr", title: "UPI refund / QR request scam" },
  jobFee: { slug: "/scams/job-offer-fee-499", title: "Fake job offer with registration fee" },
  digitalArrest: { slug: "/scams/digital-arrest-video-call", title: "Digital arrest video-call scam" },
  fastag: { slug: "/scams/fastag-kyc-scam", title: "FASTag / traffic challan phishing" },
  usps: { slug: "/scams/usps-postage-due-199", title: "USPS postage due ($1.99)" },
  royalMail: { slug: "/scams/royal-mail-redelivery-099", title: "Royal Mail redelivery (£0.99)" },
  hmrc: { slug: "/scams/hmrc-tax-refund", title: "HMRC tax refund" },
  ssa: { slug: "/scams/ssa-suspension", title: "SSA account suspension" },
  invest: { slug: "/scams/trading-app-guaranteed-returns", title: "Trading app 'guaranteed returns'" },
  utility: { slug: "/scams/electricity-bill-disconnection", title: "Electricity disconnection threat" },
  familyEmg: { slug: "/scams/whatsapp-family-emergency", title: "'Hi Mum' WhatsApp emergency" },
  taskPay: { slug: "/scams/telegram-task-likes", title: "Telegram task & like-share scam" },
  loanApp: { slug: "/scams/instant-loan-app", title: "Instant loan app trap" },
};

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "rb.gy", "is.gd",
  "shorturl.at", "rebrand.ly", "tiny.cc", "ow.ly", "buff.ly", "lnkd.in", "s.id",
];

const DETECTORS: Detector[] = [
  {
    id: "payment-request",
    label: "Payment request",
    weight: 3,
    patterns: [
      /\b(?:pay|send|transfer)\s*(?:rs\.?|₹|inr|\$|£|\d)/i,
      /(?:rs\.?|₹|inr|\$|£)\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/i,
      /\$\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/,
      /£\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/,
      /\b(?:registration|processing|reschedule|delivery|verification|customs|release)\s+fee\b/i,
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
    step: "Real employers never charge you to apply or start. Any 'task pay' that arrives as a UPI deposit is bait for a bigger loss.",
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
    step: "Guaranteed returns don't exist in real markets, and no SEBI-registered adviser recruits via chat groups. Verify any adviser on sebi.gov.in before sending a rupee.",
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
    step: "Boards never demand instant UPI payments over calls or texts. Open your state board's official app and check the bill yourself.",
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
    step: "Real lenders deduct fees at disbursal — they never ask for pre-payment over UPI. Check RBI's registered NBFC list before touching such an app.",
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
  while (start > 0 && !/\s/.test(text[start - 1]) && text[start - 1] !== undefined) start--;
  const slice = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

function collectFindings(text: string, skipIds: string[] = []): Finding[] {
  const findings: Finding[] = [];
  const clean = redact(text);
  for (const d of DETECTORS) {
    if (skipIds.includes(d.id)) continue;
    for (const p of d.patterns) {
      const m = clean.match(p);
      if (m && m.index !== undefined) {
        findings.push({
          id: d.id,
          label: d.label,
          evidence: evidenceAround(clean, m.index, m[0].length),
        });
        break;
      }
    }
  }
  return findings;
}

const HIGH_ABUSE_TLDS = ["zip", "top", "xyz", "icu", "click", "rest", "lol", "monster", "cam", "quest"];

function urlFindings(raw: string): Finding[] {
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
      label: "Shortened link hides the real destination",
      evidence: host,
    });
  }
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    findings.push({
      id: "url-punycode",
      label: "Look-alike characters in domain (possible spoof)",
      evidence: host,
    });
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    findings.push({ id: "url-ip", label: "Raw IP address instead of a domain", evidence: host });
  }
  if (explicitlyInsecure) {
    findings.push({
      id: "url-insecure-http",
      label: "Insecure http:// link — no encryption for whatever you type next",
      evidence: host,
    });
  }
  if (url.username) {
    findings.push({
      id: "url-userinfo",
      label: "\u201C@\u201D trick — the real destination hides before the @",
      evidence: host,
    });
  }
  if (/\.apk$/i.test(url.pathname)) {
    findings.push({
      id: "url-apk",
      label: "Direct APK download — a common way to install SMS-stealing malware",
      evidence: url.pathname.split("/").pop() || url.pathname,
    });
  }
  const tld = host.includes(".") ? host.slice(host.lastIndexOf(".") + 1) : "";
  if (HIGH_ABUSE_TLDS.includes(tld)) {
    findings.push({
      id: "url-tld",
      label: `High-abuse domain ending (.${tld}) — heavily used by phishing kits`,
      evidence: host,
    });
  }
  if (/[?&](?:password|passwd|otp|pin|cvv|card|token)=/i.test(url.search)) {
    findings.push({
      id: "url-credentials",
      label: "Sensitive fields in the link itself — never enter details on a pre-filled page",
      evidence: url.search.slice(0, 60),
    });
  }
  for (const { brand, official } of BRANDS) {
    if (full.includes(brand) && !official.some((d) => host === d || host.endsWith(`.${d}`))) {
      findings.push({
        id: "url-brand-mismatch",
        label: `Domain pretends to be ${brand} but isn't the official site`,
        evidence: full.replace(/\/$/, ""),
      });
      break;
    }
  }
  return findings;
}

function riskFor(score: number): RiskLevel {
  if (score >= 8) return "critical";
  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

const HEADLINES: Record<RiskLevel, string> = {
  low: "No common scam markers found",
  medium: "Some warning signs present",
  high: "Strong scam warning signs",
  critical: "Classic scam pattern detected",
};

export function analyze(input: string, kind: "message" | "url"): AnalysisResult {
  const isUrl = kind === "url";
  const findings = isUrl
    ? // URL scans skip the text-shortener detector — urlFindings covers it without duplicating.
      [...collectFindings(input, ["text-shortener"]), ...urlFindings(input)]
    : collectFindings(input);

  const weights: Record<string, number> = {};
  for (const d of DETECTORS) weights[d.id] = d.weight;
  weights["url-shortener"] = 2;
  weights["url-punycode"] = 3;
  weights["url-ip"] = 2;
  weights["url-brand-mismatch"] = 3;
  weights["url-insecure-http"] = 1;
  weights["url-userinfo"] = 3;
  weights["url-apk"] = 4;
  weights["url-tld"] = 1;
  weights["url-credentials"] = 2;

  const score = findings.reduce((sum, f) => sum + (weights[f.id] ?? 1), 0);
  const risk = riskFor(score);

  const stepsByWeight = new Map<string, string>();
  for (const f of findings) {
    const d = DETECTORS.find((x) => x.id === f.id);
    if (d && !stepsByWeight.has(f.id)) stepsByWeight.set(f.id, d.step);
  }
  const ordered = [...stepsByWeight.entries()].sort(
    (a, b) => (weights[b[0]] ?? 0) - (weights[a[0]] ?? 0)
  );

  const nextSteps =
    risk === "low"
      ? [
          "Stay cautious anyway: don't click links in unexpected messages.",
          "If it claims to be from a company, open their official app or website yourself instead of trusting this message.",
        ]
      : [
          ...ordered.slice(0, 3).map(([, step]) => step),
          "Verify by contacting the organisation using the number on their official website or app — never the one in this message.",
        ];

  const similarSlugs = new Map<string, SimilarScam>();
  for (const f of findings) {
    const d = DETECTORS.find((x) => x.id === f.id);
    if (d?.similar) similarSlugs.set(d.similar.slug, d.similar);
  }

  return {
    risk,
    headline: HEADLINES[risk],
    findings,
    nextSteps: nextSteps.slice(0, 4),
    similarScams: [...similarSlugs.values()].slice(0, 3),
    disclaimer: DISCLAIMER,
  };
}
