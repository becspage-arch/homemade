import 'server-only'
import {
  prisma,
  parsePatternData,
  computeFlossSummary,
  buildFlossSummary,
  readStoredFlossSummary,
  PaletteEntrySchema,
  FabricSchema,
  BackstitchSegmentSchema,
  FrenchKnotSchema,
  FractionalStitchSchema,
  type PaletteUsage,
  type PatternFlossSummary,
} from '@homemade/db'
import { z } from 'zod'

/**
 * The floss key, and only the floss key.
 *
 * The pattern page prints one line per colour (swatch, name, brand code,
 * stitch count, skeins) and nothing else on the page reads the grid. The grid
 * is nevertheless what those numbers are made of, and on a showpiece chart it
 * is six megabytes of cells.
 *
 * So the summary is stored on the row (`Pattern.flossSummary`, written by the
 * publish path beside `data`), and the page reads it with the rest of the row.
 * A database trigger clears it whenever `data` changes without it, so it is
 * never stale. When it is missing (a row from before the column, or one whose
 * chart has just been edited) this works it out the old way, Postgres count
 * first, and stores it, so the next view is a plain read again.
 */
export type { FlossSummaryLine, PatternFlossSummary } from '@homemade/db'

/**
 * The floss summary for one pattern.
 *
 * `stored` is the row's `flossSummary` as read with the page's own query.
 * Returns null when the row's `data` is missing or fails validation; the caller
 * treats that the same way it treated a failed parse before, as a page that
 * cannot be rendered.
 */
export async function getPatternFlossSummary(
  patternId: string,
  updatedAt: Date,
  stored: unknown,
): Promise<PatternFlossSummary | null> {
  const hit = readStoredFlossSummary(stored)
  if (hit) return hit

  const summary = (await summariseInPostgres(patternId)) ?? (await summariseInNode(patternId))
  if (!summary) return null
  void storeSummary(patternId, updatedAt, summary)
  return summary
}

/**
 * Keep a freshly worked-out summary on the row. Raw SQL so `updatedAt` is not
 * bumped (the summary is derived, not an edit), and only if the row is still
 * the one the page read: a chart saved in between keeps its NULL and is worked
 * out again on its next view. Best effort; a failed write costs one recompute.
 */
async function storeSummary(patternId: string, updatedAt: Date, summary: PatternFlossSummary): Promise<void> {
  try {
    await prisma.$executeRaw`
      update "Pattern" set "flossSummary" = ${JSON.stringify(summary)}::jsonb
      where id = ${patternId} and "updatedAt" = ${updatedAt} and "flossSummary" is null
    `
  } catch {
    /* the next view recomputes */
  }
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

    return buildFlossSummary(row.palette, row.fabric.count, (p) => usageFor(p.symbol))
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

  return computeFlossSummary(data)
}
