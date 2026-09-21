/** Hard caps so extreme inputs never overflow UI or explode digit reels. */
export const MAX_PRICE = 999_999_999; // $999 million
export const MAX_WAGE = 99_999;
export const MAX_HOURS_FOR_ODOMETER = 9_999;

export function clampPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_PRICE, value);
}

export function clampWage(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_WAGE, value);
}

/** Truncate digit strings before parse so paste bombs cannot create Infinity. */
export function clampPriceInput(digits: string): string {
  if (!digits) return "";
  const capped = digits.slice(0, String(MAX_PRICE).length);
  const n = parseInt(capped, 10);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(MAX_PRICE, n));
}

/** Bound decimal money/rate fields while allowing a trailing "." while typing. */
export function clampWageInput(raw: string): string {
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

export type Units = {
  hourlyWage: number; // take-home hourly rate, the base unit everything else derives from
  shiftHours: number; // hours in one work shift, default 8
  dinnerCost: number; // cost of a dinner out, default 25
  /** Custom label for the meal/spend reference unit. */
  dinnerLabel?: string;
};

export const DEFAULT_UNITS: Units = {
  hourlyWage: 15,
  shiftHours: 8,
  dinnerCost: 25,
  dinnerLabel: "dinner out",
};

export type RealCostResult = {
  hours: number;
  shifts: number;
  dinners: number;
};

export function computeRealCost(price: number, units: Units): RealCostResult {
  const safePrice = clampPrice(price);
  const safeWage = units.hourlyWage > 0 ? units.hourlyWage : DEFAULT_UNITS.hourlyWage;
  const safeShift = units.shiftHours > 0 ? units.shiftHours : DEFAULT_UNITS.shiftHours;
  const safeDinner = units.dinnerCost > 0 ? units.dinnerCost : DEFAULT_UNITS.dinnerCost;

  const hours = safePrice / safeWage;
  if (!Number.isFinite(hours)) {
    return { hours: 0, shifts: 0, dinners: 0 };
  }
  return {
    hours,
    shifts: hours / safeShift,
    dinners: safePrice / safeDinner,
  };
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) hours = 0;
  if (hours >= 1_000_000) {
    const m = hours / 1_000_000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "")}M h`;
  }
  if (hours >= 10_000) {
    const k = hours / 1_000;
    return `${k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k h`;
  }
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Hours must clear a full day before calendar gloss appears (hours stay primary). */
export const LIFE_SPAN_MIN_HOURS = 24;

function formatSpanAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 10) return String(Math.round(value));
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function pluralUnit(amount: string, singular: string): string {
  return amount === "1" ? singular : `${singular}s`;
}

/**
 * Secondary calendar gloss for large hour totals.
 * Returns null under 24h so small purchases stay hour-clean.
 * Copy is muted UI caption — never replaces formatHours.
 */
export function formatLifeSpan(hours: number): string | null {
  if (!Number.isFinite(hours) || hours < LIFE_SPAN_MIN_HOURS) return null;

  const years = hours / (24 * 365);
  if (years >= 1) {
    const amount = formatSpanAmount(years);
    return `≈ ${amount} ${pluralUnit(amount, "year")}`;
  }

  const months = hours / (24 * 30);
  if (months >= 1) {
    const amount = formatSpanAmount(months);
    return `≈ ${amount} ${pluralUnit(amount, "month")}`;
  }

  const weeks = hours / (24 * 7);
  if (weeks >= 1) {
    const amount = formatSpanAmount(weeks);
    return `≈ ${amount} ${pluralUnit(amount, "week")}`;
  }

  const days = hours / 24;
  const amount = formatSpanAmount(days);
  return `≈ ${amount} ${pluralUnit(amount, "day")}`;
}

export function formatShifts(shifts: number): string {
  if (!Number.isFinite(shifts) || shifts < 0) return "0 shifts";
  if (shifts >= 10_000) {
    const k = shifts / 1_000;
    return `${k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k shifts`;
  }
  return `${shifts.toFixed(1)} shift${shifts.toFixed(1) === "1.0" ? "" : "s"}`;
}

export function formatDinners(dinners: number, label = "dinner"): string {
  if (!Number.isFinite(dinners) || dinners < 0) dinners = 0;
  const unit = label.trim() || "dinner";
  if (dinners >= 10_000) {
    const k = dinners / 1_000;
    const compact = `${k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}k`;
    return `${compact} ${unit}${unit.endsWith("s") || unit.includes(" ") ? "" : "s"}`;
  }
  const rounded = Math.round(dinners * 10) / 10;
  if (rounded === 1) return `1 ${unit}`;
  if (!unit.includes(" ") && !unit.endsWith("s")) return `${rounded} ${unit}s`;
  return `${rounded} ${unit}`;
}

export function formatMoney(amount: number): string {
  const n = clampPrice(Number.isFinite(amount) ? amount : 0);
  if (n >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
