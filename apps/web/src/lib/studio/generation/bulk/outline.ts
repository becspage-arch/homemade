/**
 * OUTLINES — teach the chart to draw its own edges in back-stitch.
 *
 * Every pattern in the catalogue is a flat block of whole crosses. The schema
 * has carried a `backstitch` layer since day one and the Studio editor has a
 * back-stitch tool, but the converter has never emitted a single segment, so a
 * library chart next to a Vihola mouse or a Caterpillar deer looks like the
 * same drawing with the pencil work rubbed out. Outlines are what make a
 * character's face read at stitch resolution: the eye is not a dark square, it
 * is a shape with a line round it.
 *
 * This module is a PURE function over a finished chart — no image, no model, no
 * judgement. Given PatternData it finds the silhouette and the strong internal
 * boundaries between colour REGIONS (not between every pair of neighbouring
 * cells, which would be a scribble), chains them into stitchable lines, and
 * emits back-stitch along cell edges, cutting diagonals where the boundary
 * staircases. That is how a stitcher works an outline: long runs along the
 * holes, corner to corner across a step.
 *
 * Three things keep it an outline rather than a mess:
 *
 *   regions      a boundary is only worth stitching when both sides are real
 *                areas of colour. A four-cell blob of shading is texture.
 *   contrast     boundaries between near-identical flosses are skipped — you
 *                cannot see them, so a line there just adds work.
 *   the cap      total back-stitch length is capped against the stitch count,
 *                and candidates are taken strongest-first, so a busy chart gets
 *                its silhouette and its best internal lines and nothing else.
 *
 * Which charts get what is the lane/style question, and it is answered by
 * `outlineModeFor`: full outlines for the bold, flat, characterful lanes,
 * silhouette only for the soft ones (botanical, pastel), and nothing at all for
 * work that is already line work (Delft, blackwork) or that is dense enough for
 * an outline to fight the picture (the showpiece tier).
 *
 * Pure: no `server-only`, no Prisma, no sharp. The bulk converter, the backfill
 * script and the tests all call the same functions.
 */

import { computeStitchabilityMetrics, type PatternData, type PaletteEntry, type BackstitchSegment } from '@homemade/db'
import { rgbToLab } from '@/lib/floss/equivalence-table'
import { nearestFloss } from '@/lib/floss/nearest-floss'
import { shiftColour } from '@/components/studio/chart/render-helpers'
import { SYMBOL_GLYPHS } from '@/lib/studio/symbol-assignment'
import { isNearWhite, FULL_COVERAGE_COLOURS } from './bare-fabric'
import { deriveFrenchKnots, type FrenchKnotOptions } from './french-knots'

// ───────────────────────────────────────────────────────────────────────────
// Modes
// ───────────────────────────────────────────────────────────────────────────

export type OutlineMode = 'none' | 'silhouette' | 'full'

/**
 * Styles whose charts are bold and flat — a drawn illustration with clear areas
 * of colour. An outline is what the drawing already implies, so these get the
 * silhouette AND the strong internal edges.
 */
const FULL_OUTLINE_STYLES: ReadonlySet<string> = new Set([
  'bright',
  'cute',
  'fun',
  'scene',
  'popart',
  'icon',
  'fantasy',
])

/**
 * Styles that are soft on purpose. A wildflower stem with a black line round
 * every petal stops being delicate, so these get the outer edge only — the
 * silhouette that lifts the motif off the cloth, and nothing inside it.
 */
const SILHOUETTE_STYLES: ReadonlySet<string> = new Set([
  'botanical',
  'pastel',
  'wreath',
  'artface',
  'dogportrait',
])

/**
 * Styles left alone. `showpiece` and `landscape` are stitched edge to edge and
 * carry their detail in colour; a line through them is noise, and the gain is
 * not obvious enough to spend a stitcher's evening on.
 */
const NO_OUTLINE_STYLES: ReadonlySet<string> = new Set(['showpiece', 'landscape'])

/** Colour count at or below which a chart is line work already (Delft, blackwork). */
export const MONOCHROME_COLOURS = 3

/**
 * Confetti share above which a chart gets no internal outlines.
 *
 * A speckled chart has no edges to draw. `dandelion-close-up` is the case that
 * set this: a quarter of its stitches are isolated singles, its colour regions
 * are seed filaments one cell wide, and a full outline came back as 1,042
 * segments of line laid over what is already a drawing made of lines. The
 * silhouette of such a chart is no better: the seed head is one blob with a
 * fractal boundary, so the "outline" comes back as two thousand cells of line
 * round the filaments. A speckled chart gets nothing.
 */
export const MAX_CONFETTI_FOR_FULL = 0.12

/** Up to this many colours, a single-hue or greyscale scheme still counts as line work. */
const NARROW_SCHEME_COLOURS = 8

