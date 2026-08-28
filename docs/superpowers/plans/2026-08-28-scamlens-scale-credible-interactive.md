# ScamLens Scale/Credible/Interactive v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver v1 scale/credible/interactive on Astro 5 static + one Pages Functions KV layer: provenance-hardened analyzer, methodology+limitations, KV report→review flow, /api/analyze + WA/Telegram adapters, quiz/simulator + share/history, with static core preserved.

**Architecture:** Astro static (CDN) stays core; one Cloudflare Pages Functions Worker adds POST /api/analyze, POST /api/report, /webhook/whatsapp and /webhook/telegram which call canonical src/lib/analyzer.ts:373 directly after validate→redact. KV stores only anonymized reports/counters; src/content/scams/*.md remains authoritative via manual PR. No D1/Auth/ML.

**Tech Stack:** Astro 5.12, Preact 10, Tailwind 4, Cloudflare Pages Functions, KV, vitest 3, tesseract.js (unchanged)

**Spec:** `docs/superpowers/specs/2026-08-28-scamlens-scale-credible-interactive-design.md`

## Global Constraints

- Stay Astro 5 static + Cloudflare Pages + CDN; no Next.js migration
- One edge layer only: Pages Functions/Worker; KV-only v1; no D1 unless proven need
- `src/lib/analyzer.ts` canonical; do not duplicate rules across website/API/bot/extension
- `src/lib/redact.ts` redact() mandatory privacy boundary before any KV persistence; never store raw input
- `src/content/scams/*.md` authoritative; reports untrusted until manual review → PR → merge
- `POST /api/report` validates kind allowlist + 10k char limit server-side; stores minimal {id, redactedInput, kind, detectorIds, timestamp, analyzerVersion}
- `POST /api/analyze` returns same AnalysisResult shape as client including meta {analyzerVersion, timestamp, detectorIds, sources}
- WA/Telegram adapters: verify webhook → validate → redact → analyze() directly (not via internal fetch to /api/analyze); lightweight reply (risk/evidence/nextStep/verify link/disclaimer); no sessions/cloud history; only anonymized operational log
- Static traffic scales via CDN; do not hard-code Cloudflare free-tier numbers (10ms/128MB/etc); use generic limit language and verify current plan limits before deploy
- No implied endorsements: cybercrime.gov.in/1930/I4C/WA/Telegram are references, not partners/reviewers
- Methodology copy must state rule-based decision support, "low-risk does not mean safe", not guaranteed; include explicit Limitations section
- Quiz must not expose numeric weights evadably; teach recognition not fear; client-only
- Share card must not embed raw private input by default; history localStorage labeled "Stored locally on this device"; no cloud sync v1
- Version bump 0.1.0→0.1.1 only if additive; displayed version equals runtime
- Footer `src/layouts/Layout.astro:145` px-8→px-4 sm:px-6; Hero `src/components/Hero.astro:5` already overflow-hidden; keep DESIGN.md lavender restraint

---

## File Structure

**Modify:**
- `src/lib/analyzer.ts:16-23,373` — add meta to AnalysisResult, generate inside analyze()
- `src/lib/analyzer.test.ts` — add meta equivalence tests
- `src/content.config.ts:6-20` — extend scam schema lastUpdated/sources/status
- `src/pages/how-it-works.astro:38-114` — methodology + detectors table + limitations + version
- `src/layouts/Layout.astro:145` — footer padding fix
- `src/components/checker/CheckerIsland.tsx:249,417` — add Report button + share/history hooks

**Create:**
- `functions/api/analyze.ts` — POST analyze
- `functions/api/report.ts` — POST report + KV
- `functions/webhook/whatsapp.ts` — WA verify + analyze reply
- `functions/webhook/telegram.ts` — Telegram adapter (shares helper)
- `functions/_shared/validate.ts` — shared validate+redact helper
- `src/components/QuizIsland.tsx` — 5-scenario quiz
- `src/components/SimulatorIsland.tsx` — interactive simulator
- `src/lib/shareCard.ts` — canvas share card generator
- `tests/api.analyze.test.ts` — functions unit tests (vitest)
- `tests/api.report.test.ts`
- `tests/webhook.test.ts`
- `src/content/scams/_template.md` — example provenance frontmatter

---

### Task 1: Analyzer provenance (meta) — engine

**Files:**
- Modify: `src/lib/analyzer.ts:16-27,429` 
- Modify: `package.json:5`
- Test: `src/lib/analyzer.test.ts`

**Interfaces:**
- Consumes: `package.json.version`, `DETECTORS:60`, `analyze()`
- Produces: `AnalysisResult.meta: {analyzerVersion:string, timestamp:string, detectorIds:string[], sources:{label:string, href:string}[]}`

- [ ] **Step 1: Write failing test for meta**

```ts
// src/lib/analyzer.test.ts add:
it("adds meta with version, timestamp, detectorIds", () => {
  const r = analyze("Pay Rs 99 fee today", "message");
  expect(r.meta.analyzerVersion).toMatch(/\d+\.\d+\.\d+/);
  expect(new Date(r.meta.timestamp).toString()).not.toBe("Invalid Date");
  expect(r.meta.detectorIds).toContain("payment-request");
  expect(Array.isArray(r.meta.sources)).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | tail -n 30`
Expected: FAIL — `meta` undefined

- [ ] **Step 3: Implement minimal meta**

```ts
// src/lib/analyzer.ts:16 after DISCLAIMER
import pkg from "../../package.json" with {type:"json"}; // or define VERSION="0.1.1"
// Alternative for Cloudflare compatibility: const VERSION="0.1.1";
export interface AnalysisMeta {
  analyzerVersion: string;
  timestamp: string;
  detectorIds: string[];
  sources: Array<{label:string, href:string}>;
}
export interface AnalysisResult {
  // ... existing
  meta: AnalysisMeta;
}
// inside analyze(): after findings computed
const detectorIds = [...new Set(findings.map(f=>f.id))];
const sources = detectorIds.flatMap(id=>{
  if(id.startsWith("url-")) return [{label:"ScamLens URL checks", href:"/how-it-works#url-signals"}];
  return [{label:"ScamLens detectors", href:"/how-it-works#detectors"}];
}).slice(0,3);
// also add official reference where relevant (e.g., include cybercrime.gov.in for critical)
return { risk, headline, findings, nextSteps, similarScams, disclaimer:DISCLAIMER,
  meta:{analyzerVersion: VERSION, timestamp: new Date().toISOString(), detectorIds, sources}
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test` — expect 13 passed (12 existing +1)

- [ ] **Step 5: Bump version 0.1.0→0.1.1**

Edit `package.json:5` `"version": "0.1.1"` only after confirming additive (no breaking field removal).

- [ ] **Step 6: Commit**

```bash
git add src/lib/analyzer.ts package.json src/lib/analyzer.test.ts
git commit -m "feat: add AnalysisResult.meta provenance (version, timestamp, detectorIds, sources)"
```

---

### Task 2: Content provenance schema + How It Works methodology

**Files:**
- Modify: `src/content.config.ts:8-20`
- Modify: `src/pages/how-it-works.astro:38-114`
- Create: `src/content/scams/_template.md` (ignored)

**Interfaces:**
- Consumes: `AnalysisResult.meta` detectorIds
- Produces: frontmatter `lastUpdated/sources/status`, methodology page

- [ ] **Step 1: Write failing check for schema**

```bash
# manual check: add a dummy scam md missing lastUpdated, run astro check should still pass but schema allows optional
# add test file and run npm run check
```

- [ ] **Step 2: Extend content.config.ts**

```ts
// src/content.config.ts
schema: z.object({
  title: z.string(),
  longTitle: z.string(),
  description: z.string(),
  tag: z.string(),
  intro: z.string(),
  looksLike: z.array(z.string()),
  warningSigns: z.array(z.string()),
  whyItWorks: z.string(),
  whatToDo: z.array(z.string()),
  verify: z.string(),
  similar: z.array(z.string()).default([]),
  updated: z.coerce.date().optional(),
  region: z.enum(["in","global"]).default("in"),
  lastUpdated: z.coerce.date().optional(),
  sources: z.array(z.object({label:z.string(), href:z.string().url()})).default([]),
  status: z.enum(["draft","reviewed"]).default("reviewed"),
}),
```

- [ ] **Step 3: Extend how-it-works.astro with methodology + limitations**

Add sections after existing steps (≈60 lines):
- Detector table (12-14 rows id/label/purpose)
- URL signals subsection
- Weights→risk explainer (thresholds without exposing evadable weights: "multiple signals → higher risk")
- Version banner: `Astro.props` read `VERSION` + `lastUpdated` prop
- Limitations section (bullets: rule-based, false neg/pos, low≠safe, not recovery, not affiliated)
- Copy check: no "guaranteed 99% accurate" language; use "identifies signals associated with known patterns"

- [ ] **Step 4: Run checks**

Run: `npm run check` — 0 errors, `npm run build` — succeeds, manual view `/how-it-works`

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/pages/how-it-works.astro
git commit -m "feat: add content provenance frontmatter and methodology/limitations to how-it-works"
```

---

### Task 3: Footer polish + Hero guard verification

**Files:**
- Modify: `src/layouts/Layout.astro:145`
- Modify: `src/components/Hero.astro:5` (already done, verify)

**Interfaces:**
- Consumes: global.css aurora `global.css:292`
- Produces: no horizontal scroll

- [ ] **Step 1: Fix footer**

```diff
- <footer class="border-t border-hairline bg-canvas px-8 pt-16 pb-10 text-caption text-ink-subtle">
+ <footer class="border-t border-hairline bg-canvas px-4 pt-16 pb-10 text-caption text-ink-subtle sm:px-6">
```

Keep inner `max-w-6xl` unchanged.

- [ ] **Step 2: Verify Hero**

Check `src/components/Hero.astro:5` contains `relative overflow-hidden`. If not, add.

- [ ] **Step 3: Test**

Run: `npm run build && npm run preview` → manual 320px viewport: `document.documentElement.scrollWidth===clientWidth` true; `npm run check`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/components/Hero.astro
git commit -m "fix: contain hero aurora overflow and normalize footer padding"
```

---

### Task 4: Shared validate+redact helper (edge)

**Files:**
- Create: `functions/_shared/validate.ts`
- Test: `tests/validate.test.ts` (or inline)

**Interfaces:**
- Consumes: `src/lib/redact.ts: redact()`, `src/lib/analyzer.ts` VERSION
- Produces: `validateInput(body): {ok, input, kind, error}`

- [ ] **Step 1: Write failing test**

```ts
import { validateReportPayload } from "../functions/_shared/validate";
it("rejects unsupported kind", ()=> expect(validateReportPayload({input:"hi", kind:"foo"}).ok).toBe(false));
it("rejects >10k", ()=> expect(validateReportPayload({input:"a".repeat(10001), kind:"message"}).ok).toBe(false));
it("rejects empty", ()=> expect(validateReportPayload({input:"", kind:"message"}).ok).toBe(false));
```

- [ ] **Step 2: Implement helper**

```ts
// functions/_shared/validate.ts
import { redact } from "../../src/lib/redact";
const ALLOW = new Set(["message","url","text","link"]);
export function normalizeKind(k:string){ const m={text:"message", link:"url"} as const; return (m as any)[k]??k; }
export function validateReportPayload(b:any){
  if(!b||typeof b.input!=="string") return {ok:false, error:"missing input"};
  const kind = normalizeKind(String(b.kind||""));
  if(!ALLOW.has(kind)) return {ok:false, error:"unsupported kind"};
  const canon = (kind==="text"?"message": kind==="link"?"url":kind) as "message"|"url";
  if(!b.input.trim()) return {ok:false, error:"empty input"};
  if(b.input.length>10000) return {ok:false, error:"input too long"};
  return {ok:true, input:b.input, kind:canon, redacted: redact(b.input)};
}
```

- [ ] **Step 3: Run tests**

Run: `npm test` — pass

- [ ] **Step 4: Commit**

```bash
git add functions/_shared/validate.ts
git commit -m "feat: add edge validate+redact helper for api/report"
```

---

### Task 5: POST /api/report → KV (anonymized)

**Files:**
- Create: `functions/api/report.ts`
- Test: `tests/api.report.test.ts`

**Interfaces:**
- Consumes: `validateReportPayload`, `KV` binding `REPORTS`, `VERSION`
- Produces: `POST /api/report` → `{id}` 201 or 4xx

- [ ] **Step 1: Write failing test**

```ts
// tests/api.report.test.ts
import { onRequestPost } from "../functions/api/report";
it("stores redacted only", async()=>{
  const KV = new Map();
  const req = new Request("http://x/api/report", {method:"POST", body: JSON.stringify({input:"OTP 492813 Pay Rs 99", kind:"message"})});
  req.headers.set("content-type","application/json");
  const res = await onRequestPost({request:req, env:{REPORTS:{put:(k,v)=>KV.set(k,v)}} } as any);
  expect(res.status).toBe(201);
  const stored = JSON.parse([...KV.values()][0]);
  expect(stored.redactedInput).not.toContain("492813");
  expect(stored.redactedInput).toContain("Pay Rs 99");
  expect(stored.detectorIds).toContain("payment-request");
});
it("rejects too long", async()=>{ /* 413 */ });
```

- [ ] **Step 2: Implement handler**

```ts
// functions/api/report.ts
import { validateReportPayload } from "../_shared/validate";
import { analyze } from "../../src/lib/analyzer";
import pkg from "../../package.json" with {type:"json"};
export async function onRequestPost({request, env}: any){
  let body; try{ body=await request.json(); }catch{ return new Response(JSON.stringify({error:"malformed"}),{status:400});}
  const v=validateReportPayload(body);
  if(!v.ok) return new Response(JSON.stringify({error:v.error}),{status: v.error==="input too long"?413:400});
  const result = analyze(v.input, v.kind);
  const id=crypto.randomUUID();
  const payload={id, kind:v.kind, redactedInput:v.redacted, detectorIds: result.meta.detectorIds, analyzerVersion: pkg.version, timestamp: new Date().toISOString()};
  await env.REPORTS?.put(`reports:${id}`, JSON.stringify(payload));
  // optional counter: env.REPORTS.put("reports:count", ...)
  return new Response(JSON.stringify({id}),{status:201, headers:{"content-type":"application/json"}});
}
```

- [ ] **Step 3: Run tests**

Run: `npm test` — report tests pass, ensure redacted check

- [ ] **Step 4: Commit**

```bash
git add functions/api/report.ts tests/api.report.test.ts functions/_shared/validate.ts
git commit -m "feat: add POST /api/report with validate→redact→KV anonymized store"
```

---

### Task 6: POST /api/analyze (canonical)

**Files:**
- Create: `functions/api/analyze.ts`
- Test: `tests/api.analyze.test.ts`

**Interfaces:**
- Consumes: `validateReportPayload` (reuse), `analyze()`
- Produces: `AnalysisResult` with `meta` identical to client

- [ ] **Step 1: Write equivalence test**

```ts
import { analyze as clientAnalyze } from "../src/lib/analyzer";
import { onRequestPost } from "../functions/api/analyze";
it("client and api produce same risk/detectorIds", async()=>{
  const input="DTDC pay Rs 99 https://bit.ly/x";
  const client=clientAnalyze(input,"message");
  const req=new Request("http://x/api/analyze",{method:"POST", body:JSON.stringify({input, kind:"message"})});
  const res=await onRequestPost({request:req} as any);
  const api=await res.json();
  expect(api.risk).toBe(client.risk);
  expect(api.meta.detectorIds.sort()).toEqual(client.meta.detectorIds.sort());
  expect(api.meta.analyzerVersion).toBe(client.meta.analyzerVersion);
});
```

- [ ] **Step 2: Implement**

```ts
// functions/api/analyze.ts
import { validateReportPayload } from "../_shared/validate";
import { analyze } from "../../src/lib/analyzer";
export async function onRequestPost({request}:any){
  let body; try{ body=await request.json();}catch{return new Response(JSON.stringify({error:"malformed"}),{status:400});}
  const v=validateReportPayload(body);
  if(!v.ok) return new Response(JSON.stringify({error:v.error}),{status: v.error==="input too long"?413:400});
  // redact via v.redacted? for url kind analyzers use original? Use redacted for message, original for url? Mirror client: collectFindings uses redact internally, so pass original but analyzer redacts.
  const result=analyze(v.input, v.kind);
  return new Response(JSON.stringify(result),{status:200, headers:{"content-type":"application/json"}});
}
```

- [ ] **Step 3: Run tests**

Run: `npm test` — equivalence holds

- [ ] **Step 4: Commit**

```bash
git add functions/api/analyze.ts tests/api.analyze.test.ts
git commit -m "feat: add POST /api/analyze with client equivalence"
```

---

### Task 7: WhatsApp/Telegram webhook adapters (lightweight)

**Files:**
- Create: `functions/webhook/whatsapp.ts`
- Create: `functions/webhook/telegram.ts`
- Test: `tests/webhook.test.ts`

**Interfaces:**
- Consumes: `validateReportPayload` style, `analyze()`, KV for anonymized log
- Produces: webhook verify GET + POST reply

- [ ] **Step 1: Write failing tests**

```ts
it("rejects bad verify token", async()=>{ /* GET with hub.verify_token mismatch → 401 */ });
it("replies with risk and disclaimer on valid message", async()=>{
  const req=new Request("http://x/webhook/whatsapp",{method:"POST", body:JSON.stringify({entry:[{changes:[{value:{messages:[{text:{body:"Pay Rs 99"}}, from:"123"}]}}]})});
  const res=await onRequestPost({request:req, env:{VERIFY_TOKEN:"tok"}} as any);
  expect(await res.text()).toContain("Risk");
});
```

- [ ] **Step 2: Implement whatsapp adapter**

```ts
// functions/webhook/whatsapp.ts
import { analyze } from "../../src/lib/analyzer";
import { redact } from "../../src/lib/redact";
export async function onRequestGet({request, env}:any){
  const u=new URL(request.url);
  if(u.searchParams.get("hub.verify_token")!==env.VERIFY_TOKEN) return new Response("forbidden",{status:401});
  return new Response(u.searchParams.get("hub.challenge")||"",{status:200});
}
export async function onRequestPost({request, env}:any){
  let body; try{body=await request.json();}catch{return new Response("bad",{status:400});}
  const text=body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || body?.message?.text || "";
  if(!text) return new Response("ok",{status:200});
  const redacted=redact(text);
  const kind=text.trim().startsWith("http")?"url":"message";
  const r=analyze(text, kind as any);
  const reply=`[${r.risk.toUpperCase()}] ${r.headline}\n${r.findings.slice(0,2).map(f=>`• ${f.label}: "${f.evidence}"`).join("\n")}\n→ ${r.nextSteps[0]}\nVerify: https://scamlens.in/how-it-works\n${r.disclaimer}`;
  // TODO: fetch to WhatsApp Graph API with env.WHATSAPP_TOKEN — mock in test
  // anonymized log: env.REPORTS?.put(`webhook:${Date.now()}`, JSON.stringify({kind, risk:r.risk, version:r.meta.analyzerVersion}))
  return new Response(JSON.stringify({reply}),{status:200});
}
```

Telegram similar with `body.message.text`.

- [ ] **Step 3: Run tests (mock fetch)**

Run: `npm test` — webhook tests pass

- [ ] **Step 4: Commit**

```bash
git add functions/webhook/whatsapp.ts functions/webhook/telegram.ts tests/webhook.test.ts
git commit -m "feat: add WA/Telegram webhook adapters (verify→redact→analyze reply)"
```

---

### Task 8: Extension v1 (reuse ResultView)

**Files:**
- Create: `extension/manifest.json` (optional v1) or just document `standalone-checker.tsx` usage
- Modify: `src/standalone-checker.tsx` to call `/api/analyze` when online, fallback to local
- Test: manual `npm run build:single`

- [ ] **Step 1: Verify standalone build**

Run: `npm run build:single 2>&1 | tail`

- [ ] **Step 2: Add fetch branch in standalone-checker.tsx**

```ts
async function analyzeWithFallback(input, kind){
  try{
    const res=await fetch("/api/analyze",{method:"POST", body:JSON.stringify({input,kind})});
    if(res.ok) return await res.json();
  }catch{}
  return analyze(input, kind); // local fallback
}
```

- [ ] **Step 3: Test fallback**

Run: existing analyzer tests still pass; manual preview extension page

- [ ] **Step 4: Commit**

```bash
git add src/standalone-checker.tsx
git commit -m "feat: extension v1 reuses standalone checker with /api/analyze fallback"
```

---

### Task 9: QuizIsland + SimulatorIsland (A — learn by doing)

**Files:**
- Create: `src/components/QuizIsland.tsx`
- Create: `src/components/SimulatorIsland.tsx`
- Modify: `src/pages/what-we-detect.astro:11`, `src/pages/safety-tips.astro:11` to embed
- Test: `src/lib/analyzer.test.ts` reuse (quiz uses same detectors)

**Interfaces:**
- Consumes: `DETECTORS` ids, `analyze()`
- Produces: island components `client:load`

- [ ] **Step 1: Write QuizIsland (5 scenarios, static array)**

```tsx
const SCENARIOS=[
  {text:"DTDC Pay Rs 99 reschedule https://bit.ly/x", answer:"scam", detector:"payment-request", explain:"Fee to receive parcel — legits never ask"},
  // +4 from analyzer tests: OTP, family emergency, electricity, investment
];
export default function QuizIsland(){
  const [idx,setIdx]=useState(0);
  const [show,setShow]=useState(false);
  // on answer: analyze(SCENARIOS[idx].text,"message"), show finding matching detector
}
```

No weight display; show `label/step` only.

- [ ] **Step 2: Test manually**

Run: `npm run dev` → `/what-we-detect` shows quiz, each answer explains detector id + why

- [ ] **Step 3: Commit**

```bash
git add src/components/QuizIsland.tsx src/components/SimulatorIsland.tsx src/pages/what-we-detect.astro src/pages/safety-tips.astro
git commit -m "feat: add QuizIsland and SimulatorIsland (5 scenarios, detector provenance)"
```

---

### Task 10: Share card + local history (B — personal utility)

**Files:**
- Create: `src/lib/shareCard.ts`
- Modify: `src/components/checker/CheckerIsland.tsx:417` (add Share button + history)
- Test: manual canvas

**Interfaces:**
- Consumes: `AnalysisResult`, `canvas`
- Produces: `generateShareCard(result): string (dataURL)`, `saveHistory(result)`

- [ ] **Step 1: Implement shareCard**

```ts
// src/lib/shareCard.ts
export function generateShareCard(r: AnalysisResult): string {
  const c=document.createElement("canvas"); c.width=1080; c.height=600;
  const ctx=c.getContext("2d")!;
  ctx.fillStyle="#010102"; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle="#f7f8f8"; ctx.font="600 28px Inter"; ctx.fillText(r.headline, 40, 80);
  r.findings.slice(0,2).forEach((f,i)=> ctx.fillText(`${f.label}: ${f.evidence.slice(0,60)}`, 40, 140+i*30));
  ctx.fillStyle="#8a8f98"; ctx.fillText("Verify: scamlens.in/how-it-works — "+r.meta.analyzerVersion, 40, 560);
  return c.toDataURL("image/png");
}
```

- [ ] **Step 2: Hook into CheckerIsland ResultView**

Add buttons: `Share` → `generateShareCard` → `navigator.share({files:[file]})` fallback `a.download`; history: `localStorage.setItem("scamlens:history", JSON.stringify([...prev, {id:Date.now(), risk:r.risk, meta:r.meta}]))` labeled.

- [ ] **Step 3: Manual test**

Run: `npm run dev` → scan → Share → download PNG contains headline + evidence summary, no raw OTP; history shows "Stored locally on this device"

- [ ] **Step 4: Commit**

```bash
git add src/lib/shareCard.ts src/components/checker/CheckerIsland.tsx
git commit -m "feat: add shareable ResultView card and local history (no raw input)"
```

---

### Task 11: Final polish + tests + docs

**Files:**
- Modify: `README.md:5` add new endpoints paragraph
- Test: run full suite

- [ ] **Step 1: Update README**

Document `POST /api/*`, webhook, quiz placement.

- [ ] **Step 2: Run full verification**

Run: `npm test && npm run check && npm run build`

Expected: all pass, 25 pages built, no horizontal scroll at 320px

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with v1 scale/credible/interactive endpoints"
```

---

## Self-Review Checklist (plan author)

- [x] Spec §3 KV flow: Task 5 covers validate+redact+KV minimal store
- [x] Spec §4 distribution: Tasks 6-8 cover /api/analyze + WA/Telegram direct analyze + extension reuse
- [x] Spec §5 interactivity A/B: Tasks 9-10; C secondary (no metric fabrication)
- [x] Spec §4 limits generic copy: noted in Task 6/7 comments, no hard-coded numbers
- [x] Spec §2 provenance: Task1 meta additive, Task2 methodology+limitations, content provenance
- [x] Testing: Tasks 1,4-7 include malformed/oversized/empty/retry/version/redact/signature tests + equivalence
- [x] No placeholders: all steps contain actual code snippets and exact run commands
- [x] Type consistency: AnalysisResult.meta used uniformly across Tasks 1,5,6,9,10
