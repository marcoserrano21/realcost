import assert from "node:assert/strict";
import test from "node:test";
import { shouldHaptic } from "../lib/haptics.ts";

test("shouldHaptic false when reduceMotion true", () => {
  assert.equal(shouldHaptic(true), false);
});

test("shouldHaptic true when reduceMotion false", () => {
  assert.equal(shouldHaptic(false), true);
});