/** Chroma below which a floss is a grey rather than a colour. */
const GREY_MAX_CHROMA = 10

/** Hue spread, in degrees, under which a small palette is one colour in several shades. */
const SINGLE_HUE_DEGREES = 40

/**
 * Is this chart line work already?
 *
 * Delft is one blue in three or four shades on white; blackwork is greys. Both
 * ARE the outline — a back-stitch line through them adds nothing and muddies
 * what is deliberately spare. Anything with a handful of genuinely different
 * hues is a picture, and gets treated as one.
 */
export function looksLikeLineWork(data: PatternData): { yes: boolean; reason: string } {
  const colourful = data.palette.filter((p) => !isNearWhite(p))
  if (colourful.length <= MONOCHROME_COLOURS) {
    return {
      yes: true,
      reason: `line work already — ${colourful.length} colour${colourful.length === 1 ? '' : 's'} beside the white`,
    }
  }
  if (colourful.length > NARROW_SCHEME_COLOURS) return { yes: false, reason: '' }

  const labs = colourful.map((p) => labOf(p.rgb))
  const chroma = labs.map((l) => Math.hypot(l[1], l[2]))
  if (chroma.every((c) => c < GREY_MAX_CHROMA)) {
    return { yes: true, reason: `line work already — ${colourful.length} greys, no colour` }
  }
  const hues = labs.filter((_, i) => chroma[i]! >= GREY_MAX_CHROMA).map(hueOf)
  let spread = 0
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) spread = Math.max(spread, hueGap(hues[i]!, hues[j]!))
  }
  if (spread < SINGLE_HUE_DEGREES) {
    return { yes: true, reason: `line work already — ${colourful.length} shades of one colour` }
  }
  return { yes: false, reason: '' }
}

export interface OutlineContext {
  /** Size lane the brief used, when the row has one on record. */
  lane?: string | null
  /** Style key the brief used. */
  style?: string | null
  /** Shelf slug — `monochrome` is the Delft / blackwork shelf. */
  shelf?: string | null
}

export interface OutlineModeVerdict {
  mode: OutlineMode
  reason: string
}

/**
 * Which outline this chart should get. Lane and style win where the brief is on
 * record; the rest of the catalogue falls through to the chart itself.
 */
export function outlineModeFor(data: PatternData, ctx: OutlineContext = {}): OutlineModeVerdict {
  if (data.grid.backstitch.length > 0) {
    return { mode: 'none', reason: 'chart already carries back-stitch' }
  }

  if (ctx.shelf === 'monochrome') return { mode: 'none', reason: 'the monochrome shelf is line work' }
  const lineWork = looksLikeLineWork(data)
  if (lineWork.yes) return { mode: 'none', reason: lineWork.reason }

  const lane = ctx.lane ?? ''
  const style = ctx.style ?? ''
  if (lane === 'dense') return { mode: 'none', reason: 'dense showpiece tier' }
  if (NO_OUTLINE_STYLES.has(style)) return { mode: 'none', reason: `${style} — full-coverage scene` }
  if (data.palette.length >= FULL_COVERAGE_COLOURS) {
    return { mode: 'none', reason: `showpiece tier — ${data.palette.length} colours` }
  }

  if (SILHOUETTE_STYLES.has(style)) return { mode: 'silhouette', reason: `${style} — soft lane` }

  // Speckle beats the brief: a chart made of single stitches has no edges to
  // draw whatever lane it came from.
  const confetti = computeStitchabilityMetrics(data).confettiShare
  if (confetti > MAX_CONFETTI_FOR_FULL) {
    return {
      mode: 'none',
      reason: `speckled chart — ${(confetti * 100).toFixed(0)}% single stitches, nothing to outline`,
    }
  }

  if (FULL_OUTLINE_STYLES.has(style)) return { mode: 'full', reason: `${style} — bold flat lane` }

  // No brief on record: most of the old catalogue. Judge on the chart. A modest
  // palette is a drawing and takes a full outline; a big one is painterly and
  // gets its silhouette only.
  if (data.palette.length <= 30) return { mode: 'full', reason: `${data.palette.length} colours — flat enough for a full outline` }
  return { mode: 'silhouette', reason: `${data.palette.length} colours — painterly, silhouette only` }
}

// ───────────────────────────────────────────────────────────────────────────
// Tunables
// ───────────────────────────────────────────────────────────────────────────

/**
 * Lab distance below which two flosses are the same colour to the eye. A line
 * between them is invisible thread on invisible thread.
 */
export const MIN_EDGE_DELTA_E = 26

/** Share of the stitched cells below which a same-colour region is texture. */
export const MIN_REGION_SHARE = 0.004

/** ...and never fewer than this many cells, whatever the chart's size. */
export const MIN_REGION_CELLS = 10

