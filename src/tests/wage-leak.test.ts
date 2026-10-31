import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PRICE,
  computeRealCost,
  formatHours,
  formatMoney,
  formatShifts,
} from "../lib/calc.ts";
import { sanitizeProps } from "../lib/analyticsProps.ts";
import { compareOgCopy } from "../lib/compareOg.ts";
import { sharePosterContent } from "../lib/sharePosterContent.ts";
import { decodeComparison, encodeComparison, shareText } from "../lib/sharing.ts";

const WAGE = 23.47;
const PRICES = [1, 19.99, 150, 1234.56, MAX_PRICE];
const UNITS = { hourlyWage: WAGE, shiftHours: 8, dinnerCost: 25 };

function clockHours(text: string): number[] {
  const values: number[] = [];
  for (const match of text.matchAll(/(\d+)h(?:\s+(\d+)m)?/g)) {
    const hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    values.push(hours + minutes / 60);
  }
  for (const match of text.matchAll(/(?<!\d)(\d+)m\b/g)) {
    values.push(Number(match[1]) / 60);
  }
  return values;
}

function numbersIn(text: string): number[] {
  const raw = [...text.matchAll(/\d+(?:[.,]\d+)?/g)].map((match) => Number(match[0].replace(",", "")));
  return [...raw, ...clockHours(text)].filter((value) => Number.isFinite(value));
}

function assertCannotRecoverWage(text: string, label: string) {
  const nums = numbersIn(text);
  for (const value of nums) {
    assert.ok(Math.abs(value - WAGE) > 0.01, `${label} contains the wage (${value}): ${text}`);
  }
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue;
      const denominator = nums[j];
      if (!(denominator > 0)) continue;
      const ratio = nums[i] / denominator;
      assert.ok(
        Math.abs(ratio - WAGE) > 0.01,
        `${label} recovers wage from ${nums[i]} / ${denominator} in: ${text}`
      );
    }
  }
  assert.doesNotMatch(text, /shift/i, `${label} mentions shifts: ${text}`);
}

function assertPriceAndHoursStayApart(text: string, price: number, formattedHours: string) {
  const hasPrice = text.includes(formatMoney(price)) || text.includes(String(price));
  if (hasPrice) {
    assert.equal(text.includes(formattedHours), false, `price and hours together: ${text}`);
  }
}

test("share URLs, copy, and posters cannot recover a wage", () => {
  for (const price of PRICES) {
    const result = computeRealCost(price, UNITS);
    const formattedHours = formatHours(result.hours);
    const shiftsLabel = formatShifts(result.shifts);
    const priceLabel = formatMoney(price);

    const urls = [
      encodeComparison("https://realcost.app", { price }),
      encodeComparison("https://realcost.app", { price }, { shareId: "abcdefghij" }),
      encodeComparison("https://realcost.app", { price }, { shareId: "abcdefghij", isReply: true }),
    ];
    const texts = [
      shareText(priceLabel),
      shareText(priceLabel, { challenge: true }),
      shareText(priceLabel, { isReply: true }),
    ];
    const posters = [
      sharePosterContent({ price, hours: result.hours, variant: "standard" }, { formatMoney, formatHours }),
      sharePosterContent({ price, hours: result.hours, variant: "hoursKept" }, { formatMoney, formatHours }),
    ];

    for (const url of urls) {
      const params = new URL(url).searchParams;
      assert.equal(params.has("h"), false, url);
      for (const key of params.keys()) {
        assert.ok(key === "p" || key === "s" || key === "reply", `unexpected param ${key} in ${url}`);
      }
      assert.equal(textContains(url, shiftsLabel), false);
      assertCannotRecoverWage(url, "url");
      assertPriceAndHoursStayApart(url, price, formattedHours);
    }

    for (const text of texts) {
      assert.equal(text.includes(formattedHours), false, text);
      assert.equal(text.includes(shiftsLabel), false, text);
      assertCannotRecoverWage(text, "share text");
      assertPriceAndHoursStayApart(text, price, formattedHours);
    }

    for (const poster of posters) {
      const rendered = poster.lines.join("\n");
      assert.equal(rendered.includes(shiftsLabel), false, rendered);
      assertCannotRecoverWage(rendered, "poster");
      assertPriceAndHoursStayApart(rendered, price, formattedHours);
      const hasPrice = poster.priceLine != null;
      const hasHours = poster.hoursLine != null;
      assert.equal(hasPrice && hasHours, false, rendered);
    }
  }
});

function textContains(text: string, needle: string): boolean {
  return needle.length > 0 && text.includes(needle);
}

test("analytics drops unknown keys, numbers, and the wage", () => {
  const cleaned = sanitizeProps(
    "share_started",
    { amount: WAGE, h: "6.32", x: String(WAGE), challenge: true, source: "recipient" },
    { wage: WAGE }
  );
  assert.deepEqual(cleaned, { challenge: true, source: "recipient" });

  assert.deepEqual(
    sanitizeProps("share_completed", { method: String(WAGE), challenge: false }, { wage: WAGE }),
    { challenge: false }
  );
  assert.deepEqual(sanitizeProps("decision_bought", { has_category: true, hours: 6.32 }), {
    has_category: true,
  });
  assert.equal(sanitizeProps("reaction_received", { has_hours: true }), undefined);
  assert.equal(sanitizeProps("not_an_event", { method: "clipboard" }), undefined);
});

test("legacy comparison links decode without hours", () => {
  const decoded = decodeComparison(new URLSearchParams("p=150&h=6.32&s=abc123xyz0"));
  assert.ok(decoded);
  assert.equal(decoded.price, 150);
  assert.equal(decoded.shareId, "abc123xyz0");
  assert.equal("hours" in decoded, false);
});

test("OG copy has no digits", () => {
  const og = compareOgCopy();
  assert.doesNotMatch(og.title, /\d/);
  assert.doesNotMatch(og.description, /\d/);
});
