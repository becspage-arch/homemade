/**
 * Stripe configuration — pure, env-driven, mode-aware. No `stripe` import, no
 * `server-only` guard, so this can be imported from server components, route
 * handlers, server actions and (for the small pieces that don't read secrets)
 * shared with the UI layer via props.
 *
 * The one rule everything here enforces: TEST and LIVE never cross. The mode is
 * fixed per process by `STRIPE_MODE` (default `test`), and every secret + price
 * id is resolved through that mode so the same code path runs in the sandbox and
 * in production without a branch at each call site.
 */

export type StripeMode = 'test' | 'live'
export type Plan = 'monthly' | 'annual'
export type Currency = 'GBP' | 'USD'

export const PLANS: readonly Plan[] = ['monthly', 'annual'] as const
export const CURRENCIES: readonly Currency[] = ['GBP', 'USD'] as const

/**
 * Which Stripe account this process talks to. Defaults to `test` so a missing
 * env var can never accidentally point a build at the live account.
 */
export function stripeMode(): StripeMode {
  return process.env.STRIPE_MODE === 'live' ? 'live' : 'test'
}

/**
 * Master kill-switch for the whole purchase path. Default OFF — the only values
 * that turn checkout on are the explicit strings `true` / `1`. Stays OFF in
 * production until launch day; flipping it on (locally, or in the ECS task env
 * for a staged test) lights up the full sandbox flow.
 */
export function checkoutEnabled(): boolean {
  const v = process.env.CHECKOUT_ENABLED
  return v === 'true' || v === '1'
}

/**
 * Display prices (locked in the business model; mirror of the /premium page).
 * Stripe owns the authoritative amount on each Price object — these are for
 * sanity-checking and any server-rendered figure that shouldn't round-trip to
 * Stripe just to show a number.
 */
export const PRICE_DISPLAY: Record<Currency, Record<Plan, number>> = {
  GBP: { monthly: 10.99, annual: 109.99 },
  USD: { monthly: 14.99, annual: 149.99 },
}

/** Narrowing helpers for untrusted input (a client-supplied plan/currency). */
export function isPlan(v: unknown): v is Plan {
  return v === 'monthly' || v === 'annual'
}
export function isCurrency(v: unknown): v is Currency {
  return v === 'GBP' || v === 'USD'
}

/**
 * The env var name that holds the price id for a (mode, plan, currency).
 *
 *   live  → STRIPE_PRICE_MONTHLY_GBP        (the LIVE ids already in .env)
 *   test  → STRIPE_PRICE_MONTHLY_GBP_TEST   (created by the sandbox-prices script)
 */
export function priceEnvKey(plan: Plan, currency: Currency, mode = stripeMode()): string {
  const base = `STRIPE_PRICE_${plan.toUpperCase()}_${currency}`
  return mode === 'test' ? `${base}_TEST` : base
}

/**
 * Resolve the Stripe price id for the chosen plan + currency in the active
 * mode. Throws (loudly, server-side) if the env var is missing — better a 500
 * than silently charging the wrong price or the wrong account.
 */
export function resolvePriceId(plan: Plan, currency: Currency): string {
  const key = priceEnvKey(plan, currency)
  const id = process.env[key]
  if (!id) {
    throw new Error(`Missing Stripe price id env var ${key} (mode=${stripeMode()})`)
  }
  return id
}

/**
 * Reverse lookup: given a Stripe price id (off a subscription item), work out
 * which plan + currency it is so the webhook can label the Subscription row and
 * analytics doesn't have to re-derive it. Checks the active mode's env vars.
 * Returns null for an unrecognised id (e.g. a legacy price) rather than guessing.
 */
export function lookupPlanCurrency(
  priceId: string,
): { plan: Plan; currency: Currency } | null {
  for (const plan of PLANS) {
    for (const currency of CURRENCIES) {
      const key = priceEnvKey(plan, currency)
      if (process.env[key] && process.env[key] === priceId) {
        return { plan, currency }
      }
    }
  }
  return null
}

/**
 * Grace window (days) before a failed-payment subscription loses premium
 * access. Stripe Smart Retries run dunning over several days; we keep the
 * member in premium for at least this long past the failure so a card blip
 * never cuts someone off mid-project. See `computeEntitlement` in sync.ts.
 */
export const PAYMENT_GRACE_DAYS = 7
