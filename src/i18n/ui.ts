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

// Official cyber-fraud reporting portal per locale (nav "Report a scam" button).
export const reportUrls: Record<Lang, string> = {
  en: "https://cybercrime.gov.in",
  es: "https://www.incibe.es/ciudadania/ayuda/denuncia",
  fr: "https://www.internet-signalement.gouv.fr/",
  de: "https://www.polizei-beratung.de/",
  "pt-br": "https://delegaciavirtual.sinesp.gov.br/",
  it: "https://www.commissariatodips.it/",
  ja: "https://www.npa.go.jp/bureau/cyber/soudan.html",
  ko: "https://ecrm.police.go.kr/minwon/main",
};

// Victim helpline (tel: link) per locale, or null where no single national
// scam helpline exists — detail pages then show the portal button only.
export const reportHelplines: Record<Lang, string | null> = {
  en: "tel:1930",
  es: "tel:017",
  fr: "tel:0805805817",
  de: null,
  "pt-br": null,
  it: null,
  ja: "tel:188",
  ko: "tel:182",
};
