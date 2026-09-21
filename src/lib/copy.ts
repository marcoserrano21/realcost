import type { Choice, Tone } from "./storage";
import { formatHours, formatMoney } from "./calc";

export type DecisionCopy = {
  title: string;
  body: string;
  primaryLabel: string;
};

/** Tone-aware headline + body for the post-decision sheet. */
export function getDecisionCopy(
  choice: Choice,
  tone: Tone,
  hours: number,
  price: number,
  weeklySkippedHours: number
): DecisionCopy {
  const h = formatHours(hours);
  const p = formatMoney(price);

  const copy: Record<Tone, Record<Choice, DecisionCopy>> = {
    gentle: {
      bought: {
        title: "You bought it. That's okay.",
        body: `${p} was ${h} of your work. Enjoy it without the guilt trip.`,
        primaryLabel: "Got it",
      },
      thinking: {
        title: "Good. Sit with it a little longer.",
        body: `Some decisions deserve a beat. Come back to this ${p} whenever you're ready.`,
        primaryLabel: "Okay",
      },
      skipped: {
        title: "Nice pause.",
        body: `That's ${h} back in your pocket. You've paused ${formatHours(weeklySkippedHours)} this week.`,
        primaryLabel: "Keep going",
      },
    },
    direct: {
      bought: {
        title: "Logged.",
        body: `${h} of work, spent on ${p}. Moving on.`,
        primaryLabel: "Done",
      },
      thinking: {
        title: "Parked for later.",
        body: `No rush. ${p} will still be there when you're sure.`,
        primaryLabel: "Noted",
      },
      skipped: {
        title: "Skipped.",
        body: `${h} stayed yours. ${formatHours(weeklySkippedHours)} paused this week.`,
        primaryLabel: "Next",
      },
    },
    hype: {
      bought: {
        title: "Treat secured.",
        body: `${p} well spent. That's ${h} of work you decided was worth it.`,
        primaryLabel: "Let's go",
      },
      thinking: {
        title: "Smart pause.",
        body: `Sleeping on a ${p} decision is a power move. Come back anytime.`,
        primaryLabel: "Nice",
      },
      skipped: {
        title: "That's a win.",
        body: `You just banked ${h}. ${formatHours(weeklySkippedHours)} paused this week. Keep it up.`,
        primaryLabel: "Keep winning",
      },
    },
    curious: {
      bought: {
        title: "Interesting choice.",
        body: `What made ${p} (${h} of work) feel worth it in this moment?`,
        primaryLabel: "Hmm",
      },
      thinking: {
        title: "Still open.",
        body: `What would tip ${p} from maybe to yes, or to no?`,
        primaryLabel: "I'll sit with it",
      },
      skipped: {
        title: "You passed.",
        body: `What felt clearer after seeing ${h}? You've paused ${formatHours(weeklySkippedHours)} this week.`,
        primaryLabel: "Keep noticing",
      },
    },
  };

  return copy[tone][choice];
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

export function getCompareIntroCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "No pressure. See what it means for your time, then decide.",
    direct: "Enter your rate. See the number. That's it.",
    hype: "Your turn. Let's see your number.",
    curious: "What does the same price look like in your hours?",
  };
  return copy[tone];
}

export function getCompareRevealCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Money doesn't cost everyone the same.",
    direct: "Same price. Different math.",
    hype: "Same $, totally different story. Wild, right?",
    curious: "Same dollars. Different lives. What stands out?",
  };
  return copy[tone];
}

export function getFeedEmptyCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Nothing shared yet. Send a price from Home and watch for replies here.",
    direct: "No shares logged. Send one from Home.",
    hype: "Empty for now. Send your first price from Home and watch it land.",
    curious: "Nothing shared yet. Whose reality do you want next to yours?",
  };
  return copy[tone];
}

export function getHistoryEmptyCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Nothing logged yet. Your decisions will show up here once you start.",
    direct: "No entries yet.",
    hype: "Your history is a blank page. Let's fill it in.",
    curious: "No moments yet. What purchase are you weighing first?",
  };
  return copy[tone];
}
