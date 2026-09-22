# QA Checklist

Pre-launch and regression checklist for RealCost MVP — organized by journey, platform, privacy, and build health.

---

## Context / Problem

RealCost's quality bar is not feature completeness — it's **trust**. A wage leaking into a URL, a broken share sheet, or an unreadable share card kills the hypothesis faster than a missing filter.

This checklist gates Phase 1 exit and supports portfolio demo confidence.

---

## How to Use

| When | Scope |
|------|-------|
| Pre-launch | Full checklist |
| Each PR touching UI/share/storage | Themed sections below |
| Portfolio demo dry run | Journey A + C + D + Visual |

Mark items `[x]` when verified. Note device/browser for share tests.

---

## Journey A — First Visit / Onboarding

- [ ] Fresh browser (no localStorage) shows welcome/setup flow
- [ ] Can complete setup in ≤ 4 screens without account
- [ ] Wage range chips (`$15–20` … `$35+` / Custom) store midpoint; Custom accepts exact rate
- [ ] Default wage allows preview calculation if user skips ahead
- [ ] All five tones selectable (incl. Deadpan); persists after reload
- [ ] Spending focus selection persists
- [ ] Optional name saves locally; not required to proceed
- [ ] `onboarding_completed` fires once (dev console)
- [ ] After setup, lands on Home with price field focusable
- [ ] Settings can edit exact hourly rate after a bucket was chosen

---

## Journey B — Calculate & Decide

- [ ] Enter price → hours display updates immediately
- [ ] Hours use tabular numerals; readable at arm's length
- [ ] Life-span gloss appears only when hours ≥ 24; hours remain primary
- [ ] Shifts and dinners show as secondary units
- [ ] Zero/empty price shows no result (no crash)
- [ ] Very large price (e.g. 99999) formats without overflow
- [ ] Cash amount field stays centered; width grows with digits
- [ ] Category appears **above** decision chips on Home
- [ ] Category chips single-select; re-tap clears; **Others** accepts custom label
- [ ] Bought / Thinking / Skipped each log to History
- [ ] Choice chip borders match History icon accents (success / action / champagne)
- [ ] After decide, secondary blocks collapse; choice locked on Home
- [ ] Decision sheet copy matches selected tone; sheet accents match choice
- [ ] Skipped decision shows weekly pause / hours-kept summary when applicable
- [ ] Weekly streak + flame chip render when streak > 0 (above header)
- [ ] ShareCard readable in light and dark; Post / Story format toggle works
- [ ] Save / share video appears for standard cards when motion allowed; falls back to PNG when reduced-motion
- [ ] Reduce motion: hours digits update (not stuck at 00m); haptics suppressed; video CTA hidden or PNG fallback
- [ ] `calculation_created` and `decision_*` events fire
- [ ] `share_video_*` events (when used) carry no wage/rate props

---

## Journey C — Share (Sender)

- [ ] Share CTA visible from result state
- [ ] Share card preview renders hours as hero (never wage)
- [ ] Story 9:16 and poster 4:5 export correctly
- [ ] Hours-kept card variant available when Skipped totals exist
- [ ] Dual challenge card only when both sides have hours
- [ ] Native share sheet opens on supported mobile browsers
- [ ] Clipboard fallback works when native share unavailable
- [ ] Shared URL: Private = `/c?p=…` (no `h`); Exact = `/c?p=…&h=…` (+ optional `&s=`)
- [ ] **Wage never appears in shared URL** ⚠️ Critical
- [ ] **Name (`n=`) never appears in shared URL** ⚠️ Critical
- [ ] Share text reads naturally; Private does not claim sender hours
- [ ] Sent comparison appears in **Shared** tab (Waiting)
- [ ] Native share abort does not show “copied” success
- [ ] First successful share can show A2HS (if not dismissed / not standalone)
- [ ] `share_started` + `share_completed` events fire (with `privacy` / `challenge` as applicable)

---

## Journey D — Recipient (`/c`)

- [ ] Valid link opens comparison view; tab bar hidden
- [ ] OG / page framing reads as a challenge, not a download pitch
- [ ] Median benchmark teaser shows instantly before wage entry (local constant; no new URL param)
- [ ] Private links: recipient enters wage → own hours for price
- [ ] Exact links: sender hours visible; recipient can compare
- [ ] Legacy `n=` ignored if present
- [ ] Invalid params → friendly broken state, link Home
- [ ] Recipient wage stays local — not appended to URL
- [ ] React / reply updates sender Shared → Seen when `shareId` matches
- [ ] Recipient can share own card after completing
- [ ] Received comparison logs locally on recipient device
- [ ] Dual card unlocks after both sides have hours
- [ ] `comparison_opened` + `recipient_calculation_completed` fire
- [ ] `recipient_shared` fires when recipient shares

