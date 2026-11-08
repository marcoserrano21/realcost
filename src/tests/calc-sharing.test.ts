import assert from "node:assert/strict";
import test from "node:test";
import { computeRealCost, formatHours, formatLifeSpan, formatMoney, benchmarkHoursForPrice, US_MEDIAN_HOURLY_WAGE } from "../lib/calc.ts";
import { decodeComparison, encodeComparison, shareText } from "../lib/sharing.ts";

test("computeRealCost: basic hours", () => {
  const result = computeRealCost(100, { hourlyWage: 20, shiftHours: 8, dinnerCost: 25 });
  assert.equal(result.hours, 5);
});

test("computeRealCost: 150 / 25 = 6h", () => {
  const result = computeRealCost(150, { hourlyWage: 25, shiftHours: 8, dinnerCost: 25 });
  assert.equal(result.hours, 6);
});

test("formatHours: minutes only", () => {
  assert.equal(formatHours(0.5), "30m");
});

test("formatHours: whole hours", () => {
  assert.equal(formatHours(1), "1h");
});

test("formatHours: hours and minutes", () => {
  assert.equal(formatHours(1.25), "1h 15m");
});

test("formatHours: rounds 6.316h", () => {
  assert.equal(formatHours(6.316), "6h 19m");
});

test("benchmarkHoursForPrice uses US median constant only", () => {
  assert.equal(US_MEDIAN_HOURLY_WAGE, 22);
  assert.equal(benchmarkHoursForPrice(150), 150 / 22);
  assert.equal(benchmarkHoursForPrice(22), 1);
});

test("encode writes price only so wage cannot be reversed", () => {
  const url = encodeComparison("https://realcost.app", { price: 150 });
  const parsed = new URL(url);
  const decoded = decodeComparison(parsed.searchParams);
  assert.ok(decoded);
  assert.equal(decoded.price, 150);
  assert.equal("hours" in decoded, false);
  assert.equal(parsed.searchParams.has("h"), false);
  assert.equal(parsed.searchParams.has("wage"), false);
  assert.equal(parsed.searchParams.has("n"), false);
  assert.deepEqual([...parsed.searchParams.keys()], ["p"]);
});

test("decodeComparison ignores legacy h and n params", () => {
  const params = new URLSearchParams("p=150&h=6.32&n=Maya");
  const decoded = decodeComparison(params);
  assert.ok(decoded);
  assert.equal(decoded.price, 150);
  assert.equal("hours" in decoded, false);
  assert.equal(decoded.shareId, undefined);
  assert.equal(decoded.isReply, undefined);
});

test("decodeComparison accepts price-only links", () => {
  const params = new URLSearchParams("p=150");
  const decoded = decodeComparison(params);
  assert.ok(decoded);
  assert.equal(decoded.price, 150);
  assert.equal("hours" in decoded, false);
});

test("decodeComparison rejects invalid payloads", () => {
  const params = new URLSearchParams("p=0&h=2");
  assert.equal(decodeComparison(params), null);
});

test("shareText default asks without revealing hours", () => {
  const text = shareText("$150");
  assert.match(text, /What does \$150 cost you/);
  assert.doesNotMatch(text, /\d+h/);
});

test("shareText challenge and reply invite without hours", () => {
  const challenge = shareText("$150", { challenge: true });
  const reply = shareText("$150", { isReply: true });
  assert.match(challenge, /Same \$150/);
  assert.match(challenge, /Check yours/);
  assert.match(reply, /I checked your \$150/);
  assert.doesNotMatch(challenge, /\d+h/);
  assert.doesNotMatch(reply, /\d+h/);
});

