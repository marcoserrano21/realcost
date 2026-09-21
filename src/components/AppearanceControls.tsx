"use client";

import { usePreferences } from "@/components/PreferencesProvider";
import type { MotionPreference, ThemePreference } from "@/lib/preferences";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const MOTION_OPTIONS: { value: MotionPreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "full", label: "On" },
  { value: "reduced", label: "Off" },
];

export default function AppearanceControls() {
  const { theme, motion, setTheme, setMotion } = usePreferences();

  return (
    <div className="settings-look">
      <div className="settings-look-block">
        <span className="settings-row-label">Theme</span>
        <div className="segmented" role="radiogroup" aria-label="Color theme">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={theme === option.value}
              className={`segmented-item pressable${theme === option.value ? " is-active" : ""}`}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-look-block">
        <span className="settings-row-label">Motion</span>
        <div className="segmented" role="radiogroup" aria-label="Motion preference">
          {MOTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={motion === option.value}
              className={`segmented-item pressable${motion === option.value ? " is-active" : ""}`}
              onClick={() => setMotion(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
