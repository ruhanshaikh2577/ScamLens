import { useState, useRef, useEffect } from "preact/hooks";
import { analyze, type AnalysisResult, type RiskLevel } from "../../lib/analyzer";
import { looksLikeUrl } from "../../lib/url";
import { generateShareCard, saveHistory, loadHistory, clearHistory, removeHistory, shareCardDataUrl, type HistoryEntry } from "../../lib/shareCard";
import { reportHelplines, reportUrls } from "../../i18n/ui";
import enDict from "../../i18n/translations/en";
import type { Lang } from "../../i18n/ui";

// ponytail: keep en bundled, lazy-load other locales to cut ~100KB from initial CheckerIsland chunk
const dicts: Record<string, Record<string, string>> = {
  en: enDict as unknown as Record<string,string>,
};
const loaders: Record<string, () => Promise<Record<string,string>>> = {
  es: () => import("../../i18n/translations/es").then(m => m.default as unknown as Record<string,string>),
  fr: () => import("../../i18n/translations/fr").then(m => m.default as unknown as Record<string,string>),
  de: () => import("../../i18n/translations/de").then(m => m.default as unknown as Record<string,string>),
  "pt-br": () => import("../../i18n/translations/pt-br").then(m => m.default as unknown as Record<string,string>),
  it: () => import("../../i18n/translations/it").then(m => m.default as unknown as Record<string,string>),
  ja: () => import("../../i18n/translations/ja").then(m => m.default as unknown as Record<string,string>),
  ko: () => import("../../i18n/translations/ko").then(m => m.default as unknown as Record<string,string>),
};
function getT(lang: string) {
  const d = (dicts[lang] ?? dicts.en) as Record<string,string>;
  const fb = dicts.en as Record<string,string>;
  return (key: string) => d[key] ?? fb[key] ?? key;
}

