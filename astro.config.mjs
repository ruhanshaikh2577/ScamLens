import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { routes as i18nRoutes, hreflangMap as i18nHreflangMap } from "./src/i18n/ui.ts";
import { scamReady } from "./src/i18n/scamReadiness.ts";
import { ready } from "./src/i18n/readiness.ts";

export default defineConfig({
  site: "https://scamlens.in",
  i18n: {
    locales: ["en", "es", "fr", "de", "pt-br", "it", "ja", "ko"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    preact(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          es: "es",
          fr: "fr",
          de: "de",
          "pt-br": "pt-BR",
          it: "it",
          ja: "ja",
          ko: "ko",
        },
      },
      filter: (page) => {
        // Exclude noindex pages — single source ready + scamReady (fixes Important #1: 32 noindex top pages)
        try {
          const url = new URL(page);
          const pathname = url.pathname.replace(/\/+$/, "") || "/";
          const scamDetailMatch = pathname.match(/^\/(?:(es|fr|de|pt-br|it|ja|ko)\/(?:estafas|arnaques|betrugsmaschen|golpes|truffe|scams)\/|scams\/)([^/]+)\/?$/);
          if (scamDetailMatch) {
            const lang = pathname.split("/").filter(Boolean)[0] && ["es","fr","de","pt-br","it","ja","ko"].includes(pathname.split("/").filter(Boolean)[0].toLowerCase()) ? pathname.split("/").filter(Boolean)[0].toLowerCase() : "en";
            const slug = pathname.split("/").pop() || "";
            const langKey = lang === "pt-br" ? "pt-br" : lang;
            if (!scamReady[langKey]?.has(slug)) return false;
          }
          // Top-level pages for not-ready locales are noindex (Layout noindex) — exclude from sitemap
          const topLang = (pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
          if (topLang && ["es","fr","de","pt-br","it","ja","ko"].includes(topLang) && !ready[topLang]) return false;
        } catch {}
        return true;
      },
      serialize(item) {
        const site = "https://scamlens.in";
        const routes = i18nRoutes;
        const hreflangMap = i18nHreflangMap;
        const reverseRoutes = Object.fromEntries(
          Object.entries(routes).map(([lang, m]) => [lang, Object.fromEntries(Object.entries(m).map(([en, loc]) => [loc, en]))])
        );
        const allLangs = ["en", "es", "fr", "de", "pt-br", "it", "ja", "ko"];
        try {
          const url = new URL(item.url);
          let pathname = url.pathname;
          const seg = pathname.split("/").filter(Boolean)[0] || "";
          const lang = (seg.toLowerCase() in routes || seg.toLowerCase() === "en" ? seg.toLowerCase() : "") && allLangs.includes(seg.toLowerCase()) ? seg.toLowerCase() : "en";
          const isLangPrefixed = allLangs.includes(seg.toLowerCase()) && lang !== "en";
          if (isLangPrefixed) {
            pathname = pathname.slice(("/" + seg).length) || "/";
          }
          if (!pathname.startsWith("/")) pathname = "/" + pathname;
          pathname = pathname.replace(/\/+$/, "") || "/";
          // Build en canonical path first
          let enPath;
          if (pathname === "/") enPath = "/";
          else {
            const parts = pathname.replace(/^\//, "").split("/");
            const firstLoc = parts[0];
            const enKey = lang !== "en" ? (reverseRoutes[lang]?.[firstLoc] ?? firstLoc) : firstLoc;
            const rest = parts.slice(1).join("/");
            enPath = `/${enKey}${rest ? "/" + rest : ""}/`.replace(/\/\//g, "/");
            if (enPath === "//") enPath = "/";
          }
          // Per-slug readiness: only slugs with human-translated body are indexable with hreflang — single source ready && scamReady (aligns with src/i18n/utils.ts:114)
          if (/^\/scams\/.+/.test(enPath) && enPath !== "/scams/" && enPath !== "/scams") {
            const slug = enPath.replace(/^\/scams\//, "").replace(/\/$/, "");
            const readyLangsForSlug = allLangs.filter(l => ready[l] && scamReady[l]?.has(slug));
            if (readyLangsForSlug.length <= 1) {
              item.links = undefined;
              return item;
            }
            const links = [];
            for (const l of readyLangsForSlug) {
              let hrefPath;
              if (l === "en") hrefPath = enPath;
              else {
                const firstEn = enPath.replace(/^\//, "").split("/")[0] || "";
                const locSlug = routes[l]?.[firstEn] ?? firstEn;
                const rest = enPath.replace(/^\//, "").split("/").slice(1).join("/");
                hrefPath = `/${l}/${locSlug}${rest ? "/" + rest : ""}/`.replace(/\/\//g, "/");
                if (hrefPath === `/${l}//`) hrefPath = `/${l}/`;
                if (!hrefPath.endsWith("/")) hrefPath += "/";
                hrefPath = hrefPath.replace(/\/\/+/g, "/");
              }
              links.push({ url: site + hrefPath, lang: hreflangMap[l] });
            }
            item.links = links;
            return item;
          }
          // Top-level pages (including / and /scams index) — build alternates for ready locales only (single source `ready`)
          const links = [];
          const topLangs = allLangs.filter((l) => ready[l]);
          for (const l of topLangs) {
            let hrefPath;
            if (l === "en") hrefPath = enPath;
            else {
              const firstEn = enPath.replace(/^\//, "").split("/")[0] || "";
              if (!firstEn) hrefPath = `/${l}/`;
              else {
                const locSlug = routes[l]?.[firstEn] ?? firstEn;
                const rest = enPath.replace(/^\//, "").split("/").slice(1).join("/");
                hrefPath = `/${l}/${locSlug}${rest ? "/" + rest : ""}/`.replace(/\/\//g, "/");
                if (hrefPath === `/${l}//`) hrefPath = `/${l}/`;
              }
            }
            if (!hrefPath.endsWith("/")) hrefPath += "/";
            hrefPath = hrefPath.replace(/\/\/+/g, "/");
            links.push({ url: site + hrefPath, lang: hreflangMap[l] });
          }
          item.links = links;
        } catch {}
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
