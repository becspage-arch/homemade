import 'server-only'
import type Stripe from 'stripe'
import { prisma } from '@homemade/db'
import { lookupPlanCurrency, type Currency, type Plan } from './config'
import { computeEntitlement, readCurrentPeriodEnd } from './entitlement'
import { capturePremiumServerEvent } from '@/lib/posthog'
import type { PosthogEvent } from '@/lib/analytics-events'

/** The price id on the (single) line of a subscription. */
function readPriceId(sub: Stripe.Subscription): string | null {
  return sub.items?.data?.[0]?.price?.id ?? null
}

/** The recurring amount on a subscription, normalised to a monthly figure. */
function readRecurring(sub: Stripe.Subscription): {
  unitAmount: number | null
  currency: string | null
  interval: string | null
  mrrApprox: number | null
} {
  const price = sub.items?.data?.[0]?.price
  const unitAmount = typeof price?.unit_amount === 'number' ? price.unit_amount / 100 : null
  const interval = price?.recurring?.interval ?? null
  const mrrApprox =
    unitAmount == null ? null : interval === 'year' ? +(unitAmount / 12).toFixed(2) : unitAmount
  return { unitAmount, currency: price?.currency ?? null, interval, mrrApprox }
}

/**
 * Outcome of a sync — returned so the webhook route can fire invoice-driven
 * events (renewal / dunning / refund) with the resolved Clerk distinctId.
 */
export interface SyncOutcome {
  userId: string
  clerkId: string
  status: string
  plan: Plan | null
  currency: Currency | null
}

/** Fire a revenue event first-party only (never to PostHog). Never throws. */
async function billingEvent(
  clerkId: string,
  event: PosthogEvent,
  properties: Record<string, unknown>,
): Promise<void> {
  try {
    await capturePremiumServerEvent({ event, distinctId: clerkId, properties })
  } catch {
    // analytics must never break the billing webhook
  }
}

/**
 * Upsert the Subscription mirror row for a Stripe subscription and recompute
 * the owning user's premium entitlement. Idempotent — safe to call for every
 * subscription.* and invoice.* event (webhooks retry + arrive out of order).
 *
 * Resolves the owning user in priority order:
 *   1. an explicit known user id (passed by the checkout-completed handler),
 *   2. subscription metadata.homemadeUserId (stamped at checkout),
 *   3. an existing User linked by stripeCustomerId,
 *   4. provision/link by the customer's email (guest checkout).
 *
 * Returns the resolved user id, or null if it couldn't resolve one (logged by
 * the caller — the event is still ack'd so Stripe doesn't hammer retries).
 */
