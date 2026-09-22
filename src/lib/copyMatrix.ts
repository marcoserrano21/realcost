import type { Choice, Tone } from "./storage";

export type DecisionCopy = {
  title: string;
  body: string;
  primaryLabel: string;
};

/**
 * Tone × choice matrix using preformatted labels (no calc import).
 * Callers pass formatHours / formatMoney results.
 */
export function buildDecisionCopy(
  choice: Choice,
  tone: Tone,
  h: string,
  p: string,
  weeklySkippedLabel: string
): DecisionCopy {
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
        body: `That's ${h} back in your pocket. You've paused ${weeklySkippedLabel} this week.`,
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
        body: `${h} stayed yours. ${weeklySkippedLabel} paused this week.`,
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
        body: `You just banked ${h}. ${weeklySkippedLabel} paused this week. Keep it up.`,
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
        body: `What felt clearer after seeing ${h}? You've paused ${weeklySkippedLabel} this week.`,
        primaryLabel: "Keep noticing",
      },
    },
    deadpan: {
      bought: {
        title: "Noted.",
        body: `Bro really said yes to ${h} for ${p}. Respect the commitment.`,
        primaryLabel: "Ok cool",
      },
      thinking: {
        title: "In the maybe pile.",
        body: `${p} is just vibing in limbo until further notice.`,
        primaryLabel: "Sure",
      },
      skipped: {
        title: "Declined.",
        body: `${h} stayed home. You've paused ${weeklySkippedLabel} this week. The algorithm is shook.`,
        primaryLabel: "Moving on",
      },
    },
  };

  return copy[tone][choice];
}

export function getCompareIntroCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "No pressure. See what it means for your time, then decide.",
    direct: "Enter your rate. See the number. That's it.",
    hype: "Your turn. Let's see your number.",
    curious: "What does the same price look like in your hours?",
    deadpan: "Enter your rate. Receive the number. Process briefly. Continue.",
  };
  return copy[tone];
}

export function getCompareRevealCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Money doesn't cost everyone the same.",
    direct: "Same price. Different math.",
    hype: "Same $, totally different story. Wild, right?",
    curious: "Same dollars. Different lives. What stands out?",
    deadpan: "Same receipt. Different life plot. Cool.",
  };
  return copy[tone];
}

export function getFeedEmptyCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Nothing shared yet. Send a price from Home and watch for replies here.",
    direct: "No shares logged. Send one from Home.",
    hype: "Empty for now. Send your first price from Home and watch it land.",
    curious: "Nothing shared yet. Whose reality do you want next to yours?",
    deadpan: "Feed is empty. The void is waiting for your first share.",
  };
  return copy[tone];
}

export function getHistoryEmptyCopy(tone: Tone): string {
  const copy: Record<Tone, string> = {
    gentle: "Nothing logged yet. Your decisions will show up here once you start.",
    direct: "No entries yet.",
    hype: "Your history is a blank page. Let's fill it in.",
    curious: "No moments yet. What purchase are you weighing first?",
    deadpan: "No lore yet. Log a decision and the archive begins.",
  };
  return copy[tone];
}
