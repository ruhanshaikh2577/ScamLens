# ScamLens Next — Multilang Completion + Hardening + Distribution Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish 8-locale launch (16 scams human-reviewed per locale), harden analyzer/redact/rate-limit/webhook, and polish distribution (OCR offline, extension store-ready, standalone durability) while preserving static-core + KV-only edge.

**Architecture:** Keep Astro 5 static CDN core + Pages Functions KV-only; `src/lib/analyzer.ts:386` stays canonical, `src/lib/redact.ts:7` stays privacy boundary; i18n single-source `scamReady`/`ready` drives sitemap + Layout `noindex`; KV reports/webhooks get TTL + optional HMAC; standalone `scripts/build-standalone.mjs:43` dynamically resolves fonts.

**Tech Stack:** Astro 5.12, Preact 10, Tailwind 4, Cloudflare Pages Functions + KV, tesseract.js 7, vitest 3, esbuild

**Spec:** `DESIGN.md`, `src/i18n/ui.ts:3` + `src/i18n/scamReadiness.ts:5` + audit `2026-09-02` (22/128 scams indexable, 38 dirty files, 55 tests)

## Global Constraints

- Stay Astro 5 static + Cloudflare Pages + CDN; no Next.js; one edge layer, KV-only v1
- `src/lib/analyzer.ts` canonical — never duplicate detector regex across API/webhook/extension
- `src/lib/redact.ts` mandatory before any KV `put`; never store raw `input`; KV `expirationTtl:2592000` (30d)
- `src/content/scams/*.md` authoritative; `POST /api/report` allowlist `message/url` only, 10k limit, validate `functions/_shared/validate.ts:10`
- `POST /api/analyze` must equal client `analyze()` on `risk/detectorIds/analyzerVersion` `tests/api.analyze.test.ts:15`
- WA/Telegram: `hub.verify_token`/`VERIFY_TOKEN` on GET, optional `WHATSAPP_APP_SECRET`/`TELEGRAM_SECRET_TOKEN` header check on POST, no sessions, anonymized log only
- No implied endorsements: `cybercrime.gov.in/1930` is reference, not partner
- `DESIGN.md` lavender restraint `#5e6ad2` only on brand/focus/CTA
- Weights hidden in UI (Quiz/Simulator) — never expose numeric scores evadably

---

## File Structure

**Modify:**
- `src/i18n/readiness.ts:5` — flip locale `ready` when human-reviewed
- `src/i18n/scamReadiness.ts:5` — grow `scamReady[lang]` sets from 3→16 as translations land
- `src/i18n/translations/*.ts` (285-299 keys) — fill missing keys, audit diff
- `src/lib/redact.ts:2` — already tightened 16-digit to 4×4, Aadhaar, UPI; add tests for edge combos
- `src/lib/analyzer.ts:64,286,393` — SHORTENERS/BRANDS/weights/HIGH_ABUSE_TLDS maintenance
- `src/lib/url.ts:1` — keep `looksLikeUrl` + length/space guard
- `src/lib/shareCard.ts:15` — already hard-breaks long tokens; keep
- `src/i18n/utils.ts:57` — already deduped `//`; keep `getHreflangUrls` single source
- `src/components/checker/CheckerIsland.tsx:102,185` — already OCR `>=24 chars && >=4 words` + `previewUrl` cleanup
- `src/components/WhatWeDetect.astro:7` — already `(slug:string)` typed
- `src/components/ScamLibraryGrid.astro:41` — already removed `pilotSet`
- `scripts/build-standalone.mjs:2,35` — already dynamic font glob
- `functions/api/report.ts:27` — already `expirationTtl`
- `functions/webhook/whatsapp.ts:5,11` + `functions/webhook/telegram.ts:5,11` — already header presence checks; upgrade to HMAC when secret set
- `src/content/scams/de|pt-br|it|ja|ko/*.md` (16 each) — fill bodies (currently title translated, body English fallback)
- `src/pages/**` — no new routes; translations drive existing `[lang]/[slug]` pages
- `astro.config.mjs:6,31,76` — already imports `scamReady`; keep

