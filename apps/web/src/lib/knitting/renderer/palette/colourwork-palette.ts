/**
 * Colourwork palette resolution.
 *
 * COLOURWORK charts carry a `palette` array — every symbol slug in the
 * grid should appear in the palette with an explicit RGB. The palette
 * builder normalises this into a Map for cell-by-cell lookup and
 * returns a list of any symbol slugs that the grid references but the
 * palette doesn't cover — those fall back to a neutral undyed colour.
 *
 * For grounds that don't carry a palette (rare — colourwork without
 * declared colours), we fall back to a Scandinavian-natural default
 * cycle so the chart still reads as a real piece of work.
 */

import type { ChartPaletteEntry, KnittingChartData } from '../types'

/** Natural wool default — used when a colourwork chart omits its
 *  palette. Two-colour Scandinavian default: undyed cream + heather
 *  charcoal. */
const NATURAL_FALLBACK = ['#ece2c9', '#3a3a40']

export interface ResolvedColourPalette {
  bySymbol: Map<string, string>
  entries: ChartPaletteEntry[]
  /** Slugs referenced in the grid but missing from the palette. */
  missingSlugs: string[]
}

export function resolveColourworkPalette(
  data: KnittingChartData,
): ResolvedColourPalette {
  const bySymbol = new Map<string, string>()
  const entries = data.palette ?? []
  for (const e of entries) {
    bySymbol.set(e.symbol, e.rgb)
  }

  const seenInGrid = new Set<string>()
  for (const c of data.grid.cells) {
    seenInGrid.add(c.s)
  }

  const missing: string[] = []
  let fallbackIndex = 0
  for (const s of seenInGrid) {
    if (!bySymbol.has(s) && s !== 'no-stitch' && !s.startsWith('cable-')) {
      missing.push(s)
      bySymbol.set(
        s,
        NATURAL_FALLBACK[fallbackIndex % NATURAL_FALLBACK.length]!,
      )
      fallbackIndex++
    }
  }

  return { bySymbol, entries, missingSlugs: missing }
}
