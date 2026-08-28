# ScamLens — Scale, Credibility, Interactive v1 Design

**Date:** 2026-08-28  
**Status:** Draft — awaiting review  
**Stack:** Astro 5 static + Preact islands + Tailwind 4 + `src/lib/analyzer.ts:373` canonical + Cloudflare Pages + Pages Functions + KV  
**Version baseline:** `package.json:5` `0.1.0` → `0.1.1` if additive

---

## 1. Overview

Scale ScamLens from a single-page static checker (16 `src/content/scams/*.md`) to a distribution-ready, verifiably trustworthy system without migrating off Astro or introducing a full backend/platform. Core principle: **Explain → Verify → Decide**, not Score → Trust. v1 keeps the static site as product core; Workers are an adapter layer.

---

## 2. Goals / Non-Goals

**Goals (ranked from user):**
- D: traffic + coverage + product scale, prioritized in that order
- Credibility A > C > B: explainability/provenance > visual polish > institutional endorsement
- Distribution A > B > C: where scams arrive (WA/Telegram/extension) > crowd report → library > API
- Interactivity A > B > C: learn-by-doing (quiz/simulator) > personal utility (share/history) > social proof (secondary)

**Non-Goals v1 (explicit skip, add when proven need):**
- No D1 (KV-only), no Next.js migration, no full DB/platform, no auth/accounts, no ML/black-box, no cloud-synced history, no auto-publish of reports, no rule auto-tuning, no hard-coded free-tier limit claims.

---

## 3. v1 Architecture (confirmed)

```
Astro static (src/pages/*, src/components/*, CheckerIsland.tsx:59)
  → Cloudflare Pages + CDN (site: https://scamlens.in astro.config.mjs:7)
  → Pages Functions (one Worker layer):
      POST /api/analyze  → validate → redact → analyze() → meta → AnalysisResult
      POST /api/report   → validate kind+10k → redact → hash → KV reports:<id>
      POST /webhook/whatsapp , /webhook/telegram → verify → validate → redact → analyze() → reply
  → KV (reports:<id>, counters)  — D1 explicitly not in v1
  → Git: src/content/scams/*.md (authoritative, reviewed)
  → manual: KV → PR → merge → Pages rebuild
```

*Static scales via CDN caching; dynamic Worker/KV/third-party messaging workloads are subject to active Cloudflare/messaging-provider plan limits/quotas. Verify current limits before deployment — do not embed free-tier numbers in copy.*

- `src/lib/analyzer.ts` is canonical. No duplicated rule sets across website/API/bot/extension.
- `src/lib/redact.ts` (`redact()`) is mandatory privacy boundary before any persistence.
- WA/Telegram adapters call `analyze()` directly, not via internal `fetch /api/analyze`.

**Files new:** `functions/api/analyze.ts`, `functions/api/report.ts`, `functions/webhook/whatsapp.ts`, `functions/webhook/telegram.ts` (each <80 lines). **Modified:** `src/lib/analyzer.ts`, `src/pages/how-it-works.astro`, `src/content.config.ts`, `src/components/Hero.astro:5` (already `overflow-hidden`), `src/layouts/Layout.astro:145`.

---

## 4. Credibility Hardening (Section 2)

### 4.1 AnalysisResult provenance — additive, non-breaking
Extend `src/lib/analyzer.ts:16-23`:
```ts
export interface AnalysisResult {
  risk, headline, findings, nextSteps, similarScams, disclaimer,
  meta: {
    analyzerVersion: string // from package.json / build-time define
    timestamp: string // ISO
    detectorIds: string[] // e.g. ["payment-request","url-shortener"]
    sources: Array<{label:string, href:string}> // per finding/official
  }
}
```
Generated inside `analyze()` (`analyzer.ts:373`), not assembled by UI. Keep `risk/headline/findings/nextSteps/disclaimer` unchanged. Bump `package.json:5` to `0.1.1` only if additive/compatible and ensure displayed version equals runtime.

### 4.2 Methodology / How It Works (`src/pages/how-it-works.astro:38-114`)
Extend existing 4 steps + redaction demo to include:
- What is detected (DETECTORS:60 message + urlFindings:279 URL)
- Detector library table: id, label, purpose, example
- How weights map to risk (`riskFor:359` thresholds 2/5/8) without exposing evadable internals
- URL analysis specifics (shortener `SHORTENERS:55`, punycode, IP, APK, TLD `HIGH_ABUSE_TLDS:277`, @-trick, brand mismatch `BRANDS:223`)
- Redaction/privacy flow
- Analyzer version + last methodology/content update date
- **Limitations section (required):** rule-based, language-pattern only, false negatives/positives, low-risk ≠ safe, not a recovery service, not affiliated with banks/gov. Use language: “ScamLens identifies signals associated with known scam patterns. A low-risk result does not mean something is safe.” Avoid certainty marketing.

