# RealCost — Figma MCP design system rules

Use this when integrating Figma designs via MCP. Prefer codebase tokens and components over invented hex or primitives.

## 1. Token definitions

**Source of truth:** `src/app/globals.css` (`:root` + `html.light`).

| Token | Role |
|-------|------|
| `--background` / `--foreground` | Ink canvas + primary text |
| `--action` / `--action-strong` / `--primary` | Cobalt CTAs |
| `--champagne` | Life-cost accent (brand signal) |
| `--surface` / `--surface-raised` / `--card` | Panels |
| `--border` / `--muted` / `--subtle` | Hierarchy |
| `--gradient-aurora` | Screen atmosphere |
| `--gradient-panel` | Cards / sheets |
| `--gradient-share` + `--gradient-share-sheen` | Viral share poster |
| `--radius` | ~0.9rem base |
| `--font-outfit` | Outfit (via `layout.tsx`) |

No separate token transform pipeline. Map Figma variables 1:1 to these CSS custom properties.

## 2. Component library

**Location:** `src/components/`

Key product components: `CashAmountField`, `ResultCard`, `HoursOdometer`, `ShareCard`, `TappableExpandCard`, `DecisionSheet`, `SettingsSection`, `TabBar`, `PageEnter`.

Architecture: Next.js App Router pages compose these clients. Prefer extending existing components over new one-offs.

No Storybook. Patterns live in pages + `globals.css` class contracts.

## 3. Frameworks & libraries

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + `tw-animate-css` + thin shadcn token bridge
- Product chrome is mostly custom CSS classes in `globals.css`
- Bundler: Next / Turbopack (`next dev` / `next build`)

## 4. Asset management

- Icons: SVG in `src/components/icons.tsx`
- Share art: DOM poster (`.share-card`), not a static PNG yet
- No CDN image pipeline; keep assets local / CSS

## 5. Icon system

Inline SVG components. Semantic names (`BoughtIcon`, `SkippedIcon`). No emoji as UI icons. Stroke weight ~1.5–2 consistent.

## 6. Styling approach

- Global CSS + utility Tailwind
- Semantic classes: `.primary-action`, `.surface-card`, `.history-edit-panel`, `.edit-stagger`
- Motion: class-driven; honor `html[data-reduce-motion="true"]`
- Responsive: mobile-first shells (`.screen-shell`), bottom tab safe-area

## 7. Project structure

```
src/app/          routes (page.tsx, feed, history, settings, c/, legal/)
src/components/   UI building blocks
src/lib/          calc, storage, sharing, copy, analytics
src/tests/        node:test suite
```

Feature pattern: page owns state + storage; shared visuals in components + CSS tokens.

## MCP / Figma do’s

1. Import/bind ink–cobalt–champagne variables; do not introduce purple/gold AI defaults.
2. Hours are the hero on share surfaces; dollars are secondary.
3. Expand panels: height first (~520ms), then fields-first stagger via `.edit-stagger`.
4. One primary CTA per section; cobalt for action, champagne for meaning.
