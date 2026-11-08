const MAX_PRICE = 999_999_999;

function clampPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_PRICE, value);
}

export type ComparisonPayload = {
  price: number;
  /** Opaque share id for the reaction loop. Never encodes wage. */
  shareId?: string;
  /** Recipient is telling the sender they checked this price. */
  isReply?: boolean;
};

export type EncodeOptions = {
  shareId?: string;
  /** Marks a reply link. Hours are never included. */
  isReply?: boolean;
};

export function newShareId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Build a comparison URL.
 * Links carry price only (`p`), plus `s` and `reply` when needed.
 * Hours are never encoded: price and hours together recover wage.
 */
export function encodeComparison(
  origin: string,
  payload: { price: number },
  options: EncodeOptions = {}
): string {
  const url = new URL("/c", origin);
  const price = clampPrice(payload.price);
  url.searchParams.set("p", String(price));
  if (options.shareId) {
    url.searchParams.set("s", options.shareId);
  }
  if (options.isReply) {
    url.searchParams.set("reply", "1");
  }
  return url.toString();
}

/** Parse comparison query params. Price required. Legacy `h` and `n` are ignored. */
export function decodeComparison(params: {
  get: (key: string) => string | null;
}): ComparisonPayload | null {
  const price = clampPrice(parseFloat(params.get("p") ?? ""));
  if (!Number.isFinite(price) || price <= 0) return null;

  const shareId = params.get("s")?.trim() || undefined;
  const isReply = params.get("reply") === "1";
  return { price, shareId, isReply: isReply || undefined };
}

export function shareText(
  priceLabel: string,
  options?: { isReply?: boolean; challenge?: boolean }
): string {
  if (options?.isReply) {
    return `I checked your ${priceLabel}. Ran my own number. Your turn to guess mine.`;
  }
  if (options?.challenge) {
    return `Same ${priceLabel}. Bet it costs us different amounts of life. Check yours.`;
  }
  return `What does ${priceLabel} cost you in hours of your life?`;
}
