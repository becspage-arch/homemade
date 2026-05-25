/**
 * Quick health-check for fal.ai (Flux Schnell). One small generation;
 * reports OK or BILLING_LOCKED. Costs ~£0.0024 per check.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/check-fal-balance.ts
 *
 * Use this before kicking off a long-running script that calls Flux at
 * bulk (rescue-procedural-via-flux, apply-relevance-verdicts on a big
 * verdicts file, fixup-hero-fill on a fresh batch). If it returns
 * BILLING_LOCKED, top up at fal.ai/dashboard/billing before continuing.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { generateWithFluxSchnell, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-schnell'

async function main() {
  if (!process.env.FAL_KEY) {
    console.error('FAL_KEY not set — cannot check balance.')
    process.exit(1)
  }
  try {
    const img = await generateWithFluxSchnell({
      title: 'cup of tea',
      category: 'cooking',
      subCategory: null,
      ingredients: [],
    })
    if (img) {
      console.log('OK — fal.ai responded with a generation. Balance healthy.')
      console.log(`   Test image: ${img.url}`)
      process.exit(0)
    } else {
      console.warn('UNCERTAIN — fal.ai returned null (no FluxBillingError).')
      console.warn('  Probably a transient hiccup, not a billing issue. Retry shortly.')
      process.exit(1)
    }
  } catch (err) {
    if (err instanceof FluxBillingError) {
      console.error('BILLING_LOCKED — fal.ai reports balance exhausted.')
      console.error(`  Top up at https://fal.ai/dashboard/billing`)
      console.error(`  Raw response: ${err.body.slice(0, 200)}`)
      process.exit(2)
    }
    const reason = err instanceof Error ? err.message : String(err)
    console.error(`ERROR — ${reason}`)
    process.exit(1)
  }
}

main()
