# AGENTS.md

Astro 5 static site + Preact islands + Tailwind 4 (Vite plugin) + `tesseract.js` (on-device OCR). NOT currently deployed (personal project); `scamlens.in` is referenced in copy only. Node 18+.

## Commands

```bash
npm install
npm run dev      # astro dev --open → http://localhost:4321 (auto-opens browser)
npm run build    # → dist/ (any static host)
npm run preview  # preview production build
npm run check    # astro check — run before claiming done
npm test         # vitest run (all)
npx vitest run <path>  # single test, e.g. npx vitest run src/lib/analyzer.test.ts
npm run build:single   # astro build + node scripts/build-standalone.mjs → dist/ScamLens-standalone.html
node scripts/audit-i18n.mjs  # i18n coverage + readiness truth
```

No linter/formatter config, no pre-commit hooks, no CI workflows. Verify with `npm run check` + `npm test`.

Tests live in **two places**: `src/lib/*.test.ts` (analyzer, corpus, detector-negatives) and `tests/*.test.ts` (api.analyze, api.report, redact.edge, theme, validate, webhook). Both are picked up by `vitest run`.

## Architecture

- **Core engine**: `src/lib/analyzer.ts` — `DETECTORS` (regex + weight + step) + `urlFindings()` + `analyze(input, kind)` entry. `VERSION` lives in `src/lib/version.ts` (currently `0.1.1`); keep `package.json`, `extension/manifest.json`, analyzer `meta` in sync when bumping.
- **Privacy invariant**: always `redact()` (`src/lib/redact.ts`) **before** `analyze()`; server/KV stores redacted input only, never raw. `functions/_shared/validate.ts` enforces kind allowlist (`message`/`url`; legacy `text`→`message`, `link`→`url`) + 10k char limit.
- **UI**: `src/components/checker/CheckerIsland.tsx` + `ResultView` is the checker; `QuizIsland`/`SimulatorIsland` on `/what-we-detect` & `/safety-tips` (weights hidden). Share card via `src/lib/shareCard.ts`; history key `scamlens:history`, always labeled "Stored locally on this device".
- **Content**: scam entries in `src/content/scams/*.md`, schema in `src/content.config.ts` (`status`, `sources`, `lastUpdated` feed methodology tables on `/how-it-works`).
- **Distribution (Cloudflare Pages Functions, KV-only; static core stays intact)**: `functions/api/analyze.ts` returns same `AnalysisResult`+`meta` as client; `functions/api/report.ts` writes `reports:<id>`; `functions/webhook/{whatsapp,telegram}.ts` verify token then call `analyze()` **directly** (never fetch) with anonymized KV log, no sessions. Extension (`extension/`) reuses `CheckerIsland`+`ResultView` via `src/standalone-checker.tsx` → `fetch /api/analyze` with local fallback.
- **Standalone build** (`scripts/build-standalone.mjs`): expects `dist/index.html` from `astro build` first; inlines CSS + Inter latin woff2 (hash resolved dynamically) and swaps `<astro-island>` for `#checker-mount` + bundled checker JS.

## i18n — easy to break, read before touching

8 locales: `en es fr de pt-br it ja ko`. Sources of truth:

- `src/i18n/ui.ts` — route slugs + `hreflangMap`.
- `src/i18n/readiness.ts` — `ready` gate: non-ready locales stay `noindex`.
- `src/i18n/scamReadiness.ts` — per-slug indexability gate. **Keep slug lists as inline literals inside `new Set([...])`** — `scripts/audit-i18n.mjs` parses this file with regex and cannot follow shared consts.
- `src/i18n/utils.ts` — `useTranslations`, `translatePath`, `getHreflangUrls`, `getCanonicalUrl`.
- `src/lib/analyzer-i18n.ts` + `src/i18n/translations/` — checker strings; **never ship English-only strings in the checker path**.

`astro.config.mjs` sitemap `filter`/`serialize` duplicates the `ready` + `scamReady` logic — keep the three in sync (`astro.config.mjs`, `readiness.ts`/`scamReadiness.ts`, `utils.ts:114`).

## Conventions & gotchas

- **Contributing rule** (from README): keep the analyzer explainable — every detector must have pattern + weight + evidence snippet + actionable step. Voice: "signs of", never "proof of"; always route to official-channel verification. Decision support, not a guarantee.
- `src/lib/redact.ts` 6-digit `\b\d{6}\b` → `******` is **intentionally broad** (OTP coverage wins over price masking); do not narrow without checking `tests/redact.edge.test.ts`.
- `DESIGN.md` (`sovereign-vault-theme`) is the visual authority: dark navy canvas, emerald only for brand mark/primary CTA/focus/link, gold only for eyebrows/seal/verified marks. No gradients, no spotlight cards, no light-mode marketing pages.
- `PRODUCT.md` is the product authority (positioning, constraints, terminology: detector / evidence snippet / next step / risk `low→critical` / `AnalysisResult.meta`).