---

## Privacy & Security (Critical)

Cross-reference `08-security-privacy.md` audit IDs.

- [ ] **C-01:** Wage never in shared URL (manual + automated test)
- [ ] **C-02:** Analytics queue contains no wage/rate/name keys after full session
- [ ] **C-03:** OG / social preview shows no wage
- [ ] **C-04:** `/c` param fuzzing does not crash or inject HTML
- [ ] **C-05:** Full reset requires confirmation dialog
- [ ] Name field XSS: `<script>alert(1)</script>` rendered as text, not executed
- [ ] Settings clearly states wage is local-only

---

## Visual & Theming

- [ ] **Dark mode** — default design intent; all screens readable
- [ ] **Light mode** — follows OS `prefers-color-scheme`; contrast sufficient
- [ ] **Forced-colors / high contrast** — UI remains usable
- [ ] Share card gradient renders correctly in dark and light (all formats)
- [ ] Brand wordmark legible on Home and share card
- [ ] No purple CTA glow or off-brand accent colors
- [ ] Tab bar clears iPhone home indicator (safe-area)

---

## Accessibility

- [ ] Touch targets ≥ 44px on chips, decision buttons, tab bar items
- [ ] Visible focus rings on all interactive elements
- [ ] Share card has `aria-label` for screen readers
- [ ] **`prefers-reduced-motion`:** press scale disabled; no essential info in motion-only UI; haptics off
- [ ] Semantic landmarks present (`main`, `nav`)
- [ ] Form inputs have associated labels
- [ ] Color is not sole indicator of state

---

## Navigation & Settings

- [ ] All four tabs reachable: Home / **Shared** / History / Settings
- [ ] Shared tab shows Waiting / Seen / Received with distinction
- [ ] Shared cards show note + peer name; price not editable
- [ ] Shared pagination appears only when >10 entries
- [ ] History filters by decision type (Bought / Thinking / Skipped)
- [ ] History filters by category; Sort/Date menus open with chevron animation
- [ ] History can recategorize an entry
- [ ] History heat map shows all categories; metric menu switches kept / thinking / spent
- [ ] History Skipped icon is pause (champagne); distinct from Bought/Thinking
- [ ] Tab titles align across screens (`ScreenHeader`)
- [ ] Glass TabBar readable in light and dark; safe-area inset on notched iPhones
- [ ] Settings: wage edit persists; Exact confirm works; theme/motion persist
- [ ] BounceLoader appears briefly on cold boot when hydrating units
- [ ] Settings: shift hours and dinner cost editable
- [ ] Settings: tone change affects next decision sheet
- [ ] Reset onboarding clears setup but **preserves** history + comparisons
- [ ] Reset RealCost wipes all keys with confirmation
- [ ] `realcost:units-updated` event refreshes Home when settings saved
- [ ] A2HS shows after share or meaningful Skipped; forever dismissible

---

## Build & Test Health

- [ ] `npm test` passes (calc, sharing, formats, challenge, haptics, hours-kept, A2HS)
- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm run lint` passes (if configured)
- [ ] No console errors on happy-path walkthrough
- [ ] Production build runs on [realcost-xi.vercel.app](https://realcost-xi.vercel.app/)

---

## Device Matrix (Recommended)

Minimum manual coverage before public launch:

| Environment | Tests |
|-------------|-------|
| iOS Safari | Share sheet, `/c` open from iMessage, TabBar vs home indicator |
| Android Chrome | Share intent, clipboard fallback |
| Desktop Chrome | Full flow + keyboard nav |
| Desktop Safari | localStorage persistence |

---

## Regression Triggers

Re-run full checklist when changing:

- `src/lib/sharing.ts`
- `src/lib/analytics.ts`
- `src/lib/storage.ts`
- `src/lib/shareFormats.ts` / `shareImage.ts`
- `src/lib/a2hsGate.ts` / `haptics.ts`
- `ShareCard.tsx`
- `/c` route or `CompareClient.tsx`
- OG metadata / layout.tsx (`viewportFit`)
- Theme tokens / globals.css / tab-bar.css

---

## Outcomes / Success Criteria

| Gate | Requirement |
|------|-------------|
| Phase 1 exit | 100% Critical privacy items checked |
| Demo ready | Journey A + C + D pass on iOS Safari |
| Launch ready | Full checklist on device matrix |

---

## Risks / Open Questions

| Gap | Notes |
|-----|-------|
| Automated E2E absent | Manual matrix acceptable for MVP |
| OG preview varies by platform | Test iMessage + Slack + Twitter card |
| localStorage in private mode | Graceful degradation if quota exceeded |
| Canvas share capture | Verify PNG + format toggle; fallback to URL share |
