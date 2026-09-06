/**
 * xs-stitchability-backfill — fill the four stitchability columns on every
 * cross-stitch Pattern that predates them.
 *
 * The publish path (`lib/studio/generation/bulk/cross-stitch.ts`) and every
 * other writer that goes through `computePatternMetrics` now sets these on
 * save. Rows published before the columns existed have nulls, so the pattern
 * page would show no band and the library filter would hide them.
 *
 * For each CROSS_STITCH Pattern (public and private, house and user-owned) it
 * parses `data` and stores:
 *   confettiShare        share of stitched cells with no same-colour neighbour
 *   colourChangesPer100  colour changes per 100 stitches along rows
 *   medianRunLength      median unbroken horizontal run of one colour
 *   stitchability        the 1-5 band cut from those three
 *
 * All four are derived purely from the stored grid, so a re-run is a no-op on
 * an unchanged pattern and the script is safe to repeat.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-stitchability-backfill.ts \
 *     [--limit N] [--only-missing] [--dry-run]
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import {
  prisma,
  parsePatternData,
  computeStitchabilityMetrics,
  STITCHABILITY_BANDS,
} from '@homemade/db'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const LIMIT = Number(arg('limit')) || 0
const DRY = process.argv.includes('--dry-run')
const ONLY_MISSING = process.argv.includes('--only-missing')
/** Chart JSON is large; page the scan so the container never holds the lot. */
const PAGE = 100

async function main() {
  const where = {
    type: 'CROSS_STITCH' as const,
    ...(ONLY_MISSING ? { stitchability: null } : {}),
  }
  const total = await prisma.pattern.count({ where })
  const target = LIMIT > 0 ? Math.min(LIMIT, total) : total
  console.log(`${total} cross-stitch patterns${ONLY_MISSING ? ' missing a band' : ''}; processing ${target}`)

  const bands = new Map<number, number>()
  let done = 0
  let skipped = 0
  let cursor: string | undefined

  while (done + skipped < target) {
    const rows = await prisma.pattern.findMany({
      where,
      orderBy: { id: 'asc' },
      take: Math.min(PAGE, target - done - skipped),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: { id: true, slug: true, name: true, data: true },
    })
    if (rows.length === 0) break
    cursor = rows[rows.length - 1]!.id

    for (const row of rows) {
      let data
      try {
        data = parsePatternData(row.data)
      } catch {
        console.warn(`  skip ${row.slug ?? row.id}: pattern data does not parse`)
        skipped++
        continue
      }
      const m = computeStitchabilityMetrics(data)
      bands.set(m.stitchability, (bands.get(m.stitchability) ?? 0) + 1)
      if (!DRY) {
        await prisma.pattern.update({
          where: { id: row.id },
          data: {
            confettiShare: m.confettiShare,
            colourChangesPer100: m.colourChangesPer100,
            medianRunLength: m.medianRunLength,
            stitchability: m.stitchability,
          },
        })
      }
      done++
    }
    console.log(`  ${done + skipped}/${target}`)
  }

  console.log(`\n${DRY ? 'Would have written' : 'Wrote'} ${done} rows (${skipped} skipped).`)
  console.log('\nBand distribution')
  for (const band of [5, 4, 3, 2, 1]) {
    const n = bands.get(band) ?? 0
    const pct = done > 0 ? ((n / done) * 100).toFixed(1) : '0.0'
    const label = STITCHABILITY_BANDS[band]?.label ?? String(band)
    console.log(`  ${band} ${label.padEnd(12)} ${String(n).padStart(5)}  ${pct.padStart(5)}%  ${'█'.repeat(Math.round(n / Math.max(1, done / 60)))}`)
  }

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
