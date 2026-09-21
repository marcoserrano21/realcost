"use client";

import { useEffect, useRef } from "react";
import type { Choice } from "@/lib/storage";
import { CHOICE_ICONS } from "@/components/icons";

export default function DecisionSheet({
  choice,
  title,
  body,
  primaryLabel,
  onClose,
  secondaryLabel,
  onSecondary,
}: {
  choice: Choice;
  title: string;
  body: string;
  primaryLabel: string;
  onClose: () => void;
  /** Finish-strong share invite (viral principle 4). */
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const shareRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (shareRef.current ?? primaryRef.current)?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="decision-overlay" onClick={onClose}>
      <div
        className={`decision-sheet decision-sheet-${choice}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="decision-icon" aria-hidden="true">
          {(() => {
            const Icon = CHOICE_ICONS[choice];
            return <Icon />;
          })()}
        </div>
        <h2 id="decision-title">{title}</h2>
        <p className="decision-body">{body}</p>
        <div className="decision-actions">
          {secondaryLabel && onSecondary ? (
            <button
              ref={shareRef}
              type="button"
              className="primary-action pressable decision-action"
              onClick={() => {
                onSecondary();
                onClose();
              }}
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            ref={primaryRef}
            type="button"
            className={`${secondaryLabel && onSecondary ? "secondary-action" : "primary-action"} pressable decision-action`}
            onClick={onClose}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
