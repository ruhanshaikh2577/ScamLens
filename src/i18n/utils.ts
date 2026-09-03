import { languages, defaultLang, showDefaultLang, routes, reverseRoutes, hreflangMap } from "./ui";
import type { Lang } from "./ui";
import { ready } from "./readiness";
import { isScamReady } from "./scamReadiness";
import en from "./translations/en";
import es from "./translations/es";
import fr from "./translations/fr";
import de from "./translations/de";
import ptbr from "./translations/pt-br";
import it from "./translations/it";
import ja from "./translations/ja";
import ko from "./translations/ko";

// Centralized dicts — single source, no duplication logic
const dicts: Record<Lang, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  es: es as unknown as Record<string, string>,
  fr: fr as unknown as Record<string, string>,
  de: de as unknown as Record<string, string>,
  "pt-br": ptbr as unknown as Record<string, string>,
  it: it as unknown as Record<string, string>,
  ja: ja as unknown as Record<string, string>,
  ko: ko as unknown as Record<string, string>,
};

// Try dynamic import for not-ready langs if they exist as files (optional)
try {
  // keep sync for build; if translations file missing, fallback to en
} catch {}

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split("/").filter(Boolean)[0] ?? "";
  // pathname lower-case? URL path is case-sensitive; we use lower-case pt-br
  const lower = seg.toLowerCase();
  if (lower in languages) return lower as Lang;
  return defaultLang;
}

export function getHreflang(lang: Lang): string {
  return hreflangMap[lang] ?? lang;
}

export function useTranslations(lang: Lang) {
  const d = dicts[lang] ?? dicts[defaultLang];
  const fallback = dicts[defaultLang];
  return function t(key: string, params?: Record<string, string | number>): string {
    let v: string | undefined = d[key] ?? fallback[key] ?? key;
    if (params) {
      for (const [k, val] of Object.entries(params)) v = v.replaceAll(`{${k}}`, String(val));
    }
    return v;
  };
}

// Translate a path for a target locale. Path is English canonical like "/how-it-works" or "/"
// For ja/ko which reuse English slugs, this is a no-op (routes entry maps to same)
export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, targetLang: Lang = lang): string {
    if (!path.startsWith("/")) path = `/${path}`;
    // Keep query/hash? not needed yet — strip for now
    // Split path into first segment
    const clean = path.replace(/\/+$/, "") || "/";
    if (clean === "/") {
      return !showDefaultLang && targetLang === defaultLang ? "/" : `/${targetLang}/`;
    }
    // Handle nested like /scams/foo -> translate first segment only
    const parts = clean.replace(/^\//, "").split("/");
    const first = parts[0];
    // Find English key for this first segment under current lang? Instead map en->target
    // We treat input path as English canonical; look up routes[targetLang][first]
    let translatedFirst: string | undefined;
    if (targetLang !== defaultLang) {
      translatedFirst = routes[targetLang as Exclude<Lang, "en">]?.[first];
    } else {
      // if translating to en, first is already en
      translatedFirst = first;
    }
    const outFirst = translatedFirst ?? first;
    const rest = parts.slice(1).join("/");
    const joined = `/${outFirst}${rest ? `/${rest}` : ""}/`.replace(/\/\/+/g, "/");
    if (!showDefaultLang && targetLang === defaultLang) return joined;
    return `/${targetLang}${joined}`.replace(/\/\/+/g, "/");
  };
}

