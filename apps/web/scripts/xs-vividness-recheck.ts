/**
 * xs-vividness-recheck — does clearing the white backgrounds break the pale guard?
 *
 * `bulk/vividness.ts` measures a finished render and refuses anything washed out.
 * Its key number, INK, is a fraction of the STITCHED pixels — bare cloth is
 * excluded from the denominator so a design with lots of negative space is judged
 * on its design. Clearing a white background changes that denominator: several
 * thousand near-white stitches leave the sum, and the ones that remain are the
 * ones carrying the tone. Arithmetically ink and chroma can only rise. This
 * script proves it on the real renders rather than asserting it.
 *
 * For every row the bare-fabric backfill touched it measures the thumbnail that
 * is live now, and — where the pre-conversion thumbnail is in the dedupe scan's
 * cache — the one it replaced, then reports any verdict that moved. A single
 * pass → tooPale flip is a reason to move MIN_INK, with the reason written into
 * the comment there; anything else means the threshold stands.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-vividness-recheck.ts \
 *     [--cache <thumb-dir>] [--limit N]
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Prisma, prisma } from '@homemade/db'
import {
  measureVividness,
  vividnessVerdict,
  MIN_INK,
  MIN_CHROMA,
  PALE_REFS,
  VIVID_REFS,
} from '@/lib/studio/generation/bulk/vividness'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const CACHE_DIR = arg('cache')
const LIMIT = Number(arg('limit')) || 0

async function fetchThumb(r2Key: string): Promise<Buffer | null> {
  const base = process.env.R2_PUBLIC_BASE_URL
  if (!base) return null
  const res = await fetch(`${base.replace(/\/$/, '')}/${r2Key}`)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

async function main(): Promise<void> {
  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', backgroundCleared: { not: Prisma.JsonNull } },
    orderBy: { id: 'asc' },
    ...(LIMIT ? { take: LIMIT } : {}),
    select: {
      id: true, slug: true, colourCount: true, generationMeta: true,
      subCategory: { select: { slug: true } },
      thumbnail: { select: { r2Key: true } },
    },
  })
  console.log(`${rows.length} rows had their background cleared`)

  const flips: string[] = []
  /** A flip that is a real alarm: the shelves the brief said must not regress. */
  const alarms: string[] = []
  const stillPale: string[] = []
  let measured = 0
  let compared = 0
  let inkUp = 0
  let inkDown = 0
  let inkDelta = 0

  for (const row of rows) {
    if (!row.thumbnail?.r2Key) continue
    const after = await fetchThumb(row.thumbnail.r2Key)
    if (!after) continue
    // The guard is shelf-aware: the monochrome shelf and the two-tone style
    // lanes are judged on tone OR colour, a colour shelf on both. Judge each row
    // the way the publish path would judge it.
    const meta = (row.generationMeta ?? null) as { style?: string } | null
    const ctx = { shelf: row.subCategory?.slug ?? undefined, style: meta?.style ?? undefined }
    const va = await measureVividness(after)
    const verdictAfter = vividnessVerdict(va, ctx)
    measured++

    const cached = CACHE_DIR ? resolve(CACHE_DIR, `${row.id}.png`) : null
    if (cached && existsSync(cached)) {
      const vb = await measureVividness(readFileSync(cached))
      const verdictBefore = vividnessVerdict(vb, ctx)
      compared++
      inkDelta += va.ink - vb.ink
      if (va.ink > vb.ink) inkUp++
      else if (va.ink < vb.ink) inkDown++
      if (!verdictBefore.tooPale && verdictAfter.tooPale) {
        const line =
          `${row.slug ?? row.id} (${row.subCategory?.slug ?? '-'}, ${row.colourCount} colours): ` +
          `ink ${vb.ink.toFixed(3)} → ${va.ink.toFixed(3)}, chroma ${vb.chroma.toFixed(3)} → ${va.chroma.toFixed(3)}`
        flips.push(`  NEWLY PALE ${line}`)
        // The brief's condition: a monochrome or showpiece piece must not start
        // failing. A pale pastel animal that was already a whisker off the floor
        // is the guard doing its job, not a regression.
        if (row.subCategory?.slug === 'monochrome' || row.colourCount >= 60) alarms.push(`  ALARM ${line}`)
      } else if (verdictBefore.tooPale && verdictAfter.tooPale) {
        stillPale.push(`  ${row.slug ?? row.id} (${row.subCategory?.slug ?? '-'}): ${verdictAfter.reason}`)
      }
    } else if (verdictAfter.tooPale) {
      stillPale.push(`  ${row.slug ?? row.id} (${row.subCategory?.slug ?? '-'}, no before): ${verdictAfter.reason}`)
    }
    if (measured % 50 === 0) console.log(`  measured ${measured}/${rows.length}`)
  }

  console.log(`\nmeasured ${measured} · compared against the pre-conversion thumbnail ${compared}`)
  console.log(`ink rose on ${inkUp}, fell on ${inkDown}, mean change ${(compared > 0 ? inkDelta / compared : 0).toFixed(4)}`)
  console.log(`floors: MIN_INK ${MIN_INK}, MIN_CHROMA ${MIN_CHROMA}`)

  console.log(`\nNewly failing the pale guard: ${flips.length}`)
  for (const f of flips) console.log(f)
  console.log(`\nPale before AND after (not caused by this change): ${stillPale.length}`)
  for (const s of stillPale.slice(0, 20)) console.log(s)

  // The calibration set itself. Five of the nine references had their white
  // background cleared, so the numbers the floors were cut from have moved and
  // the guard has to be re-read against what is live now — a MUST FAIL that now
  // passes would mean the pale guard has a hole in it.
  console.log('\nCalibration references, measured against the live thumbnail')
  for (const [want, refs] of [['PALE', PALE_REFS], ['VIVID', VIVID_REFS]] as const) {
    for (const [id, label, shelf] of refs) {
      const row = await prisma.pattern.findUnique({
        where: { id },
        select: { backgroundCleared: true, thumbnail: { select: { r2Key: true } } },
      })
      if (!row?.thumbnail?.r2Key) {
        console.log(`  ${want.padEnd(5)} ${label} — no live thumbnail`)
        continue
      }
      const png = await fetchThumb(row.thumbnail.r2Key)
      if (!png) {
        console.log(`  ${want.padEnd(5)} ${label} — thumbnail unreachable`)
        continue
      }
      const v = await measureVividness(png)
      const verdict = vividnessVerdict(v, { shelf })
      const got = verdict.tooPale ? 'PALE' : 'VIVID'
      if (got !== want) alarms.push(`  ALARM calibration reference moved: ${label} is now ${got}, expected ${want}`)
      console.log(
        `  ${got === want ? 'ok  ' : 'MOVED'} ${want.padEnd(5)} ${label.padEnd(46)} ` +
          `ink ${v.ink.toFixed(3)} chroma ${v.chroma.toFixed(3)}` +
          `${row.backgroundCleared ? '  (background cleared)' : ''}`,
      )
    }
  }

  console.log(`\nAlarms (a monochrome or showpiece piece newly failing, or a calibration reference moving): ${alarms.length}`)
  for (const a of alarms) console.log(a)

  await prisma.$disconnect()
  if (alarms.length > 0) process.exitCode = 1
}

main().catch(async (err) => {
  console.error('FAILED:', err instanceof Error ? (err.stack ?? err.message) : String(err))
  await prisma.$disconnect()
  process.exit(1)
})
