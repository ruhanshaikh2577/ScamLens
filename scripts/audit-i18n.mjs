#!/usr/bin/env node
// Audit i18n coverage + readiness truth
// Usage: node scripts/audit-i18n.mjs  or  node --import tsx scripts/audit-i18n.mjs
import fs from "node:fs";
import path from "node:path";

const langs = ["es","fr","de","pt-br","it","ja","ko"];
const enPath = "src/i18n/translations/en.ts";
const readinessPath = "src/i18n/readiness.ts";
const scamReadyPath = "src/i18n/scamReadiness.ts";

function extractKeys(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const keys = [...raw.matchAll(/"([^"]+)"\s*:/g)].map(m=>m[1]);
  const empty = [...raw.matchAll(/"([^"]+)"\s*:\s*""/g)].map(m=>m[1]);
  return { keys, empty, raw };
}

function parseReadiness() {
  try {
    const raw = fs.readFileSync(readinessPath, "utf8");
    const map = {};
    for (const m of raw.matchAll(/"?([a-z-]+)"?\s*:\s*(true|false)/g)) {
      map[m[1]] = m[2] === "true";
    }
    return map;
  } catch { return {}; }
}

function parseScamReady() {
  try {
    const raw = fs.readFileSync(scamReadyPath, "utf8");
    const out = {};
    const re = /"?([a-z-]+)"?\s*:\s*new Set\(\[([^\]]*)\]\)/g;
    for (const m of raw.matchAll(re)) {
      const lang = m[1];
      const inside = m[2];
      const slugs = [...inside.matchAll(/"([^"]+)"/g)].map(x=>x[1]);
      out[lang] = slugs;
    }
    // also handle en expanded multiline
    return out;
  } catch { return {}; }
}

console.log("=== i18n translation coverage ===");
const en = extractKeys(enPath);
console.log(`en: ${en.keys.length} keys`);
let anyMissing = false;
for (const l of langs) {
  const p = `src/i18n/translations/${l}.ts`;
  if (!fs.existsSync(p)) {
    console.log(`${l}: MISSING file`);
    anyMissing = true;
    continue;
  }
  const d = extractKeys(p);
  const miss = en.keys.filter(k=>!d.keys.includes(k));
  const extra = d.keys.filter(k=>!en.keys.includes(k));
  const status = miss.length===0 && extra.length===0 ? "OK" : "MISMATCH";
  console.log(`${l}: ${d.keys.length} keys, missing:${miss.length} extra:${extra.length} empty:${d.empty.length} ${status} ${miss.slice(0,5).join(", ")}`);
  if (miss.length) anyMissing = true;
  if (d.empty.length) console.log(`  empty keys: ${d.empty.slice(0,5).join(", ")}`);
}

console.log("\n=== scam markdown coverage ===");
const scamReady = parseScamReady();
const ready = parseReadiness();
// en md are at top level
let enCount = 0;
try { enCount = fs.readdirSync("src/content/scams").filter(f=>f.endsWith(".md")).length; } catch {}
console.log(`en: md:${enCount} ready:${(scamReady.en||[]).length} ${enCount===(scamReady.en||[]).length?"OK":"MISMATCH"}`);
for (const l of langs) {
  let count = 0;
  try { count = fs.readdirSync(`src/content/scams/${l}`).filter(f=>f.endsWith(".md")).length; } catch { count = 0; }
  const r = (scamReady[l]||[]).length;
  const flag = count===r ? "OK" : (r===0 && count>0 ? "CONTRADICTION (md present but 0 ready — body fallback?)" : `miss:${count-r}`);
  console.log(`${l}: md:${count} ready:${r} ${flag}`);
}

console.log("\n=== scam body translation check (English fallback detection) ===");
function normIntro(s){
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_,h)=>String.fromCharCode(parseInt(h,16)));
  s = s.replace(/^["']|["']$/g,"").trim().replace(/\s+/g," ").replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
  return s;
}
for (const l of langs) {
  let fallback = 0, total = 0;
  const sameFiles = [];
  try {
    const files = fs.readdirSync(`src/content/scams/${l}`).filter(f=>f.endsWith(".md"));
    total = files.length;
    for (const f of files) {
      const enFile = path.join("src/content/scams", f);
      const langFile = path.join(`src/content/scams/${l}`, f);
      if (!fs.existsSync(enFile)) continue;
      const enRaw = fs.readFileSync(enFile, "utf8");
      const langRaw = fs.readFileSync(langFile, "utf8");
      const enIntro = (enRaw.match(/^intro:\s*(.*)$/m)||[])[1]||"";
      const langIntro = (langRaw.match(/^intro:\s*(.*)$/m)||[])[1]||"";
      if (normIntro(enIntro) && normIntro(langIntro) && normIntro(enIntro)===normIntro(langIntro)) {
        fallback++; sameFiles.push(f);
      }
    }
  } catch {}
  if (total>0) {
    const pct = ((fallback/total)*100).toFixed(0);
    const note = fallback===0 ? "OK (all translated)" : fallback===total ? "ALL EN fallback" : `${fallback}/${total} still EN fallback`;
    console.log(`${l}: ${note} (${pct}% fallback)${fallback>0 ? " e.g. "+sameFiles.slice(0,2).join(", ") : ""}`);
  }
}
// also check en subdir existence vs root (en should be at root per config)
console.log(`\nen at root md:${enCount} (en subdir should be 0): ${fs.existsSync("src/content/scams/en") ? fs.readdirSync("src/content/scams/en").length+" in en/" : "no en/ dir — correct"}`);

console.log("\n=== readiness truth ===");
console.log("ready map:", JSON.stringify(ready));
const indexableTop = Object.entries(ready).filter(([,v])=>v).map(([k])=>k);
console.log(`indexable top pages: ${indexableTop.length} [${indexableTop.join(", ")}]`);
const totalReadyScams = Object.values(scamReady).reduce((a,b)=>a+b.length,0);
console.log(`total indexable scam details: ${totalReadyScams} (en:${(scamReady.en||[]).length} es:${(scamReady.es||[]).length} fr:${(scamReady.fr||[]).length} de:${(scamReady["de"]||[]).length} pt-br:${(scamReady["pt-br"]||[]).length} it:${(scamReady.it||[]).length} ja:${(scamReady.ja||[]).length} ko:${(scamReady.ko||[]).length})`);
console.log(`expected before Task2: 22 (16en+3es+3fr). After de 16 each: 38, after all 8: 128`);

// Contradiction detection
let contradictions = [];
for (const l of ["de","pt-br","it","ja","ko"]) {
  if (ready[l]===true && (scamReady[l]||[]).length===0) {
    contradictions.push(`${l}: ready=true but scamReady=0 (top indexable while scam details all noindex — contradiction until scam bodies human-reviewed)`);
  }
}
if (contradictions.length) {
  console.log("\n⚠️  CONTRADICTIONS FOUND:");
  for (const c of contradictions) console.log(" - "+c);
  console.log("\nRecommendation: set ready[de/pt-br/it/ja/ko]=false until human review confirms top pages + scam bodies.");
  console.log("Fix: src/i18n/readiness.ts:5 set de, pt-br, it, ja, ko to false.");
} else {
  console.log("\n✓ No readiness/scamReady contradiction.");
}
if (anyMissing) console.log("\n⚠️ Translation key gaps detected — fill before marking ready=true.");

const hasContradiction = contradictions.length>0 || anyMissing;
if (hasContradiction) {
  console.log("\nAudit result: NEEDS ACTION");
} else {
  console.log("\nAudit result: PASS");
}
