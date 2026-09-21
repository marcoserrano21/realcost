/** Pure hours-kept totals (no localStorage). */

function startOfWeekLocal(ts: number): number {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export type HoursKeptTotals = {
  hoursThisWeek: number;
  hoursAllTime: number;
  skipsAllTime: number;
};

export function sumHoursKeptFromEntries(
  entries: { choice: string; hours: number; timestamp: number }[],
  now = Date.now()
): HoursKeptTotals {
  const weekStart = startOfWeekLocal(now);
  const skips = entries.filter((e) => e.choice === "skipped");
  const hoursAllTime = skips.reduce((s, e) => s + e.hours, 0);
  const hoursThisWeek = skips
    .filter((e) => e.timestamp >= weekStart)
    .reduce((s, e) => s + e.hours, 0);
  return { hoursThisWeek, hoursAllTime, skipsAllTime: skips.length };
}