// Reverse: from a localized URL, find English canonical path for hreflang generation
export function getCanonicalEnPath(url: URL): string {
  const lang = getLangFromUrl(url);
  let pathname = url.pathname;
  // strip locale prefix if present
  if (lang !== defaultLang) {
    const prefix = `/${lang}`;
    if (pathname.toLowerCase().startsWith(prefix.toLowerCase())) {
      pathname = pathname.slice(prefix.length) || "/";
    }
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/") return "/";
  const parts = pathname.replace(/^\//, "").split("/");
  const firstLoc = parts[0];
  const enKey = reverseRoutes[lang]?.[firstLoc] ?? (lang === defaultLang ? firstLoc : undefined) ?? firstLoc;
  // enKey is English slug; need to ensure it maps to canonical (for ja/ko it's same)
  const rest = parts.slice(1).join("/");
  return `/${enKey}${rest ? `/${rest}` : ""}/`.replace(/\/\//g, "/");
}

// Build absolute hreflang URLs for current page
export function getHreflangUrls(url: URL, site: string = "https://scamlens.in"): Array<{ lang: Lang; hreflang: string; href: string }> {
  const enPath = getCanonicalEnPath(url);
  // Scam detail pages: only return hreflang for langs where that slug is human-translated and ready
  if (/^\/scams\/.+/.test(enPath) && enPath !== "/scams/" && enPath !== "/scams") {
    const slug = enPath.replace(/^\/scams\//, "").replace(/\/$/, "");
    const readyLangsFiltered = (Object.keys(ready) as Lang[]).filter((l) => ready[l] && isScamReady(l, slug));
    const links: Array<{ lang: Lang; hreflang: string; href: string }> = [];
    for (const l of readyLangsFiltered) {
      let hrefPath: string;
      if (l === defaultLang) hrefPath = enPath;
      else {
        const firstEn = enPath.replace(/^\//, "").split("/")[0] || "";
        const locSlug = routes[l as Exclude<Lang, "en">]?.[firstEn] ?? firstEn;
        const rest = enPath.replace(/^\//, "").split("/").slice(1).join("/");
        hrefPath = `/${l}/${locSlug}${rest ? `/${rest}` : ""}/`.replace(/\/\//g, "/");
        if (hrefPath === `/${l}//`) hrefPath = `/${l}/`;
        if (!hrefPath.endsWith("/")) hrefPath += "/";
        hrefPath = hrefPath.replace(/\/\/+/g, "/");
      }
      links.push({ lang: l, hreflang: getHreflang(l), href: `${site}${hrefPath}` });
    }
    return links;
  }
  const readyLangs = (Object.keys(ready) as Lang[]).filter((l) => ready[l]);
  const urls: Array<{ lang: Lang; hreflang: string; href: string }> = [];
  for (const l of readyLangs) {
    let hrefPath: string;
    if (l === defaultLang) {
      hrefPath = enPath;
    } else {
      const firstEn = enPath.replace(/^\//, "").split("/")[0] ?? "";
      if (!firstEn) {
        hrefPath = `/${l}/`;
      } else {
        const locSlug = routes[l as Exclude<Lang, "en">]?.[firstEn] ?? firstEn;
        const rest = enPath.replace(/^\//, "").split("/").slice(1).join("/");
        hrefPath = `/${l}/${locSlug}${rest ? `/${rest}` : ""}/`.replace(/\/\//g, "/");
        // Normalize root double slash
        if (hrefPath === `/${l}//`) hrefPath = `/${l}/`;
      }
    }
    // Ensure trailing slash consistency (keep / for root, else trailing slash)
    if (!hrefPath.endsWith("/")) hrefPath += "/";
    hrefPath = hrefPath.replace(/\/\/+/g, "/");
    urls.push({ lang: l, hreflang: getHreflang(l), href: `${site}${hrefPath}` });
  }
  return urls;
}

// Helper to get canonical for current request
export function getCanonicalUrl(url: URL, site: string = "https://scamlens.in"): string {
  // Canonical is self-referencing for indexable pages
  // For en, it's https://scamlens.in{enPath}
  // For non-en, it's https://scamlens.in/{lang}{localizedPath}
  const lang = getLangFromUrl(url);
  const enPath = getCanonicalEnPath(url);
  if (lang === defaultLang) return `${site}${enPath}`;
  // reconstruct localized path
  const firstEn = enPath.replace(/^\//, "").split("/")[0] ?? "";
  if (!firstEn) return `${site}/${lang}/`;
  const locSlug = routes[lang as Exclude<Lang, "en">]?.[firstEn] ?? firstEn;
  const rest = enPath.replace(/^\//, "").split("/").slice(1).join("/");
  const locPath = `/${locSlug}${rest ? `/${rest}` : ""}/`.replace(/\/\//g, "/");
  return `${site}/${lang}${locPath}`;
}
