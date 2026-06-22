import 'server-only'
import type Stripe from 'stripe'
import { prisma } from '@homemade/db'
import { lookupPlanCurrency } from './config'
import { computeEntitlement, readCurrentPeriodEnd } from './entitlement'

/** The price id on the (single) line of a subscription. */
function readPriceId(sub: Stripe.Subscription): string | null {
  return sub.items?.data?.[0]?.price?.id ?? null
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
): Promise<string | null> {
  const stripeCustomerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const priceId = readPriceId(sub)
  const currentPeriodEnd = readCurrentPeriodEnd(sub)
  const labels = priceId ? lookupPlanCurrency(priceId) : null

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
    select: { premiumSince: true },
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumActive: ent.premiumActive,
      premiumUntil: ent.premiumUntil,
      // Stamp the first time premium is ever granted; never overwrite it.
      ...(ent.premiumActive && !current?.premiumSince
        ? { premiumSince: new Date() }
        : {}),
    },
  })

  return userId
}

/**
 * Retrieve a subscription by id (with the price expanded) and sync it. Used by
 * the invoice.* handlers, which only carry a subscription id.
 */
export async function syncSubscriptionById(
  stripe: Stripe,
  subscriptionId: string,
): Promise<string | null> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  return syncSubscription(stripe, sub)
}
