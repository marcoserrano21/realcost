# Architecture

Technical blueprint for RealCost — a client-only Next.js app where **localStorage is the database** and **the share URL is the network**.

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
| Tests | Node test runner (`npm test`) | Pure calc/sharing functions covered |
| PWA | Web app manifest + A2HS prompt | Standalone install cue; **no service worker yet** |

Agent note: this Next.js version differs from older training defaults — check `node_modules/next/dist/docs/` and `AGENTS.md` before inventing APIs.

---

## Domain Separation

| Layer | Responsibility | Location |
|-------|----------------|----------|
| **Calculation** | Pure price → hours / shifts / dinners | `src/lib/calc.ts` |
| **Formatting** | Duration and money display (tabular numerals in UI) | `src/lib/calc.ts` |
| **Storage** | Units, log, comparisons, personalization, welcome | `src/lib/storage.ts` |
| **Sharing** | Encode/decode URL payloads; share copy | `src/lib/sharing.ts` |
| **Share privacy** | Private vs Exact mode | `src/lib/sharePrivacy.ts` |
| **Native share** | `navigator.share` → clipboard; cancel ≠ success | `src/lib/nativeShare.ts` |
| **Streaks / week** | Mon–Sun paused hours + week streak | `src/lib/streaks.ts`, `src/lib/week.ts` |
| **Preferences** | Theme + reduce-motion → `html` attributes | `src/lib/preferences.ts` |
| **Analytics** | Privacy-safe event queue + sink | `src/lib/analytics.ts` |
| **Copy** | Tone-aware UX writing | `src/lib/copy.ts` |
| **UI** | Presentation only | `src/components/*`, `src/app/*` |

### Calculation contract

```typescript
computeRealCost(price, { hourlyWage, shiftHours, dinnerCost })
// → { hours, shifts, dinners }
```

- `hourlyWage` = take-home hourly rate (base unit)
- Safe fallbacks when values are zero or missing (`DEFAULT_UNITS`)
- Display formatting is separate from computation
- Inputs clamped (price / wage caps) to avoid Infinity / layout overflow

### Storage keys

| Key | Contents |
|-----|----------|
| `realcost:units` | Wage + shift/dinner unit settings |
| `realcost:log` | Decision history entries |
| `realcost:comparisons` | Sent/received Shared log (+ `shareId`, `seenAt`, `myRate`, …) |
| `realcost:name` | Optional display name (**local only** — never in URLs) |
| `realcost:personalization` | Spending focus + tone |
| `realcost:welcome_seen` | Welcome modal flag |
| `realcost:share_privacy` | `private` (default) or `exact` |
| `realcost:theme` | `system` / `light` / `dark` |
| `realcost:motion` | `system` / `full` / `reduced` |
| `realcost:analytics_queue` | Batched analytics events |
| `realcost:a2hs_dismissed` | Install prompt dismissed |
| `realcost:reaction_honesty_seen` | Shared-tab honesty banner dismissed |

Reset paths: `resetOnboarding()` clears setup without wiping history; `clearAllData()` wipes product data (Settings).

Custom events: `realcost:units-updated`, `realcost:preferences-updated`, `realcost:analytics`.

---

## Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Home — calc → category → decide → share | Staggered reveal; weekly streak; TabBar |
| `/feed` | **Shared** tab — local comparison inbox | Waiting / Seen / Received; pagination; route path legacy |
| `/history` | Decision history | Filters, `CompactSelect` sort/date, heat map, edit choice |
| `/settings` | Rate, units, look & feel, sharing mode, reset | Exact mode uses confirm dialog |
| `/c` | Recipient / reaction flow | URL-driven; **no TabBar** |
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
| Glass TabBar | `TabBar.tsx`, `styles/tab-bar.css` | Floating frosted nav |
| ScreenHeader | `ScreenHeader.tsx` | Aligned titles across tabs |
| Digit reels | `DigitReels.tsx`, `HoursOdometer.tsx` | Hours hero; reduced-motion snaps |
| WeeklyStreak | `WeeklyStreak.tsx` | Paused hours + flame streak chip |
| ShareCard | `ShareCard.tsx`, `--share-*` tokens | Light + dark posters; image export |
| BounceLoader | `BounceLoader.tsx` | Boot / suspense wait |
| CompactSelect | `CompactSelect.tsx` | Animated History Sort/Date |
| ConfirmDialog | `ConfirmDialog.tsx` | Deletes, Exact confirm, resets |
| CSS entry | `globals.css` → `styles/*.css` | Split tokens, home, share, motion, reduce-motion |

---

## Data Flow Diagram

```
User enters price
       ↓
computeRealCost(price, units from localStorage)
       ↓
Home reveal: hours → category → decide → ShareCard → Send
       ↓
User logs decision → addLogEntry()
       ↓
User shares → encodeComparison({ price, hours?, shareId, privacy })
       ↓
Recipient opens /c → decodeComparison() (legacy n= ignored)
       ↓
Recipient enters wage locally → computeRealCost(same price, their units)
       ↓
Optional React (reply=1 + h + s) → sender Shared shows Seen
       ↓
Both sides → addComparisonEntry() in local logs
```

---

## Outcomes / Success Criteria

| Engineering outcome | How we know |
|---------------------|-------------|
| Calc logic is trustworthy | `npm test` covers calc + sharing |
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
