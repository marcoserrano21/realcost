import assert from "node:assert/strict";
import test from "node:test";
import { sumHoursKeptFromEntries } from "../lib/hoursKept.ts";

test("sumHoursKeptFromEntries sums skipped only", () => {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const thisWeek = now.getTime();
  const lastWeek = thisWeek - 7 * 24 * 60 * 60 * 1000;

  const entries = [
    { choice: "bought", hours: 5, timestamp: thisWeek },
    { choice: "skipped", hours: 2, timestamp: thisWeek },
    { choice: "skipped", hours: 3, timestamp: lastWeek },
  ];
  const totals = sumHoursKeptFromEntries(entries, thisWeek);
  assert.equal(totals.hoursThisWeek, 2);
  assert.equal(totals.hoursAllTime, 5);
  assert.equal(totals.skipsAllTime, 2);
});
