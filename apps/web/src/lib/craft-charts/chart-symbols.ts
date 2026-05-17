/**
 * Symbol library for the craft-chart SVG renderer.
 *
 * Each entry is a craft + symbol-key pair pointing at the SVG `<g>` fragment
 * the renderer drops into a chart cell at the right position. Symbols are
 * drawn in a 24×24 unit box centred on (0, 0); the renderer scales and
 * translates per cell.
 *
 * Crochet symbols follow the international crochet symbol convention (the
 * one Pierrot Yarns, Drops, and the Stylecraft pattern book use). Knitting
 * symbols follow the Knitter's Symbol Library convention (Walker, Newton).
 *
 * To add a symbol: append a new entry keyed by craft + symbol key; keep the
 * glyph centred on (0, 0) and within the 24×24 box. The renderer handles
 * scaling.
 *
 * The Stitch master table's `chartSymbol` column points at the key string.
 * Authoring briefs reference the same key in `ChartStitch.symbol`.
 */

import type { Craft } from './types'

export interface ChartSymbolDefinition {
  /** Craft this symbol belongs to. */
  craft: Craft

  /** Symbol key — matches `Stitch.chartSymbol` and `ChartStitch.symbol`. */
  key: string

  /** Short label for the chart-key legend ("dc — double crochet"). */
  label: string

  /** SVG path / element fragment, centred on (0, 0) within a 24×24 box.
   *  React JSX is intentionally not used here — the renderer interpolates
   *  the string into the output SVG, which keeps this module
   *  framework-free and serializable. */
  svg: string
}

/**
 * Crochet symbols — the foundation glyphs every motif chart needs. Crochet
 * convention reads charts in working order: starting chain at the centre
 * for in-the-round, bottom-right for flat right-side rows.
 */
const CROCHET_SYMBOLS: ChartSymbolDefinition[] = [
  {
    craft: 'crochet',
    key: 'chain',
    label: 'ch — chain',
    // Open oval glyph.
    svg: '<ellipse cx="0" cy="0" rx="8" ry="4" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'slip-stitch',
    label: 'sl st — slip stitch',
    // Filled small dot.
    svg: '<circle cx="0" cy="0" r="3.5" fill="currentColor"/>',
  },
  {
    craft: 'crochet',
    key: 'double-crochet-uk',
    label: 'dc — double crochet (UK)',
    // Plus glyph (UK dc = US sc).
    svg: '<line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'half-treble',
    label: 'htr — half treble',
    // T glyph.
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'treble',
    label: 'tr — treble',
    // Cross-on-stem glyph.
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'double-treble',
    label: 'dtr — double treble',
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-3" x2="5" y2="-3" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="3" x2="5" y2="3" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'triple-treble',
    label: 'trtr — triple treble',
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-4" x2="5" y2="-4" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="4" x2="5" y2="4" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'magic-ring',
    label: 'MR — magic ring',
    // Ring with adjustable-loop tail.
    svg: '<circle cx="0" cy="0" r="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="0" y1="6" x2="6" y2="10" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'foundation-treble',
    label: 'fdc / cfd — foundation treble',
    // Treble stem with rooted base.
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="7" x2="5" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'front-loop',
    label: 'flo — front loop only',
    // Small horizontal hook.
    svg: '<path d="M -6 0 Q 0 -4 6 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'back-loop',
    label: 'blo — back loop only',
    svg: '<path d="M -6 0 Q 0 4 6 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'treble-cluster',
    label: '3tr-cl — treble cluster',
    // Three trebles meeting at the top.
    svg: '<line x1="-6" y1="-7" x2="6" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="-6" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="6" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'shell',
    label: 'shell — 5-tr shell',
    // Fan of five trebles.
    svg: '<line x1="-9" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-8" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-8" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="5" y1="-8" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="9" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'bobble',
    label: 'bo — bobble',
    // Filled lozenge.
    svg: '<ellipse cx="0" cy="0" rx="5" ry="7" fill="currentColor"/>',
  },
  {
    craft: 'crochet',
    key: 'puff',
    label: 'puff — puff stitch',
    // Bulging cluster of three.
    svg: '<path d="M -6 -7 Q -3 0 -1 7 M 0 -8 Q 0 0 0 7 M 6 -7 Q 3 0 1 7" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'popcorn',
    label: 'pc — popcorn',
    svg: '<circle cx="0" cy="0" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="0" cy="0" r="3" fill="currentColor"/>',
  },
  {
    craft: 'crochet',
    key: 'picot',
    label: 'p — picot',
    // Triangle of three chains.
    svg: '<path d="M -5 5 L 0 -7 L 5 5 Z" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'v-stitch',
    label: 'V-st — V-stitch',
    // V shape.
    svg: '<line x1="-7" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="7" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'crossed-treble',
    label: 'cr-tr — crossed treble',
    // X of two trebles.
    svg: '<line x1="-7" y1="-7" x2="7" y2="7" stroke="currentColor" stroke-width="2"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
]

/**
 * Knitting symbols — minimum starter set seeded here so the renderer can
 * already speak knitting. The knitting pipeline session extends this list
 * with full cable / colourwork glyphs.
 */
const KNITTING_SYMBOLS: ChartSymbolDefinition[] = [
  {
    craft: 'knitting',
    key: 'knit',
    label: 'k — knit',
    // Blank cell (knit on RS reads as empty).
    svg: '<rect x="-9" y="-9" width="18" height="18" fill="none" stroke="currentColor" stroke-width="0.5"/>',
  },
  {
    craft: 'knitting',
    key: 'purl',
    label: 'p — purl',
    svg: '<circle cx="0" cy="0" r="3.5" fill="currentColor"/>',
  },
  {
    craft: 'knitting',
    key: 'yarn-over',
    label: 'yo — yarn over',
    svg: '<circle cx="0" cy="0" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'knitting',
    key: 'k2tog',
    label: 'k2tog — knit two together',
    svg: '<line x1="-7" y1="-7" x2="7" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'knitting',
    key: 'ssk',
    label: 'ssk — slip slip knit',
    svg: '<line x1="7" y1="-7" x2="-7" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
]

const ALL_SYMBOLS = [...CROCHET_SYMBOLS, ...KNITTING_SYMBOLS]

const SYMBOL_INDEX = new Map<string, ChartSymbolDefinition>(
  ALL_SYMBOLS.map((s) => [`${s.craft}:${s.key}`, s]),
)

/**
 * Returns the symbol definition for a craft + key pair, or null if the
 * key is unknown. The renderer falls back to a labelled placeholder in
 * that case.
 */
export function getChartSymbol(
  craft: Craft,
  key: string,
): ChartSymbolDefinition | null {
  return SYMBOL_INDEX.get(`${craft}:${key}`) ?? null
}

/**
 * Returns every symbol the renderer should surface in the chart's legend
 * for a given chart. The legend includes every distinct symbol used in
 * the chart, in alphabetical order.
 */
export function legendForSymbols(
  craft: Craft,
  usedKeys: ReadonlyArray<string>,
): ChartSymbolDefinition[] {
  const seen = new Set<string>()
  const out: ChartSymbolDefinition[] = []
  for (const key of usedKeys) {
    if (seen.has(key)) continue
    seen.add(key)
    const sym = getChartSymbol(craft, key)
    if (sym) out.push(sym)
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}
