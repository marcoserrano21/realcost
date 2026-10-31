"use client";

import { useState } from "react";
import { formatHours, formatMoney } from "@/lib/calc";
import type { PausedStreak } from "@/lib/streaks";
import { FlameIcon } from "@/components/icons";
import ShareCard from "@/components/ShareCard";
import LifeSpanGloss from "@/components/LifeSpanGloss";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeeklyStreak({
  streak,
  compactTop = false,
}: {
  streak: PausedStreak;
  compactTop?: boolean;
}) {
  const [shareKept, setShareKept] = useState(false);
  const hasHeat = streak.hoursThisWeek > 0 || streak.weekStreak > 0;
  const maxBar = Math.max(...streak.dayBars, 0.25);
  const empty = streak.hoursThisWeek <= 0 && streak.weekStreak <= 0;
  const showBars = !compactTop || streak.hoursThisWeek > 0;

  return (
    <div
      className={`weekly-streak${compactTop ? " weekly-streak--top" : ""}${hasHeat ? " weekly-streak-hot" : ""}${
        empty ? " weekly-streak-empty" : ""
      }`}
      aria-live="polite"
    >
      <div className="weekly-streak-top">
        <div className="weekly-streak-main">
          <p className="weekly-streak-label">Hours kept</p>
          <p className="weekly-streak-hours tabular-nums">{formatHours(streak.hoursThisWeek)}</p>
          <LifeSpanGloss hours={streak.hoursThisWeek} className="weekly-streak-life-span" />
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
          {!compactTop || !empty ? (
            <p className="weekly-streak-meta">
              {empty
                ? "Skip once to start banking hours"
                : streak.skipsThisWeek > 0
                  ? `${streak.skipsThisWeek} skip${streak.skipsThisWeek === 1 ? "" : "s"} · ${formatMoney(streak.dollarsPausedThisWeek)} not spent`
                  : "Keep skipping to bank this week"}
            </p>
          ) : (
            <p className="weekly-streak-meta">Skip once to start banking hours</p>
          )}
        </div>
      </div>

      {showBars ? (
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
      ) : null}

      {!empty && streak.hoursThisWeek > 0 ? (
        <button
          type="button"
          className="link-action weekly-streak-share"
          onClick={() => setShareKept((v) => !v)}
        >
          {shareKept ? "Hide card" : "Share hours kept"}
        </button>
      ) : null}

      {shareKept && streak.hoursThisWeek > 0 ? (
        <ShareCard hours={streak.hoursThisWeek} variant="hoursKept" />
      ) : null}

      {!compactTop && !empty && (streak.longestStreak > 1 || streak.bestWeekHours > 0)
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