export async function syncSubscription(
  stripe: Stripe,
  sub: Stripe.Subscription,
  opts: { knownUserId?: string } = {},
): Promise<SyncOutcome | null> {
  const stripeCustomerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const priceId = readPriceId(sub)
  const currentPeriodEnd = readCurrentPeriodEnd(sub)
  const labels = priceId ? lookupPlanCurrency(priceId) : null

  // Snapshot the prior mirror state so we can detect transitions for analytics.
  const prior = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    select: { status: true, stripePriceId: true, cancelAtPeriodEnd: true },
  })
  const previousStatus = prior?.status ?? null
  const previousPriceId = prior?.stripePriceId ?? null
  const previousCancelAtPeriodEnd = prior?.cancelAtPeriodEnd ?? false

  // Resolve the owning user.
  let userId = opts.knownUserId ?? null
  if (!userId) {
    const metaId = sub.metadata?.homemadeUserId
    if (metaId) {
      const byMeta = await prisma.user.findUnique({ where: { id: metaId } })
      if (byMeta) userId = byMeta.id
    }
  }
  if (!userId) {
    const byCustomer = await prisma.user.findUnique({
      where: { stripeCustomerId },
    })
    if (byCustomer) userId = byCustomer.id
  }
  if (!userId) {
    // Last resort: pull the email off the Stripe customer and provision/link.
    const customer = await stripe.customers.retrieve(stripeCustomerId)
    const email =
      !customer.deleted && 'email' in customer ? customer.email : null
    if (email) {
      // Lazy-load provisioning (it pulls in Clerk) only for this rare
      // safety-net branch — the checkout-completed handler usually provisions
      // up front, so the common subscription.* path stays Clerk-free.
      const { provisionAccountForCheckout } = await import('./provision')
      const user = await provisionAccountForCheckout({ email, stripeCustomerId })
      userId = user.id
    }
  }
  if (!userId) return null

  // Make sure the user is linked to this Stripe customer for the portal + reuse.
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId },
  })

  const canceledAt =
    sub.status === 'canceled' && sub.canceled_at
      ? new Date(sub.canceled_at * 1000)
      : null

  // Upsert the mirror row.
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      stripePriceId: priceId ?? '',
      status: sub.status,
      plan: labels?.plan ?? null,
      currency: labels?.currency.toLowerCase() ?? null,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt,
    },
    update: {
      stripeCustomerId,
      stripePriceId: priceId ?? '',
      status: sub.status,
      plan: labels?.plan ?? null,
      currency: labels?.currency.toLowerCase() ?? null,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt,
    },
  })

  // Recompute + persist entitlement.
  const ent = computeEntitlement({
    status: sub.status,
    currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { premiumSince: true, clerkId: true },
  })

  const becamePremiumFirstTime = ent.premiumActive && !current?.premiumSince

  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumActive: ent.premiumActive,
      premiumUntil: ent.premiumUntil,
      // Stamp the first time premium is ever granted; never overwrite it.
      ...(becamePremiumFirstTime ? { premiumSince: new Date() } : {}),
    },
  })

  // ---- Lifecycle analytics (first-party only; never throws) ----------------
  const clerkId = current?.clerkId ?? null
  if (clerkId) {
    const rec = readRecurring(sub)
    const money = {
      plan: labels?.plan ?? null,
      currency: rec.currency ?? labels?.currency.toLowerCase() ?? null,
      interval: rec.interval,
      unitAmount: rec.unitAmount,
      mrrApprox: rec.mrrApprox,
    }

    // First ever activation — exactly-once by the premiumSince stamp.
    if (becamePremiumFirstTime) {
      await billingEvent(clerkId, 'subscription_started', money)
    }
    // Hard cancellation (subscription ended).
    if (previousStatus !== 'canceled' && sub.status === 'canceled') {
      await billingEvent(clerkId, 'subscription_cancelled', {
        ...money,
        wasScheduled: previousCancelAtPeriodEnd,
      })
    }
    // Cancellation scheduled for period end (still active until then).
    if (!previousCancelAtPeriodEnd && sub.cancel_at_period_end && sub.status !== 'canceled') {
      await billingEvent(clerkId, 'subscription_cancellation_scheduled', {
        ...money,
        currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
      })
    }
    // Reactivation — un-scheduled a pending cancel, or revived a canceled sub.
    if (
      (previousCancelAtPeriodEnd && !sub.cancel_at_period_end && sub.status !== 'canceled') ||
      (previousStatus === 'canceled' && sub.status === 'active')
    ) {
      await billingEvent(clerkId, 'subscription_reactivated', money)
    }
    // Plan change (monthly <-> annual, or any price swap).
    if (previousPriceId && priceId && previousPriceId !== priceId) {
      await billingEvent(clerkId, 'subscription_plan_changed', {
        ...money,
        fromPriceId: previousPriceId,
        toPriceId: priceId,
      })
    }
  }

  return {
    userId,
    clerkId: clerkId ?? '',
    status: sub.status,
    plan: labels?.plan ?? null,
    currency: labels?.currency ?? null,
  }
}

/**
 * Retrieve a subscription by id (with the price expanded) and sync it. Used by
 * the invoice.* handlers, which only carry a subscription id.
 */
export async function syncSubscriptionById(
  stripe: Stripe,
  subscriptionId: string,
): Promise<SyncOutcome | null> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  return syncSubscription(stripe, sub)
}
