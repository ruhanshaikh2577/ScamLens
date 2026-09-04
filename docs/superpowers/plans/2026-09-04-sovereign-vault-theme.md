# Sovereign Vault Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the site to the Sovereign Vault theme (navy + emerald + gold, Fraunces display serif) with zero layout/routing/i18n-key changes.

**Architecture:** Token swap in `src/styles/global.css` `@theme` + component CSS (eyebrow, risk scale, aurora→guilloche, seal badge), 4 logo-stroke edits in `Layout.astro`, 1 upload-icon stroke in `CheckerIsland.tsx`, 1 trust line in `Hero.astro`, 1 seal hookup in checker Low result, `DESIGN.md` token refresh. A `tests/theme.test.ts` regression test pins tokens.

**Tech Stack:** Astro 5, Tailwind v4 (@theme), Preact islands, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-04-sovereign-vault-theme-design.md`

## Global Constraints

- No layout, routing, content, or i18n-key changes (all 8 locales inherit free; `audit-i18n` must stay 374/374 PASS).
- Gold (`#C9A227`) appears only in `.eyebrow`, `.seal-*`, verified checkmarks.
- `npm test` (60 tests + new theme test) and `npm run build` (193 pages) green after every task.
- Commit per task with `git add <exact files>` only (tree has unrelated dirty files — never `git add -A`).

---

### Task 1: Font dep + core @theme token swap + regression test

**Files:**
- Modify: `package.json`
- Modify: `src/styles/global.css:1-25`
- Create: `tests/theme.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `--color-primary #059669`, `--color-canvas #060B14`, `--color-gold #C9A227`, `--font-display` available to later tasks.

- [ ] **Step 1: Install the display font**

Run: `npm i @fontsource-variable/fraunces`
Expected: `package.json` gains `"@fontsource-variable/fraunces": "^5.x.x"`.

- [ ] **Step 2: Write the failing regression test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = () => readFileSync("src/styles/global.css", "utf8");

