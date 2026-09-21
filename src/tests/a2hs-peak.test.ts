import assert from "node:assert/strict";
import test from "node:test";
import { isMeaningfulHoursKept, shouldShowA2HS } from "../lib/a2hsGate.ts";

test("isMeaningfulHoursKept requires at least 1 hour", () => {
  assert.equal(isMeaningfulHoursKept(0.5), false);
  assert.equal(isMeaningfulHoursKept(1), true);
});

test("shouldShowA2HS prefers emotional peak over decision count", () => {
  assert.equal(
    shouldShowA2HS({ dismissed: false, standalone: false, peak: "share", decisions: 0 }),
    true
  );
  assert.equal(
    shouldShowA2HS({ dismissed: false, standalone: false, peak: null, decisions: 3 }),
    true
  );
  assert.equal(
    shouldShowA2HS({ dismissed: true, standalone: false, peak: "share", decisions: 10 }),
    false
  );
  assert.equal(
    shouldShowA2HS({ dismissed: false, standalone: true, peak: "skipped", decisions: 10 }),
    false
  );
});
