# Business & Monetization

Business model boundaries for RealCost — **validate behavior before revenue**, keep infra cost at zero until loop proof.

---

## Context / Problem

RealCost sits in a crowded personal finance market where incumbents monetize through subscriptions, affiliate offers, and data products. Copying that model early would:

- Misposition the product as “another budget app”
- Create privacy obligations before trust is established
- Optimize for DAU instead of share loop completion

The business task in MVP is **not** revenue — it's proving people compare prices across different lives organically.

---

## Current State — $0 Business

| Item | Cost |
|------|------|
| Vercel hosting | Free tier |
| Domain (if any) | Only variable cost |
| Analytics | Local queue — $0 |
| Backend / DB | None |
| Auth / email | None |

**Runway strategy:** Minimize burn; maximize learning per week of organic content.

**Code status:** Hours Budget / Pro paywall described later in this doc are **product plans only** — not implemented in `src/` yet. **Blocked** until Phase 2 share → recipient → re-share metrics clear (see thrive design spec `docs/superpowers/specs/2026-09-20-realcost-thrive-recommendations-design.md`).

---

## Approach — Monetization After Loop

### Success gate (internal)

Do **not** implement payments until:

> Double-digit conversion on **share → recipient complete → recipient share**

This is an internal decision bar — not a public metric claim. Exact threshold set after Phase 2 data exists.

### Why this gate

Monetization before loop proof optimizes the wrong funnel. A beautiful paywall on a product nobody shares is wasted engineering.

---

## Revenue Hypotheses (Not Built)

Ranked by fit with privacy-first positioning:

### H1 — Freemium memory

| Tier | Offering |
|------|----------|
| **Free** | Unlimited calc + share + compare |
| **Paid** | Advanced history insights, export, custom units, cloud backup |

**Fit:** High — core loop stays free; power users pay for depth.  
**Risk:** Cloud backup introduces PII custody — re-audit security.

### H1b — Hours Budget (chosen freemium wedge)

Budgets are denominated in **hours of your life** (optionally mirrored as $ via local wage). No bank link. Fits the brand better than classic envelopes.

| Tier | Offering |
|------|----------|
| **Free** | Unlimited calc / decide / share / compare / basic streak + **one** overall weekly hours budget |
| **Pro** | Multi-category hours budgets, carryover, richer streak insights, export |

**Soft gate (no Stripe yet):** local `realcost:pro` flag or PaywallSheet mock. Real checkout waits for the share→recipient→reshare loop gate above.

#### User journey

1. **Trigger:** After 3+ decisions or first category heat insight → “Want a weekly hours budget?”
2. **Setup (3 screens):** Overall weekly hours cap → pick 1–3 category caps (reuse existing purchase categories) → confirm “This week you’ll feel it when you tap Bought / Skipped”
3. **Ongoing:** Each decision burns hours into Overall (+ category if set). Thin progress under Home streak; History heat shows budget vs spent.
4. **Paywall moment:** Soft sheet “Unlock category budgets” when free user tries a second category cap.

```
decide → burn Overall/Category → approaching nudge | over sheet | ok → streak/heat
Settings Budgets → set caps → one-time setup journey
```

#### Why this sells without becoming Mint

- Unit of account is **hours**, not bank sync
- Soft alerts after decisions deepen the pause, not interrupt it
- Core loop stays free forever

**Fit:** Highest among revenue hypotheses for privacy-first positioning.  
**Risk:** Over-alert fatigue — keep nudges post-decision, never mid-entry.

### H2 — Premium share cards

Paid aesthetic packs for share card (themes, frames) — creator-friendly.

**Fit:** Medium — aligns with card-as-network strategy.  
**Risk:** Must not make free card ugly (dark pattern).

### H3 — Couple / household plan

Shared comparison history sync between two accounts.

**Fit:** Medium — Jordan & Alex personas.  
**Risk:** Requires accounts — major architecture shift.

### H4 — Creator / affiliate

Sponsored hooks or affiliate links on content pages.

**Fit:** Low for core product — conflicts with decision moment integrity.

### Anti-hypothesis — Ads in decision flow

**Never** interstitial ads between price entry and hours reveal. Destroys pause mechanism and brand trust.

---

## What We Will Not Monetize (MVP + Phase 2)

| Model | Why excluded |
|-------|--------------|
| Selling aggregated wage data | Violates privacy invariant |
| Affiliate checkout redirects | Wrong moment in journey |
| “Financial advisor” upsells | Regulatory + positioning risk |
| Download-paid app | Web-first loop validation |

---

## Competitive Positioning (Business Lens)

| Competitor type | Their model | RealCost wedge |
|-----------------|-------------|----------------|
| Budget apps (Mint, YNAB) | Subscription, bank link | No bank link; moment-based |
| Buy-now-pay-later | Merchant fees | Anti-impulse, not facilitation |
| Social finance | Data + ads | No feed; one-to-one compare |
| Calculator widgets | Ad-supported | Premium brand, no ad clutter |

**Moat hypothesis:** Share loop + privacy + editorial card quality — not data lock-in.

---

## Go-to-Market Economics

### Phase 2 experiment budget (suggested)

| Line | Amount | Notes |
|------|--------|-------|
| Domain + DNS | ~$15/yr | Optional |
| Creator seeding | $0–500 | Product-only seeding preferred first |
| Paid ads | **$0** | Wait for organic loop |
| Analytics vendor | Free tier | PostHog/Plausible when connected |

Total cash burn target: **near zero** through loop validation.

---

## Artifacts / Decisions

| Decision | Business rationale |
|----------|-------------------|
| No monetization in Phase 0–1 | Protect hypothesis purity |
| Freemium first hypothesis | Matches privacy + viral loop |
| Hours Budget as Pro wedge | On-brand (hours, not banks); soft-gate before Stripe |
| No ads in decision moment | Brand + behavioral integrity |
| Internal gate before Stripe | Avoid premature optimization |

---

## Outcomes / Success Criteria

| Stage | Business outcome |
|-------|------------------|
| MVP | $0 cost, demoable product |
| Phase 2 | Organic shares measurable |
| Loop validated | Decision on H1 vs H2 monetization |
| Monetization v1 | Revenue without share rate collapse |

**Failure mode to watch:** Monetization reduces share rate — if so, revert or reposition paid tier.

---

## Risks / Open Questions

| Risk | Notes |
|------|-------|
| Free forever expectation | Communicate early that advanced features may be paid later |
| Cloud sync as paid only | Accessibility vs revenue — offer export free? |
| App Store IAP if native wrapper | 30% tax — stay web-first |
| Investor pressure to monetize | Hold to loop gate |
| Wage data liability if sync added | Legal review before H1 backend |

---

## Portfolio Slide — Business Summary

**Model today:** $0 infra experiment.  
**PMF question:** Do people close the comparison loop?  
**Monetization:** Freemium depth + premium cards — after loop proof.  
**Never:** Ads in the decision moment or selling wage data.

---

## Related Documents

- Product hypothesis → `00-product-vision.md`
- Loop metrics → `11-analytics.md`
- Growth discipline → `07-marketing-growth.md`
- Phase gates → `09-phases-timeline.md`
- Privacy constraints on paid features → `08-security-privacy.md`
