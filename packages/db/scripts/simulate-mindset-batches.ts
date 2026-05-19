/**
 * Mindset autopilot rebalance — dry-run simulator.
 *
 * Reads live PUBLISHED counts by PracticeTarget from the DB, then
 * simulates the next 5 batches using the rebalanced weighting rule
 * from docs/autopilot-prompts/mindset.md § 6:
 *
 *   weight[CAT] = max(0, (planned[CAT] - published[CAT]) / planned[CAT])
 *
 * With:
 *   - Cap: no single category > 30% of any batch.
 *   - Floor: categories with weight > 0.4 get a minimum of 2 entries.
 *   - Batch size: 50.
 *
 * Output is a per-batch table showing which categories get picked
 * and how many entries each gets. This is the audit trail for the
 * rebalance — confirms the autopilot will pull from the under-served
 * categories first rather than starving them.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/simulate-mindset-batches.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

const PLANNED: Record<string, number> = {
  MONEY: 600,
  BODY: 1000,
  SLEEP: 290,
  SELF_WORTH: 400,
  RELATIONSHIPS: 210,
  MOTHERHOOD: 215,
  PURPOSE: 195,
  HOME: 150,
  FEAR: 180,
  TIME: 150,
  JOY: 135,
  SPIRITUALITY: 140,
  HEALTH: 165,
  GRIEF: 190,
  FORGIVENESS: 125,
  AGEING: 175,
}

const BATCH_SIZE = 50
const CAP_FRACTION = 0.3
const FLOOR_WEIGHT = 0.4
const FLOOR_MIN_ENTRIES = 2
const BATCHES = 5

function pickBatch(published: Record<string, number>): Record<string, number> {
  const weights: Record<string, number> = {}
  let totalWeight = 0
  for (const cat of Object.keys(PLANNED)) {
    const planned = PLANNED[cat]!
    const pub = published[cat] ?? 0
    const w = Math.max(0, (planned - pub) / planned)
    weights[cat] = w
    totalWeight += w
  }
  if (totalWeight === 0) return {}

  // Raw slice (weight-normalised).
  const slice: Record<string, number> = {}
  for (const cat of Object.keys(PLANNED)) {
    slice[cat] = (weights[cat]! / totalWeight) * BATCH_SIZE
  }

  // Cap: no category > 30% of batch.
  const capLimit = Math.round(BATCH_SIZE * CAP_FRACTION)
  let overflow = 0
  for (const cat of Object.keys(slice)) {
    if (slice[cat]! > capLimit) {
      overflow += slice[cat]! - capLimit
      slice[cat] = capLimit
    }
  }
  if (overflow > 0) {
    // Redistribute overflow across non-capped categories with weight > 0,
    // proportional to their weight.
    const recipients = Object.keys(slice).filter(
      (c) => slice[c]! < capLimit && weights[c]! > 0,
    )
    const recipientWeight = recipients.reduce((s, c) => s + weights[c]!, 0)
    if (recipientWeight > 0) {
      for (const c of recipients) {
        slice[c] = (slice[c] ?? 0) + (overflow * weights[c]!) / recipientWeight
      }
    }
  }

  // Floor: any cat with weight > 0.4 gets at least FLOOR_MIN_ENTRIES.
  for (const cat of Object.keys(slice)) {
    if (weights[cat]! > FLOOR_WEIGHT && slice[cat]! < FLOOR_MIN_ENTRIES) {
      const deficit = FLOOR_MIN_ENTRIES - slice[cat]!
      slice[cat] = FLOOR_MIN_ENTRIES
      // Pull deficit from the largest current slice that isn't us.
      let donor: string | null = null
      let donorSize = 0
      for (const other of Object.keys(slice)) {
        if (other === cat) continue
        if (slice[other]! > donorSize) {
          donor = other
          donorSize = slice[other]!
        }
      }
      if (donor) slice[donor] = Math.max(0, slice[donor]! - deficit)
    }
  }

  // Round to whole entries. Fix rounding drift by adding / subtracting from
  // the largest slice.
  const rounded: Record<string, number> = {}
  let roundedTotal = 0
  for (const cat of Object.keys(slice)) {
    const n = Math.round(slice[cat]!)
    rounded[cat] = n
    roundedTotal += n
  }
  let drift = BATCH_SIZE - roundedTotal
  while (drift !== 0) {
    let biggest: string | null = null
    let biggestSize = drift > 0 ? -Infinity : 0
    for (const cat of Object.keys(rounded)) {
      if (drift > 0 && rounded[cat]! > biggestSize) {
        biggest = cat
        biggestSize = rounded[cat]!
      }
      if (drift < 0 && rounded[cat]! > biggestSize) {
        biggest = cat
        biggestSize = rounded[cat]!
      }
    }
    if (!biggest) break
    rounded[biggest] = rounded[biggest]! + (drift > 0 ? 1 : -1)
    drift = drift > 0 ? drift - 1 : drift + 1
  }

  // Strip zero-entry categories.
  const out: Record<string, number> = {}
  for (const cat of Object.keys(rounded)) {
    if (rounded[cat]! > 0) out[cat] = rounded[cat]!
  }
  return out
}

async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' } })
  if (!cat) {
    console.error('mindset category missing')
    process.exit(1)
  }

  const all = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: TutorialStatus.PUBLISHED },
    select: { practiceTargets: true },
  })

  const published: Record<string, number> = {}
  for (const k of Object.keys(PLANNED)) published[k] = 0
  for (const row of all) {
    if (!row.practiceTargets) continue
    for (const t of row.practiceTargets) {
      if (t in published) published[t]! += 1
    }
  }

  console.log('Mindset autopilot — rebalance dry-run')
  console.log('=====================================\n')
  console.log('Starting state (PUBLISHED per life-category target):\n')
  console.log('Category        Planned  Published  Weight  GapTo%')
  console.log('---             ------- ----------  ------  ------')
  for (const c of Object.keys(PLANNED)) {
    const planned = PLANNED[c]!
    const pub = published[c]!
    const w = Math.max(0, (planned - pub) / planned)
    const gap = pub >= planned ? 'at-target' : `${Math.round((1 - pub / planned) * 100)}%`
    console.log(
      `${c.padEnd(15)} ${String(planned).padStart(7)} ${String(pub).padStart(10)}  ${w.toFixed(2).padStart(6)}  ${gap.padStart(6)}`,
    )
  }
  console.log('')

  let snapshot = { ...published }
  for (let b = 1; b <= BATCHES; b++) {
    const slice = pickBatch(snapshot)
    console.log(`\nBatch ${b} (size ${BATCH_SIZE}):`)
    console.log('Category        Entries')
    console.log('---             -------')
    const sortedCats = Object.entries(slice).sort((a, b) => b[1] - a[1])
    let total = 0
    for (const [c, n] of sortedCats) {
      console.log(`  ${c.padEnd(13)} ${String(n).padStart(7)}`)
      total += n
    }
    console.log(`  ${'(total)'.padEnd(13)} ${String(total).padStart(7)}`)
    // Update snapshot — pretend each batch publishes its slice exactly.
    for (const [c, n] of Object.entries(slice)) {
      snapshot[c] = (snapshot[c] ?? 0) + n
    }
  }

  console.log('\nEnd-state snapshot after 5 batches (PUBLISHED projected):\n')
  console.log('Category        Planned  Published  Weight  GapTo%')
  console.log('---             ------- ----------  ------  ------')
  for (const c of Object.keys(PLANNED)) {
    const planned = PLANNED[c]!
    const pub = snapshot[c]!
    const w = Math.max(0, (planned - pub) / planned)
    const gap = pub >= planned ? 'at-target' : `${Math.round((1 - pub / planned) * 100)}%`
    console.log(
      `${c.padEnd(15)} ${String(planned).padStart(7)} ${String(pub).padStart(10)}  ${w.toFixed(2).padStart(6)}  ${gap.padStart(6)}`,
    )
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
