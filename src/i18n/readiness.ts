import type { Lang } from "./ui";

// Which locales are indexable (human-reviewed). Others stay noindex until flipped.
// Single source of truth for sitemap filter, hreflang cluster, Layout noindex.
// Audit 2026-09-04: all 8 locales 16/16 translated, 0% EN fallback — all indexable (128/128).
export const ready: Record<Lang, boolean> = {
  en: true,
  es: true, // Phase 1 human-reviewed reference, 16/16 2026-09-04
  fr: true, // 16/16, global library slugs verified 2026-09
  de: true, // Task2 complete — 16/16 human-reviewed 2026-09-02
  "pt-br": true, // 16/16 translated 2026-09-04
  it: true, // 16/16 translated 2026-09-04
  ja: true, // 16/16 translated 2026-09-04
  ko: true, // 16/16 translated 2026-09-04
};

export function isReady(lang: Lang): boolean {
  return ready[lang] ?? false;
}

export function readyLocales(): Lang[] {
  return (Object.keys(ready) as Lang[]).filter((l) => ready[l]);
}
