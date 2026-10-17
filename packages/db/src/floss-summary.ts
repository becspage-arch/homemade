/**
 * The floss key a pattern page prints, stored on the row.
 *
 * The pattern page prints one line per colour (swatch, name, brand code, stitch
 * count, skeins) and nothing else on the page reads the grid. The grid is still
 * what those numbers are made of, and on a showpiece it is six megabytes of
 * cells, so working them out on a view meant a Postgres count over a quarter of
 * a million cells on the first hit of every fresh server task (about five
 * seconds on a 600x408 chart).
 *
 * So the summary is worked out once, when the chart is written, and kept in
 * `Pattern.flossSummary`. The publish path writes it beside `data`; a database
 * trigger (migration 20261018000000) clears it whenever `data` changes without
 * it, so a Studio save, a backfill or a chart fix can never leave a stale key
 * behind; and the page fills a cleared one on its next view and stores it.
 *
 * Pure: a PatternData in, a few kilobytes of JSON out. No Prisma.
 */

import { z } from 'zod'
import {
  FlossBrandSchema,
  HexColourSchema,
  summarisePaletteUsage,
  skeinCountFromUsage,
  type PaletteEntry,
  type PaletteUsage,
  type PatternData,
} from './pattern'

/** Bumped when the stored shape or the skein maths changes; an older stored
 *  summary is then treated as missing and rebuilt on the next view. */
export const FLOSS_SUMMARY_VERSION = 1 as const

export const FlossSummaryLineSchema = z.object({
  symbol: z.string(),
  brand: FlossBrandSchema,
  code: z.string(),
  name: z.string(),
  rgb: HexColourSchema,
  /** Full crosses worked in this colour: the "N st" on the floss line. */
  stitches: z.number().int().nonnegative(),
  /** Skeins to buy, rounded up to the half skein. */
  skeins: z.number().nonnegative(),
})
export type FlossSummaryLine = z.infer<typeof FlossSummaryLineSchema>

export const PatternFlossSummarySchema = z.object({
  v: z.literal(FLOSS_SUMMARY_VERSION),
  /** One line per palette entry, in palette order. */
  lines: z.array(FlossSummaryLineSchema),
  /** Skeins across the whole chart, for the spec table. */
  totalSkeins: z.number().nonnegative(),
})
export type PatternFlossSummary = z.infer<typeof PatternFlossSummarySchema>

/**
 * Build the summary from each palette entry's counted usage. Shared by the
 * in-memory path below and the page's Postgres fallback, so both print the
 * same numbers.
 */
export function buildFlossSummary(
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
  return {
    v: FLOSS_SUMMARY_VERSION,
    lines,
    totalSkeins: lines.reduce((sum, l) => sum + l.skeins, 0),
  }
}

/** The summary for a chart in hand: one walk of the grid for every colour. */
export function computeFlossSummary(data: PatternData): PatternFlossSummary {
  const usage = summarisePaletteUsage(data)
  return buildFlossSummary(data.palette, data.fabric.count, (p) => usage.get(p.symbol))
}

/** A stored summary, or null when it is missing, an older version or malformed. */
export function readStoredFlossSummary(raw: unknown): PatternFlossSummary | null {
  if (raw == null) return null
  const parsed = PatternFlossSummarySchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}
