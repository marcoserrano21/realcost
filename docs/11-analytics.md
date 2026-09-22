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

### Strip before store

`track()` in `src/lib/analytics.ts` filters property keys matching:

```
/wage|rate|email|name/i
```

This runs **before** queue write — defense in depth even if a developer accidentally passes sensitive props.

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
| `calculation_created` | Valid price entered and computed | `price_bucket` (optional future) |
| `category_selected` | User taps category chip | `category` |
| `decision_bought` | User logs Bought | — |
| `decision_skipped` | User logs Skipped | — |
| `decision_thinking` | User logs Thinking | — |
| `share_started` | Share CTA tapped | `privacy`, `challenge` |
| `share_completed` | Native share or clipboard success | `method`: `native` \| `clipboard`; `privacy`; `challenge` |
| `share_image_started` | Save/share PNG started | `challenge`, `format`, `variant` |
| `share_image_completed` | PNG export succeeded | `challenge`, `format`, `variant` |
| `comparison_opened` | Valid `/c` params loaded | — |
| `recipient_calculation_completed` | Recipient enters rate and sees result | — |
| `recipient_shared` | Recipient shares their card | — |
| `reaction_sent` | Recipient sends hours reply | — |
| `reaction_received` | Sender applies matching reaction | — |
| `onboarding_completed` | Setup flow finished | `tone`, `spending_focus` |
| `a2hs_prompt_shown` | Install cue shown | `ios`, `peak` (`share` \| `skipped` \| legacy) |
| `a2hs_dismissed` | User dismisses install cue | — |
| `a2hs_choice` | User accepts / interacts with install | `outcome` |

### Forbidden properties (never stored)

| Key pattern | Why |
|-------------|-----|
| `wage`, `hourlyWage`, `rate` | Direct income |
| `email` | PII |
| `name` | PII — even though name is local-only elsewhere |

**Note:** Display name is local / on-card only. It is **not** tracked and **not** encoded in share URLs (legacy `n=` ignored). Safe boolean/string props like `privacy`, `challenge`, `format`, and `peak` are allowed.

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
| Regex stripper vs allowlist | Stripper safer against developer error |
| No price in analytics (currently) | Price could be sensitive — add bucketing later if needed |
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
**Solution:** Local queue + regex property stripper + swappable sink.  
**Funnel:** Calc → share → open → complete → re-share.  
**Gate:** No vendor connection until stripper verified in QA.
