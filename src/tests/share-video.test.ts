import assert from "node:assert/strict";
import test from "node:test";
import {
  canExportShareVideo,
  clampVideoDurationMs,
  extensionForMime,
  hoursAtVideoProgress,
  pickRecorderMimeType,
  SHARE_VIDEO_DURATION_MS,
  SHARE_VIDEO_MIME_CANDIDATES,
  SHARE_VIDEO_ROLL_MS,
} from "../lib/shareVideoCore.ts";

test("pickRecorderMimeType prefers webm then mp4", () => {
  assert.equal(
    pickRecorderMimeType((m) => m === "video/webm;codecs=vp9"),
    "video/webm;codecs=vp9"
  );
  assert.equal(
    pickRecorderMimeType((m) => m === "video/webm"),
    "video/webm"
  );
  assert.equal(pickRecorderMimeType((m) => m === "video/mp4"), "video/mp4");
  assert.equal(pickRecorderMimeType(() => false), null);
});

test("SHARE_VIDEO_MIME_CANDIDATES order is webm then mp4", () => {
  assert.deepEqual([...SHARE_VIDEO_MIME_CANDIDATES], [
    "video/webm;codecs=vp9",
    "video/webm",
    "video/mp4",
  ]);
});

test("clampVideoDurationMs keeps 3–4s window", () => {
  assert.equal(clampVideoDurationMs(SHARE_VIDEO_DURATION_MS), SHARE_VIDEO_DURATION_MS);
  assert.equal(clampVideoDurationMs(1000), 3000);
  assert.equal(clampVideoDurationMs(9000), 4000);
  assert.equal(clampVideoDurationMs(Number.NaN), SHARE_VIDEO_DURATION_MS);
});

test("hoursAtVideoProgress eases from 0 to target then holds", () => {
  assert.equal(hoursAtVideoProgress(6, 0), 0);
  assert.ok(hoursAtVideoProgress(6, SHARE_VIDEO_ROLL_MS / 2) > 0);
  assert.ok(hoursAtVideoProgress(6, SHARE_VIDEO_ROLL_MS / 2) < 6);
  assert.equal(hoursAtVideoProgress(6, SHARE_VIDEO_ROLL_MS), 6);
  assert.equal(hoursAtVideoProgress(6, SHARE_VIDEO_DURATION_MS), 6);
});

test("extensionForMime maps containers", () => {
  assert.equal(extensionForMime("video/webm"), "webm");
  assert.equal(extensionForMime("video/mp4"), "mp4");
});

test("canExportShareVideo respects reduced motion and card type", () => {
  assert.equal(
    canExportShareVideo({ reduceMotion: true, mimeType: "video/webm" }),
    false
  );
  assert.equal(
    canExportShareVideo({ reduceMotion: false, mimeType: null }),
    false
  );
  assert.equal(
    canExportShareVideo({
      reduceMotion: false,
      mimeType: "video/webm",
      variant: "hoursKept",
    }),
    false
  );
  assert.equal(
    canExportShareVideo({
      reduceMotion: false,
      mimeType: "video/webm",
      challenge: true,
    }),
    false
  );
  assert.equal(
    canExportShareVideo({
      reduceMotion: false,
      mimeType: "video/webm",
      variant: "standard",
    }),
    true
  );
});

test("share video input shape has no wage field (price + hours only)", () => {
  const sample = { price: 150, hours: 6.8, format: "poster45", variant: "standard" };
  assert.equal("wage" in sample, false);
  assert.equal("hourlyWage" in sample, false);
  assert.equal("rate" in sample, false);
});
