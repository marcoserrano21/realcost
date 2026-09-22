import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDecisionCopy,
  getCompareIntroCopy,
  getCompareRevealCopy,
  getFeedEmptyCopy,
  getHistoryEmptyCopy,
} from "../lib/copyMatrix.ts";
import { TONE_OPTIONS } from "../lib/personalizationOptions.ts";
import type { Choice, Tone } from "../lib/storage.ts";

const TONES: Tone[] = ["gentle", "direct", "hype", "curious", "deadpan"];
const CHOICES: Choice[] = ["bought", "thinking", "skipped"];

test("TONE_OPTIONS includes Deadpan as fifth voice", () => {
  assert.equal(TONE_OPTIONS.length, 5);
  const deadpan = TONE_OPTIONS.find((o) => o.value === "deadpan");
  assert.ok(deadpan);
  assert.equal(deadpan.label, "Deadpan");
  assert.match(deadpan.hint.toLowerCase(), /dry|online/);
});

test("TONE_OPTIONS covers every Tone id", () => {
  const values = TONE_OPTIONS.map((o) => o.value).sort();
  assert.deepEqual(values, [...TONES].sort());
});

test("buildDecisionCopy returns non-empty copy for every tone × choice", () => {
  for (const tone of TONES) {
    for (const choice of CHOICES) {
      const copy = buildDecisionCopy(choice, tone, "6h", "$150", "3h");
      assert.ok(copy.title.trim().length > 0, `${tone}/${choice} title`);
      assert.ok(copy.body.trim().length > 0, `${tone}/${choice} body`);
      assert.ok(copy.primaryLabel.trim().length > 0, `${tone}/${choice} label`);
    }
  }
});

test("deadpan bought copy is dry about the purchase", () => {
  const copy = buildDecisionCopy("bought", "deadpan", "6h", "$150", "0m");
  assert.match(copy.body.toLowerCase(), /bro|yes|respect/);
  assert.ok(!/you are (dumb|stupid|bad)/i.test(copy.body));
});

test("tone helpers include deadpan strings", () => {
  assert.match(getCompareIntroCopy("deadpan").toLowerCase(), /rate|number/);
  assert.match(getCompareRevealCopy("deadpan").toLowerCase(), /same|cool/);
  assert.match(getFeedEmptyCopy("deadpan").toLowerCase(), /empty|void|share/);
  assert.match(getHistoryEmptyCopy("deadpan").toLowerCase(), /lore|archive|log/);
});
