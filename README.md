# ScamLens — AI Scam Detector

> Verify website safety. Check fake websites, phishing links, malicious URLs and scam screenshots with real-time fraud detection.

Live: **https://scamlens.in** · Astro + Preact + Tailwind · Client-side analysis (nothing leaves your device)

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

> **Disclaimer:** Decision support, not a guarantee. Language patterns alone never prove a scam — always verify via official channels. See `src/lib/analyzer.ts:25`.

## Scam library

16 curated examples under `src/content/scams/` (rendered at `/scams`):

delivery, fake KYC, UPI refund/QR, job fee, digital arrest, FASTag, USPS, Royal Mail, HMRC, SSA, trading-app guaranteed returns, electricity disconnection, WhatsApp family emergency, Telegram task likes, instant loan apps, wedding-invite APK.

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
- `src/lib/analyzer.ts:60` — `DETECTORS` (regex + weight + next step)
- `src/lib/analyzer.ts:279` — `urlFindings()` (shortener, punycode, IP, APK, TLD, brand mismatch)
- `src/lib/analyzer.ts:373` — `analyze(input, kind)` entry point

## Deployment

Static output in `dist/`. Any static host works (Cloudflare Pages, Netlify, Vercel, GitHub Pages). Set `site` in `astro.config.mjs` for correct sitemap/canonical URLs.

## Contributing

PRs welcome. Keep the analyzer explainable — every detector must have a pattern, weight, evidence snippet, and actionable step.

## License

No license file yet. Add one (e.g. MIT) if you want to open-source. Until then, all rights reserved.
