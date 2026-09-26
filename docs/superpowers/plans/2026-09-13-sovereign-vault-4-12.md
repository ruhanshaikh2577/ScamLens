# Sovereign Vault batches 2–5 Implementation Plan (audit items 4–12)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Sovereign Vault UI program: honest scan states, section rhythm, type authority, button/header/card/trust discipline, translated labels, AA contrast, and keyboard-reachable forms — with zero new translator-dependent copy.

**Architecture:** Five sequential tasks, each a mechanical, grep-gated sweep over committed HEAD (`a616678`) state: CheckerIsland scan flow first (behavioral honesty), then homepage rhythm + ticker, then type + buttons, then header + cards + trust chip, then labels + contrast + forms. No analyzer, i18n-dictionary, API, or content-collection changes.

**Tech Stack:** Astro 5, Preact islands, Tailwind 4 (Vite plugin), vitest, `astro check`.

**Spec:** UI audit 2026-09-13 (items 4–12; items 1–3 shipped on `vault-1-3-task1`), `DESIGN.md` (sovereign-vault-theme), `PRODUCT.md`. Item (3) needs no new work — verdict split shipped; its DEMO-badge + seal-badge residuals stay deferred to the dirt-owning task (the `demoTitle` key exists in 0/8 committed locales; shipping the badge now would print a raw key and violate PRODUCT i18n rules).

## Global Constraints

- Base is HEAD `a616678` on branch `vault-1-3-task1`. Do NOT create a new branch, do NOT touch `main`.
- Briefs describe COMMITTED state (`git show HEAD:<path>`). The worktree carries other-task dirt in these same files: reconcile intent-over-text (apply the vault change onto whatever is there), then stage vault hunks ONLY via explicit `git add <paths>` (whole-file add only when the file has no dirt — verify with `git diff HEAD --stat` first; otherwise hunk-level via `git add -p` or `git apply --cached`). Never `git add -A` / `git add .`.
- No new user-facing copy in any language: reuse existing `t()` keys only. Language-neutral tokens (`v0.1.1`, `%`, `→`-free, numerals) are allowed; new English words are forbidden.
- Emerald ONLY for: brand mark, primary CTA, focus ring, link emphasis. Gold ONLY for: eyebrows, seal, verified marks. No gradients, no lift/shadow cards, no press-scale.
- Privacy invariant: `redact()` before `analyze()`; never store raw input. Every detector keeps pattern + weight + evidence + step. Voice "signs of", never "proof of".
- Verify each task with `npx vitest run <files>` + full `npm test` + `npm run check`.
- Line numbers below are HEAD `a616678` anchors — re-verify each with `rg -n` before editing (prior tasks shifted neighbors).

---

### Task 1: Honest scan states (audit 5)

**Files:**
- Modify: `src/components/checker/CheckerIsland.tsx` — `scan()` text/URL path (~HEAD:167-216), `analyzeWithFallback` (~HEAD:27-41), trust-signals row (~HEAD:344-352), scanning status block (~HEAD:447+), checker root div (~HEAD:292)
- Modify: `tests/vault-discipline.test.ts` — append suite

**Interfaces:**
- Consumes: `analyze(input, kind)`, existing `t("checker.scanSteps.*")`, `t("checker.scanning")`, `t("checker.trust.*")` keys (all 8 locales verified for the four trust keys).
- Produces: `{ result, local }` serving provenance consumed by the trust row in this same task; `role="progressbar"` + `aria-busy` contract other tasks must not remove.

- [ ] **Step 1: Write the failing tests**

Append to `tests/vault-discipline.test.ts` (add `readFileSync` import if absent):

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — `const delay = 2000` present, no `role="progressbar"`, no `servedLocal`.

- [ ] **Step 3: Write minimal implementation**

3a. Provenance — change `analyzeWithFallback` to return source (internal signature only, callers updated):

```ts
async function analyzeWithFallback(input: string, kind: "message" | "url"): Promise<{ result: AnalysisResult; local: boolean }> {
  try {
    const url = typeof location !== "undefined" && location.protocol === "chrome-extension:" ? "https://scamlens.in/api/analyze" : `/api/analyze?lang=${encodeURIComponent(lang)}`;
```

