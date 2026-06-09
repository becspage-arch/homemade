/**
 * Lace chart layout.
 *
 * Mono rendering — the chart says nothing about colour; the symbol
 * vocabulary (knit / yarn-over / k2tog / ssk / cdd / no-stitch) does
 * the work. The renderer draws every symbol in the theme foreground.
 *
 * Shaped lace (triangular shawls, top-down circular shawls) uses
 * no-stitch markers to keep the chart's rectangular grid visible
 * while signalling which columns the knitter should skip on each row.
 */

import { buildCableLayout } from '../layout/cable-layout'
import { buildDirectionMarkers } from '../layout/direction-marker'
import { buildGridLayout } from '../layout/grid-layout'
import { getSymbolOrUnknown, listSymbols } from '../stitch-symbols'
import type { KnittingChartData } from '../types'
import type { ChartLayout } from './shared'

const LACE_LEGEND_SLUGS = new Set([
  'knit',
  'purl',
  'yarn-over',
  'k2tog',
  'ssk',
  'cdd',
  'k3tog',
  'sssk',
  'sl1',
  'no-stitch',
  'm1l',
  'm1r',
])

export function layoutLace(data: KnittingChartData): ChartLayout {
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
    warnings.push(`Unknown lace symbol slug "${u}" used in chart.`)
  }
  warnings.push(...cables.warnings)

  // Build the legend from slugs that appear in the chart AND are
  // recognised lace symbols. Unknown slugs go in too so the legend
  // tells the knitter what we used.
  const seen = new Set<string>()
  for (const c of data.grid.cells) seen.add(c.s)
  const legend = Array.from(seen)
    .filter((slug) => LACE_LEGEND_SLUGS.has(slug) || !listSymbols().find((s) => s.key === slug))
    .map((slug) => {
      const sym = getSymbolOrUnknown(slug)
      return {
        slug,
        label: sym.label,
        abbreviation: sym.abbreviation,
        colour: null,
      }
    })

  return {
    type: 'LACE',
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