import {
  caretIndexForDigitCount,
  formatGroupedInput,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "../lib/numericInput.ts";
import { sumHistory } from "../lib/historyTotals.ts";

test("sanitizeIntegerInput strips letters", () => {
  assert.equal(sanitizeIntegerInput("12a3"), "123");
  assert.equal(sanitizeIntegerInput("$45"), "45");
  assert.equal(sanitizeIntegerInput(""), "");
});

test("sanitizeIntegerInput strips commas", () => {
  assert.equal(sanitizeIntegerInput("1,000"), "1000");
  assert.equal(sanitizeIntegerInput("10,000"), "10000");
});

test("sanitizeIntegerInput caps at 999 million", () => {
  assert.equal(sanitizeIntegerInput("9999999999"), "999999999");
  assert.equal(sanitizeIntegerInput("999999999"), "999999999");
});

test("sanitizeDecimalInput allows one dot", () => {
  assert.equal(sanitizeDecimalInput("12.5.6"), "12.56");
  assert.equal(sanitizeDecimalInput("abc68.2"), "68.2");
});

test("sanitizeDecimalInput caps wage-sized fields", () => {
  assert.equal(sanitizeDecimalInput("250000"), "99999");
});

test("formatGroupedInput adds thousands separators", () => {
  assert.equal(formatGroupedInput(""), "");
  assert.equal(formatGroupedInput("999"), "999");
  assert.equal(formatGroupedInput("1000"), "1,000");
  assert.equal(formatGroupedInput("10000"), "10,000");
  assert.equal(formatGroupedInput("1234567"), "1,234,567");
});

test("formatGroupedInput keeps decimal fraction", () => {
  assert.equal(formatGroupedInput("1234.5", true), "1,234.5");
  assert.equal(formatGroupedInput("12.", true), "12.");
});

test("caretIndexForDigitCount skips commas", () => {
  assert.equal(caretIndexForDigitCount("1,000", 1), 1);
  assert.equal(caretIndexForDigitCount("1,000", 4), 5);
  assert.equal(caretIndexForDigitCount("10,000", 2), 2);
});

test("formatHours compact for extreme values", () => {
  assert.equal(formatHours(12_500), "12.5k h");
  assert.match(formatHours(2_500_000), /M h/);
});

test("formatLifeSpan stays quiet under a day", () => {
  assert.equal(formatLifeSpan(0), null);
  assert.equal(formatLifeSpan(12), null);
  assert.equal(formatLifeSpan(23.9), null);
});

test("formatLifeSpan days weeks months years", () => {
  assert.equal(formatLifeSpan(24), "≈ 1 day");
  assert.equal(formatLifeSpan(36), "≈ 1.5 days");
  assert.equal(formatLifeSpan(24 * 7), "≈ 1 week");
  assert.equal(formatLifeSpan(24 * 14), "≈ 2 weeks");
  assert.equal(formatLifeSpan(24 * 30), "≈ 1 month");
  assert.equal(formatLifeSpan(24 * 365), "≈ 1 year");
  assert.equal(formatLifeSpan(24 * 365 * 2.4), "≈ 2.4 years");
});

test("formatMoney compact for millions", () => {
  assert.match(formatMoney(999_000_000), /\$999/);
});

test("computeRealCost clamps absurd prices", () => {
  const result = computeRealCost(9_999_999_999, { hourlyWage: 25, shiftHours: 8, dinnerCost: 25 });
  assert.equal(result.hours, 999_999_999 / 25);
  assert.ok(Number.isFinite(result.hours));
});

test("encodeComparison can attach opaque share id", () => {
  const url = encodeComparison("https://realcost.app", { price: 80 }, { shareId: "abc123xyz0" });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("s"), "abc123xyz0");
  assert.equal(parsed.searchParams.has("h"), false);
  assert.equal(parsed.searchParams.has("reply"), false);
});

test("decodeComparison reads reply reactions without hours", () => {
  const params = new URLSearchParams("p=80&s=abc123xyz0&reply=1&h=3.5");
  const decoded = decodeComparison(params);
  assert.ok(decoded);
  assert.equal(decoded.price, 80);
  assert.equal(decoded.shareId, "abc123xyz0");
  assert.equal(decoded.isReply, true);
  assert.equal("hours" in decoded, false);
});

test("encodeComparison reply flag never writes hours", () => {
  const url = encodeComparison("https://realcost.app", { price: 80 }, { shareId: "abc123xyz0", isReply: true });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("reply"), "1");
  assert.equal(parsed.searchParams.has("h"), false);
  assert.deepEqual(parsed.searchParams.get("p"), "80");
});

test("sumHistory totals price and hours", () => {
  const total = sumHistory([
    { price: 10, hours: 1 },
    { price: 20, hours: 2.5 },
  ]);
  assert.equal(total.price, 30);
  assert.equal(total.hours, 3.5);
  assert.equal(total.count, 2);
});
