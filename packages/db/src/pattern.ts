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

/**
 * Which quarter of a cell a fractional stitch lives in. The names are the
 * corners of the cell: `tl` is the top-left quarter, `br` the bottom-right.
 *
 * This is the physical stitch, not a drawing convention. A quarter stitch is one
 * leg of a cross cut in half — it runs from a corner of the square to the centre
 * — so the thread lies inside the quarter of the cell at that corner, and that
 * quarter is what it covers.
 */
export const CellQuadrantSchema = z.enum(['tl', 'tr', 'bl', 'br'])
export type CellQuadrant = z.infer<typeof CellQuadrantSchema>

/**
 * A quarter or three-quarter stitch.
 *
 * `q` names one quarter of the cell, and `k` says what is worked:
 *
 *   quarter        only that quarter is stitched — one leg of the cross, halved,
 *                  corner to centre.
 *   threeQuarter   everything EXCEPT that quarter: a half stitch across the cell
 *                  plus a quarter leg, which is what a stitcher works when a
 *                  shape's diagonal edge cuts a square in two.
 *
 * The pair tiles: a three-quarter of one colour missing `tl` and a quarter of
 * another colour at `tl` fill the cell between them, which is exactly how a
 * stair-stepped diagonal is smoothed. A cell may carry a full cross as well —
 * fractionals are their own layer and never replace `cells`.
 */
