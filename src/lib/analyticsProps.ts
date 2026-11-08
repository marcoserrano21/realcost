/**
 * Per-event allowlist for analytics props.
 * Import-free so tests can prove wages, prices, and hours never land in the queue.
 */

const KEY_DENY = /wage|rate|email|name/i;
const MAX_STRING = 40;

const EVENT_PROPS: Record<string, readonly string[]> = {
  calculation_created: [],
  share_started: ["challenge", "source"],
  share_completed: ["method", "challenge"],
  comparison_opened: [],
  comparison_updated: ["role"],
  recipient_calculation_completed: [],
  recipient_shared: ["method"],
  decision_bought: ["has_category"],
  decision_skipped: ["has_category"],
  decision_thinking: ["has_category"],
  decision_updated: ["choice"],
  decision_deleted: ["choice"],
  onboarding_completed: ["tone", "focus"],
  category_selected: ["category", "source"],
  share_image_started: ["format", "variant"],
  share_image_completed: ["format", "variant"],
  share_video_started: ["format", "variant"],
  share_video_completed: ["format", "variant"],
  reaction_sent: [],
  reaction_received: [],
  a2hs_prompt_shown: ["ios", "peak"],
  a2hs_dismissed: [],
  a2hs_choice: ["outcome"],
};

function looksLikeNumber(value: string): boolean {
  const trimmed = value.trim().replace(/[$,]/g, "");
  if (!trimmed) return false;
  return /^-?\d+(?:\.\d+)?$/.test(trimmed);
}

function matchesWage(value: string, wage: number | undefined): boolean {
  if (wage == null || !Number.isFinite(wage) || wage <= 0) return false;
  if (value.trim() === String(wage)) return true;
  const numeric = Number(value.trim().replace(/[$,]/g, ""));
  return Number.isFinite(numeric) && Math.abs(numeric - wage) < 1e-6;
}

export function sanitizeProps(
  event: string,
  props?: Record<string, unknown> | null,
  opts?: { wage?: number }
): Record<string, string | boolean> | undefined {
  if (!props) return undefined;
  const allowed = new Set(EVENT_PROPS[event] ?? []);
  const out: Record<string, string | boolean> = {};

  for (const [key, value] of Object.entries(props)) {
    if (!allowed.has(key) || KEY_DENY.test(key)) continue;
    if (typeof value === "boolean") {
      out[key] = value;
      continue;
    }
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_STRING) continue;
    if (looksLikeNumber(trimmed) || matchesWage(trimmed, opts?.wage)) continue;
    out[key] = trimmed;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}
