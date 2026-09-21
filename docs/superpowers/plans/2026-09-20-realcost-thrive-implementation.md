# RealCost Thrive 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the seven loop-first-craft moves from the thrive design spec so RealCost’s share object, recipient ritual, Skipped identity, haptics, install timing, 1:1 challenges, and anti-budget focus are production-ready without accounts or Hours Budget UI.

**Architecture:** Extend existing local-first surfaces (`ShareCard` / `shareImage`, `/c` CompareClient, `realcost:log` / `realcost:comparisons`, `InstallPrompt`, Home decision flow). Pure helpers live in `src/lib/*`; UI stays in existing components. No new backend. Dual/story card formats are canvas + CSS aspect variants; challenges reuse comparison log + dual card; install triggers become event-based flags in storage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, existing canvas share pipeline, `navigator.vibrate`, localStorage via `src/lib/storage.ts`, node test runner (`npm test`).

## Global Constraints

- Wage never in URLs, cards, or OG text that could reverse wage (`price ÷ hours` risk only in Exact mode with clear UX already).
- Private share default; Exact opt-in.
- No “Download RealCost” as hero card message — question-first.
- No shame copy (“you wasted…”).
- No leaderboards, public feeds, accounts, cloud sync, push, offline SW, Hours Budget UI this horizon.
- Respect `prefers-reduced-motion` and in-app reduce-motion prefs for motion/haptics.
- Measure funnel: calculation → share → recipient → react/re-share (use existing `track()` events; add only when a task needs a new named event).
- Ink / cobalt / champagne tokens; no emoji as UI icons.
- Spec: `docs/superpowers/specs/2026-09-20-realcost-thrive-recommendations-design.md`

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/shareFormats.ts` | Card format enum, canvas sizes, aspect CSS values |
| `src/lib/shareImage.ts` | Paint posters for `poster45`, `story916`, `dual`, `hoursKept` |
| `src/components/ShareCard.tsx` | On-screen card + format picker + save |
| `src/app/styles/share.css` | Aspect-ratio variants |
| `src/app/c/CompareClient.tsx` | Cinematic recipient ritual |
| `src/app/c/page.tsx` | Challenge-forward static OG/twitter copy |
| `src/components/HoursOdometer.tsx` / `DigitReels.tsx` | Reuse on `/c` reveal |
| `src/lib/streaks.ts` | Add `getHoursKeptTotals()` |
| `src/components/WeeklyStreak.tsx` | Surface hours kept + share CTA |
| `src/lib/haptics.ts` | Shared `triggerHaptic` with reduce-motion gate |
| `src/components/UnitsSetup.tsx` | Import shared haptics |
| `src/app/page.tsx` | Haptics on reveal/decide/share; Skipped emphasis; install signals |
| `src/components/InstallPrompt.tsx` | Emotional-peak triggers |
| `src/lib/storage.ts` | A2HS peak flags; optional challenge marker on comparisons |
| `src/app/feed/page.tsx` | Challenge framing / dual unlock CTA |
| `docs/09-phases-timeline.md`, `docs/14-business-monetization.md`, Home/History copy | Gate Hours Budget; demote budget language |

---

### Task 1: Share card formats 2.0 (`poster45`, `story916`, dual polish)

**Files:**
- Create: `src/lib/shareFormats.ts`
- Modify: `src/lib/shareImage.ts`
- Modify: `src/components/ShareCard.tsx`
- Modify: `src/app/styles/share.css`
- Test: `src/tests/share-formats.test.ts`

**Interfaces:**
- Consumes: existing `ShareImageInput` (`price`, `hours`, `label?`, `compareHours?`, `compareLabel?`)
- Produces:
  - `export type ShareCardFormat = "poster45" | "story916" | "dual"`
  - `export function canvasSizeForFormat(format: ShareCardFormat): { width: number; height: number }`
  - `export function aspectClassForFormat(format: ShareCardFormat): string`
  - Extended `ShareImageInput` with `format?: ShareCardFormat` (default `"poster45"`; if `compareHours > 0` and format omitted, paint dual layout as today)
  - `paintSharePoster(input: ShareImageInput): HTMLCanvasElement` supports all formats
  - Tagline stays question-first (e.g. “What does it cost you?”) — never “Download RealCost”

- [ ] **Step 1: Write the failing test**

Create `src/tests/share-formats.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { canvasSizeForFormat, aspectClassForFormat } from "../lib/shareFormats.ts";

