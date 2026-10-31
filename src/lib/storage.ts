import { DEFAULT_UNITS, Units } from "./calc";
import { startOfWeek } from "./week";

const UNITS_KEY = "realcost:units";
const LOG_KEY = "realcost:log";
const NAME_KEY = "realcost:name";
const PERSONALIZATION_KEY = "realcost:personalization";
const COMPARISON_LOG_KEY = "realcost:comparisons";
const WELCOME_SEEN_KEY = "realcost:welcome_seen";
/** Removed share-privacy setting. Cleared on load so a stale opt-in cannot linger. */
const LEGACY_SHARE_PRIVACY_KEY = "realcost:share_privacy";
const A2HS_DISMISSED_KEY = "realcost:a2hs_dismissed";
const A2HS_PEAK_KEY = "realcost:a2hs_peak";

export type SpendingFocus =
  | "shopping"
  | "eating_out"
  | "subscriptions"
  | "big_purchases"
  | "impulse"
  | "unsure";

export type Tone = "gentle" | "direct" | "hype" | "curious" | "deadpan";

export type PurchaseCategory =
  | "shopping"
  | "food"
  | "subscriptions"
  | "entertainment"
  | "travel"
  | "tech"
  | "others";

export type Personalization = {
  spendingFocus: SpendingFocus;
  tone: Tone;
};

export const DEFAULT_PERSONALIZATION: Personalization = {
  spendingFocus: "unsure",
  tone: "gentle",
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getPersonalization(): Personalization | null {
  if (typeof window === "undefined") return null;
  const parsed = safeParse<Partial<Personalization>>(window.localStorage.getItem(PERSONALIZATION_KEY));
  if (!parsed) return null;
  const tone = (["gentle", "direct", "hype", "curious", "deadpan"] as Tone[]).includes(parsed.tone as Tone)
    ? (parsed.tone as Tone)
    : DEFAULT_PERSONALIZATION.tone;
  return {
    spendingFocus: (parsed.spendingFocus as SpendingFocus) ?? DEFAULT_PERSONALIZATION.spendingFocus,
    tone,
  };
}

export function setPersonalization(personalization: Personalization) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(personalization));
}

export function getUnits(): Units | null {
  if (typeof window === "undefined") return null;
  const parsed = safeParse<Partial<Units>>(window.localStorage.getItem(UNITS_KEY));
  if (!parsed) return null;
  return { ...DEFAULT_UNITS, ...parsed } as Units;
}

export function setUnits(units: Units) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNITS_KEY, JSON.stringify(units));
}

export function getName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function setName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
}

export type Choice = "bought" | "skipped" | "thinking";

export type LogEntry = {
  id: string;
  price: number;
  hours: number;
  choice: Choice;
  timestamp: number;
  category?: PurchaseCategory;
  categoryLabel?: string;
};

function normalizeLog(entries: Partial<LogEntry>[]): LogEntry[] {
  let mutated = false;
  const next = entries.map((entry) => {
    if (entry.id && typeof entry.price === "number" && typeof entry.hours === "number" && entry.choice) {
      return entry as LogEntry;
    }
    mutated = true;
    return {
      id: entry.id || newId(),
      price: Number(entry.price) || 0,
      hours: Number(entry.hours) || 0,
      choice: (entry.choice as Choice) || "thinking",
      timestamp: Number(entry.timestamp) || Date.now(),
      category: entry.category,
      categoryLabel: entry.categoryLabel,
    } satisfies LogEntry;
  });
  if (mutated && typeof window !== "undefined") {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
  }
  return next;
}

export function getLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Partial<LogEntry>[]>(window.localStorage.getItem(LOG_KEY)) ?? [];
  return normalizeLog(parsed);
}

export function addLogEntry(entry: Omit<LogEntry, "id"> & { id?: string }): LogEntry {
  const full: LogEntry = { ...entry, id: entry.id || newId() };
  if (typeof window === "undefined") return full;
  const log = getLog();
  log.push(full);
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return full;
}

