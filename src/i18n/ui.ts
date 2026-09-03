// Central i18n registry — languages, default, and route slug maps.
// Ponytail: one file defines all locale metadata; adding a language = add one entry here + translations/<lang>.ts
export const languages = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  "pt-br": "Português (BR)",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";
export const showDefaultLang = false;

// hreflang codes — URL path stays lower-case pt-br, but hreflang is pt-BR
export const hreflangMap: Record<Lang, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  "pt-br": "pt-BR",
  it: "it",
  ja: "ja",
  ko: "ko",
};

// Localized slugs: en key → localized slug per locale.
// ja/ko use ASCII same as en per product decision.
// Keep flat single-segment for top pages; scams/ keeps same id (not translated yet).
export const routes: Record<Exclude<Lang, "en">, Record<string, string>> = {
  es: {
    "how-it-works": "como-funciona",
    "what-we-detect": "que-detectamos",
    "safety-tips": "consejos-de-seguridad",
    "scams": "estafas",
    "about": "sobre-nosotros",
    "privacy": "privacidad",
    "terms": "terminos",
  },
  fr: {
    "how-it-works": "comment-ca-marche",
    "what-we-detect": "ce-que-nous-detectons",
    "safety-tips": "conseils-de-securite",
    "scams": "arnaques",
    "about": "a-propos",
    "privacy": "confidentialite",
    "terms": "conditions",
  },
  de: {
    "how-it-works": "so-funktioniert-es",
    "what-we-detect": "was-wir-erkennen",
    "safety-tips": "sicherheitstipps",
    "scams": "betrugsmaschen",
    "about": "ueber-uns",
    "privacy": "datenschutz",
    "terms": "nutzungsbedingungen",
  },
  "pt-br": {
    "how-it-works": "como-funciona",
    "what-we-detect": "o-que-detectamos",
    "safety-tips": "dicas-de-seguranca",
    "scams": "golpes",
    "about": "sobre-nos",
    "privacy": "privacidade",
    "terms": "termos",
  },
  it: {
    "how-it-works": "come-funziona",
    "what-we-detect": "cosa-rileviamo",
    "safety-tips": "consigli-di-sicurezza",
    "scams": "truffe",
    "about": "chi-siamo",
    "privacy": "privacy",
    "terms": "termini",
  },
  ja: {
    "how-it-works": "how-it-works",
    "what-we-detect": "what-we-detect",
    "safety-tips": "safety-tips",
    "scams": "scams",
    "about": "about",
    "privacy": "privacy",
    "terms": "terms",
  },
  ko: {
    "how-it-works": "how-it-works",
    "what-we-detect": "what-we-detect",
    "safety-tips": "safety-tips",
    "scams": "scams",
    "about": "about",
    "privacy": "privacy",
    "terms": "terms",
  },
};

// Reverse map for hreflang generation: localized slug → en key
export const reverseRoutes: Record<Lang, Record<string, string>> = {
  en: {},
  ...Object.fromEntries(
    Object.entries(routes).map(([lang, map]) => [
      lang,
      Object.fromEntries(Object.entries(map).map(([enKey, loc]) => [loc, enKey])),
    ])
  ),
} as Record<Lang, Record<string, string>>;
