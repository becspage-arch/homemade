/**
 * Verifier — sanity checks on a rendered chart. Used by the at-scale
 * runner script to decide whether to publish a rendered hero or log it
 * for manual review.
 */

import { expandedStitchCount, expandStitches } from './layout/round-layout'
import { sanityCheckRoundProgression } from './layout/increase-distribution'
import type { ChartDefinition } from '../../craft-charts/types'
import type { StitchPlacement, VerifyResult } from './types'

interface VerifyArgs {
  chart: ChartDefinition
  placements: StitchPlacement[]
  width: number
  height: number
  /** Unknown stitch keys collected by the layout. */
  unknownSymbols: { key: string; round: number }[]
}

export function verify(args: VerifyArgs): VerifyResult {
  const issues: string[] = []
  // bbox of centroid positions — the SVG composer clips at the canvas edge,
  // so the verifier checks centroid containment with a stitch-width
  // tolerance rather than trying to predict per-stitch reach (which
  // depends on rotation + heightUnits + shape).
  let bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const p of args.placements) {
    bbox.minX = Math.min(bbox.minX, p.cx)
    bbox.minY = Math.min(bbox.minY, p.cy)
    bbox.maxX = Math.max(bbox.maxX, p.cx)
    bbox.maxY = Math.max(bbox.maxY, p.cy)
  }
  if (args.placements.length === 0) {
    bbox = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    issues.push('No stitches placed — chartData is empty or in an unrenderable shape.')
  }

  // Stitch count match: placements should equal expandedStitchCount minus
  // any centre markers excluded by the motif layout.
  const expected = (args.chart.layout === 'round')
    ? expandedStitchCount(args.chart.rounds ?? [])
    : (args.chart.rows ?? []).reduce((s, r) => s + expandStitches(r.stitches).length, 0)

  // Motif layout may legitimately drop the magic-ring centre marker.
  // Allow up to (#rounds) of slack.
  const slack = (args.chart.rounds?.length ?? 0)
  if (Math.abs(args.placements.length - expected) > slack) {
    issues.push(
      `Stitch count mismatch: expected ~${expected} placements, got ${args.placements.length}.`,
    )
  }

  // Centroid bbox should be contained well within the canvas. A stitch's
  // visual reach extends beyond the centroid (heightUnits * scalePx in the
  // outward direction), but the composer + rasteriser clip naturally; the
  // check here only fires when centroids themselves are outside.
  if (bbox.maxX > args.width || bbox.maxY > args.height || bbox.minX < 0 || bbox.minY < 0) {
    issues.push(
      `Placement centroid outside canvas (${args.width}x${args.height}); bbox=` +
        `[${bbox.minX.toFixed(0)}, ${bbox.minY.toFixed(0)}] → [${bbox.maxX.toFixed(0)}, ${bbox.maxY.toFixed(0)}].`,
    )
  }

  // Degenerate stitches.
  for (const p of args.placements) {
    if (!isFinite(p.cx) || !isFinite(p.cy) || p.scalePx <= 0) {
      issues.push(
        `Degenerate placement at round ${p.roundNumber} index ${p.indexInRound} ` +
          `(cx=${p.cx}, cy=${p.cy}, scalePx=${p.scalePx}).`,
      )
      break
    }
  }

  // Unknown symbols.
  if (args.unknownSymbols.length > 0) {
    const list = args.unknownSymbols.map((u) => `"${u.key}"@rnd${u.round}`).slice(0, 6).join(', ')
    issues.push(
      `${args.unknownSymbols.length} unknown stitch symbol${args.unknownSymbols.length === 1 ? '' : 's'} (${list}) ` +
        `replaced with neutral fallback; add to stitch-shapes/index.ts.`,
    )
  }

  // Round-progression notes for round work. These are SOFT — a decreasing
  // round (closing motif, petal taper) or a fast-growing round still draws
  // fine; the layout places whatever count each round carries. They're
  // surfaced for visibility but must NOT fail the render (the renderer's
  // own comment calls them "soft signals").
  const softIssues: string[] = []
  if (args.chart.layout === 'round' && args.chart.rounds) {
    const counts = args.chart.rounds.map((r) =>
      r.stitches.reduce((s, st) => s + Math.max(1, Math.floor(st.count ?? 1)), 0),
    )
    for (const w of sanityCheckRoundProgression(counts)) {
      softIssues.push(w)
    }
  }

  // `ok` is gated on HARD issues only — unknown symbols, gross count
  // mismatch, off-canvas centroids, degenerate geometry. Soft progression
  // notes are appended for the log but don't block the hero.
  return {
    ok: issues.length === 0,
    issues: [...issues, ...softIssues],
    stitchCount: args.placements.length,
    expectedStitchCount: expected,
    bbox,
  }
}
