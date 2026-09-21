"use client";

import { useMemo } from "react";

export function prefersReducedMotion() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-reduce-motion") === "true";
}

export function DigitReel({ digit, durationMs }: { digit: number; durationMs: number }) {
  const safe = ((digit % 10) + 10) % 10;
  const reduced = prefersReducedMotion();

  return (
    <span className="digit-reel" aria-hidden="true">
      <span
        className="digit-reel-strip"
        style={{
          transform: `translate3d(0, ${-safe}em, 0)`,
          transitionDuration: reduced ? "0.01ms" : `${durationMs}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="digit-reel-num">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function NumberReels({
  value,
  minDigits = 1,
  durationMs,
}: {
  value: number;
  minDigits?: number;
  durationMs: number;
}) {
  const digits = useMemo(() => {
    const raw = String(Math.max(0, Math.floor(value)));
    return raw.padStart(minDigits, "0").split("").map((d) => Number(d));
  }, [value, minDigits]);

  return (
    <span className="digit-reel-group">
      {digits.map((d, i) => (
        <DigitReel key={i} digit={d} durationMs={durationMs} />
      ))}
    </span>
  );
}
