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
    // - CheckerIsland.tsx:433 file-error text (pre-existing error affordance)
    // - CheckerIsland.tsx:459 scan-lens icon (active-scan affordance)
    // AboutReportBox helpline links stay emerald per ruling (b) — genuine link
    // emphasis; QuizIsland incorrect-answer text is pre-existing HEAD content
    // outside this task's file list (Task 3 scope).
    const allowed = lines.filter(
      (l) =>
        l.includes("CheckerIsland.tsx:433") ||
        l.includes("CheckerIsland.tsx:459") ||
        l.includes("AboutReportBox.astro") ||
        l.includes("QuizIsland.tsx:209"),
    );
    expect(lines.length - allowed.length).toBe(0);
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
