"use client";

import { useEffect, useRef } from "react";

export default function WelcomeModal({
  name,
  onClose,
}: {
  name?: string;
  onClose: () => void;
}) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const greeting = name?.trim() ? `Welcome to RealCost, ${name.trim()}.` : "Welcome to RealCost.";

  return (
    <div className="decision-overlay welcome-overlay" onClick={onClose}>
      <div
        className="decision-sheet welcome-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          You&apos;re in
        </p>
        <h2 id="welcome-title">{greeting}</h2>
        <p className="decision-body">
          Enter a price. See it in hours of your life. Share it so someone else can see what the same
          money costs them, without ever sharing your wage.
        </p>
        <ul className="welcome-points">
          <li>Your rate stays on this device</li>
          <li>Share links never include your wage</li>
          <li>Curiosity over judgment, always</li>
        </ul>
        <button
          ref={primaryRef}
          type="button"
          className="primary-action pressable decision-action"
          onClick={onClose}
        >
          Try your first price
        </button>
      </div>
    </div>
  );
}