### 4.3 Per-finding provenance
Each `Finding` (`analyzer.ts:6`) already surfaces `id/label/evidence`; add/expose links:
- `id`, detector name, `evidence` (`evidenceAround:242`), explanation/step (`Detector.step`), `similarScams:38-53`, library slug (`/scams/*`), official source link (cybercrime.gov.in/1930 as *reference*, not endorsement). Do not imply I4C/government review/endorsement/partnership.

### 4.4 Content provenance
`src/content.config.ts:6` schema extended:
```ts
lastUpdated: z.coerce.date().optional()
sources: z.array(z.object({label:z.string(), href:z.string().url()})).default([])
status: z.enum(["draft","reviewed"]).default("reviewed")
```
Publishing: `untrusted report → KV → manual review → PR → merge → published`. No auto-publish.

### 4.5 Versioning & Copy
Increment only if additive. Displayed version from same `analyze()` build. No lavender as section fill, no second accent (`DESIGN.md:482-498` constraints).

### 4.6 Polish (C, no scope creep)
- `Hero.astro:5` already `relative overflow-hidden` (fixes aurora `global.css:292 inset -35% -10%` bleed)
- `Layout.astro:145` footer `px-8 → px-4 sm:px-6` (align with sections)
- Keep `global.css` ladder; evidence remains `word-break:break-word`.

**Acceptance — user viewing any verdict can answer:**
1. What did it detect? 2. Why? 3. Which detector/rule? 4. What evidence? 5. Where to verify? 6. Which analyzer version? 7. What does it NOT guarantee?

---

## 5. Coverage Scale: Reports → Reviewed Library (Section 3)

**Flow** `CheckerIsland:370` → `POST /api/report` → validate → redact → KV:

*Validation (server enforces same as client):*
- `kind` allowlist: `["message","url"]` (or `["text","image","link"]` normalized to message/url) — reject otherwise 400
- Input 10k char limit server-side (mirror `CheckerIsland.tsx:104` slice) — 413 if exceeded
- Empty/malformed payloads → 400

*Privacy:*
- `redact()` before any `KV.put`; never persist raw input
- Store minimal KV value:
```ts
{
  id: crypto.randomUUID(),
  kind: "message"|"url",
  redactedInput: string, // post-redact, possibly truncated evidence snippet
  detectorIds: string[],
  analyzerVersion: string,
  timestamp: string
}
```

*Trust:*
- No auto-publish, no auto rule mutation. Every report `untrusted`.
- Reviewed content → `src/content/scams/*.md` with `lastUpdated/sources/status`.
- KV-only v1. D1 only if real usage proves need for trend queries/analytics.

*StatsBand (`StatsBand.astro:29`):*
- KV counters allowed but define meaning (e.g., `reports:received` ≠ `reports:reviewed`). Do not display “report count” unless defined and spam/dup/reject-robust.

---

## 6. Distribution: A > B > C (Section 4)

### 6.1 `POST /api/analyze`
- `POST {input:string, kind:"message"|"url"}` (normalize legacy `text`→`message`, `link`→`url`)
- Validate (as above) → `redact` where appropriate (message path) → `analyze(redacted, kind)` → attach `meta` → return same `AnalysisResult` shape as client.
- Errors: 400 malformed/unsupported kind/empty, 413 oversized, 500 analyzer failure.

### 6.2 WhatsApp / Telegram adapters
- `verify webhook` (WA `hub.verify_token` / Telegram secret header) → `validate` → `redact` → `analyze()` → reply template:
  - `risk/headline` + 1-2 evidence lines + 1 nextStep + `Verify: https://scamlens.in/how-it-works` + disclaimer
- No sessions/accounts/cloud history. Log only anonymized operational data (id, kind, risk, ts). Do not retain full messages for analytics. No implied endorsement by WA/Telegram/I4C/cybercrime.gov.in.

### 6.3 Extension v1
- Reuse `src/standalone-checker.tsx` / `ResultView:417` — call `/api/analyze`, render identical structure. No second UI. No auth/cloud history.

### 6.4 Limits copy
Use: “Static traffic scales through Cloudflare’s CDN. Dynamic Worker, KV, and third-party messaging workloads are subject to the limits and quotas of the active Cloudflare and messaging-provider plans.” Verify current limits on target account before deploy.

---

## 7. Interactivity: A > B > C (Section 5)

### 7.1 A — Learn by doing (static, no backend)
- `src/components/QuizIsland.tsx` (Preact island): ~5 scenarios (curated from `analyzer.test.ts` patterns: courier Rs99, OTP, family emergency, electricity, investment). Each answer immediately shows: signal present, why it matters, which detector (`DETECTORS:60` id/label), correct answer rationale. Reuse detector definitions/weights for selection but **do not surface numeric weights evadably** (show label/step, not `weight:4`).
- `src/components/SimulatorIsland.tsx`: interactive reply — user chooses next message, coached via `nextSteps`.
- Placement: `/what-we-detect` and `/safety-tips`. Full client/static.

