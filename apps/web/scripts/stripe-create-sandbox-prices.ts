/**
 * Create (idempotently) the "Homemade Premium" product + the four prices in the
 * Stripe TEST/sandbox account, then persist their ids to .env.credentials as
 * STRIPE_PRICE_*_TEST so the app's mode-aware price resolver finds them.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/stripe-create-sandbox-prices.ts
 *
 * Mirrors the LIVE product set: monthly/annual × GBP/USD, with the locked
 * amounts and the tax behaviour from the business model — GBP inclusive, USD on
 * top (exclusive) — and the "Electronically Supplied Services" tax code.
 *
 * Idempotent: products + prices are matched by lookup_key / metadata, so
 * re-running reuses what already exists rather than creating duplicates.
 */
import Stripe from 'stripe'
import { loadEnvCredentials, upsertEnvCredentials } from './_env-credentials'

const PRODUCT_LOOKUP = 'homemade_premium'
// Stripe's standard tax code for digital / electronically supplied services.
const TAX_CODE_DIGITAL = 'txcd_10000000'

interface PriceSpec {
  lookupKey: string
  envKey: string
  currency: 'gbp' | 'usd'
  unitAmount: number // smallest currency unit
  interval: 'month' | 'year'
  taxBehavior: 'inclusive' | 'exclusive'
  nickname: string
}

// Amounts in the smallest unit. GBP inclusive (all-in price), USD exclusive
// (tax added on top at checkout).
const PRICES: PriceSpec[] = [
  { lookupKey: 'premium_monthly_gbp_test', envKey: 'STRIPE_PRICE_MONTHLY_GBP_TEST', currency: 'gbp', unitAmount: 1099, interval: 'month', taxBehavior: 'inclusive', nickname: 'Premium Monthly (GBP)' },
  { lookupKey: 'premium_monthly_usd_test', envKey: 'STRIPE_PRICE_MONTHLY_USD_TEST', currency: 'usd', unitAmount: 1499, interval: 'month', taxBehavior: 'exclusive', nickname: 'Premium Monthly (USD)' },
  { lookupKey: 'premium_annual_gbp_test', envKey: 'STRIPE_PRICE_ANNUAL_GBP_TEST', currency: 'gbp', unitAmount: 10999, interval: 'year', taxBehavior: 'inclusive', nickname: 'Premium Annual (GBP)' },
  { lookupKey: 'premium_annual_usd_test', envKey: 'STRIPE_PRICE_ANNUAL_USD_TEST', currency: 'usd', unitAmount: 14999, interval: 'year', taxBehavior: 'exclusive', nickname: 'Premium Annual (USD)' },
]

async function findOrCreateProduct(stripe: Stripe): Promise<string> {
  // Match by metadata marker first (survives name edits).
  const search = await stripe.products.search({
    query: `metadata['homemade_lookup']:'${PRODUCT_LOOKUP}'`,
  })
  const existingProduct = search.data[0]
  if (existingProduct) {
    console.log(`Reusing product ${existingProduct.id} (${existingProduct.name})`)
    return existingProduct.id
  }
  const product = await stripe.products.create({
    name: 'Homemade Premium',
    description:
      'One membership for every craft on Homemade — downloads, custom-fit patterns, recipe planning and your AI assistant.',
    tax_code: TAX_CODE_DIGITAL,
    metadata: { homemade_lookup: PRODUCT_LOOKUP },
  })
  console.log(`Created product ${product.id}`)
  return product.id
}

async function findOrCreatePrice(
  stripe: Stripe,
  productId: string,
  spec: PriceSpec,
): Promise<string> {
  // lookup_key is unique per account, so it's the idempotency anchor.
  const existing = await stripe.prices.list({
    lookup_keys: [spec.lookupKey],
    active: true,
    limit: 1,
  })
  const existingPrice = existing.data[0]
  if (existingPrice) {
    console.log(`Reusing price ${existingPrice.id} (${spec.lookupKey})`)
    return existingPrice.id
  }
  const price = await stripe.prices.create({
    product: productId,
    currency: spec.currency,
    unit_amount: spec.unitAmount,
    recurring: { interval: spec.interval },
    tax_behavior: spec.taxBehavior,
    nickname: spec.nickname,
    lookup_key: spec.lookupKey,
    metadata: { homemade_lookup: spec.lookupKey },
  })
  console.log(`Created price ${price.id} (${spec.lookupKey})`)
  return price.id
}

async function main(): Promise<void> {
  const envPath = loadEnvCredentials()
  if (!envPath) throw new Error('Could not find .env.credentials')
  console.log(`Loaded credentials from ${envPath}`)

  const key = process.env.STRIPE_SECRET_KEY_TEST
  if (!key || !key.startsWith('sk_test')) {
    throw new Error('STRIPE_SECRET_KEY_TEST missing or not a test key (must start sk_test).')
  }
  const stripe = new Stripe(key)

  const productId = await findOrCreateProduct(stripe)

  const updates: Record<string, string> = {}
  for (const spec of PRICES) {
    const priceId = await findOrCreatePrice(stripe, productId, spec)
    updates[spec.envKey] = priceId
  }

  upsertEnvCredentials(envPath, updates, '# Stripe TEST/sandbox price ids (Session F)')
  console.log('\nWrote to .env.credentials:')
  for (const [k, v] of Object.entries(updates)) console.log(`  ${k}=${v}`)
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
