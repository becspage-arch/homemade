/**
 * Live sandbox verification against the Stripe TEST account — no DB.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/stripe-verify-sandbox.ts
 *
 * Exercises the real Stripe surfaces the app uses and cleans up after itself:
 *   1. Checkout Session creation for all 4 plan/currency combos (subscription
 *      mode, automatic_tax on) — proves price ids + tax + currency.
 *   2. Price tax_behavior: GBP inclusive, USD exclusive (the locked decision).
 *   3. Subscription lifecycle with a test card → active → entitlement on;
 *      cancel-at-period-end → still active until period end.
 *   4. Webhook signature verification via a generated test header (the exact
 *      path the /api/webhooks/stripe route uses).
 *
 * Exits non-zero on the first failure.
 */
import Stripe from 'stripe'
import { loadEnvCredentials } from './_env-credentials'
import { resolvePriceId } from '../src/lib/stripe/config'
import { computeEntitlement, readCurrentPeriodEnd } from '../src/lib/stripe/entitlement'

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

async function main() {
  const key = process.env.STRIPE_SECRET_KEY_TEST
  if (!key?.startsWith('sk_test')) throw new Error('STRIPE_SECRET_KEY_TEST missing/not a test key')
  const stripe = new Stripe(key)

  // ── 1. Checkout sessions for all 4 combos ──
  console.log('Checkout sessions (subscription mode, automatic_tax on)')
  const combos = [
    { plan: 'monthly', currency: 'GBP' },
    { plan: 'annual', currency: 'GBP' },
    { plan: 'monthly', currency: 'USD' },
    { plan: 'annual', currency: 'USD' },
  ] as const
  for (const { plan, currency } of combos) {
    const priceId = resolvePriceId(plan, currency)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: 'auto',
      success_url: 'https://homemade.education/premium/welcome?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://homemade.education/premium?checkout=cancelled',
    })
    const okUrl = Boolean(session.url)
    const okCur = (session.currency ?? '').toLowerCase() === currency.toLowerCase()
    const okTax = session.automatic_tax?.enabled === true
    check(`${plan}/${currency}`, okUrl && okCur && okTax, `url=${okUrl} currency=${session.currency} tax=${okTax}`)
  }

  // ── 2. Price tax behaviour ──
  console.log('Price tax behaviour (GBP inclusive, USD on top)')
  const gbp = await stripe.prices.retrieve(resolvePriceId('monthly', 'GBP'))
  const usd = await stripe.prices.retrieve(resolvePriceId('monthly', 'USD'))
  check('GBP monthly is inclusive', gbp.tax_behavior === 'inclusive', `behavior=${gbp.tax_behavior}`)
  check('USD monthly is exclusive', usd.tax_behavior === 'exclusive', `behavior=${usd.tax_behavior}`)
  check('GBP amount = 1099', gbp.unit_amount === 1099)
  check('USD amount = 1499', usd.unit_amount === 1499)

  // ── 3. Subscription lifecycle ──
  console.log('Subscription lifecycle (test card → active → cancel-at-period-end)')
  const customer = await stripe.customers.create({
    email: 'sandbox-verify@homemade.education',
    name: 'Sandbox Verify',
    address: { country: 'GB', postal_code: 'SW1A 1AA', line1: '10 Downing St' },
  })
  // Attach the shared test PaymentMethod (returns a fresh pm_ id) and default it.
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id })
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: pm.id },
  })
  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: resolvePriceId('monthly', 'GBP') }],
    default_payment_method: pm.id,
    metadata: { homemadeUserId: 'sandbox-test' },
  })
  check('subscription active', sub.status === 'active', `status=${sub.status}`)
  const periodEnd = readCurrentPeriodEnd(sub)
  check('period end resolved', periodEnd instanceof Date && periodEnd.getTime() > Date.now())
  const ent = computeEntitlement({
    status: sub.status,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })
  check('entitlement → premium on', ent.premiumActive)

  // Cancel at period end (what the Customer Portal does).
  const canceled = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
  check('cancel_at_period_end set', canceled.cancel_at_period_end === true)
  const entAfter = computeEntitlement({
    status: canceled.status,
    currentPeriodEnd: readCurrentPeriodEnd(canceled),
    cancelAtPeriodEnd: canceled.cancel_at_period_end,
  })
  check('still premium until period end after scheduling cancel', entAfter.premiumActive)

  // ── 4. Webhook signature verification ──
  console.log('Webhook signature verification')
  const secret = 'whsec_test_' + 'x'.repeat(24)
  const payload = JSON.stringify({ id: 'evt_test', object: 'event', type: 'customer.subscription.updated', data: { object: canceled } })
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret })
  let verified = false
  try {
    const evt = stripe.webhooks.constructEvent(payload, header, secret)
    verified = evt.type === 'customer.subscription.updated'
  } catch {
    verified = false
  }
  check('valid signature accepted', verified)
  let rejected = false
  try {
    stripe.webhooks.constructEvent(payload, 't=1,v1=deadbeef', secret)
  } catch {
    rejected = true
  }
  check('bad signature rejected', rejected)

  // ── Cleanup ──
  console.log('Cleanup')
  await stripe.subscriptions.cancel(sub.id).catch(() => {})
  await stripe.customers.del(customer.id).catch(() => {})
  console.log('  cleaned up sandbox customer + subscription')

  console.log('')
  if (failures > 0) {
    console.error(`${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('All sandbox checks passed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
