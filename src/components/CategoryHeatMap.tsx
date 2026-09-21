"use client";

import { formatHours } from "@/lib/calc";
import type { CategoryHeatRow } from "@/lib/categoryHeat";

export default function CategoryHeatMap({ rows }: { rows: CategoryHeatRow[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="category-heat surface-card" aria-label="Category heat map">
      <div className="feed-item-row">
        <h2 className="field-label" style={{ margin: 0 }}>
          Life cost by category
        </h2>
        <span className="text-xs text-[var(--subtle)]">Hours of work</span>
      </div>
      <ul className="category-heat-list">
        {rows.map((row) => (
          <li key={row.key} className="category-heat-row">
            <div className="category-heat-meta">
              <span>{row.label}</span>
              <span className="tabular-nums text-[var(--champagne)]">{formatHours(row.hours)}</span>
            </div>
            <div className="category-heat-track" aria-hidden="true">
              <span className="category-heat-fill" style={{ width: `${Math.max(8, row.share * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
