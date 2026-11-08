# Analytics Spec

Privacy-first event instrumentation for RealCost MVP hypothesis validation.

---

## Context / Problem

RealCost must measure whether the **share loop closes** without collecting wages, names, or financial identifiers. Traditional analytics defaults (capture all properties, identify users) would violate the privacy invariant and erode user trust.

The MVP needs a **swappable sink** — instrument now, connect PostHog/Plausible later — with zero wage leakage at call sites.

---

## Approach

### Local queue first

Events are written to `localStorage` key `realcost:analytics_queue` (max 200 events, FIFO trim). In development, events also log to console. In production, queue awaits future flush to external vendor.

### Allowlist before store

`sanitizeProps()` in `src/lib/analyticsProps.ts` runs inside `track()` and again in `src/app/api/analytics/route.ts`.

For each event, only the keys in that event's allowlist are kept. Anything else is dropped, including `privacy`, `has_peer_hours`, and `has_hours`.

Values:

- booleans pass
- strings pass when they are at most 40 characters and do not parse as a number
- every number is dropped
- a value equal to the current hourly wage (read from `getUnits()` in `track()`) is dropped

The old key deny-list still applies:

```
/wage|rate|email|name/i
```

This runs **before** queue write.

### Custom event dispatch

Each tracked event also fires:

```javascript
window.dispatchEvent(new CustomEvent("realcost:analytics", { detail: payload }))
```

Enables dev tools or future debug panels without coupling to vendor SDK.

---

## Event Catalog

| Event | Fired when | Typical props (safe) |
|-------|------------|----------------------|
| `calculation_created` | Valid price entered and computed | — |
| `category_selected` | User taps category chip | `category`, `source` |
| `decision_bought` / `decision_skipped` / `decision_thinking` | User logs a decision | `has_category` |
| `share_started` | Share CTA tapped | `challenge`, `source` |
| `share_completed` | Native share or clipboard success | `method`: `native` \| `clipboard`; `challenge` |
| `share_image_started` | Save/share PNG started | `format`, `variant` |
| `share_image_completed` | PNG export succeeded | `format`, `variant` |
| `share_video_started` | Save/share video started | `format`, `variant` |
| `share_video_completed` | Video export succeeded (or PNG fallback completed) | `format`, `variant` |
| `comparison_opened` | Valid `/c` params loaded | — |
| `comparison_updated` | Shared note saved | `role` |
| `recipient_calculation_completed` | Recipient enters rate and sees result | — |
| `recipient_shared` | Recipient shares onward | `method` |
| `reaction_sent` | Recipient sends a price-only reply | — |
| `reaction_received` | Sender applies matching reaction | — |
| `onboarding_completed` | Setup flow finished | `tone`, `focus` |
| `decision_updated` | History decision edited | `choice` |
| `decision_deleted` | History decision deleted | `choice` |
| `a2hs_prompt_shown` | Install cue shown | `ios`, `peak` (`share` \| `skipped` \| legacy) |
| `a2hs_dismissed` | User dismisses install cue | — |
| `a2hs_choice` | User accepts / interacts with install | `outcome` |

### Forbidden properties (never stored)

| Key pattern | Why |
|-------------|-----|
| `wage`, `hourlyWage`, `rate` | Direct income |
| `email` | PII |
| `name` | PII — even though name is local-only elsewhere |

**Note:** Display name is local only. It is **not** tracked and **not** encoded in share URLs (legacy `n=` and `h=` ignored). Allowed props are the per-event list above. `privacy`, `has_peer_hours`, and `has_hours` are not allowed.

---

## Funnel Definition

Primary hypothesis funnel:

```
onboarding_completed (optional)
        ↓
calculation_created
        ↓
share_started → share_completed
        ↓
comparison_opened
        ↓
recipient_calculation_completed
        ↓
recipient_shared
```

Secondary engagement funnel:

```
calculation_created
        ↓
category_selected (optional)
        ↓
decision_* 
        ↓
(repeat calculation_created)
```

---

## Implementation Reference

### Queue structure

```typescript
{
  event: AnalyticsEvent;
  props?: Record<string, string | number | boolean>;
  t: number; // timestamp ms
}[]
```

Stored at `realcost:analytics_queue`, capped at 200 entries.

### Dev sink

```typescript
if (process.env.NODE_ENV !== 'production') {
  console.info('[realcost:analytics]', event, props);
}
```

### Production sink (future)

Replace console sink with:

```typescript
// posthog.capture(event, props) — after verifying stripper
```

Call sites unchanged — only sink module edits.

---

## Artifacts / Decisions

| Decision | Rationale |
|----------|-----------|
| No user IDs in MVP | No accounts = no stable identity |
| Queue in localStorage | Matches zero-backend architecture |
| Allowlist plus deny-list | Allowlist stops new keys. Deny-list and numeric drop stop wages hidden under another name |
| No price or hours in analytics | A number next to another number can recover wage |
| Custom DOM event | Debuggability without vendor lock-in |

---

## Privacy Review Cross-Reference

Analytics audited in `08-security-privacy.md`:

- **C-02:** Wage in analytics — must Pass
- **S-07:** Dev console sink — Success-enabler
- **S-08:** Swappable sink — Success-enabler

---

## Outcomes / Success Criteria

| Outcome | Validation |
|---------|------------|
| Funnel measurable in dev | Console shows ordered events in test session |
| No wage in queue | Manual QA after wage entry + full flow |
| Sink swap < 1 day effort | Interface documented; single module change |
| Events cover loop gates | All 6 primary funnel stages instrumented |

**Not a success criterion:** Real-time dashboards before Phase 2.

---

## Risks / Open Questions

| Question | Direction |
|----------|-----------|
| Add price bucketing (`$0-50`, `$50-200`)? | Useful for content insights; not PII — consider Phase 2 |
| Flush queue to server on unload? | Requires backend — defer |
| Sample rate in production? | Full capture OK at low volume initially |
| Recipient events on sender device? | No — recipient events only fire on recipient device |
| GDPR on analytics vendor | When sink added, use EU hosting + no PII contract |

---

## QA Verification Steps

1. Clear `realcost:analytics_queue`
2. Complete onboarding → verify `onboarding_completed`
3. Enter price → verify `calculation_created`
4. Share → verify `share_started` + `share_completed`
5. Open `/c` on second browser → verify `comparison_opened` + `recipient_calculation_completed`
6. Inspect queue JSON — confirm zero wage/rate/name keys
7. grep codebase for `track(` calls — audit props at each site

---

## Portfolio Slide Summary

**Problem:** Measure viral loop without collecting income data.  
**Solution:** Local queue + per-event allowlist + swappable sink.  
**Funnel:** Calc → share → open → complete → re-share.  
**Gate:** No vendor connection until stripper verified in QA.
