const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

/** Monday 00:00:00 local for the week containing `ts`. */
export function startOfWeek(ts: number): number {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7; // Mon = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

/** 0 = Monday … 6 = Sunday */
export function dayIndexMonBased(ts: number): number {
  return (new Date(ts).getDay() + 6) % 7;
}
