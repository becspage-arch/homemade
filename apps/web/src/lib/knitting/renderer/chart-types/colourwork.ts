/**
 * Colourwork chart layout. Used for Fair Isle, Bohus, intarsia, and
 * Scandinavian colourwork.
 *
 * Pure grid: every cell carries a colour drawn from the palette. The
 * underlying stitch is implicitly knit (every cell renders as a knit
 * symbol; the colour does the talking). The renderer picks colour by
 * looking up the cell's symbol slug in the colourwork palette.
 *
 * Cables are technically possible on colourwork (e.g. cabled Fair
 * Isle yokes) — we honour any cables present in the data, but most
 * colourwork charts will have none.
 */

import { buildCableLayout } from '../layout/cable-layout'
import { buildDirectionMarkers } from '../layout/direction-marker'
import { buildGridLayout } from '../layout/grid-layout'
import { resolveColourworkPalette } from '../palette/colourwork-palette'
import { getSymbolOrUnknown } from '../stitch-symbols'
import type { KnittingChartData } from '../types'
import type { ChartLayout } from './shared'

export function layoutColourwork(data: KnittingChartData): ChartLayout {
  const palette = resolveColourworkPalette(data)
  const cables = buildCableLayout(data)
  const grid = buildGridLayout(data, {
    defaultSymbolSlug: 'knit',
    paletteBySymbol: palette.bySymbol,
    forceSymbolSlug: 'knit',
  })

  // Drop cells consumed by cable crossings — cable shapes render
  // above the ground separately.
  const placements = grid.placements.filter(
    (p) => !cables.consumedCells.has(`${p.x},${p.y}`),
  )

  const markers = buildDirectionMarkers(data)
  const warnings: string[] = []
  for (const u of grid.unknownSlugs) {
    warnings.push(`Unknown symbol slug "${u}" used in chart.`)
  }
  for (const m of palette.missingSlugs) {
    warnings.push(
      `Symbol "${m}" referenced in cells but not in palette; using natural fallback colour.`,
    )
  }
  warnings.push(...cables.warnings)

  // Legend gathers each distinct slug used in the grid (excluding the
  // default knit ground, which is implicit in colourwork).
  const seenSlugs = new Set<string>()
  for (const c of data.grid.cells) seenSlugs.add(c.s)
  const legend = Array.from(seenSlugs).map((slug) => {
    const sym = getSymbolOrUnknown(slug)
    return {
      slug,
      label: palette.entries.find((e) => e.symbol === slug)?.name ?? sym.label,
      abbreviation: sym.abbreviation,
      colour: palette.bySymbol.get(slug) ?? null,
    }
  })

  return {
    type: 'COLOURWORK',
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