/** Chains shorter than this many cells of line are specks, not outlines. */
export const MIN_CHAIN_LENGTH = 4

/**
 * The smoothness floor — mean length of one straight piece of a line, in cells.
 *
 * This is the measure that separates a DRAWN edge from a PHOTOGRAPHIC one, and
 * it is the thing the first proof run needed most. A drawn illustration's colour
 * regions meet along runs and clean 45-degree steps, so a traced line comes back
 * as a handful of long pieces. A painterly one — a lavender field receding to a
 * hill, a dandelion clock, the soft edge of a fairy's wing — meets along a
 * boundary that jitters one cell at a time, and comes back as dozens of unit
 * stubs. Stitching that is not an outline; it is a scribble that fights the
 * design, and on the proof sheets it was instantly the worst thing on the page.
 *
 * Internal boundaries are held to the higher bar because they are optional; the
 * silhouette, which is what lifts a motif off the cloth, is allowed to be a
 * little more ragged.
 */
export const MIN_MEAN_PIECE_INTERNAL = 2.2
export const MIN_MEAN_PIECE_SILHOUETTE = 1.6

/**
 * Longest single line the tracer will hand back, in cells.
 *
 * A boundary network in a full-coverage picture is CONNECTED: trace it and one
 * chain can snake through the whole chart. That is neither how anybody stitches
 * (you work a line, fasten off, start the next) nor something the length cap can
 * reason about — a single chain longer than the whole budget gets dropped and
 * the chart comes back with almost no outline at all, which is exactly what the
 * first proof run did on an alpine village. So a long chain is cut into
 * stitchable lines, each ranked on its own merit.
 */
export const MAX_CHAIN_LENGTH = 48

/**
 * The cap that keeps an outline an outline.
 *
 * Line length does not scale with stitch count — it scales with the square root
 * of it, because an outline is a perimeter and the stitching is an area. A
 * solid block of 100 stitches has a 40-cell edge (0.4 per stitch); the same
 * shape at 10,000 stitches has a 400-cell edge (0.04 per stitch). A flat
 * per-stitch ratio therefore either strangles the small charts or lets the big
 * ones fill with line, which is exactly the scribble this cap exists to stop.
 *
 * So the budget is `LENGTH_PER_ROOT_STITCH × √stitches`: 120 cells of line for a
 * 100-stitch motif, 850 for a 5,000-stitch character (its silhouette is about
 * 300 of that, leaving room for the face and the strongest internal edges), and
 * 1,700 for a 20,000-stitch scene.
 */
export const LENGTH_PER_ROOT_STITCH = 12

/** The back-stitch budget, in cells of line, for a chart of `stitches` crosses. */
export function outlineLengthCap(stitches: number, perRoot = LENGTH_PER_ROOT_STITCH): number {
  return perRoot * Math.sqrt(stitches)
}

/**
 * The fragment floor: an outline has to be a decision about the whole piece.
 *
 * A lavender field came back with one 63-cell staircase across the top of a
 * hill and nothing anywhere else, and a pine marten with 71 cells along the
 * edge of a log. Neither reads as an outline — each reads as a line somebody
 * forgot to rub out. If less than this share of the chart's own back-stitch
 * budget is worth stitching, the honest answer is that the chart has no
 * drawable edges and gets none.
 */
export const MIN_OUTLINE_SHARE_OF_CAP = 0.15

/** How many dark flosses an outline may use. */
export const MAX_OUTLINE_INKS = 2

/** Lightness at or below which a palette entry is dark enough to outline in. */
const DARK_INK_MAX_L = 45

/** A second ink has to be this far round the hue circle to be worth carrying. */
const SECOND_INK_MIN_HUE_DEGREES = 45

/** ...and has to win at least this share of the lines. */
const SECOND_INK_MIN_SHARE = 0.2

export interface DeriveBackstitchOptions {
  mode?: OutlineMode
  minEdgeDeltaE?: number
  minRegionCells?: number
  minChainLength?: number
  /** Longest single traced line, in cells. See `MAX_CHAIN_LENGTH`. */
  maxChainLength?: number
  /** Smoothness floors — mean piece length. See `MIN_MEAN_PIECE_INTERNAL`. */
  minMeanPieceInternal?: number
  minMeanPieceSilhouette?: number
  /** Fragment floor, as a share of the length cap. See `MIN_OUTLINE_SHARE_OF_CAP`. */
  minShareOfCap?: number
  /** Cells of line per root stitch. See `outlineLengthCap`. */
  lengthPerRootStitch?: number
  maxInks?: number
}

export interface BackstitchResult {
  data: PatternData
  mode: OutlineMode
  /** Segments emitted. */
  segments: number
  /** Total stitched length, in cells (a diagonal counts √2). */
  totalLength: number
  /** Palette symbols added for the outline floss, if any. */
  addedSymbols: string[]
  /** Floss codes the outline is worked in. */
  inkCodes: string[]
  reason: string
}

