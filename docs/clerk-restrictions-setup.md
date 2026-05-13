# Clerk dashboard Restrictions — pre-launch setup runbook

The pre-launch signup allowlist works in three layers:

1. **Clerk dashboard Restrictions → Allowlist** (front-line block — Clerk
   refuses to create the account in the first place).
2. **Clerk webhook** `apps/web/src/app/api/webhooks/clerk/route.ts` — if a
   signup somehow gets through Clerk, the `user.created` event is rejected,
   the Clerk user is deleted via the Backend API, and the Prisma mirror row
   is rolled back.
3. **JIT provisioning fallback** in `apps/web/src/lib/get-current-user.ts`
   — if the webhook lags or was never delivered, the first authenticated
   request still gates the user before any Prisma row is created.

Layers 2 and 3 share the same Prisma `SignupAllowlist` table, managed via
`/admin/users/signup-allowlist`. Layer 1 lives in Clerk's dashboard and is
managed manually (Clerk doesn't expose a Backend API for the Restrictions
allowlist on most plans). **The dashboard list and the Prisma list need to
stay in sync manually for now** — the admin UI is the source of truth.

## Dashboard setup steps

1. Log into [dashboard.clerk.com](https://dashboard.clerk.com) using
   `rebecca@homemade.education`.
2. Pick the `homemade` application.
3. Navigate to **User & Authentication → Restrictions** in the sidebar.
4. Under **Sign-up mode**, switch from "Public" to **Allowlist**. (If your
   plan doesn't surface this option, use "Block list" with no entries — the
   webhook + JIT layers still protect signups. If neither surface is
   available, skip this step entirely; the belt-and-braces gate covers the
   case.)
5. Paste the same list of emails that's in the Prisma
   `SignupAllowlist` (visit `/admin/users/signup-allowlist` to copy the
   list). Save.
6. **Whenever you add or remove an entry in `/admin/users/signup-allowlist`,
   make the same change here.** No automation yet — the admin UI is the
   source of truth, this dashboard is the mirror.

## Launch-day removal

1. **Clerk dashboard:** Restrictions → Sign-up mode → back to **Public**.
   Save.
2. **Code:** flip `SIGNUP_ALLOWLIST_ENABLED = false` in
   `apps/web/src/lib/signup-allowlist.ts`. Commit + deploy.
3. **Optional cleanup:** once you've launched and you're confident nothing
   regresses, the `SignupAllowlist` table + the webhook/JIT logic can be
   deleted in a follow-up sweep. Until then, leaving them as dead code is
   fine — they no-op while the constant is `false`.

## What the user sees when rejected

- **Front-line block (dashboard layer 1):** the Clerk-hosted sign-up form
  rejects with whatever copy Clerk shows (usually "Sign-ups are
  restricted").
- **Webhook block (layer 2):** the user briefly sees a successful sign-in,
  then their Clerk session is invalidated. Their next request bounces to
  `/sign-in` with no account.
- **JIT block (layer 3):** same as layer 2 — first authenticated request is
  the last; the Backend API delete runs synchronously.

In all cases the rejection is audit-logged
(`auth.signup_rejected`), Sentry gets a breadcrumb if the Clerk Backend
delete fails, and PostHog fires `signup_rejected_not_allowlisted` with the
hashed email and raw domain so we can spot bot signup attempts clustering
on one domain.
