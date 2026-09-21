# Documentation History

Change log and source-of-truth hierarchy for RealCost project documentation.

**Handoff note for reviewers (ChatGPT / Claude):** Read this file first for *what shipped and why*, then `00-product-vision.md` → `01-architecture.md` → `08-security-privacy.md` → current code under `src/`. Prefer code over docs when they diverge; call out drift.

---

## Context / Problem

RealCost is a privacy-first web MVP: price → hours of life, share/compare without accounts or bank links. It evolved from a locked MVP spec through polish + growth loops in September 2026. Without documented history, reviewers cannot tell **what was decided, when, and why**.

This file tracks both **doc evolution** and a **product implementation changelog** suitable for external review.

---

## Product changelog (code) — 2026-09-19

| Area | What shipped | Notes |
|------|----------------|-------|
| **Shared tab** | Compare → **Shared** label; Waiting / Seen / Received; pagination | Route remains `/feed` |
| **Home motion** | Top-anchored stage; slower reveal; category above chips; post-decide collapse | Reduced-motion digit reels fixed |
| **ShareCard themes** | Dedicated `--share-*` light champagne paper + dark ink; PNG matches theme | |
| **Glass TabBar** | Frosted floating pill, rounded corners | Light + dark |
| **ScreenHeader** | Aligned titles across Home / Shared / History / Settings | |
| **History** | `CompactSelect` Sort/Date with animated chevron; pause icon for Skipped; aligned edit actions | |
| **Streak flame** | Stroke `FlameIcon` on week-streak chip | No emoji |
| **BounceLoader** | Champagne → cobalt bounce on boot / Suspense | |
| **CSS split** | `globals.css` → `src/app/styles/*` partials | |

### Docs sync (same day)

Architecture, journeys, design system, QA, security, brand, phases, README updated to match code (Private/Exact, no `n=` in URLs, Shared naming, Hours Budget = docs-only).

---

## Product changelog (code) — 2026-09-18

| Area | What shipped | Privacy / risk notes |
|------|----------------|----------------------|
| **Compare expand UX** | Slower height open + fields-first stagger on `TappableExpandCard` | Motion respects `data-reduce-motion` |
| **Share poster** | Always-on 4:5 viral card (hours hero, champagne rule); **Save / share image** via canvas PNG | Tip: prefer Private links; images can leak hours |
| **Huge inputs** | Cap price `$999M`, wage `$99,999`; compact `$999M` / `12.5k h`; odometer fallback | Prevents Infinity / UI overflow |
| **Received rate** | `myRate` on Received cards (local only) | Never in share URLs |
| **No text select** | `user-select: none` globally; inputs still selectable | |
| **Legal** | Back to top with **eased JS scroll** (not instant) | Instant jump only if reduce-motion |
| **Settings** | Floating **Save changes** fades in when dirty | Above tab bar |
| **Weekly streak** | Home: hours paused this week + consecutive week streak | Derived from local skip log only |
| **Category heat map** | History: hours-of-life bars by category | Local log only |
| **Reaction loop** | Share links carry opaque `s=` id; recipient **React: send hours back** via `reply=1`; sender **Shared** shows **Seen** | No wage in URL; no server; reaction applies when opener has matching Sent `shareId` on-device |
| **Friend challenge** | Dual hours on ShareCard / PNG when peer hours exist | |
| **Decision sheet** | Primary CTA **Send this price** (one-tap reshare) | |
| **A2HS** | After **3 decisions**, install / Add to Home Screen prompt; `manifest` + `icon` | Dismiss persisted; no account |
| **Compare card density** | Compact money fields / edit panel heights on Shared | |
| **Figma MCP rules** | `docs/figma-design-system-rules.md` | Tokens = ink / cobalt / champagne |

### Storage keys (additions)

| Key | Purpose |
|-----|---------|
| `realcost:comparisons[].shareId` | Opaque share token for reactions |
| `realcost:comparisons[].seenAt` | Friend opened / replied |
| `realcost:comparisons[].myRate` | Receiver’s rate (device-local) |
| `realcost:a2hs_dismissed` | Install prompt dismissed |

### Share URL params

| Param | Meaning | Safe? |
|-------|---------|-------|
| `p` | Price | Yes |
| `h` | Hours (Exact mode or reaction reply) | Exact can imply wage ≈ p÷h — user opt-in |
| `s` | Share id | Yes (opaque) |
| `reply=1` | Reaction payload for original sharer | Hours only; no wage |

### Analytics events (new)

`share_image_started`, `share_image_completed`, `reaction_sent`, `reaction_received`, `a2hs_prompt_shown`, `a2hs_dismissed`, `a2hs_choice` — still sanitized (no wage/name).

---

## Doc change log

| Date | Change | Impact |
|------|--------|--------|
| **2026-09** | Locked MVP SPEC + Cursor handoff | Scope boundary: calc, share, compare, localStorage |
| **2026-09-17** | Polymath review | Risks: share card, analytics, onboarding |
| **2026-09-17** | P0–P5 polish sprint | Share card, analytics queue, Compare rename, OG, categories, Curious tone, tests |
| **2026-09-17** | Figma atmosphere shader | Brand asset ID `5a52d4a4-77bb-46e6-b8be-a41417a5d330` |
| **2026-09-17** | Docs expanded to case-study quality | Full `docs/` set |
| **2026-09-19** | UX polish + docs sync | Shared tab, glass TabBar, Private/Exact docs, Home motion, BounceLoader |
| **2026-09-18** | Growth / retention loop sprint | Streak, image share, reactions, heat map, A2HS, challenge poster; this handoff section |

