"use client";

import { MEAL_PRESETS, SHIFT_PRESETS } from "@/lib/unitPresets";

export default function UnitPresetFields({
  shiftHours,
  dinnerCost,
  dinnerLabel,
  onShiftChange,
  onDinnerChange,
  onDinnerLabelChange,
}: {
  shiftHours: string;
  dinnerCost: string;
  dinnerLabel: string;
  onShiftChange: (value: string) => void;
  onDinnerChange: (value: string) => void;
  onDinnerLabelChange: (value: string) => void;
}) {
  const shiftNum = parseFloat(shiftHours);
  const dinnerNum = parseFloat(dinnerCost);
  const label = dinnerLabel.trim() || "dinner out";

  return (
    <div className="unit-presets">
      <div className="unit-preset-block">
        <div className="unit-preset-head">
          <label className="field-label" htmlFor="unit-shift-custom">
            One work shift
          </label>
          <div className="unit-compact-input">
            <input
              id="unit-shift-custom"
              inputMode="decimal"
              value={shiftHours}
              onChange={(e) => onShiftChange(e.target.value)}
              aria-label="Custom shift hours"
            />
            <span>hrs</span>
          </div>
        </div>
        <div className="chip-grid chip-grid-compact" role="group" aria-label="Shift length presets">
          {SHIFT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`chip chip-compact pressable${shiftNum === preset.value ? " chip-selected" : ""}`}
              aria-pressed={shiftNum === preset.value}
              title={preset.hint}
              onClick={() => onShiftChange(String(preset.value))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="unit-preset-block">
        <div className="unit-preset-head">
          <label className="field-label" htmlFor="unit-meal-label">
            Reference spend
          </label>
          <div className="unit-compact-input">
            <span>$</span>
            <input
              id="unit-meal-custom"
              inputMode="decimal"
              value={dinnerCost}
              onChange={(e) => onDinnerChange(e.target.value)}
              aria-label={`Cost of one ${label}`}
            />
          </div>
        </div>
        <input
          id="unit-meal-label"
          className="text-field text-field-compact"
          value={dinnerLabel}
          onChange={(e) => onDinnerLabelChange(e.target.value)}
          placeholder="One dinner out"
          aria-label="Name for your reference spend"
          maxLength={32}
        />
        <p className="unit-hint">Rename it. Example: coffee run, date night, takeout.</p>
        <div className="chip-grid chip-grid-compact" role="group" aria-label="Reference spend presets">
          {MEAL_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`chip chip-compact pressable${dinnerNum === preset.value ? " chip-selected" : ""}`}
              aria-pressed={dinnerNum === preset.value}
              title={preset.hint}
              onClick={() => onDinnerChange(String(preset.value))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
