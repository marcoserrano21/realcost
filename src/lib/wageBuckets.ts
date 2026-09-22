/** Wage range buckets for onboarding. Midpoints store into realcost:units.hourlyWage. */

export type WageBucketId = "15_20" | "20_25" | "25_35" | "35_plus" | "custom";

export type WageBucket = {
  id: WageBucketId;
  label: string;
  /** Midpoint for non-custom buckets; null for custom (user types exact). */
  midpoint: number | null;
};

export const WAGE_BUCKETS: WageBucket[] = [
  { id: "15_20", label: "$15–20/hr", midpoint: 17.5 },
  { id: "20_25", label: "$20–25/hr", midpoint: 22.5 },
  { id: "25_35", label: "$25–35/hr", midpoint: 30 },
  { id: "35_plus", label: "$35+/hr", midpoint: 45 },
  { id: "custom", label: "Custom", midpoint: null },
];

/** Midpoint for a known bucket, or null for custom / unknown. */
export function midpointForBucket(id: WageBucketId): number | null {
  const bucket = WAGE_BUCKETS.find((b) => b.id === id);
  return bucket?.midpoint ?? null;
}

/** Format a midpoint for the money input (no trailing .0). */
export function formatBucketWage(midpoint: number): string {
  if (!Number.isFinite(midpoint) || midpoint <= 0) return "";
  return Number.isInteger(midpoint) ? String(midpoint) : String(midpoint);
}