// ───────────────────────────────────────────────────────────────────────────
// Colour helpers
// ───────────────────────────────────────────────────────────────────────────

type Lab = [number, number, number]

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m?.[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function labOf(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex)
  return rgbToLab(r, g, b)
}

function deltaE(a: Lab, b: Lab): number {
  const dl = a[0] - b[0]
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dl * dl + da * da + db * db)
}

/** Hue angle in degrees on the Lab a/b plane. */
function hueOf(lab: Lab): number {
  return (Math.atan2(lab[2], lab[1]) * 180) / Math.PI
}

function hueGap(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// ───────────────────────────────────────────────────────────────────────────
// Edges
// ───────────────────────────────────────────────────────────────────────────

interface UnitEdge {
  /** Corner-node ids, `cy * (width + 1) + cx`. */
  a: number
  b: number
  /** 0–1: how strong the boundary is. The silhouette is always 1. */
  contrast: number
  silhouette: boolean
  /** Summed Lab of the stitched cells either side, for picking the ink. */
  lab: Lab
  labN: number
}

/** Label same-colour 4-connected regions. Returns a label per cell index, -1 for bare. */
function labelRegions(
  width: number,
  height: number,
  symbolAt: (i: number) => string | undefined,
): { label: Int32Array; size: number[] } {
  const label = new Int32Array(width * height).fill(-1)
  const size: number[] = []
  const stack: number[] = []
  for (let start = 0; start < width * height; start++) {
    if (label[start] !== -1) continue
    const s = symbolAt(start)
    if (s === undefined) continue
    const id = size.length
    size.push(0)
    label[start] = id
    stack.push(start)
    let n = 0
    while (stack.length > 0) {
      const i = stack.pop()!
      n++
      const x = i % width
      const y = (i - x) / width
      const push = (nx: number, ny: number): void => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return
        const j = ny * width + nx
        if (label[j] !== -1) return
        if (symbolAt(j) !== s) return
        label[j] = id
        stack.push(j)
      }
      push(x + 1, y)
      push(x - 1, y)
      push(x, y + 1)
      push(x, y - 1)
    }
    size[id] = n
  }
  return { label, size }
}

// ───────────────────────────────────────────────────────────────────────────
// Chains
// ───────────────────────────────────────────────────────────────────────────