test("poster45 is 1080x1350", () => {
  assert.deepEqual(canvasSizeForFormat("poster45"), { width: 1080, height: 1350 });
});

test("story916 is 1080x1920", () => {
  assert.deepEqual(canvasSizeForFormat("story916"), { width: 1080, height: 1920 });
});

test("dual uses 1080x1350", () => {
  assert.deepEqual(canvasSizeForFormat("dual"), { width: 1080, height: 1350 });
});

test("aspect classes match formats", () => {
  assert.equal(aspectClassForFormat("poster45"), "share-card--poster45");
  assert.equal(aspectClassForFormat("story916"), "share-card--story916");
  assert.equal(aspectClassForFormat("dual"), "share-card--dual");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/tests/share-formats.test.ts`  
Expected: FAIL — cannot find module `../lib/shareFormats.ts`

- [ ] **Step 3: Implement `shareFormats.ts`**

```ts
export type ShareCardFormat = "poster45" | "story916" | "dual";

export function canvasSizeForFormat(format: ShareCardFormat): { width: number; height: number } {
  if (format === "story916") return { width: 1080, height: 1920 };
  return { width: 1080, height: 1350 };
}

export function aspectClassForFormat(format: ShareCardFormat): string {
  return `share-card--${format}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/tests/share-formats.test.ts`  
Expected: PASS (4 tests)

- [ ] **Step 5: Extend `ShareImageInput` and `paintSharePoster`**

In `src/lib/shareImage.ts`:

1. Import `ShareCardFormat`, `canvasSizeForFormat` from `./shareFormats`.
2. Add `format?: ShareCardFormat` to `ShareImageInput`.
3. At start of `paintSharePoster`:

```ts
const challenge = (input.compareHours ?? 0) > 0;
const format: ShareCardFormat =
  input.format ?? (challenge ? "dual" : "poster45");
const { width, height } = canvasSizeForFormat(format === "dual" ? "dual" : format);
```

4. For `story916`, keep the same visual hierarchy (brand, price, hero hours, question tagline) with larger vertical padding; do not add a download CTA line.
5. For `dual` / `compareHours > 0`, keep existing two-column layout; ensure title is “Same money. Different lives.” (or existing “Friend challenge” → prefer spec wording “Same $X. Different lives.” using `formatMoney(price)`).
6. Grep `shareImage.ts` / `ShareCard.tsx` / `share.css` for any “Download” hero string and remove/replace with question-first tagline only.

- [ ] **Step 6: Wire format control in `ShareCard.tsx` + CSS**

- Add local state `format: ShareCardFormat` defaulting to `compareHours ? "dual" : "poster45"`.
- When `compareHours` is absent, show a segmented control: **Post** (`poster45`) | **Story** (`story916`). When dual, lock format to `dual` (no story control needed, or offer Post/Story of dual later — YAGNI: lock dual).
- Pass `format` into `downloadShareImage`.
- Apply `aspectClassForFormat(format)` on the card root beside existing classes.
- In `share.css`:

```css
.share-card--poster45,
.share-card--dual {
  aspect-ratio: 4 / 5;
}
.share-card--story916 {
  aspect-ratio: 9 / 16;
  max-height: min(70vh, 560px);
}
```

- [ ] **Step 7: Manual smoke**

Run: `npm run dev` → Home with a price → Save image as Post and Story; open `/c` with Exact share, complete peer hours, confirm dual card + Save still works.

- [ ] **Step 8: Commit**

```bash
git add src/lib/shareFormats.ts src/lib/shareImage.ts src/components/ShareCard.tsx src/app/styles/share.css src/tests/share-formats.test.ts
git commit -m "feat: add story and dual share card formats"
```

---

### Task 2: Recipient `/c` award ritual + challenge OG

**Files:**
- Modify: `src/app/c/CompareClient.tsx`
- Modify: `src/app/c/page.tsx`
- Modify: `src/app/styles/` (reuse home reveal / digit-reel classes; add `compare-ritual` block in `src/app/styles/share.css` or new `src/app/styles/compare.css` imported from `globals`)
- Test: `src/tests/compare-og.test.ts` (pure copy helper if extracted)

**Interfaces:**
- Consumes: `decodeComparison`, `computeRealCost`, `HoursOdometer` / `NumberReels`, existing `handleReveal` / `handleReact` / `handleShareMine`
- Produces:
  - Single primary post-reveal CTA (React if sender hours present / shareable; else Share mine)
  - Secondary actions demoted (text button / ghost)
  - `export function compareOgCopy(): { title: string; description: string }` used by `page.tsx` metadata (static — no wage/price in OG from query without `generateMetadata`; keep challenge-forward static copy)

- [ ] **Step 1: Write failing test for OG copy helper**

Create `src/lib/compareOg.ts`:

```ts
export function compareOgCopy(): { title: string; description: string } {
  return {
    title: "Same price. What does it cost you?",
    description: "A friend sent you a RealCost challenge. See the price in hours of your life — wage stays on your device.",
  };
}
```

Test file `src/tests/compare-og.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { compareOgCopy } from "../lib/compareOg.ts";

test("OG reads as a challenge, not a download pitch", () => {
  const og = compareOgCopy();
  assert.match(og.title, /cost you|Same price/i);
  assert.doesNotMatch(og.title, /download/i);
  assert.match(og.description, /hours|challenge|device/i);
  assert.doesNotMatch(og.description, /download/i);
});
```

- [ ] **Step 2: Run test — expect FAIL until file exists, then implement helper and PASS**

Run: `node --experimental-strip-types --test src/tests/compare-og.test.ts`

- [ ] **Step 3: Wire metadata in `src/app/c/page.tsx`**

```ts
import { compareOgCopy } from "@/lib/compareOg";

const og = compareOgCopy();
export const metadata: Metadata = {
  title: og.title,
  description: og.description,
  openGraph: { title: og.title, description: og.description, type: "website" },
  twitter: { card: "summary_large_image", title: og.title, description: og.description },
};
```

Note: still no dynamic OG image this task (YAGNI / privacy). `summary_large_image` without image falls back gracefully; if Twitter complains, keep `summary`.

- [ ] **Step 4: Refactor `CompareClient` UI into ritual stages**

Stages (local state already has wage/reveal — reshape JSX only):

1. **Before reveal:** One price display (large), one wage field, one primary button “See my hours”. Minimal helper text: wage stays on this device.
2. **After reveal:** Mount `HoursOdometer` (or `NumberReels` + unit) with their hours; keep peer hours secondary if Exact.
3. **CTA row:** Exactly one filled primary:
   - If payload has `hours` (Exact) or reaction path available → primary `React with my hours` (`handleReact`)
   - Else → primary `Send this back` / `Share mine` (`handleShareMine`)
   - Demote the other to ghost/text.
4. Keep `ShareCard` below fold or behind “Save card” disclosure so the first viewport is the ritual, not a dashboard.

- [ ] **Step 5: Smoke on device**

Open a Private `/c?p=150` and Exact `/c?p=150&h=6` link. Confirm one primary CTA, dramatic hours, no wage in URL bar payload beyond existing rules.

- [ ] **Step 6: Commit**

```bash
git add src/lib/compareOg.ts src/tests/compare-og.test.ts src/app/c/page.tsx src/app/c/CompareClient.tsx src/app/styles/compare.css
git commit -m "feat: cinematic recipient ritual and challenge OG copy"
```

---

### Task 3: Skipped “hours kept” identity + card variant

**Files:**
- Modify: `src/lib/streaks.ts`
- Modify: `src/lib/shareImage.ts` / `src/lib/shareFormats.ts` (add format or `variant: "hoursKept"`)
- Modify: `src/components/WeeklyStreak.tsx`
- Modify: `src/components/ShareCard.tsx` (support hours-kept mode)
- Modify: `src/app/page.tsx` (Skipped chip emphasis when `result.hours` high)
- Modify: `src/lib/copy.ts` if needed for Skipped loudness
- Test: `src/tests/hours-kept.test.ts`

**Interfaces:**
- Consumes: `getLog()`, `getPausedStreak()`, `ShareImageInput`
- Produces:
  - `export type HoursKeptTotals = { hoursThisWeek: number; hoursAllTime: number; skipsAllTime: number }`
  - `export function getHoursKeptTotals(now?: number): HoursKeptTotals`
  - Share path: `ShareImageInput & { variant?: "standard" | "hoursKept" }` — when `hoursKept`, hero copy “I kept {formatHours(hours)} this week”, show price optional or “skipped buys”, never shame

- [ ] **Step 1: Failing tests**

Create `src/tests/hours-kept.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { sumHoursKeptFromEntries } from "../lib/streaks.ts";

test("sumHoursKeptFromEntries sums skipped only", () => {
  const weekStart = Date.UTC(2026, 8, 14); // Mon Sep 14 2026
  const entries = [
    { choice: "bought", hours: 5, timestamp: weekStart + 1000 },
    { choice: "skipped", hours: 2, timestamp: weekStart + 2000 },
    { choice: "skipped", hours: 3, timestamp: weekStart - 86_400_000 },
  ];
  const totals = sumHoursKeptFromEntries(entries, weekStart + 3_600_000);
  assert.equal(totals.hoursThisWeek, 2);
  assert.equal(totals.hoursAllTime, 5);
  assert.equal(totals.skipsAllTime, 2);
});
```

Implement pure helper in `src/lib/streaks.ts`:

```ts
export type HoursKeptTotals = {
  hoursThisWeek: number;
  hoursAllTime: number;
  skipsAllTime: number;
};

export function sumHoursKeptFromEntries(
  entries: { choice: string; hours: number; timestamp: number }[],
  now = Date.now()
): HoursKeptTotals {
  const weekStart = startOfWeek(now);
  const skips = entries.filter((e) => e.choice === "skipped");
  const hoursAllTime = skips.reduce((s, e) => s + e.hours, 0);
  const hoursThisWeek = skips
    .filter((e) => e.timestamp >= weekStart)
    .reduce((s, e) => s + e.hours, 0);
  return { hoursThisWeek, hoursAllTime, skipsAllTime: skips.length };
}

export function getHoursKeptTotals(now = Date.now()): HoursKeptTotals {
  return sumHoursKeptFromEntries(getLog(), now);
}
```

- [ ] **Step 2: Run FAIL then implement until PASS**

- [ ] **Step 3: Hours-kept poster**

In `paintSharePoster`, when `input.variant === "hoursKept"`:

- Brand: RealCost
- Hero: `formatHours(input.hours)` 
- Line: “kept this week”
- Tagline: “I almost bought it.”
- No wage; price optional as muted “skipped {formatMoney(price)}” if `price > 0`

- [ ] **Step 4: UI**

- `WeeklyStreak`: show `hoursThisWeek` with label “Hours kept”; button “Share hours kept” that opens a small sheet or navigates focus to a `ShareCard` with `variant="hoursKept"` and `hours={streak.hoursThisWeek}` (price can be `dollarsPausedThisWeek` or 0).
- Home decision chips: if `result.hours >= 4` (or `>= 3`), visually emphasize Skipped (order already bought/thinking/skipped — boost skipped with stronger border/champagne when hours high). Copy via `getDecisionCopy` already positive — do not add shame.

- [ ] **Step 5: Commit**

```bash
git add src/lib/streaks.ts src/lib/shareImage.ts src/components/WeeklyStreak.tsx src/components/ShareCard.tsx src/app/page.tsx src/tests/hours-kept.test.ts
git commit -m "feat: hours-kept identity and share card variant"
```

---

### Task 4: Sensory decision ritual (haptics)

**Files:**
- Create: `src/lib/haptics.ts`
- Modify: `src/components/UnitsSetup.tsx` (use shared helper)
- Modify: `src/app/page.tsx` (reveal settle, decision commit, share success)
- Modify: `src/app/c/CompareClient.tsx` (reveal + react success)
- Test: `src/tests/haptics.test.ts` (gate logic with injected prefs)

**Interfaces:**
- Produces:
  - `export function shouldHaptic(options?: { reduceMotion?: boolean }): boolean`
  - `export function triggerHaptic(pattern?: number | number[]): void`

```ts
export function shouldHaptic(reduceMotion?: boolean): boolean {
  if (typeof window === "undefined") return false;
  const pref =
    reduceMotion ??
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
    false;
  if (pref) return false;
  if (document.documentElement.getAttribute("data-reduce-motion") === "true") return false;
  return true;
}

export function triggerHaptic(pattern: number | number[] = 8): void {
  if (!shouldHaptic()) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 1: Test `shouldHaptic`**

```ts
test("shouldHaptic false when reduceMotion true", () => {
  assert.equal(shouldHaptic(true), false);
});
test("shouldHaptic true when reduceMotion false", () => {
  assert.equal(shouldHaptic(false), true);
});
```

Note: `shouldHaptic(false)` still checks DOM attribute — in node test, pass explicit arg only; implement so explicit `reduceMotion` argument short-circuits before DOM:

```ts
export function shouldHaptic(reduceMotion?: boolean): boolean {
  if (reduceMotion === true) return false;
  if (reduceMotion === false) {
    // still honor data-reduce-motion if present in browser; in node document may be missing
    if (typeof document !== "undefined" && document.documentElement?.getAttribute("data-reduce-motion") === "true") {
      return false;
    }
    return true;
  }
  // auto-detect path...
}
```

- [ ] **Step 2: Implement + PASS tests**

- [ ] **Step 3: Replace UnitsSetup local function with import from `@/lib/haptics`**

- [ ] **Step 4: Call sites**

| Event | Pattern | Where |
|-------|---------|--------|
| Hours reveal settle | `[8, 30, 12]` | Home after result visible (`useEffect` on `result.hours` or reveal callback) |
| Decision commit | `10` | `handleChoice` after `addLogEntry` |
| Share success | `[10, 40, 14]` | `handleShare` after successful `shareLink` / clipboard |
| `/c` reveal | `[8, 30, 12]` | `handleReveal` |
| `/c` react sent | `[10, 40, 14]` | `handleReact` after share |

No sound. No notifications.

- [ ] **Step 5: Commit**

```bash
git add src/lib/haptics.ts src/tests/haptics.test.ts src/components/UnitsSetup.tsx src/app/page.tsx src/app/c/CompareClient.tsx
git commit -m "feat: haptic ritual on reveal, decide, and share"
```

---

### Task 5: Soft install after emotional peak

**Files:**
- Modify: `src/lib/storage.ts`
- Modify: `src/components/InstallPrompt.tsx`
- Modify: `src/app/page.tsx` (signal after share / meaningful skip)
- Test: `src/tests/a2hs-peak.test.ts`

**Interfaces:**
- Consumes: `hasDismissedA2HS`, `markA2HSDismissed`, `decisionCount`
- Produces:
  - Storage key `realcost:a2hs_peak` = `"share" | "skipped" | ""`
  - `export function markA2HSPeak(reason: "share" | "skipped"): void`
  - `export function getA2HSPeak(): "share" | "skipped" | null`
  - `export function isMeaningfulHoursKept(hours: number): boolean` — `hours >= 1`
  - InstallPrompt shows when: not dismissed, not standalone, and (`getA2HSPeak() != null` **OR** legacy `decisionCount() >= 3` for existing users — prefer peak-first: show only on peak going forward; keep `>= 3` as fallback so current behavior isn’t a hard regression)

Recommended gate (spec: once after first successful share **or** first meaningful Skipped):

```ts
export function shouldShowA2HS(opts: {
  dismissed: boolean;
  standalone: boolean;
  peak: "share" | "skipped" | null;
  decisions: number;
}): boolean {
  if (opts.dismissed || opts.standalone) return false;
  if (opts.peak === "share" || opts.peak === "skipped") return true;
  return opts.decisions >= 3; // legacy fallback
}
```

- [ ] **Step 1: Unit-test `shouldShowA2HS` and `isMeaningfulHoursKept`**

- [ ] **Step 2: Implement storage peak helpers + InstallPrompt rewrite to use `shouldShowA2HS`**

- [ ] **Step 3: Call `markA2HSPeak("share")` after successful Home `handleShare`; `markA2HSPeak("skipped")` in `handleChoice` when `choice === "skipped"` && `isMeaningfulHoursKept(hours)`**

- [ ] **Step 4: Commit**

```bash
git add src/lib/storage.ts src/components/InstallPrompt.tsx src/app/page.tsx src/tests/a2hs-peak.test.ts
git commit -m "feat: show install prompt after share or hours kept"
```

---

### Task 6: 1:1 challenge seasons (local-first)

**Files:**
- Modify: `src/lib/storage.ts` (`ComparisonEntry` optional `challenge?: boolean` or reuse dual-ready Received)
- Modify: `src/lib/sharing.ts` if needed (`EncodeOptions` stays privacy-safe — no new PII)
- Modify: `src/app/page.tsx` / share sheet — “Challenge a friend” uses Exact confirm path (hours included) so dual unlock is possible
- Modify: `src/app/feed/page.tsx` — Waiting copy “Challenge pending”; Received with `peerHours` → “Unlock dual card” → ShareCard dual
- Modify: `src/app/c/CompareClient.tsx` — after both sides have hours, emphasize dual ShareCard
- Test: `src/tests/challenge-entry.test.ts` for pure helpers marking challenge completion

**Interfaces:**
- Produces:
  - `export function isChallengeComplete(entry: { peerHours?: number; hours: number }): boolean` — `entry.peerHours != null && entry.peerHours > 0 && entry.hours > 0`
  - `export function challengeWeekLabel(now = Date.now()): string` — e.g. `"Roommates · this week"` using ISO week or Mon–Sun (cosmetic only)
  - No accounts. No leaderboard.

- [ ] **Step 1: Tests for `isChallengeComplete` / `challengeWeekLabel`**

```ts
test("complete when both hours present", () => {
  assert.equal(isChallengeComplete({ hours: 6, peerHours: 4 }), true);
});
test("incomplete without peer", () => {
  assert.equal(isChallengeComplete({ hours: 6 }), false);
});
```

- [ ] **Step 2: Implement helpers in `src/lib/challenge.ts`**

- [ ] **Step 3: Home share**

Add secondary share mode label “Challenge a friend” that:
1. Forces Exact privacy confirm (existing Exact UX)
2. Sets analytics `track("challenge_share_started")` 
3. Otherwise same `encodeComparison` + `shareId`

- [ ] **Step 4: Feed**

- Waiting: subtitle `Challenge pending · {challengeWeekLabel()}`
- Seen/Received with `isChallengeComplete(entry)`: button “Save dual card” rendering `ShareCard` with `compareHours={entry.peerHours}` / `hours={entry.hours}`

- [ ] **Step 5: Commit**

```bash
git add src/lib/challenge.ts src/tests/challenge-entry.test.ts src/app/page.tsx src/app/feed/page.tsx src/app/c/CompareClient.tsx
git commit -m "feat: local 1:1 friend challenge framing and dual unlock"
```

---

### Task 7: Demote budget-app gravity; gate Hours Budget

**Files:**
- Modify: `docs/09-phases-timeline.md` — Hours Budget remains Phase 3 conditional; add explicit “blocked until share→recipient metrics” note
- Modify: `docs/14-business-monetization.md` — same gate language
- Modify: `docs/00-product-vision.md` or `docs/07-marketing-growth.md` — one line pointing at thrive spec
- Modify: Home / History user-facing strings that say “budget”, “spending tracker”, “limit” in a finance-dashboard sense (grep first)
- Audit: `src/app/page.tsx`, `src/app/history/page.tsx`, `src/components/CategoryHeatMap.tsx` — heat map caption should read as memory (“Where your pauses went”) not “budget by category”

**Interfaces:** none (docs + copy)

- [ ] **Step 1: Grep for budget-gravity language**

Run: `rg -i "budget|spending limit|tracker|Hours Budget" docs src --glob '!docs/superpowers/**'`

- [ ] **Step 2: Soften UI copy**

Examples:
- Heat map title → “Pauses by category” / “Where hours went”
- Avoid “budget” in Home chrome
- Do **not** build Hours Budget UI components

- [ ] **Step 3: Docs gate**

In `docs/09-phases-timeline.md` Phase 3 Hours Budget bullet, add:

> Blocked until Phase 2 loop metrics clear (share_completed → recipient_calculation_completed → react/re-share). See `docs/superpowers/specs/2026-09-20-realcost-thrive-recommendations-design.md`.

- [ ] **Step 4: Commit**

```bash
git add docs/09-phases-timeline.md docs/14-business-monetization.md docs/00-product-vision.md src/app/history/page.tsx src/components/CategoryHeatMap.tsx src/app/page.tsx
git commit -m "docs: gate Hours Budget and demote budget-app framing"
```

---

## Spec coverage self-review

| Spec item | Task |
|-----------|------|
| #1 Share card formats 2.0 (4:5, 9:16, dual) | Task 1 |
| #2 Recipient `/c` ritual + OG | Task 2 |
| #3 Skipped hours kept + card | Task 3 |
| #4 Haptics on reveal/decide/share | Task 4 |
| #5 Install after emotional peak | Task 5 |
| #6 1:1 challenge seasons | Task 6 |
| #7 Demote budget / delay Hours Budget | Task 7 |
| Non-goals (no accounts, SW, leaderboards, AI coach) | Global Constraints + Task 6/7 |

Placeholder scan: none intentional.  
Type consistency: `ShareCardFormat`, `HoursKeptTotals`, `shouldShowA2HS`, `isChallengeComplete` named once and reused.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-20-realcost-thrive-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with executing-plans checkpoints  

Which approach?
