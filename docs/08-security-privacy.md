# Security & Privacy Audit

Pre-launch security and privacy review for RealCost MVP — a **client-only Next.js application** where sensitive financial context (hourly wage) never leaves the device in share or analytics payloads.

**Audit date:** September 2026  
**Scope:** MVP as deployed on Vercel (static/SSR shell + client-side logic)  
**Method:** Threat modeling, code-path review, launch gate checklist

---

## Executive Summary

RealCost's privacy model is **local-first by architecture**, not policy alone. The MVP intentionally avoids accounts, servers, and PII collection. Residual risk concentrates in:

1. **Client-side storage exposure** (XSS, shared devices, shoulder surfing)
2. **Share URL information leakage** (a link that carries both price and hours recovers wage)
3. **Third-party deployment surface** (Vercel headers, OG crawlers)

**Note:** Display name is **local-only** — legacy `n=` URL param is stripped on decode and must not be reintroduced.

**Launch posture:** Acceptable for MVP hypothesis validation with **Critical** items resolved before public URL, **Hardening** items scheduled post-launch, **Success-enablers** tracked for loop validation.

---

## Context / Problem

Users entrust RealCost with their **take-home hourly rate** — among the most sensitive numbers in daily life. Unlike bank apps, RealCost has no regulated custody of funds, but mishandling wage data would destroy the core promise:

> Compare honestly without exposing income.

The product also encourages **sharing** — traditionally where privacy goes wrong.

---

## Threat Model (MVP)

### Assets

| Asset | Sensitivity | Storage |
|-------|-------------|---------|
| Hourly wage / units | **High** | `localStorage` (`realcost:units`) |
| Display name | Medium | `localStorage` only (not in URLs) |
| Decision history | Medium | `localStorage` (`realcost:log`) |
| Comparison log | Medium | `localStorage` (`realcost:comparisons`) |
| Analytics queue | Low | `localStorage` — stripped events only |

### Adversaries

| Threat actor | Capability | Goal |
|--------------|------------|------|
| Network observer | Read URLs in transit | Infer purchase + hours |
| Link recipient | Read query params | Same |
| Malicious XSS | Execute JS in origin | Read all localStorage |
| Shoulder surfer | Visual access | See wage on Settings |
| OG / crawler | Fetch public metadata | Scrape preview content |
| Analytics sink (future) | Receive events | Re-identification via properties |

### Out of scope (MVP)

- Credential stuffing (no auth)
- Server-side data breach (no user DB)
- PCI / payment data (no transactions)
- COPPA-compliant minors flow (anti-persona)

---

## Privacy Invariant (Architectural)

> **Never put wage in URLs, analytics, or metadata.**

### Enforcement points

| Layer | Control | File |
|-------|---------|------|
| Share encoding | `p` (+`s`, +`reply`) only. Never hours, wage, or name | `sharing.ts` |
| Share decoding | No wage; legacy `h=` and `n=` ignored, then stripped from the URL | `sharing.ts`, `CompareClient.tsx` |
| Analytics | Per-event allowlist. Numbers dropped. Values equal to the current wage dropped. Key deny-list kept | `analyticsProps.ts`, `analytics.ts`, `api/analytics/route.ts` |
| Share card / poster | Price or hours, never both. No life-span gloss on the poster | `sharePosterContent.ts`, `ShareCard.tsx`, `shareImage.ts` |
| Stale opt-in | `realcost:share_privacy` is removed on load | `storage.ts` |
| Tests | Wage cannot be recovered from URL, copy, poster, or OG | `wage-leak.test.ts`, `calc-sharing.test.ts` |

---

## Audit Findings — Critical (Launch Blockers)

Must be verified **before** public marketing URL goes live.

