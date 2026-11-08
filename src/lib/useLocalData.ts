"use client";

import type { Units } from "@/lib/calc";
import { useClientSnapshot } from "@/lib/clientStore";
import { getCategoryHeat, type CategoryHeatMetric, type CategoryHeatRow } from "@/lib/categoryHeat";
import { getPausedStreak, type PausedStreak } from "@/lib/streaks";
import {
  getComparisonLog,
  getLog,
  getName,
  getPersonalization,
  getUnits,
  hasSeenWelcome,
  localRaw,
  STORAGE_KEYS,
  DEFAULT_PERSONALIZATION,
  type ComparisonEntry,
  type LogEntry,
  type Personalization,
} from "@/lib/storage";

const LOADING = Symbol("local-loading");
const EMPTY_LOG: LogEntry[] = [];
export const EMPTY_COMPARISONS: ComparisonEntry[] = [];
const EMPTY_HEAT: CategoryHeatRow[] = [];
const SERVER_STREAK: PausedStreak = {
  weekStreak: 0,
  hoursThisWeek: 0,
  skipsThisWeek: 0,
  dollarsPausedThisWeek: 0,
  dayBars: [0, 0, 0, 0, 0, 0, 0],
  todayIndex: 0,
  bestWeekHours: 0,
  longestStreak: 0,
};

const rawReaders = new Map<string, () => string>();

function raw(key: string): () => string {
  let reader = rawReaders.get(key);
  if (!reader) {
    reader = () => localRaw(key);
    rawReaders.set(key, reader);
  }
  return reader;
}

function readUnits() {
  return getUnits();
}

function readName() {
  return getName();
}

function readPersonalization() {
  return getPersonalization() ?? DEFAULT_PERSONALIZATION;
}

function readWelcome() {
  return hasSeenWelcome();
}

function readLog() {
  return getLog();
}

function readComparisons() {
  return getComparisonLog();
}

function readStreakRaw() {
  return `${localRaw(STORAGE_KEYS.log)}|${new Date().toDateString()}`;
}

function readStreak() {
  return getPausedStreak();
}

const heatRaw = {
  kept: () => `kept|${localRaw(STORAGE_KEYS.log)}`,
  thinking: () => `thinking|${localRaw(STORAGE_KEYS.log)}`,
  bought: () => `bought|${localRaw(STORAGE_KEYS.log)}`,
} as const;

const heatRead = {
  kept: () => getCategoryHeat("kept"),
  thinking: () => getCategoryHeat("thinking"),
  bought: () => getCategoryHeat("bought"),
} as const;

/** `undefined` while the server snapshot is showing. `null` means onboarding. */
export function useUnits(): Units | null | undefined {
  const snap = useClientSnapshot("units", raw(STORAGE_KEYS.units), readUnits, LOADING);
  if (snap === LOADING) return undefined;
  return snap as Units | null;
}

export function useDisplayName(): string {
  return useClientSnapshot("name", raw(STORAGE_KEYS.name), readName, "");
}

export function usePersonalization(): Personalization {
  return useClientSnapshot(
    "personalization",
    raw(STORAGE_KEYS.personalization),
    readPersonalization,
    DEFAULT_PERSONALIZATION
  );
}

export function useWelcomeSeen(): boolean {
  return useClientSnapshot("welcome", raw(STORAGE_KEYS.welcome), readWelcome, true);
}

export function useDecisionLog(): LogEntry[] {
  return useClientSnapshot("log", raw(STORAGE_KEYS.log), readLog, EMPTY_LOG);
}

export function useComparisonLog(): ComparisonEntry[] | undefined {
  const snap = useClientSnapshot("comparisons", raw(STORAGE_KEYS.comparisons), readComparisons, LOADING);
  if (snap === LOADING) return undefined;
  return snap as ComparisonEntry[];
}

export function usePausedStreak(): PausedStreak {
  return useClientSnapshot("streak", readStreakRaw, readStreak, SERVER_STREAK);
}

export function useCategoryHeat(metric: CategoryHeatMetric): CategoryHeatRow[] {
  return useClientSnapshot(`heat:${metric}`, heatRaw[metric], heatRead[metric], EMPTY_HEAT);
}

const honestyReaders = new Map<string, () => boolean>();

function readHonesty(storageKey: string): () => boolean {
  let reader = honestyReaders.get(storageKey);
  if (!reader) {
    reader = () => localRaw(storageKey) !== "1";
    honestyReaders.set(storageKey, reader);
  }
  return reader;
}

export function useShowHonesty(storageKey: string): boolean | undefined {
  const snap = useClientSnapshot(`honesty:${storageKey}`, raw(storageKey), readHonesty(storageKey), LOADING);
  if (snap === LOADING) return undefined;
  return snap;
}
