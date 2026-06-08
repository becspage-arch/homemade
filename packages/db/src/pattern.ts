/**
 * Pattern JSON — the canonical shape stored in `Pattern.data`.
 *
 * One schema covers every cell-grid pattern type the platform will ever
 * render: cross-stitch (v1), knitting charts, crochet charts. Each
 * `PatternType` constrains which optional layers (back-stitch, French
 * knots, beads, quarter-stitches) are meaningful, but the structure is
 * the same. Renderers branch on `type` to decide which layers to draw.
 *
 * Validated at every application boundary with Zod (API write paths,
 * tutorial migration script, photo-to-chart save). The DB stores the
 * raw JSON; the renderer assumes valid input because the boundary
 * caught any malformed data first.
 */

import { z } from 'zod'

// ───────────────────────────────────────────────────────────────────────────
// Primitives
// ───────────────────────────────────────────────────────────────────────────

/** 6-digit hex colour, lower or upper case, with the leading #. */
export const HexColourSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Expected a #RRGGBB hex colour')

/** Floss brand the palette entry comes from. Mirrors the FlossBrand enum. */
export const FlossBrandSchema = z.enum(['DMC', 'ANCHOR', 'MADEIRA'])
export type FlossBrand = z.infer<typeof FlossBrandSchema>

/** Pattern category — selects which layers the renderer draws. */
export const PatternTypeSchema = z.enum([
  'CROSS_STITCH',
  'KNITTING_CHART',
  'CROCHET_CHART',
])
export type PatternTypeName = z.infer<typeof PatternTypeSchema>

// ───────────────────────────────────────────────────────────────────────────
// Cells + segments
// ───────────────────────────────────────────────────────────────────────────

/**
 * A single stitched cell. `s` is the palette symbol (single visible
 * character) that points back at the matching `palette[].symbol`. The
 * coordinate origin is the top-left corner of the grid; x grows right,
 * y grows down. Cells are sparse — any (x, y) absent from the list
 * renders as bare fabric.
 */
export const PatternCellSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  s: z.string().min(1),
})
export type PatternCell = z.infer<typeof PatternCellSchema>

/**
 * A back-stitch line segment. Coordinates are cell-corner coordinates,
 * NOT cell centres — so a 1-cell horizontal line is `(0,0) → (1,0)`.
 * Allows half-cell back-stitch by using non-integer values when needed
 * (defer; v1 keeps coordinates aligned to cell corners).
 */
export const BackstitchSegmentSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  s: z.string().min(1),
})
export type BackstitchSegment = z.infer<typeof BackstitchSegmentSchema>

/** A French knot placed at a cell centre. */
export const FrenchKnotSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  s: z.string().min(1),
})
export type FrenchKnot = z.infer<typeof FrenchKnotSchema>

/** A bead placed at a cell centre. Reserved for future use. */
export const BeadSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  s: z.string().min(1),
})
export type Bead = z.infer<typeof BeadSchema>

/**
 * The grid itself. Sparse `cells` keep payload size proportional to the
 * stitched area, not the bounding box; an 80×100 pattern that's 30%
 * stitched serialises as ~2,400 cell records instead of 8,000.
 */
export const PatternGridSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  cells: z.array(PatternCellSchema),
  backstitch: z.array(BackstitchSegmentSchema).default([]),
  frenchKnots: z.array(FrenchKnotSchema).default([]),
  beads: z.array(BeadSchema).default([]),
})
export type PatternGrid = z.infer<typeof PatternGridSchema>

// ───────────────────────────────────────────────────────────────────────────
// Palette
// ───────────────────────────────────────────────────────────────────────────

/**
 * One palette entry. `symbol` is the lookup key cells point at; the
 * renderer overlays it on each stitched cell. Symbol uniqueness is a
 * cross-array invariant validated by `PatternDataSchema.superRefine`.
 *
 * `strandsFullCross` and `strandsBackstitch` are the stitching defaults
 * the floss-list skein estimate uses; the user can tweak in Studio
 * settings without reauthoring the pattern.
 */
export const PaletteEntrySchema = z.object({
  symbol: z.string().min(1),
  brand: FlossBrandSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  rgb: HexColourSchema,
  strandsFullCross: z.number().int().min(1).max(6).default(2),
  strandsBackstitch: z.number().int().min(1).max(6).default(1),
})
export type PaletteEntry = z.infer<typeof PaletteEntrySchema>

// ───────────────────────────────────────────────────────────────────────────
// Fabric + metadata
// ───────────────────────────────────────────────────────────────────────────

/** Aida-count fabric default. 14 is the most common. */
export const FabricSchema = z.object({
  count: z.number().int().min(6).max(40).default(14),
  colourRgb: HexColourSchema.default('#F5EBD8'),
  type: z.enum(['Aida', 'Evenweave', 'Linen']).default('Aida'),
})
export type Fabric = z.infer<typeof FabricSchema>

/** Optional designer / sourcing metadata embedded in the pattern data. */
export const PatternMetadataSchema = z
  .object({
    designer: z.string().optional(),
    year: z.number().int().optional(),
    license: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    notes: z.string().optional(),
  })
  .default({})
export type PatternMetadata = z.infer<typeof PatternMetadataSchema>

