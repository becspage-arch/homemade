/**
 * Round layout engine — places stitches on concentric circles for in-the-
 * round motifs (mandalas, simple medallions).
 *
 * For each round:
 *   - Compute outer radius from the cumulative stitch heights.
 *   - Distribute stitches evenly around the circumference.
 *   - Rotate each stitch shape so it points outward from the centre (its
 *     base anchors on the previous round's outer radius, top on this
 *     round's outer radius).
 *
 * The round-layout produces a circular silhouette regardless of stitch
 * count. Granny squares + hexagons use motif-layout instead, which detects
 * corners and lays out along a square / hexagon outline.
 */

import type { ChartDefinition, ChartRound, ChartStitch } from '../../../craft-charts/types'
import { getStitchShape, UNKNOWN_STITCH } from '../stitch-shapes'
import type { RendererPalette, StitchPlacement } from '../types'

interface RoundLayoutOptions {
  unitPx: number
  palette: RendererPalette
  /** Mark every shape unknown reference so the caller can warn. */
  onUnknownSymbol?: (key: string, roundNumber: number) => void
}

interface RoundLayoutResult {
  placements: StitchPlacement[]
  outerRadius: number
  centre: { x: number; y: number }
}

/**
 * Expand a ChartStitch with `count: N` into N individual stitches in
 * working order. Mirrors `craft-charts/svg-chart.tsx`.
 */
export function expandStitches(stitches: ReadonlyArray<ChartStitch>): ChartStitch[] {
  const out: ChartStitch[] = []
  for (const st of stitches) {
    const count = Math.max(1, Math.floor(st.count ?? 1))
    for (let i = 0; i < count; i++) {
      out.push({ symbol: st.symbol, label: st.label, colourKey: st.colourKey })
    }
  }
  return out
}

/**
 * Resolve a stitch's colour from its colourKey + round-index default.
 */
function resolveColour(
  st: ChartStitch,
  roundIndex: number,
  palette: RendererPalette,
): string {
  if (st.colourKey) {
    const explicit = palette.byKey[st.colourKey]
    if (explicit) return explicit
  }
  const cycle = palette.perRound
  if (cycle.length === 0) return '#7a6a5a'
  return cycle[roundIndex % cycle.length] ?? '#7a6a5a'
}

/**
 * Build the round layout for a chart's `rounds` array.
 */
export function buildRoundLayout(
  rounds: ReadonlyArray<ChartRound>,
  opts: RoundLayoutOptions,
): RoundLayoutResult {
  if (rounds.length === 0) {
    return {
      placements: [],
      outerRadius: opts.unitPx * 2,
      centre: { x: 0, y: 0 },
    }
  }

  const expanded = rounds.map((r) => ({
    roundNumber: r.roundNumber,
    stitches: expandStitches(r.stitches),
  }))

  // Compute per-round radii. Round 0's inner radius scales with the first
  // round's stitch count so the ring isn't crowded. Each subsequent round
  // adds the max stitch height in that round (in pixels).
  const firstStitchCount = Math.max(1, expanded[0]?.stitches.length ?? 1)
  const inner = Math.max(opts.unitPx * 0.6, (firstStitchCount * opts.unitPx * 0.85) / (2 * Math.PI))

  const ringBounds: { inner: number; outer: number }[] = []
  let cursor = inner
  for (const r of expanded) {
    const maxH = r.stitches.reduce((m, st) => {
      const shape = getStitchShape(st.symbol) ?? UNKNOWN_STITCH
      return Math.max(m, shape.heightUnits)
    }, 0)
    const ringHeight = Math.max(opts.unitPx * 0.6, maxH * opts.unitPx)
    ringBounds.push({ inner: cursor, outer: cursor + ringHeight })
    cursor += ringHeight
  }

  const outerRadius = cursor + opts.unitPx * 0.25
  const centre = { x: outerRadius + opts.unitPx, y: outerRadius + opts.unitPx }

  const placements: StitchPlacement[] = []
  for (let ringIdx = 0; ringIdx < expanded.length; ringIdx++) {
    const ring = expanded[ringIdx]!
    const bounds = ringBounds[ringIdx]!
    const count = ring.stitches.length
    if (count === 0) continue

    // The stitch shape is drawn in unit space (base at y=0, top at y=-h).
    // After scaling and rotating, the stitch's base sits on `bounds.inner`
    // and its top reaches `bounds.outer`.
    // The shape's own scale is set so the stitch's height fills the ring.
    for (let i = 0; i < count; i++) {
      const st = ring.stitches[i]!
      const shape = getStitchShape(st.symbol)
      if (!shape) {
        opts.onUnknownSymbol?.(st.symbol, ring.roundNumber)
      }
      const resolved = shape ?? UNKNOWN_STITCH
      const angle = (-Math.PI / 2) + (2 * Math.PI * i) / count
      // Uniform unit scale across the ring — chains stay short, trebles
      // stay tall. The ring's pixel-height is the max stitch's
      // heightUnits * unitPx (set above), so the tallest stitch fills
      // the ring; lower-profile stitches sit nested inside it.
      const scalePx = opts.unitPx
      const cx = centre.x + bounds.inner * Math.cos(angle)
      const cy = centre.y + bounds.inner * Math.sin(angle)
      // Rotate so the stitch points outward — its unit "up" (negative y)
      // becomes the direction of the angle.
      const rotationRad = angle + Math.PI / 2
      const colour = resolveColour(st, ringIdx, opts.palette)
      placements.push({
        shape: resolved,
        cx,
        cy,
        rotationRad,
        scalePx,
        colour,
        roundNumber: ring.roundNumber,
        indexInRound: i,
      })
    }
  }

  return { placements, outerRadius, centre }
}

/** Convenience accessor used by the verifier. */
export function expandedStitchCount(rounds: ReadonlyArray<ChartRound>): number {
  let n = 0
  for (const r of rounds) {
    for (const st of r.stitches) {
      n += Math.max(1, Math.floor(st.count ?? 1))
    }
  }
  return n
}

/**
 * Expand a chart's `rounds` array — used by `chartDefinition` callers
 * that need the count + ringing.
 */
export type { ChartDefinition }