async function analyzeWithFallback(input: string, kind: "message" | "url", lang: string): Promise<AnalysisResult> {
  try {
    const url = typeof location !== "undefined" && location.protocol === "chrome-extension:" ? "https://scamlens.in/api/analyze" : `/api/analyze?lang=${encodeURIComponent(lang)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, kind }),
    });
    if (res.ok) return (await res.json()) as AnalysisResult;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[analyzeWithFallback]", e);
  }
  return analyze(input, kind, lang);
}

type Tab = "text" | "image" | "link";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

// ponytail: OCR engine + eng traineddata load lazily from jsdelivr/tessdata CDN on
// first screenshot scan (~10 MB, cached by the browser). Self-host in /public and pass
// workerPath/corePath/langPath if fully-offline scans are ever needed.
async function ocrFile(file: File, onProgress: (p: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text") onProgress(m.progress ?? 0);
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text || "";
  } finally {
    await worker.terminate();
  }
}

// Fallback when OCR can't run (offline, engine failed): analyze a representative
// sample so the flow still teaches the pattern — clearly labelled as demo output.
const SAMPLE_OCR_TEXT =
  "USPS: Your package is on hold due to an incomplete address. Pay a $1.99 redelivery fee within 24 hours or it will be returned: usps-postagehelp.com";

const RISK_CLASS: Record<RiskLevel, string> = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  critical: "risk-critical",
};

export default function CheckerIsland({ lang = "en" as Lang }: { lang?: Lang }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (lang !== "en" && !dicts[lang] && loaders[lang]) {
      loaders[lang]().then(d => { dicts[lang] = d; forceUpdate(v => v + 1); });
    }
  }, [lang]);
  useEffect(() => {
    // Deep link (?check= in hash, e.g. from the browser extension context menu):
    // pre-fills the checker with shared text. Runs before the sample path.
    try {
      const m = location.hash.match(/[?&]check=([^&]+)/);
      if (m) {
        const s = decodeURIComponent(m[1].replace(/\+/g, " ")).slice(0, 10000);
        if (s.trim()) {
          handleTextDrop(s);
          try { sessionStorage.removeItem("scamlens:sample"); } catch {}
          return;
        }
      }
    } catch {}
    // One-tap sample from ExampleAnalysis ("Try this example →"):
    // sessionStorage covers mount-after-click, the event covers already-mounted.
    try {
      const s = sessionStorage.getItem("scamlens:sample");
      if (s && s.trim()) {
        sessionStorage.removeItem("scamlens:sample");
        setText(s.slice(0, 10000));
        setTab("text");
        setFileError("");
      }
    } catch {}
    const onSample = (e: Event) => {
      const s = (e as CustomEvent<string>).detail;
      if (s && s.trim()) {
        setText(s.slice(0, 10000));
        setTab("text");
        setFileError("");
      }
    };
    window.addEventListener("scamlens:sample", onSample);
    return () => window.removeEventListener("scamlens:sample", onSample);
  }, []);
  const t = getT(lang);
  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "text", label: t("checker.tab.message") },
    { id: "image", label: t("checker.tab.screenshot") },
    { id: "link", label: t("checker.tab.link") },
  ];
  const SCAN_STEPS = [
    t("checker.scanSteps.1"),
    t("checker.scanSteps.2"),
    t("checker.scanSteps.3"),
    t("checker.scanSteps.4"),
  ];
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  // Fix stale closure: use ref for cleanup so all callers revoke via same ref (final-review Important #7)
  const previewUrlRef = useRef<string | null>(null);
  useEffect(() => { previewUrlRef.current = previewUrl; }, [previewUrl]);
  useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);
  const [dragging, setDragging] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [statusLine, setStatusLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [demoNote, setDemoNote] = useState(false);

  const canScan =
    phase !== "scanning" &&
    ((tab === "text" && text.trim().length > 3) ||
      (tab === "link" && url.trim().length > 3) ||
      (tab === "image" && !!file));

  // Inline guidance instead of a dead button: short input, or a URL pasted into Message tab
  const trimmedText = text.trim();
  const trimmedUrl = url.trim();
  const shortInput =
    phase === "idle" &&
    ((tab === "text" && trimmedText.length > 0 && trimmedText.length <= 3) ||
      (tab === "link" && trimmedUrl.length > 0 && trimmedUrl.length <= 3));
  const emptyInput =
    phase === "idle" &&
    ((tab === "text" && trimmedText.length === 0) ||
      (tab === "link" && trimmedUrl.length === 0));
  const urlInTextTab =
    phase === "idle" &&
    tab === "text" &&
    trimmedText.length > 3 &&
    looksLikeUrl(trimmedText) &&
    !trimmedText.includes("\n") &&
    trimmedText.length < 2048;

  function pickFile(f: File | undefined | null) {
    setFileError("");
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setFileError(t("checker.error.type"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError(t("checker.error.size"));
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setTab("image");
  }

  function handleTextDrop(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;
    setFileError("");
    if (looksLikeUrl(trimmed) && trimmed.length < 2048 && !trimmed.includes("\n")) {
      setNotice("");
      setUrl(trimmed);
      setTab("link");
    } else {
      setNotice(trimmed.length > 10000 ? t("checker.hint.trimmed") : "");
      setText(trimmed.slice(0, 10000));
      setTab("text");
    }
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setFileError("");
  }

  function backToEdit() {
    // Keep the user's input: checking a second message costs one tap, not a re-paste
    setResult(null);
    setDemoNote(false);
    setPhase("idle");
  }

  async function scan() {
    if (!canScan) return;
    setPhase("scanning");
    setStatusLine(0);
    setProgress(8);
    setDemoNote(false);

    if (tab === "image" && file) {
      // Real local OCR — progress follows the recognizer; engine assets download
      // once from CDN and are cached. Any failure falls back to the demo sample.
      const crawl = setInterval(() => setProgress((p) => Math.min(p + 2, 25)), 300);
      let extracted = "";
      try {
        extracted = await ocrFile(file, (p) => {
          clearInterval(crawl);
          setProgress(25 + Math.round(p * 70));
          setStatusLine(Math.min(1 + Math.floor(p * (SCAN_STEPS.length - 1)), SCAN_STEPS.length - 1));
        });
      } catch (e) {
        if (import.meta.env.DEV) console.warn("[ocr]", e);
      }
      clearInterval(crawl);
      const trimmed = extracted.trim();
      const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
      const ok = trimmed.length >= 24 && wordCount >= 4;
      setResult(await analyzeWithFallback(ok ? extracted : SAMPLE_OCR_TEXT, "message", lang));
      setDemoNote(!ok);
      setProgress(100);
      setPhase("done");
      return;
    }

    const delay = 2000;
    const stepMs = delay / SCAN_STEPS.length;
    const tick = setInterval(() => setStatusLine((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), stepMs);
    const bar = setInterval(
      () => setProgress((p) => Math.min(p + Math.round(88 / (delay / 250)), 94)),
      250
    );
    setTimeout(async () => {
      clearInterval(tick);
      clearInterval(bar);
      setProgress(100);
      const input = tab === "text" ? text : url;
      const kind = tab === "link" || (tab === "text" && looksLikeUrl(text)) ? "url" : "message";
      setResult(await analyzeWithFallback(input, kind, lang));
      setPhase("done");
    }, delay);
  }

  if (phase === "done" && result) {
    return (
      <ResultView result={result} demo={demoNote} onReset={backToEdit} lang={lang} />
    );
  }

  function onCheckerDragEnter(e: DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setDragActive(true);
  }
  function onCheckerDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    if (!dragActive) setDragActive(true);
  }
  function onCheckerDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragActive(false);
  }
  async function onCheckerDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    setDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const f = files[0];
      if (ACCEPTED.includes(f.type)) {
        pickFile(f);
        return;
      }
      if (f.type === "text/plain" || f.name.endsWith(".txt")) {
        try {
          const txt = await f.text();
          handleTextDrop(txt);
          return;
        } catch (e) {
          if (import.meta.env.DEV) console.warn("[drop txt]", e);
        }
      }
      if (f.type === "application/pdf") {
        setFileError(t("checker.error.pdf"));
        setTab("text");
        return;
      }
      // fallback: try as text
      try {
        const txt = await f.text();
        if (txt.trim()) { handleTextDrop(txt); return; }
      } catch (e) {
        if (import.meta.env.DEV) console.warn("[drop fallback]", e);
      }
      setFileError(t("checker.error.type"));
      return;
    }
    const uri = e.dataTransfer?.getData("text/uri-list") || e.dataTransfer?.getData("text/plain") || "";
    if (uri.trim()) handleTextDrop(uri);
  }

  function onPaste(e: ClipboardEvent) {
    const items = (e.clipboardData as DataTransfer | null)?.items as DataTransferItemList | undefined;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file" && ACCEPTED.includes(it.type)) {
        const f = it.getAsFile();
        if (f) { e.preventDefault(); pickFile(f); return; }
      }
    }
  }

  return (
    <div
      id="checker"
      onDragEnter={onCheckerDragEnter}
      onDragOver={onCheckerDragOver}
      onDragLeave={onCheckerDragLeave}
      onDrop={onCheckerDrop}
      onPaste={onPaste as any}
      class={"card panel-top-edge mx-auto w-full max-w-2xl p-4 sm:p-6 relative " + (dragActive ? "ring-2 ring-primary/40" : "")}
    >
      {dragActive && (
        <div class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-canvas/85 backdrop-blur border-2 border-dashed border-primary-hover">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-primary-hover" aria-hidden="true"><path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          <p class="text-sm font-medium text-ink">{t("checker.dropOverlay.title")}</p>
          <p class="text-caption text-ink-muted">{t("checker.dropOverlay.subtitle")}</p>
        </div>
      )}
      <div class="flex items-center justify-center">
        <div class="inline-flex rounded-full border border-hairline bg-canvas p-1" role="tablist" aria-label="Input type">
          {TABS.map((t, idx) => (
            <button
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => {
                setTab(t.id);
                setFileError("");
                setNotice("");
              }}
              onKeyDown={(e) => {
                let next: typeof TABS[number] | null = null;
                if (e.key === "ArrowRight") next = TABS[(idx + 1) % TABS.length];
                else if (e.key === "ArrowLeft") next = TABS[(idx - 1 + TABS.length) % TABS.length];
                else if (e.key === "Home") next = TABS[0];
                else if (e.key === "End") next = TABS[TABS.length - 1];
                else return;
                e.preventDefault();
                if (next) {
                  setTab(next.id);
                  requestAnimationFrame(() => document.getElementById(`tab-${next!.id}`)?.focus());
                }
              }}
              class={
                "rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] inline-flex items-center justify-center " +
                (tab === t.id ? "bg-surface-2 text-ink" : "text-ink-subtle hover:text-ink")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p class="mt-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-center text-[13px] leading-snug text-ink-muted">
        {t("checker.warn")}{" "}
        <a href={`${lang==="en" ? "" : `/${lang}`}/how-it-works#redaction`.replace("//","/")} class="underline decoration-hairline-strong underline-offset-4 hover:text-ink">{t("checker.trust.howLinkLong")}</a>
      </p>

      <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" hidden={tab !== "text"}>
        <textarea
          aria-label={t("checker.aria.message")}
          value={text}
          onInput={(e) => { setText((e.target as HTMLTextAreaElement).value); setNotice(""); }}
          onKeyDown={(e) => (e.key === "Enter" && (e.ctrlKey || e.metaKey)) && scan()}
          rows={7}
          maxlength={10000}
          placeholder={t("checker.placeholder.message")}
          class="mt-4 w-full resize-y rounded-md border border-hairline bg-surface-1 px-3 py-2.5 text-body leading-relaxed text-ink placeholder:text-ink-tertiary focus:border-hairline-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-primary-focus/50"
        />
        <p class="mt-1 hidden text-caption text-ink-tertiary [@media(pointer:fine)]:block">{t("checker.tip")}</p>
        {trimmedText.length > 0 && (
          <p class="mt-1 tabular-nums text-caption text-ink-tertiary" aria-live="polite">{trimmedText.length.toLocaleString()} / 10,000 {t("checker.hint.chars")}</p>
        )}
      </div>

      <div id="panel-link" role="tabpanel" aria-labelledby="tab-link" hidden={tab !== "link"}>
        <input
          type="text"
          aria-label={t("checker.aria.link")}
          value={url}
          onInput={(e) => { setUrl((e.target as HTMLInputElement).value); setNotice(""); }}
          onKeyDown={(e) => e.key === "Enter" && scan()}
          placeholder={t("checker.placeholder.link")}
          class="mt-4 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2.5 text-body text-ink placeholder:text-ink-tertiary focus:border-hairline-strong focus:outline-none"
        />
      </div>

      <div id="panel-image" role="tabpanel" aria-labelledby="tab-image" hidden={tab !== "image"}>
        <div class="mt-4">
          {!file ? (
            <label
              class={
                "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors max-h-[55vh] " +
                (dragging ? "border-primary-hover bg-surface-2" : "border-hairline-strong bg-surface-1 hover:border-hairline-tertiary")
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer?.files?.[0]);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-ink-subtle" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="M21 16l-5-5-9 8" />
              </svg>
              <span class="text-sm text-ink">{t("checker.placeholder.drop")}</span>
              <span class="text-caption text-ink-tertiary">{t("checker.placeholder.dropHint")}</span>
              <input
                type="file"
                aria-label={t("checker.aria.upload")}
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                class="hidden"
                onChange={(e) => pickFile((e.target as HTMLInputElement).files?.[0])}
              />
            </label>
          ) : (
            <div class="rounded-lg border border-hairline bg-surface-1 p-3">
              <div class="flex items-start gap-3">
                {previewUrl && (
                  <img src={previewUrl} alt={t("checker.aria.preview")} class="max-h-44 w-auto rounded-md border border-hairline" />
                )}
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm text-ink">{file.name}</p>
                  <p class="text-caption text-ink-tertiary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button onClick={clearFile} class="btn btn-secondary mt-2 !px-2.5 !py-1 !text-xs min-h-[44px]">
                    {t("checker.file.remove")}
                  </button>
                </div>
              </div>
            </div>
          )}
          {fileError && <p role="alert" class="form-error mt-2 text-[13px] font-medium">{fileError}</p>}
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3">
        <p class="hidden text-caption text-ink-tertiary sm:block">
          {t("checker.dragHint")}
        </p>
        <button onClick={scan} disabled={!canScan} class="btn btn-primary ml-auto w-full sm:w-auto sm:min-w-32">
          {phase === "scanning" ? t("checker.scanning") : t("checker.scan")}
        </button>
      </div>

      {(shortInput || urlInTextTab || emptyInput || notice) && (
        <p role="status" class="mt-3 text-[13px] leading-relaxed text-ink-muted">
          {urlInTextTab ? (
            <>
              {t("checker.hint.url")}{" "}
              <button
                onClick={() => { setUrl(trimmedText); setText(""); setTab("link"); setFileError(""); setNotice(""); }}
                class="font-medium text-ink underline decoration-hairline-strong underline-offset-4 hover:text-primary-hover"
              >
                {t("checker.hint.switchToLink")}
              </button>
            </>
          ) : shortInput ? (
            t("checker.hint.short")
          ) : notice ? (
            notice
          ) : (
            t("checker.hint.empty")
          )}
        </p>
      )}

      {phase === "scanning" && (
        <div class="mt-5" role="status" aria-live="polite">
          <div class="scan-bar">
            <div class="scan-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <ul class="mt-4 space-y-2.5 text-sm">
            {SCAN_STEPS.map((s, i) => (
              <li class="flex items-center gap-2.5">
                {i < statusLine ? (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 fade-in text-success" aria-hidden="true">
                    <path d="M3 8.5l3 3 7-7" />
                  </svg>
                ) : i === statusLine ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="scan-lens shrink-0 text-primary-hover" aria-hidden="true">
                    <path d="M12 3a9 9 0 019 9" />
                    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
                  </svg>
                ) : (
                  <span class="inline-block h-[15px] w-[15px] shrink-0 rounded-full border border-hairline-strong" aria-hidden="true"></span>
                )}
                <span class={i <= statusLine ? "text-ink-muted transition-colors" : "text-ink-tertiary"}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultView({ result, demo, onReset, lang = "en" }: { result: AnalysisResult; demo: boolean; onReset: () => void; lang?: Lang }) {
  const t = getT(lang);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "done">("idle");
  const [historyCleared, setHistoryCleared] = useState(false);
  const RISK_LABEL: Record<RiskLevel, string> = {
    low: t("checker.result.risk.low"),
    medium: t("checker.result.risk.medium"),
    high: t("checker.result.risk.high"),
    critical: t("checker.result.risk.critical"),
  };
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  useEffect(() => {
    saveHistory(result);
    setHistory(loadHistory());
  }, [result]);

  async function doShare() {
    setShareStatus("sharing");
    try {
      const dataUrl = generateShareCard(result, lang);
      if (!dataUrl) { setShareStatus("idle"); return; }
      const filename = `scamlens-${result.risk}-${Date.now()}.png`;
      const outcome = await shareCardDataUrl(dataUrl, filename, result.headline);
      setShareStatus(outcome === "failed" ? "idle" : "done");
      setTimeout(() => setShareStatus("idle"), 2200);
    } catch {
      setShareStatus("idle");
    }
  }
  function doDownload() {
    const dataUrl = generateShareCard(result, lang);
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `scamlens-${result.risk}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function handleClear() {
    clearHistory();
    setHistory([]);
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 2000);
  }
  // Reporting help follows the selected language, not a single country's helpline.
  const helpline = reportHelplines[lang] ?? null;
  const portal = reportUrls[lang] ?? reportUrls.en;
  let portalHost = portal;
  try { portalHost = new URL(portal).hostname.replace(/^www\./, ""); } catch {}
  const goldenBox = (
    <div class="mt-6 flex flex-col gap-2 rounded-lg border border-hairline bg-surface-2 p-4 sm:flex-row sm:items-center">
      <p class="flex-1 text-sm text-ink-muted">{t("checker.result.golden")}</p>
      {helpline && <a href={helpline} class="btn btn-secondary shrink-0"><span aria-hidden="true">✆ </span>{helpline.replace(/^tel:/, "")}</a>}
      <a href={portal} target="_blank" rel="noopener noreferrer" class="btn btn-primary shrink-0">
        {portalHost}
      </a>
    </div>
  );
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
}