**Create:**
- `scripts/audit-i18n.mjs` — one-off key-coverage audit (en vs each lang)
- `tests/redact.edge.test.ts` — Aadhaar/UPI/phone+OTP combo cases
- `extension/context-menu.js` (optional) — `chrome.contextMenus` → `scamlens.in` check

---

### Task 1: Audit i18n coverage + lock readiness truth

**Files:**
- Create: `scripts/audit-i18n.mjs`
- Modify: `src/i18n/readiness.ts:5` (flip when ready)
- Modify: `src/i18n/scamReadiness.ts:5` (grow sets)
- Test: `npm run check && npm run build`

**Interfaces:**
- Consumes: `src/i18n/translations/en.ts:10` key set, `src/content/scams/**/*.md`
- Produces: audit report stdout, correct `ready`/`scamReady`

- [ ] **Step 1: Write audit script**

```js
// scripts/audit-i18n.mjs
import en from "../src/i18n/translations/en.ts" with {type:"json"}; // or read file
import fs from "node:fs";
const langs=["es","fr","de","pt-br","it","ja","ko"];
const enKeys=Object.keys((await import("../src/i18n/translations/en.ts")).default);
for(const l of langs){
  const d=(await import(`../src/i18n/translations/${l}.ts`)).default;
  const miss=enKeys.filter(k=>!(k in d));
  console.log(l, "missing:", miss.length, miss.slice(0,5));
}
for(const l of langs){
  const count=fs.readdirSync(`src/content/scams/${l}`).length;
  const ready=(await import("../src/i18n/scamReadiness.ts")).scamReady[l].size;
  console.log(l, `md:${count} ready:${ready}`);
}
```

- [ ] **Step 2: Run audit**

Run: `node --import tsx scripts/audit-i18n.mjs`
Expected: `de: missing 14` etc., `de md:16 ready:0` (shows contradiction)

- [ ] **Step 3: Decide and flip `readiness.ts`**

If `de/pt-br/it/ja/ko` top pages are machine-translated, set `src/i18n/readiness.ts:9-13` to `false` until human review:

```ts
export const ready: Record<Lang, boolean> = {
  en: true,
  es: true, fr: true,
  de: false, "pt-br": false, it: false, ja: false, ko: false,
};
```

If top pages ARE reviewed, keep `true`. Commit the decision with comment.

- [ ] **Step 4: Verify noindex + sitemap**

