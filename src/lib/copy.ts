import type { Choice, Tone } from "./storage";
import { formatHours, formatMoney } from "./calc";
import { buildDecisionCopy, type DecisionCopy } from "./copyMatrix";

export type { DecisionCopy } from "./copyMatrix";
export {
  getCompareIntroCopy,
  getCompareRevealCopy,
  getFeedEmptyCopy,
  getHistoryEmptyCopy,
} from "./copyMatrix";

/** Tone-aware headline + body for the post-decision sheet. */
export function getDecisionCopy(
  choice: Choice,
  tone: Tone,
  hours: number,
  price: number,
  weeklySkippedHours: number
): DecisionCopy {
  return buildDecisionCopy(
    choice,
    tone,
    formatHours(hours),
    formatMoney(price),
    formatHours(weeklySkippedHours)
  );
}

export function getFocusLabel(focus: string): string {
  switch (focus) {
    case "shopping":
      return "shopping & style";
    case "eating_out":
      return "eating out";
    case "subscriptions":
      return "subscriptions";
    case "big_purchases":
      return "big-ticket items";
    case "impulse":
      return "impulse buys";
    default:
      return "your spending";
  }
}

/** Neutral weekly summary, not tied to personalization focus. */
export function getWeekSummaryLine(summary: {
  considered: number;
  skippedCount: number;
  skippedHours: number;
}): string {
  if (summary.considered === 0) {
    return "Every decision you log will show up here.";
  }
  const parts: string[] = [];
  parts.push(
    `${summary.considered} decision${summary.considered === 1 ? "" : "s"} this week`
  );
  if (summary.skippedCount > 0) {
    parts.push(
      `${summary.skippedCount} skipped (${summary.skippedHours.toFixed(1)}h paused)`
    );
  }
  return parts.join(" · ");
}
