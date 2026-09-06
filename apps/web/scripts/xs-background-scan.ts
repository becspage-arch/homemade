/**
 * xs-background-scan — READ ONLY. How much of the cross-stitch catalogue is
 * white floss stitched onto white aida for no reason?
 *
 * A printed proof of `b07032021-cute-baby-tortoise` (9 colours, 112x112) came
 * back with the whole background stitched in DMC B5200 — 8,007 stitches, 64% of
 * the chart, white on white. The old catalogue was converted with
 * `backgroundRemoval: false`, so this is not one bad row; it is a systematic
 * fault, and this script measures its size before anything is rewritten.
 *
 * For every CROSS_STITCH Pattern (public and private) it runs the pure rule in
 * `lib/studio/generation/bulk/bare-fabric.ts`: find the near-white palette
 * entries, flood-fill inwards from the chart border through them and through
 * bare fabric, and report the border-connected white (the background) separately
 * from the interior white (a white cat, a highlight — never touched).
 *
 * It writes scratchpad/xs-fabric/scan.json and prints the distribution, so the
 * backfill's rule can be argued about against real numbers rather than a guess.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-background-scan.ts \
 *     [--out <dir>] [--limit N] [--top N]
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { prisma, parsePatternData, type PatternData } from '@homemade/db'
import { bareFabricVerdict, isNearWhite, fullCoverageByIntent, laneForSize } from '@/lib/studio/generation/bulk/bare-fabric'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const OUT_DIR = arg('out') ?? resolve(process.cwd(), '../../scratchpad/xs-fabric')
const LIMIT = Number(arg('limit')) || 0
const TOP = Number(arg('top')) || 40
/** Chart JSON is large; page the scan so the container never holds the lot. */
const PAGE = 100

export interface ScanRow {
  id: string
  slug: string | null
  name: string
  visibility: string
  shelf: string | null
  lane: string
  /** The generation brief's own lane + style, where the row records one. */
  briefLane: string | null
  briefStyle: string | null
  widthCells: number
  heightCells: number
  colourCount: number
  stitchedCells: number
  borderWhiteCells: number
  borderWhiteShare: number
  interiorWhiteCells: number
  openPerimeterShare: number
  coverage: number
  nonWhiteCoverage: number
  dominantCode: string | null
  dominantName: string | null
  dominantShare: number
  dominantIsWhite: boolean
  fullCoverageByIntent: boolean
  convert: boolean
  reason: string
}

