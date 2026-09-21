"use client";

import { useEffect, useState } from "react";
import { formatDinners, formatHours, formatMoney, formatShifts } from "@/lib/calc";
import type { RealCostResult } from "@/lib/calc";
import HoursOdometer from "@/components/HoursOdometer";
import LifeSpanGloss from "@/components/LifeSpanGloss";

export default function ResultCard({
  price,
  result,
  label,
  compareLabel,
  compareHours,
  categoryLabel,
  dinnerLabel,
  animateEnter = false,
}: {
  price: number;
  result: RealCostResult;
  label?: string;
  compareLabel?: string;
  compareHours?: number;
  categoryLabel?: string;
  dinnerLabel?: string;
  animateEnter?: boolean;
}) {
  const dinnerName = dinnerLabel ?? "dinner";
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!animateEnter || entered) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [animateEnter, entered]);

  return (
    <div className={`result-card${entered ? " result-card-enter" : ""}`}>
      <span className="text-[var(--subtle)] text-sm tracking-wide result-price-soft">{formatMoney(price)}</span>
      {categoryLabel ? (
        <span className="text-[var(--champagne)] text-xs font-semibold tracking-wide uppercase">
          {categoryLabel}
        </span>
      ) : null}

      <HoursOdometer hours={result.hours} className="result-hours mt-2" />
      <span className="text-[var(--subtle)] text-sm">
        {label ? `of ${label}'s work` : "of your work"}
      </span>
      <LifeSpanGloss hours={result.hours} className="result-life-span" />

      <div className="result-metrics flex gap-4 text-[var(--muted)] text-sm mt-2 flex-wrap justify-center">
        <span>{formatShifts(result.shifts)}</span>
        <span className="text-[var(--border)]">·</span>
        <span>{formatDinners(result.dinners, dinnerName)}</span>
      </div>

      {compareLabel !== undefined && compareHours !== undefined && (
        <div className="mt-6 pt-6 border-t border-[var(--border)] w-full flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-[var(--subtle)]">
            same price, different life
          </span>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--muted)]">You</span>
            <span className="text-[var(--foreground)] font-medium tabular-nums">{formatHours(result.hours)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--muted)]">{compareLabel}</span>
            <span className="text-[var(--foreground)] font-medium tabular-nums">
              {formatHours(compareHours)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
