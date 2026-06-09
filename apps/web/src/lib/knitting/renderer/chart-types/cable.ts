/**
 * Cable chart layout.
 *
 * Same grid + symbol vocabulary as lace, plus emphasised CableCrossing
 * handling. The composer renders the base ground (typically reverse
 * stockinette purl ground around cables), then overlays cable
 * crossings as composite shapes spanning multiple cells.
 */

import { buildCableLayout } from '../layout/cable-layout'
import { buildDirectionMarkers } from '../layout/direction-marker'
import { buildGridLayout } from '../layout/grid-layout'
import { getSymbolOrUnknown } from '../stitch-symbols'
import type { KnittingChartData } from '../types'
import type { ChartLayout } from './shared'

export function layoutCable(data: KnittingChartData): ChartLayout {
  const cables = buildCableLayout(data)
  const grid = buildGridLayout(data, {
    defaultSymbolSlug: 'knit',
  })
  const placements = grid.placements.filter(
    (p) => !cables.consumedCells.has(`${p.x},${p.y}`),
  )
  const markers = buildDirectionMarkers(data)

  const warnings: string[] = []
  for (const u of grid.unknownSlugs) {
    warnings.push(`Unknown symbol slug "${u}" used in chart.`)
  }
  warnings.push(...cables.warnings)

  // Legend: distinct ground symbols + distinct cable types in use.
  const seen = new Set<string>()
  for (const c of data.grid.cells) seen.add(c.s)
  const legend = Array.from(seen).map((slug) => {
    const sym = getSymbolOrUnknown(slug)
    return {
      slug,
      label: sym.label,
      abbreviation: sym.abbreviation,
      colour: null,
    }
  })
  // Add an entry per distinct cable type so the key explains the
  // crossings.
  const cableTypes = new Set<string>()
  for (const c of cables.crossings) cableTypes.add(c.type)
  for (const ct of cableTypes) {
    legend.push({
      slug: `cable-${ct.toLowerCase()}`,
      label: `Cable crossing ${ct}`,
      abbreviation: ct,
      colour: null,
    })
  }

  return {
    type: 'CABLE',
    width: data.grid.width,
    height: data.grid.height,
    placements,
    cables: cables.crossings,
    markers,
    rowCounts: grid.rowCounts,
    legend,
    warnings,
  }
}
