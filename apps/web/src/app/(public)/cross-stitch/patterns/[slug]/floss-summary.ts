import 'server-only'
import {
  prisma,
  parsePatternData,
  summarisePaletteUsage,
  skeinCountFromUsage,
  PaletteEntrySchema,
  FabricSchema,
  BackstitchSegmentSchema,
  FrenchKnotSchema,
  FractionalStitchSchema,
  type PaletteEntry,
  type PaletteUsage,
  type FlossBrandName,
} from '@homemade/db'
import { z } from 'zod'

/**
 * The floss key, and only the floss key.
 *
 * The pattern page prints one line per colour — swatch, name, brand code,
 * stitch count, skeins — and nothing else on the page reads the grid. The grid
 * is nevertheless what those numbers are made of, and on a showpiece chart it
 * is six megabytes of cells: reading it, validating it and then walking it once
 * per colour is why a 600×408 chart took ten seconds to serve while a 150-cell
 * one took a second.
 *
 * So the page asks for this summary instead of the chart. It is derived purely
 * from the stored `data`, so it is stable for as long as the row is, and it is
 * a few kilobytes rather than a few megabytes — small enough to keep in memory
 * between requests, keyed on the row's `updatedAt` so a save in the Studio
 * invalidates it without any explicit purge.
 */
export interface FlossSummaryLine {
  symbol: string
  brand: FlossBrandName
  code: string
  name: string
  rgb: string
  /** Full crosses worked in this colour — the "N st" on the floss line. */
  stitches: number
  /** Skeins to buy, rounded up to the half skein. */
  skeins: number
}

export interface PatternFlossSummary {
  /** One line per palette entry, in palette order. */
  lines: FlossSummaryLine[]
  /** Skeins across the whole chart, for the spec table. */
  totalSkeins: number
}

/**
 * Summaries live for the life of the process. Each is a few kilobytes, so a
 * cap in the low hundreds is a handful of megabytes even if every showpiece in
 * the library is hit — and the cap matters more than the size: without one, a
 * crawler walking the whole library would pin every chart's summary in memory
 * for good. Oldest insertion is evicted first; a re-request simply rebuilds.
 */
const CACHE_LIMIT = 128

// Hung off globalThis so the dev server's module reloading doesn't hand out a
// fresh empty cache on every edit, matching how the Prisma client is kept.
type CacheHolder = { __homemade_floss_summary?: Map<string, PatternFlossSummary> }
const cache: Map<string, PatternFlossSummary> =
  (globalThis as CacheHolder).__homemade_floss_summary ??
  ((globalThis as CacheHolder).__homemade_floss_summary = new Map())

/**
 * The floss summary for one pattern, built from the stored chart on first ask.
 *
 * Returns null when the row's `data` is missing or fails validation — the
 * caller treats that the same way it treated a failed parse before, as a page
 * that cannot be rendered.
 */
export async function getPatternFlossSummary(
  patternId: string,
  updatedAt: Date,
): Promise<PatternFlossSummary | null> {
  const key = `${patternId}:${updatedAt.getTime()}`
  const hit = cache.get(key)
  if (hit) return hit

  const summary = (await summariseInPostgres(patternId)) ?? (await summariseInNode(patternId))
  if (!summary) return null

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next()
    if (!oldest.done) cache.delete(oldest.value)
  }
  cache.set(key, summary)
  return summary
}

/** What the palette-side layers look like when read straight out of jsonb. */
const AggregateRowSchema = z.object({
  totalStitches: z.number(),
  palette: z.array(PaletteEntrySchema),
  fabric: FabricSchema,
  backstitch: z.array(BackstitchSegmentSchema).nullable(),
  frenchKnots: z.array(FrenchKnotSchema).nullable(),
  fractional: z.array(FractionalStitchSchema).nullable(),
  /** { symbol: full crosses worked in it }, counted by Postgres. */
  cellCounts: z.record(z.string(), z.number()),
})

/**
 * The fast path: count the cells in Postgres and bring back everything else.
 *
 * The cells are the only large part of a chart — a quarter of a million of them
 * on a showpiece against a couple of hundred palette entries and a few thousand
 * back-stitch segments. Counting them by symbol server-side turns a six-megabyte
 * transfer and a six-megabyte object graph in Node into about thirty kilobytes,
 * which is the difference between a two-second first hit and a fast one.
 *
 * It reaches into the shape of `Pattern.data` in SQL, which nothing else does,
 * so it is deliberately distrustful of its own answer: anything unexpected
 * returns null and the caller re-does the work the plain, obviously-correct way.
 */
