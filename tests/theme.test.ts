import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = () => readFileSync("src/styles/global.css", "utf8");

describe("sovereign vault theme", () => {
  it("uses emerald primary, navy canvas, gold accent, no lavender", () => {
    const c = css();
    expect(c).toContain("--color-primary: #047857;");
    expect(c).toContain("--color-primary-hover: #059669;");
    expect(c).toContain("--color-primary-focus: #34D399;");
    expect(c).toContain("--color-canvas: #060B14;");
    expect(c).toContain("--color-gold: #C9A227;");
    expect(c).toContain("@fontsource-variable/fraunces");
    expect(c).not.toContain("#5e6ad2");
  });
  it("has light-mode paper values and serif display type", () => {
    const c = css();
    expect(c).toContain("--light-canvas: #F7F9FC;");
    expect(c).toContain("--light-ink: #0A1628;");
    expect(c).toContain("color: var(--color-gold);");
    expect(c).toContain("font-family: var(--font-display);");
  });
  it("has semantic risk scale, guilloche hero, seal badge", () => {
    const c = css();
    expect(c).toContain("#F59E0B");
    expect(c).toContain("#EA580C");
    expect(c).toContain("#DC2626");
    expect(c).toContain(".seal-ring");
    expect(c).toContain("repeating-linear-gradient");
    expect(c).not.toContain("radial-gradient(circle at center, var(--color-primary), transparent 65%)");
  });
});
