/** Pure helpers for share video export (no DOM / MediaRecorder). */

export const SHARE_VIDEO_DURATION_MS = 3500;
export const SHARE_VIDEO_ROLL_MS = 600;

export const SHARE_VIDEO_MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm",
  "video/mp4",
] as const;

/** Prefer WebM; fall back to MP4 when the browser can record it. */
export function pickRecorderMimeType(
  isSupported: (mime: string) => boolean
): string | null {
  for (const mime of SHARE_VIDEO_MIME_CANDIDATES) {
    if (isSupported(mime)) return mime;
  }
  return null;
}

export function clampVideoDurationMs(ms: number): number {
  if (!Number.isFinite(ms)) return SHARE_VIDEO_DURATION_MS;
  return Math.min(4000, Math.max(3000, Math.round(ms)));
}

export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

/** Interpolate hours from 0 → target during the roll window, then hold. */
export function hoursAtVideoProgress(
  targetHours: number,
  elapsedMs: number,
  rollMs = SHARE_VIDEO_ROLL_MS
): number {
  if (!Number.isFinite(targetHours) || targetHours <= 0) return 0;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  const safeRoll = rollMs > 0 ? rollMs : SHARE_VIDEO_ROLL_MS;
  return targetHours * easeOutCubic(elapsedMs / safeRoll);
}

export function extensionForMime(mime: string): "webm" | "mp4" {
  return mime.includes("mp4") ? "mp4" : "webm";
}

/**
 * Gate video export.
 * Standard posters are price-only, so there is no hours reel to record.
 * Returning false is the smaller change versus animating the price.
 */
export function canExportShareVideo(opts: {
  reduceMotion: boolean;
  mimeType: string | null;
  variant?: "standard" | "hoursKept";
  challenge?: boolean;
}): boolean {
  if (opts.reduceMotion) return false;
  if (!opts.mimeType) return false;
  if (opts.variant === "hoursKept") return false;
  if (opts.challenge) return false;
  return false;
}
