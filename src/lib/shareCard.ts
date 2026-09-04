import type { AnalysisResult, RiskLevel } from "./analyzer";

export const HISTORY_KEY = "scamlens:history";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: number;
  risk: RiskLevel;
  headline: string;
  detectorIds: string[];
  analyzerVersion: string;
  timestamp: string;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // Split on space but also handle long tokens (URLs/UPI) by hard-breaking mid-token
  const tokens = text.split(" ");
  const words: string[] = [];
  for (const tok of tokens) {
    if (ctx.measureText(tok).width <= maxWidth) {
      words.push(tok);
    } else {
      // hard-break long token char by char
      let chunk = "";
      for (const ch of tok) {
        const test = chunk + ch;
        if (ctx.measureText(test).width > maxWidth && chunk) {
          words.push(chunk);
          chunk = ch;
        } else chunk = test;
      }
      if (chunk) words.push(chunk);
    }
  }
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export function generateShareCard(r: AnalysisResult): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 600;
  const ctx = c.getContext("2d")!;
  // bg
  ctx.fillStyle = "#010102";
  ctx.fillRect(0, 0, c.width, c.height);
  // top hairline
  ctx.fillStyle = "#23252a";
  ctx.fillRect(0, 0, c.width, 1);
  // brand
  ctx.fillStyle = "#8a8f98";
  ctx.font = '500 13px "Inter Variable", Inter, system-ui, sans-serif';
  ctx.fillText("ScamLens  •  scamlens.in", 40, 36);
  // risk badge
  const riskLabel = r.risk.toUpperCase() + " RISK";
  ctx.font = '600 13px "Inter Variable", Inter, system-ui, sans-serif';
  const badgeW = ctx.measureText(riskLabel).width + 28;
  const badgeX = c.width - badgeW - 40;
  ctx.fillStyle = r.risk === "critical" ? "#DC2626" : r.risk === "high" ? "rgba(234,88,12,0.28)" : r.risk === "medium" ? "rgba(245,158,11,0.16)" : "#0F1A2E";
  // rounded rect
  const bh = 28;
  const by = 18;
  ctx.beginPath();
  const rr = 14;
  ctx.moveTo(badgeX + rr, by);
  ctx.lineTo(badgeX + badgeW - rr, by);
  ctx.quadraticCurveTo(badgeX + badgeW, by, badgeX + badgeW, by + rr);
  ctx.lineTo(badgeX + badgeW, by + bh - rr);
  ctx.quadraticCurveTo(badgeX + badgeW, by + bh, badgeX + badgeW - rr, by + bh);
  ctx.lineTo(badgeX + rr, by + bh);
  ctx.quadraticCurveTo(badgeX, by + bh, badgeX, by + bh - rr);
  ctx.lineTo(badgeX, by + rr);
  ctx.quadraticCurveTo(badgeX, by, badgeX + rr, by);
  ctx.fill();
  ctx.fillStyle = r.risk === "low" ? "#d0d6e0" : r.risk === "medium" ? "#828fff" : "#f7f8f8";
  ctx.fillText(riskLabel, badgeX + 14, by + 18);

  // headline - wrap
  ctx.fillStyle = "#f7f8f8";
  ctx.font = '600 34px "Inter Variable", Inter, system-ui, sans-serif';
  const headlineLines = wrap(ctx, r.headline, c.width - 80);
  headlineLines.forEach((line, i) => ctx.fillText(line, 40, 96 + i * 40));

  let y = 96 + headlineLines.length * 40 + 24;

  // findings - up to 2, evidence summary only (no raw input)
  ctx.font = '400 15px "Inter Variable", Inter, system-ui, sans-serif';
  const maxW = c.width - 80;
  r.findings.slice(0, 2).forEach((f) => {
    if (y > 480) return;
    ctx.fillStyle = "#d0d6e0";
    ctx.font = '600 15px "Inter Variable", Inter, system-ui, sans-serif';
    const label = f.label;
    ctx.fillText(label, 40, y);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = "#8a8f98";
    ctx.font = '400 13px ui-monospace, monospace';
    // evidence pill style: truncate
    const ev = f.evidence.length > 72 ? f.evidence.slice(0, 69) + "…" : f.evidence;
    const evLines = wrap(ctx, `"${ev}"`, maxW - lw - 16);
    // draw first evidence line inline if fits
    if (evLines.length === 1 && lw + ctx.measureText(evLines[0]).width + 20 < maxW) {
      ctx.fillText(evLines[0], 40 + lw + 12, y);
      y += 28;
    } else {
      y += 20;
      evLines.forEach((l) => {
        if (y > 500) return;
        ctx.fillText(l, 40, y);
        y += 18;
      });
      y += 8;
    }
  });

  if (r.findings.length === 0) {
    ctx.fillStyle = "#8a8f98";
    ctx.font = '400 14px "Inter Variable", Inter, system-ui, sans-serif';
    ctx.fillText("No common scam markers found — still verify via official channels.", 40, y);
    y += 28;
  }

  // footer
  ctx.fillStyle = "#8a8f98";
  ctx.font = '400 13px "Inter Variable", Inter, system-ui, sans-serif';
  ctx.fillText(`Verify: scamlens.in/how-it-works  —  analyzer ${r.meta.analyzerVersion}`, 40, 560);
  ctx.fillStyle = "#62666d";
  ctx.font = '400 11px "Inter Variable", Inter, system-ui, sans-serif';
  ctx.fillText("Decision support, not a guarantee. Verify via official channels.", 40, 580);
  // scamlens.in mark bottom-right
  ctx.fillStyle = "#62666d";
  ctx.textAlign = "right";
  ctx.fillText("scamlens.in", c.width - 40, 580);
  ctx.textAlign = "left";

  return c.toDataURL("image/png");
}

export function saveHistory(result: AnalysisResult): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const prev: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const entry: HistoryEntry = {
      id: Date.now(),
      risk: result.risk,
      headline: result.headline,
      detectorIds: result.meta.detectorIds.slice(0, 6),
      analyzerVersion: result.meta.analyzerVersion,
      timestamp: result.meta.timestamp,
    };
    const next = [entry, ...prev].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {}
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export async function shareCardDataUrl(dataUrl: string, filename: string, headline: string): Promise<"shared" | "downloaded" | "failed"> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    // @ts-ignore - canShare is optional
    if (typeof navigator !== "undefined" && (navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
      await (navigator as any).share({ files: [file], title: "ScamLens", text: headline });
      return "shared";
    }
  } catch {}
  // fallback download
  try {
    if (typeof document !== "undefined") {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return "downloaded";
    }
  } catch {}
  return "failed";
}
