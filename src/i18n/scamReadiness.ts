import type { Lang } from "./ui";

// Which scam detail slugs are human-translated and ready to index per language
// 2026-09: library globalized to 15 entries, all 8 locales translated.
// NOTE: keep the slug lists as inline literals inside new Set([...]) —
// scripts/audit-i18n.mjs parses this file with a regex and cannot follow
// shared consts.
export const scamReady: Record<Lang, Set<string>> = {
  en: new Set([
    "parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment",
  ]),
  es: new Set([
    "parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment",
  ]),
  fr: new Set([
    "parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment",
  ]),
  de: new Set(["parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment"]),
  "pt-br": new Set(["parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment"]),
  it: new Set(["parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment"]),
  ja: new Set(["parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment"]),
  ko: new Set(["parcel-delivery-fee","bank-otp-impersonation","toll-road-sms","qr-payment-scam","family-emergency-message","job-task-scam","fake-authority-video-call","advance-fee-loan","electricity-bill-disconnection","trading-app-guaranteed-returns","tax-government-refund","romance-relationship-scam","tech-support-refund","lottery-prize-scam","malicious-apk-attachment"]),
};

export function isScamReady(lang: Lang, slug: string): boolean {
  const raw = slug.replace(/^[a-z-]+\//,"");
  return scamReady[lang]?.has(raw) ?? false;
}
