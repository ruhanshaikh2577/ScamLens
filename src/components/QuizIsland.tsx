import { useState, useMemo, useEffect } from "preact/hooks";
import { analyze } from "../lib/analyzer";
import enDict from "../i18n/translations/en";
import { routes } from "../i18n/ui";
import type { Lang } from "../i18n/ui";

// ponytail: keep en bundled, lazy-load other locales like CheckerIsland (scenario texts stay English: analyzer inputs)
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

type Answer = "scam" | "legit";

interface Scenario {
  text: string;
  answer: Answer;
  detector: string;
  explainKey: string;
  contextKey: string;
}

const SCENARIOS: Scenario[] = [
  {
    text: "Courier: Your parcel is on hold. Pay a $1.99 redelivery fee today https://bit.ly/post99",
    answer: "scam",
    detector: "payment-request",
    explainKey: "quiz.s1.explain",
    contextKey: "quiz.s1.context",
  },
  {
    text: "Bank: Your account will be blocked today. Confirm your identity by sharing the OTP 551203 immediately.",
    answer: "scam",
    detector: "otp-pin",
    explainKey: "quiz.s2.explain",
    contextKey: "quiz.s2.context",
  },
  {
    text: "Hi Mum, my phone broke and this is my new number. I'm stuck at the airport, please send $500 urgently.",
    answer: "scam",
    detector: "family-emergency",
    explainKey: "quiz.s3.explain",
    contextKey: "quiz.s3.context",
  },
  {
    text: "Power Co: Your electricity will be disconnected today at 8 PM for non-payment. Pay immediately or power will be cut.",
    answer: "scam",
    detector: "utility-disconnection",
    explainKey: "quiz.s4.explain",
    contextKey: "quiz.s4.context",
  },
  {
    text: "VIP trading group: guaranteed returns, daily profit. Pay a $99 registration fee to join and double your money in 7 days.",
    answer: "scam",
    detector: "investment-bait",
    explainKey: "quiz.s5.explain",
    contextKey: "quiz.s5.context",
  },
];

const RISK_KEY: Record<string, string> = {
  low: "checker.result.risk.low",
  medium: "checker.result.risk.medium",
  high: "checker.result.risk.high",
  critical: "checker.result.risk.critical",
};

