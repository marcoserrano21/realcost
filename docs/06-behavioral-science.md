# Behavioral Science Notes

Psychological mechanisms behind RealCost — why **price → hours** works, how **tone** shapes behavior, and where **social comparison** helps without harming.

---

## Context / Problem

Traditional personal finance interventions often fail because they:

- Trigger **shame reactance** (“you're bad with money”)
- Overload working memory with categories and rules
- Compete with instant dopamine from purchase moments

RealCost is a **reframe tool**, not a behavior modification program. The goal is a pause and an honest conversation — not compliance.

---

## Core Mechanisms

### Mental accounting (Thaler)

People treat money in separate mental accounts — “fun money,” “bills,” “treats.” Dollars in a cart feel abstract.

**RealCost intervention:** Convert price to **hours of take-home work** — a personal account that feels real.

| Before | After |
|--------|-------|
| “It's only $120.” | “That's 7 hours at my rate.” |
| Easy swipe | Visceral pause |

Implementation: `computeRealCost()` — pure division, no judgment layer.

---

### Salience

Salient information drives decisions more than latent information. APR footnotes don't stop impulse buys; **time you won't get back** might.

**Design implication:** Hours are typographically hero — largest element on result screen and share card.

---

### Opportunity cost (without prescription)

Showing what a purchase *costs* in time implies what else that time could fund — without RealCost naming alternatives.

**Guardrail:** Copy never says “you could have bought X instead.” User fills in the blank. Respects autonomy (Self-Determination Theory).

---

### Social comparison (Festinger) — curiosity, not ranking

People naturally compare outcomes with peers. RealCost channels this through **side-by-side hours for the same price** — not leaderboards.

| Healthy comparison | Toxic comparison |
|--------------------|------------------|
| “Same $300, different hours — wow.” | “You spent more hours than me — you lose.” |
| Curiosity | Status |

**Implementation:** `/c` route shows parallel totals. No scores, no winners, no public feed.

---

## Tone Research — Four Lenses

RealCost ships four tone settings. Each maps to a different emotional regulation strategy:

| Tone | Psychological lens | Intended effect |
|------|-------------------|-----------------|
| **Gently** | Self-compassion / ACT | Reduces shame reactance after Bought or Skipped |
| **Straight up** | Cognitive load reduction | Keeps number hero; minimal emotional overlay |
| **Hyped** | Behavioral activation | Celebrates intentional choice and skipped wins |
| **Curious** | Motivational interviewing | Open questions; no prescriptions |

### Example — Skipped decision

| Tone | Title | Behavioral intent |
|------|-------|-------------------|
| Gently | “Nice pause.” | Validate without moralizing |
| Straight up | “Skipped.” | Log and move on |
| Hyped | “That's a win.” | Reinforce agency |
| Curious | “What changed your mind?” | Prompt reflection |

Copy lives in `src/lib/copy.ts` — tone × choice matrix.

---

## Approach — Behavior Design Without Manipulation

### What we intentionally do

- Make the reframing **fast** (reduce friction to insight)
- Make sharing **dignified** (hours not wage)
- Make skip decisions **feel positive** (weekly skip hours summary)
- Offer **tone choice** (user controls emotional frame)

### What we intentionally avoid

| Dark pattern | Why avoided |
|--------------|-------------|
| Streaks / loss aversion | Creates anxiety, not clarity |
| “Bad purchase” labels | Shame triggers reactance |
| Public income signals | Social threat + privacy harm |
| Artificial urgency timers | Manipulative; undermines trust |
| Gamified leaderboards | Turns comparison toxic |

---

## Decision Framework — Bought / Thinking / Skipped

Not pass/fail — **three valid states**:

| Choice | Meaning | Science note |
|--------|---------|--------------|
| **Bought** | Proceed with eyes open | Reduces post-purchase dissonance when acknowledged |
| **Thinking** | Implementation intention deferred | “Sleep on it” — pre-commitment to revisit |
| **Skipped** | Active choice preserved | Loss framed as time retained, not pleasure denied |

Weekly skip summary (`getWeekSummary()` in storage) reinforces skipped hours without streak mechanics.

---

## Share Loop Psychology

### Why the question works

“What does it cost **you**?” triggers:

1. **Curiosity gap** — recipient must enter own rate to resolve
2. **Perspective taking** — income inequality made legible at human scale
3. **Social bonding** — couples/roommates feel “same team, different numbers”

### Share card as social object

Screenshot-ready card lowers sharing friction. Visual prestige signals “this is worth sending” (Signaling Theory — but product-quality signal, not wealth signal).

---

## Category Chips — Light Touch Categorization

Optional categories (Shopping, Food, Subscriptions, etc.) add **mild** mental accounting structure without budget enforcement.

History filters enable pattern noticing — user-discovered, not app-prescribed.

---

## Artifacts / Decisions

| Decision | Behavioral rationale |
|----------|---------------------|
| Hours not “life energy units” | Plain language > clever branding |
| No “waste” vocabulary | Avoid loss framing that implies moral failure |
| Curious tone added Phase 1 | MI-style questions for reflection-oriented users (Alex persona) |
| Shared tab not Feed | Removes social performance incentive |
| Optional category | Reduces forced categorization aversion |

---

## Outcomes / Success Criteria

Behavioral success (internal validation):

| Signal | Interpretation |
|--------|----------------|
| User logs **Thinking** then later **Skipped** | Pause mechanism working |
| Share → recipient complete | Social curiosity sufficient |
| Gently tone users return | Low shame environment |
| No spike in immediate uninstall after **Bought** | Copy not triggering reactance |

---

## Risks / Open Questions

| Risk | Notes |
|------|-------|
| **Hours framing increases anxiety** | Gently tone + skip-as-win copy; monitor qual feedback |
| **Comparison highlights inequality painfully** | Side-by-side is feature — but copy must avoid blame |
| **Hyped tone trivializes stress spending** | Offer tone choice; don't default Hyped globally |
| **“Skipped hours saved” feels fake for non-purchase** | Copy says “paused” not “saved in bank” |
| **Over-reliance on share for validation** | Core reframe must work solo (Journey B) |

---

## References (Conceptual)

- Thaler — Mental accounting
- Festinger — Social comparison theory
- Neff — Self-compassion
- Miller & Rollnick — Motivational interviewing
- Deci & Ryan — Self-determination / autonomy

Not academic claims of efficacy — conceptual grounding for product choices.
