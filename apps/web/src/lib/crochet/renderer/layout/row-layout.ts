/**
 * Row layout engine — places stitches on a rectangular grid for flat work
 * (blankets, dishcloths, scarves) and stitch-swatch previews.
 *
 * Each row sits at y = baseY - rowIndex * unitPx * rowHeightUnits. Right-
 * side rows render right-to-left in working order (stitch 0 on the right);
 * wrong-side rows render left-to-right.
 */

import type { ChartRow, ChartStitch } from '../../../craft-charts/types'
import { getStitchShape, UNKNOWN_STITCH } from '../stitch-shapes'
import type { RendererPalette, StitchPlacement } from '../types'
import { expandStitches } from './round-layout'

interface RowLayoutOptions {
  unitPx: number
  palette: RendererPalette
  /** Pixel margin around the rendered grid. Defaults to one unit. */
  marginPx?: number
  onUnknownSymbol?: (key: string, rowNumber: number) => void
}

interface RowLayoutResult {
  placements: StitchPlacement[]
  width: number
  height: number
}

function resolveColour(
  st: ChartStitch,
  rowIndex: number,
  palette: RendererPalette,
): string {
  if (st.colourKey) {
    const explicit = palette.byKey[st.colourKey]
    if (explicit) return explicit
  }
  const cycle = palette.perRound
  if (cycle.length === 0) return '#7a6a5a'
  return cycle[rowIndex % cycle.length] ?? '#7a6a5a'
}

export function buildRowLayout(
  rows: ReadonlyArray<ChartRow>,
  opts: RowLayoutOptions,
): RowLayoutResult {
  if (rows.length === 0) {
    return { placements: [], width: opts.unitPx * 4, height: opts.unitPx * 2 }
  }

  const expanded = rows.map((r) => ({
    rowNumber: r.rowNumber,
    rightSide: r.rightSide !== false,
    stitches: expandStitches(r.stitches),
  }))

  // Per-row height = max stitch height in that row.
  const rowHeightsPx = expanded.map((r) => {
    const h = r.stitches.reduce((m, st) => {
      const shape = getStitchShape(st.symbol) ?? UNKNOWN_STITCH
      return Math.max(m, shape.heightUnits)
    }, 0)
    return Math.max(opts.unitPx * 0.6, h * opts.unitPx)
  })

  const columns = Math.max(...expanded.map((r) => r.stitches.length))
  const marginPx = opts.marginPx ?? opts.unitPx
  const stitchPitchPx = opts.unitPx // one stitch column wide

  const gridWidth = columns * stitchPitchPx
  const gridHeight = rowHeightsPx.reduce((s, h) => s + h, 0)
  const width = gridWidth + 2 * marginPx
  const height = gridHeight + 2 * marginPx

  const placements: StitchPlacement[] = []
  // Row 1 sits at the bottom (crochet convention reads up from row 1).
  // baseY is the y-coordinate of row 1's base.
  const baseY = marginPx + gridHeight

  let cumulativeHeight = 0
  for (let rowIdx = 0; rowIdx < expanded.length; rowIdx++) {
    const row = expanded[rowIdx]!
    const rowHeight = rowHeightsPx[rowIdx]!
    const rowBaseY = baseY - cumulativeHeight
    cumulativeHeight += rowHeight

    for (let stIdx = 0; stIdx < row.stitches.length; stIdx++) {
      const st = row.stitches[stIdx]!
      const shape = getStitchShape(st.symbol)
      if (!shape) {
        opts.onUnknownSymbol?.(st.symbol, row.rowNumber)
      }
      const resolved = shape ?? UNKNOWN_STITCH

      const col = row.rightSide
        ? columns - 1 - stIdx
        : stIdx
      const cx = marginPx + col * stitchPitchPx + stitchPitchPx / 2
      const cy = rowBaseY
      // Uniform unit scale so short stitches (chain, sl st) stay short
      // and tall stitches (treble, dtr) stay tall.
      const scalePx = opts.unitPx
      const colour = resolveColour(st, rowIdx, opts.palette)

      placements.push({
        shape: resolved,
        cx,
        cy,
        rotationRad: 0,
        scalePx,
        colour,
        roundNumber: row.rowNumber,
        indexInRound: stIdx,
      })
    }
  }

  return { placements, width, height }
}
