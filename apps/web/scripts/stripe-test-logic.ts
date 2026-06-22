/**
 * Pure-logic checks for the Stripe layer — no network, no DB.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/stripe-test-logic.ts
 *
 * Covers price-id resolution (mode + plan + currency), the reverse lookup the
 * webhook uses to label rows, and the entitlement state machine including the
 * failed-payment grace window. Exits non-zero on the first failure.
 */
import { loadEnvCredentials } from './_env-credentials'
import {
  priceEnvKey,
  resolvePriceId,
  lookupPlanCurrency,
} from '../src/lib/stripe/config'
import { computeEntitlement } from '../src/lib/stripe/entitlement'

loadEnvCredentials()
process.env.STRIPE_MODE = 'test'

let failures = 0
function check(name: string, cond: boolean) {
  if (cond) {
    console.log(`  ok   ${name}`)
  } else {
    console.error(`  FAIL ${name}`)
    failures++
  }
}

console.log('Price env key naming')
check('test monthly gbp', priceEnvKey('monthly', 'GBP', 'test') === 'STRIPE_PRICE_MONTHLY_GBP_TEST')
check('live annual usd', priceEnvKey('annual', 'USD', 'live') === 'STRIPE_PRICE_ANNUAL_USD')

console.log('Price resolution (test mode)')
const monthlyGbp = resolvePriceId('monthly', 'GBP')
const annualUsd = resolvePriceId('annual', 'USD')
check('monthly gbp resolves to a test price id', monthlyGbp.startsWith('price_'))
check('annual usd resolves to a test price id', annualUsd.startsWith('price_'))
check('different plan/currency → different id', monthlyGbp !== annualUsd)

console.log('Reverse lookup')
const rl = lookupPlanCurrency(monthlyGbp)
check('monthly gbp reverse-maps', rl?.plan === 'monthly' && rl?.currency === 'GBP')
check('unknown price id → null', lookupPlanCurrency('price_does_not_exist') === null)

console.log('Entitlement state machine')
const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

let e = computeEntitlement({ status: 'active', currentPeriodEnd: future, cancelAtPeriodEnd: false })
check('active → premium on, until period end', e.premiumActive && e.premiumUntil?.getTime() === future.getTime())

e = computeEntitlement({ status: 'trialing', currentPeriodEnd: future, cancelAtPeriodEnd: false })
check('trialing → premium on', e.premiumActive)

e = computeEntitlement({ status: 'past_due', currentPeriodEnd: past, cancelAtPeriodEnd: false }, { graceDays: 7, now: new Date() })
check('past_due → premium STAYS on (grace)', e.premiumActive)
check('past_due → premiumUntil pushed ~7d out', !!e.premiumUntil && e.premiumUntil.getTime() > Date.now() + 6 * 24 * 60 * 60 * 1000)

e = computeEntitlement({ status: 'past_due', currentPeriodEnd: future, cancelAtPeriodEnd: false })
check('past_due with future period → keeps the later future date', e.premiumActive && e.premiumUntil?.getTime() === future.getTime())

e = computeEntitlement({ status: 'canceled', currentPeriodEnd: past, cancelAtPeriodEnd: true })
check('canceled → premium off', !e.premiumActive)

e = computeEntitlement({ status: 'paused', currentPeriodEnd: future, cancelAtPeriodEnd: false })
check('paused → premium off', !e.premiumActive)

e = computeEntitlement({ status: 'incomplete', currentPeriodEnd: null, cancelAtPeriodEnd: false })
check('incomplete → premium off', !e.premiumActive)

console.log('')
if (failures > 0) {
  console.error(`${failures} check(s) failed.`)
  process.exit(1)
}
console.log('All logic checks passed.')
