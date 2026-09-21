import type { LogEntry } from "./storage";

export type HistoryTotals = {
  price: number;
  hours: number;
  count: number;
};

export function sumHistory(entries: Pick<LogEntry, "price" | "hours">[]): HistoryTotals {
  return entries.reduce<HistoryTotals>(
    (acc, entry) => {
      acc.price += entry.price;
      acc.hours += entry.hours;
      acc.count += 1;
      return acc;
    },
    { price: 0, hours: 0, count: 0 }
  );
}
