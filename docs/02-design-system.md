# Design System

Visual and interaction language for RealCost — premium consumer clarity with Gen-Z warmth, built for **number-as-hero** moments and **shareable editorial cards**.

---

## Context / Problem

RealCost's UI must do three jobs at once:

1. **Reframe** — Make hours feel immediate and personal (not spreadsheet-dry)
2. **Respect** — Never shame; tone-adaptive copy sits inside a calm visual frame
3. **Travel** — Share cards must look intentional enough to screenshot and send

Generic fintech purple gradients and emoji-heavy UI would undermine the thesis (“Same money. Different reality.”) and signal the wrong category.

---

## Approach

### Signature aesthetic

**Ink atmosphere + one cobalt accent + champagne highlight.**

Dark mode is the primary design target (premium, cinematic). Light mode mirrors the same hierarchy with adjusted contrast. One accent color only — no competing CTAs or rainbow chip states.

### Typography as product

Money and duration values are the hero. Outfit (geometric, contemporary) carries display and UI. Tabular numerals on all financial and time readouts prevent layout shift and signal precision.

---

## Design Tokens

| Token | Role | Dark | Light |
|-------|------|------|-------|
| Background | Screen base | `#07070b` | `#f5f6fb` |
| Foreground | Primary text | `#f4f4f7` | `#12131a` |
| Action | Primary interactive | `#7aa2ff` / `#3b6ef5` | `#2f5de8` |
| Champagne | Highlight / editorial accent | `#d4b483` | `#8a6635` |
| Muted | Secondary labels | `#a8a8b8` | `#3f4658` |
| Share poster | Scoped `--share-*` tokens | Dark ink poster | Champagne paper poster |

Tokens are CSS custom properties on `:root` / `html.light`. Theme follows Settings or OS (`system` | `light` | `dark`) via `preferences.ts` + boot script — not CSS-only `prefers-color-scheme` alone.

---

## Typography Scale

| Use | Treatment |
|-----|-----------|
| Hero hours | Large display, tabular nums, tight tracking |
| Price input | Prominent, centered, minimal chrome |
| Section labels | Small caps or muted weight — never compete with numbers |
| Body / decision copy | Comfortable reading size; tone cards use slightly warmer spacing |
| Share card | Editorial hierarchy: brand → hours → price → question |

**Font:** Outfit (Google Fonts) — loaded once in root layout.

---

## Shape Language

| Element | Radius | Rationale |
|---------|--------|-----------|
| Buttons / primary actions | 14px | Confident, tappable, not pill-generic |
| Cards / panels | 20–28px | Soft premium container |
| Chips / tone selectors | Pill or 16px | Scannable option groups |
| Share card | 20px+ with gradient border treatment | Screenshot-safe framing |

Consistency here prevents “assembled from three templates” energy.

---

## Motion

| Pattern | Spec | Accessibility |
|---------|------|---------------|
| Press feedback | Scale `0.97` ~120ms (`pressable`) | Off under `data-reduce-motion` |
| Home results reveal | Slot open ~720–760ms; stack delay ~280ms; `reveal-rise` ~1000ms stagger | Instant under reduced motion |
| Digit reels | Y-translate strip; shortened duration when reduced | **Must keep transform** so digits still show correct value |
| Tab / page enter | Soft fade on secondary tabs (`PageEnter`) | Skipped when reduced |
| Accordion / CompactSelect chevron | 180° rotate ~280ms | Transition none when reduced |
| Post-decision collapse | Secondary blocks (`category`, share card) collapse; chips stay | Instant hide when reduced |

User preference: Settings → Motion (`system` / `full` / `reduced`) → `html[data-reduce-motion="true"]`.

---

## Component Patterns

### Calculator (Home)

- `WeeklyStreak` above `ScreenHeader`; centered `CashAmountField` (width grows with digits)
- Result reveal order: **hours → life-span gloss (≥24h) → category → decision chips → ShareCard → Send**
- Decision chips use choice accents: Bought = success green, Thinking = action cobalt, Skipped = champagne
- After decide: secondary blocks collapse; choice locked on Home (edit / recategorize in History)
- Haptics on reveal settle, decision commit, share success (`haptics.ts`)

### Share card (`ShareCard.tsx`)

- Formats via `shareFormats.ts`: **4:5 poster**, **9:16 story**, **dual challenge**
- Floating format pill (Post / Story) when not locked to dual or hours-kept
- Hours large; brand small; never wage; optional life-span gloss on PNG
- Variants: `standard` · `hoursKept` (“I kept N hours…”) · dual after both sides have hours
- Dedicated light + dark `--share-*` surfaces (not app chrome tokens)
- Canvas PNG export mirrors theme + format (`shareImage.ts`)
- Native share sheet via `nativeShare.ts` (abort ≠ clipboard success)