interface Piece {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface Chain {
  pieces: Piece[]
  length: number
  contrast: number
  silhouette: boolean
  /** Mean colour of the design either side of the line. */
  lab: Lab
}

/** Walk the corner graph into polylines, preferring to run straight on. */
function traceChains(edges: UnitEdge[], width: number, maxChain: number): Chain[] {
  const adj = new Map<number, number[]>()
  const add = (node: number, e: number): void => {
    const list = adj.get(node)
    if (list) list.push(e)
    else adj.set(node, [e])
  }
  edges.forEach((e, i) => {
    add(e.a, i)
    add(e.b, i)
  })

  const nodeX = (n: number): number => n % (width + 1)
  const nodeY = (n: number): number => (n - (n % (width + 1))) / (width + 1)

  const used = new Uint8Array(edges.length)
  const chains: Chain[] = []

  /** Extend from `node`, having arrived along `dir`. Returns the node path (excluding `node`). */
  const extend = (node: number, dir: [number, number]): { path: number[]; edges: number[] } => {
    const path: number[] = []
    const taken: number[] = []
    let here = node
    let heading = dir
    for (;;) {
      const around = adj.get(here) ?? []
      const free = around.filter((i) => !used[i])
      if (free.length === 0) break
      let best = -1
      let bestTurn = Infinity
      for (const i of free) {
        const e = edges[i]!
        const other = e.a === here ? e.b : e.a
        const d: [number, number] = [nodeX(other) - nodeX(here), nodeY(other) - nodeY(here)]
        // Turn cost: 0 straight on, 1 a right angle, 2 doubling back.
        const dot = heading[0] * d[0] + heading[1] * d[1]
        const turn = 1 - dot
        if (turn < bestTurn) {
          bestTurn = turn
          best = i
        }
      }
      if (best < 0) break
      // A junction where three or more boundaries meet is where one line ends
      // and another starts, unless the line simply runs straight through it.
      if (around.length >= 3 && bestTurn > 0) break
      const e = edges[best]!
      const other = e.a === here ? e.b : e.a
      used[best] = 1
      taken.push(best)
      path.push(other)
      heading = [nodeX(other) - nodeX(here), nodeY(other) - nodeY(here)]
      here = other
    }
    return { path, edges: taken }
  }

  for (let seed = 0; seed < edges.length; seed++) {
    if (used[seed]) continue
    const e0 = edges[seed]!
    used[seed] = 1
    const dirFwd: [number, number] = [nodeX(e0.b) - nodeX(e0.a), nodeY(e0.b) - nodeY(e0.a)]
    const fwd = extend(e0.b, dirFwd)
    const back = extend(e0.a, [-dirFwd[0], -dirFwd[1]])
    const nodes = [...back.path.slice().reverse(), e0.a, e0.b, ...fwd.path]
    const edgeIds = [seed, ...fwd.edges, ...back.edges]

    let contrast = 0
    let silhouette = 0
    const lab: Lab = [0, 0, 0]
    let labN = 0
    for (const i of edgeIds) {
      const e = edges[i]!
      contrast += e.contrast
      if (e.silhouette) silhouette++
      lab[0] += e.lab[0]
      lab[1] += e.lab[1]
      lab[2] += e.lab[2]
      labN += e.labN
    }
    const pieces = simplify(nodes.map((n) => [nodeX(n), nodeY(n)] as [number, number]))
    const meta = {
      contrast: contrast / edgeIds.length,
      silhouette: silhouette * 2 >= edgeIds.length,
      lab: (labN > 0 ? [lab[0] / labN, lab[1] / labN, lab[2] / labN] : [0, 0, 0]) as Lab,
    }
    for (const run of cut(pieces, maxChain)) {
      chains.push({
        pieces: run,
        length: run.reduce((a, p) => a + Math.hypot(p.x2 - p.x1, p.y2 - p.y1), 0),
        ...meta,
      })
    }
  }

  return chains
}

/** Cut a traced line into runs no longer than `maxLength` cells, splitting only between pieces. */
function cut(pieces: Piece[], maxLength: number): Piece[][] {
  const runs: Piece[][] = []
  let run: Piece[] = []
  let len = 0
  for (const p of pieces) {
    const l = Math.hypot(p.x2 - p.x1, p.y2 - p.y1)
    if (run.length > 0 && len + l > maxLength) {
      runs.push(run)
      run = []
      len = 0
    }
    run.push(p)
    len += l
  }
  if (run.length > 0) runs.push(run)
  return runs
}

/**
 * Turn a unit-step polyline into stitchable segments: collinear steps merge into
 * one long run, and a staircase of at least four alternating steps becomes
 * diagonals corner to corner — which is how the boundary is actually worked, and
 * what stops a curved outline reading as brickwork.
 */
function simplify(nodes: [number, number][]): Piece[] {
  if (nodes.length < 2) return []

  // 1. Collinear merge.
  const runs: Piece[] = []
  let ax = nodes[0]![0]
  let ay = nodes[0]![1]
  let dx = nodes[1]![0] - ax
  let dy = nodes[1]![1] - ay
  for (let i = 1; i < nodes.length; i++) {
    const [x, y] = nodes[i]!
    const px = nodes[i - 1]![0]
    const py = nodes[i - 1]![1]
    const sx = x - px
    const sy = y - py
    if (i > 1 && (sx !== dx || sy !== dy)) {
      runs.push({ x1: ax, y1: ay, x2: px, y2: py })
      ax = px
      ay = py
      dx = sx
      dy = sy
    }
  }
  runs.push({
    x1: ax,
    y1: ay,
    x2: nodes[nodes.length - 1]![0],
    y2: nodes[nodes.length - 1]![1],
  })

  // 2. Staircase → diagonals.
  const out: Piece[] = []
  const isUnit = (p: Piece): boolean => Math.abs(p.x2 - p.x1) + Math.abs(p.y2 - p.y1) === 1
  let i = 0
  while (i < runs.length) {
    let j = i
    while (
      j + 1 < runs.length &&
      isUnit(runs[j]!) &&
      isUnit(runs[j + 1]!) &&
      // perpendicular, and turning the same way each time
      (runs[j]!.x2 - runs[j]!.x1) * (runs[j + 1]!.x2 - runs[j + 1]!.x1) +
        (runs[j]!.y2 - runs[j]!.y1) * (runs[j + 1]!.y2 - runs[j + 1]!.y1) ===
        0 &&
      (j === i ||
        // the step pattern has to keep alternating in the same two directions
        (runs[j + 1]!.x2 - runs[j + 1]!.x1 === runs[j - 1]!.x2 - runs[j - 1]!.x1 &&
          runs[j + 1]!.y2 - runs[j + 1]!.y1 === runs[j - 1]!.y2 - runs[j - 1]!.y1))
    ) {
      j++
    }
    const steps = j - i + 1
    if (steps >= 4) {
      // Pair the steps off into diagonals; an odd step at the end stays as it is.
      let k = i
      while (k + 1 <= j) {
        out.push({ x1: runs[k]!.x1, y1: runs[k]!.y1, x2: runs[k + 1]!.x2, y2: runs[k + 1]!.y2 })
        k += 2
      }
      if (k <= j) out.push(runs[k]!)
      i = j + 1
    } else {
      out.push(runs[i]!)
      i++
    }
  }

  // 3. One more collinear merge, now that the staircases are diagonals: a long
  // smooth 45-degree edge should be ONE line, not eight little ones. This is
  // also what makes a line's mean piece length a usable measure of how smooth
  // the boundary is — see the smoothness floor in `deriveBackstitch`.
  const merged: Piece[] = []
  for (const p of out) {
    const last = merged[merged.length - 1]
    if (last && last.x2 === p.x1 && last.y2 === p.y1) {
      const dx1 = last.x2 - last.x1
      const dy1 = last.y2 - last.y1
      const dx2 = p.x2 - p.x1
      const dy2 = p.y2 - p.y1
      // Same direction (cross product zero, dot product positive).
      if (dx1 * dy2 - dy1 * dx2 === 0 && dx1 * dx2 + dy1 * dy2 > 0) {
        merged[merged.length - 1] = { x1: last.x1, y1: last.y1, x2: p.x2, y2: p.y2 }
        continue
      }
    }
    merged.push(p)
  }
  return merged
}

// ───────────────────────────────────────────────────────────────────────────
// The ink
// ───────────────────────────────────────────────────────────────────────────

interface Ink {
  entry: PaletteEntry
  lab: Lab
  hue: number
  added: boolean
}

function freeSymbol(used: Set<string>): string {
  for (const glyph of SYMBOL_GLYPHS) {
    if (!used.has(glyph)) return glyph
  }
  // The glyph catalogue is far larger than any chart's palette, but never emit
  // a duplicate symbol — the schema would rightly refuse the chart.
  throw new Error('outline: no chart symbol left for the outline floss')
}

/**
 * Pick the one or two dark flosses the outline is worked in.
 *
 * A dark stand already in the palette is always preferred — it is one fewer
 * skein to buy and it belongs to the piece. When the palette has nothing dark
 * (a pastel nursery print, a pale botanical), a dark version of the chart's own
 * darkest colour is resolved against the real DMC range, so the outline is a
 * deep plum on a pink piece rather than a slab of black.
 */
function chooseInks(data: PatternData, chains: Chain[], maxInks: number): Ink[] {
  const dark = data.palette
    .map((entry) => ({ entry, lab: labOf(entry.rgb) }))
    .filter((c) => c.lab[0] <= DARK_INK_MAX_L)
    .sort((a, b) => a.lab[0] - b.lab[0])

  const inks: Ink[] = []
  if (dark.length > 0) {
    const first = dark[0]!
    inks.push({ entry: first.entry, lab: first.lab, hue: hueOf(first.lab), added: false })
  } else {
    const base = data.palette
      .map((entry) => ({ entry, lab: labOf(entry.rgb) }))
      .sort((a, b) => a.lab[0] - b.lab[0])[0]!
    // Darken the chart's own darkest colour until it is real outline ink, then
    // resolve it to a stand that actually exists.
    const target = shiftColour(base.entry.rgb, -0.62)
    const { entry: floss } = nearestFloss(target, { brand: base.entry.brand })
    const used = new Set(data.palette.map((p) => p.symbol))
    const added: PaletteEntry = {
      symbol: freeSymbol(used),
      brand: base.entry.brand,
      code: floss.code,
      name: floss.name,
      rgb: floss.rgb,
      strandsFullCross: 2,
      strandsBackstitch: 1,
    }
    const lab = labOf(added.rgb)
    inks.push({ entry: added, lab, hue: hueOf(lab), added: true })
  }

  if (maxInks < 2 || dark.length < 2 || chains.length < 6) return inks

  const primary = inks[0]!
  for (const cand of dark.slice(1)) {
    const hue = hueOf(cand.lab)
    if (hueGap(hue, primary.hue) < SECOND_INK_MIN_HUE_DEGREES) continue
    const wins = chains.filter(
      (c) => hueGap(hueOf(c.lab), hue) < hueGap(hueOf(c.lab), primary.hue),
    ).length
    if (wins / chains.length < SECOND_INK_MIN_SHARE) continue
    inks.push({ entry: cand.entry, lab: cand.lab, hue, added: false })
    break
  }
  return inks
}

// ───────────────────────────────────────────────────────────────────────────
// The derivation
// ───────────────────────────────────────────────────────────────────────────

/**
 * Derive the back-stitch outline for one chart. Returns the chart unchanged
 * when the mode is `none`, when it already carries back-stitch, or when nothing
 * in the grid clears the bar.
 */
export function deriveBackstitch(
  data: PatternData,
  opts: DeriveBackstitchOptions = {},
): BackstitchResult {
  const mode = opts.mode ?? 'full'
  const unchanged = (reason: string): BackstitchResult => ({
    data,
    mode,
    segments: 0,
    totalLength: 0,
    addedSymbols: [],
    inkCodes: [],
    reason,
  })

  if (mode === 'none') return unchanged('outlines are off for this chart')
  if (data.grid.backstitch.length > 0) return unchanged('chart already carries back-stitch')

  const { width, height, cells } = data.grid
  if (cells.length === 0) return unchanged('empty chart')

  const minDeltaE = opts.minEdgeDeltaE ?? MIN_EDGE_DELTA_E
  const minRegion = opts.minRegionCells ?? Math.max(MIN_REGION_CELLS, Math.round(cells.length * MIN_REGION_SHARE))
  const minChain = opts.minChainLength ?? MIN_CHAIN_LENGTH
  const cap = outlineLengthCap(cells.length, opts.lengthPerRootStitch)

  const symbolAt = new Map<number, string>()
  for (const c of cells) symbolAt.set(c.y * width + c.x, c.s)
  const symOf = (i: number): string | undefined => symbolAt.get(i)

  const lab = new Map<string, Lab>()
  for (const p of data.palette) lab.set(p.symbol, labOf(p.rgb))

  // Two labellings. Colour regions decide whether an INTERNAL boundary is worth
  // a line; the stitched blob decides whether a piece of SILHOUETTE is worth
  // one, so a stray speck of a stitch never gets drawn round while a small dark
  // region on the edge of a big subject still gets its share of the outline.
  const { label, size } = labelRegions(width, height, symOf)
  const blob = labelRegions(width, height, (i) => (symOf(i) === undefined ? undefined : 'S'))
  const bigBlob = (i: number): boolean => {
    const id = blob.label[i]
    return id !== undefined && id >= 0 && (blob.size[id] ?? 0) >= minRegion
  }

  const node = (cx: number, cy: number): number => cy * (width + 1) + cx
  const edges: UnitEdge[] = []

  const push = (
    a: number,
    b: number,
    contrast: number,
    silhouette: boolean,
    labs: Lab[],
  ): void => {
    const sum: Lab = [0, 0, 0]
    for (const l of labs) {
      sum[0] += l[0]
      sum[1] += l[1]
      sum[2] += l[2]
    }
    edges.push({ a, b, contrast, silhouette, lab: sum, labN: labs.length })
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const me = symOf(i)

      // The vertical boundary on this cell's right-hand side. The grid's own
      // edge is NOT a boundary: a full-coverage chart is stitched to the edge of
      // the cloth on purpose, and drawing round the rectangle would frame the
      // picture in back-stitch rather than outline anything in it.
      const rx = x + 1
      const right = rx < width ? symOf(i + 1) : undefined
      if (rx < width && me !== right) {
        const edgeA = node(rx, y)
        const edgeB = node(rx, y + 1)
        if (me === undefined || right === undefined) {
          if (me !== undefined || right !== undefined) {
            const l = lab.get((me ?? right)!)
            if (l && bigBlob(me !== undefined ? i : i + 1)) push(edgeA, edgeB, 1, true, [l])
          }
        } else if (mode === 'full') {
          const la = lab.get(me)
          const lb = lab.get(right)
          if (
            la &&
            lb &&
            size[label[i]!]! >= minRegion &&
            size[label[i + 1]!]! >= minRegion &&
            deltaE(la, lb) >= minDeltaE
          ) {
            push(edgeA, edgeB, Math.min(1, deltaE(la, lb) / 60), false, [la, lb])
          }
        }
      }

      // The horizontal boundary along this cell's bottom. Same rule: the grid's
      // own edge is not a boundary.
      const by = y + 1
      const below = by < height ? symOf(i + width) : undefined
      if (by < height && me !== below) {
        const edgeA = node(x, by)
        const edgeB = node(x + 1, by)
        if (me === undefined || below === undefined) {
          if (me !== undefined || below !== undefined) {
            const l = lab.get((me ?? below)!)
            if (l && bigBlob(me !== undefined ? i : i + width)) push(edgeA, edgeB, 1, true, [l])
          }
        } else if (mode === 'full') {
          const la = lab.get(me)
          const lb = lab.get(below)
          if (
            la &&
            lb &&
            size[label[i]!]! >= minRegion &&
            size[label[i + width]!]! >= minRegion &&
            deltaE(la, lb) >= minDeltaE
          ) {
            push(edgeA, edgeB, Math.min(1, deltaE(la, lb) / 60), false, [la, lb])
          }
        }
      }
    }
  }

