# Stripe premium checkout (Session F)

Premium subscription billing, built end to end in **TEST/sandbox** mode behind a
`CHECKOUT_ENABLED` flag that defaults **OFF**. Nothing is publicly buyable until
that flag is turned on at launch — see the go-live sequence below.

## What's here

| File | Role |
| --- | --- |
| `config.ts` | Pure, mode-aware config. `STRIPE_MODE` (test/live), `CHECKOUT_ENABLED`, price-id resolution by mode+plan+currency, the reverse lookup, the grace window. No `stripe` import — safe to read anywhere. |
| `client.ts` | Lazy, cached, mode-aware `getStripe()`. Reads TEST keys when `STRIPE_MODE=test`, LIVE otherwise. Throws only when first called, so the app boots with no Stripe env at all while checkout is off. |
| `entitlement.ts` | Pure entitlement state machine — maps a Stripe subscription status → `{ premiumActive, premiumUntil }`, including the failed-payment grace window. Unit-tested. |
| `checkout-actions.ts` | `'use server'` actions: `createCheckoutSession` (hosted Checkout, subscription mode, automatic_tax) and `createPortalSession` (Customer Portal). |
| `provision.ts` | Guest checkout / account-on-purchase. Find-or-create the Clerk + Prisma account behind the email a buyer paid with. |
| `sync.ts` | The webhook's writer: upserts the `Subscription` mirror row and recomputes the user's entitlement. Idempotent. |
| `../../app/api/webhooks/stripe/route.ts` | Signature-verified webhook receiver. |

## Currency, tax, pricing (locked — see project_business_model)

- Monthly **£10.99 / $14.99**, annual **£109.99 / $149.99** ("2 months free").
- Currency: GBP for the UK, USD everywhere else (Cloudflare `cf-ipcountry`), with
  a remembered manual switcher on `/premium`. The chosen currency is passed into
  checkout, which picks the matching price id (and so the charge currency).
- Stripe Tax: product tax code = "Electronically Supplied Services". **GBP prices
  are tax-inclusive** (all-in, VAT absorbed when we register), **USD prices are
  exclusive** (US sales tax added on top at checkout). `automatic_tax` is on.

## Guest checkout + account-on-purchase

Buyers are **not** forced to create an account first (forced sign-up-first loses
~26% of buyers). Anonymous buyers go straight to Stripe Checkout, which collects
their email; `checkout.session.completed` then runs `provisionAccountForCheckout`:

1. existing Prisma user by email → link the Stripe customer
2. existing user by `stripeCustomerId` → done
3. existing Clerk user by email → create the Prisma mirror row
4. nobody → create a passwordless Clerk user, then the Prisma row

The buyer accesses their new account by signing in with that email (Clerk email
code — no password). Signed-in buyers reuse their linked customer. Account
creation here bypasses the pre-launch signup allowlist on purpose (a paying
customer is entitled to an account, and checkout itself is gated by
`CHECKOUT_ENABLED`).

## Webhook events handled

- `checkout.session.completed` — provision/link the account, grant premium
- `customer.subscription.created|updated|deleted` — mirror + recompute entitlement
- `invoice.payment_failed` — resync (→ past_due keeps premium through the grace window)
- `invoice.paid` — resync (→ active restores access)

All idempotent (upsert on `stripeSubscriptionId`; entitlement recomputed each time).

## Failed payments

Code keeps a member in premium for `PAYMENT_GRACE_DAYS` (7) past a failure so a
card blip never cuts someone off mid-project; access drops only when Stripe
reports the subscription `canceled`/`unpaid` past the window. **Stripe Smart
Retries + dunning emails are a Dashboard setting** (Billing → Revenue recovery)
to switch on at go-live — they're account config, not code.

## Continuity safeguards (project_business_model)

1. **Own all billing state in our DB.** ✅ Built. The `Subscription` table mirrors
   every Stripe subscription; `User.premiumActive/premiumSince/premiumUntil` are
   derived from it by the webhook. A Stripe outage never loses who is a member or
   their renewal date.
2. **PCI vault-export / migration path.** *Readiness note, not built.* Stripe can
   export card data to a PCI-compliant processor via its
   [data-migration process](https://stripe.com/docs/security/data-migrations) —
   a support-gated, compliance-reviewed transfer. If we ever move processors,
   request this rather than trying to re-collect cards. Nothing to build now;
   our own subscriber/renewal state (safeguard #1) is already portable.
3. **Dormant backup processor.** *Readiness note, not built.* Keep a Braintree /
   PayPal merchant account creatable-on-demand so a Stripe suspension isn't
   existential. Because entitlement is derived from our own DB, swapping the
   charging layer doesn't touch the access layer. Revisit alongside Stripe
   Connect (creator payouts / Gifts / marketplace). Paddle (merchant-of-record)
   is the parked alternative if global tax burden grows.

## Running it in the sandbox

```bash
# 1. Create the sandbox product + 4 prices, persist STRIPE_PRICE_*_TEST to .env.credentials
pnpm --filter @homemade/web exec tsx scripts/stripe-create-sandbox-prices.ts

# 2. Pure logic checks (no network)
pnpm --filter @homemade/web exec tsx scripts/stripe-test-logic.ts

# 3. Live sandbox checks: checkout sessions, tax behaviour, subscription lifecycle, signature verify
pnpm --filter @homemade/web exec tsx scripts/stripe-verify-sandbox.ts

# 4. End-to-end webhook→DB sync (throwaway user, real DB + sandbox; needs --conditions=react-server for the server-only import)
NODE_OPTIONS="--conditions=react-server" pnpm --filter @homemade/web exec tsx scripts/stripe-verify-db-sync.ts
```

To exercise the full browser flow locally: set `CHECKOUT_ENABLED=true` and
`STRIPE_MODE=test`, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`,
put the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`, then subscribe on
`/premium` with test card `4242 4242 4242 4242`.

## Go-live sequence (separate launch step — do NOT do in this build)

1. Create the LIVE webhook endpoint at
   `https://homemade.education/api/webhooks/stripe` (events listed above); copy
   its signing secret.
2. Put the LIVE secrets in AWS Secrets Manager and wire them into the ECS task in
   `infra/lib/homemade-stack.ts` (mirror the existing two-step IAM-grant-then-
   mount pattern): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, the four
   `STRIPE_PRICE_*` ids, and env `STRIPE_MODE=live`. The publishable key is
   public.
3. Turn on Stripe Smart Retries + dunning emails in the Dashboard.
4. Flip `CHECKOUT_ENABLED=true` in the ECS task env.
5. Gate all of the above on the premium platform features being live.