### Shared tab (`/feed`)

- Sections: Waiting / Seen·replied / Received
- Cards show note + peer name; price locked (no inline edit); no week / “Roommates” chrome
- Dual challenge unlock when `isChallengeComplete` (both sides’ hours)
- History-style pagination when >10 items
- Honesty banner for on-device reactions

### History

- Filters accordion; `CompactSelect` for Sort/Date (animated chevron)
- Recategorize from entry actions (not share-from-history)
- Category heat map: **all categories**; metric menu **kept / thinking / spent** (opaque dropdown)
- Skipped = pause (champagne); Bought = check (success); Thinking = clock (action)

### Tab bar

- Floating glass pill (`backdrop-filter`, rounded 22px, inset from edges)
- Bottom offset: `16px + env(safe-area-inset-bottom)` for iPhone home indicator
- Root layout: `viewportFit: "cover"` so safe-area insets apply
- Home / Shared / History / Settings; hidden pre-onboard, `/c`, `/legal`

### Settings

- Rate, units, Look & feel (theme + motion), Sharing Private/Exact, danger zone
- Exact mode: confirm dialog before enabling hours-in-link

### Loading / install

- `BounceLoader` — champagne → cobalt bouncing dots on boot / Suspense
- `InstallPrompt` — soft A2HS after share peak or meaningful Skipped (≥1h kept); legacy ≥3 decisions

---

## CSS organization

Entry: `src/app/globals.css` imports Tailwind + partials:

`tokens` · `base` · `primitives` · `surfaces` · `forms` · `home` · `history` · `feed-shared` · `settings` · `overlays` · `share` · `tab-bar` · `motion` · `loading` · `theme-light` · `reduce-motion`

---

## Anti-Slop Rules

Hard constraints for any new UI:

| Avoid | Why |
|-------|-----|
| Purple CTA glow | Reads as generic AI fintech |
| Emoji as icons | Undermines premium positioning |
| Mixed grey families | Breaks ink atmosphere cohesion |
| Multiple accent colors | Dilutes hierarchy |
| Shame colors (angry red on “Skipped”) | Violates brand voice |
| Dense data tables | This is not a dashboard product |

When in doubt: **one number, one accent, one action.**

---

## Accessibility Baseline

- Touch targets ≥ 44px on chips, decision buttons, tab bar
- Visible focus rings on all interactive elements
- Semantic landmarks (`main`, `nav`, `article` on share card)
- `aria-label` on share card for screen reader context
- Forced-colors / high-contrast: tokens degrade to system palette gracefully
- Reduced motion: decorative motion suppressed; **digit reel transforms preserved** so values stay correct
- Stroke SVG icons only (`icons.tsx`) — no emoji as UI icons

---

## Gradients (Intentional, Limited)

1. **Screen aurora wash** — ambient depth
2. **Panel glass wash** — elevated surfaces
3. **Share card editorial gradient** — dark ink or light champagne paper via `--share-bg`

No gradient on every button. Gradients mark *moments*, not *controls*.

---

## Figma / Brand Assets

Account shader: **RealCost Atmosphere Fill**  
ID: `5a52d4a4-77bb-46e6-b8be-a41417a5d330`

Use for brand boards, deck backgrounds, and marketing stills — ink/cobalt/champagne atmospheric fill matching in-app gradients.

---

## Artifacts / Decisions

| Artifact | Decision embedded |
|----------|-------------------|
| Token table | Dual-theme from day one — no “dark mode later” |
| Outfit font | Gen-Z premium without startup-playful excess |
| Share card as designed object | Distribution creative is designed, not an afterthought |
| Five tone cards in onboarding | Visual parity — no “default vs other” hierarchy |

---

## Outcomes / Success Criteria

| Design outcome | Validation |
|----------------|------------|
| Hero number readable in <1s | Usability review on Home result state |
| Share card screenshot-ready | Visual QA at 390px and 430px widths |
| Dark + light both feel intentional | QA checklist theme pass |
| No shame-trigger visuals | Brand + behavioral science review |

---

## Risks / Open Questions

| Question | Direction |
|----------|-----------|
| Custom share card themes (paid?) | Phase 3+; MVP ships poster / story / dual formats |
| Category chip iconography | Compact text chips; deselect by re-tap |
| Desktop layout | Mobile-first; desktop gets max-width container, not separate design |