// ───────────────────────────────────────────────────────────────────────────
// Top-level pattern data
// ───────────────────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = 1 as const

/**
 * The full pattern document. Every Pattern row's `data` JSON column
 * parses against this schema. Use `parsePatternData()` at boundaries;
 * the renderer assumes validated input.
 */
export const PatternDataSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    type: PatternTypeSchema,
    grid: PatternGridSchema,
    palette: z.array(PaletteEntrySchema).min(1),
    fabric: FabricSchema.default({ count: 14, colourRgb: '#F5EBD8', type: 'Aida' }),
    metadata: PatternMetadataSchema,
  })
  .superRefine((doc, ctx) => {
    const symbols = new Set<string>()
    for (const entry of doc.palette) {
      if (symbols.has(entry.symbol)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['palette'],
          message: `Duplicate palette symbol "${entry.symbol}"`,
        })
      }
      symbols.add(entry.symbol)
    }
    const ref = (s: string, where: string, i: number) => {
      if (!symbols.has(s)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['grid', where, i],
          message: `Cell symbol "${s}" not present in palette`,
        })
      }
    }
    doc.grid.cells.forEach((c, i) => ref(c.s, 'cells', i))
    doc.grid.backstitch.forEach((b, i) => ref(b.s, 'backstitch', i))
    doc.grid.frenchKnots.forEach((k, i) => ref(k.s, 'frenchKnots', i))
    doc.grid.beads.forEach((b, i) => ref(b.s, 'beads', i))

    const { width, height } = doc.grid
    const inBounds = (x: number, y: number) =>
      x >= 0 && x < width && y >= 0 && y < height
    doc.grid.cells.forEach((c, i) => {
      if (!inBounds(c.x, c.y)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['grid', 'cells', i],
          message: `Cell (${c.x},${c.y}) is outside the ${width}×${height} grid`,
        })
      }
    })
  })

export type PatternData = z.infer<typeof PatternDataSchema>

/**
 * Validate-and-parse helper. Returns the typed pattern data or throws a
 * Zod error the caller can format. Use at every API write boundary.
 */
export function parsePatternData(raw: unknown): PatternData {
  return PatternDataSchema.parse(raw)
}

/**
 * Cheap denormalised metrics the Pattern row stores. Keeps library card
 * grids and filter queries off the JSON column. Recompute on every save.
 */
export interface PatternMetrics {
  widthCells: number
  heightCells: number
  colourCount: number
  totalStitches: number
  hasBackstitch: boolean
  hasFrenchKnots: boolean
  hasBeads: boolean
  hasQuarterStitches: boolean
}

export function computePatternMetrics(data: PatternData): PatternMetrics {
  return {
    widthCells: data.grid.width,
    heightCells: data.grid.height,
    colourCount: data.palette.length,
    totalStitches: data.grid.cells.length,
    hasBackstitch: data.grid.backstitch.length > 0,
    hasFrenchKnots: data.grid.frenchKnots.length > 0,
    hasBeads: data.grid.beads.length > 0,
    hasQuarterStitches: false,
  }
}

/**
 * Estimated skeins per palette entry, given a +25% safety margin.
 *
 * The model is the one most pattern publishers print on their floss key:
 * a full cross-stitch on 14-count Aida with 2 strands uses roughly
 * 1/180th of a 8-yard skein (~2.4 cm of thread per stitch including
 * tail). Back-stitch + French knots add a small overhead. We round up
 * to the nearest 0.5 skein because no shop sells less.
 */
export function estimateSkeinCount(
  data: PatternData,
  symbol: string,
  safetyMargin = 0.25,
): number {
  const entry = data.palette.find((p) => p.symbol === symbol)
  if (!entry) return 0

  const fullCrossCount = data.grid.cells.filter((c) => c.s === symbol).length
  const backstitchCount = data.grid.backstitch.filter((b) => b.s === symbol).length
  const frenchKnotCount = data.grid.frenchKnots.filter((k) => k.s === symbol).length

  // 14-count Aida baseline: ~180 full-cross stitches with 2 strands per skein.
  // Scale by fabric count (finer cloth = shorter stitches), strand count,
  // and the published 8-yard / ~730 cm skein length.
  const fabricFactor = 14 / data.fabric.count
  const strandFactor = entry.strandsFullCross / 2
  const stitchesPerSkein = 180 * fabricFactor / strandFactor

  // Back-stitch + French knots in same colour add roughly 0.25× equivalent
  // stitches each. Cheap approximation; the safety margin absorbs the rest.
  const equivalentStitches = fullCrossCount + backstitchCount * 0.25 + frenchKnotCount * 0.25

  const raw = equivalentStitches / stitchesPerSkein
  const padded = raw * (1 + safetyMargin)
  return Math.max(0.5, Math.ceil(padded * 2) / 2)
}

/** Sparse-cell key encoding used by UserPatternProgress.stitchedCells. */
export function cellKey(x: number, y: number): string {
  return `${x},${y}`
}

export function parseCellKey(key: string): { x: number; y: number } | null {
  const [xs, ys] = key.split(',')
  const x = Number(xs)
  const y = Number(ys)
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null
  return { x, y }
}
