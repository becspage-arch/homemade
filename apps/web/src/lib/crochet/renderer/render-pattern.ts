/**
 * `renderPattern` — main entry point. Takes a `ChartDefinition` (the same
 * shape stored on `CrochetPattern.chartData`) and returns the rendered SVG
 * string + a verifier verdict. Callers can rasterise to PNG via
 * `output/png-rasteriser.ts`.
 */

import type { ChartDefinition } from '../../craft-charts/types'
import { buildMotifLayout } from './layout/motif-layout'
import { buildRoundLayout } from './layout/round-layout'
import { buildRowLayout } from './layout/row-layout'
import { defaultPalette } from './palette/apply-colours'
import { composeSvg } from './output/svg-composer'
import type {
  MotifShape,
  RenderOptions,
  StitchPlacement,
  VerifyResult,
} from './types'
import { verify } from './verifier'

export interface RenderResult {
  svg: string
  verify: VerifyResult
  /** Inferred motif shape — surfaced for callers that want to record it. */
  motifShape: MotifShape
  /** Canvas dimensions in pixels. */
  width: number
  height: number
}

const DEFAULT_UNIT_PX = 30

/**
 * Guard a raw `chartDefinition` so the layout + verifier never THROW on
 * malformed or foreign-shaped data (e.g. knitting's legacy grid shape, where
 * `rows`/`stitches` aren't the arrays this renderer expects). Well-formed
 * charts pass through UNCHANGED. Malformed ones are reduced to an empty chart
 * of the right layout — the render then fails the verifier cleanly (empty
 * placements) instead of crashing a bulk batch.
 */
/**
 * Infer the real layout from which array carries data. Many charts were
 * authored with round data but `layout` left undefined or mislabelled
 * 'flat' (and vice-versa); trusting the bare `layout` field rendered them
 * empty. When exactly one of rounds / rows is populated, that wins;
 * otherwise the declared layout is used.
 */
function effectiveLayout(chart: ChartDefinition): 'round' | 'flat' {
  const hasRounds = Array.isArray(chart?.rounds) && chart.rounds.length > 0
  const hasRows = Array.isArray(chart?.rows) && chart.rows.length > 0
  if (hasRounds && !hasRows) return 'round'
  if (hasRows && !hasRounds) return 'flat'
  return chart?.layout === 'round' ? 'round' : 'flat'
}

function normaliseChart(raw: ChartDefinition): ChartDefinition {
  const chart = (raw && typeof raw === 'object' ? raw : {}) as ChartDefinition
  const layout = effectiveLayout(chart)
  if (layout === 'round') {
    const ok = Array.isArray(chart.rounds) && chart.rounds.every((r) => Array.isArray(r?.stitches))
    return ok ? { ...chart, layout } : { ...chart, layout, rounds: [] }
  }
  const ok = Array.isArray(chart.rows) && chart.rows.every((r) => Array.isArray(r?.stitches))
  return ok ? { ...chart, layout } : { ...chart, layout, rows: [] }
}

export function renderPattern(
  rawChart: ChartDefinition,
  opts: RenderOptions = {},
): RenderResult {
  const chart = normaliseChart(rawChart)
  const unitPx = opts.unitPx ?? DEFAULT_UNIT_PX
  const palette = opts.palette ?? defaultPalette()
  const unknownSymbols: { key: string; round: number }[] = []
  const seenUnknown = new Set<string>()
  const trackUnknown = (key: string, round: number): void => {
    const sig = `${key}:${round}`
    if (seenUnknown.has(sig)) return
    seenUnknown.add(sig)
    unknownSymbols.push({ key, round })
  }

  let placements: StitchPlacement[] = []
  let width = 0
  let height = 0
  let motifShape: MotifShape = { kind: 'round' }

  if (chart.layout === 'round') {
    const rounds = chart.rounds ?? []
    // Try motif layout first (square / hexagon detection).
    const motif = buildMotifLayout(rounds, {
      unitPx,
      palette,
      onUnknownSymbol: trackUnknown,
    })
    if (motif.placements.length > 0) {
      placements = motif.placements
      width = motif.width
      height = motif.height
      motifShape = motif.shape
    } else {
      const round = buildRoundLayout(rounds, {
        unitPx,
        palette,
        onUnknownSymbol: trackUnknown,
      })
      placements = round.placements
      width = round.outerRadius * 2 + unitPx * 2
      height = width
      motifShape = { kind: 'round' }
    }
  } else if (chart.layout === 'flat') {
    const rows = chart.rows ?? []
    const row = buildRowLayout(rows, {
      unitPx,
      palette,
      onUnknownSymbol: trackUnknown,
    })
    placements = row.placements
    width = row.width
    height = row.height
    motifShape = {
      kind: 'flat',
      rows: rows.length,
      columns: Math.max(0, ...rows.map((r) => r.stitches.reduce((s, st) => s + Math.max(1, Math.floor(st.count ?? 1)), 0))),
    }
  }

  const svg = composeSvg({
    width: Math.round(width),
    height: Math.round(height),
    placements,
    palette,
    title: opts.showTitle ? chart.title : undefined,
    showCentreCrosshair: opts.showCentreCrosshair,
  })

  const v = verify({
    chart,
    placements,
    width: Math.round(width),
    height: Math.round(height),
    unknownSymbols,
  })

  return {
    svg,
    verify: v,
    motifShape,
    width: Math.round(width),
    height: Math.round(height),
  }
}

/** Re-exports for callers that import from the module root. */
export { defaultPalette, singleColourPalette, shiftColour } from './palette/apply-colours'
export { rasterise } from './output/png-rasteriser'
export { getStitchShape, listStitchShapes, hasStitchShape } from './stitch-shapes'
export type { LayoutResult, RenderOptions, VerifyResult } from './types'
