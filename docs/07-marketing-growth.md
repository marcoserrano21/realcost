# Marketing & Growth

Go-to-market strategy for RealCost MVP — **launch as a social experiment**, not a finance app category play.

---

## Context / Problem

RealCost does not win on App Store SEO for “budget tracker.” It wins when someone sends a link that makes another person say:

> “Wait — that's how many hours for you?”

Growth is **loop-driven**: calculation → share → recipient → (ideally) recipient share. Everything before loop proof is learning, not scaling.

---

## Approach

### Positioning

| Not this | This |
|----------|------|
| Budget app | Price reframe tool |
| Financial advisor | Curiosity object |
| Social network | One-to-one comparison |
| Download CTA first | Question first |

**Tagline family:** Same money. Different reality.

### The share card is the ad

Creative budget = making the share card so good people screenshot it without being asked. Native share sheet does distribution; paid ads wait.

---

## Hooks to Test

Priority order for content experiments:

1. **“How much of your life is $100?”** — universal entry, easy demo
2. **“Same $100. Different lives.”** — split-screen reaction format
3. **“This $300 purchase costs me 10 hours. What does it cost you?”** — direct share copy test
4. **Couple / roommate stitch** — sender + recipient reveal
5. **“I almost bought it”** — Skipped decision + hours saved

Each hook maps to a measurable funnel step (see below).

---

## Funnel Metrics

Internal hypothesis funnel — events from `src/lib/analytics.ts`:

```
calculation_created
        ↓
   share_started
        ↓
  share_completed
        ↓
 comparison_opened        (/c recipient)
        ↓
recipient_calculation_completed
        ↓
   recipient_shared         (loop close)
```

### Stage definitions

| Stage | What it proves |
|-------|----------------|
| `calculation_created` | Reframe lands |
| `share_started` | User intends to socialize insight |
| `share_completed` | Friction low enough to send |
| `comparison_opened` | Link travel works cross-platform |
| `recipient_calculation_completed` | Question compelling enough to enter rate |
| `recipient_shared` | Second-order virality — gold signal |

### Conversion questions (not targets yet)

- What % of calculators share?
- What % of opened comparisons complete?
- What % of completers re-share?

**Do not publish invented benchmarks.** Measure after organic experiments.

---

## Channels

### Primary — short-form video

| Platform | Format | Why |
|----------|--------|-----|
| TikTok | 15–30s price reveal + reaction | Core demographic 24–36 |
| Instagram Reels | Share card screenshot + poll | Close Friends → DM loop |
| Stories | Native share sheet recording | Authentic, low production |

**Creative unit:** Share card + face reaction + text hook. Not app walkthrough tutorials.

### Secondary — peer contexts

| Context | Tactic |
|---------|--------|
| Couples | “Before we buy this, RealCost it” |
| Roommates | Group chat link for shared purchases |
| Creator stitches | React to follower-submitted prices |

### Tertiary — SEO / content (Phase 2)

Long-tail only after loop validation:

- “What does $X cost in hours at $Y/hour” — calculator landing pages
- Not prioritized for MVP launch

---

## Launch Sequence

### Phase 0 — Private validation

- Friends & family send real comparisons
- Watch `/c` completion informally
- Fix broken OG, share sheet failures

### Phase 1 — Organic content sprint (2–4 weeks)

- 3–5 hook variants posted
- Track funnel via analytics queue export
- Double down on highest share_completed hook only

### Phase 2 — Micro-influencer seeding

- 10–20 creators in personal finance / lifestyle / couples niche
- Provide share card templates, not paid script
- Measure comparison_opened from UTM-less links (limited — accept qualitative)

### Do not do yet

- Paid user acquisition
- App Store feature chasing
- Download count PR
- Affiliate / referral codes

---

## Messaging Matrix

| Audience | Lead message | CTA |
|----------|--------------|-----|
| Hourly workers | “See it in shifts, not dollars” | Try a price |
| Salaried millennials | “Your salary hides the hours” | Compare with partner |
| Couples | “Same price, two realities” | Send a link |
| Gig workers | “Pick your rate, see the truth” | Share with crew |

All CTAs lead to **action** (enter price / open link), not “Install now.”

---

## Artifacts / Decisions

| Artifact | Growth decision |
|----------|-----------------|
| Share URL structure | No wage — safe to paste anywhere |
| OG tags | Link preview sells the question |
| Shared tab | Sender retention, not viral — secondary metric |
| Four tones | Content creators can demo personality variants |
| `$0 infra` | Experiment freely on Vercel free tier |

---

## Outcomes / Success Criteria

| Outcome | Evidence |
|---------|----------|
| Organic shares without prompt | Unsolicited social posts |
| Recipient completion without tutorial | `/c` UX sufficient |
| Hook variant differentiation | One hook clearly wins share_started rate |
| Word-of-mouth phrase emerges | People say “RealCost it” unprompted |

**Gate before spend:** Double-digit recipient completion rate on shared links (internal bar — not a public claim).

---

## Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| “Finance app” bucket kills curiosity | Avoid finance hashtags initially |
| Share card doesn't read at thumbnail size | Test at 120px preview |
| TikTok policy on income content | Hours only on screen; no wage displays |
| Low recipient completion | A/B `/c` headline; reduce wage entry friction |
| Virality without retention | Acceptable for MVP — loop proof first |
| Marketing never requires `n=` | Name is not in share URLs |

---

## Portfolio Slide — Growth Summary

**Strategy:** Product-led sharing, not paid acquisition.  
**Creative:** Share card = ad unit.  
**Metric:** Share → recipient complete → recipient share funnel.  
**Discipline:** No scaling until the loop closes organically.
