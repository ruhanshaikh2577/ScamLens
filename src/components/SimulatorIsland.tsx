import { useMemo, useState } from "preact/hooks";
import { analyze } from "../lib/analyzer";

function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (/^https?:\/\//i.test(t)) return true;
  return /^[\w-]+(\.[\w-]+)*\.[a-z]{2,24}(\/\S*)?$/i.test(t);
}

interface Preset {
  label: string;
  text: string;
}

const PRESETS: Preset[] = [
  { label: "Legit note", text: "Hi Ma, reaching home by 8pm. Send love to everyone." },
  { label: "Courier fee", text: "DTDC: Your parcel is on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99" },
  { label: "OTP request", text: "SBI: Your account will be blocked today. Confirm your identity by sharing the OTP 551203 immediately." },
  { label: "Family emergency", text: "Hi Mum, my phone broke and this is my new number. I'm stuck at the airport, please send Rs 8000 urgently." },
  { label: "Power cut", text: "BSES: Your electricity will be disconnected today at 8 PM for non-payment. Pay via UPI immediately or power will be cut." },
  { label: "Investment", text: "VIP trading group: guaranteed returns, daily profit. Pay Rs 5000 registration fee to join and double your money in 7 days." },
];

const RISK_CLASS: Record<string, string> = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  critical: "risk-critical",
};

export default function SimulatorIsland() {
  const [text, setText] = useState(PRESETS[0].text);

  const result = useMemo(() => {
    const t = text.trim();
    if (t.length < 4) return null;
    // single-link input → url checks; otherwise message checks
    const isSingleUrl = !t.includes("\n") && t.length < 2048 && looksLikeUrl(t);
    return analyze(text, isSingleUrl ? "url" : "message");
  }, [text]);

  return (
    <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label="Scam simulator">
      <p class="eyebrow">Simulator</p>
      <h3 class="card-title mt-2">Tweak a message — see the signals move</h3>
      <p class="mt-1 text-body-sm leading-relaxed text-ink-muted">
        Type anything or load a preset. The same local checker from the homepage runs instantly — no send, no storage.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setText(p.text)}
            class={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${text === p.text ? "border-primary/40 bg-primary/10 text-ink" : "border-hairline bg-canvas text-ink-muted hover:border-hairline-strong hover:text-ink"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
        rows={4}
        maxlength={10000}
        placeholder="Paste or type a message or link to simulate…"
        class="mt-4 w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-tertiary focus:border-hairline-strong focus:outline-none"
      />
      <p class="mt-1 text-caption text-ink-tertiary">Try adding "within 24 hours", "pay Rs 99", or an OTP ask — watch how the risk and signals change.</p>

      {result ? (
        <div class="fade-in mt-6 rounded-lg border border-hairline bg-surface-2 p-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class={`risk-badge ${RISK_CLASS[result.risk] ?? "risk-low"}`}>
              <span class="risk-dot" />
              {result.risk.toUpperCase()} RISK
            </span>
            <span class="text-sm font-medium text-ink">{result.headline}</span>
          </div>

          {result.findings.length > 0 ? (
            <ul class="mt-4 space-y-3">
              {result.findings.slice(0, 4).map((f) => (
                <li key={f.id} class="flex gap-3">
                  <span class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-hover" aria-hidden="true" />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-ink">{f.label} <span class="font-mono text-xs font-normal text-ink-tertiary">({f.id})</span></p>
                    <code class="evidence-pill mt-1">{f.evidence}</code>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p class="mt-4 text-sm text-ink-muted">No common scam markers found in this text — but "low" never means safe. Verify via official channels.</p>
          )}

          {result.nextSteps.length > 0 && (
            <div class="mt-4 border-t border-hairline pt-4">
              <p class="text-xs font-medium tracking-wide text-ink-subtle">What you should do</p>
              <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink-muted">
                {result.nextSteps.slice(0, 3).map((s) => (
                  <li>{s}</li>
                ))}
              </ol>
            </div>
          )}

          <p class="mt-3 text-caption leading-relaxed text-ink-tertiary">
            Detector provenance: {result.meta.detectorIds.length ? result.meta.detectorIds.join(", ") : "none"} · analyzer {result.meta.analyzerVersion} · multiple signals → higher risk (weights hidden to avoid evasion).
          </p>
        </div>
      ) : (
        <p class="mt-4 text-sm text-ink-tertiary">Type at least a few characters to simulate.</p>
      )}

      <p class="mt-4 text-caption leading-relaxed text-ink-tertiary">
        Client-only. <a href="/how-it-works#detectors" class="underline decoration-hairline-strong underline-offset-4 hover:text-ink-muted">See all detectors →</a>
      </p>
    </section>
  );
}
