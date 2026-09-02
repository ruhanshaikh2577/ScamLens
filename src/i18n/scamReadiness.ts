import type { Lang } from "./ui";

// Which scam detail slugs are human-translated and ready to index per language
// English has all 16, Spanish pilot has 3, others 0 until human review
export const scamReady: Record<Lang, Set<string>> = {
  en: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection",
  ]),
  es: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","upi-refund-qr",
  ]),
  fr: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","upi-refund-qr",
  ]),
  de: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
  "pt-br": new Set([]),
  it: new Set([]),
  ja: new Set([]),
  ko: new Set([]),
};

export function isScamReady(lang: Lang, slug: string): boolean {
  const raw = slug.replace(/^[a-z-]+\//,"");
  return scamReady[lang]?.has(raw) ?? false;
}