Keep every line of the function body identical except: `if (res.ok) return { result: (await res.json()) as AnalysisResult, local: false };` and final `return { result: analyze(input, kind), local: true };`. Add state `const [servedLocal, setServedLocal] = useState(true);` beside the other `useState` lines. Update both callers to `const { result, local } = await analyzeWithFallback(...); setResult(result); setServedLocal(local);` (OCR path keeps its `setDemoNote(!ok)` line).

3b. Trust row — wrap ONLY the first chip + its separator in `{servedLocal && (<>...</>)}`, keeping all lines byte-identical inside:

```tsx
{servedLocal && (<><span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" /> {t("checker.trust.clientSide")}</span>
<span class="text-hairline-strong" aria-hidden="true">·</span></>)}
```

3c. Honest timing — replace the whole `const delay = 2000;` … `}, delay);` text-path block with immediate execution plus a 150ms debounce before showing the stepped UI (prevents flash on instant local results; slow network genuinely shows progress):

```ts
    // No fixed delay: analysis runs immediately. The stepped UI below
    // appears only if the round-trip is slow enough to need it (>150ms).
    setPhase("scanning");
    setStatusLine(0);
    setProgress(8);
    setDemoNote(false);
    let settled = false;
    const showTimer = setTimeout(() => { if (!settled) setShowScanUi(true); }, 150);
    try {
      const input = tab === "text" ? text : url;
      const kind = tab === "link" || (tab === "text" && looksLikeUrl(text)) ? "url" : "message";
      const { result, local } = await analyzeWithFallback(input, kind);
      setResult(result);
      setServedLocal(local);
      setProgress(100);
      setStatusLine(SCAN_STEPS.length - 1);
      setPhase("done");
    } finally {
      settled = true;
      clearTimeout(showTimer);
    }
```

Add state `const [showScanUi, setShowScanUi] = useState(false);` and reset it (`setShowScanUi(false)`) wherever `setPhase("scanning")` is set (both paths) and in `reset()`. Gate the stepped block: `{phase === "scanning" && showScanUi && (<div class="mt-5" role="status" aria-live="polite">` — rest of block unchanged. Delete the `tick`/`bar` intervals entirely. OCR path keeps its recognizer-driven progress untouched.

3d. Semantics — checker root div (~HEAD:292 `id="checker"`) gains `aria-busy={phase === "scanning"}`; scan-bar div gains `role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={t("checker.scanning")}`; inside `scan-bar-fill`'s parent add `<span class="sr-only">{progress}%</span>` (numerals + `%` are language-neutral, no new copy).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm test && npm run check`
Expected: all green. Spot-check `npm run dev`: text scan resolves near-instantly with no stepped flash; throttle network to Slow-4G → stepped UI with % appears; block `/api/*` → result still lands and CLIENT-SIDE chip shows.

- [ ] **Step 5: Commit**

```bash
git add src/components/checker/CheckerIsland.tsx tests/vault-discipline.test.ts
git commit -m "feat: honest scan states — immediate resolve, debounced progress, served-local chip"
```

(If the CheckerIsland hunks carry worktree dirt, fall back to hunk-level staging per Global Constraints; the commit must contain only the 3a–3d hunks + tests.)

---

### Task 2: Section rhythm + static ticker (audit 4, marquee leftover)

**Files:**
- Modify: `src/components/HowItWorks.astro:30`, `src/components/WhatWeDetect.astro:85`, `src/components/ExampleAnalysis.astro:38` — section class `py-24` → `py-20` (tier A, story)
- Modify: `src/components/ScamLibraryGrid.astro:44`, `src/components/SafetyTips.astro:22`, `src/components/FAQ.astro:26` — section class `py-24` → `py-16` (tier B, dense)
- Modify: `src/components/StatsBand.astro:28` — `py-20 sm:py-24` → `py-16 sm:py-20`
- Modify: `src/components/SEOContent.astro:8` — `py-20` → `py-16` (tier B; already the outlier, now deliberate)
- Modify: `src/components/Ticker.astro` — marquee → static wrap (~HEAD:18-19 + `loop` const)
- Modify: `src/styles/global.css` — delete `.marquee` system (locate via `rg -n marquee`)
- Modify: `tests/vault-discipline.test.ts` — append suite

