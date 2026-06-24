/**
 * End-to-end webhook→DB sync verification against the real DB + Stripe sandbox.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/stripe-verify-db-sync.ts
 *
 * Proves continuity safeguard #1: a Stripe subscription drives our own billing
 * state. Creates a throwaway User pre-linked to a sandbox Stripe customer (so
 * the resolver matches by stripeCustomerId and never touches Clerk), runs the
 * real syncSubscription used by the webhook, and asserts:
 *   - active subscription → User.premiumActive true, premiumSince stamped, a
 *     Subscription mirror row with the right plan/currency/status
 *   - canceled subscription → User.premiumActive false
 * Cleans up the User, mirror rows and Stripe customer afterward.
 */
import Stripe from 'stripe'
import { prisma } from '@homemade/db'
import { loadEnvCredentials } from './_env-credentials'
import { resolvePriceId } from '../src/lib/stripe/config'
import { syncSubscription } from '../src/lib/stripe/sync'

loadEnvCredentials()
process.env.STRIPE_MODE = 'test'

let failures = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`  ok   ${name}${detail ? ` — ${detail}` : ''}`)
  else {
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
    failures++
  }
}

const STAMP = `dbsync-${Date.now()}`

async function main() {
  const key = process.env.STRIPE_SECRET_KEY_TEST
  if (!key?.startsWith('sk_test')) throw new Error('STRIPE_SECRET_KEY_TEST missing/not a test key')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing')
  const stripe = new Stripe(key)

  // ── Stripe sandbox subscription ──
  const customer = await stripe.customers.create({
    email: `${STAMP}@sandbox.homemade.education`,
    name: 'DB Sync Verify',
    address: { country: 'GB', postal_code: 'SW1A 1AA', line1: '10 Downing St' },
  })
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id })
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: pm.id },
  })
  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: resolvePriceId('monthly', 'GBP') }],
    default_payment_method: pm.id,
  })

  // ── Throwaway user, pre-linked to the Stripe customer ──
  const user = await prisma.user.create({
    data: {
      clerkId: `test_${STAMP}`,
      email: `${STAMP}@sandbox.homemade.education`,
      stripeCustomerId: customer.id,
    },
  })

  try {
    // ── Sync the active subscription ──
    console.log('Sync active subscription')
    const resolved = await syncSubscription(stripe, sub)
    check('resolved to our user', resolved?.userId === user.id)

    const afterActive = await prisma.user.findUnique({ where: { id: user.id } })
    check('premiumActive = true', afterActive?.premiumActive === true)
    check('premiumSince stamped', afterActive?.premiumSince instanceof Date)
    check('premiumUntil in the future', !!afterActive?.premiumUntil && afterActive.premiumUntil.getTime() > Date.now())

    const mirror = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
    })
    check('mirror row created', !!mirror)
    check('mirror status active', mirror?.status === 'active')
    check('mirror plan monthly', mirror?.plan === 'monthly')
    check('mirror currency gbp', mirror?.currency === 'gbp')
    check('mirror linked to user', mirror?.userId === user.id)

    // ── Cancel + resync ──
    console.log('Sync canceled subscription')
    const canceled = await stripe.subscriptions.cancel(sub.id)
    await syncSubscription(stripe, canceled)
    const afterCancel = await prisma.user.findUnique({ where: { id: user.id } })
    check('premiumActive = false after cancel', afterCancel?.premiumActive === false)
    const mirror2 = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
    })
    check('mirror status canceled', mirror2?.status === 'canceled')
  } finally {
    // ── Cleanup ──
    console.log('Cleanup')
    await prisma.subscription.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
    await stripe.customers.del(customer.id).catch(() => {})
    await prisma.$disconnect()
    console.log('  removed throwaway user + mirror rows + sandbox customer')
  }

  console.log('')
  if (failures > 0) {
    console.error(`${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('All DB-sync checks passed.')
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
