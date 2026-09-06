/**
 * FRENCH KNOTS — the eye, the berry, the glint.
 *
 * Every best-selling kit dots a character's eye with a French knot rather than
 * a lone cross, and every one of ours ships that eye as a single dark stitch
 * marooned in a field of face colour. On the cloth those two things are not the
 * same: a lone cross sinks into the weave and reads as a fleck of dirt, while a
 * knot sits proud and reads as an eye. The chart already carries a `frenchKnots`
 * layer and the renderer already draws it; nothing ever put one there.
 *
 * The rule is deliberately narrow, because a knot in the wrong place is worse
 * than no knot at all. A cell qualifies only when it is:
 *
 *   isolated     no cell of its own colour anywhere in the surrounding eight —
 *                it is one stitch, alone.
 *   interior     all eight neighbours are stitched, so it is inside the design
 *                and not a nibble on the silhouette.
 *   surrounded   the eight neighbours AND the sixteen cells of the 5x5 ring are
 *                dominated by one colour — a face, a berry, a flat field. A dark
 *                speck on a busy edge is detail, not an eye.
 *   contrasting  much darker, or genuinely white-bright, against that field.
 *
 * The stitch is not deleted: the cell is refilled with the field colour and the
 * knot goes on top in the original floss, which is exactly how a stitcher works
 * one. That also takes a confetti stitch out of the chart.
 *
 * Pure — no Prisma, no sharp, no `server-only`. Tested on synthetic grids in
 * `french-knots.test.ts`.
 */

import type { PatternData, PatternCell } from '@homemade/db'
import { rgbToLab } from '@/lib/floss/equivalence-table'

// ───────────────────────────────────────────────────────────────────────────
// Tunables
// ───────────────────────────────────────────────────────────────────────────

/** Lab distance from the surrounding field below which the speck is just shading. */
export const MIN_KNOT_DELTA_E = 34

/** How much darker than its field a dark speck has to be, in L. */
export const MIN_KNOT_DARKER_L = 18

/** A light speck has to be both this much lighter and genuinely bright. */
export const MIN_KNOT_LIGHTER_L = 22
export const MIN_KNOT_LIGHT_L = 78

/** Of the eight neighbours, how many must be the one dominant field colour. */
export const MIN_NEIGHBOUR_FIELD = 6

/** Of the sixteen cells in the 5x5 ring, the share that must be the field colour. */
export const MIN_RING_FIELD_SHARE = 0.5

/** Hard ceiling on knots in one chart — a knot is a highlight, not a texture. */
export const MAX_KNOTS = 24

/** And never more than this share of the stitched cells. */
export const MAX_KNOT_SHARE = 0.002

export interface FrenchKnotOptions {
  maxKnots?: number
  minDeltaE?: number
}

export interface FrenchKnotResult {
  data: PatternData
  /** How many lone crosses became knots. */
  knots: number
  /** One phrase for the record. */
  reason: string
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m?.[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function labBySymbol(data: PatternData): Map<string, [number, number, number]> {
  const out = new Map<string, [number, number, number]>()
  for (const p of data.palette) {
    const [r, g, b] = hexToRgb(p.rgb)
    out.set(p.symbol, rgbToLab(r, g, b))
  }
  return out
}

function deltaE(a: [number, number, number], b: [number, number, number]): number {
  const dl = a[0] - b[0]
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dl * dl + da * da + db * db)
}

interface Candidate {
  x: number
  y: number
  symbol: string
  field: string
  contrast: number
}

/**
 * Find the lone specks worth working as knots and rewrite them. Returns the
 * chart unchanged when nothing qualifies, or when the chart already carries
 * knots (a chart is only ever embellished once).
 */
export function deriveFrenchKnots(
  data: PatternData,
  opts: FrenchKnotOptions = {},
): FrenchKnotResult {
  if (data.grid.frenchKnots.length > 0) {
    return { data, knots: 0, reason: 'chart already has French knots' }
  }
  const { width, height, cells } = data.grid
  if (cells.length === 0) return { data, knots: 0, reason: 'empty chart' }

  const minDeltaE = opts.minDeltaE ?? MIN_KNOT_DELTA_E
  // A pair of eyes is two knots, so even the smallest motif gets a pair to spend;
  // beyond that the budget grows with the chart and stops at the hard ceiling.
  const budget = Math.min(
    opts.maxKnots ?? MAX_KNOTS,
    Math.max(2, Math.floor(cells.length * MAX_KNOT_SHARE)),
  )
  if (budget <= 0) return { data, knots: 0, reason: 'no knot budget' }

  const lab = labBySymbol(data)
  const at = new Map<number, string>()
  for (const c of cells) at.set(c.y * width + c.x, c.s)
  const sym = (x: number, y: number): string | undefined => {
    if (x < 0 || y < 0 || x >= width || y >= height) return undefined
    return at.get(y * width + x)
  }

  const candidates: Candidate[] = []
  for (const c of cells) {
    const me = lab.get(c.s)
    if (!me) continue

    // Interior, isolated, and what the eight neighbours are made of.
    const counts = new Map<string, number>()
    let interior = true
    for (let dy = -1; dy <= 1 && interior; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const s = sym(c.x + dx, c.y + dy)
        if (s === undefined) {
          interior = false
          break
        }
        counts.set(s, (counts.get(s) ?? 0) + 1)
      }
    }
    if (!interior) continue
    if ((counts.get(c.s) ?? 0) > 0) continue // not alone — part of a shape

    let field = ''
    let fieldN = 0
    for (const [s, n] of counts) {
      if (n > fieldN) {
        field = s
        fieldN = n
      }
    }
    if (fieldN < MIN_NEIGHBOUR_FIELD) continue

    // The wider ring: a knot belongs in a field, not on a boundary.
    let ring = 0
    let ringField = 0
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) continue
        ring++
        if (sym(c.x + dx, c.y + dy) === field) ringField++
      }
    }
    if (ring === 0 || ringField / ring < MIN_RING_FIELD_SHARE) continue

    const fieldLab = lab.get(field)
    if (!fieldLab) continue
    const contrast = deltaE(me, fieldLab)
    if (contrast < minDeltaE) continue

    const darker = me[0] <= fieldLab[0] - MIN_KNOT_DARKER_L
    const lighter = me[0] >= fieldLab[0] + MIN_KNOT_LIGHTER_L && me[0] >= MIN_KNOT_LIGHT_L
    if (!darker && !lighter) continue

    candidates.push({ x: c.x, y: c.y, symbol: c.s, field, contrast })
  }

  if (candidates.length === 0) {
    return { data, knots: 0, reason: 'no lone specks worth a knot' }
  }

  // Strongest contrast first, deterministic on ties so a re-run is the same chart.
  candidates.sort((a, b) => b.contrast - a.contrast || a.y - b.y || a.x - b.x)
  const chosen = candidates.slice(0, budget)

  const replace = new Map<number, string>()
  for (const k of chosen) replace.set(k.y * width + k.x, k.field)

  const nextCells: PatternCell[] = cells.map((c) => {
    const field = replace.get(c.y * width + c.x)
    return field === undefined ? c : { ...c, s: field }
  })

  return {
    data: {
      ...data,
      grid: {
        ...data.grid,
        cells: nextCells,
        frenchKnots: chosen.map((k) => ({ x: k.x, y: k.y, s: k.symbol })),
      },
    },
    knots: chosen.length,
    reason: `${chosen.length} lone stitch${chosen.length === 1 ? '' : 'es'} worked as French knots`,
  }
}
