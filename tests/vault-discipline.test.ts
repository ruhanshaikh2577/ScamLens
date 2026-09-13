import { readFileSync } from "node:fs";
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
