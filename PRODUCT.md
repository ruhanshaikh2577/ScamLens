# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: everyday people (“General public verify”) in the moment of doubt after receiving a suspicious message, URL, or screenshot. Job: decide quickly whether to ignore, verify via official channels, or act — before clicking, paying, scanning, or sharing OTP/PIN/CVV.

Includes India-heavy exposure (UPI/QR refunds, fake KYC, DTDC/Delhivery/India Post delivery fee, FASTag, digital arrest, job fee, Telegram tasks, loan apps, wedding-invite APK) plus US/UK coverage (USPS, Royal Mail, HMRC, SSA).

## Product Purpose

ScamLens is a fast, privacy-first scam checker. Paste a suspicious message or URL, or upload a screenshot — analysis runs entirely in the browser and flags common fraud patterns with matched evidence and tailored next steps.

Success means the user reaches a safe verify-or-ignore decision in seconds, understands *why* something is risky, and knows the single next step (e.g. verify via official app/website, never pay a release fee, never share OTP).

## Positioning

Privacy-first + explainable rule-based detection — not an AI black box.

Every finding carries its pattern, evidence snippet, and actionable step (`src/lib/analyzer.ts` DETECTORS + `urlFindings()`). Core analysis is 100% client-side (`src/lib/analyzer.ts:373 analyze(input, kind)`, VERSION 0.1.1); nothing leaves the device in the default static flow. A neighboring product could copy the checker UI but could not truthfully copy on-device explainability with zero data exfiltration.

## Operating Context

- Entry: `https://scamlens.in` — Astro 5 static site + Preact islands + Tailwind 4. `npm run dev` → http://localhost:4321.
- Core workflow: paste message/URL or upload screenshot (OCR’d on-device via `tesseract.js`) → `CheckerIsland` → `ResultView` with risk level (`low` → `critical`) + evidence + next steps + links to similar scams in the library.
- Learning workflow: `/scams` library, `/what-we-detect` + `/safety-tips` with interactive `QuizIsland` + `SimulatorIsland` (5 scenarios, detector provenance, weights hidden).
- Distribution (KV-only, static core preserved): `POST /api/analyze` returns same `AnalysisResult` + `meta`; `POST /api/report` (kind allowlist `message`/`url`, 10k limit, redacted-only KV `reports:<id>`); WhatsApp/Telegram webhooks verify token then `analyze()` direct with anonymized KV log, no sessions; browser extension reuses `CheckerIsland` + `ResultView` via `src/standalone-checker.tsx` with `fetch /api/analyze` + local fallback.
- Local-only artifacts: share-card canvas + history key `scamlens:history` labeled “Stored locally on this device”.
- i18n: 8 locales (`en`/`es`/`fr`/`de`/`pt-br`/`it`/`ja`/`ko`); scam-library indexability in progress (38/128).

## Capabilities and Constraints

Confirmed functionality:
- Text detectors: payment/fee bait, OTP/PIN/CVV requests, urgency/fear (incl. digital arrest), impersonation (banks, couriers, govt KYC/FASTag), QR/UPI receive-money trap, investment guaranteed returns, job/registration-fee + Telegram tasks.
- URL checks (`urlFindings()`): shorteners, punycode spoofing, raw IP, `http://`, `@` trick, `.apk` downloads, high-abuse TLDs (`.zip`, `.top`, etc.), credential params, brand mismatch.
- Risk scoring with weights + evidence snippets + per-detector next steps; methodology/limitations/detector & URL-signal tables on `/how-it-works` (`src/content.config.ts` `lastUpdated`/`sources`/`status`).
- Screenshot OCR on-device; PII redaction before analysis (`src/lib/redact.ts`); `vitest` coverage for `src/lib/analyzer.test.ts`.

Hard constraints (must never break):
- Privacy: default flow leaves nothing on a server; reports/logs store redacted input only, never raw.
- Decision support, not a guarantee: language patterns alone never prove a scam — always verify via official channels (`src/lib/analyzer.ts:25`).
- Explainability: every detector must have pattern + weight + evidence snippet + actionable step.
- i18n must keep working across the 8 locales; do not ship English-only strings in the checker path.

Terminology: detector, evidence snippet, next step, risk level (`low`/`medium`/`high`/`critical`), AnalysisResult + `meta` {analyzerVersion, timestamp, detectorIds, sources}.

## Brand Commitments

Name ScamLens, live at scamlens.in. Voice: direct, protective, non-alarmist — states risk, shows evidence, gives one next step. Existing visual system in `DESIGN.md` (`sovereign-vault-theme`, navy-ink + emerald + rationed gold, Fraunces + Inter) is incumbent authority for refinement; init records no new visual direction.

## Evidence on Hand

- Core engine: `src/lib/analyzer.ts` (VERSION 0.1.1), `src/lib/redact.ts`, `src/lib/analyzer.test.ts`.
- UI: `src/components/checker/CheckerIsland.tsx`, `src/components/checker/ResultView`, `src/components/QuizIsland.tsx`, `src/components/SimulatorIsland.tsx`, `src/lib/shareCard.ts`.
- Content: 16 curated entries under `src/content/scams/` (delivery, fake KYC, UPI refund/QR, job fee, digital arrest, FASTag, USPS, Royal Mail, HMRC, SSA, trading-app returns, electricity disconnection, WhatsApp family emergency, Telegram task likes, instant loan apps, wedding-invite APK) rendered at `/scams`.
- API/distribution: `functions/api/analyze.ts`, `functions/api/report.ts`, `functions/_shared/validate.ts`, `functions/webhook/whatsapp.ts`, `functions/webhook/telegram.ts`, `scripts/build-standalone.mjs`, `src/standalone-checker.tsx`.
- Absences future work must not fabricate: no confirmed real testimonials, case studies, press, benchmarks, pricing, or licensing claims.

## Product Principles

1. Privacy by default — on-device first; any server touch is redacted, explainable, and labeled.
2. Explain every verdict — no bare score; evidence plus one concrete next step.
3. Decide under pressure — design for fear/urgency moments: scan fast, read clearly, act safely.
4. Never overclaim — say “signs of” not “proof of”; always route to official-channel verification.
5. Accessible to everyone — plain language, 8 locales, touch-friendly checker on low-end mobile.