/** One-shot rule: Home never rewrites; History may change the decision later. */
export function updateLogChoice(id: string, choice: Choice): LogEntry | null {
  if (typeof window === "undefined") return null;
  const log = getLog();
  const index = log.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  log[index] = { ...log[index], choice };
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return log[index];
}

/** History may assign or clear a purchase category after the fact. */
export function updateLogCategory(
  id: string,
  category: PurchaseCategory | null,
  categoryLabel?: string
): LogEntry | null {
  if (typeof window === "undefined") return null;
  const log = getLog();
  const index = log.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  const current = log[index];
  if (category === null) {
    log[index] = {
      id: current.id,
      price: current.price,
      hours: current.hours,
      choice: current.choice,
      timestamp: current.timestamp,
    };
  } else {
    const next: LogEntry = {
      ...current,
      category,
    };
    if (categoryLabel?.trim()) {
      next.categoryLabel = categoryLabel.trim();
    } else {
      delete next.categoryLabel;
    }
    log[index] = next;
  }
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return log[index];
}

export function deleteLogEntry(id: string): boolean {
  if (typeof window === "undefined") return false;
  const log = getLog();
  const next = log.filter((entry) => entry.id !== id);
  if (next.length === log.length) return false;
  window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
  return true;
}

/** Calendar week (Mon–Sun), aligned with getPausedStreak. */
export function getWeekSummary(now = Date.now()) {
  const log = getLog();
  const weekStart = startOfWeek(now);
  const thisWeek = log.filter((entry) => entry.timestamp >= weekStart);
  const skipped = thisWeek.filter((entry) => entry.choice === "skipped");
  const considered = thisWeek.length;
  const skippedTotal = skipped.reduce((sum, entry) => sum + entry.price, 0);
  const skippedHours = skipped.reduce((sum, entry) => sum + entry.hours, 0);
  return { considered, skippedCount: skipped.length, skippedTotal, skippedHours };
}

export type ComparisonRole = "sent" | "received";

export type ComparisonEntry = {
  id: string;
  price: number;
  hours: number;
  role: ComparisonRole;
  peerName?: string;
  peerHours?: number;
  /** Receiver's take-home rate — local only, never shared in URLs. */
  myRate?: number;
  /** Opaque id embedded in share links for the reaction loop. */
  shareId?: string;
  /** When a friend opened / replied to this sent share. */
  seenAt?: number;
  timestamp: number;
  note?: string;
};

function normalizeComparisons(entries: Partial<ComparisonEntry>[]): ComparisonEntry[] {
  let mutated = false;
  const next = entries.map((entry) => {
    if (entry.id && typeof entry.price === "number" && typeof entry.hours === "number" && entry.role) {
      return entry as ComparisonEntry;
    }
    mutated = true;
    return {
      id: entry.id || newId(),
      price: Number(entry.price) || 0,
      hours: Number(entry.hours) || 0,
      role: (entry.role as ComparisonRole) || "sent",
      peerName: entry.peerName,
      peerHours: entry.peerHours,
      myRate: typeof entry.myRate === "number" && entry.myRate > 0 ? entry.myRate : undefined,
      shareId: entry.shareId,
      seenAt: typeof entry.seenAt === "number" ? entry.seenAt : undefined,
      timestamp: Number(entry.timestamp) || Date.now(),
      note: entry.note,
    } satisfies ComparisonEntry;
  });
  if (mutated && typeof window !== "undefined") {
    window.localStorage.setItem(COMPARISON_LOG_KEY, JSON.stringify(next));
  }
  return next;
}

export function getComparisonLog(): ComparisonEntry[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Partial<ComparisonEntry>[]>(window.localStorage.getItem(COMPARISON_LOG_KEY)) ?? [];
  return normalizeComparisons(parsed);
}

