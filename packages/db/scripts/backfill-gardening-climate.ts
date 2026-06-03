/**
 * Backfill the new climate fields on every GROWING_GUIDE tutorial.
 *
 * Phase location_climate_paper_001.
 *
 * Sets:
 *   hemisphere              = 'N'  (UK default)
 *   climateZones            = ['Cfb']  (oceanic temperate, UK norm)
 *   usdaHardinessZones      = [7, 8, 9]  (UK hardiness range)
 *   primaryRegionWrittenFor = 'UK & Northern Europe'
 *   alsoGrowsIn             = 'US zones 5-9 (shift months later), Australia / NZ coastal (southern hemisphere, shift 6 months)'
 *   frostSensitivity        = derived from the existing body copy
 *                             (parse mentions of 'frost', 'hardy', 'tender')
 *
 * Idempotent: existing values are left alone if already set. Only
 * touches GROWING_GUIDE rows; every other category untouched.
 *
 * Frost-sensitivity inference walks the TipTap body for keywords. The
 * priority order matters: a tutorial that says "tender" wins over one
 * that also says "hardy" (a frost-tender plant the gardener still has
 * to wait out winter for).
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-gardening-climate.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-gardening-climate.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

const UK_HEMISPHERE = 'N'
const UK_CLIMATE_ZONES = ['Cfb']
const UK_USDA_ZONES = [7, 8, 9]
const UK_PRIMARY_REGION = 'UK & Northern Europe'
const UK_ALSO_GROWS_IN =
  'US zones 5-9 (shift months later), Australia / NZ coastal (southern hemisphere, shift 6 months)'

interface TipTapNode {
  type?: string
  text?: string
  content?: TipTapNode[]
}

/**
 * Walk the body once and return every text leaf concatenated. Used by
 * the frost-sensitivity detector.
 */
function extractAllText(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const node = body as TipTapNode
  if (node.text) return node.text
  if (!Array.isArray(node.content)) return ''
  return node.content.map(extractAllText).join(' ')
}

/**
 * Slug-keyed override map for plants whose bodies don't carry explicit
 * frost / hardiness vocabulary. Covers the obvious botanical cases that
 * a UK-trained gardener would know on sight. Extend as the gardening
 * library grows; falls through to the body-text inference when a slug
 * isn't listed.
 *
 * Half-hardy = survives a mild frost but not a hard freeze (snapdragons,
 * stocks, antirrhinums). Tender = killed by any frost (tomatoes, basil,
 * courgettes, dahlias). Hardy = overwinters outdoors in the UK
 * (strawberries, rosemary, sage, mint, chives).
 */
const FROST_SLUG_OVERRIDES: Record<string, 'hardy' | 'half-hardy' | 'tender'> = {
  // Tender — frost-killed.
  'growing-tomatoes-from-seed': 'tender',
  'growing-tomatoes': 'tender',
  'growing-basil': 'tender',
  'growing-courgettes': 'tender',
  'growing-cucumbers': 'tender',
  'growing-peppers': 'tender',
  'growing-chillies': 'tender',
  'growing-aubergine': 'tender',
  'growing-aubergines': 'tender',
  'growing-pumpkins': 'tender',
  'growing-squash': 'tender',
  'growing-sweetcorn': 'tender',
  'growing-french-beans': 'tender',
  'growing-runner-beans': 'tender',
  'growing-dahlias': 'tender',

  // Half-hardy — withstand a light frost.
  'growing-snapdragons': 'half-hardy',
  'growing-stocks': 'half-hardy',
  'growing-antirrhinums': 'half-hardy',
  'growing-cosmos': 'half-hardy',
  'growing-nicotiana': 'half-hardy',

  // Hardy — overwinters outdoors in the UK.
  'growing-strawberries': 'hardy',
  'growing-rosemary': 'hardy',
  'growing-rosemary-from-cuttings': 'hardy',
  'growing-sage': 'hardy',
  'growing-thyme': 'hardy',
  'growing-mint': 'hardy',
  'growing-chives': 'hardy',
  'growing-parsley': 'hardy',
  'growing-rhubarb': 'hardy',
  'growing-garlic': 'hardy',
  'growing-onions': 'hardy',
  'growing-shallots': 'hardy',
  'growing-broad-beans': 'hardy',
  'growing-peas': 'hardy',
  'growing-spinach': 'hardy',
  'growing-kale': 'hardy',
  'growing-cabbage': 'hardy',
  'growing-leeks': 'hardy',
  'growing-purple-sprouting-broccoli': 'hardy',
}

