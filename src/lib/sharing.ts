const MAX_PRICE = 999_999_999;

function clampPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_PRICE, value);
}

export type ComparisonPayload = {
  price: number;
  /** Omitted in private share mode so wage cannot be reverse-engineered. */
  hours?: number;
  /** Opaque share id for reaction loop. Never encodes wage. */
  shareId?: string;
  /** Recipient is sending hours back to the original sharer. */
  isReply?: boolean;
};

export type EncodeOptions = {
  /** private (default): price only. exact: includes hours (can reveal wage). */
  privacy?: "private" | "exact";
  shareId?: string;
  /** When true, hours are included as a reaction reply (not a wage leak of the sender). */
  isReply?: boolean;
};

export function newShareId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

/** Build a comparison URL. Never encodes wage or display name. */
export function encodeComparison(
  origin: string,
  payload: { price: number; hours: number },
  options: EncodeOptions = {}
): string {
  const url = new URL("/c", origin);
  const price = clampPrice(payload.price);
  url.searchParams.set("p", String(price));
  const privacy = options.privacy ?? "private";
  const hours = Number.isFinite(payload.hours) ? payload.hours : 0;
  if (options.shareId) {
    url.searchParams.set("s", options.shareId);
  }
  if (options.isReply && hours > 0 && hours < 1e9) {
    url.searchParams.set("reply", "1");
    url.searchParams.set("h", hours.toFixed(2));
  } else if (privacy === "exact" && hours > 0 && hours < 1e9) {
    url.searchParams.set("h", hours.toFixed(2));
  }
  return url.toString();
}

/** Parse comparison query params. Price required; hours optional (private links). */
export function decodeComparison(params: {
  get: (key: string) => string | null;
}): ComparisonPayload | null {
  const price = clampPrice(parseFloat(params.get("p") ?? ""));
  if (!Number.isFinite(price) || price <= 0) return null;

  const shareId = params.get("s")?.trim() || undefined;
  const isReply = params.get("reply") === "1";

  const hoursRaw = params.get("h");
  if (hoursRaw == null || hoursRaw === "") {
    return { price, shareId, isReply: isReply || undefined };
  }

  const hours = parseFloat(hoursRaw);
  if (!Number.isFinite(hours) || hours <= 0 || hours >= 1e9) {
    return { price, shareId, isReply: isReply || undefined };
  }
  return { price, hours, shareId, isReply: isReply || undefined };
}

export function shareText(
  priceLabel: string,
  options?: { hoursLabel?: string; privacy?: "private" | "exact"; isReply?: boolean }
): string {
  if (options?.isReply && options.hoursLabel) {
    return `I saw your ${priceLabel} — it costs me ${options.hoursLabel}. Same dollars. Different life.`;
  }
  const privacy = options?.privacy ?? "private";
  if (privacy === "exact" && options?.hoursLabel) {
    return `This ${priceLabel} cost me ${options.hoursLabel} of my life. What does it cost you?`;
  }
  return `What does ${priceLabel} cost you in hours of your life?`;
}
