export type ThemePreference = "system" | "light" | "dark";
export type MotionPreference = "system" | "full" | "reduced";

const THEME_KEY = "realcost:theme";
const MOTION_KEY = "realcost:motion";

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(THEME_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

export function setThemePreference(theme: ThemePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event("realcost:preferences-updated"));
}

export function getMotionPreference(): MotionPreference {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(MOTION_KEY);
  if (raw === "full" || raw === "reduced" || raw === "system") return raw;
  return "system";
}

export function setMotionPreference(motion: MotionPreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOTION_KEY, motion);
  applyMotion(motion);
  window.dispatchEvent(new Event("realcost:preferences-updated"));
}

export function resolveTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function resolveReducedMotion(motion: MotionPreference): boolean {
  if (motion === "reduced") return true;
  if (motion === "full") return false;
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

export function applyTheme(theme: ThemePreference = getThemePreference()) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function applyMotion(motion: MotionPreference = getMotionPreference()) {
  if (typeof document === "undefined") return;
  const reduced = resolveReducedMotion(motion);
  document.documentElement.dataset.reduceMotion = reduced ? "true" : "false";
}

export function applyAllPreferences() {
  applyTheme();
  applyMotion();
}
