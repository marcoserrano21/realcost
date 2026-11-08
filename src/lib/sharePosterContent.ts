/**
 * Strings painted on a share poster or rendered in ShareCard.
 * Import-free so tests can prove a poster never carries price and hours together.
 * A poster shows the hours, never the price. A link shows the price, never the hours.
 * The two are never painted on the same artifact, and a poster never includes a life-span gloss.
 */

export type SharePosterFormatters = {
  formatMoney: (amount: number) => string;
  formatHours: (hours: number) => string;
};

export type SharePosterInput = {
  price?: number;
  hours?: number;
  variant?: "standard" | "hoursKept";
};

export type SharePosterContent = {
  brand: string;
  priceLine: string | null;
  hoursLine: string | null;
  caption: string | null;
  tagline: string[];
  cta: string;
  /** Every user-visible string, in read order. */
  lines: string[];
};

export function sharePosterContent(
  input: SharePosterInput,
  formatters: SharePosterFormatters
): SharePosterContent {
  const brand = "RealCost";
  const cta = "What does it cost you?";

  if (input.variant === "hoursKept") {
    const hoursLine = formatters.formatHours(input.hours ?? 0);
    const caption = "kept this week";
    const tagline = ["I almost bought it."];
    return {
      brand,
      priceLine: null,
      hoursLine,
      caption,
      tagline,
      cta,
      lines: [brand, hoursLine, caption, ...tagline, cta],
    };
  }

  const hoursLine = formatters.formatHours(input.hours ?? 0);
  const caption = "of your work";
  const tagline = ["Same dollars.", "Different life."];
  return {
    brand,
    priceLine: null,
    hoursLine,
    caption,
    tagline,
    cta,
    lines: [brand, hoursLine, caption, ...tagline, cta],
  };
}
