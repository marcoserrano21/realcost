/** Pure A2HS gating helpers (no localStorage). */

export type A2HSPeakReason = "share" | "skipped";

export function isMeaningfulHoursKept(hours: number): boolean {
  return Number.isFinite(hours) && hours >= 1;
}

export function shouldShowA2HS(opts: {
  dismissed: boolean;
  standalone: boolean;
  peak: A2HSPeakReason | null;
  decisions: number;
}): boolean {
  if (opts.dismissed || opts.standalone) return false;
  if (opts.peak === "share" || opts.peak === "skipped") return true;
  return opts.decisions >= 3;
}
