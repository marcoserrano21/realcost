# RealCost — Thrive in 2026 Design Spec

**Date:** 2026-09-20  
**Status:** Implemented in product (2026-09-21) — see `docs/10-documentation-history.md`  
**Live:** https://realcost-xi.vercel.app/  
**Frame:** Loop-first craft  
**Horizon:** Next 90 days (craft shipped; distribution = Phase 2)  

---

## Context

RealCost turns a price into hours of your life, then asks what the same price costs someone else. Thesis: *Same money. Different reality.*

North star (unchanged): create a half-second pause (“Damn. That’s what $150 means for me”), then “What does it mean for you?” Growth is share → recipient → re-share, not budget-app DAU.

Evidence base: shipped MVP (Home calc, Private/Exact share, share card, `/c` recipient, Shared inbox, History, local-first storage), plus product docs (`docs/00-product-vision.md`, `docs/07-marketing-growth.md`, `docs/09-phases-timeline.md`).

---

## Win condition

**D — Balanced:** viral loop proof + light retention + award-level craft, ranked by impact × effort.

Rejected for this horizon:

- Habit OS first (Hours Budget, push, offline SW as the lead bet)
- Content-only without product upgrades to card and `/c`

---

## Chosen strategy: Loop-first craft

Make the share artifact and recipient moment so good they spread. Add one Skipped “hours kept” identity hook. Soft-install after emotion. Protect privacy and the pause. Defer budget-app depth until the loop clears Phase 2 gates.

```text
Home calc → Decide → Share card (cultural object)
                 ↓
            Recipient /c (award moment) → React / re-share
                 ↓
         Skipped hours-kept identity → card variant
                 ↓
         Haptic ritual + soft install (craft / return)
```

---

## Seven ranked recommendations

### 1. Share Card as cultural object 2.0

**Lenses:** viral + craft  

**Problem:** Apps don’t go viral; objects do. Current 4:5 poster (`ShareCard.tsx`, `shareImage.ts`) is strong craft but not meme-native for TikTok / Reels / Stories.

**Requirement:**

- Ship 2–3 card *formats*: keep 4:5; add 9:16 story/Reels crop; add dual-pane “Same $X. Different lives.” unlocked after Received (both sides’ hours, never wages).
- Question-first copy. Private default; Exact opt-in. Wage never on the artifact.
- No “Download RealCost” as the hero message on the card.

**Success:** Higher native-share and save-image rates; dual card used after Received.

---

### 2. Recipient `/c` as the award moment

**Lenses:** viral  

**Problem:** Sender dopamine is incomplete until the friend feels the gut punch. Form-like wage entry kills the funnel.

**Requirement:**

- Redesign `CompareClient.tsx` as a cinematic one-screen ritual: minimal wage entry, dramatic hours reveal (reuse Home digit-reel language), one primary CTA (React hours back or Share back).
- Link preview / OG should read as a challenge before open.

**Success:** Lift on share_completed → recipient_calc → react / re-share (funnel in `docs/07-marketing-growth.md`).

---

### 3. Productize “Skipped” as the meme identity

**Lenses:** viral + retention  

**Problem:** “I almost bought it” is a top documented hook; Skipped is pride without shame. Streak exists (`WeeklyStreak.tsx`) but “hours kept” is not a first-class shareable identity.

**Requirement:**

- Surface weekly and all-time **hours kept** from Skipped decisions.
- One-tap share card variant: “I kept N hours this week.”
- When hours are high, make Skipped the loudest decision path in copy/UI.
- Never use shame language (“you wasted…”).

**Success:** Skipped share variant used; return visits tied to hours-kept curiosity.

---

### 4. Sensory decision ritual

**Lenses:** craft + retention  

**Problem:** Award-winning mobile products feel physical. Haptics exist only in onboarding (`UnitsSetup.tsx`); calc / decide / share are silent.

**Requirement:**

- Systematic `triggerHaptic` on: reveal settle, decision commit, share success.
- Respect `prefers-reduced-motion` and in-app reduce-motion prefs.
- No notification spam. No sound in this horizon unless explicitly opted in later.