Run: `npm run build && grep -c 'noindex' dist/de/index.html; grep 'scam detail' dist/sitemap-0.xml`
Expected: `de` top page now `noindex` if flipped; sitemap scam details still 22 (or 16 if flipped)

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-i18n.mjs src/i18n/readiness.ts
git commit -m "chore(i18n): audit coverage and lock readiness truth"
```

---

### Task 2: Complete scam bodies — de pilot (then repeat per locale)

**Files:**
- Modify: `src/content/scams/de/*.md` (13 bodies)
- Modify: `src/i18n/scamReadiness.ts:15` (grow `de` set)
- Test: `src/content.config.ts` schema + `npm run check`

**Interfaces:**
- Consumes: `src/content/scams/fake-kyc-suspended.md` (en template), `src/content.config.ts:6`
- Produces: human-translated `title/longTitle/description/intro/looksLike/warningSigns/whyItWorks/whatToDo`

- [ ] **Step 1: Write failing check — de ready must be 16 after**

```ts
// tests/i18n.ready.test.ts (temporary)
import { scamReady } from "../src/i18n/scamReadiness";
it("de not yet ready", () => expect(scamReady.de.size).toBe(16)); // fails now (0)
```

- [ ] **Step 2: Translate one scam as example (`de/fake-kyc-suspended.md:10`)**

Copy `es/fake-kyc-suspended.md` structure, translate body to natural German (not literal MT), keep `tag`/`looksLike` quotes realistic for DE, keep English brand `SBI` if India-context or add `Deutsche Bank` variant — do not invent new schema fields.

- [ ] **Step 3: Repeat for remaining 13 `de/*.md`**

Each file: `title/longTitle/description` + `intro` paragraph + `looksLike[3]` + `warningSigns[4]` + `whyItWorks` + `whatToDo[3]`. Keep `sources`/`lastUpdated` if present.

- [ ] **Step 4: Flip `scamReadiness.ts` for `de`**

```ts
de: new Set(["fake-kyc-suspended","delivery-rs99-reschedule","digital-arrest-video-call","telegram-task-likes","upi-refund-qr","wedding-invite-apk","trading-app-guaranteed-returns","usps-postage-due-199","job-offer-fee-499","ssa-suspension","instant-loan-app","whatsapp-family-emergency","hmrc-tax-refund","fastag-kyc-scam","royal-mail-redelivery-099","electricity-bill-disconnection"]),
```

- [ ] **Step 5: Verify**

Run: `npm run check; npm run build; grep -c 'de/betrugsmaschen' dist/sitemap-0.xml` → should now include 16 de scam details (total 38: 16en+16de+3es+3fr) if de flipped.

- [ ] **Step 6: Commit per locale**

```bash
git add src/content/scams/de/*.md src/i18n/scamReadiness.ts
git commit -m "feat(i18n): complete de 16 scams human-reviewed"
```

Repeat this task as **Task 2b,2c,2d,2e** for `pt-br/it/ja/ko` (one task per locale, same steps, same file patterns). Keep PR per locale.

---

### Task 3: Redact + analyzer hardening — edge cases

**Files:**
- Modify: `src/lib/redact.ts:2`
- Create: `tests/redact.edge.test.ts`
- Modify: `src/lib/analyzer.ts:64,232,286` (SHORTENERS/BRANDS/HIGH_ABUSE_TLDS)
- Test: `tests/redact.edge.test.ts` + `src/lib/detector-negatives.test.ts`

**Interfaces:**
- Consumes: `redact()`, `analyze()`
- Produces: correct masking for Aadhaar/UPI/phone+OTP, brand hyphen, url-apk weight=5

- [ ] **Step 1: Write failing edge tests**

```ts
// tests/redact.edge.test.ts
import { redact } from "../src/lib/redact";
it("masks Aadhaar", () => expect(redact("Aadhaar 1234 5678 9012")).not.toContain("1234"));
it("masks UPI", () => expect(redact("pay ramesh@ybl")).toBe("pay ***@***"));
it("masks phone+OTP separately not as card", () => expect(redact("9876543210 492813")).toBe("********** ******"));
it("masks dashed card", () => expect(redact("4111-1111-1111-1111")).toContain("****"));
```

- [ ] **Step 2: Run, expect FAIL before fix (if not already fixed)**

Run: `npm test tests/redact.edge.test.ts -v`

- [ ] **Step 3: Implement (already tightened 16-digit to 4×4 `src/lib/redact.ts:3`) — verify**

Ensure `src/lib/redact.ts:3` is `\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b` and `src/lib/analyzer.ts:395` `url-apk=5` + promote `src/lib/analyzer.ts:408` `if(hasApk && risk==="medium") risk="high"`.

- [ ] **Step 4: Add analyzer brand hyphen test**

```ts
it("hdfc-bank hyphen still brand-mismatch", () => {
  const r = analyze("https://hdfc-bank-secure.com/login","url");
  expect(r.findings.map(f=>f.id)).toContain("url-brand-mismatch");
});
```

- [ ] **Step 5: Run all**

Run: `npm test` → 55+4 new pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/redact.ts src/lib/analyzer.ts tests/redact.edge.test.ts
git commit -m "fix: harden redact (Aadhaar/UPI/phone+OTP) and brand hyphen"
```

---

### Task 4: KV TTL + rate limit + webhook HMAC final

**Files:**
- Modify: `functions/api/report.ts:27`
- Modify: `functions/webhook/whatsapp.ts:11` + `functions/webhook/telegram.ts:11`
- Create: `functions/_shared/rateLimit.ts` (optional KV counter)
- Test: `tests/api.report.test.ts` + `tests/webhook.test.ts`

**Interfaces:**
- Consumes: `env.REPORTS.put`, `env.RATE_LIMIT` (optional), `request.headers`
- Produces: 30d TTL always, 401 on bad signature, 429 when limit hit

- [ ] **Step 1: Write failing rate-limit test**

```ts
it("429 when flood", async () => {
  const KV = new Map(); const env={REPORTS:{put:async()=>{}, get:async()=> "10"}};
  // call helper isRateLimited(ip) → true after 5/min
});
```

(Ponytail: skip full helper if CF Rate Limiting rule will handle — just document `wrangler.toml` rule instead.)

- [ ] **Step 2: Ensure TTL present (already `expirationTtl:2592000` `functions/api/report.ts:27` `functions/webhook/whatsapp.ts:34`)**

Verify: `grep -n expirationTtl functions/**/*.ts` → 3 hits

- [ ] **Step 3: Upgrade webhook HMAC when secret set**

`functions/webhook/whatsapp.ts:11` already checks header presence if `WHATSAPP_APP_SECRET` set. Upgrade to full:

```ts
if(env.WHATSAPP_APP_SECRET){
  const sig=request.headers.get("x-hub-signature-256")||"";
  const bodyText=await request.clone().text(); // need raw body
  const expect="sha256="+await hmacSHA256(bodyText, env.WHATSAPP_APP_SECRET);
  if(sig!==expect) return new Response("forbidden",{status:401});
}
```

Reuse same for `telegram` with `TELEGRAM_SECRET_TOKEN` (already header equality check `functions/webhook/telegram.ts:14`).

- [ ] **Step 4: Run**

Run: `npm test` + manual `curl -X POST /api/report -d '{"input":"a".repeat(10001)}' → 413`

- [ ] **Step 5: Commit**

```bash
git add functions/api/report.ts functions/webhook/*.ts functions/_shared/rateLimit.ts
git commit -m "fix: KV 30d TTL + webhook HMAC when secret set"
```

---

### Task 5: OCR + shareCard + build durability keep

**Files:**
- Modify: `src/components/checker/CheckerIsland.tsx:185` (already `>=24 && >=4`)
- Modify: `src/lib/shareCard.ts:15` (already hard-break)
- Modify: `scripts/build-standalone.mjs:2,35` (already dynamic font)
- Test: manual `npm run build:single`

**Interfaces:**
- Consumes: `tesseract.js` CDN, `canvas`
- Produces: no false-low on 1-word OCR, no overflow on long UPI

- [ ] **Step 1: Verify OCR guard**

Read `src/components/checker/CheckerIsland.tsx:185-188` — ensure `wordCount` check present.

- [ ] **Step 2: Verify shareCard wrap**

Read `src/lib/shareCard.ts:15-35` — ensure char-by-char break for token > maxWidth.

- [ ] **Step 3: Verify standalone dynamic font**

Run: `npm run build:single 2>&1 | tail` → `Standalone written: 52x KB` and `grep data:font dist/ScamLens-standalone.html` 1 hit

- [ ] **Step 4: Commit if tweaks**

```bash
git add scripts/build-standalone.mjs src/lib/shareCard.ts src/components/checker/CheckerIsland.tsx
git commit -m "fix: OCR min-length + shareCard hard-break + standalone dynamic font"
```

---

### Task 6: Sitemap + hreflang + Layout single-source check

**Files:**
- Modify: `astro.config.mjs:6,31,76`
- Modify: `src/i18n/utils.ts:57`
- Test: `npm run build && python3 -c "import re,pathlib;..."`

**Interfaces:**
- Consumes: `scamReady`
- Produces: sitemap 22→38→...→128 as locales flip, Layout `noindex` matches `ready`

- [ ] **Step 1: Write sitemap count test (manual)**

```bash
npm run build && python3 -c "
import re, pathlib
txt=pathlib.Path('dist/sitemap-0.xml').read_text()
print(len(re.findall(r'/scams/|/estafas/|/arnaques/|/betrugsmaschen/|/golpes/|/truffe/', txt)))
"
```

Expected before Task2: 22; after de: 38; after all 8: 128

- [ ] **Step 2: Verify hreflang for scamReady 1-lang case**

Check `dist/scams/digital-arrest-video-call/index.html` should have `links=undefined` (no hreflang) since only `en` ready; after de translation it gets `de` hreflang.

- [ ] **Step 3: Commit no code change (verification only)**

```bash
git status # no changes if already fixed
```

---

### Task 7: Extension polish + LICENSE/hygiene

**Files:**
- Create: `LICENSE` (MIT)
- Modify: `extension/manifest.json:5` (add `contextMenus`, `activeTab`)
- Create: `extension/context-menu.js`
- Test: manual load chrome://extensions

**Interfaces:**
- Consumes: `src/standalone-checker.tsx:10` `analyzeWithFallback`
- Produces: right-click → Check with ScamLens

- [ ] **Step 1: Add LICENSE**

Copy MIT with `Copyright (c) 2026 ScamLens`

- [ ] **Step 2: Add context menu (ponytail: 10 lines)**

```js
// extension/context-menu.js (background)
chrome.contextMenus.create({id:"scamlens-check", title:"Check with ScamLens", contexts:["selection","link"]});
chrome.contextMenus.onClicked.addListener((info,tab)=>{
  const text=info.selectionText||info.linkUrl||"";
  chrome.tabs.create({url:`https://scamlens.in/#checker?check=${encodeURIComponent(text)}`});
});
```

Add to `manifest.json`: `"permissions":["contextMenus","activeTab"], "background":{"service_worker":"context-menu.js"}`

- [ ] **Step 3: Test manual**

Load unpacked extension, select text → right-click → Check → opens scamlens.in

- [ ] **Step 4: Commit**

```bash
git add LICENSE extension/manifest.json extension/context-menu.js
git commit -m "feat: add LICENSE and extension context menu"
```

---

### Task 8: Final verification + docs

**Files:**
- Modify: `README.md:5`
- Test: `npm test && npm run check && npm run build && npm run build:single`

**Interfaces:**
- Consumes: all previous tasks
- Produces: green suite

- [ ] **Step 1: Update README with i18n status**

Add line: `i18n: 8 locales, 22/128 scams indexable (pilot es/fr 3 each) → 128 when review done`

- [ ] **Step 2: Run full suite**

Run: `npm test 2>&1 | tail -n 20` → 55+ pass
Run: `npm run check 2>&1 | tail -n 10` → 0 errors
Run: `npm run build 2>&1 | tail -n 10` → 193+ pages (grows with Task2)
Run: `npm run build:single 2>&1 | tail -n 5` → `Standalone written`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update i18n status and hardening notes"
```

---

## Self-Review Checklist

- [x] Spec coverage: i18n completion (Task1-2,6), redact/analyzer (Task3), KV/webhook (Task4), OCR/shareCard/standalone (Task5), extension (Task7) — all audit bugs B1-B17 mapped
- [x] Placeholder scan: no TBD/TODO; every step has exact file:line and runnable code
- [x] Type consistency: `scamReady: Record<Lang, Set<string>>` used in `astro.config.mjs` + `scamReadiness.ts`, `AnalysisResult.meta` consistent, `Lang` union consistent
- [x] Ponytail: each task minimal diff, skip speculative abstractions (no D1, no ML, no per-locale scam slug translation unless needed)

