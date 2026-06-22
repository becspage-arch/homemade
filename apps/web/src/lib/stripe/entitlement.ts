import type Stripe from 'stripe'
import { PAYMENT_GRACE_DAYS } from './config'

/**
 * Pure entitlement logic — no `server-only`, no DB, no Stripe SDK call — so it
 * can be unit-tested in isolation (scripts/test-stripe-logic.ts) and reused by
 * the webhook sync.
 *
 * This is the heart of continuity safeguard #1: premium access is DERIVED from
 * billing state we store ourselves, never read live from Stripe per request.
 *
 *   active / trialing → premium on, until the period end
 *   past_due / unpaid → premium STAYS on through a grace window so a card blip
 *                       or Smart-Retry cycle never cuts someone off mid-project
 *   paused            → premium off (Stripe pause = access paused)
 *   canceled / incomplete / incomplete_expired → premium off
 *
 * `premiumUntil` is honoured by hasPremium(): once it's in the past the user is
 * treated as lapsed even if `premiumActive` wasn't flipped yet.
 */
export interface EntitlementInput {
  status: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export interface Entitlement {
  premiumActive: boolean
  premiumUntil: Date | null
}

export function computeEntitlement(
  input: EntitlementInput,
  opts: { graceDays?: number; now?: Date } = {},
): Entitlement {
  const now = opts.now ?? new Date()
  const graceDays = opts.graceDays ?? PAYMENT_GRACE_DAYS
  const { status, currentPeriodEnd } = input

  switch (status) {
    case 'active':
    case 'trialing':
      return { premiumActive: true, premiumUntil: currentPeriodEnd }

    case 'past_due':
    case 'unpaid': {
      // Dunning grace: keep access until the later of the paid-through date and
      // now + graceDays, so retries have time to land before access drops.
      const graceEnd = new Date(now.getTime() + graceDays * 24 * 60 * 60 * 1000)
      const until =
        currentPeriodEnd && currentPeriodEnd.getTime() > graceEnd.getTime()
          ? currentPeriodEnd
          : graceEnd
      return { premiumActive: true, premiumUntil: until }
    }

    case 'paused':
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    default:
      return { premiumActive: false, premiumUntil: currentPeriodEnd }
  }
}

/**
 * Read the period-end off a Stripe subscription, defensive across API
 * versions: newer versions moved `current_period_end` from the top level onto
 * each subscription item. Returns a Date or null.
 */
export function readCurrentPeriodEnd(sub: Stripe.Subscription): Date | null {
  const top = (sub as unknown as { current_period_end?: number | null })
    .current_period_end
  const item = sub.items?.data?.[0] as
    | { current_period_end?: number | null }
    | undefined
  const unix = top ?? item?.current_period_end ?? null
  return unix ? new Date(unix * 1000) : null
}
