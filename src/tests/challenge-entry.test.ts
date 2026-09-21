import assert from "node:assert/strict";
import test from "node:test";
import { isChallengeComplete } from "../lib/challenge.ts";

test("complete when both hours present", () => {
  assert.equal(isChallengeComplete({ hours: 6, peerHours: 4 }), true);
});

test("incomplete without peer", () => {
  assert.equal(isChallengeComplete({ hours: 6 }), false);
});
