import 'server-only'
import Stripe from 'stripe'
import { stripeMode } from './config'

/**
 * Mode-aware Stripe client. Reads the TEST secret when `STRIPE_MODE=test`
 * (the sandbox account used for this whole build) and the LIVE secret when
 * `STRIPE_MODE=live`. Lazy + cached: the key is only read the first time a
 * Stripe call is actually made, so the app boots fine in production with no
 * Stripe env vars at all while CHECKOUT_ENABLED is off.
 *
 * `apiVersion` is intentionally omitted so the SDK uses the account's default
 * version — that keeps the pinned-version TS literal from drifting against the
 * installed SDK, and the webhook reads period/price fields defensively.
 */
let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const mode = stripeMode()
  const key =
    mode === 'test'
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      `Missing Stripe secret key for mode=${mode} (set ${
        mode === 'test' ? 'STRIPE_SECRET_KEY_TEST' : 'STRIPE_SECRET_KEY'
      }).`,
    )
  }
  cached = new Stripe(key)
  return cached
}
