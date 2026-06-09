/**
 * Standard grid layout. Used by colourwork, lace, and brioche charts —
 * any chart whose cells map 1:1 to grid coordinates without spanning.
 *
 * Walks the chart's cell map and produces one placement per cell. The
 * default fill for missing cells depends on chart type (set by the
 * caller via `defaultSymbol`).
 *
 * Knitting charts are read bottom-up in real life — row 1 sits at the
 * bottom of the chart, row N at the top. Internally we store cells with
 * y-index increasing downwards (standard screen coordinates); the
 * composer flips this at render time so row 1 ends up at the bottom.
 */

import { getSymbolOrUnknown } from '../stitch-symbols'
import type {
  KnittingChartData,
  KnittingSymbol,
} from '../types'

export interface CellPlacement {
  /** Grid x-coordinate. */
  x: number
  /** Grid y-coordinate (0 = top of internal grid, height-1 = bottom). */
  y: number
  /** Resolved stitch symbol. */
  symbol: KnittingSymbol
  /** Fill colour for COLOURWORK / BRIOCHE charts; null for mono charts. */
  fill: string | null
}

export interface GridLayoutResult {
  placements: CellPlacement[]
  /** Per-row counted stitch totals (excludes no-stitch + repeat markers). */
  rowCounts: number[]
  /** Slugs the renderer encountered but couldn't resolve. */
  unknownSlugs: string[]
}

interface GridLayoutOptions {
  /** Symbol used for cells the author didn't explicitly populate. */
  defaultSymbolSlug: string
  /** Palette lookup for COLOURWORK / BRIOCHE charts. Null for mono. */
  paletteBySymbol?: Map<string, string>
  /** When set, every cell renders with this symbol regardless of the
   *  cell's own `s` field. Used by COLOURWORK where the cell's slug
   *  identifies the palette colour (not the stitch) and the
   *  underlying stitch is always knit. */
  forceSymbolSlug?: string
}

export function buildGridLayout(
  data: KnittingChartData,
  opts: GridLayoutOptions,
): GridLayoutResult {
  const { width, height, cells } = data.grid
  const cellMap = new Map<string, string>()
  for (const c of cells) {
    cellMap.set(`${c.x},${c.y}`, c.s)
  }

  const placements: CellPlacement[] = []
  const rowCounts: number[] = new Array(height).fill(0)
  const unknownSlugs: string[] = []
  const seenUnknown = new Set<string>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellSlug = cellMap.get(`${x},${y}`) ?? opts.defaultSymbolSlug
      // In colourwork mode (forceSymbolSlug set), the cell's `s` field
      // identifies the palette colour — the symbol is fixed. Otherwise
      // the cell's slug IS the symbol slug.
      const symbolSlug = opts.forceSymbolSlug ?? cellSlug
      const symbol = getSymbolOrUnknown(symbolSlug)
      if (symbol.key === '__unknown__' && !seenUnknown.has(symbolSlug)) {
        seenUnknown.add(symbolSlug)
        unknownSlugs.push(symbolSlug)
      }
      const fill =
        opts.paletteBySymbol?.get(cellSlug) ?? null
      placements.push({ x, y, symbol, fill })
      if (!symbol.excludeFromCount && !symbol.noStitch) {
        rowCounts[y] = (rowCounts[y] ?? 0) + 1
      }
    }
  }

  return { placements, rowCounts, unknownSlugs }
}