  if (edges.length === 0) return unchanged('nothing to outline')

  const smoothFloor = (c: Chain): number =>
    c.silhouette
      ? (opts.minMeanPieceSilhouette ?? MIN_MEAN_PIECE_SILHOUETTE)
      : (opts.minMeanPieceInternal ?? MIN_MEAN_PIECE_INTERNAL)
  const chains = traceChains(edges, width, opts.maxChainLength ?? MAX_CHAIN_LENGTH).filter(
    (c) => c.length >= minChain && c.length / c.pieces.length >= smoothFloor(c),
  )
  if (chains.length === 0) return unchanged('no line long enough to be worth stitching')

  // Strongest first — the silhouette leads, then the boldest internal edges —
  // and stop at the cap, so a busy chart gets an outline rather than a scribble.
  chains.sort(
    (a, b) =>
      b.length * b.contrast * (b.silhouette ? 1.6 : 1) -
      a.length * a.contrast * (a.silhouette ? 1.6 : 1),
  )
  const accepted: Chain[] = []
  let total = 0
  for (const c of chains) {
    if (total + c.length > cap) continue
    accepted.push(c)
    total += c.length
  }
  if (accepted.length === 0) return unchanged('outline would exceed the length cap')
  if (total < (opts.minShareOfCap ?? MIN_OUTLINE_SHARE_OF_CAP) * cap) {
    return unchanged(
      `only ${Math.round(total)} cells of the chart have a drawable edge — a fragment, not an outline`,
    )
  }

