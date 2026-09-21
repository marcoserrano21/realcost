import { getLog } from "./storage";
import { dayIndexMonBased, startOfWeek, WEEK_MS } from "./week";
import { sumHoursKeptFromEntries, type HoursKeptTotals } from "./hoursKept";

export type { HoursKeptTotals };
export { sumHoursKeptFromEntries } from "./hoursKept";

export type PausedStreak = {
  /** Consecutive calendar weeks (Mon–Sun) with at least one skip, ending this week. */
  weekStreak: number;
  /** Hours paused from skips this week. */
  hoursThisWeek: number;
  /** Skip count this week. */
  skipsThisWeek: number;
  /** Sum of skip prices this week. */
  dollarsPausedThisWeek: number;
  /** Skip hours Mon→Sun (index 0 = Monday). */
  dayBars: number[];
  /** Index of today within dayBars (0–6), Mon-based. */
  todayIndex: number;
  /** Best single-week skip hours in the log. */
  bestWeekHours: number;
  /** Longest consecutive Mon–Sun streak ever observed in the log. */
  longestStreak: number;
};

export { startOfWeek } from "./week";

/** Weekly “hours paused” streak from local decision log. */
export function getPausedStreak(now = Date.now()): PausedStreak {
  const log = getLog();
  const thisWeekStart = startOfWeek(now);
  const skips = log.filter((e) => e.choice === "skipped");

  const thisWeekSkips = skips.filter((e) => e.timestamp >= thisWeekStart);
  const hoursThisWeek = thisWeekSkips.reduce((sum, e) => sum + e.hours, 0);
  const dollarsPausedThisWeek = thisWeekSkips.reduce((sum, e) => sum + e.price, 0);

  const dayBars = [0, 0, 0, 0, 0, 0, 0];
  for (const entry of thisWeekSkips) {
    dayBars[dayIndexMonBased(entry.timestamp)] += entry.hours;
  }

  const weekHours = new Map<number, number>();
  for (const entry of skips) {
    const key = startOfWeek(entry.timestamp);
    weekHours.set(key, (weekHours.get(key) ?? 0) + entry.hours);
  }

  let bestWeekHours = 0;
  for (const hours of weekHours.values()) {
    if (hours > bestWeekHours) bestWeekHours = hours;
  }

  let weekStreak = 0;
  let cursor = thisWeekStart;
  // If this week has no skips yet, streak still counts prior weeks (don’t break on empty current week).
  if ((weekHours.get(cursor) ?? 0) <= 0) {
    cursor -= WEEK_MS;
  }
  while ((weekHours.get(cursor) ?? 0) > 0) {
    weekStreak += 1;
    cursor -= WEEK_MS;
  }

  let longestStreak = 0;
  if (weekHours.size > 0) {
    const keys = [...weekHours.keys()].sort((a, b) => a - b);
    let run = 0;
    let prev = keys[0]! - WEEK_MS;
    for (const key of keys) {
      if ((weekHours.get(key) ?? 0) <= 0) {
        run = 0;
        prev = key;
        continue;
      }
      if (key === prev + WEEK_MS) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > longestStreak) longestStreak = run;
      prev = key;
    }
  }
  if (weekStreak > longestStreak) longestStreak = weekStreak;

  return {
    weekStreak,
    hoursThisWeek,
    skipsThisWeek: thisWeekSkips.length,
    dollarsPausedThisWeek,
    dayBars,
    todayIndex: dayIndexMonBased(now),
    bestWeekHours,
    longestStreak,
  };
}

export function getHoursKeptTotals(now = Date.now()): HoursKeptTotals {
  return sumHoursKeptFromEntries(getLog(), now);
}
