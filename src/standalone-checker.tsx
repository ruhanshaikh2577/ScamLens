import { render } from "preact";
import { h } from "preact";
import CheckerIsland from "./components/checker/CheckerIsland";
import { analyze, type AnalysisResult } from "./lib/analyzer";

// Extension v1 thin wrapper — reuses CheckerIsland + ResultView (inside CheckerIsland).
// No second UI, no auth. Standalone bundles this entry via scripts/build-standalone.mjs.
// CheckerIsland itself prefers /api/analyze when online and falls back to local analyze().
// This helper is exported for the optional extension popup that may call the API directly.
export async function analyzeWithFallback(input: string, kind: "message" | "url"): Promise<AnalysisResult> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, kind }),
    });
    if (res.ok) return (await res.json()) as AnalysisResult;
  } catch {}
  return analyze(input, kind);
}

if (typeof document !== "undefined") {
  const root = document.getElementById("checker-mount");
  if (root) render(h(CheckerIsland, null), root);
}
