# RealCost Docs

Operating handbook and **presentation-ready case study** for building, shipping, and validating RealCost — a privacy-first Next.js app that turns prices into hours of work and invites one-to-one comparison.

**Thesis:** Same money. Different reality.

---

## Start Here

| If you are… | Read first |
|-------------|------------|
| **Reviewer / portfolio visitor** | [Product Vision](./00-product-vision.md) → [Personas](./04-user-personas.md) → [Journeys](./05-user-journeys.md) |
| **Engineer joining the build** | [Architecture](./01-architecture.md) → [Engineering Standards](./13-engineering-standards.md) → [QA Checklist](./12-qa-checklist.md) |
| **Designer / brand** | [Design System](./02-design-system.md) → [Brand Guidelines](./03-brand-guidelines.md) → [Figma rules](./figma-design-system-rules.md) |
| **Growth / marketing** | [Marketing & Growth](./07-marketing-growth.md) → [Analytics](./11-analytics.md) |
| **Security / privacy review** | [Security & Privacy Audit](./08-security-privacy.md) |

---

## Document Index

| Doc | Title | Audience | Summary |
|-----|-------|----------|---------|
| [00](./00-product-vision.md) | **Product Vision** | Founder / PM | Hypothesis, north star, MVP scope, non-goals |
| [01](./01-architecture.md) | **Architecture** | Engineering | Next 16 stack, routes, storage keys, Private/Exact share |
| [02](./02-design-system.md) | **Design System** | Design | Tokens, glass TabBar, ShareCard themes, motion |
| [03](./03-brand-guidelines.md) | **Brand Guidelines** | Brand | Voice, share object rules, positioning |
| [04](./04-user-personas.md) | **User Personas** | Research | Five personas (24–36) with design implications |
| [05](./05-user-journeys.md) | **User Journeys & Flows** | UX | Onboard → calc → share → `/c` → Shared inbox |
| [06](./06-behavioral-science.md) | **Behavioral Science** | Psychology | Salience, comparison, tone guardrails |
| [07](./07-marketing-growth.md) | **Marketing & Growth** | Growth | Hooks, funnel, launch sequence |
| [08](./08-security-privacy.md) | **Security & Privacy Audit** | Security | Critical / Hardening / Success-enablers |
| [09](./09-phases-timeline.md) | **Phases & Timeline** | Program | Phase 0–4 gates, kill criteria |
| [10](./10-documentation-history.md) | **Documentation History** | Ops | Changelog, source-of-truth order |
| [11](./11-analytics.md) | **Analytics Spec** | Data | Privacy-safe events, funnel, sink |
| [12](./12-qa-checklist.md) | **QA Checklist** | QA | Journey QA + Critical privacy gates |
| [13](./13-engineering-standards.md) | **Engineering Standards** | Engineering | TypeScript, a11y, privacy code review |
| [14](./14-business-monetization.md) | **Business & Monetization** | Business | $0 MVP; Hours Budget = docs-only plan |
| [Figma](./figma-design-system-rules.md) | **Figma MCP rules** | Design/Eng | Token mapping, no-emoji icons |

---

## Product Snapshot (current app)

| Attribute | Detail |
|-----------|--------|
| **Core mechanic** | Price → hours (via take-home hourly rate) |
| **Tabs** | Home · **Shared** · History · Settings |
| **Share** | **Private** (default): price only · **Exact** (opt-in): price + hours · **never wage** |
| **Shared inbox** | Waiting / Seen / Received; reactions via opaque `s=` + `reply=1` |
| **Stack** | Next.js 16.3 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui |
| **Persistence** | `localStorage` — no user backend |
| **Hypothesis** | Share → recipient completes → recipient re-shares / reacts |

---

## Case Study Structure

Each expanded doc follows:

1. **Context / problem**
2. **Approach**
3. **Artifacts / decisions**
4. **Outcomes / success criteria** (no invented live metrics)
5. **Risks / open questions**

---

## Source of Truth

When documents conflict, see [Documentation History](./10-documentation-history.md):

1. Product hypothesis (share loop)
2. These `docs/` files (kept aligned to code)
3. Code under `src/`

Prefer **code** if drift remains.

---

## Key Privacy Invariant

> **Never put wage in URLs, analytics, or metadata.**

Private links omit hours so wage cannot be reversed. Exact links include hours only after explicit Settings confirmation.
