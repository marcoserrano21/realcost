"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatHours } from "@/lib/calc";
import {
  CATEGORY_HEAT_METRICS,
  metricMeta,
  type CategoryHeatMetric,
  type CategoryHeatRow,
} from "@/lib/categoryHeat";

export default function CategoryHeatMap({
  rows,
  metric,
  onMetricChange,
}: {
  rows: CategoryHeatRow[];
  metric: CategoryHeatMetric;
  onMetricChange: (metric: CategoryHeatMetric) => void;
}) {
  const meta = metricMeta(metric);
  const triggerId = useId();
  const listId = `${triggerId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointer);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className="category-heat surface-card" aria-label={meta.headline}>
      <div className="category-heat-header">
        <h2 className="field-label" style={{ margin: 0 }}>
          {meta.headline}
        </h2>
        <div className={`category-heat-metric${open ? " is-open" : ""}`} ref={rootRef}>
          <button
            type="button"
            id={triggerId}
            className="category-heat-metric-trigger pressable"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label="Heat map metric"
            title={meta.hint}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{meta.label}</span>
            <span className={`settings-chevron${open ? " is-open" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {open ? (
            <ul id={listId} className="category-heat-metric-menu" role="listbox" aria-labelledby={triggerId}>
              {CATEGORY_HEAT_METRICS.map((option) => {
                const selected = option.value === metric;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`category-heat-metric-option pressable${selected ? " is-selected" : ""}`}
                      onClick={() => {
                        onMetricChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span className="category-heat-metric-option-label">{option.label}</span>
                      <span className="category-heat-metric-option-hint">{option.hint}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="category-heat-empty">No {meta.label.toLowerCase()} logged in these categories yet.</p>
      ) : (
        <ul className="category-heat-list">
          {rows.map((row) => (
            <li key={row.key} className="category-heat-row">
              <div className="category-heat-meta">
                <span>{row.label}</span>
                <span className="tabular-nums text-[var(--champagne)]">{formatHours(row.hours)}</span>
              </div>
              <div className="category-heat-track" aria-hidden="true">
                <span
                  className={`category-heat-fill category-heat-fill-${metric}`}
                  style={{ ["--fill" as string]: Math.max(0.08, row.share) }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