### 7.2 B — Personal utility (local-only)
- Shareable `ResultView` card: `canvas` generation (2x, `var(--color-canvas)` bg, risk badge, headline, 1-2 evidence pills truncated, verify link `scamlens.in/how-it-works`, disclaimer). Do not embed raw private input by default; use evidence summary.
- `navigator.share` where supported, else download PNG.
- `localStorage` scan history (array of `{id, meta, risk, ts}` redacted). Label “Stored locally on this device.” No cloud sync.

### 7.3 C — Social proof (secondary, honest)
- Ticker (`Ticker.astro:18 marquee`) and stats only if real, defined, anonymized, dup/spam-robust. Do not manufacture urgency. If no reliable signal, omit.

### 7.4 Polish (from §4)
- Hero overflow-hidden ✓, footer spacing, limitations section, consistent ResultView across surfaces, “low risk does not mean safe”.

---

## 8. Data Flow & Error Handling

- **Canonical path:** input → `redact()` → `analyze()` → `meta` attach → respond.
- **Failures:** malformed/empty/oversized → 4xx with `error.code`; analyzer throw → 500 `ANALYZER_ERROR`; KV write fail → 503 + retry hint; webhook verify fail → 401; provider API fail → log anonymized + user-facing “try again” with verify link; no stack leak.
- **Privacy:** redaction before persist is invariant; raw input never written. Hash optional for dedup.

---

## 9. Testing (Section 5 Testing reqs + Section 2 provenance)

- `vitest` `analyzer.test.ts` add: `meta.analyzerVersion/timestamp/detectorIds` present; version equals `package.json:5`.
- `functions/api/report.test.ts`: validate allowlist, 10k limit, redaction before KV (mock KV), repeated reports produce distinct ids, rejected not counted.
- `functions/api/analyze.test.ts`: 200 for message/url, equivalence test: same deterministic input → client `analyze()` and API `analyze()` produce same `risk/detectorIds` + `meta.version`.
- `functions/webhook/whatsapp.test.ts`: signature failure 401, malformed 400, provider mock fetch success/failure.
- `astro check` + existing suite `analyzer.test.ts:12` pass.
- Manual 320px viewport (`document.documentElement.scrollWidth===clientWidth`) on `/`, `/what-we-detect`, `/scams` — page-level scroll 0 while `nav#theme-toggle` and mobile `overflow-x-auto` nav still scroll internally.
- Redaction proof: `redact("OTP 492813 … 9876543210")` → output not containing raw numbers before analyzer.

---

## 10. Rollout (independent, testable stages)

**Week 1 — Credibility hardening** (no edge): `meta` field, how-it-works methodology+limitations, per-finding provenance links, content `lastUpdated/sources/status`, Hero+footer polish. Deploy static only.

**Week 2 — Coverage pipeline:** `POST /api/report` + KV + validation/redaction + manual review PR template + basic counters (defined). Feature behind no UI until Week 3.

**Week 3 — Distribution:** `POST /api/analyze` + extension calling it + WA/Telegram adapters behind feature flags (`WEBHOOK_ENABLED`), provider error handling, equivalence tests green.

**Final — Interactivity:** Quiz/Simulator islands, local history, shareable card (canvas + navigator.share fallback). All static/client.

Each stage independently deployable; edge never destabilizes static checker (adapter layer only).

---

## 11. Decisions & Trade-offs

- KV-only over D1: minimal ops, sufficient for lightweight counters; D1 adds migration/ops cost prematurely.
- Reuse `analyze()` over new ML: explainability > black-box, fits A>C>B.
- Local history over cloud: privacy + zero auth, matches scamlens.in “nothing leaves device” promise (`README.md:5`).

---

## 12. Acceptance Checklist (v1 done)

- [ ] `AnalysisResult.meta` additive, version = `package.json:5`, 7 provenance questions answerable
- [ ] `/how-it-works` methodology + limitations explicit, “low-risk ≠ safe”
- [ ] `content.config.ts` extended, reports → PR → merge flow documented, no auto-publish
- [ ] `/api/report` validates kind+10k, redacts before KV, stores minimal metadata
- [ ] `/api/analyze` returns same structure as client (equivalence test)
- [ ] WA/Telegram verify → redact → analyze → reply, no session, anonymized log only
- [ ] Extension reuses ResultView, calls `/api/analyze`
- [ ] Quiz 5 scenarios + Simulator, static, no weight evasion
- [ ] Share card + localStorage history (labeled), no raw input in share
- [ ] Hero overflow-hidden + footer spacing + `astro check` + 320px no horizontal scroll
- [ ] Copy: no hard-coded free-tier numbers, no implied endorsements

---

*Ponytail note — skipped: D1, auth, ML, cloud history, auto-publish, per-account locks, D1 analytics — add when KV/tier limits or usage data measurably prove need.*
