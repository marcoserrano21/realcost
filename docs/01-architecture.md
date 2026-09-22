# Architecture

Technical blueprint for RealCost — a client-only Next.js app where **localStorage is the database** and **the share URL is the network**.

**Live:** [https://realcost-xi.vercel.app/](https://realcost-xi.vercel.app/)

---

## Context / Problem

RealCost needs to validate a social hypothesis: *Will people share what a price costs them and invite someone else to compare?*

That requires:

- Instant calculation with no server round-trip
- Durable-enough local state for repeat use
- A share mechanism that works without accounts
- Strict privacy boundaries (wage never leaves the device in share or analytics payloads)

A traditional backend-first architecture would add latency, cost, and compliance surface before the loop is proven.

---

## Approach

### Zero-backend MVP

All persistent state lives in the browser. Sharing propagates via encoded URL query params on `/c`. The recipient's wage is entered locally — never transmitted through RealCost infrastructure (there is none for user data).

### Domain-driven separation

Business logic stays in pure TypeScript modules. UI components render and delegate. This keeps the product testable and makes future backend insertion possible without rewriting the core.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js **16.3** App Router | File-based routing, OG metadata, Vercel deploy |
| UI runtime | React **19** | App Router client components |
| Language | TypeScript (strict) | Safer refactors as domains grow |
| Styling | Tailwind **v4** + CSS partials under `src/app/styles/` | Token-driven ink / cobalt / champagne; light + dark |
| Components | shadcn/ui + custom product UI | Accessible baseline; own the chrome |
| Persistence | `localStorage` | Zero infra, instant reads/writes |
| Tests | Node test runner (`npm test`) | Calc, sharing, formats, challenge, haptics, A2HS, hours-kept |
| PWA | Web app manifest + A2HS prompt | Standalone install cue; **no service worker yet** |
| Deploy | Vercel (`realcost-xi.vercel.app`) | Git-connected; SSO off for public share links |

Agent note: this Next.js version differs from older training defaults — check `node_modules/next/dist/docs/` and `AGENTS.md` before inventing APIs.

---

## Domain Separation

| Layer | Responsibility | Location |
|-------|----------------|----------|
| **Calculation** | Pure price → hours / shifts / dinners | `src/lib/calc.ts` |
| **Formatting** | Duration, money, life-span gloss | `src/lib/calc.ts` (`formatHours`, `formatLifeSpan`) |
| **Storage** | Units, log, comparisons, personalization, welcome, A2HS | `src/lib/storage.ts` |
| **Sharing** | Encode/decode URL payloads; share copy | `src/lib/sharing.ts` |
| **Share privacy** | Private vs Exact mode | `src/lib/sharePrivacy.ts` |
| **Share formats** | Poster 4:5 / Story 9:16 / Dual canvas sizes | `src/lib/shareFormats.ts` |
| **Share image** | Canvas PNG (standard, hoursKept, challenge) | `src/lib/shareImage.ts` |
| **Native share** | `navigator.share` → clipboard; cancel ≠ success | `src/lib/nativeShare.ts` |
| **Hours kept** | Skipped totals (week / all-time) | `src/lib/hoursKept.ts` |
| **Streaks / week** | Mon–Sun paused hours + week streak | `src/lib/streaks.ts`, `src/lib/week.ts` |
| **Category heat** | Kept / thinking / bought lenses | `src/lib/categoryHeat.ts` |
| **Challenge** | Dual-card unlock when both sides have hours | `src/lib/challenge.ts` |
| **Haptics** | Decision / reveal / share feedback | `src/lib/haptics.ts` |
| **A2HS gate** | Peak-triggered install (share / skipped) | `src/lib/a2hsGate.ts` |
| **Compare OG** | Challenge-framed link preview copy | `src/lib/compareOg.ts` |
| **Preferences** | Theme + reduce-motion → `html` attributes | `src/lib/preferences.ts` |
| **Analytics** | Privacy-safe event queue + sink | `src/lib/analytics.ts` |
| **Copy** | Tone-aware UX writing | `src/lib/copy.ts` |
| **UI** | Presentation only | `src/components/*`, `src/app/*` |

### Calculation contract

```typescript
computeRealCost(price, { hourlyWage, shiftHours, dinnerCost })
// → { hours, shifts, dinners }

formatLifeSpan(hours) // null under 24h; else "≈ N day(s)|week(s)|month(s)|year(s)"
```

- `hourlyWage` = take-home hourly rate (base unit)
- Safe fallbacks when values are zero or missing (`DEFAULT_UNITS`)
- Display formatting is separate from computation
- Inputs clamped (price / wage caps) to avoid Infinity / layout overflow
- Life-span gloss is secondary — never replaces `formatHours`

### Storage keys

| Key | Contents |
|-----|----------|
| `realcost:units` | Wage + shift/dinner unit settings |
| `realcost:log` | Decision history entries (category editable via `updateLogCategory`) |
| `realcost:comparisons` | Sent/received Shared log (+ `shareId`, `seenAt`, `myRate`, `peerHours`, note) |
| `realcost:name` | Optional display name (**local only** — never in URLs) |
| `realcost:personalization` | Spending focus + tone |
| `realcost:welcome_seen` | Welcome modal flag |
| `realcost:share_privacy` | `private` (default) or `exact` |
| `realcost:theme` | `system` / `light` / `dark` |
| `realcost:motion` | `system` / `full` / `reduced` |
| `realcost:analytics_queue` | Batched analytics events |
| `realcost:a2hs_dismissed` | Install prompt dismissed |
| `realcost:a2hs_peak` | Peak reason: `share` \| `skipped` (once) |
| `realcost:reaction_honesty_seen` | Shared-tab honesty banner dismissed |

Reset paths: `resetOnboarding()` clears setup without wiping history; `clearAllData()` wipes product data (Settings).

Custom events: `realcost:units-updated`, `realcost:preferences-updated`, `realcost:analytics`, `realcost:a2hs-peak`.

---

## Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Home — calc → category → decide → share | Streak above header; haptics; TabBar with safe-area |
| `/feed` | **Shared** tab — local comparison inbox | Waiting / Seen / Received; challenge dual unlock; route path legacy |
| `/history` | Decision history | Filters, recategorize, heat map metric menu |
| `/settings` | Rate, units, look & feel, sharing mode, reset | Exact mode uses confirm dialog |
| `/c` | Recipient / challenge / reaction flow | URL-driven; **no TabBar** |
| `/legal/privacy`, `/legal/terms` | Legal | `LegalShell` |

### Share payload (`encodeComparison`)

| Param | When | Meaning |
|-------|------|---------|
| `p` | Always | Price |
| `h` | **Exact** mode, or `reply=1` reaction | Hours |
| `s` | When present | Opaque share id for reactions |
| `reply` | Recipient react | `1` = hours reply for matching `s` |

**Never encoded:** wage, display name (legacy `n=` is stripped on decode), email, or rate fields.

**Private (default):** price (+ optional `s`) only — cannot reverse wage from the link.  
**Exact (opt-in):** price + hours — user confirms in Settings because `p÷h` approximates rate.

---

## Privacy Invariant

> **Never put wage in URLs, analytics, or metadata.**

Enforced in:

- `sharing.ts` / `sharePrivacy.ts` — payload excludes wage; Private omits `h`
- `analytics.ts` — strips keys matching `/wage|rate|email|name/i`
- Share card / canvas PNG / OG — hours and price only (name local on card)

---

## Key UI building blocks

| Piece | Path | Role |
|-------|------|------|
| Glass TabBar | `TabBar.tsx`, `styles/tab-bar.css` | Floating frosted nav; `safe-area-inset-bottom` |
| ScreenHeader | `ScreenHeader.tsx` | Aligned titles across tabs |
| CashAmountField | `CashAmountField.tsx` | Centered price; width grows with digits |
| Digit reels | `DigitReels.tsx`, `HoursOdometer.tsx` | Hours hero; reduced-motion snaps |
| LifeSpanGloss | `LifeSpanGloss.tsx` | Secondary calendar caption ≥24h |
| WeeklyStreak | `WeeklyStreak.tsx` | Paused hours + flame + hours-kept share |
| ShareCard | `ShareCard.tsx`, `shareFormats.ts` | Poster / Story / Dual; hoursKept variant |
| DecisionSheet | `DecisionSheet.tsx` | Tone copy + choice accent borders |
| CategoryHeatMap | `CategoryHeatMap.tsx` | All categories; kept / thinking / spent menu |
| BounceLoader | `BounceLoader.tsx` | Boot / suspense wait |
| CompactSelect | `CompactSelect.tsx` | Animated History Sort/Date |
| ConfirmDialog | `ConfirmDialog.tsx` | Deletes, Exact confirm, resets |
| InstallPrompt | `InstallPrompt.tsx` | Peak-gated A2HS |
| Viewport | `layout.tsx` | `viewportFit: "cover"` for iOS home indicator |
| CSS entry | `globals.css` → `styles/*.css` | Split tokens, home, share, motion, reduce-motion |

---

## Data Flow Diagram

```
User enters price
       ↓
computeRealCost(price, units from localStorage)
       ↓
Home reveal: hours (+ life-span gloss) → category → decide → ShareCard → Send
       ↓
User logs decision → addLogEntry()  (+ haptic)
       ↓
Optional: Skipped → hours kept totals; A2HS peak
       ↓
User shares → encodeComparison({ price, hours?, shareId, privacy })
       ↓
Recipient opens /c → decodeComparison() (legacy n= ignored)
       ↓
Recipient enters wage locally → computeRealCost(same price, their units)
       ↓
Optional React (reply=1 + h + s) → sender Shared shows Seen
       ↓
Both sides hours → dual challenge card unlocks
       ↓
Both sides → addComparisonEntry() in local logs
```

---

## Outcomes / Success Criteria

| Engineering outcome | How we know |
|---------------------|-------------|
| Calc logic is trustworthy | `npm test` covers calc, sharing, formats, hours-kept, A2HS, challenge |
| Build is deployable | `npm run build` passes on Vercel |
| Privacy invariant holds | QA: Private has no `h`; Exact never includes wage; analytics strip works |
| Domains are swappable | Analytics sink replaceable without touching call sites |

---

## Risks / Open Questions

| Risk | Notes |
|------|-------|
| **localStorage quota** | Analytics queue capped; graceful catch on write failure |
| **SSR vs client storage** | Storage reads guarded with `typeof window` |
| **Share URL tampering** | Invalid params → graceful empty state on `/c` |
| **Exact mode inference** | `p/h` ≈ wage — opt-in + confirm only |
| **Future backend** | Sync can sit behind storage abstraction — not built |
| **Hours Budget / Pro** | Documented in `14-business-monetization.md` — **not shipped in code** |

---

## Future Architecture (Not Built)

Only if share → recipient → re-share shows organic traction:

- Optional account + encrypted sync
- Service worker / offline PWA shell
- Server-side OG image generation
- PostHog / Plausible sink for analytics queue flush
- Hours Budget freemium (see doc 14)

None of these are prerequisites for loop validation.
