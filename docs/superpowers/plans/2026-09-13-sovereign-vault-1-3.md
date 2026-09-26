# Sovereign Vault items 1–3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix audit items 1 (emerald discipline), 2 (motion restraint), 3 (verdict hierarchy) so ScamLens reads as a Sovereign Vault, not a SaaS dashboard.

**Architecture:** Token-first CSS discipline in `src/styles/global.css`, then a mechanical class sweep across components/pages, then a contained `CheckerIsland.tsx` ResultView restructure. No analyzer, i18n, or API changes.

**Tech Stack:** Astro 5, Preact islands, Tailwind 4 (Vite plugin), vitest, `astro check`.

**Spec:** `DESIGN.md` (sovereign-vault-theme, verdict authority), `PRODUCT.md` (positioning/constraints), UI audit 2026-09-13 (ranked items 1–3).

## Global Constraints

- Privacy invariant: always `redact()` before `analyze()`; never store raw input — do not touch this flow.
- Every detector keeps pattern + weight + evidence snippet + actionable step (`src/lib/analyzer.ts`).
- Voice: "signs of", never "proof of"; always route to official-channel verification.
- Never ship English-only strings in the checker path — use `src/lib/analyzer-i18n.ts` + `src/i18n/translations/`.
- Emerald ONLY for: brand mark, primary CTA, focus ring, link emphasis. Gold ONLY for: eyebrows, seal, verified marks. No gradients, no spotlight cards, no light-mode marketing pages (DESIGN.md Do/Don't).
- `VERSION` in `src/lib/version.ts` (0.1.1) stays in sync with `package.json` + `extension/manifest.json` when bumped — do not bump here.
- Keep `astro.config.mjs` sitemap filter/serialize in sync with `readiness.ts` / `scamReadiness.ts` / `utils.ts:114` — do not touch i18n gates here.
- `scamReadiness.ts` slug lists stay inline `new Set([...])` literals (regex-parsed by `scripts/audit-i18n.mjs`).
- Verify each task with `npm run check` + `npm test`.

---

## File Structure

- Modify: `src/styles/global.css` — remove aurora blobs/animation + gradient scan-bar, remove `card-lift`/`arrow-nudge` hover lift, remove `risk-pulse`, restyle stats/icon/step defaults to ink.
- Modify: `src/components/Hero.astro:9` — remove `<div class="aurora">`.
- Modify: `src/components/StatsBand.astro:38` — stat numbers `text-primary-hover` → `text-ink`.
- Modify: `src/components/WhatWeDetect.astro:103,105` — drop `card-lift`, icon `text-primary-hover` → `text-ink-muted`, remove group-hover lift.
- Modify: `src/components/ScamLibraryGrid.astro:77,82` — drop `card-lift`, link `text-primary-hover` → `text-ink` underline-offset style, drop `arrow-nudge`.
- Modify: `src/components/HowItWorks.astro:39` + all 8 locale `how-it-works`/`como-funciona` pages `:82` — step badge `border-primary/40 bg-primary/10 text-primary-hover` → hairline/ink style.
- Modify: `src/components/TopThreeCallout.astro:9` — `border-primary/20 bg-primary/5` → `border-hairline bg-surface-1`.
- Modify: `src/components/SafetyTips.astro:39` — numbers `text-primary-hover` → `text-ink-muted`.
- Modify: `src/components/ExampleAnalysis.astro:64` — warning icon `text-primary-hover` → `text-gold` (vault warning metal, still rationed).
- Modify: `src/components/SimulatorIsland.tsx:89` — selected preset `border-primary/40 bg-primary/10` → `border-hairline-strong bg-surface-2`.
- Modify: `src/components/checker/CheckerIsland.tsx` — ResultView split (verdict panel vs utility panel), single goldenBox, DEMO badge treatment, evidence icon color.
- Modify: `src/pages/scams/[slug].astro:83,135,137` + 7 locale `[slug]` copies — same card/icon/link treatment as ScamLibraryGrid.
- Create: `tests/vault-discipline.test.ts` — regression gate for items 1–3.
- Modify: `tests/theme.test.ts` — extend with no-aurora-animation + solid scan-bar assertions.

Each task below produces working, testable software on its own. Task order matters: tokens first, sweep second, ResultView third.

---

### Task 1: Emerald discipline + motion kill in global.css

**Files:**
- Modify: `src/styles/global.css:234-253,295-304,346-379,394-399,502-527`
- Modify: `tests/theme.test.ts`
- Test: `tests/vault-discipline.test.ts`

**Interfaces:**
- Consumes: existing `.card`, `.risk-*`, `.scan-bar`, `.eyebrow`, `.seal-badge` classes.
- Produces: `.card` static (no lift), `.scan-bar-fill` solid, no `.aurora` animation, no `.card-lift`, no `risk-pulse` — class names unchanged so Task 2/3 sweeps keep working.

- [ ] **Step 1: Write the failing tests**

Create `tests/vault-discipline.test.ts`:

```ts
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
```

Append to `tests/theme.test.ts`:

```ts
it("vault motion restraint: static hero, static cards", () => {
  const c = css();
  expect(c).not.toContain("radial-gradient(circle at center, var(--color-primary), transparent 65%)");
  expect(c).not.toContain("translateY(-3px)");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts tests/theme.test.ts`
Expected: FAIL — `aurora-a`, `.card-lift`, `risk-pulse`, gradient scan-bar, and `translateY(-3px)` all still present.

- [ ] **Step 3: Write minimal implementation**

In `src/styles/global.css`, apply exactly these edits (nothing else):

1. Delete the `.card-lift` block, the `.arrow-nudge` block, and the `@media (hover: hover)` card-lift hover rule (lines ~233-253).
2. Delete `.aurora`, `.aurora::before`, `.aurora::after` rules and `@keyframes aurora-a` / `aurora-b` (lines ~346-379, 512-527).
3. Delete `@keyframes risk-pulse` and remove the `.risk-high .risk-dot, .risk-critical .risk-dot` animation rule (lines ~302-305, 502-511). Keep `.risk-dot` static.
4. Change `.scan-bar-fill` background from `linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))` to `var(--color-primary)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts tests/theme.test.ts`
Expected: PASS. Then run: `npm run check`
Expected: no new type errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/vault-discipline.test.ts tests/theme.test.ts
git commit -m "style: kill aurora, card-lift, risk-pulse; solid scan bar"
```

---

### Task 2: Mechanical emerald sweep across components and pages

**Files:**
- Modify: `src/components/Hero.astro:9`
- Modify: `src/components/StatsBand.astro:38`
- Modify: `src/components/WhatWeDetect.astro:103,105`
- Modify: `src/components/ScamLibraryGrid.astro:77,82`
- Modify: `src/components/HowItWorks.astro:39`
- Modify: `src/components/TopThreeCallout.astro:9`
- Modify: `src/components/SafetyTips.astro:39`
- Modify: `src/components/ExampleAnalysis.astro:64`
- Modify: `src/components/SimulatorIsland.tsx:89`
- Modify: `src/components/SEOContent.astro:30`
- Modify: `src/pages/how-it-works.astro:87,105,132,235` + `es/como-funciona`, `fr/comment-ca-marche`, `de/so-funktioniert-es`, `pt-br/como-funciona`, `it/come-funziona`, `ja/how-it-works`, `ko/how-it-works` same lines
- Modify: `src/pages/scams/[slug].astro:83,135,137` + `es/estafas`, `fr/arnaques`, `de/betrugsmaschen`, `pt-br/golpes`, `it/truffe`, `ja/scams`, `ko/scams` same lines
- Test: `tests/vault-discipline.test.ts`

**Interfaces:**
- Consumes: static `.card` from Task 1; allowed emerald survivors: `.btn-primary`, `:focus-visible` ring, brand-mark svg `stroke="#10B981"`, text links with `hover:underline`.
- Produces: zero `text-primary-hover` / `bg-primary/` / `border-primary/` outside the allowlist; zero `card-lift` / `arrow-nudge` in src.

- [ ] **Step 1: Write the failing test**

Append to `tests/vault-discipline.test.ts`:

```ts
import { execSync } from "node:child_process";

function rg(pattern: string): string {
  try {
    return execSync(`rg -l "${pattern}" src --glob '!**/node_modules'`, { encoding: "utf8" });
  } catch { return ""; }
}

describe("vault discipline item 1 sweep", () => {
  it("no card-lift or arrow-nudge anywhere in src", () => {
    expect(rg("card-lift")).toBe("");
    expect(rg("arrow-nudge")).toBe("");
  });
  it("no emerald-tint surfaces (bg-primary/5, bg-primary/10)", () => {
    expect(rg("bg-primary/")).toBe("");
  });
  it("no text-primary-hover outside CheckerIsland scan/result icons", () => {
    const out = (() => {
      try {
        return execSync(`rg -n "text-primary-hover" src`, { encoding: "utf8" });
      } catch { return ""; }
    })();
    const lines = out.trim().split("\n").filter(Boolean);
    const allowed = lines.filter((l) => l.includes("CheckerIsland.tsx"));
    expect(lines.length - allowed.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — `card-lift`, `bg-primary/`, and `text-primary-hover` hits across ~20 files.

- [ ] **Step 3: Write minimal implementation**

Apply this exact replacement map (mechanical, no redesign):

1. `Hero.astro:9` — delete `<div class="aurora" aria-hidden="true"></div>`.
2. `StatsBand.astro:38` — `text-primary-hover` → `text-ink` (numbers become vault white; keep size/tracking).
3. `WhatWeDetect.astro:103` — `card card-lift group p-6` → `card group p-6`; `:105` — `text-primary-hover transition-transform duration-300 group-hover:-translate-y-0.5` → `text-ink-muted`.
4. `ScamLibraryGrid.astro:77` — `card card-lift library-card group` → `card library-card group`; `:82` — `text-primary-hover` → `text-ink`, drop `<span class="arrow-nudge">→</span>` inner span, keep "Read the breakdown →" as plain text arrow.
5. `HowItWorks.astro:39` and each locale how-page `:82` — `border-primary/40 bg-primary/10 font-mono text-[13px] text-primary-hover` → `border-hairline bg-canvas font-mono text-[13px] text-ink-muted`.
6. `TopThreeCallout.astro:9` — `border border-primary/20 bg-primary/5` → `border border-hairline bg-surface-1`.
7. `SafetyTips.astro:39` — `text-primary-hover` → `text-ink-muted`.
8. `ExampleAnalysis.astro:64` — warning-triangle svg `text-primary-hover` → `text-gold`.
9. `SimulatorIsland.tsx:89` — selected preset `border-primary/40 bg-primary/10 text-ink` → `border-hairline-strong bg-surface-2 text-ink`.
10. `SEOContent.astro:30` — `prose-a:text-primary-hover` → `prose-a:text-ink prose-a:underline`.
11. `[slug].astro` (all 8): warning svg `text-primary-hover` → `text-gold`; related card `card card-lift p-4` → `card p-4`; `text-primary-hover` read-more → `text-ink-muted`, drop `arrow-nudge` span.
12. `how-it-works.astro:100-105` (all 8 locales): masked redaction `text-primary-hover` → `text-ink`; footer/how links `text-primary-hover hover:underline` → `text-ink underline decoration-hairline-strong underline-offset-4`; `:235` jump link same treatment.
13. Leave untouched: `.btn-primary`, `:focus-visible`, brand svg strokes, `AboutReportBox` helpline links (genuine link emphasis — allowed).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts tests/theme.test.ts`
Expected: PASS. Then run: `npm run check`
Expected: no new type errors. Spot-check `npm run dev` home + one scam page: no visual lift on hover, numbers white, no tinted cards.

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "style: restrain emerald to CTA/focus/links; remove tinted surfaces and lift"
```

---

### Task 3: Split ResultView into verdict panel + utility panel

**Files:**
- Modify: `src/components/checker/CheckerIsland.tsx:551-737`
- Test: `tests/vault-discipline.test.ts`

**Interfaces:**
- Consumes: `AnalysisResult` (`risk, headline, findings, nextSteps, similarScams, disclaimer, meta`), existing `saveHistory/loadHistory`, `generateShareCard/shareCardDataUrl`, `reportHelplines/reportUrls`, `RISK_CLASS` map — no signature changes.
- Produces: `#checker-result` verdict panel (badge + headline + evidence + next steps + ONE report box + disclaimer/meta) followed by `#checker-utility` secondary panel (similar + share + history). All existing `t("checker.result.*")` keys reused; no new copy (i18n-safe).

- [ ] **Step 1: Write the failing test**

Append to `tests/vault-discipline.test.ts`:

```ts
import { readFileSync } from "node:fs";

describe("vault discipline item 3 verdict hierarchy", () => {
  const src = () => readFileSync("src/components/checker/CheckerIsland.tsx", "utf8");
  it("verdict and utility are separate panels with one report box", () => {
    const s = src();
    expect(s).toContain('id="checker-result"');
    expect(s).toContain('id="checker-utility"');
    const goldenBoxes = (s.match(/const goldenBox|goldenBox\}/g) ?? []).length;
    expect(goldenBoxes).toBeLessThanOrEqual(2);
    // report box rendered exactly once in JSX (not {urgent && goldenBox} + {!urgent && goldenBox})
    const conditionalRenders = (s.match(/\{urgent && goldenBox\}|\{!urgent && goldenBox\}/g) ?? []).length;
    expect(conditionalRenders).toBe(0);
    expect(s).toContain("{goldenBox}");
  });
  it("demo badge is not a risk badge", () => {
    const s = src();
    expect(s).not.toContain('risk-badge risk-low">\n            <span class="risk-dot" />\n            DEMO');
  });
  it("evidence icons use vault gold, not emerald", () => {
    const s = src();
    expect(s).not.toMatch(/findings\.map[\s\S]{0,400}text-primary-hover/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — no `#checker-utility`, dual `{urgent && goldenBox}` / `{!urgent && goldenBox}` branches, DEMO in risk badge, emerald evidence icons.

- [ ] **Step 3: Write minimal implementation**

In `src/components/checker/CheckerIsland.tsx`, restructure `ResultView` return only (no logic changes):

```tsx
return (
  <>
    <div id="checker-result" class="card panel-top-edge scale-in mx-auto w-full max-w-2xl p-5 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        {demo ? (
          <span class="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-surface-2 px-3 py-1 text-xs font-medium tracking-wide text-ink-muted">
            {t("checker.result.demoTitle")}
          </span>
        ) : (
          <span class={`risk-badge ${RISK_CLASS[result.risk]}`}>
            <span class="risk-dot" />
            {RISK_LABEL[result.risk]}
          </span>
        )}
        <button onClick={onReset} class="btn btn-secondary">
          {t("checker.result.editAnother")}
        </button>
      </div>

      {demo && (
        <div role="status" class="mt-4 rounded-lg border border-hairline bg-surface-2 px-3 py-2">
          <p class="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{t("checker.result.demo")}</p>
        </div>
      )}

      <h3 ref={headingRef} tabIndex={-1} class="card-title mt-4 focus-visible:outline-none">
        {result.headline}
      </h3>

      {goldenBox}

      {result.findings.length > 0 && (
        <section class="mt-6" aria-label={t("checker.result.why")}>
          <h4 class="eyebrow">{t("checker.result.why")}</h4>
          <ul class="mt-3 space-y-4">
            {result.findings.map((f) => (
              <li key={f.id} class="flex gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="mt-1 shrink-0 text-gold" aria-hidden="true">
                  <path d="M8 1l7 13H1L8 1z" stroke="currentColor" stroke-width="1.3" />
                  <path d="M8 6v3.5M8 11.6v.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                </svg>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-ink">{f.label}</p>
                  <code class="evidence-pill mt-1.5">{f.evidence}</code>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="mt-6 border-t border-hairline pt-6" aria-label={t("checker.result.next")}>
        <h4 class="eyebrow">{t("checker.result.next")}</h4>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          {result.nextSteps.map((s) => (
            <li>{s}</li>
          ))}
        </ol>
      </section>

      <p class="mt-6 border-t border-hairline pt-4 text-caption leading-relaxed text-ink-tertiary">{result.disclaimer}</p>
    </div>

    <div id="checker-utility" class="card mx-auto mt-4 w-full max-w-2xl p-5 sm:p-8">
      {result.similarScams.length > 0 && (
        <section aria-label={t("checker.result.similar")}>
          <h4 class="eyebrow">{t("checker.result.similar")}</h4>
          <div class="mt-3 flex flex-wrap gap-2">
            {result.similarScams.map((s) => (
              <a href={s.slug} class="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-hairline-tertiary hover:text-ink">
                {s.title}
              </a>
            ))}
          </div>
        </section>
      )}

      <section class="mt-6 border-t border-hairline pt-6" aria-label={t("checker.result.share")}>
        <h4 class="eyebrow">{t("checker.result.share")}</h4>
        <p class="mt-2 text-sm leading-relaxed text-ink-muted">{t("checker.result.shareDesc")}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button onClick={doShare} disabled={shareStatus === "sharing"} class="btn btn-secondary">
            {shareStatus === "sharing" ? t("checker.result.sharing") : shareStatus === "done" ? t("checker.result.shared") : t("checker.result.shareBtn")}
          </button>
          <button onClick={doDownload} class="btn btn-secondary">{t("checker.result.download")}</button>
        </div>
        <p class="mt-2 text-caption text-ink-tertiary">{t("checker.result.shareTech")} · {result.meta.analyzerVersion}</p>
      </section>

      <section class="mt-6 border-t border-hairline pt-6" aria-label={t("checker.result.history")}>
        <div class="flex items-center justify-between gap-3">
          <h4 class="eyebrow">{t("checker.result.history")}</h4>
          <span class="rounded-full border border-hairline bg-canvas px-2.5 py-0.5 font-medium tracking-wide text-caption text-ink-tertiary">{t("checker.result.historyHint")}</span>
        </div>
        <p class="mt-2 text-caption leading-relaxed text-ink-tertiary">{t("checker.result.historyDesc")}</p>
        {history.length > 0 ? (
          <>
            <ul class="mt-3 space-y-2">
              {history.slice(0, 8).map((h) => (
                <li key={h.id} class="flex items-center justify-between gap-3 rounded-md border border-hairline bg-canvas px-3 py-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-ink">{h.headline} <span class={`ml-1.5 rounded-full border px-1.5 py-0.5 text-caption ${RISK_CLASS[h.risk] ?? "risk-low"}`}>{h.risk}</span></p>
                    <p class="truncate font-mono text-caption text-ink-tertiary">{new Date(h.timestamp).toLocaleDateString()} · {h.detectorIds.length} {t("checker.result.signals")}</p>
                  </div>
                  <button onClick={() => { removeHistory(h.id); setHistory(loadHistory()); }} aria-label={t("checker.result.deleteEntry")} class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-xl leading-none text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink">
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={handleClear} class="btn btn-secondary mt-3 !min-h-0 !px-3 !py-1.5 !text-xs">{historyCleared ? t("checker.result.cleared") : t("checker.result.clearHistory")}</button>
          </>
        ) : (
          <p class="mt-3 rounded-md border border-dashed border-hairline bg-canvas px-3 py-3 text-center text-sm text-ink-tertiary">{t("checker.result.historyEmpty")}</p>
        )}
      </section>
    </div>
  </>
);
```

Also delete the `const urgent = ...` branches: remove `{urgent && goldenBox}` before findings and `{!urgent && goldenBox}` after history; keep a single `{goldenBox}` after the headline. Remove the low-risk `seal-badge` span next to the badge (gold rationing: eyebrows/seal only, not every low verdict). Keep `goldenBox` definition, `headingRef` focus, history/share handlers unchanged.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm run check && npm test`
Expected: all green. Spot-check `npm run dev`: scan a sample → verdict panel shows badge + headline + ONE report box + evidence + steps + disclaimer; share/similar/history render below in the secondary card; DEMO uses the neutral badge.

- [ ] **Step 5: Commit**

```bash
git add src/components/checker/CheckerIsland.tsx tests/vault-discipline.test.ts
git commit -m "refactor: split result verdict from utility panel; single report box"
```

---

## Self-Review

- Spec coverage: DESIGN emerald/gold rationing → Task 1+2; no-gradients/no-spotlight → Task 1 (scan-bar, aurora) + Task 2 (tints); checker-first + explainability untouched (no analyzer edits); trust via verdict clarity → Task 3. Loading-honesty (audit item 5) is out of scope for items 1–3 — follow-up plan.
- Placeholder scan: all steps carry exact file:line targets, replacement strings, test code, run commands. No TBD/TODO.
- Type consistency: `RISK_CLASS`, `goldenBox`, `t("checker.result.*")` keys, `#checker-result` / `#checker-utility` ids used identically in tests and implementation.
