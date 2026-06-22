import { headers } from 'next/headers'
import type Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@homemade/db'
import { getStripe } from '@/lib/stripe/client'
import { provisionAccountForCheckout } from '@/lib/stripe/provision'
import { syncSubscription, syncSubscriptionById } from '@/lib/stripe/sync'

/**
 * Stripe webhook receiver — the ONLY writer of our billing state, so we own who
 * is a member + their renewal date in our own DB (continuity safeguard #1).
 *
 * Events handled:
 *   checkout.session.completed          → provision/link the account, grant premium
 *   customer.subscription.created       → mirror + recompute entitlement
 *   customer.subscription.updated       → mirror + recompute (cancel-at-period-end,
 *                                          plan change, status change)
 *   customer.subscription.deleted       → mirror canceled status → drop premium
 *   invoice.payment_failed              → resync (status→past_due keeps grace access)
 *   invoice.paid                        → resync (status→active restores access)
 *
 * Everything is idempotent (upsert on stripeSubscriptionId, entitlement
 * recomputed each time) because Stripe retries and can deliver out of order.
 *
 * To wire up (sandbox): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 * prints a whsec_… signing secret → set STRIPE_WEBHOOK_SECRET. For production,
 * create the endpoint in the Stripe dashboard at
 * https://homemade.education/api/webhooks/stripe and copy its signing secret.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: 'webhook not configured' }, { status: 503 })
  }

  const sig = (await headers()).get('stripe-signature')
  if (!sig) {
    return Response.json({ error: 'missing signature' }, { status: 400 })
  }

  const body = await req.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('stripe webhook signature verification failed', err)
    return Response.json({ error: 'bad signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(stripe, event.data.object)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(stripe, event.data.object)
        break
      }
      case 'invoice.payment_failed':
      case 'invoice.paid': {
        const subId = extractSubscriptionId(event.data.object)
        if (subId) await syncSubscriptionById(stripe, subId)
        break
      }
      default:
        // Acknowledge unhandled events so Stripe stops retrying them.
        return Response.json({ ok: true, ignored: event.type })
    }
  } catch (err) {
    console.error('stripe webhook handler error', { type: event.type, err })
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'stripe.webhook', eventType: event.type },
    })
    // 500 → Stripe retries with backoff. Our handlers are idempotent, so a
    // retry after a transient failure is safe.
    return Response.json({ error: 'handler failed' }, { status: 500 })
  }

  return Response.json({ ok: true, type: event.type })
}

/**
 * checkout.session.completed: make sure the buyer has a real account behind the
 * email they paid with, link the Stripe customer, then sync the subscription to
 * grant premium. Handles guest checkout (account-on-purchase) and signed-in
 * upgrades alike.
 */
async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  // Subscriptions only — ignore any future one-off payment sessions.
  if (session.mode !== 'subscription') return

  const stripeCustomerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer?.id ?? null)
  const email =
    session.customer_details?.email ?? session.customer_email ?? null
  const homemadeUserId = session.metadata?.homemadeUserId || null

  let userId: string | null = null

  // Prefer the user stamped at checkout (signed-in buyer).
  if (homemadeUserId) {
    const byId = await prisma.user.findUnique({ where: { id: homemadeUserId } })
    if (byId) {
      userId = byId.id
      if (!byId.stripeCustomerId && stripeCustomerId) {
        await prisma.user.update({
          where: { id: byId.id },
          data: { stripeCustomerId },
        })
      }
    }
  }

  // Guest checkout: provision/link by the email Stripe collected.
  if (!userId && email && stripeCustomerId) {
    const user = await provisionAccountForCheckout({ email, stripeCustomerId })
    userId = user.id
  }

  // Sync the subscription this session created so entitlement is granted.
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription?.id ?? null)
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    await syncSubscription(stripe, sub, { knownUserId: userId ?? undefined })
  }
}

/** Pull the subscription id off an invoice object, defensive across versions. */
function extractSubscriptionId(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as { subscription?: string | { id: string } | null })
    .subscription
  if (typeof direct === 'string') return direct
  if (direct && typeof direct === 'object') return direct.id
  // Newer API: the subscription reference lives on the invoice line's parent.
  const line = invoice.lines?.data?.[0] as
    | { subscription?: string | null; parent?: { subscription_item_details?: { subscription?: string | null } } }
    | undefined
  if (line?.subscription) return line.subscription
  const nested = line?.parent?.subscription_item_details?.subscription
  return nested ?? null
}
