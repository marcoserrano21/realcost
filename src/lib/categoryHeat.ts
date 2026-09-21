import { getLog } from "./storage";
import type { Choice, PurchaseCategory } from "./storage";
import { PURCHASE_CATEGORY_OPTIONS } from "./personalizationOptions";

export type CategoryHeatRow = {
  key: string;
  label: string;
  hours: number;
  count: number;
  share: number;
};

/** Analytical lenses for the History category heat map. */
export type CategoryHeatMetric = "kept" | "thinking" | "bought";

export const CATEGORY_HEAT_METRICS: {
  value: CategoryHeatMetric;
  label: string;
  choice: Choice;
  headline: string;
  hint: string;
}[] = [
  {
    value: "kept",
    label: "Hours kept",
    choice: "skipped",
    headline: "Where your pauses went",
    hint: "Skipped decisions — hours you banked",
  },
  {
    value: "thinking",
    label: "Hours thinking",
    choice: "thinking",
    headline: "Still on the fence",
    hint: "Open decisions — hours still in play",
  },
  {
    value: "bought",
    label: "Hours spent",
    choice: "bought",
    headline: "Where hours were spent",
    hint: "Bought — hours traded for the thing",
  },
];

export function metricMeta(metric: CategoryHeatMetric) {
  return CATEGORY_HEAT_METRICS.find((m) => m.value === metric) ?? CATEGORY_HEAT_METRICS[0]!;
}

/** Hours-of-life by purchase category for History heat map. */
export function getCategoryHeat(
  metric: CategoryHeatMetric = "kept",
  limit = PURCHASE_CATEGORY_OPTIONS.length + 1
): CategoryHeatRow[] {
  const { choice } = metricMeta(metric);
  const log = getLog().filter((entry) => entry.choice === choice);
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
