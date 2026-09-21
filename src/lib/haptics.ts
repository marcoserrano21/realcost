/** Vibration helpers gated by reduce-motion prefs. */

export function shouldHaptic(reduceMotion?: boolean): boolean {
  if (reduceMotion === true) return false;
  if (reduceMotion === false) {
    if (
      typeof document !== "undefined" &&
      document.documentElement?.getAttribute("data-reduce-motion") === "true"
    ) {
      return false;
    }
    return true;
  }
  if (typeof window === "undefined") return false;
  if (typeof document !== "undefined" && document.documentElement?.getAttribute("data-reduce-motion") === "true") {
    return false;
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return false;
  return true;
}

export function triggerHaptic(pattern: number | number[] = 8): void {
  if (!shouldHaptic()) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore unsupported / blocked vibrate
  }
}