| ID | Finding | Risk | Required state | Verification |
|----|---------|------|----------------|--------------|
| **C-01** | Wage in share URL | Income exposure via link forwarding, browser history, referrer logs | **Pass** — `encodeComparison()` never sets wage or hours. Price alone cannot be divided back into a wage | QA: inspect shared URL; `wage-leak.test.ts` |
| **C-02** | Wage in analytics events | Third-party sink re-identification | **Pass** — allowlist in `track()` and the API route. Numbers and wage-equal values are dropped | DevTools: confirm no wage in queue payload |
| **C-03** | Wage in OG/social metadata | Crawlers cache sensitive context | **Pass** — OG title and description are static and contain no digits | Fetch OG tags; `compare-og.test.ts` |
| **C-04** | Unvalidated `/c` params crash or XSS | Broken UX or injection via query string | **Pass** — `decodeComparison()` returns null; React text binding | QA broken link; fuzz `p`/`h` values |
| **C-05** | Reset does not confirm wipe | Accidental total data loss | **Pass** — Settings reset uses confirmation dialog | Manual QA |
| **C-06** | HTTPS only in production | MITM on wage entry (theoretical) | **Pass** — Vercel default TLS | Verify redirect HTTP→HTTPS |

### C-01 detail — URL leakage analysis

Shared URL contains:

- `p` — purchase price (always when sharing)
- `s` — opaque share id (reactions)
- `reply=1` — the recipient checked this price (no hours)

**Not in URLs:** wage, hours, display name. Legacy `h=` and `n=` are ignored by `decodeComparison` and removed with `router.replace`.

**Residual:** price alone is intentional share content. Hours stay on each device. A share image follows the same rule: the standard poster shows the price, the hours-kept poster shows hours, and neither shows both.

**Not accepted:** Encoding wage, or encoding any pair that divides back to wage.

---

## Audit Findings — Hardening (Post-Launch Priority)

Should ship within first 30 days of public exposure.

| ID | Finding | Risk | Recommendation | Priority |
|----|---------|------|----------------|----------|
| **H-01** | No Content-Security-Policy | XSS impact amplified if injection found | Add strict CSP on Vercel: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` (adjust for Next inline needs) | P1 |
| **H-02** | No Subresource Integrity audit | Supply chain via CDN fonts | Self-host Outfit or use Next font optimization with integrity | P2 |
| **H-03** | `localStorage` readable by any same-origin script | XSS = full exfiltration | CSP + no `dangerouslySetInnerHTML`; dependency audit | P1 |
| **H-04** | Legacy `n=` still decodeable if pasted | Name exposure if old links recirculate | Decoder ignores `n=`; do not re-encode | Done / monitor |
| **H-05** | No `Referrer-Policy` header | Full URL leaked to third parties on outbound navigation | `Referrer-Policy: strict-origin-when-cross-origin` | P1 |
| **H-06** | Analytics queue unencrypted locally | Physical device access reads event history | Accept for MVP; low sensitivity after stripper | P3 |
| **H-07** | Rate limits absent on static routes | Scraping / bot noise | Vercel firewall rules if abuse observed | P3 |
| **H-08** | Dependency vulnerabilities | Known CVEs in Next/React | `npm audit` in CI; monthly review | P2 |

---

## Audit Findings — Success-Enablers (Launch + Loop Validation)

Privacy features that **enable** the hypothesis, not just protect users.

| ID | Enabler | Why it matters | Implementation status |
|----|---------|----------------|----------------------|
| **S-01** | Local-only wage storage | Users trust enough to enter real rate | ✅ `localStorage` |
| **S-02** | Clear “stays on device” copy | Reduces share hesitation (Jordan persona) | ✅ Share flow + Settings |
| **S-03** | Reset onboarding without history wipe | Shared devices, rate experiments | ✅ `resetOnboarding()` |
| **S-04** | Full reset with confirmation | GDPR-adjacent user control (delete my data) | ✅ `clearAllData()` |
| **S-05** | No account email collection | Eliminates #1 PII leak vector | ✅ By design |
| **S-06** | Price-only or hours-only share card | Screenshot of a poster cannot recover wage | ✅ ShareCard + `sharePosterContent` |
| **S-07** | Dev-only analytics console | Validate funnel without sending PII to vendor | ✅ `NODE_ENV !== 'production'` |
| **S-08** | Swappable analytics sink | Add PostHog later without wage in call sites | ✅ Queue abstraction |

---

## Data Flow — Privacy Annotated

```
User enters wage
      │
      ▼
localStorage (realcost:units)  ◄── NEVER leaves device except via user inference
      │
      ▼
