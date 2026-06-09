/**
 * Motif layout engine — detects corner-based motifs (granny squares, hexagon
 * medallions) and lays the stitches along a polygon outline instead of a
 * circle.
 *
 * Detection rule: in a round of `expanded` stitches, count groups of
 * consecutive chain stitches. A group is a "corner". If the number of
 * corner groups is exactly 4 → square. If 6 → hexagon. Anything else
 * → fall through to the circular round layout.
 *
 * The polygon outline is the locus of stitches; each ring's vertices sit
 * at the corner-group midpoints. Sides between corners hold the non-chain
 * stitches in working order. Distances are scaled so the polygon grows
 * round-by-round in proportion to the stitches it carries.
 */

import type { ChartRound, ChartStitch } from '../../../craft-charts/types'
import { getStitchShape, UNKNOWN_STITCH } from '../stitch-shapes'
import type {
  MotifShape,
  RendererPalette,
  StitchPlacement,
} from '../types'
import { expandStitches } from './round-layout'

interface MotifLayoutOptions {
  unitPx: number
  palette: RendererPalette
  onUnknownSymbol?: (key: string, roundNumber: number) => void
}

interface MotifLayoutResult {
  placements: StitchPlacement[]
  shape: MotifShape
  width: number
  height: number
}

interface RoundExpanded {
  roundNumber: number
  stitches: ChartStitch[]
  /** Indices in `stitches` that belong to a corner chain group. */
  cornerGroupIndices: number[][]
}

const CHAIN_KEYS = new Set(['chain', 'ch'])
const CENTRE_KEYS = new Set(['magic-ring', 'MR', 'mr'])

function isChain(st: ChartStitch): boolean {
  return CHAIN_KEYS.has(st.symbol)
}

function isCentre(st: ChartStitch): boolean {
  return CENTRE_KEYS.has(st.symbol)
}

/**
 * Find contiguous chain groups in a round. The MR centre marker is
 * ignored (it's a structural mark, not a perimeter chain).
 */
function findCornerGroups(stitches: ReadonlyArray<ChartStitch>): number[][] {
  const groups: number[][] = []
  let current: number[] | null = null
  for (let i = 0; i < stitches.length; i++) {
    if (isCentre(stitches[i])) continue
    if (isChain(stitches[i])) {
      if (current) current.push(i)
      else current = [i]
    } else if (current) {
      groups.push(current)
      current = null
    }
  }
  if (current) groups.push(current)
  return groups
}

/**
 * Infer the motif shape from the round-by-round chain-group structure.
 *
 * Round 1 carries the cleanest signal — a granny square's round 1 has
 * exactly 4 corner chain groups, a hexagon has 6. Outer rounds add
 * side chains (ch-1 between corners) that read as extra "groups" if you
 * walk them naively, which makes the outer round ambiguous.
 *
 * Strategy: scan rounds from the inside out. The FIRST round whose
 * chain-group count is exactly 4 or 6 fixes the shape. If no round
 * gives a clean reading, fall back to a circular layout.
 */
export function inferMotifShape(rounds: ReadonlyArray<ChartRound>): MotifShape {
  if (rounds.length === 0) return { kind: 'round' }
  for (let i = 0; i < rounds.length; i++) {
    const expanded = expandStitches(rounds[i].stitches)
    const groups = findCornerGroups(expanded)
    if (groups.length === 4) return { kind: 'square' }
    if (groups.length === 6) return { kind: 'hexagon' }
  }
  return { kind: 'round' }
}

function resolveColour(
  st: ChartStitch,
  roundIndex: number,
  palette: RendererPalette,
): string {
  if (st.colourKey && palette.byKey[st.colourKey]) {
    return palette.byKey[st.colourKey]
  }
  const cycle = palette.perRound
  if (cycle.length === 0) return '#7a6a5a'
  return cycle[roundIndex % cycle.length]
}

/**
 * Polygon layout: place stitches along a regular polygon with the given
 * number of sides. Sides between corners share the side stitches evenly.
 *
 * For each round, the polygon's circumradius grows by the max stitch
 * height in that round. The corner stitches sit at the polygon's vertices;
 * each side holds the stitches between consecutive corners.
 */