**Interfaces:**
- Consumes: static `.card` (Task 1-3 plan), tier classes are pure Tailwind (no new CSS).
- Produces: marquee-free CSS consumed by Task 3–5 (no test may assert marquee presence); section-tier convention (A story `py-20`, B dense `py-16`) later tasks must preserve.

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — sections still `py-24`, marquee + `loop` present.

- [ ] **Step 3: Write minimal implementation**

Section tiers: in each listed section tag change ONLY the `py-*` token(s), keeping borders/padding/max-width byte-identical. CTA (`CTA.astro`) and Hero stay untouched.

Ticker: replace the section open + track div (keep any label/heading line byte-identical — do not touch copy, it is pre-existing English-only debt owned by the i18n task):

```astro
<section aria-label="Trending scam patterns" class="border-y border-hairline bg-surface-1/60 px-4 py-4 sm:px-6">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
    {items.map((it) => (
      <a href={it.href} class="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink">
        <span class="h-1.5 w-1.5 rounded-full bg-primary-hover" aria-hidden="true"></span>{it.label}
      </a>
    ))}
  </div>
</section>
```

(If the committed label line differs — e.g. a "Trending:" span — keep that line byte-identical inside the new wrap div. Dots stay `bg-primary-hover`: solid-badge residuals are explicitly deferred, not this task.) Delete `const loop = [...items, ...items];` and the duplicated `aria-hidden`/`tabindex`/`pointer-events-none` second-half attrs (they existed only for the loop). CSS: delete the `.marquee` block, `.marquee-track` rules + hover/focus pause, `@keyframes marquee`, and the reduced-motion `.marquee-track` override (Task 1's fix restored them — locate each via `rg -n marquee src/styles/global.css`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm test && npm run check`
Expected: all green. Spot-check home at 360px: ticker wraps without horizontal scroll; sections breathe tighter.

- [ ] **Step 5: Commit**

```bash
git add src/components/HowItWorks.astro src/components/WhatWeDetect.astro src/components/ExampleAnalysis.astro src/components/ScamLibraryGrid.astro src/components/SafetyTips.astro src/components/FAQ.astro src/components/SEOContent.astro src/components/StatsBand.astro src/components/Ticker.astro src/styles/global.css tests/vault-discipline.test.ts
git commit -m "style: tiered section rhythm; static ticker, marquee removed"
```

---

### Task 3: Type authority + button hierarchy (audit 6, 7-buttons)

**Files:**
- Modify: `src/styles/global.css` — `.card-title` serif; delete `.btn:active` scale
- Modify: `src/components/SEOContent.astro` (3 CTAs), `src/components/SafetyTips.astro` (view-all only; print button stays), `src/components/ScamLibraryGrid.astro` (browse-all), `src/components/WhatWeDetect.astro` (view-all), `src/components/HowItWorks.astro` (methodology)
- Modify: `tests/vault-discipline.test.ts` — append suite

**Interfaces:**
- Consumes: tier classes from Task 2 (untouched); `.btn-primary` reserved for Scan / Check-Now / CTA-band.
- Produces: quiet-link pattern (`underline decoration-hairline-strong underline-offset-4`) Task 4 reuses for nothing new; serif card titles Task 4–5 must not override.

- [ ] **Step 1: Write the failing tests**

```ts
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
```

(SafetyTips keeps exactly one `btn btn-secondary`: the print action. Step 0 below reconciles counts.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — card-title sans, scale present, secondaries present.

- [ ] **Step 3: Write minimal implementation**

Step 0 (do first): `rg -c "btn btn-secondary" src/components/SEOContent.astro src/components/SafetyTips.astro src/components/ScamLibraryGrid.astro src/components/WhatWeDetect.astro src/components/HowItWorks.astro`. Expected counts: SEOContent 3, SafetyTips 2 (print + view-all), others 1 each. If a count differs (worktree dirt), apply this decision rule and report actuals: demote ONLY navigational anchors (methodology / what-we-detect / library / view-all / browse-all — copy keys `seoContent.btn.*`, `safety.all`, library browse-all, `what.cta.all`); keep action buttons (print, scan, share/download) untouched.

CSS: `.card-title` gains `font-family: var(--font-display);` as its first declaration (Fraunces 500 is in the loaded 500–700 range per DESIGN.md). Delete the whole `.btn:active { transform: scale(0.98); }` rule.

CTA swap (copy keys byte-identical, class only): each navigational `<a ... class="btn btn-secondary...">` becomes `<a ... class="text-sm font-medium text-ink underline decoration-hairline-strong underline-offset-4 hover:text-primary-hover">` (hover emerald = link emphasis, allowed; keep any `data-reveal`/wrapping divs untouched).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm test && npm run check`
Expected: all green. Spot-check: verdict headlines + library titles render serif; print button still secondary; no press-scale anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/SEOContent.astro src/components/SafetyTips.astro src/components/ScamLibraryGrid.astro src/components/WhatWeDetect.astro src/components/HowItWorks.astro tests/vault-discipline.test.ts
git commit -m "style: serif card titles; quiet navigational links; no press-scale"
```

---

### Task 4: Header reachability + card token + trust chip (audit 7-header, 8, 9)

**Files:**
- Modify: `src/layouts/Layout.astro` — icon-only Report link for `<sm` (after ~HEAD:148 existing Report link)
- Modify: `src/styles/global.css` — add `.status-badge` token
- Modify: `src/components/ScamLibraryGrid.astro` + 8 locale detail pages (`src/pages/scams/[slug].astro`, `es/estafas/[slug].astro`, `fr/arnaques/[slug].astro`, `de/betrugsmaschen/[slug].astro`, `pt-br/golpes/[slug].astro`, `it/truffe/[slug].astro`, `ja/scams/[slug].astro`, `ko/scams/[slug].astro`) — use the token
- Modify: `src/components/checker/CheckerIsland.tsx` — `VERSION` import + chip in trust row (Task 1's row, anchor on `checker.trust.notStored`)
- Modify: `tests/vault-discipline.test.ts` — append suite

**Interfaces:**
- Consumes: quiet-link pattern + serif titles from Task 3; trust row (with `servedLocal` conditional) from Task 1 — chip goes INSIDE the always-rendered part of the row, after the `notStored` chip.
- Produces: `.status-badge` token; mobile Report pattern. (Mobile two-row height is explicitly NOT changed: 44px touch targets outrank chrome slimming — documented deferral, no test.)

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — no `sm:hidden` report, no token, utility chains present, no version chip.

- [ ] **Step 3: Write minimal implementation**

Report icon (no new copy — `t("nav.report")` already labels it): immediately after the existing Report `<a>`, insert:

```astro
<a href={reportUrls[lang] ?? reportUrls.en} target="_blank" rel="noopener noreferrer" aria-label={t("nav.report")} title={t("nav.report")} class="btn btn-secondary sm:hidden !px-3">
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7.5 8.5"/></svg>
</a>
```

Token (matches current visual output so pages do not shift — DESIGN `status-badge`):

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background-color: var(--color-surface-2);
  color: var(--color-ink-muted);
  font-size: 12px;
  line-height: 1.4;
  padding: 2px 8px;
  border: 1px solid var(--color-hairline);
}
```

Place directly after the `.risk-badge` block (anchor via `rg -n "risk-badge"`). Swap usages (rg-verify each exact string at HEAD first; dirt may vary — same decision rule as Task 3): library `status-badge w-fit rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-muted` → `status-badge w-fit`; slug pages `status-badge rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-muted` → `status-badge`.

Version chip (language-neutral `v0.1.1`, no new copy): add `import { VERSION } from "../../lib/version";` to CheckerIsland imports; in the trust row after the `notStored` chip insert `<span class="text-hairline-strong" aria-hidden="true">·</span><span>v{VERSION}</span>` — inside the always-rendered part (after Task 1's conditional block), so it shows regardless of serving source.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm test && npm run check`
Expected: all green. Spot-check 360px: Report icon visible in header; tags visually unchanged; trust row ends `· v0.1.1`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/styles/global.css src/components/ScamLibraryGrid.astro "src/pages/scams/[slug].astro" "src/pages/es/estafas/[slug].astro" "src/pages/fr/arnaques/[slug].astro" "src/pages/de/betrugsmaschen/[slug].astro" "src/pages/pt-br/golpes/[slug].astro" "src/pages/it/truffe/[slug].astro" "src/pages/ja/scams/[slug].astro" "src/pages/ko/scams/[slug].astro" src/components/checker/CheckerIsland.tsx tests/vault-discipline.test.ts
git commit -m "feat: mobile report action, status-badge token, analyzer version chip"
```

---

### Task 5: Translated labels, AA contrast, keyboard forms (audit 10, 11, 12)

**Files:**
- Modify: `src/layouts/Layout.astro` — theme-toggle inline script (remove English `label()` relabeling)
- Modify: `src/styles/global.css` — tertiary tokens ×3, error tokens + wiring, `.form-error` rule
- Modify: `src/components/checker/CheckerIsland.tsx` — fileError class (~HEAD:433), link input (~HEAD:373), file input (~HEAD:413) + dropzone label (~HEAD:386)
- Modify: `tests/vault-discipline.test.ts` — append suite

**Interfaces:**
- Consumes: everything above; touches Layout script (disjoint from Task 4's header markup) and CheckerIsland inputs (disjoint from Task 1's scan flow and Task 4's trust row).
- Produces: nothing downstream (last task). Leaves: toggle-state labeling (needs `a11y.theme.light/dark` × 8 — owner: i18n task), Ticker English copy (owner: i18n task), DESIGN.md light-mode line reconciliation (owner: design follow-up — light mode STAYS: committed tests enshrine its tokens and it is a shipped user preference; removal would be destructive).

- [ ] **Step 1: Write the failing tests**

```ts
describe("vault labels/contrast/forms", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("no hardcoded English theme labels in layout script", () => {
    const s = read("src/layouts/Layout.astro");
    expect(s).not.toContain("click to change");
    expect(s).toContain('aria-label={t("a11y.theme.system")}');
  });
  it("tertiary text meets AA in both modes", () => {
    const c = read("src/styles/global.css");
    expect(c).toContain("--color-ink-tertiary: #79879E;");
    expect(c).toContain("--light-ink-tertiary: #616C82;");
  });
  it("errors read as errors", () => {
    const c = read("src/styles/global.css");
    expect(c).toContain("--color-error: #F87171;");
    expect(c).toContain("--light-error: #B91C1C;");
    expect(c).toContain(".form-error");
    expect(read("src/components/checker/CheckerIsland.tsx")).toContain("form-error");
  });
  it("link input uses URL keyboard; upload reachable by keyboard", () => {
    const s = read("src/components/checker/CheckerIsland.tsx");
    expect(s).toContain('inputmode="url"');
    expect(s).not.toContain('class="hidden"');
    expect(s).toContain("focus-within:");
  });
});
```

(Rationale recorded in-plan: `type="text"` stays — native `type="url"` validation would fight the checker's custom hints. Split live regions stay — hint and scan statuses are phase-mutually-exclusive, the audit flag was a false positive.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: FAIL — English label JS present, old tertiary values, no error tokens, no inputmode, hidden input.

- [ ] **Step 3: Write minimal implementation**

Labels: in Layout's theme script delete the `const label = (v) => ...` line and the two relabel lines (`btn.setAttribute("aria-label", label(v));` + `btn.title = label(v);`) inside `sync()` — keep icon swap + `meta[name="theme-color"]` update. Effect: the button permanently carries its server-rendered translated label instead of being overwritten with English after the first click. (Full state-aware labeling needs translator-owned `a11y.theme.light/dark` keys — explicitly not this task.)

Contrast (ratios verified: dark `#79879E`/canvas 5.42, light `#616C82`/paper 5.01; error `#F87171`/canvas 7.12, `#B91C1C`/white 6.47; values coincide with DESIGN `semantic-error`/`semantic-error-strong` — sourced from spec, not from any uncommitted work): `:root --color-ink-tertiary: #5F6B80;` → `#79879E;`, `html.dark` same token → `#79879E;`, `--light-ink-tertiary: #7A879C;` → `#616C82;`. Add `--color-error: #F87171;` to `:root` (after `--color-success`), `--light-error: #B91C1C;` to light vars, and mirror the tertiary wiring lines (`--color-error: var(--light-error);` in both the `prefers-color-scheme: light` media block and `html.light`). Add `.form-error { color: var(--color-error); }` immediately after the `.seal-ring` rule. CheckerIsland fileError paragraph: `text-primary-hover` → `form-error` (class token only — an emerald error on a security product is the bug).

Forms: link `<input>` gains `inputmode="url"` (attribute order: after `type="text"`); file `<input class="hidden">` → `<input class="sr-only">` (stays label-activated and becomes Tab-reachable with its translated `aria-label`); dropzone `<label>` static class string gains ` focus-within:border-hairline-strong focus-within:outline-2 focus-within:outline-primary-focus/50` (mirrors the established textarea focus pattern).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/vault-discipline.test.ts`
Expected: PASS. Then run: `npm test && npm run check`
Expected: all green. Spot-check: cycle theme twice on `/es/` — toggle label never turns English; upload reachable via Tab with visible ring; link field summons URL keyboard on mobile; file-type error renders red in both modes.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/styles/global.css src/components/checker/CheckerIsland.tsx tests/vault-discipline.test.ts
git commit -m "fix: translated toggle labels, AA tertiary, error tokens, keyboard forms"
```

---

## Self-Review

**1. Spec coverage:** audit 5 → Task 1 (fake delay, progressbar %, busy, silent-fallback chip; demo-badge stays deferred per 0/8-key block). Audit 4 → Task 2 (two-tier rhythm + static ticker; locale-page spacing untouched — English/homepage scope only, noted). Audit 6 → Task 3 (serif card titles; display-scale untouched — deliberately out of scope, no test). Audit 7 → Tasks 3 (secondaries) + 4 (Report icon; two-row height explicitly deferred — 44px touch rule outranks). Audit 8 → Task 4 (token + usages; lift already dead). Audit 9 → Task 4 (version chip; seal/stats/prose already vault-clean at HEAD). Audit 10 → Task 5 (toggle relabel removal; Ticker copy + state-aware labels deferred to i18n owners). Audit 11 → Task 5 (tertiary AA both modes, error system; link-green measured PASS 5.23/4.89 — no change; light mode KEPT with test-backed rationale). Audit 12 → Task 5 (inputmode, sr-only upload + focus ring, error class; live-region flag rebutted with phase evidence). Micro-interactions → Tasks 2 (marquee) + 3 (press-scale); reveals/transition leftovers stay (progressive-enhancement, reduced-motion-safe).

**2. Placeholder scan:** no TBD/TODO/"similar to"; every step carries exact strings, counts with a dirt-reconciliation rule, run commands with expected outputs. "Spot-check" lines are manual verification with concrete viewports/states, not deliverables.

**3. Type consistency:** `servedLocal` boolean state + `{ result, local }` return used identically in Task 1 steps/test; `v{VERSION}` + `lib/version` import match in Task 4 steps/test; tier tokens `py-20`/`py-16` identical across Task 2 steps/test/files; quiet-link class string identical in Task 3 steps/test; token values `#79879E`/`#616C82`/`#F87171`/`#B91C1C` identical in Task 5 steps/test. `showScanUi` set/reset sites enumerated (both scan paths + `reset()`).