export function addComparisonEntry(entry: Omit<ComparisonEntry, "id"> & { id?: string }): ComparisonEntry {
  const full: ComparisonEntry = { ...entry, id: entry.id || newId() };
  if (typeof window === "undefined") return full;
  const log = getComparisonLog();
  log.push(full);
  window.localStorage.setItem(COMPARISON_LOG_KEY, JSON.stringify(log));
  return full;
}

export function updateComparisonEntry(
  id: string,
  patch: Partial<
    Pick<ComparisonEntry, "price" | "hours" | "note" | "role" | "peerHours" | "myRate" | "shareId" | "seenAt">
  >
): ComparisonEntry | null {
  if (typeof window === "undefined") return null;
  const log = getComparisonLog();
  const index = log.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  log[index] = { ...log[index], ...patch };
  window.localStorage.setItem(COMPARISON_LOG_KEY, JSON.stringify(log));
  return log[index];
}

/** Apply a friend reaction onto a Sent share (local-only; never needs a server). */
export function applyShareReaction(
  shareId: string,
  reactionHours?: number
): ComparisonEntry | null {
  if (typeof window === "undefined" || !shareId) return null;
  const log = getComparisonLog();
  const index = log.findIndex((entry) => entry.role === "sent" && entry.shareId === shareId);
  if (index < 0) return null;
  log[index] = {
    ...log[index],
    seenAt: Date.now(),
    peerHours:
      typeof reactionHours === "number" && reactionHours > 0 ? reactionHours : log[index].peerHours,
  };
  window.localStorage.setItem(COMPARISON_LOG_KEY, JSON.stringify(log));
  return log[index];
}

export function deleteComparisonEntry(id: string): boolean {
  if (typeof window === "undefined") return false;
  const log = getComparisonLog();
  const next = log.filter((entry) => entry.id !== id);
  if (next.length === log.length) return false;
  window.localStorage.setItem(COMPARISON_LOG_KEY, JSON.stringify(next));
  return true;
}

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(WELCOME_SEEN_KEY) === "1";
}

export function markWelcomeSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
}

export function clearWelcomeSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WELCOME_SEEN_KEY);
}

export function hasDismissedA2HS(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(A2HS_DISMISSED_KEY) === "1";
}

export function markA2HSDismissed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(A2HS_DISMISSED_KEY, "1");
}

export type A2HSPeakReason = "share" | "skipped";

export function markA2HSPeak(reason: A2HSPeakReason) {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(A2HS_PEAK_KEY)) {
    window.localStorage.setItem(A2HS_PEAK_KEY, reason);
  }
  window.dispatchEvent(new Event("realcost:a2hs-peak"));
}

export function getA2HSPeak(): A2HSPeakReason | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(A2HS_PEAK_KEY);
  if (raw === "share" || raw === "skipped") return raw;
  return null;
}

export { isMeaningfulHoursKept, shouldShowA2HS } from "./a2hsGate";

export function decisionCount(): number {
  return getLog().length;
}

/**
 * Sends the user back through onboarding without wiping history/comparisons.
 * Clears wage/units, name, personalization, and welcome flag.
 */
export function clearLegacySharePrivacy() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_SHARE_PRIVACY_KEY);
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  [UNITS_KEY, NAME_KEY, PERSONALIZATION_KEY, WELCOME_SEEN_KEY, LEGACY_SHARE_PRIVACY_KEY].forEach(
    (key) => window.localStorage.removeItem(key)
  );
}

/** Wipes every locally stored key. Used by the settings "reset" action. */
export function clearAllData() {
  if (typeof window === "undefined") return;
  [
    UNITS_KEY,
    LOG_KEY,
    NAME_KEY,
    PERSONALIZATION_KEY,
    COMPARISON_LOG_KEY,
    WELCOME_SEEN_KEY,
    LEGACY_SHARE_PRIVACY_KEY,
  ].forEach((key) => window.localStorage.removeItem(key));
}
