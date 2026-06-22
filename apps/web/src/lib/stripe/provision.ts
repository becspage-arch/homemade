import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { prisma, UserRole, type User } from '@homemade/db'

/**
 * Guest checkout + account-on-purchase.
 *
 * Best practice for conversion is to NOT force account creation before payment
 * (forced sign-up-first loses ~26% of buyers — see project_premium_free_spec).
 * Stripe Checkout collects the buyer's email; this runs on
 * checkout.session.completed to make sure there's a real, signed-in-able
 * account behind that email and link it to the Stripe customer.
 *
 * Resolution order (all idempotent — the webhook retries + can arrive twice):
 *   1. existing Prisma User by email          → link Stripe customer, done
 *   2. existing Prisma User by stripeCustomerId (email changed) → done
 *   3. existing Clerk user by email            → create the Prisma mirror row
 *   4. no account anywhere                     → create the Clerk user
 *      (passwordless; the buyer signs in later with an email code), then the
 *      Prisma row
 *
 * Account creation here BYPASSES the pre-launch signup allowlist on purpose: a
 * paying customer is entitled to an account by definition, and checkout itself
 * is gated behind CHECKOUT_ENABLED (off in production until launch), so this
 * can't be used to sneak past the allowlist while signups are closed.
 */
const ADMIN_EMAILS = new Set(['rebecca@homemade.education'])

function deriveRole(email: string): UserRole {
  return ADMIN_EMAILS.has(email.toLowerCase()) ? UserRole.ADMIN : UserRole.MEMBER
}

export async function provisionAccountForCheckout(input: {
  email: string
  stripeCustomerId: string
}): Promise<User> {
  const email = input.email.toLowerCase()
  const { stripeCustomerId } = input

  // 1. Existing Prisma user by email — the common case (signed-in buyer, or a
  //    free member upgrading). Link the Stripe customer if not already linked.
  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) {
    if (!byEmail.stripeCustomerId && stripeCustomerId) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { stripeCustomerId },
      })
    }
    return byEmail
  }

  // 2. Existing Prisma user already linked to this Stripe customer (their email
  //    changed in Stripe but we know the customer).
  const byCustomer = await prisma.user.findUnique({
    where: { stripeCustomerId },
  })
  if (byCustomer) return byCustomer

  // 3 + 4. No Prisma row yet — find or create the Clerk account, then mirror it.
  const cc = await clerkClient()
  let clerkId: string
  try {
    const existing = await cc.users.getUserList({ emailAddress: [email] })
    const found = existing.data[0]
    if (found) {
      clerkId = found.id
    } else {
      const created = await cc.users.createUser({
        emailAddress: [email],
        skipPasswordRequirement: true,
      })
      clerkId = created.id
    }
  } catch (err) {
    // If Clerk creation fails we still want the buyer to have premium — they
    // paid. Fall back to a Clerk-less mirror row is NOT possible (clerkId is
    // required + unique), so surface loudly and rethrow; the webhook returns
    // 500 and Stripe retries, by which point the transient Clerk error is
    // usually gone.
    Sentry.captureException(err, {
      level: 'error',
      tags: { source: 'stripe.provision.clerk' },
    })
    throw err
  }

  // Upsert on clerkId in case a JIT/webhook race already created the row.
  return prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      role: deriveRole(email),
      stripeCustomerId,
    },
    update: {
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
    },
  })
}