function buildPolygonLayout(
  rounds: ReadonlyArray<ChartRound>,
  sides: number,
  opts: MotifLayoutOptions,
): MotifLayoutResult {
  const expanded: RoundExpanded[] = rounds.map((r) => {
    const stitches = expandStitches(r.stitches)
    const cornerGroupIndices = findCornerGroups(stitches)
    return { roundNumber: r.roundNumber, stitches, cornerGroupIndices }
  })

  // Per-round inner / outer circumradius.
  const inner0 = opts.unitPx * 0.7
  const ringBounds: { inner: number; outer: number }[] = []
  let cursor = inner0
  for (const r of expanded) {
    const maxH = r.stitches.reduce((m, st) => {
      const shape = getStitchShape(st.symbol) ?? UNKNOWN_STITCH
      return Math.max(m, shape.heightUnits)
    }, 0)
    const ringHeight = Math.max(opts.unitPx * 0.6, maxH * opts.unitPx)
    ringBounds.push({ inner: cursor, outer: cursor + ringHeight })
    cursor += ringHeight
  }
  const outerCircumradius = cursor + opts.unitPx * 0.4
  // For a square at circumradius R, the bounding-box half-width is R; we
  // give the canvas a bit of padding around that.
  const halfSize = outerCircumradius + opts.unitPx
  const width = halfSize * 2
  const height = halfSize * 2
  const centre = { x: halfSize, y: halfSize }

  const placements: StitchPlacement[] = []

  for (let ringIdx = 0; ringIdx < expanded.length; ringIdx++) {
    const ring = expanded[ringIdx]
    const bounds = ringBounds[ringIdx]
    const ringHeight = bounds.outer - bounds.inner
    const circumradius = bounds.inner

    // Cycle vertex angles. The first corner sits at the top.
    const vertexAngles: number[] = []
    for (let v = 0; v < sides; v++) {
      vertexAngles.push(-Math.PI / 2 + (2 * Math.PI * v) / sides)
    }

    // Stitch positions along the polygon perimeter — parameterised by `t`
    // in [0, 1) where t=0 is the first vertex. For each stitch i in
    // round.stitches (excluding the centre marker), compute t = i / N.
    const renderable: { st: ChartStitch; t: number; isCorner: boolean }[] = []
    const nonCentre = ring.stitches.filter((s) => !isCentre(s))
    const cornerLookup = new Set<number>()
    for (const group of ring.cornerGroupIndices) {
      for (const idx of group) {
        // Map original index → index within nonCentre.
        let mapped = 0
        for (let k = 0; k < idx; k++) {
          if (!isCentre(ring.stitches[k])) mapped++
        }
        cornerLookup.add(mapped)
      }
    }
    for (let i = 0; i < nonCentre.length; i++) {
      const t = i / Math.max(1, nonCentre.length)
      renderable.push({ st: nonCentre[i], t, isCorner: cornerLookup.has(i) })
    }

    for (let i = 0; i < renderable.length; i++) {
      const { st, t } = renderable[i]
      const shape = getStitchShape(st.symbol)
      if (!shape) opts.onUnknownSymbol?.(st.symbol, ring.roundNumber)
      const resolved = shape ?? UNKNOWN_STITCH

      // Map t in [0, 1) → polygon perimeter position.
      const sideF = t * sides
      const sideIdx = Math.floor(sideF) % sides
      const along = sideF - Math.floor(sideF) // 0..1 along this side
      const vA = vertexAngles[sideIdx]
      const vB = vertexAngles[(sideIdx + 1) % sides]
      const xA = Math.cos(vA) * circumradius
      const yA = Math.sin(vA) * circumradius
      const xB = Math.cos(vB) * circumradius
      const yB = Math.sin(vB) * circumradius
      const px = centre.x + xA + (xB - xA) * along
      const py = centre.y + yA + (yB - yA) * along

      // Outward normal at this perimeter point: average of the two vertex
      // outward directions weighted by along.
      const normalAngleA = vA
      const normalAngleB = vB
      const nx = Math.cos(normalAngleA) * (1 - along) + Math.cos(normalAngleB) * along
      const ny = Math.sin(normalAngleA) * (1 - along) + Math.sin(normalAngleB) * along
      const nLen = Math.sqrt(nx * nx + ny * ny) || 1
      const outwardAngle = Math.atan2(ny / nLen, nx / nLen)
      const rotationRad = outwardAngle + Math.PI / 2

      // Uniform unit scale — chains / sl sts render at their own short
      // height; tall posts render at their full reach.
      const scalePx = opts.unitPx
      void ringHeight
      const colour = resolveColour(st, ringIdx, opts.palette)

      placements.push({
        shape: resolved,
        cx: px,
        cy: py,
        rotationRad,
        scalePx,
        colour,
        roundNumber: ring.roundNumber,
        indexInRound: i,
      })
    }
  }

  const shape: MotifShape = sides === 4 ? { kind: 'square' } : sides === 6 ? { kind: 'hexagon' } : { kind: 'round' }
  return { placements, shape, width, height }
}

export function buildMotifLayout(
  rounds: ReadonlyArray<ChartRound>,
  opts: MotifLayoutOptions,
): MotifLayoutResult {
  const shape = inferMotifShape(rounds)
  if (shape.kind === 'square') return buildPolygonLayout(rounds, 4, opts)
  if (shape.kind === 'hexagon') return buildPolygonLayout(rounds, 6, opts)
  // Fall back to circular round layout — delegated by render-pattern.ts.
  // Returning shape: 'round' tells the caller to use buildRoundLayout.
  return {
    placements: [],
    shape: { kind: 'round' },
    width: 0,
    height: 0,
  }
}