  const inks = chooseInks(data, accepted, opts.maxInks ?? MAX_OUTLINE_INKS)
  const segments: BackstitchSegment[] = []
  for (const chain of accepted) {
    let ink = inks[0]!
    if (inks.length > 1) {
      const hue = hueOf(chain.lab)
      for (const cand of inks.slice(1)) {
        if (hueGap(hue, cand.hue) < hueGap(hue, ink.hue)) ink = cand
      }
    }
    for (const p of chain.pieces) {
      segments.push({ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, s: ink.entry.symbol })
    }
  }

  const addedEntries = inks.filter((i) => i.added).map((i) => i.entry)
  const usedInks = new Set(segments.map((s) => s.s))
  const keptAdded = addedEntries.filter((e) => usedInks.has(e.symbol))

  return {
    data: {
      ...data,
      grid: { ...data.grid, backstitch: segments },
      palette: [...data.palette, ...keptAdded],
    },
    mode,
    segments: segments.length,
    totalLength: Math.round(total * 10) / 10,
    addedSymbols: keptAdded.map((e) => e.symbol),
    inkCodes: [...new Set(segments.map((s) => s.s))].map(
      (s) =>
        [...data.palette, ...keptAdded].find((p) => p.symbol === s)?.code ?? s,
    ),
    reason:
      `${segments.length} segment${segments.length === 1 ? '' : 's'}, ` +
      `${Math.round(total)} cells of line (${accepted.length} of ${chains.length} lines kept)`,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// The two together
// ───────────────────────────────────────────────────────────────────────────

export interface EmbellishResult {
  data: PatternData
  mode: OutlineMode
  /** Why that mode. */
  modeReason: string
  backstitchSegments: number
  backstitchLength: number
  frenchKnots: number
  addedSymbols: string[]
  inkCodes: string[]
  /** True when the chart came out of this unchanged. */
  unchanged: boolean
}

/**
 * The whole embellishment pass, in the order a designer works: the knots first
 * (they take a lone stitch out of the field), then the outline over the top.
 *
 * Called by the bulk converter after the bare-fabric clear and BEFORE the
 * thumbnail, so the vividness guard and the vision gate judge the chart that
 * would actually ship; and by the catalogue backfill, which re-renders the hero
 * in the same transaction.
 */
export function embellishChart(
  data: PatternData,
  ctx: OutlineContext = {},
  opts: { outline?: DeriveBackstitchOptions; knots?: FrenchKnotOptions } = {},
): EmbellishResult {
  const verdict = outlineModeFor(data, ctx)
  if (verdict.mode === 'none') {
    return {
      data,
      mode: 'none',
      modeReason: verdict.reason,
      backstitchSegments: 0,
      backstitchLength: 0,
      frenchKnots: 0,
      addedSymbols: [],
      inkCodes: [],
      unchanged: true,
    }
  }

  const knots = deriveFrenchKnots(data, opts.knots)
  const outlined = deriveBackstitch(knots.data, { ...opts.outline, mode: verdict.mode })

  return {
    data: outlined.data,
    mode: verdict.mode,
    modeReason: verdict.reason,
    backstitchSegments: outlined.segments,
    backstitchLength: outlined.totalLength,
    frenchKnots: knots.knots,
    addedSymbols: outlined.addedSymbols,
    inkCodes: outlined.inkCodes,
    unchanged: outlined.segments === 0 && knots.knots === 0,
  }
}
