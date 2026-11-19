# RealCost

Turns a price into what it actually costs you: hours of your work, shifts, dinners. Then asks, "what does it cost someone else?"

Live: https://realcost-xi.vercel.app

## The bet

The price-to-hours mechanic is common. What nobody has shipped is person-to-person comparison: "Same price, different life." Share a price, a friend opens the link, enters their own wage on their device, and sees the side-by-side. That loop is the whole experiment.

## Privacy

There is no backend, no database, no accounts. Your wage lives in `localStorage` on your device and never leaves it. Share links carry only the price, never a wage.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind. Deployed on the Vercel free tier. $0/mo to run.

## Run it

```bash
npm install
npm run dev
```

Node 22+ required. `npm test` runs the unit tests, `npm run build` is the production build.

## Docs

- `SPEC.md` — the locked v1 scope, what shipped, what was deliberately deferred, and the metric that matters (share → opened → recipient completes → recipient shares).
- `docs/` — architecture, design system, branding, marketing, roadmap, changelog, UI/UX notes.