async function summariseInPostgres(patternId: string): Promise<PatternFlossSummary | null> {
  try {
    const rows = await prisma.$queryRaw<unknown[]>`
      select
        p."totalStitches"                as "totalStitches",
        p.data->'palette'                as "palette",
        p.data->'fabric'                 as "fabric",
        p.data->'grid'->'backstitch'     as "backstitch",
        p.data->'grid'->'frenchKnots'    as "frenchKnots",
        p.data->'grid'->'fractional'     as "fractional",
        (
          select coalesce(jsonb_object_agg(t.s, t.n), '{}'::jsonb)
          from (
            select e->>'s' as s, count(*) as n
            from jsonb_array_elements(p.data->'grid'->'cells') e
            group by 1
          ) t
        )                                as "cellCounts"
      from "Pattern" p
      where p.id = ${patternId}
    `
    const parsed = AggregateRowSchema.safeParse(rows[0])
    if (!parsed.success) return null
    const row = parsed.data

    const fractional = row.fractional ?? []
    // The stored `totalStitches` is full crosses plus fractionals, written by
    // computePatternMetrics off the same grid. If the counts Postgres just
    // returned don't add up to it, the SQL and the chart have drifted apart and
    // this path has no business answering.
    const counted = Object.values(row.cellCounts).reduce((sum, n) => sum + n, 0)
    if (counted + fractional.length !== row.totalStitches) return null

    const usageBySymbol = new Map<string, PaletteUsage>()
    const usageFor = (symbol: string): PaletteUsage => {
      let usage = usageBySymbol.get(symbol)
      if (!usage) {
        usage = {
          fullCrossCount: row.cellCounts[symbol] ?? 0,
          backstitchCells: 0,
          frenchKnotCount: 0,
          fractionalCrosses: 0,
        }
        usageBySymbol.set(symbol, usage)
      }
      return usage
    }
    for (const b of row.backstitch ?? []) {
      usageFor(b.s).backstitchCells += Math.hypot(b.x2 - b.x1, b.y2 - b.y1)
    }
    for (const k of row.frenchKnots ?? []) usageFor(k.s).frenchKnotCount++
    for (const f of fractional) {
      usageFor(f.s).fractionalCrosses += f.k === 'threeQuarter' ? 0.75 : 0.25
    }

    return buildSummary(row.palette, row.fabric.count, (p) => usageFor(p.symbol))
  } catch {
    // A raw query is the one thing on this page that could fail for reasons the
    // page can recover from. Fall through to the plain path rather than 404.
    return null
  }
}

/** The plain path: read the chart, validate it, walk it once. */
async function summariseInNode(patternId: string): Promise<PatternFlossSummary | null> {
  const row = await prisma.pattern.findUnique({
    where: { id: patternId },
    select: { data: true },
  })
  if (!row) return null

  let data
  try {
    data = parsePatternData(row.data)
  } catch {
    return null
  }

  // One walk of the grid for every colour at once, rather than one walk per
  // colour. See summarisePaletteUsage.
  const usageBySymbol = summarisePaletteUsage(data)
  return buildSummary(data.palette, data.fabric.count, (p) => usageBySymbol.get(p.symbol))
}

function buildSummary(
  palette: PaletteEntry[],
  fabricCount: number,
  usageOf: (entry: PaletteEntry) => PaletteUsage | undefined,
): PatternFlossSummary {
  const lines: FlossSummaryLine[] = palette.map((p) => {
    const usage = usageOf(p) ?? {
      fullCrossCount: 0,
      backstitchCells: 0,
      frenchKnotCount: 0,
      fractionalCrosses: 0,
    }
    return {
      symbol: p.symbol,
      brand: p.brand,
      code: p.code,
      name: p.name,
      rgb: p.rgb,
      stitches: usage.fullCrossCount,
      skeins: skeinCountFromUsage(usage, p, fabricCount),
    }
  })
  return { lines, totalSkeins: lines.reduce((sum, l) => sum + l.skeins, 0) }
}
