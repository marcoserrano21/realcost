# RealCost — locked spec (v1)

Converged on with Claude + ChatGPT cross-review, September 2026. This is the scope that shipped in the attached MVP. Anything not listed here is deliberately deferred.

## One-liner

Turns a price into what it actually costs you: hours of your work, shifts, dinners. Then, "what does it cost someone else?"

## What's real and already validated by competitor research

The "price to hours" mechanic itself is common (SpendYourHours, WorthIt, Work Worth, Price to Hours, several Chrome extensions). Most have near-zero traction. That's not a threat, it confirms the itch is real and nobody's cracked distribution. "Personal units" and a voice/personality are also not differentiators anymore, WorthIt already does both.

**The one thing nobody's shipped: person-to-person comparison.** "Same price, different life." That's the actual bet this MVP tests.

## What's built (v1, in this zip)

1. **Home screen** — one input, one number. Enter a price, see hours/shifts/dinners. First run asks for hourly take-home wage (stored in `localStorage`, never sent anywhere, no backend at all).
2. **Bought it / Skipped it / Still thinking** — three buttons, logged locally. Surfaces a one-line weekly summary ("you skipped 3 things this week, that's 6.2h reclaimed").
3. **Same Price, Different Life** (`/c` route) — the actual experiment. Sharing a result encodes price + your hours (not your wage) into the URL. Whoever opens it sees "X says this cost them Y hours, what does it cost you," enters their own wage locally, and sees a side-by-side. They can then generate and share their own link the same way. No accounts, no server, the URL is the entire backend.

## What's deliberately NOT built yet

Wishlist, receipt scanning, browser extension, weekly reflection engine, charts, subscriptions/pricing, AI anything, social feed/profiles/leaderboards. All of that is real roadmap, none of it belongs in the experiment. Build it only if the comparison loop actually shows people sharing and the recipient completing their own calculation.

## The metric that matters

Not downloads. Not DAU. Track:
- Share → link opened
- Link opened → recipient completes their own calculation
- Recipient → recipient shares their own

If that funnel is healthy (double digit percent through each step), the product has found something. If people do one calculation and never come back or share, the comparison hypothesis failed and RealCost is a feature, not a company, worth knowing in days not months.

## Stack

Next.js (App Router) + TypeScript + Tailwind. Zero backend, zero database, localStorage only. Deploy target: Vercel free tier. $0/mo to run.

## Distribution plan (days 18-21 territory, not built yet)

Don't launch as "a new financial app." Launch as an experiment: "how much of your life is $100," "same $100, different lives," share the mechanic itself as content before the app.
