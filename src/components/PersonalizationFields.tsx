"use client";

import { SPENDING_FOCUS_OPTIONS, TONE_OPTIONS } from "@/lib/personalizationOptions";
import type { SpendingFocus, Tone } from "@/lib/storage";

export default function PersonalizationFields({
  spendingFocus,
  tone,
  onFocusChange,
  onToneChange,
  compact = false,
}: {
  spendingFocus: SpendingFocus | null;
  tone: Tone | null;
  onFocusChange: (value: SpendingFocus) => void;
  onToneChange: (value: Tone) => void;
  compact?: boolean;
}) {
  return (
    <div className={`personalization-fields${compact ? " is-compact" : ""}`}>
      <label className="field-label">Focus</label>
      <div className="chip-grid chip-grid-compact" role="group" aria-label="Spending focus">
        {SPENDING_FOCUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip chip-compact pressable${spendingFocus === option.value ? " chip-selected" : ""}`}
            aria-pressed={spendingFocus === option.value}
            onClick={() => onFocusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="field-label">Voice</label>
      <div className="chip-grid chip-grid-compact" role="group" aria-label="Tone of voice">
        {TONE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip chip-compact pressable${tone === option.value ? " chip-selected" : ""}`}
            aria-pressed={tone === option.value}
            title={option.research}
            onClick={() => onToneChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