describe("sovereign vault theme", () => {
  it("uses emerald primary, navy canvas, gold accent, no lavender", () => {
    const c = css();
    expect(c).toContain("--color-primary: #059669;");
    expect(c).toContain("--color-primary-hover: #10B981;");
    expect(c).toContain("--color-primary-focus: #34D399;");
    expect(c).toContain("--color-canvas: #060B14;");
    expect(c).toContain("--color-gold: #C9A227;");
    expect(c).toContain("@fontsource-variable/fraunces");
    expect(c).not.toContain("#5e6ad2");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/theme.test.ts`
Expected: FAIL (tokens still lavender).

- [ ] **Step 4: Swap the @theme block**

In `src/styles/global.css`: line 2 add `@import "@fontsource-variable/fraunces";`. Replace lines 6–24 values with:
`--color-primary: #059669; --color-on-primary: #ffffff; --color-primary-hover: #10B981; --color-primary-focus: #34D399;`
`--color-ink: #F2F5F9; --color-ink-muted: #C3CEDD; --color-ink-subtle: #8B98AD; --color-ink-tertiary: #5F6B80;`
`--color-canvas: #060B14; --color-surface-1: #0B1424; --color-surface-2: #0F1A2E; --color-surface-3: #142238; --color-surface-4: #182742;`
`--color-hairline: #1E2D47; --color-hairline-strong: #2A3D5C; --color-hairline-tertiary: #35496B;`
Add `--color-gold: #C9A227; --color-gold-deep: #8A6D1B;` and `--font-display: "Fraunces Variable", Georgia, serif;`. Keep `--color-success: #27a644;`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/theme.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/global.css tests/theme.test.ts
git commit -m "feat(theme): sovereign vault core tokens + regression test"
```

---

### Task 2: Light/dark overrides, base layer, display serif

**Files:**
- Modify: `src/styles/global.css:49-108,110-136,138-164`
- Test: `tests/theme.test.ts` (extend)

**Interfaces:**
- Consumes: `--color-gold`, `--font-display` from Task 1.
- Produces: correct `html.light`/`html.dark` values, gold eyebrows, serif display type.

- [ ] **Step 1: Extend the test with override + type asserts**

Append to the `describe` block in `tests/theme.test.ts`:

```ts
  it("has light-mode paper values and serif display type", () => {
    const c = css();
    expect(c).toContain("--light-canvas: #F7F9FC;");
    expect(c).toContain("--light-ink: #0A1628;");
    expect(c).toContain("color: var(--color-gold);");
    expect(c).toContain("font-family: var(--font-display);");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/theme.test.ts`
Expected: FAIL on the new test.

- [ ] **Step 3: Update light tokens, base layer, eyebrow, display type**

`--light-*` block → canvas `#F7F9FC`, surface-1 `#FFFFFF`, surface-2 `#EFF3F8`, surface-3 `#E6ECF4`, surface-4 `#DCE4EF`, hairlines `#DDE4EE/#C6D2E2/#B3C2D6`, ink `#0A1628`, muted `#33415C`, subtle `#5B6B84`, tertiary `#7A879C`. Add `--light-primary: #047857;` and use it for `--color-primary` inside the light media query and `html.light`. `html.dark` block → the navy values from Task 1. `::selection` background → `var(--color-primary)`. `.eyebrow` color → `var(--color-gold)`. Add `font-family: var(--font-display);` to `.display-hero`, `.display-section`, `.headline` only (`.card-title` stays Inter).

- [ ] **Step 4: Run tests + build**

Run: `npx vitest run tests/theme.test.ts` (PASS), `npm run build 2>&1 | tail -2` (193 pages, Complete!).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/theme.test.ts
git commit -m "feat(theme): light mode, serif display, gold eyebrows"
```

---

### Task 3: Semantic risk scale + guilloche hero + seal badge CSS

**Files:**
- Modify: `src/styles/global.css` (`.risk-*`, `.aurora`, add `.seal-*`)
- Test: `tests/theme.test.ts` (extend)

**Interfaces:**
- Consumes: navy/gold tokens from Tasks 1–2.
- Produces: `.risk-medium/.risk-high/.risk-critical` semantic colors, `.seal-badge`/`.seal-ring` classes used by Task 4.

- [ ] **Step 1: Extend the test**

```ts
  it("has semantic risk scale, guilloche hero, seal badge", () => {
    const c = css();
    expect(c).toContain("#F59E0B");
    expect(c).toContain("#EA580C");
    expect(c).toContain("#DC2626");
    expect(c).toContain(".seal-ring");
    expect(c).toContain("repeating-linear-gradient");
    expect(c).not.toContain("radial-gradient(circle at center, var(--color-primary), transparent 65%)");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/theme.test.ts`
Expected: FAIL on the new test.

- [ ] **Step 3: Replace risk scale, aurora, add seal**

`.risk-low` unchanged (surface-2). `.risk-medium`: bg `color-mix(in srgb, #F59E0B 14%, transparent)`, color `#FBBF24`, border `color-mix(in srgb, #F59E0B 40%, transparent)`. `.risk-high`: bg `color-mix(in srgb, #EA580C 18%, transparent)`, color `#FB923C`, border `color-mix(in srgb, #EA580C 50%, transparent)`. `.risk-critical`: bg `#DC2626`, color `#fff`, border `#DC2626`. Add `html.light` overrides: medium color `#B45309`, high `#C2410C`, critical bg `#B91C1C`. Replace `.aurora::before/::after` blob backgrounds with emerald at opacity 0.14/0.10, and give `.aurora` a `background: repeating-linear-gradient(115deg, color-mix(in srgb, var(--color-primary) 16%, transparent) 0 1px, transparent 1px 9px);` layer masked by the existing mask-image. Append:
```css
.seal-badge { display: inline-flex; align-items: center; gap: 6px; color: var(--color-gold); font-size: 12px; font-weight: 500; }
.seal-ring { width: 18px; height: 18px; border: 1.5px solid var(--color-gold); border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
```

- [ ] **Step 4: Run tests + build**

Run: `npx vitest run tests/theme.test.ts` (PASS), `npm run build 2>&1 | tail -2` (Complete!).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/theme.test.ts
git commit -m "feat(theme): semantic risk scale, guilloche hero, seal badge"
```

---

### Task 4: Logo strokes, hero trust line, checker seal

**Files:**
- Modify: `src/layouts/Layout.astro:131-132,175-176`
- Modify: `src/components/Hero.astro` (after CheckerIsland div)
- Modify: `src/components/checker/CheckerIsland.tsx:302,528-531`
- Test: existing `npm test` + `tests/theme.test.ts`

**Interfaces:**
- Consumes: `.seal-*` classes from Task 3, `how.static` key (exists in all 8 locales).
- Produces: no `#5e6ad2` left in `src/`; seal visible in hero + Low results.

- [ ] **Step 1: Logo strokes**

In `src/layouts/Layout.astro`, replace all 4 `stroke="#5e6ad2"` with `stroke="#10B981"` (header mark lines 131–132, footer mark lines 175–176).

- [ ] **Step 2: Upload icon stroke**

In `src/components/checker/CheckerIsland.tsx:302`, replace `stroke="#5e6ad2"` with `stroke="#10B981"`.

- [ ] **Step 3: Hero trust line**

In `src/components/Hero.astro`, after the `<div class="hero-in mt-10">…CheckerIsland…</div>` block, insert:
```astro
<p class="seal-badge hero-in mx-auto mt-6 w-fit" style="--hero-delay: 360ms"><span class="seal-ring" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 5.2 4 7.4 8.2 2.8"/></svg></span>{t("how.static")}</p>
```

- [ ] **Step 4: Checker Low-result seal**

In `src/components/checker/CheckerIsland.tsx`, after the closing `</span>` of the risk badge (line 531), insert:
```tsx
{result.risk === "low" && (
  <span class="seal-badge ml-1" aria-hidden="true"><span class="seal-ring"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 5.2 4 7.4 8.2 2.8"/></svg></span></span>
)}
```
Verify `RiskLevel` includes `"low"` (it does — `RISK_CLASS`/`RISK_LABEL` map low/medium/high/critical at lines 70–74).

- [ ] **Step 5: Verify no lavender remains and everything is green**

Run: `grep -rn "5e6ad2" src/ ; echo "grep-exit:$?"` Expected: `grep-exit:1` (no matches). Run: `npm test 2>&1 | tail -3` (all pass), `npm run build 2>&1 | tail -2` (193 pages Complete!), `node scripts/audit-i18n.mjs 2>&1 | tail -2` (PASS).

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Layout.astro src/components/Hero.astro src/components/checker/CheckerIsland.tsx
git commit -m "feat(theme): emerald brand strokes, hero trust line, low-risk seal"
```

---

### Task 5: DESIGN.md refresh + final verification

**Files:**
- Modify: `DESIGN.md` (front-matter colors + light tokens + font note)
- Test: full suite + visual pass

**Interfaces:**
- Consumes: final token values from Tasks 1–3.
- Produces: docs match implementation; visual sign-off in both modes.

- [ ] **Step 1: Update DESIGN.md tokens**

Replace `colors.primary "#5e6ad2"` → `"#059669"`, `on-primary` stays `"#ffffff"`, `primary-hover "#828fff"` → `"#10B981"`, `primary-focus "#5e69d1"` → `"#34D399"`, canvas `"#010102"` → `"#060B14"`, surfaces → `"#0B1424/#0F1A2E/#142238/#182742"`, hairlines → `"#1E2D47/#2A3D5C/#35496B"`, inks → `"#F2F5F9/#C3CEDD/#8B98AD/#5F6B80"`, add `gold: "#C9A227"` + `gold-deep: "#8A6D1B"`, add `font-display: "Fraunces Variable, Georgia, serif"`. Update the description line: replace "near-black product-focused marketing canvas built around #010102" with "navy-ink trust canvas built around #060B14 with emerald action color and rationed gold accents", and "signature Linear lavender-blue (#5e6ad2)" with "emerald (#059669)".

- [ ] **Step 2: Full verification**

Run: `npm test 2>&1 | tail -3` (all pass including `tests/theme.test.ts`), `npm run build 2>&1 | tail -2` (193 pages), `node scripts/audit-i18n.mjs 2>&1 | grep -E "keys|Audit"` (374/374 OK, PASS). Visual pass: open `/`, `/how-it-works`, `/scams`, one scam detail in dark mode, then toggle light — check buttons emerald, eyebrows gold serif headlines, risk badges amber/orange/red, hero guilloche faint, seal on Low result.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs(theme): sovereign vault tokens in DESIGN.md"
```
