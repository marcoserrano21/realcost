# RealCost — Product Vision

**One-liner:** RealCost turns a price into what it actually costs you, then lets you ask: “What does it cost someone else?”

**Thesis:** Same money. Different reality.

---

## Context / Problem

Money feels abstract until it is translated into something personal. A $150 purchase is “one hundred fifty dollars” on a screen — but for one person that might be a casual weekend, and for another it might be half a week of take-home work.

Most finance tools answer a different question: *How should you budget?* RealCost answers a more immediate one: *What does this price actually mean in your life — and in someone else's?*

The insight is social, not spreadsheet-shaped. People already compare purchases with roommates, partners, and group chats. They just lack a fast, respectful way to make the comparison legible without exposing income.

---

## Hypothesis

**Will people show each other what the same price costs in their different lives?**

If the core loop works — calculate → pause → share → recipient completes their side → recipient shares back — RealCost becomes a lightweight social object, not another budgeting app fighting for daily active use.

---

## North Star

Create a half-second pause:

> “Damn. That’s what $150 means for me.”

Then:

> “What does it mean for you?”

That pause is the product. Everything else (history, categories, tone settings) exists to reinforce it, not replace it.

---

## What RealCost Is (shipped)

| Capability | What it does |
|------------|--------------|
| **Price → hours** | Enter a price; see hours (hero), shifts, and dinners from take-home hourly rate (`computeRealCost`) |
| **Category first** | Optional “What is this for?” before logging Bought / Thinking / Skipped |
| **Decision moment** | One-tap log on Home (locked until edited in History); tone-aware sheet |
| **Weekly streak** | Hours paused this week + consecutive week streak (flame chip) |
| **Share** | **Private** (default): URL with price only · **Exact** (opt-in): price + hours · **never wage** |
| **Share card / image** | 4:5 poster (light + dark themes) + Save/share PNG |
| **Recipient flow** | Open `/c`, enter wage locally, compare; optional React hours back |
| **Shared tab** | Local inbox: Waiting / Seen / Received (`/feed` route) |
| **History** | Filters, sort/date, category heat map, edit choice, reshare |
| **Local-first memory** | Settings and logs in `localStorage` — no account |

Stack: **Next.js 16.3 App Router**, React 19, TypeScript, Tailwind v4, shadcn/ui. Zero user backend.

---

## Approach

### Lead with curiosity, not control

RealCost does not tell users what to buy. It reframes the number so the user can decide. Tone settings (Gently, Straight up, Hyped, Curious) adapt copy without changing the math.

### Privacy as a feature, not a footnote

Wage stays on-device. **Private** share URLs encode price (and optional opaque share id) only. **Exact** mode adds hours after confirm — enough for comparison, with clear risk that `price ÷ hours` approximates rate. Analytics strips wage, rate, name, and email-like keys before queueing events. Display name never goes in the URL.

### The share card is the network

Distribution is designed around a beautiful, screenshot-ready artifact — not an app download pitch. The card carries the question; the app is where you answer it.

---

## Artifacts / Decisions

| Decision | Rationale |
|----------|-----------|
| **Hours as hero metric** | Time worked is more salient than abstract dollars for the target demographic (24–36, mixed employment) |
| **No accounts in MVP** | Removes signup friction; `localStorage` is sufficient for hypothesis validation |
| **URL as share transport** | No server needed; comparison works even if recipient never installs anything beyond opening a link |
| **Four-tab navigation** | Home / **Shared** / History / Settings — peers, not hierarchy |
| **Shared tab (not “Feed”)** | Local inbox of sent/received comparisons and reactions — not a social network |
| **Private-by-default sharing** | Exact hours-in-link is opt-in with confirm |

---

## Outcomes / Success Criteria

Success is **loop validation**, not vanity metrics.

| Signal | What it proves |
|--------|----------------|
| User completes first calculation | The reframing lands |
| User shares a comparison link | The artifact is worth sending |
| Recipient opens `/c` and completes their calculation | The question travels |
| Recipient shares back | The loop closes organically |

**Explicit non-goals for MVP:** No claims of live user counts, no monetization, no DAU optimization before organic share proof.

---

## Non-Goals (MVP)

Do not build these until the share loop shows real behavior:

- Bank links or transaction import
- AI financial advisor
- Social feed, profiles, likes, or public rankings
- Full budgeting suite / Hours Budget UI (planned in doc 14 only; gated until share→recipient metrics — thrive spec 2026-09-20)
- Monetization layers
- Backend auth or cloud sync
- Service worker offline shell

---

## Risks / Open Questions

| Risk | Mitigation direction |
|------|---------------------|
| **One-player mode only** | Share UX and card quality must be strong enough to pull a second person in |
| **Wage sensitivity** | Never expose rate in URLs; optional display name only; clear local-only messaging |
| **“Finance app” positioning** | Market as a curiosity tool / social object, not another Mint clone |
| **localStorage fragility** | Accept for MVP; document reset paths; consider PWA/sync only after loop proof |
| **Comparison URL guessability** | Hours + price leak partial info; acceptable tradeoff vs. encoding wage |

---

## Portfolio Slide Summary

**Problem:** Prices hide personal cost.  
**Insight:** Same money, different lives — people want to show that gap.  
**Solution:** Instant price→hours calculator with privacy-first share comparisons.  
**Proof target:** Share → recipient complete → recipient share, measured via privacy-safe analytics queue.