export default function QuizIsland({ lang = "en" as Lang }: { lang?: Lang }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (lang !== "en" && !dicts[lang] && loaders[lang]) {
      loaders[lang]().then((d) => { dicts[lang] = d; forceUpdate((v) => v + 1); });
    }
  }, [lang]);
  const t = getT(lang);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[idx];
  const result = useMemo(() => analyze(scenario.text, "message", lang), [scenario.text, lang]);
  const matched = useMemo(
    () => result.findings.find((f) => f.id === scenario.detector) ?? result.findings[0] ?? null,
    [result.findings, scenario.detector]
  );

  // Localized how-it-works URL (slugs differ per locale, e.g. /es/como-funciona)
  const howUrl = lang === "en" ? "/how-it-works" : `/${lang}/${(routes[lang as Exclude<Lang, "en">] as Record<string, string> | undefined)?.["how-it-works"] ?? "how-it-works"}`;
  const homeUrl = lang === "en" ? "/" : `/${lang}/`;

  function choose(a: Answer) {
    if (show) return;
    setPicked(a);
    setShow(true);
    if (a === scenario.answer) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= SCENARIOS.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setShow(false);
  }

  function restart() {
    setIdx(0);
    setPicked(null);
    setShow(false);
    setScore(0);
    setFinished(false);
  }

  const correct = picked === scenario.answer;

  if (finished) {
    return (
      <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label={t("quiz.completeEyebrow")}>
        <p class="eyebrow">{t("quiz.completeEyebrow")}</p>
        <h3 class="card-title mt-2">{t("quiz.completeTitle")} {score} {t("quiz.completeOf")} {SCENARIOS.length}</h3>
        <p class="mt-2 text-body-sm leading-relaxed text-ink-muted">
          {t("quiz.completeBody")}
        </p>
        <div class="mt-6 flex gap-3">
          <button onClick={restart} class="btn btn-primary">{t("quiz.tryAgain")}</button>
          <a href={`${homeUrl}#checker`} class="btn btn-secondary">{t("quiz.checkReal")}</a>
        </div>
        <p class="mt-4 text-caption text-ink-tertiary">{t("quiz.localNote")}</p>
      </section>
    );
  }

  return (
    <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label={t("quiz.title")}>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="eyebrow">{t("quiz.eyebrow")}</p>
          <h3 class="card-title mt-2">{t("quiz.title")}</h3>
          <p class="mt-1 text-body-sm text-ink-muted">{t("quiz.subtitle")}</p>
        </div>
        <span class="shrink-0 rounded-full border border-hairline bg-surface-2 px-3 py-1 text-xs font-medium text-ink-muted">
          {idx + 1} / {SCENARIOS.length} · {t("quiz.scoreLabel")} {score}
        </span>
      </div>

      <div class="mt-5 flex gap-1.5" aria-hidden="true">
        {SCENARIOS.map((_, i) => (
          <span class={`h-1 flex-1 rounded-full ${i < idx ? "bg-primary" : i === idx ? "bg-primary-hover" : "bg-surface-3"}`} />
        ))}
      </div>

      <div class="mt-6 rounded-lg border border-hairline bg-canvas p-4">
        <p class="text-caption font-medium tracking-wide text-ink-subtle">{t(scenario.contextKey)}</p>
        <p class="mt-2 font-mono text-sm leading-relaxed text-ink">"{scenario.text}"</p>
      </div>

      <div class="mt-4 flex gap-3">
        <button
          onClick={() => choose("scam")}
          disabled={show}
          class={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
            show && picked === "scam"
              ? correct
                ? "border-success/40 bg-success/10 text-ink"
                : "border-hairline-strong bg-surface-2 text-ink"
              : show && scenario.answer === "scam"
              ? "border-success/40 bg-success/10 text-ink"
              : "border-hairline bg-surface-2 text-ink hover:border-hairline-strong"
          } disabled:cursor-default`}
        >
          {t("quiz.scamBtn")}
        </button>
        <button
          onClick={() => choose("legit")}
          disabled={show}
          class={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
            show && picked === "legit"
              ? correct
                ? "border-success/40 bg-success/10 text-ink"
                : "border-hairline-strong bg-surface-2 text-ink"
              : show && scenario.answer === "legit"
              ? "border-success/40 bg-success/10 text-ink"
              : "border-hairline bg-surface-2 text-ink hover:border-hairline-strong"
          } disabled:cursor-default`}
        >
          {t("quiz.legitBtn")}
        </button>
      </div>

      {show && (
        <div class="fade-in mt-6 rounded-lg border border-hairline bg-surface-2 p-4">
          <p class={`text-sm font-medium ${correct ? "text-success" : "text-primary-hover"}`}>{correct ? t("quiz.correct") : t("quiz.notQuite")} — {scenario.answer === "scam" ? t("quiz.isScam") : t("quiz.isBenign")}</p>

          {matched ? (
            <div class="mt-3">
              <p class="text-sm font-medium text-ink">{matched.label}</p>
              <code class="evidence-pill mt-1.5">{matched.evidence}</code>
              <p class="mt-2 text-sm leading-relaxed text-ink-muted">{t(scenario.explainKey)}</p>
              <p class="mt-2 text-caption text-ink-tertiary">
                Detector: <span class="font-mono text-ink-muted">{matched.id}</span> · {t("quiz.detectorWhy")}
              </p>
              <p class="mt-1 text-caption text-ink-tertiary">{t("quiz.fullRisk")} <span class="font-medium text-ink-subtle">{t(RISK_KEY[result.risk] ?? "checker.result.risk.low")}</span> · {result.headline}</p>
            </div>
          ) : (
            <p class="mt-2 text-sm text-ink-muted">{t(scenario.explainKey)}</p>
          )}

          <div class="mt-4 flex gap-3">
            <button onClick={next} class="btn btn-primary flex-1">{idx + 1 === SCENARIOS.length ? t("quiz.seeScore") : t("quiz.next")}</button>
            <a href={`${howUrl}#detectors`} class="btn btn-secondary flex-1 text-center">{t("quiz.howDetect")}</a>
          </div>
        </div>
      )}

      <p class="mt-4 text-caption leading-relaxed text-ink-tertiary">{t("quiz.methodNote")} <a href={howUrl} class="underline decoration-hairline-strong underline-offset-4 hover:text-ink-muted">{t("quiz.methodLink")}</a></p>
    </section>
  );
}
