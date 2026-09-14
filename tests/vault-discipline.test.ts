import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = () => readFileSync("src/styles/global.css", "utf8");

describe("vault discipline items 1-2", () => {
  it("has no aurora blobs, no card lift, no risk pulse", () => {
    const c = css();
    expect(c).not.toContain("aurora-a");
    expect(c).not.toContain("aurora-b");
    expect(c).not.toContain(".card-lift");
    expect(c).not.toContain("risk-pulse");
  });
  it("scan bar is solid, not gradient", () => {
    const c = css();
    expect(c).toContain(".scan-bar-fill");
    expect(c).not.toMatch(/\.scan-bar-fill[^}]*linear-gradient/);
  });
});

// node:fs recursive walk of src/ — no rg binary dependency, so the sweep
// suite cannot pass vacuously where ripgrep is missing.
function srcFiles(dir = "src"): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...srcFiles(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function grepFiles(pattern: string): string {
  const re = new RegExp(pattern);
  return srcFiles()
    .filter((f) => re.test(readFileSync(f, "utf8")))
    .join("\n");
}

function grepLines(pattern: string): string[] {
  const re = new RegExp(pattern);
  const hits: string[] = [];
  for (const f of srcFiles()) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (re.test(line)) hits.push(`${f}:${i + 1}:${line}`);
      });
  }
  return hits;
}

describe("vault discipline item 1 sweep", () => {
  it("no card-lift or arrow-nudge anywhere in src", () => {
    // src/pages/preview is untracked other-task dirt — not this task's scope.
    const hits = [...grepLines("card-lift"), ...grepLines("arrow-nudge")].filter(
      (l) => !l.includes("src/pages/preview"),
    );
    expect(hits).toEqual([]);
  });
  it("no emerald-tint surfaces (bg-primary/5, bg-primary/10)", () => {
    expect(grepFiles("bg-primary/")).toBe("");
  });
  it("no text-primary-hover outside CheckerIsland scan/result icons", () => {
    const lines = grepLines("text-primary-hover");
    // Allowed — rg-verified line locks (evidence icons are vault gold
    // post-Task-3, so the old file-level CheckerIsland allow is dead; lock the
    // survivors to stop reintroduction):
    // - CheckerIsland.tsx:458 file-error text (pre-existing error affordance)
    // - CheckerIsland.tsx:485 scan-lens icon (active-scan affordance)
    // AboutReportBox helpline links stay emerald per ruling (b) — genuine link
    // emphasis; QuizIsland incorrect-answer text is pre-existing HEAD content
    // outside this task's file list (Task 3 scope).
    const allowed = lines.filter(
      (l) =>
        l.includes("CheckerIsland.tsx:458") ||
        l.includes("CheckerIsland.tsx:485") ||
        l.includes("AboutReportBox.astro") ||
        l.includes("QuizIsland.tsx:209"),
    );
    // hover-link emphasis is spec-allowed; bare hits still fail.
    const violations = lines.filter(
      (l) => !allowed.includes(l) && l.replaceAll("hover:text-primary-hover", "").includes("text-primary-hover"),
    );
    expect(violations).toEqual([]);
  });
});

describe("vault discipline item 3 verdict hierarchy", () => {
  const src = () => readFileSync("src/components/checker/CheckerIsland.tsx", "utf8");
  it("verdict and utility are separate panels with one report box", () => {
    const s = src();
    expect(s).toContain('id="checker-result"');
    expect(s).toContain('id="checker-utility"');
    const goldenBoxes = (s.match(/const goldenBox|goldenBox\}/g) ?? []).length;
    expect(goldenBoxes).toBe(2);
    // report box rendered exactly once in JSX (not {urgent && goldenBox} + {!urgent && goldenBox})
    const conditionalRenders = (s.match(/\{urgent && goldenBox\}|\{!urgent && goldenBox\}/g) ?? []).length;
    expect(conditionalRenders).toBe(0);
    expect(s).toContain("{goldenBox}");
  });
  it("demo status is a neutral paragraph, not a risk badge", () => {
    const s = src();
    // Neutral-badge upgrade deferred pending the i18n key (8-locale rule):
    // committed tree has no demoTitle usage — demo state stays the
    // description paragraph.
    expect(s).not.toContain("demoTitle");
    expect(s).toContain('t("checker.result.demo")');
  });
  it("evidence icons use vault gold, not emerald", () => {
    const s = src();
    expect(s).not.toMatch(/findings\.map[\s\S]{0,400}text-primary-hover/);
  });
});

