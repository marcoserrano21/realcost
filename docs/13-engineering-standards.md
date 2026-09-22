# Engineering Standards

Code quality, architecture, and accessibility conventions for RealCost — optimized for a **small, testable, privacy-critical** client app.

---

## Context / Problem

RealCost will accrue features only if the share loop validates. Engineering standards must:

- Keep domain logic **pure and testable**
- Prevent privacy regressions (wage in URLs/analytics)
- Match Next.js App Router conventions for this repo
- Stay maintainable by a solo builder or small team

Standards favor clarity over cleverness — no premature abstractions.

---

## Approach

### Separation of concerns

| Layer | Rule |
|-------|------|
| `src/lib/*` | Pure functions, no React, no DOM except guarded storage |
| `src/components/*` | Presentation + local UI state only |
| `src/app/*` | Routing, composition, metadata — minimal business logic |

**Anti-pattern:** 200-line `page.tsx` with calc, storage, and share encoding inline.

### Client components sparingly

Use `"use client"` only where browser APIs or interactivity require it. Prefer server components for static shell and metadata.

---

## TypeScript

- **`strict` mode** — no `@ts-ignore` without comment explaining why
- Explicit types on public function exports (`Units`, `ComparisonPayload`, `LogEntry`)
- Prefer `type` over `interface` for unions and storage shapes (match existing `storage.ts`)
- No `any` in lib code

---

## Domain Modules

### Calculation (`calc.ts`)

- Pure functions only
- Safe defaults for zero/negative inputs
- Formatting separate from computation
- Covered by unit tests

### Storage (`storage.ts`)

- All reads/writes guard `typeof window === "undefined"`
- JSON parse wrapped in try/catch via `safeParse`
- Keys prefixed `realcost:` — never unprefixed
- Mutations return void; reads return defaults or null

### Sharing (`sharing.ts`)

- **`encodeComparison` must never accept wage**
- URL built via `URL` API — no string concat hacks
- `decodeComparison` returns `null` on invalid — never throws

### Analytics (`analytics.ts`)

- Strip sensitive keys before queue write
- Never import storage for auto-enrichment
- Event union type exhaustive — add event = update type + docs

### Copy (`copy.ts` / `copyMatrix.ts`)

- Tone × choice matrix data-driven (5 tones including `deadpan`)
- No JSX — strings only
- Uses format helpers from calc at the `getDecisionCopy` boundary, not inline math

---

## React / UI Patterns

### Components

- Small, single-purpose files
- Props typed explicitly
- Event handlers named `handle*` (`handleShare`, `handleDecision`)
- Destructure props in signature

### State

- `localStorage` as source of truth for persistence
- `realcost:units-updated` custom event for cross-component sync
- No Redux/Zustand for MVP — avoid global state complexity

### Styling

- Tailwind utility classes + CSS variables for tokens
- `pressable` class for tactile feedback
- `prefers-reduced-motion` respected in CSS, not JS branches scattered everywhere

---

## Accessibility Requirements

Non-negotiable for every interactive PR:

- Visible focus rings
- `aria-label` on non-text buttons and share card
- Touch targets ≥ 44px on mobile primary actions
- Semantic HTML (`button` not `div onClick`)
- Reduced motion support
- Forced-colors degradation tested (QA checklist)

---

## Testing

### Required coverage

| Module | Test file | Min cases |
|--------|-----------|-----------|
| `calc.ts` | `calc-sharing.test.ts` | Basic hours, edge wages, formatting, median benchmark |
| `sharing.ts` | `calc-sharing.test.ts` | Encode URL shape, decode validation, no wage param |
| `wageBuckets.ts` | `wage-buckets.test.ts` | Midpoints, custom null, formatting |
| `shareVideoCore.ts` | `share-video.test.ts` | MIME pick, duration, reduced-motion gate |
| `copyMatrix.ts` | `copy-tone.test.ts` | All 5 tones × choices; Deadpan voice |

### Commands

```bash
npm test        # unit tests
npm run build   # typecheck + production build
```

### Not required for MVP

- E2E Playwright suite (manual QA matrix instead)
- Snapshot tests of components
- 100% coverage targets

---

## File & Folder Conventions

```
src/
├── app/           # routes (page.tsx, layout.tsx)
├── components/    # reusable UI
├── lib/           # domain logic (no React)
└── tests/         # unit tests (*.test.ts)
```

When a domain grows past one file (future), prefer feature folder:

```
src/lib/analytics/
├── track.ts
├── queue.ts
└── types.ts
```

Don't reorganize prematurely.

---

## Privacy Code Review Checklist

Every PR touching share, analytics, storage, or metadata:

- [ ] No new URL params for wage/rate/income
- [ ] No new analytics props without stripper review
- [ ] No `dangerouslySetInnerHTML` with user content
- [ ] No server logging of query params with user data
- [ ] Tests updated if encoding changes

---

## Git & PR Discipline

- Conventional commits preferred (`feat:`, `fix:`, `docs:`)
- One logical change per PR when possible
- Docs updated when behavior changes (especially `11-analytics.md`, `08-security-privacy.md`)
- No committed secrets (`.env.local` gitignored)

---

## Dependencies

- Prefer packages already in stack (Next, Tailwind, shadcn)
- New dependency requires: size check, maintenance status, privacy implication
- Run `npm audit` before release candidates

---

## Anti-Patterns (Do Not)

| Anti-pattern | Why |
|--------------|-----|
| Wage in React context for “convenience” | Leaks to devtools, risks URL serialization |
| Global window pollution | Hard to test and reason about |
| Copy-paste calc in components | Drift from `computeRealCost` |
| Analytics auto-capture all form fields | Privacy violation |
| `@ts-nocheck` files | Hides real errors |
| Feature flags without docs | Operational confusion |

---

## Artifacts / Decisions

| Standard | Embedded decision |
|----------|-------------------|
| Pure lib modules | Testability + future backend swap |
| localStorage prefix | Namespace collision prevention |
| Custom event sync | No state library for MVP |
| Mobile-first CSS | Primary use case is purchase moments on phone |

---

## Outcomes / Success Criteria

| Outcome | Signal |
|---------|--------|
| New contributor reads lib without React knowledge | Domain clarity |
| Privacy invariant survives PRs | Checklist in code review |
| Build green on Vercel | `npm run build` in CI or pre-push |
| Tests catch sharing regressions | Break encode intentionally — test fails |

---

## Risks / Open Questions

| Question | Direction |
|----------|-----------|
| Add ESLint privacy rules? | Custom rule: ban `wage` in URLSearchParams.set |
| Strict import boundaries? | Consider eslint-plugin-boundaries at Phase 3 |
| Server Components for `/c`? | Metadata SSR ok; wage entry stays client |
| Monorepo split? | Not until Phase 4 platform scope |

---

## Next.js Note

This repo uses a Next.js version with conventions that may differ from training data. Before changing routing, caching, or metadata APIs, read the relevant guide in:

```
node_modules/next/dist/docs/
```

Heed deprecation notices in agent rules (`AGENTS.md`).
