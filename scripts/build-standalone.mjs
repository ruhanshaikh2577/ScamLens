import { build } from "esbuild";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const indexPath = join(dist, "index.html");
let html = readFileSync(indexPath, "utf8");

const result = await build({
  entryPoints: ["src/standalone-checker.tsx"],
  bundle: true,
  format: "iife",
  minify: true,
  write: false,
});
const checkerJs = result.outputFiles[0].text;

html = html.replace(
  /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"[^>]*>/g,
  (_, href) => `<style>${readFileSync(join(dist, href), "utf8")}</style>`
);

html = html.replace(/<link rel="preload"[^>]*\/_astro\/[^>]*>/g, "");

// View transitions are browser-only chrome — drop the router module for the standalone file.
html = html.replace(
  /<script type="module"[^>]*src="[^"]*ClientRouter[^"]*"[^>]*><\/script>/g,
  ""
);

html = html.replace(
  /@font-face\{[^}]*?\/_astro\/inter-(?!latin-wght-normal)[^}]*?\}/g,
  ""
);
// Dynamically resolve Inter latin woff2 (hash changes on rebuild) — ponytail: no hardcoded hash
let latinFont = null;
let latinName = null;
try {
  const astroFiles = existsSync(join(dist, "_astro")) ? readdirSync(join(dist, "_astro")) : [];
  latinName = astroFiles.find((f) => /^inter-latin-wght-normal\..*\.woff2$/.test(f)) ?? astroFiles.find((f) => /inter-latin.*\.woff2$/.test(f));
  if (latinName) latinFont = readFileSync(join(dist, "_astro", latinName)).toString("base64");
} catch {}
if (latinFont && latinName) {
  html = html.replace(
    new RegExp(`url\\(/_astro/${latinName.replaceAll(".", "\\.")}\\)`, "g"),
    `url(data:font/woff2;base64,${latinFont})`
  );
} else {
  console.warn("Latin font not found for inline; leaving external ref");
}

html = html.replace(
  /<astro-island[^>]*>([\s\S]*?)<\/astro-island>/,
  (_, inner) =>
    `<div id="checker-mount">${inner}</div><script>${checkerJs}</script>`
);

if (html.includes("/_astro/")) {
  const leftovers = [...html.matchAll(/[^"'( ]*\/_astro\/[^"'() ]*/g)].map((m) => m[0]);
  console.warn("Unresolved asset refs:", [...new Set(leftovers)]);
}

writeFileSync(join(dist, "ScamLens-standalone.html"), html);
console.log(`Standalone written: ${(html.length / 1024).toFixed(0)} KB`);
