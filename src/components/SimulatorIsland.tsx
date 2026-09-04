import { useMemo, useState, useEffect } from "preact/hooks";
import { analyze } from "../lib/analyzer";
import { looksLikeUrl } from "../lib/url";
import enDict from "../i18n/translations/en";
import { routes } from "../i18n/ui";
import type { Lang } from "../i18n/ui";

// ponytail: keep en bundled, lazy-load other locales like CheckerIsland (preset texts stay English: analyzer inputs)
const dicts: Record<string, Record<string, string>> = {
  en: enDict as unknown as Record<string, string>,
};
const loaders: Record<string, () => Promise<Record<string, string>>> = {
  es: () => import("../i18n/translations/es").then((m) => m.default as unknown as Record<string, string>),
  fr: () => import("../i18n/translations/fr").then((m) => m.default as unknown as Record<string, string>),
  de: () => import("../i18n/translations/de").then((m) => m.default as unknown as Record<string, string>),
  "pt-br": () => import("../i18n/translations/pt-br").then((m) => m.default as unknown as Record<string, string>),
  it: () => import("../i18n/translations/it").then((m) => m.default as unknown as Record<string, string>),
  ja: () => import("../i18n/translations/ja").then((m) => m.default as unknown as Record<string, string>),
  ko: () => import("../i18n/translations/ko").then((m) => m.default as unknown as Record<string, string>),
};
function getT(lang: string) {
  const d = (dicts[lang] ?? dicts.en) as Record<string, string>;
  const fb = dicts.en as Record<string, string>;
  return (key: string) => d[key] ?? fb[key] ?? key;
}

interface Preset {
  labelKey: string;
  text: string;
}

const PRESETS: Preset[] = [
  { labelKey: "sim.preset.legit", text: "Hi Ma, reaching home by 8pm. Send love to everyone." },
  { labelKey: "sim.preset.courier", text: "DTDC: Your parcel is on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99" },
  { labelKey: "sim.preset.otp", text: "SBI: Your account will be blocked today. Confirm your identity by sharing the OTP 551203 immediately." },
  { labelKey: "sim.preset.family", text: "Hi Mum, my phone broke and this is my new number. I'm stuck at the airport, please send Rs 8000 urgently." },
  { labelKey: "sim.preset.power", text: "BSES: Your electricity will be disconnected today at 8 PM for non-payment. Pay via UPI immediately or power will be cut." },
  { labelKey: "sim.preset.investment", text: "VIP trading group: guaranteed returns, daily profit. Pay Rs 5000 registration fee to join and double your money in 7 days." },
];

const RISK_CLASS: Record<string, string> = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  critical: "risk-critical",
};

const RISK_KEY: Record<string, string> = {
  low: "checker.result.risk.low",
  medium: "checker.result.risk.medium",
  high: "checker.result.risk.high",
  critical: "checker.result.risk.critical",
};

export default function SimulatorIsland({ lang = "en" as Lang }: { lang?: Lang }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (lang !== "en" && !dicts[lang] && loaders[lang]) {
      loaders[lang]().then((d) => { dicts[lang] = d; forceUpdate((v) => v + 1); });
    }
  }, [lang]);
  const t = getT(lang);
  const [text, setText] = useState(PRESETS[0].text);

  // Localized how-it-works URL (slugs differ per locale, e.g. /es/como-funciona)
  const howUrl = lang === "en" ? "/how-it-works" : `/${lang}/${(routes[lang as Exclude<Lang, "en">] as Record<string, string> | undefined)?.["how-it-works"] ?? "how-it-works"}`;

  const result = useMemo(() => {
    const t = text.trim();
    if (t.length < 4) return null;
    // single-link input → url checks; otherwise message checks
    const isSingleUrl = !t.includes("\n") && t.length < 2048 && looksLikeUrl(t);
    return analyze(text, isSingleUrl ? "url" : "message");
  }, [text]);

  return (
    <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label={t("sim.eyebrow")}>
      <p class="eyebrow">{t("sim.eyebrow")}</p>
      <h3 class="card-title mt-2">{t("sim.title")}</h3>
      <p class="mt-1 text-body-sm leading-relaxed text-ink-muted">
        {t("sim.subtitle")}
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.labelKey}
            onClick={() => setText(p.text)}
            class={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${text === p.text ? "border-primary/40 bg-primary/10 text-ink" : "border-hairline bg-canvas text-ink-muted hover:border-hairline-strong hover:text-ink"}`}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
        rows={4}
        maxlength={10000}
        placeholder={t("sim.placeholder")}
        aria-label={t("sim.placeholder")}
        class="mt-4 w-full resize-y rounded-md border border-hairline bg-canvas px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-tertiary focus:border-hairline-strong focus:outline-none"
      />
      <p class="mt-1 text-caption text-ink-tertiary">{t("sim.hint")}</p>

      {result ? (
        <div class="fade-in mt-6 rounded-lg border border-hairline bg-surface-2 p-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class={`risk-badge ${RISK_CLASS[result.risk] ?? "risk-low"}`}>
              <span class="risk-dot" />
              {t(RISK_KEY[result.risk] ?? "checker.result.risk.low")}
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
            <p class="mt-4 text-sm text-ink-muted">{t("sim.noMarkers")}</p>
          )}

          {result.nextSteps.length > 0 && (
            <div class="mt-4 border-t border-hairline pt-4">
              <p class="text-xs font-medium tracking-wide text-ink-subtle">{t("sim.whatNext")}</p>
              <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink-muted">
                {result.nextSteps.slice(0, 3).map((s) => (
                  <li>{s}</li>
                ))}
              </ol>
            </div>
          )}

          <p class="mt-3 text-caption leading-relaxed text-ink-tertiary">
            {t("sim.provenance")} {result.meta.detectorIds.length ? result.meta.detectorIds.join(", ") : "none"} · analyzer {result.meta.analyzerVersion} · {t("sim.provenanceSuffix")}
          </p>
        </div>
      ) : (
        <p class="mt-4 text-sm text-ink-tertiary">{t("sim.typeHint")}</p>
      )}

      <p class="mt-4 text-caption leading-relaxed text-ink-tertiary">
        {t("sim.clientNote")} <a href={`${howUrl}#detectors`} class="underline decoration-hairline-strong underline-offset-4 hover:text-ink-muted">{t("sim.seeDetectors")}</a>
      </p>
    </section>
  );
}
