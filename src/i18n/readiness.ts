import type { Lang } from "./ui";

// Which locales are indexable (human-reviewed). Others stay noindex until flipped.
// Single source of truth for sitemap filter, hreflang cluster, Layout noindex.
// Audit 2026-09-02: de now 16/16 human-reviewed (Task2), pt-br/it/ja/ko remain 81% EN fallback and scamReady=0.
// Flip de to true now; others false until human review.
export const ready: Record<Lang, boolean> = {
  en: true,
  es: true, // Phase 1 human-reviewed reference
  // TODO(i18n): fr pilot keeps ready=true with scamReady 3/16; 11/16 bodies still EN fallback (69%) — finish 13 fr mds before marketing push; see final-review Important #3. Kept true as pilot per ruling.
  fr: true,
  de: true, // Task2 complete — 16/16 human-reviewed 2026-09-02
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
