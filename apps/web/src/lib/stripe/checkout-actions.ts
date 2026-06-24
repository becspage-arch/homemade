'use server'

import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { siteOrigin } from '@/lib/seo/site-url'
import { capturePremiumServerEvent } from '@/lib/posthog'
import { getStripe } from './client'
import {
  checkoutEnabled,
  isCurrency,
  isPlan,
  resolvePriceId,
  PRICE_DISPLAY,
  type Currency,
  type Plan,
} from './config'

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

/**
 * Origin for success / cancel URLs. Prefer the actual request origin (so the
 * sandbox flow works on localhost) and fall back to the canonical site origin.
 */
async function requestOrigin(): Promise<string> {
  try {
    const h = await headers()
    const origin = h.get('origin')
    if (origin) return origin.replace(/\/$/, '')
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') ?? 'https'
    if (host) return `${proto}://${host}`
  } catch {
    // headers() unavailable — fall through.
  }
  return siteOrigin()
}

/**
 * Create a Stripe Checkout Session for a premium subscription and return its
 * hosted URL. The whole purchase path is gated behind CHECKOUT_ENABLED (off in
 * production), so this refuses to do anything until the flag is on.
 *
 * Guest checkout is the default: an anonymous buyer is sent straight to Stripe,
 * which collects their email; the webhook provisions their account afterward
 * (see provision.ts). A signed-in user is prefilled / reuses their customer.
 */
export async function createCheckoutSession(input: {
  plan: Plan
  currency: Currency
}): Promise<CheckoutResult> {
  if (!checkoutEnabled()) {
    return { ok: false, error: 'Checkout is not open yet.' }
  }
  if (!isPlan(input.plan) || !isCurrency(input.currency)) {
    return { ok: false, error: 'Pick a plan and currency.' }
  }

  try {
    const stripe = getStripe()
    const priceId = resolvePriceId(input.plan, input.currency)
    const origin = await requestOrigin()
    const user = await getCurrentDbUser() // null for a guest — that's fine

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // Stripe Tax: inclusive for GBP, added on top for USD per the product's
      // tax behaviour configured in the dashboard. Needs the customer address,
      // which Checkout collects.
      automatic_tax: { enabled: true },
      // Let businesses enter a VAT/Tax id so B2B invoices are correct.
      tax_id_collection: { enabled: true },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      // Required recurring-charge disclosure also shows on the hosted page;
      // mirrors the "Renews automatically. Cancel anytime." line on /premium.
      // Signed-in: reuse the linked customer, or prefill their email.
      ...(user?.stripeCustomerId
        ? {
            customer: user.stripeCustomerId,
            // Let Stripe Tax update the saved customer's address at checkout.
            customer_update: { address: 'auto', name: 'auto' },
          }
        : user?.email
          ? { customer_email: user.email }
          : {}),
      subscription_data: {
        metadata: { homemadeUserId: user?.id ?? '' },
      },
      metadata: {
        homemadeUserId: user?.id ?? '',
        plan: input.plan,
        currency: input.currency,
      },
      success_url: `${origin}/premium/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?checkout=cancelled`,
    })

    if (!session.url) {
      return { ok: false, error: 'Could not start checkout. Please try again.' }
    }

    // Top of the revenue funnel — fired server-side so it can't be ad-blocked.
    try {
      await capturePremiumServerEvent({
        event: 'checkout_started',
        distinctId: user?.clerkId ?? 'anonymous',
        properties: {
          plan: input.plan,
          currency: input.currency,
          priceGbpOrUsd: PRICE_DISPLAY[input.currency][input.plan],
          signedIn: Boolean(user),
        },
      })
    } catch {
      // analytics must never block a purchase
    }

    return { ok: true, url: session.url }
  } catch (err) {
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'stripe.createCheckoutSession' },
    })
    return { ok: false, error: 'Could not start checkout. Please try again.' }
  }
}

/**
 * Create a Stripe Customer Portal session for the signed-in premium user and
 * return its URL. The portal is where cancellation / card update / plan change
 * happen — self-serve, as easy as signing up. Returns an error if the user has
 * no linked Stripe customer yet.
 */
export async function createPortalSession(): Promise<CheckoutResult> {
  try {
    const user = await getCurrentDbUser()
    if (!user) return { ok: false, error: 'Please sign in.' }
    if (!user.stripeCustomerId) {
      return { ok: false, error: 'No subscription to manage yet.' }
    }
    const stripe = getStripe()
    const origin = await requestOrigin()
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/me/settings`,
    })
    try {
      await capturePremiumServerEvent({
        event: 'billing_portal_opened',
        distinctId: user.clerkId,
        properties: {},
      })
    } catch {
      // never block the portal redirect on analytics
    }
    return { ok: true, url: session.url }
  } catch (err) {
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'stripe.createPortalSession' },
    })
    return { ok: false, error: 'Could not open the billing portal.' }
  }
}
