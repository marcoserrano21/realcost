/** Whole-dollar amounts for price fields (no letters, no symbols). Capped at $999M. */
const MAX_PRICE = 999_999_999;
const MAX_WAGE = 99_999;

function clampPriceInput(digits: string): string {
  if (!digits) return "";
  const capped = digits.slice(0, String(MAX_PRICE).length);
  const n = parseInt(capped, 10);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(MAX_PRICE, n));
}

function clampWageInput(raw: string): string {
  if (!raw) return "";
  const trailingDot = raw.endsWith(".") && raw.indexOf(".") === raw.length - 1;
  const [head = "", ...rest] = raw.split(".");
  const wholeDigits = head.replace(/\D/g, "");
  const frac = rest.join("").replace(/\D/g, "").slice(0, 2);

  if (!wholeDigits && !frac && !trailingDot) return "";

  let wholeNum = wholeDigits ? parseInt(wholeDigits, 10) : 0;
  if (!Number.isFinite(wholeNum)) return "";
  if (wholeNum > MAX_WAGE) wholeNum = MAX_WAGE;

  if (trailingDot && !frac) return `${wholeNum}.`;
  if (raw.includes(".") || frac) {
    return `${wholeNum}.${frac}`;
  }
  return String(wholeNum);
}

/** Keep money/rate fields numeric-only (digits + optional single decimal). */
export function sanitizeDecimalInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) {
    const whole = cleaned.replace(/^0+(?=\d)/, "") || cleaned;
    return clampWageInput(whole);
  }
  const head = cleaned.slice(0, firstDot).replace(/^0+(?=\d)/, "") || "0";
  const tail = cleaned.slice(firstDot + 1).replace(/\./g, "");
  return clampWageInput(`${head}.${tail}`);
}

/** Whole-dollar amounts for price fields (no letters, no symbols). Capped at $999M. */
export function sanitizeIntegerInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return clampPriceInput(digits);
}

/** Display helper: `1000` → `1,000`. Keeps optional decimal for wage-style fields. */
export function formatGroupedInput(raw: string, allowDecimal = false): string {
  if (!raw) return "";

  if (!allowDecimal) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const trailingDot = raw.endsWith(".") && raw.indexOf(".") === raw.length - 1;
  const [head = "", ...rest] = raw.split(".");
  const whole = head.replace(/\D/g, "");
  const frac = rest.join("").replace(/\D/g, "");
  const wholeFmt = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (trailingDot && !frac) return `${wholeFmt || "0"}.`;
  if (raw.includes(".") || frac) return `${wholeFmt || "0"}.${frac}`;
  return wholeFmt;
}

/** Map a digit count (left of caret) onto an index in a comma-formatted string. */
export function caretIndexForDigitCount(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!)) {
      seen += 1;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}
