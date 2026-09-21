# Phases & Timeline

Program plan for RealCost — from working calculator to validated share loop. Phases are **gates**, not calendar promises.

---

## Context / Problem

RealCost is a hypothesis product. Building depth (accounts, insights, monetization) before proving **share → recipient → re-share** would optimize the wrong loop.

This timeline sequences work by **risk reduction**: magic first, distribution second, platform never before traction.

---

## Phase Overview

| **Phase** | Name | Status | Goal |
|-------|------|--------|------|
| **0** | Magic | ✅ Done | Price → hours → share → compare works |
| **1** | Loop polish | ✅ Largely done | Share card, analytics, Shared inbox, UX premium, docs, tests |
| **2** | Distribution | Next | Organic content, OG experiments, hook A/B |
| **3** | Depth | Conditional | Hours Budget UI, PWA SW, history insights |

> **Hours Budget gate:** Blocked until Phase 2 loop metrics clear (`share_completed` → `recipient_calculation_completed` → react/re-share). See `docs/superpowers/specs/2026-09-20-realcost-thrive-recommendations-design.md`. Do not ship Hours Budget UI before that gate.
| **4** | Platform | Later | Extension, wishlist — only if loop healthy |

---

## Phase 0 — Magic ✅

**Objective:** Prove the core mechanic works locally.

### Delivered

| Capability | Evidence |
|------------|----------|
| Price → hours calculator | `computeRealCost()` |
| Wage + units setup | `UnitsSetup.tsx`, `storage.ts` |
| Decision logging | Bought / Thinking / Skipped → `realcost:log` |
| Share URL | Private `p` (+`s`); Exact adds `h`; never wage/name |
| Recipient route | `/c` with side-by-side / react |
| Tab navigation | Home / **Shared** / History / Settings |

### Exit criteria (met)

- User can calculate without account
- Share link opens on another device
- Wage never in URL

---

## Phase 1 — Loop Polish 🔄

**Objective:** Make sharing irresistible and measurable.

### In scope (this sprint)

| Workstream | Deliverable |
|------------|-------------|
| **Share card** | Editorial `ShareCard.tsx` — screenshot-ready |
| **Analytics** | Privacy-safe queue + dev console sink |
| **Onboarding trim** | Faster path to first hours |
| **Compare → Shared rename** | Feed route kept (`/feed`); UI label **Shared** (inbox, not social feed) |
| **OG metadata** | Link previews without wage |
| **Categories** | Purchase chips + Others custom label |
| **Curious tone** | Fourth tone in copy matrix |
| **Premium UI** | Ink/cobalt/champagne system |
| **Tests** | Calc + sharing unit tests |
| **Docs** | Presentation-ready case study set |
| **Figma** | RealCost Atmosphere Fill shader |

### Exit criteria

- [ ] Share card passes visual QA at mobile widths
- [ ] Full funnel events fire in dev console
- [ ] `npm test` + `npm run build` green
- [ ] QA checklist complete (see `12-qa-checklist.md`)
- [ ] Security Critical items Pass (see `08-security-privacy.md`)

### Explicitly not in Phase 1

- User accounts
- Cloud sync
- Paid features
- Backend API

---

## Phase 2 — Distribution (Next)

**Objective:** Learn which hook closes the recipient loop organically.

### Planned work

| Item | Purpose |
|------|---------|
| Content experiments | 3–5 hooks on TikTok/Reels (see `07-marketing-growth.md`) |
| OG image generation | Dynamic or templated preview images |
| Share copy A/B | Test question variants in `shareText()` |
| Analytics sink swap | PostHog or Plausible — still wage-free |
| CSP + Referrer-Policy | Hardening from security audit |

### Entry gate

Phase 1 exit criteria complete.

### Exit criteria

- At least one hook produces repeatable share_completed events
- Recipient completion rate measured (internal — not published)
- Decision on whether loop is healthy enough for Phase 3

### Kill criteria

If share rate near zero after sustained organic effort → pivot hook or core mechanic before building depth.

---

## Phase 3 — Depth (Conditional)

**Only if Phase 2 shows healthy share → recipient → re-share.**

### Candidate features

| Feature | Value |
|---------|-------|
| Custom units | “Cost in coffees” / regional references |
| PWA shell | Home screen install, offline calc |
| History insights | Weekly patterns, category breakdowns |
| Improved Shared inbox | Search, notes on comparisons |

### Not started until

Double-digit recipient completion on shared links (internal bar).

---

## Phase 4 — Platform (Later)

**Never before recipient share rate looks real.**

### Candidate features

| Feature | Risk if early |
|---------|---------------|
| Browser extension | Distribution without loop proof |
| Wishlist / price tracking | Scope creep into budgeting app |
| Accounts + sync | PII custody before PMF |
| Monetization | Revenue without validated behavior |

Reference `14-business-monetization.md` for revenue hypotheses — all post-loop.

---

## Timeline Visualization

```
2026 Q3
├── Phase 0 ████████████ Done
├── Phase 1 ████████░░░░ In progress
│
2026 Q4 (projected)
├── Phase 2 ░░░░░░░░░░░░ Distribution experiments
│
2027 Q1+ (conditional)
├── Phase 3 ░░░░░░░░░░░░ Depth IF loop validates
├── Phase 4 ░░░░░░░░░░░░ Platform IF loop validates
```

Dates are directional — phases gate on outcomes, not calendar.

---

## Dependencies

| Dependency | Blocks |
|------------|--------|
| Vercel deploy | Public URL for sharing |
| OG tags | Link preview quality in iMessage |
| Analytics queue | Funnel measurement |
| Security Critical pass | Public marketing |

---

## Artifacts / Decisions

| Decision | Rationale |
|----------|-----------|
| Phase 1 before ads | Measure organic loop first |
| Shared not Feed | Naming integrity |
| Docs as deliverable | Portfolio + handoff readiness |
| Phase 4 explicitly deferred | Prevents platform fantasy |

---

## Outcomes / Success Criteria

| Phase | Success signal |
|-------|----------------|
| 0 | Core mechanic demoable |
| 1 | Share card + funnel instrumented |
| 2 | Organic shares with recipient completions |
| 3 | Retained usage without paid growth |
| 4 | Platform features serve validated behavior |

---

## Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| Phase 1 scope creep | SPEC.md + non-goals in vision doc |
| Premature Phase 3 | Hard gate on funnel metrics |
| Solo builder bandwidth | Phase 2 is experiments, not feature dump |
| Seasonal purchase moments | Time content around holidays — learning, not forecast |
