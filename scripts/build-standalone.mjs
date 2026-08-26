import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
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
const latinFont = readFileSync(
  join(dist, "_astro", "inter-latin-wght-normal.Dx4kXJAl.woff2")
).toString("base64");
html = html.replace(
  /url\(\/_astro\/inter-latin-wght-normal\.Dx4kXJAl\.woff2\)/g,
  `url(data:font/woff2;base64,${latinFont})`
);

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
