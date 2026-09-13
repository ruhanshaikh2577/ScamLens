import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
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

function rg(pattern: string): string {
  try {
    return execSync(`rg -l "${pattern}" src --glob '!**/node_modules'`, { encoding: "utf8" });
  } catch { return ""; }
}

function rgLines(pattern: string): string[] {
  try {
    return execSync(`rg -n "${pattern}" src`, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch { return []; }
}

describe("vault discipline item 1 sweep", () => {
  it("no card-lift or arrow-nudge anywhere in src", () => {
    // src/pages/preview is untracked other-task dirt — not this task's scope.
    const hits = [...rgLines("card-lift"), ...rgLines("arrow-nudge")].filter(
      (l) => !l.includes("src/pages/preview"),
    );
    expect(hits).toEqual([]);
  });
  it("no emerald-tint surfaces (bg-primary/5, bg-primary/10)", () => {
    expect(rg("bg-primary/")).toBe("");
  });
  it("no text-primary-hover outside CheckerIsland scan/result icons", () => {
    const lines = rgLines("text-primary-hover");
    // Allowed: CheckerIsland scan/result icons (Task 3 narrows further);
    // AboutReportBox helpline links stay emerald per ruling (b) — genuine link
    // emphasis; QuizIsland incorrect-answer text is pre-existing HEAD content
    // outside this task's file list (Task 3 scope).
    const allowed = lines.filter(
      (l) =>
        l.includes("CheckerIsland.tsx") ||
        l.includes("AboutReportBox.astro") ||
        l.includes("QuizIsland.tsx"),
    );
    expect(lines.length - allowed.length).toBe(0);
  });
});