**Success:** Install and share feel “native”; qualitative polish feedback.

---

### 5. Soft install after the emotional peak

**Lenses:** retention + craft  

**Problem:** `InstallPrompt.tsx` after ~3 decisions is logical but cold. People install after feeling, not after a counter.

**Requirement:**

- Trigger A2HS / install cue once after first successful share **or** first meaningful Skipped hours-kept moment.
- Forever dismissible. No hard paywall.
- Full offline service worker stays Phase 3 / conditional (`docs/09-phases-timeline.md`).

**Success:** Higher A2HS acceptance without nagging.

---

### 6. 1:1 challenge seasons — not a social network

**Lenses:** viral + retention  

**Problem:** Couple / roommate stitch is a documented hook. Shared inbox (Waiting / Seen / Received) can carry ephemeral challenges without becoming a social network.

**Requirement:**

- Lightweight “Challenge a friend”: same price, both complete, dual card unlocks.
- Optional 7-day “roommates this week” framing.
- Local-first; no accounts.
- Explicitly out of scope: leaderboards, public feeds, cloud sync, profiles, likes.

**Success:** Challenge starts from Shared / share flow; dual card completion rate.

---

### 7. Demote budget-app gravity; delay Hours Budget UI

**Lenses:** removal / focus  

**Problem:** Looking like Mint / YNAB with a gimmick is the strategic failure mode. Hours Budget is docs-only freemium (`docs/14-business-monetization.md`); building it now optimizes the wrong loop.

**Requirement:**

- Keep History / heat map as *memory*, not a dashboard.
- Soften any UI that reads “budget tracker.”
- Hours Budget UI only after share → recipient metrics clear Phase 2 gate.
- Near-term: do not prioritize extension, wishlist, or ad widgets.

**Success:** Home still reads as pause + question; no Hours Budget UI shipped this horizon.

---

## Explicit non-goals (this horizon)

- Public leaderboards or vanity social proof that implies income ranking
- Aggressive monetization before loop proof
- Native App Store dual-track before PWA install + loop metrics
- AI spending coaches
- Accounts / multi-device sync as a dependency for the seven items above

---

## Design principles (apply to all seven)

1. Privacy is the product: wage never in URLs or cards.
2. One primary CTA per screen; pause over control.
3. Meme-literate without becoming a joke app — ink / cobalt / champagne craft stays premium.
4. Measure calculation → share → recipient → react / re-share (not DAU vanity).

---

## Sequencing

| Order | Item | Depends on |
|------:|------|------------|
| 1 | Share card formats 2.0 | Existing ShareCard / shareImage |
| 2 | Recipient `/c` ritual | Home reveal patterns; OG |
| 3 | Skipped hours-kept + card variant | Card formats; decision log |
| 4 | Haptics on calc / decide / share | Existing `triggerHaptic` |
| 5 | Emotional-peak install prompt | Share + Skipped moments |
| 6 | 1:1 challenge seasons | Shared inbox + dual card |
| 7 | Demote budget gravity / gate Hours Budget | Docs + Home/History copy/UI audit |

Implementation detail belongs in a follow-on writing-plans document after this spec is user-reviewed.

---

## Spec self-review (2026-09-20)

| Check | Result |
|-------|--------|
| Placeholders / TBD | None remaining |
| Internal consistency | Loop-first frame matches all seven; Hours Budget delayed in #7 and non-goals |
| Scope | Single horizon (90 days); suitable for one implementation plan sequenced 1→7 |
| Ambiguity | Dual card unlocks only after Received; install triggers once on share **or** meaningful Skipped; no accounts for challenges |

---

## References

- `docs/00-product-vision.md`
- `docs/06-behavioral-science.md`
- `docs/07-marketing-growth.md`
- `docs/09-phases-timeline.md`
- `docs/14-business-monetization.md`
- `src/components/ShareCard.tsx`, `src/lib/shareImage.ts`
- `src/app/c/CompareClient.tsx`
- `src/components/WeeklyStreak.tsx`, `src/components/InstallPrompt.tsx`, `src/app/feed/page.tsx`