export const FractionalStitchSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  q: CellQuadrantSchema,
  k: z.enum(['quarter', 'threeQuarter']),
  s: z.string().min(1),
})
export type FractionalStitch = z.infer<typeof FractionalStitchSchema>

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
  /**
   * Quarter and three-quarter stitches. Added after the first thousand charts
   * were published, so it defaults to empty and every existing chart stays
   * valid with no migration — an old chart simply has none.
   */
  fractional: z.array(FractionalStitchSchema).default([]),
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
    doc.grid.fractional.forEach((f, i) => ref(f.s, 'fractional', i))

    // A cell may carry one three-quarter and the one quarter that completes it,
    // and nothing else. `q` names the same quarter in both: the three-quarter
    // leaves it empty and the quarter fills it, so the two tile the cell.
    // Anything else would have a stitcher working the same thread twice.
    const byCell = new Map<string, { q: string; k: string }[]>()
    for (const f of doc.grid.fractional) {
      const key = `${f.x},${f.y}`
      const list = byCell.get(key) ?? []
      list.push({ q: f.q, k: f.k })
      byCell.set(key, list)
    }
    for (const [key, list] of byCell) {
      if (list.length === 1) continue
      const three = list.filter((f) => f.k === 'threeQuarter')
      const quarters = list.filter((f) => f.k === 'quarter')
      const paired =
        list.length === 2 && three.length === 1 && quarters.length === 1 && three[0]!.q === quarters[0]!.q
      if (!paired) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['grid', 'fractional'],
          message: `Cell (${key}) carries fractional stitches that overlap`,
        })
      }
    }

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
    doc.grid.fractional.forEach((f, i) => {
      if (!inBounds(f.x, f.y)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['grid', 'fractional', i],
          message: `Fractional stitch (${f.x},${f.y}) is outside the ${width}×${height} grid`,
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
export interface PatternMetrics extends StitchabilityMetrics {
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
    // Every stitch a needle goes through: full crosses plus the quarter and
    // three-quarter stitches, which are separate pieces of work in their own
    // right. Charts published before fractionals existed carry none, so their
    // count is unchanged.
    totalStitches: data.grid.cells.length + data.grid.fractional.length,
    hasBackstitch: data.grid.backstitch.length > 0,
    hasFrenchKnots: data.grid.frenchKnots.length > 0,
    hasBeads: data.grid.beads.length > 0,
    hasQuarterStitches: data.grid.fractional.length > 0,
    // How the chart feels to work, not how big it is. See
    // computeStitchabilityMetrics below.
    ...computeStitchabilityMetrics(data),
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
  // Back-stitch is measured in CELLS OF LINE, not in segments: a segment is one
  // unbroken run and may be twenty cells long, so counting segments would have a
  // chart's outline cost the same thread whether it went once round a motif or
  // twenty times round it.
  const backstitchCells = data.grid.backstitch
    .filter((b) => b.s === symbol)
    .reduce((a, b) => a + Math.hypot(b.x2 - b.x1, b.y2 - b.y1), 0)
  const frenchKnotCount = data.grid.frenchKnots.filter((k) => k.s === symbol).length
  // A quarter stitch is a quarter of the thread of a full cross, and a
  // three-quarter three quarters of it.
  const fractionalCrosses = data.grid.fractional
    .filter((f) => f.s === symbol)
    .reduce((a, f) => a + (f.k === 'threeQuarter' ? 0.75 : 0.25), 0)

  // 14-count Aida baseline: ~180 full-cross stitches with 2 strands per skein.
  // Scale by fabric count (finer cloth = shorter stitches), strand count,
  // and the published 8-yard / ~730 cm skein length.
  const fabricFactor = 14 / data.fabric.count
  const strandFactor = entry.strandsFullCross / 2
  const stitchesPerSkein = 180 * fabricFactor / strandFactor

  // One cell of back-stitch is about a quarter of a full cross in thread (one
  // straight run at one strand against two crossed diagonals at two), and a
  // French knot about the same. Cheap approximations; the safety margin absorbs
  // the rest.
  const equivalentStitches =
    fullCrossCount + fractionalCrosses + backstitchCells * 0.25 + frenchKnotCount * 0.25

  const raw = equivalentStitches / stitchesPerSkein
  const padded = raw * (1 + safetyMargin)
  return Math.max(0.5, Math.ceil(padded * 2) / 2)
}

// ───────────────────────────────────────────────────────────────────────────
// Progress keys — what a stitcher has already worked
// ───────────────────────────────────────────────────────────────────────────

/**
 * `UserPatternProgress.stitchedCells` is a set of keys, one per piece of work
 * the stitcher has finished. Full crosses were the only kind for the first
 * thousand charts, so their key is the bare `"x,y"` and stays that way. Line
 * and point work carry a two-letter prefix:
 *
 *   "12,7"              a full cross in that square
 *   "bs:0,0,4,0"        one back-stitch segment, by its two endpoints
 *   "kn:9,3"            a French knot in that square
 *   "fr:9,3,tl,q"       a quarter stitch in the top-left of that square
 *   "fr:9,3,tl,t"       the three-quarter that leaves that quarter empty
 *
 * **Why coordinates and not array indices.** A key has to mean the same piece
 * of work every time the chart is opened, and it has to survive the chart
 * being edited. An index into `grid.backstitch` does neither: deleting one
 * segment slides every later index down by one, so a stitcher's outline
 * progress would silently shift onto different lines — every remaining
 * segment corrupted by one edit. The endpoints are the segment. Edit the
 * chart and only the elements that actually changed lose their tick; every
 * other key still names exactly the piece of work it was ticked for.
 *
 * Colour is deliberately not part of a key, matching cells: recolouring a
 * line in the editor does not un-stitch the line that was worked there.
 *
 * A client that predates line work reads these keys, fails to parse them as
 * `"x,y"`, and skips them — so a new key never breaks an old tab, it is
 * simply not drawn. (An old status bar counts the raw set size, so it will
 * read a percentage that is too high until the tab is reloaded. Nothing is
 * lost or corrupted; the keys are round-tripped untouched.)
 */
export const PROGRESS_KEY_PREFIXES = {
  backstitch: 'bs',
  knot: 'kn',
  fractional: 'fr',
} as const

/** A piece of work a progress key can name. */
export type ProgressElement =
  | { kind: 'cell'; x: number; y: number }
  | { kind: 'backstitch'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'knot'; x: number; y: number }
  | { kind: 'fractional'; x: number; y: number; q: CellQuadrant; k: FractionalKind }

export type FractionalKind = FractionalStitch['k']

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

/**
 * Canonical text for one coordinate. Back-stitch endpoints are allowed to sit
 * half way along a cell edge, so they are not always integers; rounding to
 * three decimals (a thousandth of a square — far finer than anything a chart
 * carries) and trimming the tail keeps `4`, `4.0` and `4.0000001` all writing
 * the same key.
 */
function coordText(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const rounded = Math.round(n * 1000) / 1000
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

/**
 * Key for one back-stitch segment. The two endpoints are sorted before they
 * are written, so a line drawn left-to-right and the same line drawn
 * right-to-left are one piece of work, not two.
 */
export function backstitchKey(
  seg: Pick<BackstitchSegment, 'x1' | 'y1' | 'x2' | 'y2'>,
): string {
  const a = `${coordText(seg.x1)},${coordText(seg.y1)}`
  const b = `${coordText(seg.x2)},${coordText(seg.y2)}`
  const [first, second] = compareEndpoints(seg) <= 0 ? [a, b] : [b, a]
  return `${PROGRESS_KEY_PREFIXES.backstitch}:${first},${second}`
}

function compareEndpoints(seg: Pick<BackstitchSegment, 'x1' | 'y1' | 'x2' | 'y2'>): number {
  if (seg.x1 !== seg.x2) return seg.x1 - seg.x2
  return seg.y1 - seg.y2
}

/** Key for one French knot. Two knots in the same square are one knot. */
export function frenchKnotKey(knot: Pick<FrenchKnot, 'x' | 'y'>): string {
  return `${PROGRESS_KEY_PREFIXES.knot}:${coordText(knot.x)},${coordText(knot.y)}`
}

/**
 * Key for one quarter or three-quarter stitch. The kind is part of the key
 * because a three-quarter and the quarter that completes it name the same
 * quadrant — they are the pair that tiles a square, and they are two separate
 * pieces of work.
 */
export function fractionalKey(
  f: Pick<FractionalStitch, 'x' | 'y' | 'q' | 'k'>,
): string {
  const kind = f.k === 'threeQuarter' ? 't' : 'q'
  return `${PROGRESS_KEY_PREFIXES.fractional}:${coordText(f.x)},${coordText(f.y)},${f.q},${kind}`
}

const QUADRANTS: readonly string[] = ['tl', 'tr', 'bl', 'br']

/**
 * Read a progress key back. Returns null for anything that is not a key this
 * version understands, which is how a client skips work it cannot draw
 * instead of throwing on it.
 */
export function parseProgressKey(key: string): ProgressElement | null {
  const colon = key.indexOf(':')
  if (colon < 0) {
    const cell = parseCellKey(key)
    return cell ? { kind: 'cell', x: cell.x, y: cell.y } : null
  }
  const prefix = key.slice(0, colon)
  const parts = key.slice(colon + 1).split(',')
  if (prefix === PROGRESS_KEY_PREFIXES.backstitch) {
    if (parts.length !== 4) return null
    const [x1, y1, x2, y2] = parts.map(Number) as [number, number, number, number]
    if (![x1, y1, x2, y2].every((n) => Number.isFinite(n))) return null
    return { kind: 'backstitch', x1, y1, x2, y2 }
  }
  if (prefix === PROGRESS_KEY_PREFIXES.knot) {
    if (parts.length !== 2) return null
    const x = Number(parts[0])
    const y = Number(parts[1])
    if (!Number.isInteger(x) || !Number.isInteger(y)) return null
    return { kind: 'knot', x, y }
  }
  if (prefix === PROGRESS_KEY_PREFIXES.fractional) {
    if (parts.length !== 4) return null
    const x = Number(parts[0])
    const y = Number(parts[1])
    const q = parts[2]!
    const kind = parts[3]
    if (!Number.isInteger(x) || !Number.isInteger(y)) return null
    if (!QUADRANTS.includes(q)) return null
    if (kind !== 'q' && kind !== 't') return null
    return {
      kind: 'fractional',
      x,
      y,
      q: q as CellQuadrant,
      k: kind === 't' ? 'threeQuarter' : 'quarter',
    }
  }
  return null
}

/** The key for any element, whichever kind it is. */
export function progressKeyFor(element: ProgressElement): string {
  switch (element.kind) {
    case 'cell':
      return cellKey(element.x, element.y)
    case 'backstitch':
      return backstitchKey(element)
    case 'knot':
      return frenchKnotKey(element)
    case 'fractional':
      return fractionalKey(element)
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Counting what is done
// ───────────────────────────────────────────────────────────────────────────

/**
 * How much of a chart — or of one floss colour in it — has been worked.
 *
 * Back-stitch is counted in CELLS OF LINE rather than in segments, the same
 * measure the floss key and the skein estimate already print: one segment can
 * be twenty squares long, so counting segments would make a short tick and a
 * long outline weigh the same. Knots and fractional stitches count one each,
 * matching `computePatternMetrics`.
 */
export interface StitchProgress {
  cellsDone: number
  cellsTotal: number
  fractionalDone: number
  fractionalTotal: number
  /** Cells of back-stitch line, not segments. Rounded for display. */
  lineCellsDone: number
  lineCellsTotal: number
  knotsDone: number
  knotsTotal: number
  /** Everything above added together, rounded. */
  done: number
  total: number
  /** 0-100, from the unrounded totals. */
  percent: number
  /** Nothing at all is left to work. */
  complete: boolean
}

interface Accumulator {
  cellsDone: number
  cellsTotal: number
  fractionalDone: number
  fractionalTotal: number
  lineDone: number
  lineTotal: number
  knotsDone: number
  knotsTotal: number
  /** Pieces of work still to do, counted one per element. */
  outstanding: number
  /** Pieces of work in total, counted one per element. */
  elements: number
}

function emptyAccumulator(): Accumulator {
  return {
    cellsDone: 0,
    cellsTotal: 0,
    fractionalDone: 0,
    fractionalTotal: 0,
    lineDone: 0,
    lineTotal: 0,
    knotsDone: 0,
    knotsTotal: 0,
    outstanding: 0,
    elements: 0,
  }
}

function finishAccumulator(a: Accumulator): StitchProgress {
  const done = a.cellsDone + a.fractionalDone + a.lineDone + a.knotsDone
  const total = a.cellsTotal + a.fractionalTotal + a.lineTotal + a.knotsTotal
  // A chart with nothing in it is not a finished one, it is an empty one.
  const complete = a.elements > 0 && a.outstanding === 0
  return {
    cellsDone: a.cellsDone,
    cellsTotal: a.cellsTotal,
    fractionalDone: a.fractionalDone,
    fractionalTotal: a.fractionalTotal,
    lineCellsDone: Math.round(a.lineDone),
    lineCellsTotal: Math.round(a.lineTotal),
    knotsDone: a.knotsDone,
    knotsTotal: a.knotsTotal,
    done: Math.round(done),
    total: Math.round(total),
    // Never rounds up to 100 with work still outstanding: a chart that is
    // 99.7% worked reads 99%, and only a finished one reads 100.
    percent: percentDone(done, total, complete),
    // Counted, never inferred from the two sums: a chart of nothing but
    // half-cell back-stitch would round its way to "finished" otherwise.
    complete,
  }
}

function percentDone(done: number, total: number, complete: boolean): number {
  if (complete) return 100
  if (total <= 0) return 0
  return Math.min(99, Math.max(0, Math.round((done / total) * 100)))
}

function segmentLengthCells(seg: BackstitchSegment): number {
  return Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1)
}

/** Everything in the chart, whatever colour it is worked in. */
export function countStitchProgress(
  data: PatternData,
  stitched: ReadonlySet<string>,
): StitchProgress {
  const a = emptyAccumulator()
  for (const cell of data.grid.cells) {
    a.cellsTotal++
    a.elements++
    if (stitched.has(cellKey(cell.x, cell.y))) a.cellsDone++
    else a.outstanding++
  }
  for (const f of data.grid.fractional) {
    a.fractionalTotal++
    a.elements++
    if (stitched.has(fractionalKey(f))) a.fractionalDone++
    else a.outstanding++
  }
  for (const seg of data.grid.backstitch) {
    const len = segmentLengthCells(seg)
    a.lineTotal += len
    a.elements++
    if (stitched.has(backstitchKey(seg))) a.lineDone += len
    else a.outstanding++
  }
  for (const knot of data.grid.frenchKnots) {
    a.knotsTotal++
    a.elements++
    if (stitched.has(frenchKnotKey(knot))) a.knotsDone++
    else a.outstanding++
  }
  return finishAccumulator(a)
}

/**
 * The same counts split by palette symbol, in one pass over the chart rather
 * than one pass per colour. Every palette entry is present, including one
 * that carries nothing but line work.
 */
export function countStitchProgressBySymbol(
  data: PatternData,
  stitched: ReadonlySet<string>,
): Map<string, StitchProgress> {
  const acc = new Map<string, Accumulator>()
  const bucket = (symbol: string): Accumulator => {
    let a = acc.get(symbol)
    if (!a) {
      a = emptyAccumulator()
      acc.set(symbol, a)
    }
    return a
  }
  for (const entry of data.palette) bucket(entry.symbol)

  for (const cell of data.grid.cells) {
    const a = bucket(cell.s)
    a.cellsTotal++
    a.elements++
    if (stitched.has(cellKey(cell.x, cell.y))) a.cellsDone++
    else a.outstanding++
  }
  for (const f of data.grid.fractional) {
    const a = bucket(f.s)
    a.fractionalTotal++
    a.elements++
    if (stitched.has(fractionalKey(f))) a.fractionalDone++
    else a.outstanding++
  }
  for (const seg of data.grid.backstitch) {
    const a = bucket(seg.s)
    const len = segmentLengthCells(seg)
    a.lineTotal += len
    a.elements++
    if (stitched.has(backstitchKey(seg))) a.lineDone += len
    else a.outstanding++
  }
  for (const knot of data.grid.frenchKnots) {
    const a = bucket(knot.s)
    a.knotsTotal++
    a.elements++
    if (stitched.has(frenchKnotKey(knot))) a.knotsDone++
    else a.outstanding++
  }

  const out = new Map<string, StitchProgress>()
  for (const [symbol, a] of acc) out.set(symbol, finishAccumulator(a))
  return out
}

// ───────────────────────────────────────────────────────────────────────────
// Stitchability
// ───────────────────────────────────────────────────────────────────────────

/**
 * How the chart actually feels under the needle, as opposed to how big it is.
 *
 * Three deterministic measures, all computed straight off the grid:
 *
 *   confettiShare        Share of stitched cells that are isolated single
 *                        stitches — no cell of the same colour in any of the
 *                        eight surrounding positions. This is the thing
 *                        stitchers fear most: one stitch of a colour, alone,
 *                        thread started and finished for a single X.
 *
 *   colourChangesPer100  Colour changes met per 100 stitches while working
 *                        along rows. A high number means constant swapping
 *                        even when the blocks themselves are solid.
 *
 *   medianRunLength      Median length of an unbroken horizontal run of one
 *                        colour. The number that decides whether a row reads
 *                        as blocks of colour or as noise.
 *
 * A dense chart is not automatically a hard one: a 120-colour portrait built
 * out of long smooth gradients has low confetti and long runs, and stitches
 * more calmly than a 20-colour chart made of speckle. The band reflects that.
 */
export interface StitchabilityMetrics {
  /** 0–1. Share of stitched cells with no same-colour neighbour at all. */
  confettiShare: number
  /** Colour changes per 100 stitches, walking each row left to right. */
  colourChangesPer100: number
  /** Median unbroken horizontal run of a single colour, in stitches. */
  medianRunLength: number
  /** 1–5, where 5 is the easiest going and 1 the longest haul. */
  stitchability: number
}

/**
 * Band labels shown to stitchers. 5 is the calmest chart, 1 the most
 * demanding. Plain phrases, no jargon — a stitcher should know from the words
 * alone whether this is a Sunday afternoon or a winter project.
 */
export const STITCHABILITY_BANDS: Record<number, { label: string; blurb: string }> = {
  5: {
    label: 'Easy going',
    blurb: 'Big blocks of colour, very few single stitches. Good company for a film.',
  },
  4: {
    label: 'Steady',
    blurb: 'Solid runs of colour with occasional detail. Comfortable to pick up and put down.',
  },
  3: {
    label: 'Involved',
    blurb: 'Regular colour changes and some fine detail. Worth good light and a quiet hour.',
  },
  2: {
    label: 'Demanding',
    blurb: 'Frequent colour changes and short runs. Rewarding, but it asks for your attention.',
  },
  1: {
    label: 'Marathon',
    blurb: 'Lots of single stitches and constant colour changes. A long, absorbing project.',
  },
}

export function stitchabilityLabel(band: number | null | undefined): string | null {
  if (band == null) return null
  return STITCHABILITY_BANDS[band]?.label ?? null
}

/**
 * The friction index the band is cut from. Combines the three measures on a
 * common scale so one bad number cannot dominate:
 *
 *   - confetti is weighted hardest (it is the measure stitchers complain about)
 *   - colour changes carry the "constant swapping" cost
 *   - short median runs carry the "nothing to settle into" cost
 *
 * Higher index = more friction. Thresholds below were calibrated across the
 * live public cross-stitch catalogue so the five bands come out roughly
 * bell-shaped rather than piling into one end.
 */
export function stitchabilityIndex(m: {
  confettiShare: number
  colourChangesPer100: number
  medianRunLength: number
}): number {
  // Normalisers are the point at which a measure is as bad as it needs to get.
  // 6% isolated stitches is already a chart people warn each other about; 50
  // colour changes per 100 stitches is a change every other stitch; a median
  // run of 1 means no run at all, and 4 or more means real blocks of colour.
  const confetti = Math.min(1, m.confettiShare / 0.06)
  const changes = Math.min(1, m.colourChangesPer100 / 50)
  const runs = Math.min(1, Math.max(0, (4 - m.medianRunLength) / 3))
  return confetti * 0.4 + changes * 0.4 + runs * 0.2
}

/**
 * Thresholds on the friction index, easiest first. Calibrated over all 1,074
 * public cross-stitch patterns in the live catalogue so the bands come out
 * roughly bell-shaped (132 / 233 / 345 / 234 / 130 from Easy going to
 * Marathon) rather than piling into one end, and so the 100+ colour
 * showpieces spread across bands rather than all landing at 1 — a dense
 * gradient portrait is not the same thing as a speckled chart.
 */
const STITCHABILITY_CUTS = [0.2, 0.27, 0.35, 0.46] as const

export function stitchabilityBand(index: number): number {
  if (index < STITCHABILITY_CUTS[0]) return 5
  if (index < STITCHABILITY_CUTS[1]) return 4
  if (index < STITCHABILITY_CUTS[2]) return 3
  if (index < STITCHABILITY_CUTS[3]) return 2
  return 1
}

export function computeStitchabilityMetrics(data: PatternData): StitchabilityMetrics {
  const { width, height, cells } = data.grid
  const total = cells.length
  if (total === 0) {
    return { confettiShare: 0, colourChangesPer100: 0, medianRunLength: 0, stitchability: 5 }
  }

  // Dense lookup by cell index. Sparse grids stay sparse — only stitched
  // cells go in — so this is proportional to the stitched area, not the
  // bounding box.
  const at = new Map<number, string>()
  for (const c of cells) at.set(c.y * width + c.x, c.s)

  let isolated = 0
  for (const c of cells) {
    let touching = false
    for (let dy = -1; dy <= 1 && !touching; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = c.x + dx
        const ny = c.y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        if (at.get(ny * width + nx) === c.s) {
          touching = true
          break
        }
      }
    }
    if (!touching) isolated++
  }

  // Row walk. A gap in the stitching ends the current run but is not itself
  // a colour change — you are not swapping thread to stitch bare fabric.
  let changes = 0
  const runs: number[] = []
  for (let y = 0; y < height; y++) {
    let prev: string | null = null
    let run = 0
    const rowBase = y * width
    for (let x = 0; x < width; x++) {
      const s = at.get(rowBase + x)
      if (s === undefined) {
        if (run > 0) runs.push(run)
        run = 0
        prev = null
        continue
      }
      if (prev === null) {
        run = 1
        prev = s
        continue
      }
      if (s === prev) {
        run++
        continue
      }
      runs.push(run)
      run = 1
      changes++
      prev = s
    }
    if (run > 0) runs.push(run)
  }

  const confettiShare = round4(isolated / total)
  const colourChangesPer100 = round2((changes / total) * 100)
  const medianRunLength = round2(median(runs))

  return {
    confettiShare,
    colourChangesPer100,
    medianRunLength,
    stitchability: stitchabilityBand(
      stitchabilityIndex({ confettiShare, colourChangesPer100, medianRunLength }),
    ),
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