/**
 * Infer frost sensitivity from the body copy. Returns null when nothing
 * matches — the renderer falls back to the climate-zone defaults in
 * that case. Callers should check the slug override map BEFORE invoking
 * this function.
 *
 * Priority order:
 *   1. 'tender' / 'frost-tender' / 'frost tender'   → 'tender'
 *   2. 'half-hardy' / 'half hardy'                  → 'half-hardy'
 *   3. 'fully hardy' / 'hardy'                      → 'hardy'
 *   4. 'first frost' / 'last frost' mention without
 *      'overwinter' anywhere                        → 'tender'
 *      (the plant's schedule is gated on frost dates,
 *      which only matters for tender plants)
 */
function inferFrostSensitivity(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(frost[\s-]?tender|tender plant|tender to frost|tender perennial)\b/.test(lower)) {
    return 'tender'
  }
  if (/\b(half[\s-]?hardy)\b/.test(lower)) {
    return 'half-hardy'
  }
  if (/\b(fully hardy|hardy perennial|cold[\s-]?hardy|frost[\s-]?hardy|hardy down to|hardy annual)\b/.test(lower)) {
    return 'hardy'
  }
  if (/\bhardy\b/.test(lower) && !/\btender\b/.test(lower)) {
    return 'hardy'
  }
  if (/\btender\b/.test(lower)) return 'tender'
  // Frost-date mentions without overwinter language imply tender.
  if (
    /\b(first frost|last frost|after the last frost|before the first frost)\b/.test(lower) &&
    !/\b(over[\s-]?winter|overwinter)\b/.test(lower)
  ) {
    return 'tender'
  }
  return null
}

interface Counts {
  total: number
  alreadyFilled: number
  filled: number
  bySensitivity: Record<string, number>
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const rows = await prisma.tutorial.findMany({
    where: { type: 'GROWING_GUIDE' },
    select: {
      id: true,
      slug: true,
      title: true,
      body: true,
      hemisphere: true,
      climateZones: true,
      usdaHardinessZones: true,
      primaryRegionWrittenFor: true,
      alsoGrowsIn: true,
      frostSensitivity: true,
    },
  })

  const counts: Counts = {
    total: rows.length,
    alreadyFilled: 0,
    filled: 0,
    bySensitivity: { hardy: 0, 'half-hardy': 0, tender: 0, unset: 0 },
  }

  for (const row of rows) {
    const update: Record<string, unknown> = {}

    if (!row.hemisphere) update.hemisphere = UK_HEMISPHERE
    if (!row.climateZones || row.climateZones.length === 0) update.climateZones = UK_CLIMATE_ZONES
    if (!row.usdaHardinessZones || row.usdaHardinessZones.length === 0) update.usdaHardinessZones = UK_USDA_ZONES
    if (!row.primaryRegionWrittenFor) update.primaryRegionWrittenFor = UK_PRIMARY_REGION
    if (!row.alsoGrowsIn) update.alsoGrowsIn = UK_ALSO_GROWS_IN

    if (!row.frostSensitivity) {
      // Slug override beats body-text inference — explicit beats heuristic.
      const inferred =
        FROST_SLUG_OVERRIDES[row.slug] ??
        inferFrostSensitivity(extractAllText(row.body))
      if (inferred) {
        update.frostSensitivity = inferred
        counts.bySensitivity[inferred] = (counts.bySensitivity[inferred] ?? 0) + 1
      } else {
        counts.bySensitivity.unset = (counts.bySensitivity.unset ?? 0) + 1
      }
    }

    if (Object.keys(update).length === 0) {
      counts.alreadyFilled += 1
      continue
    }

    if (!DRY_RUN) {
      await prisma.tutorial.update({ where: { id: row.id }, data: update })
    }
    counts.filled += 1
    console.log(
      `[backfill] ~ ${row.slug} :: ${Object.keys(update).join(', ')}`,
    )
  }

  console.log(
    `\n[backfill] gardening-climate: total=${counts.total} filled=${counts.filled} alreadyFilled=${counts.alreadyFilled}`,
  )
  console.log(
    `[backfill] frost-sensitivity counts: ${JSON.stringify(counts.bySensitivity)}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[backfill] failed:', err)
  process.exit(1)
})
