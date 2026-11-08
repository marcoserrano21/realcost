import assert from "node:assert/strict";
import test from "node:test";
import { compareOgCopy } from "../lib/compareOg.ts";

test("OG reads as a challenge, not a download pitch", () => {
  const og = compareOgCopy();
  assert.match(og.title, /cost you|Same price/i);
  assert.doesNotMatch(og.title, /download/i);
  assert.match(og.description, /hours|challenge|device/i);
  assert.doesNotMatch(og.description, /download/i);
  assert.doesNotMatch(og.title, /\d/);
  assert.doesNotMatch(og.description, /\d/);
});
