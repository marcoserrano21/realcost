"use client";

import type { KeyboardEvent, ReactNode } from "react";

/** Shared tappable card shell for History / Compare expand-to-edit. */
export default function TappableExpandCard({
  open,
  onToggle,
  ariaLabel,
  className = "",
  style,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  ariaLabel: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`surface-card tappable-expand-card${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      aria-expanded={open}
      aria-label={ariaLabel}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
