# ScamLens — Rule-Based Scam Detector

> Verify website safety. Check fake websites, phishing links, malicious URLs and scam screenshots with real-time fraud detection.

**Status: not deployed.** This is a personal project; there is no live URL yet. The
static build is fully functional locally — see [Getting started](#getting-started).
Everything below describes code that exists and is tested, not a running service.

Astro + Preact + Tailwind · analysis runs in the browser (nothing leaves your device)

i18n: 8 locales (`en`/`es`/`fr`/`de`/`pt-br`/`it`/`ja`/`ko`), 15 scam entries × 8 locales = **120** translated scam pages, all indexable.

### Optional: server-side distribution (Cloudflare Pages Functions)

The static site is self-contained. These Functions are an *optional* add-on that moves
analysis to the server for integrations; the client falls back to in-browser analysis
when they are absent. KV-only, no database, no sessions.

| Endpoint | Behaviour |
|---|---|
| `POST /api/analyze` | validate → redact → `analyze()` → same `AnalysisResult` + `meta` as the client. Expands one shortener hop, guarded against internal targets. |
| `POST /api/report` | kind allowlist (`message`/`url`; legacy `text`→`message`, `link`→`url`) + 10k cap → redact → KV `reports:<id>`, 30-day TTL. **Redacted input only — never raw.** |
| `POST /webhook/whatsapp` | verifies the HMAC signature when `WHATSAPP_APP_SECRET` is set, then replies via the Cloud API. Anonymized KV log, no user id stored. |
| `POST /webhook/telegram` | verifies `X-Telegram-Bot-Api-Secret-Token` when set, then replies via the Bot API. Same logging. |

Rate limiting is KV-backed and **fails open** if the `RATE_LIMIT` binding is absent —
configure the binding or the limits are inert.

Also included: `QuizIsland` + `SimulatorIsland` (detector provenance, weights hidden),
a canvas share card, and local-only history under `scamlens:history`, labelled
"Stored locally on this device". Provenance (`AnalysisResult.meta`) plus
methodology/limitations tables live on `/how-it-works`.


## What it does

ScamLens is a fast, privacy-first scam checker. Paste a suspicious message or URL, or upload a screenshot — it runs entirely in the browser and flags common fraud patterns:

- **Payment/fee bait** — "pay Rs 99 to reschedule delivery / release parcel"
- **OTP / PIN / CVV requests** — no legitimate bank asks for these over SMS/call
- **Urgency & fear** — "account blocked today", "digital arrest", legal threats
- **Impersonation** — banks, couriers (DTDC/Delhivery/India Post), govt KYC/FASTag
- **QR / UPI traps** — scanning a QR to "receive" money actually sends it
- **Investment & job scams** — guaranteed returns, Telegram task scams, registration fees
- **URL checks** — shorteners, punycode spoofing, raw IP, `http://`, `@` trick, `.apk` downloads, high-abuse TLDs (`.zip`, `.top`, etc.), credential params, brand mismatch

Each finding shows the matched evidence snippet and tailored next steps. Results include a risk level (`low` → `critical`) and links to similar scams in the library.

Screenshot uploads are OCR'd with `tesseract.js` on-device (`src/components/checker/CheckerIsland.tsx:1`, `src/standalone-checker.tsx:1`).

> **Disclaimer:** Decision support, not a guarantee. Language patterns alone never prove a scam — always verify via official channels. See `src/lib/analyzer-i18n.ts` (`disclaimer`).

## Scam library

15 curated entries under `src/content/scams/` (rendered at `/scams`), each translated
into all 8 locales:

parcel delivery fee · bank/OTP impersonation · toll-road SMS · QR & payment request ·
family emergency · job & task-earning · fake authority video call · advance-fee loan ·
electricity disconnection · trading-app guaranteed returns · tax/government refund ·
romance & relationship · tech-support refund · lottery & prize · malicious APK.

## Tech stack

- [Astro 5](https://astro.build) — static site, `site: https://scamlens.in` (`astro.config.mjs:7`)
- [Preact](https://preactjs.com) islands for the checker
- [Tailwind CSS 4](https://tailwindcss.com) via Vite plugin
- [tesseract.js](https://github.com/naptha/tesseract.js) for screenshot OCR
- Content Collections for scam entries (`src/content.config.ts`)
- `vitest` for `src/lib/analyzer.test.ts`

## Getting started

Requirements: Node 18+

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # preview production build
npm run check    # astro check
npm test         # vitest run
```

Standalone single-file build (for embedding):
```bash
npm run build:single  # astro build + scripts/build-standalone.mjs → dist/standalone
```

## Project structure

```
src/
  components/         # Hero, HowItWorks, WhatWeDetect, ScamLibraryGrid, FAQ, etc.
  components/checker/ # CheckerIsland.tsx (main detector UI)
  content/scams/      # markdown scam entries
  layouts/Layout.astro
  lib/analyzer.ts     # core detection engine + risk scoring
  lib/redact.ts       # PII redaction before analysis
  pages/              # index, about, scams/[slug], etc.
  styles/global.css
public/               # favicons, og.png
scripts/build-standalone.mjs
```

Key logic:
- `src/lib/analyzer.ts:69` — `DETECTORS` (regex + weight + next step)
- `src/lib/analyzer.ts:324` — `urlFindings()` (shortener, punycode, IP, APK, TLD, brand mismatch)
- `src/lib/analyzer.ts:419` — `analyze(input, kind, lang)` entry point
- `src/lib/redact.ts` — PII masking applied to every emitted evidence snippet
- `src/lib/version.ts` — `VERSION`, kept in sync with `package.json` and the extension manifest

## Deployment

Not currently deployed. `npm run build` emits a static `dist/` that any static host
serves (Cloudflare Pages, Netlify, Vercel, GitHub Pages). Before publishing:

- set `site` in `astro.config.mjs` — it drives canonical URLs, hreflang and the sitemap
- the footer, share card and legal copy reference `scamlens.in` by name; update the
  `scamlens.in` strings in `src/i18n/translations/*.ts` if you host it elsewhere
- for the optional Functions, bind `REPORTS` and `RATE_LIMIT` KV namespaces and set
  `VERIFY_TOKEN` / `TELEGRAM_BOT_TOKEN` / `WHATSAPP_*` — absent bindings fail open
- `npm run build` runs `scripts/check-seo-integrity.mjs`, which fails the build if the
  sitemap lists a `noindex` page, a page `_redirects` sends away, or a dead hreflang

## Known limitations

- Short-link expansion resolves DNS before fetching and rejects any internal answer,
  but it is still resolve-then-fetch: a host that answers public for the lookup and
  private for the subsequent request (DNS rebinding) is not covered. Workers exposes
  no connect-to-IP control that would close it.
- `redact()` has no rule for passwords, so `?password=…` in a URL reaches the
  evidence snippet, the share card and webhook replies. OTP, PAN, phone and UPI
  handles are masked.
- The detector set is weighted heuristics tuned on a synthetic corpus, not on
  labelled real-world traffic.

## Contributing

PRs welcome. Keep the analyzer explainable — every detector must have a pattern, weight, evidence snippet, and actionable step.

## License

MIT — see [`LICENSE`](LICENSE).
