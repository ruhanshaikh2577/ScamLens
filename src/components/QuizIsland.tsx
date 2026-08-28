import { useState, useMemo } from "preact/hooks";
import { analyze } from "../lib/analyzer";

type Answer = "scam" | "legit";

interface Scenario {
  text: string;
  answer: Answer;
  detector: string;
  explain: string;
  context: string;
}

const SCENARIOS: Scenario[] = [
  {
    text: "DTDC: Your parcel is on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99",
    answer: "scam",
    detector: "payment-request",
    explain: "Fee to receive a parcel — legitimate couriers never ask you to pay via a short link to release a parcel.",
    context: "Courier fee bait",
  },
  {
    text: "SBI: Your account will be blocked today. Confirm your identity by sharing the OTP 551203 immediately.",
    answer: "scam",
    detector: "otp-pin",
    explain: "No bank ever asks for your OTP. The urgency + OTP ask is the core theft pattern.",
    context: "OTP theft + urgency",
  },
  {
    text: "Hi Mum, my phone broke and this is my new number. I'm stuck at the airport, please send Rs 8000 urgently.",
    answer: "scam",
    detector: "family-emergency",
    explain: "New number + family name + emergency + money request is the 'Hi Mum' impersonation. A callback to the old number breaks it.",
    context: "Family emergency",
  },
  {
    text: "BSES: Your electricity will be disconnected today at 8 PM for non-payment. Pay via UPI immediately or power will be cut.",
    answer: "scam",
    detector: "utility-disconnection",
    explain: "Boards never demand instant UPI payment over text. Real bills are checked in the official app.",
    context: "Utility threat",
  },
  {
    text: "VIP trading group: guaranteed returns, daily profit. Pay Rs 5000 registration fee to join and double your money in 7 days.",
    answer: "scam",
    detector: "investment-bait",
    explain: "Guaranteed returns don't exist — and no SEBI-registered adviser recruits via chat groups.",
    context: "Investment bait",
  },
];

export default function QuizIsland() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[idx];
  const result = useMemo(() => analyze(scenario.text, "message"), [scenario.text]);
  const matched = useMemo(
    () => result.findings.find((f) => f.id === scenario.detector) ?? result.findings[0] ?? null,
    [result.findings, scenario.detector]
  );

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
      <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label="Quiz result">
        <p class="eyebrow">Quiz complete</p>
        <h3 class="card-title mt-2">You spotted {score} of {SCENARIOS.length}</h3>
        <p class="mt-2 text-body-sm leading-relaxed text-ink-muted">
          Every question was a real scam pattern from the analyzer. The signals to remember: payment fees, OTP asks, new-number family pleas, tonight-only threats, and guaranteed returns.
        </p>
        <div class="mt-6 flex gap-3">
          <button onClick={restart} class="btn btn-primary">Try again</button>
          <a href="/#checker" class="btn btn-secondary">Check a real message</a>
        </div>
        <p class="mt-4 text-caption text-ink-tertiary">Runs locally — no data leaves your device. No numeric weights shown — we teach the pattern, not the score.</p>
      </section>
    );
  }

  return (
    <section class="mx-auto w-full max-w-3xl rounded-xl border border-hairline bg-surface-1 p-6 sm:p-8" aria-label="Scam quiz">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="eyebrow">Learn by doing</p>
          <h3 class="card-title mt-2">Can you spot the scam?</h3>
          <p class="mt-1 text-body-sm text-ink-muted">5 real patterns — pick Scam or Looks OK, then see the exact signal we flagged.</p>
        </div>
        <span class="shrink-0 rounded-full border border-hairline bg-surface-2 px-3 py-1 text-xs font-medium text-ink-muted">
          {idx + 1} / {SCENARIOS.length} · Score {score}
        </span>
      </div>

      <div class="mt-5 flex gap-1.5" aria-hidden="true">
        {SCENARIOS.map((_, i) => (
          <span class={`h-1 flex-1 rounded-full ${i < idx ? "bg-primary" : i === idx ? "bg-primary-hover" : "bg-surface-3"}`} />
        ))}
      </div>

      <div class="mt-6 rounded-lg border border-hairline bg-canvas p-4">
        <p class="text-caption font-medium tracking-wide text-ink-subtle">{scenario.context}</p>
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
          Scam
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
          Looks OK
        </button>
      </div>

      {show && (
        <div class="fade-in mt-6 rounded-lg border border-hairline bg-surface-2 p-4">
          <p class={`text-sm font-medium ${correct ? "text-success" : "text-primary-hover"}`}>{correct ? "Correct" : "Not quite"} — {scenario.answer === "scam" ? "this is a scam pattern" : "this looks benign"}</p>

          {matched ? (
            <div class="mt-3">
              <p class="text-sm font-medium text-ink">{matched.label}</p>
              <code class="evidence-pill mt-1.5">{matched.evidence}</code>
              <p class="mt-2 text-sm leading-relaxed text-ink-muted">{scenario.explain}</p>
              <p class="mt-2 text-caption text-ink-tertiary">
                Detector: <span class="font-mono text-ink-muted">{matched.id}</span> · why it matters: flagged signal quoted above; verify via official channel, never the contact in the message.
              </p>
              <p class="mt-1 text-caption text-ink-tertiary">Full analysis risk: <span class="font-medium text-ink-subtle">{result.risk}</span> · {result.headline}</p>
            </div>
          ) : (
            <p class="mt-2 text-sm text-ink-muted">{scenario.explain}</p>
          )}

          <div class="mt-4 flex gap-3">
            <button onClick={next} class="btn btn-primary flex-1">{idx + 1 === SCENARIOS.length ? "See score" : "Next"}</button>
            <a href="/how-it-works#detectors" class="btn btn-secondary flex-1 text-center">How we detect this</a>
          </div>
        </div>
      )}

      <p class="mt-4 text-caption leading-relaxed text-ink-tertiary">Client-only — runs the same checker as the analyzer. We show the detector label and step, not the numeric weight, so patterns are learned without gaming the score. <a href="/how-it-works" class="underline decoration-hairline-strong underline-offset-4 hover:text-ink-muted">Methodology →</a></p>
    </section>
  );
}
