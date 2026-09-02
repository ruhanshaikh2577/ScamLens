import type { Lang } from "./ui";

// Which locales are indexable (human-reviewed). Others stay noindex until flipped.
// Single source of truth for sitemap filter, hreflang cluster, Layout noindex.
// Audit 2026-09-02: de/pt-br/it/ja/ko have top-page translations present (271 keys) but
// scam bodies are 81% English fallback and scamReady=0 — not human-reviewed.
// Flip to false until human review confirms top pages + scam bodies. es/fr remain true as pilot.
export const ready: Record<Lang, boolean> = {
  en: true,
  es: true, // Phase 1 human-reviewed reference
  fr: true, // Phase 2 — human-quality translations above (scamReady 3/16 pilot)
  de: false, // needs human review — see audit-i18n.mjs
  "pt-br": false, // needs human review
  it: false, // needs human review
  ja: false, // needs human review
  ko: false, // needs human review
};

export function isReady(lang: Lang): boolean {
  return ready[lang] ?? false;
}

export function readyLocales(): Lang[] {
  return (Object.keys(ready) as Lang[]).filter((l) => ready[l]);
}