describe("vault honesty: scan states", () => {
  const src = () => readFileSync("src/components/checker/CheckerIsland.tsx", "utf8");
  it("no fixed fake delay gates text/url scans", () => {
    expect(src()).not.toContain("const delay = 2000");
  });
  it("progress is a real progressbar with SR percent and busy state", () => {
    const s = src();
    expect(s).toContain('role="progressbar"');
    expect(s).toContain("aria-valuenow");
    expect(s).toContain('class="sr-only"');
    expect(s).toContain("aria-busy");
  });
  it("CLIENT-SIDE chip renders only when served locally", () => {
    const s = src();
    expect(s).toContain("servedLocal &&");
    expect(s).toContain('t("checker.trust.clientSide")');
  });
});

describe("vault rhythm: section tiers + static ticker", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("tier-A story sections use py-20", () => {
    for (const f of ["src/components/HowItWorks.astro", "src/components/WhatWeDetect.astro", "src/components/ExampleAnalysis.astro"]) {
      expect(read(f)).toMatch(/<section[^>]*py-20/);
    }
  });
  it("tier-B dense sections use py-16", () => {
    for (const f of ["src/components/ScamLibraryGrid.astro", "src/components/SafetyTips.astro", "src/components/FAQ.astro", "src/components/SEOContent.astro"]) {
      expect(read(f)).toMatch(/<section[^>]*py-16/);
    }
    expect(read("src/components/StatsBand.astro")).toContain("py-16 sm:py-20");
  });
  it("no marquee system anywhere", () => {
    expect(read("src/styles/global.css")).not.toContain("marquee");
    expect(read("src/components/Ticker.astro")).not.toContain("marquee");
    expect(read("src/components/Ticker.astro")).not.toContain("const loop");
  });
  it("ticker is a static wrap list", () => {
    const s = read("src/components/Ticker.astro");
    expect(s).toContain("flex-wrap");
    expect(s).toContain("items.map((it)");
  });
});

describe("vault type + button hierarchy", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("card titles are serif display", () => {
    expect(read("src/styles/global.css")).toMatch(/\.card-title[^}]*font-family: var\(--font-display\)/);
  });
  it("no press-scale on buttons", () => {
    expect(read("src/styles/global.css")).not.toContain("scale(0.98)");
  });
  it("navigational CTAs are quiet links", () => {
    const quiet = "underline decoration-hairline-strong underline-offset-4";
    for (const f of ["src/components/SEOContent.astro", "src/components/ScamLibraryGrid.astro", "src/components/WhatWeDetect.astro", "src/components/HowItWorks.astro"]) {
      const s = read(f);
      expect(s).toContain(quiet);
      expect(s).not.toContain("btn btn-secondary");
    }
    const safety = read("src/components/SafetyTips.astro");
    expect(safety).toContain(quiet);
    expect(safety.split("btn btn-secondary").length - 1).toBe(1);
  });
});

describe("vault header/cards/trust", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("report action reachable on mobile without new copy", () => {
    const s = read("src/layouts/Layout.astro");
    expect(s).toContain("btn btn-secondary hidden sm:inline-flex");
    expect(s).toContain("sm:hidden");
    expect(s).toContain('aria-label={t("nav.report")}');
  });
  it("status-badge is a real token", () => {
    expect(read("src/styles/global.css")).toMatch(/\.status-badge[^}]*background: var\(--color-surface-2\)/);
  });
  it("library + detail pages use the token, not utility chains", () => {
    const files = ["src/components/ScamLibraryGrid.astro", "src/pages/scams/[slug].astro", "src/pages/es/estafas/[slug].astro", "src/pages/fr/arnaques/[slug].astro", "src/pages/de/betrugsmaschen/[slug].astro", "src/pages/pt-br/golpes/[slug].astro", "src/pages/it/truffe/[slug].astro", "src/pages/ja/scams/[slug].astro", "src/pages/ko/scams/[slug].astro"];
    for (const f of files) {
      expect(read(f)).not.toContain("bg-surface-2 px-2 py-0.5 text-xs text-ink-muted");
    }
  });
  it("checker shows analyzer version without new copy", () => {
    const s = read("src/components/checker/CheckerIsland.tsx");
    expect(s).toContain("v{VERSION}");
    expect(s).toContain("lib/version");
  });
});
