import { downloadShareImage, paintSharePoster, type ShareImageInput } from "./shareImage";
import {
  canExportShareVideo,
  clampVideoDurationMs,
  extensionForMime,
  hoursAtVideoProgress,
  pickRecorderMimeType,
  SHARE_VIDEO_DURATION_MS,
  SHARE_VIDEO_ROLL_MS,
} from "./shareVideoCore";

export type ShareVideoInput = ShareImageInput;

export {
  canExportShareVideo,
  clampVideoDurationMs,
  extensionForMime,
  hoursAtVideoProgress,
  pickRecorderMimeType,
  SHARE_VIDEO_DURATION_MS,
  SHARE_VIDEO_ROLL_MS,
} from "./shareVideoCore";

function isReducedMotionActive(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.reduceMotion === "true") return true;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    return true;
  }
  return false;
}

function supportedMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return pickRecorderMimeType((mime) => MediaRecorder.isTypeSupported(mime));
}

/** True when video export is available for this card (else callers should use PNG). */
export function shouldExportShareVideo(input: ShareVideoInput = { price: 0, hours: 0 }): boolean {
  return canExportShareVideo({
    reduceMotion: isReducedMotionActive(),
    mimeType: supportedMime(),
    variant: input.variant,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Record a short digit-reel reveal as WebM (or MP4 when supported).
 * Returns false on failure so callers can fall back to PNG.
 */
export async function recordShareVideo(
  input: ShareVideoInput,
  durationMs = SHARE_VIDEO_DURATION_MS
): Promise<{ blob: Blob; mimeType: string; extension: "webm" | "mp4" } | null> {
  if (typeof document === "undefined") return null;
  if (!shouldExportShareVideo(input)) return null;

  const mimeType = supportedMime();
  if (!mimeType) return null;

  const duration = clampVideoDurationMs(durationMs);
  const finalHours = Number.isFinite(input.hours) && input.hours > 0 ? input.hours : 0;

  const first = paintSharePoster({ ...input, hours: 0 });
  const canvas = document.createElement("canvas");
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(first, 0, 0);

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("MediaRecorder failed"));
  });

  recorder.start(100);

  const start = performance.now();
  const FPS = 30;
  const frameMs = 1000 / FPS;

  while (performance.now() - start < duration) {
    const elapsed = performance.now() - start;
    const hours = hoursAtVideoProgress(finalHours, elapsed, SHARE_VIDEO_ROLL_MS);
    const frame = paintSharePoster({ ...input, hours });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0);
    await sleep(frameMs);
  }

  // Settle on final hours for the last frames
  const settled = paintSharePoster({ ...input, hours: finalHours });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(settled, 0, 0);

  recorder.stop();
  for (const track of stream.getTracks()) track.stop();
  await stopped;

  if (chunks.length === 0) return null;
  const blob = new Blob(chunks, { type: mimeType });
  if (blob.size === 0) return null;
  return { blob, mimeType, extension: extensionForMime(mimeType) };
}

export async function downloadShareVideo(
  input: ShareVideoInput,
  filenameBase = "realcost-reveal"
): Promise<boolean> {
  if (!shouldExportShareVideo(input)) {
    return downloadShareImage(input);
  }

  try {
    const recorded = await recordShareVideo(input);
    if (!recorded) return downloadShareImage(input);

    const filename = `${filenameBase}.${recorded.extension}`;
    const file = new File([recorded.blob], filename, { type: recorded.mimeType });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "RealCost",
          text: "Same dollars. Different life.",
        });
        return true;
      } catch {
        // fall through to download
      }
    }

    const url = URL.createObjectURL(recorded.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return downloadShareImage(input);
  }
}
