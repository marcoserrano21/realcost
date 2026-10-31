import assert from "node:assert/strict";
import test from "node:test";
import { canvasSizeForFormat, aspectClassForFormat } from "../lib/shareFormats.ts";

test("poster45 is 1080x1350", () => {
  assert.deepEqual(canvasSizeForFormat("poster45"), { width: 1080, height: 1350 });
});

test("story916 is 1080x1920", () => {
  assert.deepEqual(canvasSizeForFormat("story916"), { width: 1080, height: 1920 });
});

test("aspect classes match formats", () => {
  assert.equal(aspectClassForFormat("poster45"), "share-card--poster45");
  assert.equal(aspectClassForFormat("story916"), "share-card--story916");
});
