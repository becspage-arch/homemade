/**
 * Brioche chart layout.
 *
 * Two-colour: every cell carries a foreground colour drawn from the
 * brioche palette (dark / light), where the colour is determined by
 * whether the row is the "dark half" or the "light half" of a row
 * pair. Within a row, cells whose symbol is brk/brkyobrk show the
 * row colour as a vertical bar; brp shows it as a horizontal dash;
 * the unworked stitch from the OTHER colour shows as a thin vertical
 * mark in the other colour, conveying brioche's two-pass depth.
 */

import { buildCableLayout } from '../layout/cable-layout'
import { buildDirectionMarkers } from '../layout/direction-marker'
import { buildGridLayout } from '../layout/grid-layout'
import { brioichePairColour, resolveBriochePalette } from '../palette/brioche-palette'
import { getSymbolOrUnknown } from '../stitch-symbols'
import type { KnittingChartData } from '../types'
import type { ChartLayout } from './shared'

export function layoutBrioche(data: KnittingChartData): ChartLayout {
  const palette = resolveBriochePalette(data)
  const cables = buildCableLayout(data)
  const grid = buildGridLayout(data, {
    defaultSymbolSlug: 'brk',
  })

  // Recolour each placement based on its row pair. y=height-1 sits
  // at the bottom (row 1), so we measure rowFromBottom = height-1-y.
  const recoloured = grid.placements
    .filter((p) => !cables.consumedCells.has(`${p.x},${p.y}`))
    .map((p) => ({
      ...p,
      fill: brioichePairColour(data.grid.height - 1 - p.y, palette),
    }))

  const markers = buildDirectionMarkers(data)

  const warnings: string[] = []
  for (const u of grid.unknownSlugs) {
    warnings.push(`Unknown brioche symbol slug "${u}" used in chart.`)
  }
  warnings.push(...cables.warnings)

  const seen = new Set<string>()
  for (const c of data.grid.cells) seen.add(c.s)
  const legend = [
    {
      slug: 'brioche-dark',
      label: 'Dark colour',
      abbreviation: 'MC',
      colour: palette.dark,
    },
    {
      slug: 'brioche-light',
      label: 'Light colour',
      abbreviation: 'CC',
      colour: palette.light,
    },
    ...Array.from(seen).map((slug) => {
      const sym = getSymbolOrUnknown(slug)
      return {
        slug,
        label: sym.label,
        abbreviation: sym.abbreviation,
        colour: null as string | null,
      }
    }),
  ]

  return {
    type: 'BRIOCHE',
    width: data.grid.width,
    height: data.grid.height,
    placements: recoloured,
    cables: cables.crossings,
    markers,
    rowCounts: grid.rowCounts,
    legend,
    warnings,
  }
}
