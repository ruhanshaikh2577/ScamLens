import { render } from "preact";
import { h } from "preact";
import CheckerIsland from "./components/checker/CheckerIsland";
import { analyze, type AnalysisResult } from "./lib/analyzer";

// Extension v1 thin wrapper — reuses CheckerIsland + ResultView (inside CheckerIsland).
// No second UI, no auth. Standalone bundles this entry via scripts/build-standalone.mjs.
// CheckerIsland itself prefers /api/analyze when online and falls back to local analyze().
// This helper is exported for the optional extension popup that may call the API directly.
// `lang` must be threaded through: the server reads it from the query string only, and the
// local analyze() call defaults to "en", so omitting it returned English on every locale.
export async function analyzeWithFallback(input: string, kind: "message" | "url", lang = "en"): Promise<AnalysisResult> {
  try {
    const base = typeof location !== "undefined" && location.protocol === "chrome-extension:" ? "https://scamlens.in/api/analyze" : "/api/analyze";
    const url = `${base}?lang=${encodeURIComponent(lang)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input, kind }),
        signal: ctrl.signal,
      });
      if (res.ok) {
        const j = await res.json();
        if (j && typeof j.risk === "string" && Array.isArray(j.meta?.detectorIds)) return j as AnalysisResult;
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[analyzeWithFallback]", e);
  }
  return analyze(input, kind, lang);
}

if (typeof document !== "undefined") {
  const root = document.getElementById("checker-mount");
  if (root) render(h(CheckerIsland, { lang: (document.documentElement.lang || "en") as never }), root);
}
