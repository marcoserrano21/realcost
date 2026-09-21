# Brand Guidelines

Voice, visual identity, and share behavior for RealCost — a product that reframes money as time and invites comparison without judgment.

---

## Context / Problem

Personal finance branding defaults to one of two failures:

1. **Corporate fintech** — cold, optimizing, implicitly shaming
2. **Influencer hustle culture** — loud, prescriptive, performative

RealCost sits in a third space: **emotionally intelligent curiosity**. Users are not wrong for spending; they are invited to see clearly and compare honestly.

The brand must feel premium enough to screenshot and share, and human enough that a 28-year-old sends it to their partner without feeling preached at.

---

## Brand Pillars

| Pillar | Meaning |
|--------|---------|
| **Clarity** | One number, one question — no jargon walls |
| **Respect** | No shame, no “you shouldn't,” no waste language |
| **Curiosity** | Comparison as wonder, not ranking |
| **Privacy** | Your wage is yours; sharing shows hours, not income |

---

## Voice

**Direct, human, concise, slightly witty, emotionally intelligent.**

Write like a sharp friend who does math fast — not a bank, not a therapist, not a hype coach (unless the user chose Hyped tone).

### Lines that own the brand

Use these as north stars for headlines, share copy, and deck slides:

- *What does that actually cost you?*
- *Same money. Different reality.*
- *Same price. Different life.*
- *This cost me X hours of work. What does it cost you?*

### Tone settings (in-product)

RealCost adapts copy via four tones — same math, different emotional lens:

| Tone | Voice | Example energy |
|------|-------|----------------|
| **Gently** | Self-compassion | “That's okay.” / “Nice pause.” |
| **Straight up** | Minimal, clear | “Logged.” / “Skipped.” |
| **Hyped** | Agency, celebration | “Treat secured.” / “That's a win.” |
| **Curious** | Reflective questions | “What made it feel worth it?” |

Brand voice outside the app (marketing, social) should default to **Straight up + Curious** — never Hyped by default in ads.

---

## Avoid (Hard No)

| Never say | Why |
|-----------|-----|
| “You shouldn't buy this.” | Prescriptive; triggers reactance |
| “You wasted X hours.” | Shame framing |
| “Optimize your expenditure…” | Fintech jargon |
| “You're bad with money.” | Identity attack |
| “Download now to save!” | RealCost is not a savings app CTA |

### Visual avoid list

- Stock photo families counting coins
- Red “danger” styling on skip decisions
- Leaderboards, streaks, or guilt badges
- Emoji-as-UI-iconography

---

## Visual Brand

**Premium consumer product** — Apple clarity + Linear hierarchy + editorial share cards.

| Attribute | Expression |
|-----------|------------|
| Color | Ink darks, single cobalt action, champagne highlight |
| Type | Outfit, tabular numbers on money/time |
| Photography | Real environments, candid, diverse households — not boardroom |
| Motion | Subtle press feedback; no slot-machine celebrations |

Playful enough for Gen Z (24–36 cohort includes late Gen Z + Millennials). Mature enough that a 34-year-old teacher doesn't feel talked down to.

---

## Share Object — The Card Is the Network

The share card is not a referral widget. It is the **primary distribution creative**.

### Share card rules

1. **Hours are the headline** — price supports, not dominates
2. **Question is the CTA** — “What does it cost you?” beats “Download RealCost”
3. **No wage on card** — ever
4. **Optional first name on card only** — never in the share URL
5. **Brand mark small** — curiosity first, logo second

### Share text template

From `shareText()` in `src/lib/sharing.ts`:

> This $150 cost me 6h of work. What does it cost you?

Short. Specific. Invites reply.

---

## Category Language

Purchase categories use plain nouns — not merchant codes:

Shopping · Food · Subscriptions · Entertainment · Travel · Tech · Others

“Others” accepts custom label text. Copy stays neutral regardless of category.

---

## Naming & Product Grammar

| Term | Use |
|------|-----|
| **RealCost** | Product name; wordmark in share card |
| **Hours** | Primary unit (not “life units” or “time credits”) |
| **Shared** | Tab name for local comparison inbox (not Feed, not Social) |
| **Decision** | Bought / Thinking / Skipped — not Pass/Fail |

---

## Approach for External Comms

### Launch positioning

**Not:** “A budgeting app for Gen Z.”  
**Yes:** “See what a price actually costs you — then ask someone else.”

### Channel-native hooks

- TikTok / Reels: split-screen reaction to same price, different hours
- Stories: share card screenshot + poll sticker
- Couples / roommates: “We both wanted this — look at the gap”

---

## Artifacts / Decisions

| Artifact | Brand decision |
|----------|----------------|
| Share URL copy | Question-led, not app-download-led |
| Four tones | Personalization without moral frames |
| Shared tab rename | Honest inbox naming builds trust |
| Private-by-default links | Privacy as brand, not fine print |
| No public profiles | Brand avoids social-network baggage |

---

## Outcomes / Success Criteria

| Brand outcome | Signal |
|---------------|--------|
| Users share without embarrassment | Share completion in funnel |
| Recipient understands in one glance | Comparison open → complete rate |
| No “finance app” pigeonhole | Qualitative feedback on positioning |
| Copy passes shame audit | Behavioral science + brand review |

---

## Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| Hyped tone feels cringe in marketing | Default external voice to Straight up |
| “Same money different lives” reads political | Keep examples consumer-specific (purchases, not policy) |
| Name in URL feels exposing | **Removed** — name stays on-device / on card only |
| Premium visual vs free product | Intentional — premium feel supports share behavior |
