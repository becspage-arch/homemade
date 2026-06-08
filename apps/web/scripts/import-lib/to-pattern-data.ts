/**
 * Convert a `ParsedStitchingMamaPattern` (intermediate shape from the PDF
 * parser) into the canonical `PatternData` shape stored in `Pattern.data`.
 * Validated against `PatternDataSchema` so an invalid extraction fails
 * loudly at import time rather than silently corrupting the DB.
 */

import { PatternDataSchema, type PatternData } from '@homemade/db/pattern'
import type { ParsedStitchingMamaPattern } from './parse-stitching-mama-pdf'

interface ToPatternDataOptions {
  /** Pseudonym to embed in the metadata.designer field. */
  designer: string
  /** Pattern year (from copyright line if available). */
  year?: number | null
  /** License label embedded in metadata.license. */
  license?: string
}

function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

export function toPatternData(
  parsed: ParsedStitchingMamaPattern,
  opts: ToPatternDataOptions,
): PatternData {
  // The Zod schema requires palette[].symbol to be unique; we guaranteed
  // that in buildPalette by substituting fallbacks for empties. Re-check
  // here so a stray duplicate fails fast rather than producing a broken
  // chart.
  const seen = new Set<string>()
  for (const p of parsed.palette) {
    if (seen.has(p.symbol)) {
      throw new Error(`Duplicate palette symbol "${p.symbol}" in ${parsed.title}`)
    }
    seen.add(p.symbol)
  }

  // Drop any cells that reference a symbol not in the palette (safety net
  // — should already be impossible given the parser's RGB-→-palette
  // matching, but a missing entry would crash Zod's superRefine).
  const palSymbols = new Set(parsed.palette.map(p => p.symbol))
  const cells = parsed.cells.filter(c => palSymbols.has(c.symbol))

  const data: PatternData = PatternDataSchema.parse({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: {
      width: parsed.gridWidth,
      height: parsed.gridHeight,
      cells: cells.map(c => ({ x: c.x, y: c.y, s: c.symbol })),
      backstitch: [],
      frenchKnots: [],
      beads: [],
    },
    palette: parsed.palette.map(p => ({
      symbol: p.symbol,
      brand: p.brand,
      code: p.code,
      name: p.name,
      rgb: rgbToHex(p.rgb),
      strandsFullCross: p.strands || 2,
      strandsBackstitch: 1,
    })),
    fabric: {
      count: parsed.fabricCount,
      colourRgb: '#F5EBD8',
      type: 'Aida',
    },
    metadata: {
      designer: opts.designer,
      year: opts.year ?? undefined,
      license: opts.license,
    },
  })
  return data
}

/** Derive a tier from the parsed pattern shape. Used to seed the Pattern
 *  row's `difficulty` column. The Studio applies the same buckets when
 *  showing the library filter rail. */
export function deriveDifficulty(parsed: ParsedStitchingMamaPattern): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  const colourCount = parsed.palette.length
  const longestDim = Math.max(parsed.gridWidth, parsed.gridHeight)
  if (colourCount < 30 && longestDim < 100) return 'BEGINNER'
  if (colourCount > 50 || longestDim > 200) return 'ADVANCED'
  return 'INTERMEDIATE'
}

/** Rough hours-of-stitching estimate. Based on the conventional figure of
 *  60–80 full-cross stitches per hour for a focused stitcher. */
export function deriveEstimatedHours(parsed: ParsedStitchingMamaPattern, difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): number {
  const totalStitches = parsed.cells.length
  const stitchesPerHour = difficulty === 'BEGINNER' ? 80 : difficulty === 'INTERMEDIATE' ? 60 : 45
  return Math.max(1, Math.round(totalStitches / stitchesPerHour))
}

/** Smallest hoop in 1" increments that fits the finished design. */
export function deriveRecommendedHoopInches(parsed: ParsedStitchingMamaPattern): number | null {
  if (!parsed.finishedSizeCm) return null
  const longestCm = Math.max(parsed.finishedSizeCm.width, parsed.finishedSizeCm.height)
  const longestIn = longestCm / 2.54
  // Round up to the next whole inch + 1" of slack so the design isn't
  // crammed against the ring.
  const hoop = Math.ceil(longestIn) + 1
  // Clamp to standard hoop sizes: 4, 5, 6, 7, 8, 10, 12, 14
  const standard = [4, 5, 6, 7, 8, 10, 12, 14]
  for (const s of standard) if (s >= hoop) return s
  return 14
}
