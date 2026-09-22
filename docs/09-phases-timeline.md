# Phases & Timeline

Program plan for RealCost — from working calculator to validated share loop. Phases are **gates**, not calendar promises.

**Live:** [https://realcost-xi.vercel.app/](https://realcost-xi.vercel.app/)

---

## Context / Problem

RealCost is a hypothesis product. Building depth (accounts, insights, monetization) before proving **share → recipient → re-share** would optimize the wrong loop.

This timeline sequences work by **risk reduction**: magic first, distribution second, platform never before traction.

---

## Phase Overview

| **Phase** | Name | Status | Goal |
|-------|------|--------|------|
| **0** | Magic | ✅ Done | Price → hours → share → compare works |
| **1** | Loop polish + thrive craft | ✅ Done | Share formats, Shared inbox, hours kept, haptics, peak install, docs, tests, prod deploy |
| **2** | Distribution | **Next** | Organic content, OG experiments, hook A/B |
| **3** | Depth | Conditional | Hours Budget UI, PWA SW, history insights |

> **Hours Budget gate:** Blocked until Phase 2 loop metrics clear (`share_completed` → `recipient_calculation_completed` → react/re-share). See thrive design spec. Do not ship Hours Budget UI before that gate.

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

## Phase 1 — Loop Polish + Thrive Craft ✅

**Objective:** Make sharing irresistible, measurable, and award-level in craft — without becoming a budget app.

### Delivered

| Workstream | Deliverable |
|------------|-------------|
| **Share card 2.0** | Poster 4:5 · Story 9:16 · Dual challenge (`shareFormats.ts`) |
| **Recipient ritual** | Cinematic `/c`; challenge OG (`compareOg.ts`) |
| **Hours kept** | Skipped week/all-time totals + share variant |
| **Haptics** | Reveal / decide / share (`haptics.ts`) |
| **Peak install** | A2HS after share or meaningful Skipped (`a2hsGate.ts`) |
| **Challenge** | 1:1 dual unlock when both sides have hours |
| **Life-span gloss** | Secondary calendar caption ≥24h |
| **History polish** | Recategorize; heat lenses (kept / thinking / spent); all categories |
| **Choice accents** | Home chips + DecisionSheet match History icon colors |
| **Shared cards** | Note + peer name; locked price; no week chrome |
| **iOS chrome** | `viewportFit: cover` + TabBar safe-area inset |
| **Analytics** | Privacy-safe queue + challenge / A2HS / image events |
| **Tests** | Calc, sharing, formats, challenge, haptics, hours-kept, A2HS |
| **Deploy** | Production on Vercel (`realcost-xi.vercel.app`) |
| **Docs** | Case-study set aligned to shipped code |

### Exit criteria (met for craft; loop metrics still Phase 2)

- [x] Share card formats pass visual QA at mobile widths
- [x] Funnel events fire in dev console
- [x] `npm test` + `npm run build` green
- [x] Security Critical privacy invariants hold in code
- [ ] Phase 2: organic share → recipient completion measured in the wild

### Explicitly not in Phase 1

- User accounts
- Cloud sync
- Paid features / Hours Budget UI
- Backend API / service worker

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

Phase 1 craft shipped and live — **met**.

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
| Hours Budget UI | Freemium wedge (doc 14) — still gated |
| Custom units | “Cost in coffees” / regional references |
| PWA shell | Home screen install + offline calc |
| History insights | Weekly patterns beyond heat lenses |
| Improved Shared inbox | Search, richer notes |

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
├── Phase 1 ████████████ Done (polish + thrive craft + prod)
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
| Vercel deploy | ✅ Public URL for sharing |
| OG tags | Link preview quality in iMessage |
| Analytics queue | Funnel measurement |
| Security Critical pass | Public marketing |

---

## Artifacts / Decisions

| Decision | Rationale |
|----------|-----------|
| Thrive craft inside Phase 1 | Loop-first quality before paid growth |
| Phase 2 before Hours Budget | Measure organic loop first |
| Shared not Feed | Naming integrity |
| Docs as deliverable | Portfolio + handoff readiness |
| Phase 4 explicitly deferred | Prevents platform fantasy |

---

## Outcomes / Success Criteria

| Phase | Success signal |
|-------|----------------|
| 0 | Core mechanic demoable |
| 1 | Share craft + funnel instrumented + live URL |
| 2 | Organic shares with recipient completions |
| 3 | Retained usage without paid growth |
| 4 | Platform features serve validated behavior |

---

## Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| Premature Phase 3 | Hard gate on funnel metrics |
| Solo builder bandwidth | Phase 2 is experiments, not feature dump |
| Seasonal purchase moments | Time content around holidays — learning, not forecast |
| Craft without distribution | Phase 2 must start; polish alone does not prove the loop |
