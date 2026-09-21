"use client";

import { formatHours, formatMoney } from "@/lib/calc";
import type { PausedStreak } from "@/lib/streaks";
import { FlameIcon } from "@/components/icons";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeeklyStreak({ streak }: { streak: PausedStreak }) {
  const hasHeat = streak.hoursThisWeek > 0 || streak.weekStreak > 0;
  const maxBar = Math.max(...streak.dayBars, 0.25);
  const empty = streak.hoursThisWeek <= 0 && streak.weekStreak <= 0;

  return (
    <div
      className={`weekly-streak${hasHeat ? " weekly-streak-hot" : ""}${empty ? " weekly-streak-empty" : ""}`}
      aria-live="polite"
    >
      <div className="weekly-streak-top">
        <div className="weekly-streak-main">
          <p className="weekly-streak-label">Paused this week</p>
          <p className="weekly-streak-hours tabular-nums">{formatHours(streak.hoursThisWeek)}</p>
        </div>
        <div className="weekly-streak-side">
          <p className="weekly-streak-chip tabular-nums">
            {streak.weekStreak > 0 ? (
              <>
                <FlameIcon className="weekly-streak-flame" />
                <span>{streak.weekStreak}-week streak</span>
              </>
            ) : (
              "Start a streak"
            )}
          </p>
          <p className="weekly-streak-meta">
            {empty
              ? "Skip once to start banking hours"
              : streak.skipsThisWeek > 0
                ? `${streak.skipsThisWeek} skip${streak.skipsThisWeek === 1 ? "" : "s"} · ${formatMoney(streak.dollarsPausedThisWeek)} not spent`
                : "Keep skipping to bank this week"}
          </p>
        </div>
      </div>

      <div className="weekly-streak-bars" role="img" aria-label="Skip hours by day, Monday through Sunday">
        {streak.dayBars.map((hours, index) => {
          const heightPct = Math.max(8, Math.round((hours / maxBar) * 100));
          const isToday = index === streak.todayIndex;
          return (
            <div
              key={DAY_LABELS[index]! + index}
              className={`weekly-streak-day${isToday ? " is-today" : ""}${hours > 0 ? " has-hours" : ""}`}
            >
              <span
                className="weekly-streak-bar"
                style={{ ["--bar-h" as string]: `${heightPct}%` }}
                title={hours > 0 ? formatHours(hours) : "No skips"}
              />
              <span className="weekly-streak-day-label">{DAY_LABELS[index]}</span>
            </div>
          );
        })}
      </div>

      {!empty && (streak.longestStreak > 1 || streak.bestWeekHours > 0)
        ? (() => {
            const footer =
              streak.longestStreak > streak.weekStreak
                ? `Best streak ${streak.longestStreak} weeks`
                : streak.bestWeekHours > streak.hoursThisWeek + 0.01
                  ? `Best week ${formatHours(streak.bestWeekHours)}`
                  : streak.weekStreak > 0
                    ? "On pace to keep the streak"
                    : null;
            return footer ? <p className="weekly-streak-footer">{footer}</p> : null;
          })()
        : null}
    </div>
  );
}