---

## Source of Truth Order

When documents conflict, resolve in this priority:

```
1. Product hypothesis
   └── Share → recipient complete → recipient share / react

2. SPEC.md / handoff MVP scope
   └── Hard non-goals (no bank, no social feed backend, no monetization pre-loop)

3. docs/ operating context
   └── Vision, architecture, personas, security audit

4. Code
   └── Implementation wins on specifics; update docs if drift is intentional
```

### Hypothesis (immutable until disproven)

> Will people show each other what the same price costs in their different lives?

Every doc should trace back to this question.

---

## Document Set Map

| Doc | Version note |
|-----|--------------|
| `00-product-vision.md` | Expanded with approach, artifacts, risks |
| `01-architecture.md` | Expanded with data flow, storage keys, routes |
| `02-design-system.md` | Expanded with component patterns, a11y |
| `03-brand-guidelines.md` | Expanded with voice matrix, share rules |
| `04-user-personas.md` | **Rewritten:** 5 personas, ages 24–36 |
| `05-user-journeys.md` | Expanded with analytics mapping |
| `06-behavioral-science.md` | Expanded with tone research, guardrails |
| `07-marketing-growth.md` | Expanded with funnel, channels, gates |
| `08-security-privacy.md` | **Rewritten:** full audit (Critical / Hardening / Success-enablers) |
| `09-phases-timeline.md` | Expanded with gates and kill criteria |
| `10-documentation-history.md` | This file (handoff + product changelog) |
| `11-analytics.md` | Expanded with event schemas, sink swap |
| `12-qa-checklist.md` | Expanded with journey-based scenarios |
| `13-engineering-standards.md` | Expanded with patterns, anti-patterns |
| `14-business-monetization.md` | Expanded with gates, hypotheses |
| `figma-design-system-rules.md` | MCP / Figma token mapping for RealCost |

---

## Reviewer checklist (external LLM / human)

Please evaluate and give concrete feedback on:

1. **Hypothesis fit** — Do streak / A2HS / image share strengthen the compare loop, or distract?
2. **Privacy** — Is `reply` hours + Exact mode messaging clear enough? Any wage-leak path we missed?
3. **Retention honesty** — Streak is local-only; does UX overclaim “social” reactions?
4. **UX density** — Shared compact cards; Home streak placement; install prompt timing (3 decisions).
5. **Ship readiness** — Gaps before Vercel prod (OG image asset, real analytics sink, CSP).
6. **Kill criteria** — What would prove the share → react loop failed after 2 weeks live?

---

## Maintenance Rules

### When to update docs

| Trigger | Action |
|---------|--------|
| New route or storage key | Update `01-architecture.md` |
| New analytics event | Update `11-analytics.md` + this log |
| Scope change | Update `00-product-vision.md`, `09-phases-timeline.md`, SPEC |
| Security finding | Update `08-security-privacy.md` with ID |
| Persona validation interview | Update `04-user-personas.md` success moments |
| Growth experiment ships | Append to this changelog + `07-marketing-growth.md` |

### When NOT to update docs

- Routine bug fixes with no behavioral change
- Dependency bumps with no architectural impact
- Experimental branches not merged

---

## Artifacts / Decisions

| Decision | Documentation consequence |
|----------|---------------------------|
| Docs as portfolio deliverable | Case-study structure (context → approach → outcomes) |
| No invented user metrics | All docs avoid fake DAU/retention claims |
| Security audit in docs | Not a separate confidential PDF — transparent review |
| README as index | Single entry point with role-based routing |
| Reactions without a server | Opaque `s=` + reply link; honest about same-device / open-link requirement |

---

## Outcomes / Success Criteria

Documentation succeeds when:

- A reviewer can understand RealCost in 30 minutes reading `00` + `04` + `05` + `08` + this changelog
- Engineers onboard from `01` + `13` without archaeology in chat logs
- Portfolio deck pulls slides directly from doc sections
- No doc contradicts privacy invariant or MVP non-goals

---

## Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| Docs drift from code | Phase 1 exit: doc-code review pass |
| SPEC.md vs docs/ duplication | SPEC = scope lock; docs = operating context |
| Over-documentation slows shipping | Update on phase gates, not every commit |
| Reaction loop feels “broken” if friend never opens reply link | Copy frames it as send-back; optional future lightweight ping API |
| A2HS iOS cannot use beforeinstallprompt | Explicit Share → Add to Home Screen copy |
| Share PNG may still leak hours | Privacy tip under poster; default Private links |

---

## Next Documentation Actions

- [ ] After Phase 2 experiments: append funnel learnings to `07-marketing-growth.md`
- [ ] After analytics sink swap: document vendor in `11-analytics.md`
- [ ] After CSP deploy: close H-01 in `08-security-privacy.md`
- [ ] Sync `01-architecture.md` storage key table with `shareId` / `seenAt` / A2HS
- [ ] If personas validated in interviews: note evidence in `04-user-personas.md`
