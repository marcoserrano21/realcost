# User Journeys & Flows

End-to-end paths through RealCost MVP — from first visit to closed comparison loop. Use these for UX reviews, QA scenarios, and portfolio walkthroughs.

---

## Context / Problem

RealCost is not optimized for “open app daily.” It wins in **moments**: standing in a store, scrolling a drop, negotiating a purchase with someone else.

Journeys must be short, reversible, and privacy-safe. Every extra step before the first **hours** reveal costs hypothesis validation.

---

## Journey Map Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Onboard    │ ──► │  Calculate   │ ──► │  Decide     │ ──► │  Share       │
│  (once)     │     │  (repeat)    │     │  (optional) │     │  (loop key)  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                      │
                    ┌──────────────┐     ┌─────────────┐              │
                    │  Shared tab  │ ◄── │  Recipient  │ ◄────────────┘
                    │  (local inbox)│     │  `/c` flow  │
                    └──────────────┘     └─────────────┘
```

---

## Journey A — First Visit (Onboarding → First Magic)

### Context

New user arrives with no `localStorage` state. Goal: first **price → hours** reveal in under 60 seconds.

### Steps

1. **Landing** — 3-step `UnitsSetup` (intro + live preview → wage → name/focus/tone)
2. **Home** — price input auto-focused; `WelcomeModal` once after setup
3. User enters price → **staggered reveal**: hours → category → decisions → ShareCard → Send
4. Optional category → Bought / Thinking / Skipped (one-shot lock on Home)
5. `onboarding_completed` / `calculation_created` analytics as applicable

### Artifacts

- `UnitsSetup.tsx` — one-way door until complete
- `OnboardingCostPreview.tsx` — digit reels preview
- `WelcomeModal.tsx` — first-run greeting
- `markWelcomeSeen()` — prevents repeat welcome

### Success criteria

- User sees formatted hours before any share prompt
- Wage saved only to `realcost:units`
- No account creation, no email

### Friction risks

| Risk | Mitigation |
|------|------------|
| Setup feels like a finance app signup | Lead with “one number” framing, not “financial profile” |
| User abandons before rate entry | Live preview with default rate; personalize next |
| Tone choice paralysis | Default Gently; change anytime in Settings |

---

## Journey B — Repeat Calculation (Core Habit Loop)

### Context

Returning user with saved units. RealCost is a **decision tool**, not a dashboard.

### Steps

1. Open Home tab — price field ready
2. Enter price → result updates live via `computeRealCost()`; reveal stack animates
3. Optional **category** selection → `category_selected` event
4. Tap **Bought** / **Thinking** / **Skipped**
5. Tone-aware sheet via `getDecisionCopy()` — weekly skip summary when relevant
6. Entry appended to `realcost:log`; Home choice locks (change in History)
7. Secondary UI collapses (category + share poster); Send CTA remains
8. `decision_*` analytics event

### Repeat value

- **History tab** — filter by decision/category; sort + date; heat map
- **Weekly streak** — paused hours + flame streak chip on Home
- No push notifications — user returns when a purchase moment happens

### Success criteria

- Second calculation faster than first (units cached)
- Decision logging feels lightweight — one tap, dismiss sheet
- History reflects accurate timestamps and categories

---

## Journey C — Share (Sender)

### Context

User wants someone else to see what the price costs *them* — without exposing wage.

### Steps

1. From result state, tap **Send this price** (or Save/share image)
2. `share_started` event
3. System builds URL via `encodeComparison()` using Settings privacy mode:
   - **Private (default):** `p` (+ optional `s`) — **no `h`**
   - **Exact:** `p` + `h` (+ optional `s`) — hours in link
4. **Share card** preview — editorial layout; theme-aware light/dark
5. Native share sheet OR clipboard fallback (`nativeShare.ts`; cancel ≠ copy)
6. `share_completed` event
7. `addComparisonEntry({ role: "sent", shareId, ... })` → **Shared** tab (Waiting)

### Share copy

> This $150 cost me 6h of work. What does it cost you?  
> (Exact mode — or Private copy that asks without revealing hours)

### Success criteria

- Shared URL contains **no wage parameter**
- Private URLs omit `h`
- Sender sees entry under Shared → Waiting
- Name never appears in the URL

### Friction risks

| Risk | Mitigation |
|------|------------|
| Ugly link preview | OG metadata without wage |
| Share abort counted as success | AbortError → cancelled; no fake clipboard toast |
| Exact mode surprise | Settings confirm dialog |
| User hesitates to share income | Default Private (no hours in link) |

---

## Journey D — Recipient (Comparison Loop Closer)

### Context

Recipient receives a `/c` link — Private (`p` only) or Exact (`p` + `h`). May never have used RealCost before.

### Steps

1. Open `/c` — tab bar **hidden**
2. Decode params; **legacy `n=` ignored**
3. Private: enter wage → see own hours for that price; Exact: see sender hours + enter wage for side-by-side
4. Broken link state if params invalid — friendly error, link Home
5. Optional **React**: send hours back via `reply=1` + `h` + matching `s`
6. `addComparisonEntry({ role: "received", ... })` on recipient device
7. Sender’s Shared tab moves entry to **Seen** when reaction applied on-device

### Privacy flow

Recipient wage → their device only. Never appended to URL. Never sent to analytics.

### Success criteria

- Recipient can complete without account
- Invalid URLs degrade gracefully
- Reactions require no server — matching `shareId` on opener’s device

### This is the hypothesis gate

> Share → open → complete → (ideally) re-share / react

---

## Journey E — Settings & Reset

### Context

User adjusts rate, look & feel, or sharing mode.

User updates rate, changes tone, or wipes data.

### Paths

| Action | Effect |
|--------|--------|
| Edit wage/units | Saves to `realcost:units`; dispatches `realcost:units-updated` |
| Theme / motion | `realcost:theme`, `realcost:motion` → `html` class / `data-reduce-motion` |
| Sharing Private ↔ Exact | Exact requires confirm; stored in `realcost:share_privacy` |
| Change tone / focus | Updates copy lens and personalization |
| Reset onboarding | Clears units/name/personalization/welcome; **keeps history + comparisons** |
| Reset RealCost | `clearAllData()` — full wipe with `ConfirmDialog` |

### Success criteria

- Destructive actions require explicit confirmation
- Rate change immediately affects next calculation
- Exact mode cannot be enabled accidentally

---

## Navigation Grammar

| Rule | Rationale |
|------|-----------|
| Tabs are peers | Home / **Shared** / History / Settings — equal weight |
| `/c` hides tab bar | Recipient flow is a focused task |
| Onboarding is one-way door | First-run setup → Home; TabBar hidden until units exist |
| Shared ≠ social feed | Local inbox only; Waiting / Seen / Received |

### Tab responsibilities

| Tab | Primary job |
|-----|-------------|
| **Home** | Calculate + categorize + decide + share |
| **Shared** | Sent/received inbox + reactions |
| **History** | Personal decision log + filters + heat map |
| **Settings** | Rate, look & feel, sharing mode, reset |

---

## Journey × Analytics Mapping

| Journey step | Event |
|--------------|-------|
| First setup complete | `onboarding_completed` |
| Valid price entered | `calculation_created` |
| Category picked | `category_selected` |
| Decision logged | `decision_bought` / `decision_skipped` / `decision_thinking` |
| Share initiated | `share_started` |
| Share delivered | `share_completed` |
| `/c` opened | `comparison_opened` |
| Recipient enters rate | `recipient_calculation_completed` |
| Recipient shares back | `recipient_shared` |

All events pass through wage/name stripper in `analytics.ts`.

---

## Outcomes / Success Criteria

| Outcome | Measure (internal) |
|---------|-------------------|
| First visit → first hours | Funnel: onboarding → calculation_created |
| Calculation → share | share_started / calculation_created ratio |
| Share → recipient complete | recipient_calculation_completed / comparison_opened |
| Loop close | recipient_shared / recipient_calculation_completed |

No public metrics claimed until organic experiments run.

---

## Risks / Open Questions

| Risk | Question |
|------|----------|
| Recipient bounce on wage entry | Can `/c` show impact before asking for rate? (A/B later) |
| Shared tab discovery | Do senders know Waiting → Seen? Honesty banner helps |
| Exact vs Private defaults | Keep Private default; watch Exact opt-in rate |
| History without share | Journey B alone doesn't validate hypothesis — acceptable but insufficient |
| Deep link OG | Does preview communicate “enter your rate” clearly enough? |
