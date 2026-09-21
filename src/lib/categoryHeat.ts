import { getLog } from "./storage";
import type { PurchaseCategory } from "./storage";
import { PURCHASE_CATEGORY_OPTIONS } from "./personalizationOptions";

export type CategoryHeatRow = {
  key: string;
  label: string;
  hours: number;
  count: number;
  share: number;
};

/** Hours-of-life by purchase category for History heat map. */
export function getCategoryHeat(limit = 6): CategoryHeatRow[] {
  const log = getLog();
  const buckets = new Map<string, { label: string; hours: number; count: number }>();

  for (const entry of log) {
    const key = entry.category ?? "uncategorized";
    const label =
      entry.categoryLabel ??
      PURCHASE_CATEGORY_OPTIONS.find((o) => o.value === (entry.category as PurchaseCategory))?.label ??
      "Uncategorized";
    const prev = buckets.get(key) ?? { label, hours: 0, count: 0 };
    prev.hours += entry.hours;
    prev.count += 1;
    buckets.set(key, prev);
  }

  const rows = [...buckets.entries()].map(([key, value]) => ({
    key,
    label: value.label,
    hours: value.hours,
    count: value.count,
    share: 0,
  }));

  const max = Math.max(...rows.map((r) => r.hours), 0.0001);
  for (const row of rows) {
    row.share = row.hours / max;
  }

  return rows.sort((a, b) => b.hours - a.hours).slice(0, limit);
}
