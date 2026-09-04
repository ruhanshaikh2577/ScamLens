import type { Lang } from "./ui";

// Which scam detail slugs are human-translated and ready to index per language
// All 8 locales now 16/16 (2026-09-04: es 3→16, fr intro fixed, pt-br/it/ja/ko translated)
export const scamReady: Record<Lang, Set<string>> = {
  en: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection",
  ]),
  es: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection",
  ]),
  fr: new Set([
    "fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection",
  ]),
  de: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
  "pt-br": new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
  it: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
  ja: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
  ko: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
};

export function isScamReady(lang: Lang, slug: string): boolean {
  const raw = slug.replace(/^[a-z-]+\//,"");
  return scamReady[lang]?.has(raw) ?? false;
}
