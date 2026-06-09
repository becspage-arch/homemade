/**
 * Shared chart-layout intermediate. All four chart-type modules
 * (colourwork / lace / cable / brioche) build one of these and hand
 * it to the SVG composer.
 */

import type { CellPlacement } from '../layout/grid-layout'
import type { CableCrossingPlacement } from '../layout/cable-layout'
import type { RowMarker } from '../layout/direction-marker'
import type { KnittingChartType } from '../types'

export interface ChartLayout {
  type: KnittingChartType
  width: number
  height: number
  /** Cell placements in chart coordinates (y=0 is the top of the
   *  internal grid; the composer flips so row 1 lands at the bottom). */
  placements: CellPlacement[]
  /** Cable crossings, layered on top of the grid placements. */
  cables: CableCrossingPlacement[]
  /** Row direction markers. */
  markers: RowMarker[]
  /** Per-row stitch counts after the grid + cables resolve.
   *  Index 0 is the top internal row; index height-1 is the bottom
   *  (the row labelled "row 1" on the chart). */
  rowCounts: number[]
  /** Legend entries — slug + label + colour (null for mono). */
  legend: Array<{
    slug: string
    label: string
    abbreviation: string
    colour: string | null
  }>
  /** Warnings surfaced by layout. */
  warnings: string[]
}
