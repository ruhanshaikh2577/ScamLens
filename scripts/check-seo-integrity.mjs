#!/usr/bin/env node
// Post-build SEO integrity guard.
//
// Catches the two failure modes that `npm run check` and `npm test` cannot see,
// because both involve the *interaction* of the built output with public/_redirects:
//   1. a URL in the sitemap that the page itself marks noindex (dev-only routes), and
//   2. a URL in the sitemap that public/_redirects also 301s away (built + indexed but
//      unreachable), which silently de-indexes live localized pages.
// Neither has ever been asserted anywhere, which is how 14 live pages and 5 dev URLs
// shipped while the build stayed green.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Resolve a URL pathname to the file Astro actually wrote for it.
// "/" is dist/index.html; "/de/" is dist/de/index.html; anything else falls back to
// the flat "<path>.html" form. Returns null when the page was not built.
function builtPath(dist, pathname) {
  const p = pathname.replace(/\/+$/, "") || "/";
  const candidates =
    p === "/" ? [join(dist, "index.html")] : [join(dist, p.slice(1), "index.html"), join(dist, p.slice(1) + ".html")];
  return candidates.find((f) => existsSync(f)) ?? null;
}

const dist = new URL("../dist/", import.meta.url).pathname;
const redirects = new URL("../public/_redirects", import.meta.url).pathname;

const failures = [];
const notes = [];

// --- sources that _redirects sends away (Cloudflare Pages syntax: "<src> <dst> [code]") ---
const redirected = new Set();
if (existsSync(redirects)) {
  for (const line of readFileSync(redirects, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("http")) continue;
    const m = t.match(/^(\S+)\s+(\S+)/);
    if (m) redirected.add(m[1].replace(/\/+$/, "") || "/");
  }
}

const sitemapFiles = existsSync(dist)
  ? readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))
  : [];

if (sitemapFiles.length === 0) {
  console.error("✗ no dist/sitemap-*.xml found — run `npm run build` first.");
  process.exit(1);
}

let checked = 0;
let noindex = 0;

for (const sf of sitemapFiles) {
  const xml = readFileSync(join(dist, sf), "utf8");
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of blocks) {
    const locM = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locM) continue;
    const loc = locM[1];
    const u = new URL(loc);
    const path = u.pathname.replace(/\/+$/, "") || "/";
    checked++;

    // (2) listed in the sitemap but 301'd away by _redirects
    if (redirected.has(path)) {
      failures.push(`${loc} is in the sitemap but public/_redirects 301s it away (unreachable)`);
    }

    // (1) listed in the sitemap but the page itself says noindex
    const file = builtPath(dist, path);
    if (file) {
      const html = readFileSync(file, "utf8");
      const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
      if (robots && /noindex/i.test(robots[1])) {
        failures.push(`${loc} is in the sitemap but its HTML says "${robots[1]}"`);
        noindex++;
      }
    }

    // (3) hreflang alternates must resolve to a built page
    const links = [...block.matchAll(/<xhtml:link[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of links) {
      const hp = new URL(href).pathname.replace(/\/+$/, "") || "/";
      if (!builtPath(dist, hp)) {
        failures.push(`${loc} advertises hreflang ${href} which is not built (404)`);
      }
    }
  }
}

if (notes.length) notes.forEach((n) => console.log(`  note: ${n}`));

if (failures.length) {
  console.error(`\n✗ sitemap integrity FAILED (${failures.length} problem(s), ${checked} URLs checked):`);
  for (const f of [...new Set(failures)]) console.error(`   - ${f}`);
  console.error(`\n  Fix: exclude the path in astro.config.mjs sitemap filter, and/or drop the`);
  console.error(`  rule from public/_redirects. Re-run \`npm run build\` afterwards.`);
  process.exit(1);
}

console.log(`✓ sitemap integrity OK — ${checked} URLs checked, none noindex, redirected-away, or advertising a 404 hreflang.`);
