"use client";

import { useEffect, useRef, useState, type AnimationEvent, type RefObject } from "react";
import type { Choice } from "@/lib/storage";
import { CHOICE_ICONS } from "@/components/icons";

const DECISION_EXIT_MS = 180;

function motionReduced(): boolean {
  return document.documentElement.getAttribute("data-reduce-motion") === "true";
}

function canTakeFocus(node: HTMLElement | null): node is HTMLElement {
  if (!node || !node.isConnected) return false;
  if (node === document.body || node === document.documentElement) return false;
  if (node instanceof HTMLButtonElement && node.disabled) return false;
  if (node.getAttribute("aria-disabled") === "true") return false;
  return true;
}

export default function DecisionSheet({
  choice,
  title,
  body,
  primaryLabel,
  onClose,
  secondaryLabel,
  onSecondary,
  returnFocusRef,
}: {
  choice: Choice;
  title: string;
  body: string;
  primaryLabel: string;
  onClose: () => void;
  /** Finish-strong share invite (viral principle 4). */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Used when the choice chip that opened the sheet can no longer take focus. */
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const shareRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const requestCloseRef = useRef<() => void>(() => {});
  const closingRef = useRef(false);
  const finishedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onCloseRef.current();
    const trigger = triggerRef.current;
    const fallback = returnFocusRef?.current ?? null;
    const target = canTakeFocus(trigger) ? trigger : canTakeFocus(fallback) ? fallback : null;
    target?.focus();
  };

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (motionReduced()) {
      finish();
      return;
    }
    setClosing(true);
    timeoutRef.current = window.setTimeout(finish, DECISION_EXIT_MS);
  };

  useEffect(() => {
    requestCloseRef.current = requestClose;
  });

  useEffect(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (shareRef.current ?? primaryRef.current)?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const onSheetAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.animationName !== "decision-sheet-out") return;
    finish();
  };

  return (
    <div
      className={`decision-overlay decision-sheet-overlay${closing ? " is-closing" : ""}`}
      onClick={requestClose}
    >
      <div
        className={`decision-sheet decision-sheet-${choice}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={onSheetAnimationEnd}
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
                requestClose();
              }}
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            ref={primaryRef}
            type="button"
            className={`${secondaryLabel && onSecondary ? "secondary-action" : "primary-action"} pressable decision-action`}
            onClick={requestClose}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