/** The biggest palette entry by stitch count — what the chart is mostly made of. */
function dominantColour(data: PatternData): { code: string; name: string; share: number; white: boolean } | null {
  const counts = new Map<string, number>()
  for (const c of data.grid.cells) counts.set(c.s, (counts.get(c.s) ?? 0) + 1)
  let best: string | null = null
  let bestN = 0
  for (const [s, n] of counts) if (n > bestN) { best = s; bestN = n }
  if (best === null) return null
  const entry = data.palette.find((p) => p.symbol === best)
  if (!entry) return null
  return {
    code: `${entry.brand} ${entry.code}`,
    name: entry.name,
    share: bestN / Math.max(1, data.grid.cells.length),
    white: isNearWhite(entry),
  }
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

/** A simple text histogram — the distribution is the point of this script. */
function histogram(title: string, buckets: { label: string; n: number }[], total: number): void {
  console.log(`\n${title}`)
  const widest = Math.max(...buckets.map((b) => b.label.length))
  for (const b of buckets) {
    const share = total > 0 ? b.n / total : 0
    console.log(
      `  ${b.label.padEnd(widest)}  ${String(b.n).padStart(5)}  ${pct(share).padStart(6)}  ${'█'.repeat(Math.round(share * 60))}`,
    )
  }
}

async function main(): Promise<void> {
  const where = { type: 'CROSS_STITCH' as const }
  const total = await prisma.pattern.count({ where })
  const target = LIMIT > 0 ? Math.min(LIMIT, total) : total
  console.log(`${total} cross-stitch patterns; scanning ${target}`)

  const rows: ScanRow[] = []
  let unparsable = 0
  let cursor: string | undefined

  while (rows.length + unparsable < target) {
    const page = await prisma.pattern.findMany({
      where,
      orderBy: { id: 'asc' },
      take: Math.min(PAGE, target - rows.length - unparsable),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true, slug: true, name: true, visibility: true, data: true, generationMeta: true,
        subCategory: { select: { slug: true } },
      },
    })
    if (page.length === 0) break
    cursor = page[page.length - 1]!.id

    for (const row of page) {
      let data: PatternData
      try {
        data = parsePatternData(row.data)
      } catch {
        unparsable++
        continue
      }
      const meta = (row.generationMeta ?? null) as { brief?: { lane?: string }; style?: string } | null
      const briefLane = meta?.brief?.lane ?? null
      const briefStyle = meta?.style ?? null
      const intent = fullCoverageByIntent({ lane: briefLane, style: briefStyle })
      const v = bareFabricVerdict(data, { fullCoverageByIntent: intent })
      const dom = dominantColour(data)
      rows.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        visibility: row.visibility,
        shelf: row.subCategory?.slug ?? null,
        lane: laneForSize(v.scan.widthCells, v.scan.heightCells),
        briefLane,
        briefStyle,
        widthCells: v.scan.widthCells,
        heightCells: v.scan.heightCells,
        colourCount: v.scan.colourCount,
        stitchedCells: v.scan.stitchedCells,
        borderWhiteCells: v.scan.borderWhiteCells,
        borderWhiteShare: v.scan.borderWhiteShare,
        interiorWhiteCells: v.scan.interiorWhiteCells,
        openPerimeterShare: v.scan.openPerimeterShare,
        coverage: v.scan.coverage,
        nonWhiteCoverage: v.scan.nonWhiteCoverage,
        dominantCode: dom?.code ?? null,
        dominantName: dom?.name ?? null,
        dominantShare: dom?.share ?? 0,
        dominantIsWhite: dom?.white ?? false,
        fullCoverageByIntent: intent,
        convert: v.convert,
        reason: v.reason,
      })
    }
    console.log(`  ${rows.length + unparsable}/${target}`)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const file = resolve(OUT_DIR, 'scan.json')
  writeFileSync(file, JSON.stringify({ scannedAt: new Date().toISOString(), rows }, null, 2))

  // ── Distribution ────────────────────────────────────────────────────────
  const n = rows.length
  const bands = [
    { label: 'none (0%)', lo: -1, hi: 0.0001 },
    { label: 'trace (<2%)', lo: 0.0001, hi: 0.02 },
    { label: '2–8% (under the floor)', lo: 0.02, hi: 0.08 },
    { label: '8–20%', lo: 0.08, hi: 0.2 },
    { label: '20–40%', lo: 0.2, hi: 0.4 },
    { label: '40–60%', lo: 0.4, hi: 0.6 },
    { label: '60%+', lo: 0.6, hi: 2 },
  ]
  histogram(
    'Border-connected white as a share of the grid',
    bands.map((b) => ({ label: b.label, n: rows.filter((r) => r.borderWhiteShare > b.lo && r.borderWhiteShare <= b.hi).length })),
    n,
  )

  const convert = rows.filter((r) => r.convert)
  const skipped = rows.filter((r) => !r.convert && r.borderWhiteShare >= 0.08)
  const untouched = rows.filter((r) => !r.convert && r.borderWhiteShare < 0.08)
  histogram(
    'Verdict',
    [
      { label: 'convert', n: convert.length },
      { label: 'skipped by rule (has background, exempt)', n: skipped.length },
      { label: 'untouched (nothing to clear)', n: untouched.length },
    ],
    n,
  )

  histogram(
    'Convert, by size lane',
    ['mini', 'small', 'medium', 'large', 'huge'].map((lane) => ({ label: lane, n: convert.filter((r) => r.lane === lane).length })),
    convert.length,
  )

  const shelves = [...new Set(rows.map((r) => r.shelf ?? '(none)'))].sort()
  histogram(
    'Convert, by shelf',
    shelves.map((s) => ({ label: s, n: convert.filter((r) => (r.shelf ?? '(none)') === s).length })),
    convert.length,
  )

  const whiteDominant = rows.filter((r) => r.dominantIsWhite).length
  const removable = convert.reduce((a, r) => a + r.borderWhiteCells, 0)
  const allStitches = rows.reduce((a, r) => a + r.stitchedCells, 0)
  console.log(`\nRows where the single biggest floss is a white: ${whiteDominant} of ${n} (${pct(whiteDominant / Math.max(1, n))})`)
  console.log(`Interior white kept across the catalogue: ${rows.reduce((a, r) => a + r.interiorWhiteCells, 0).toLocaleString()} stitches`)
  console.log(
    `Stitches the rule would remove: ${removable.toLocaleString()} of ${allStitches.toLocaleString()} (${pct(removable / Math.max(1, allStitches))} of every stitch in the catalogue)`,
  )
  if (unparsable > 0) console.log(`Rows whose data would not parse: ${unparsable}`)

  // ── The worst offenders ─────────────────────────────────────────────────
  const top = [...rows].sort((a, b) => b.borderWhiteShare - a.borderWhiteShare).slice(0, TOP)
  console.log(`\nTop ${top.length} by border-white share`)
  console.log(
    `  ${'slug'.padEnd(44)} ${'white'.padStart(6)} ${'cells'.padStart(7)} ${'cols'.padStart(4)} ${'lane'.padEnd(6)} ${'shelf'.padEnd(16)} verdict`,
  )
  for (const r of top) {
    console.log(
      `  ${(r.slug ?? r.id).slice(0, 44).padEnd(44)} ${pct(r.borderWhiteShare).padStart(6)} ${String(r.borderWhiteCells).padStart(7)} ${String(r.colourCount).padStart(4)} ${r.lane.padEnd(6)} ${(r.shelf ?? '-').slice(0, 16).padEnd(16)} ${r.convert ? 'CONVERT' : 'keep'}`,
    )
  }

  console.log(`\nwrote ${file}`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('FAILED:', err instanceof Error ? (err.stack ?? err.message) : String(err))
  await prisma.$disconnect()
  process.exit(1)
})