computeRealCost(price, units)
      │
      ├──► UI display (hours hero)
      │
      ├──► addLogEntry({ price, hours, choice })  ◄── wage NOT stored in log
      │
      └──► encodeComparison({ price, shareId })
                │
                ▼
           URL: /c?p=&s=   or   /c?p=&s=&reply=1
                │                    ◄── wage NOT in URL; hours NOT in URL; name NOT in URL
                ▼
           Recipient enters OWN wage locally
                │
                ▼
           Reply (reply=1, no hours) → sender Shared shows Seen

Parallel path:
track(event, props) ──► allowlist + drop numbers/wage ──► localStorage queue
                                                   └──► /api/analytics (same allowlist)
```

---

## Compliance Posture

| Domain | Status | Notes |
|--------|--------|-------|
| **Financial advice** | Not applicable | Informational reframe tool; no recommendations |
| **Banking / money transmission** | Not applicable | No payments |
| **GDPR** | Low exposure | No server PII; EU users can clear all data locally |
| **CCPA** | Low exposure | No sale of data; no collection beyond local device |
| **COPPA** | Not targeted | Anti-persona: minors |
| **SOC 2** | Not applicable | No enterprise B2B |

**Disclaimer copy (recommended):** RealCost is for personal reflection, not financial advice. Numbers are estimates based on your input.

---

## Third-Party Surface

| Vendor | Data shared | Risk |
|--------|-------------|------|
| **Vercel** | Request logs (URLs may contain `p`, `s`, `reply`) | Medium — access logs see the price, not hours or wage |
| **Google Fonts (if CDN)** | IP, referrer | Low — no user content |
| **Future analytics** | Stripped events only | Low if stripper maintained |

**Action:** When enabling PostHog/Plausible, review event properties in staging before production key.

---

## Security Testing Checklist

Pre-launch QA (extends `12-qa-checklist.md`):

- [ ] Share URL manual inspection — confirm no `wage`, `rate`, or `hourly` params
- [ ] Analytics queue inspection — enter wage, trigger events, read `realcost:analytics_queue`
- [ ] `/c?p=abc&h=xyz` — graceful empty state
- [ ] `/c?p=-100&h=5` — rejected
- [ ] `/c?p=100&h=0` — rejected
- [ ] XSS probe: `<script>` in name field — escaped in UI, not executed
- [ ] Settings reset confirmation — cannot wipe without dialog
- [ ] View page source / OG tags — no embedded wage
- [ ] Share to iMessage — preview shows safe content
- [ ] `npm audit` — no critical unfixed vulnerabilities

---

## Incident Response (MVP)

Lightweight plan for a static client app:

| Severity | Example | Response |
|----------|---------|----------|
| **P0** | Wage leaking in new feature | Hotfix + invalidate docs + notify if any external sink affected |
| **P1** | XSS vulnerability | Patch dependency, deploy CSP, post-mortem |
| **P2** | OG crawler caching stale unsafe metadata | Redeploy metadata fix; request cache bust |
| **P3** | Analytics property slip | Stripper regex update; purge queue guidance in Settings |

No user notification list exists (no emails collected).

---

## Outcomes / Success Criteria

| Gate | Criteria |
|------|----------|
| **Launch** | All Critical (C-*) items Pass |
| **30-day** | H-01, H-05 deployed (CSP + Referrer-Policy) |
| **Loop validation** | Success-enablers S-01–S-08 holding under real shares |
| **Pre-monetization** | Re-audit before any account/email feature |

---

## Risks / Open Questions

| Question | Options |
|----------|---------|
| Is `p/h` inference acceptable? | No. Links and posters never carry both |
| Remove `n=` from URLs entirely? | **Done** — decoder ignores; do not re-encode |
| Encrypt localStorage? | Overkill for MVP; Web Crypto if sync added |
| Server-side comparison links? | Would enable tracking but increases PII custody — defer |
| Vercel log retention | Confirm team access policy; no user wage in logs anyway |

---

## Audit Summary Table

| Category | Count | Launch gate |
|----------|-------|-------------|
| **Critical** | 6 | Must Pass |
| **Hardening** | 8 | Schedule post-launch |
| **Success-enablers** | 8 | Maintain |

**Auditor recommendation:** **Proceed to public hypothesis launch** when Critical checklist is green and share flow copy communicates URL visibility (price, hours, optional name).
