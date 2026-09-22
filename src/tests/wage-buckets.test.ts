import assert from "node:assert/strict";
import test from "node:test";
import {
  formatBucketWage,
  midpointForBucket,
  WAGE_BUCKETS,
} from "../lib/wageBuckets.ts";

test("WAGE_BUCKETS includes planned ranges plus custom", () => {
  assert.deepEqual(
    WAGE_BUCKETS.map((b) => b.id),
    ["15_20", "20_25", "25_35", "35_plus", "custom"]
  );
});

test("midpointForBucket returns planned midpoints", () => {
  assert.equal(midpointForBucket("15_20"), 17.5);
  assert.equal(midpointForBucket("20_25"), 22.5);
  assert.equal(midpointForBucket("25_35"), 30);
  assert.equal(midpointForBucket("35_plus"), 45);
  assert.equal(midpointForBucket("custom"), null);
});

test("formatBucketWage formats midpoints for the input", () => {
  assert.equal(formatBucketWage(17.5), "17.5");
  assert.equal(formatBucketWage(30), "30");
  assert.equal(formatBucketWage(0), "");
  assert.equal(formatBucketWage(Number.NaN), "");
});
