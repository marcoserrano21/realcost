export type ShareLinkResult = "shared" | "copied" | "cancelled" | "failed";

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String((error as { name?: string }).name) : "";
  return name === "AbortError";
}

/** Prefer the OS share sheet; never treat cancel as clipboard success. */
export async function shareLink({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareLinkResult> {
  if (typeof navigator === "undefined") return "failed";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (isAbortError(error)) return "cancelled";
      // Fall through to clipboard only when share failed for non-cancel reasons
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
