"use client";

import { useEffect, useState } from "react";
import { formatHours, MAX_HOURS_FOR_ODOMETER } from "@/lib/calc";
import { NumberReels } from "@/components/DigitReels";

/**
 * Per-digit odometer for hours / minutes (not a full-string fade).
 * Huge values fall back to compact text so reels never explode.
 */
export default function HoursOdometer({
  hours,
  className = "",
  durationMs = 520,
}: {
  hours: number;
  className?: string;
  /** Cap so large jumps still feel one deliberate roll, not a double count. */
  durationMs?: number;
}) {
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
  const label = formatHours(safeHours);
  const rollMs = Math.min(Math.max(durationMs, 320), 640);
  const [announced, setAnnounced] = useState(label);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(label), 500);
    return () => window.clearTimeout(timer);
  }, [label]);

  const live = (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {announced}
    </span>
  );

  if (safeHours >= MAX_HOURS_FOR_ODOMETER) {
    return (
      <span
        className={`hours-odometer hours-odometer-compact${className ? ` ${className}` : ""}`}
        aria-label={label}
      >
        <span className="hours-odometer-face" aria-hidden="true">
          {label}
        </span>
        {live}
      </span>
    );
  }

  const totalMinutes = Math.max(0, Math.round(safeHours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return (
    <span
      className={`hours-odometer${className ? ` ${className}` : ""}`}
      aria-label={label}
    >
      {live}
      <span className="hours-odometer-face" aria-hidden="true">
        {h === 0 ? (
          <>
            <NumberReels value={m} minDigits={1} durationMs={rollMs} />
            <span className="digit-reel-unit">m</span>
          </>
        ) : m === 0 ? (
          <>
            <NumberReels value={h} minDigits={1} durationMs={rollMs} />
            <span className="digit-reel-unit">h</span>
          </>
        ) : (
          <>
            <NumberReels value={h} minDigits={1} durationMs={rollMs} />
            <span className="digit-reel-unit">h</span>
            <span className="digit-reel-gap">&nbsp;</span>
            <NumberReels value={m} minDigits={m < 10 ? 1 : 2} durationMs={rollMs} />
            <span className="digit-reel-unit">m</span>
          </>
        )}
      </span>
    </span>
  );
}
