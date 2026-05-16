# Sentry sweep — 2026-05-16

## What was attempted

Pull unresolved issues from the Homemade Sentry project via the API, resolve anything that hasn't recurred in the last 7 days, flag still-active issues for Rebecca.

## Token + scope check

`SENTRY_AUTH_TOKEN` in `.env.credentials` is a **Sentry organisation auth token** (`sntrys_…`). Probed three endpoints:

| Endpoint | Region | Response |
|---|---|---|
| `GET https://sentry.io/api/0/projects/homemade-j3/homemade-web/issues/?statsPeriod=30d&query=is:unresolved&limit=50` | sentry.io | `403 {"detail":"You do not have permission to perform this action."}` |
| Same path | de.sentry.io | `403 {"detail":"You do not have permission to perform this action."}` |
| `GET https://sentry.io/api/0/organizations/homemade-j3/` | sentry.io | `403 {"detail":"You do not have permission to perform this action."}` |
| `GET https://sentry.io/api/0/projects/` | sentry.io | `400 {"detail":"Invalid org token"}` |

The token is provisioned with the `project:releases` scope (used by the source-map upload during deploys) but **does not have `event:read`** or `org:read`. That matches the existing follow-up queue entry "Sentry auth token with `event:read` scope" — confirmed still outstanding.

## What this means for the sweep

The sweep cannot complete from a worker session today. Two practical paths:

1. **Rebecca provisions a token with `event:read` + `event:write` + `org:read`** (Sentry dashboard → Settings → Auth Tokens → New Token). Drop it alongside the existing token in `.env.credentials` (key it as `SENTRY_AUTH_TOKEN_READ` so the deploy-time release upload keeps using the narrower release-only token). A future tidy-up worker can then resolve stale issues programmatically.
2. **Manual sweep from the Sentry dashboard.** Rebecca opens [https://homemade-j3.sentry.io/issues/](https://homemade-j3.sentry.io/issues/) and resolves anything that hasn't recurred in 7 days. The shipped fixes worth checking against current issue list:
   - Clerk `auth()` errors from bot probes — should have stopped post-`398d2e7` (proxy.ts matcher tightened + `getCurrentDbUser` try/catch).
   - Tutorial-page 500s on recipe routes — should have stopped post-`049f888` (`extractScaleIngredients` server/client split).
   - ALB Cloudflare-only ingress noise — closed in `c417d9e`.

## Inferred state from recent build entries

From `BUILD_PROGRESS.md` (now archived as `docs/archive/build-progress-history.md` for entries before the tidy-up), the bug-fix bundle on 2026-05-13 reported "~17 occurrences/hour from bot probes" of the Clerk `auth()` error. Subsequent fixes:

- `398d2e7` narrowed the `proxy.ts` matcher to skip more static-extension paths.
- `c417d9e` shipped the defensive tutorial page handler + ALB ingress lockdown.
- `049f888` fixed the `extractScaleIngredients` client-server boundary that was crashing every recipe page.

So the high-volume issues from the 2026-05-11 → 2026-05-14 window are addressed in code. Without `event:read` we cannot confirm the inbox actually matches that expectation — but the underlying paths are fixed.

## What's still flagged

In the follow-up queue:

- `proxy.ts` bot-scanner noise floor — lower-rate Clerk warnings from probes that don't match either gate.
- `/api/unlock/route.ts` `req.formData()` 500 on non-form bodies — only triggers on manual probes.

Both are catalogued in `memory/project_followup_queue.md` for the next batch session.

## Action items

- [ ] **Rebecca.** Provision a Sentry auth token with `event:read` (and ideally `event:write` so a future worker can resolve stale issues). Drop into `.env.credentials` + GitHub Actions secrets.
- [ ] **Next tidy-up worker.** Once the token is available, re-run the sweep — pull unresolved issues, resolve any with no events in 7 days, flag the rest in a fresh archive log.
