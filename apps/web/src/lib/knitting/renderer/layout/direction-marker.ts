/**
 * Reading-direction markers.
 *
 * Knitting charts read differently per construction:
 *   - Flat work RS rows: right-to-left
 *   - Flat work WS rows: left-to-right
 *   - In-the-round:      every row right-to-left
 *
 * For flat work, the renderer adds a small "RS" / "WS" marker at the
 * row-start edge (right for RS rows, left for WS rows). For in-the-
 * round, the WS markers are suppressed and every row gets an "→" arrow
 * at the right edge.
 *
 * The marker generator returns the set of marker placements; the SVG
 * composer renders them as text glyphs on the row-number column.
 */

import type { KnittingChartData, KnittingConstruction } from '../types'

export interface RowMarker {
  /** 0-indexed row from the bottom of the chart (row 1 = index 0).
   *  This is the marker's logical row, not its on-screen y-coordinate. */
  rowFromBottom: number
  /** RS or WS for flat work. For in-the-round it's always RS. */
  side: 'RS' | 'WS'
  /** Where on the chart the marker sits. */
  edge: 'LEFT' | 'RIGHT'
  /** Label rendered on screen ("RS", "WS"). */
  label: string
}

export function buildDirectionMarkers(
  data: KnittingChartData,
): RowMarker[] {
  const construction: KnittingConstruction =
    data.metadata?.construction ?? 'FLAT'
  const startEdge = data.metadata?.rsRowsStartFrom ?? 'RIGHT'
  const oppositeEdge = startEdge === 'RIGHT' ? 'LEFT' : 'RIGHT'

  const markers: RowMarker[] = []
  const height = data.grid.height

  for (let i = 0; i < height; i++) {
    const rowNumber = i + 1
    if (construction === 'IN_THE_ROUND') {
      markers.push({
        rowFromBottom: i,
        side: 'RS',
        edge: startEdge,
        label: 'RS',
      })
      continue
    }
    // Flat work: odd row numbers are RS by convention, even are WS.
    const isRs = rowNumber % 2 === 1
    markers.push({
      rowFromBottom: i,
      side: isRs ? 'RS' : 'WS',
      edge: isRs ? startEdge : oppositeEdge,
      label: isRs ? 'RS' : 'WS',
    })
  }

  return markers
}

export function isInTheRound(data: KnittingChartData): boolean {
  return (data.metadata?.construction ?? 'FLAT') === 'IN_THE_ROUND'
}
