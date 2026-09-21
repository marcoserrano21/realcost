"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  applyAllPreferences,
  getMotionPreference,
  getThemePreference,
  setMotionPreference,
  setThemePreference,
  type MotionPreference,
  type ThemePreference,
} from "@/lib/preferences";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyAllPreferences();
    const onPref = () => applyAllPreferences();
    const mqTheme = window.matchMedia("(prefers-color-scheme: light)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onSystem = () => applyAllPreferences();
    window.addEventListener("realcost:preferences-updated", onPref);
    mqTheme.addEventListener("change", onSystem);
    mqMotion.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener("realcost:preferences-updated", onPref);
      mqTheme.removeEventListener("change", onSystem);
      mqMotion.removeEventListener("change", onSystem);
    };
  }, []);

  return children;
}

export function usePreferences() {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [motion, setMotionState] = useState<MotionPreference>("system");

  useEffect(() => {
    const sync = () => {
      setThemeState(getThemePreference());
      setMotionState(getMotionPreference());
    };
    sync();
    window.addEventListener("realcost:preferences-updated", sync);
    return () => window.removeEventListener("realcost:preferences-updated", sync);
  }, []);

  return {
    theme,
    motion,
    setTheme: (value: ThemePreference) => {
      setThemePreference(value);
      setThemeState(value);
    },
    setMotion: (value: MotionPreference) => {
      setMotionPreference(value);
      setMotionState(value);
    },
  };
}
