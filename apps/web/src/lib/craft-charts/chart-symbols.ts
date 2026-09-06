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
  {
    craft: 'crochet',
    key: 'dc2tog',
    label: 'dc2tog — double crochet 2 together',
    // Decrease: two legs meeting at a single point at the top. The
    // mirror of the V-stitch (which splays from a single base). Same
    // shape as US sc2tog.
    svg: '<line x1="0" y1="-8" x2="-7" y2="8" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-8" x2="7" y2="8" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'front-post',
    label: 'fpdc / fptr — front post',
    // Treble stem whose foot hooks forward (to the right) around the post.
    svg: '<line x1="-6" y1="-8" x2="6" y2="-8" stroke="currentColor" stroke-width="2"/><path d="M 0 -8 L 0 5 Q 0 9 4 9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-1" x2="5" y2="-1" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'back-post',
    label: 'bpdc / bptr — back post',
    // Mirror of the front-post glyph — the foot hooks back (to the left).
    svg: '<line x1="-6" y1="-8" x2="6" y2="-8" stroke="currentColor" stroke-width="2"/><path d="M 0 -8 L 0 5 Q 0 9 -4 9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-1" x2="5" y2="-1" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'quadruple-treble',
    label: 'quadtr — quadruple treble',
    // Treble stem with four crossbars (one more than triple-treble).
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-4.5" x2="5" y2="-4.5" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-1.5" x2="5" y2="-1.5" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="1.5" x2="5" y2="1.5" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="4.5" x2="5" y2="4.5" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'crossed-double-treble',
    label: 'cr-dtr — crossed double treble',
    // X of two double trebles — the crossed-treble X with the double-
    // treble crossbars added near the centre.
    svg: '<line x1="-7" y1="-7" x2="7" y2="7" stroke="currentColor" stroke-width="2"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-4" y1="-1" x2="4" y2="-1" stroke="currentColor" stroke-width="2"/><line x1="-4" y1="2" x2="4" y2="2" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'third-loop-htr',
    label: '3rd-loop htr — half treble in third loop',
    // Half-treble T with a short tick at the base marking the third loop.
    svg: '<line x1="-7" y1="-7" x2="7" y2="-7" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" stroke-width="2"/><line x1="-4" y1="7" x2="4" y2="7" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'fan',
    label: 'fan — fan stitch',
    // Open fan of trebles from one base point, tied by a top arc.
    svg: '<line x1="-9" y1="-6" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><line x1="-5" y1="-7" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-8" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><line x1="5" y1="-7" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><line x1="9" y1="-6" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><path d="M -9 -6 Q 0 -11 9 -6" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'crochet',
    key: 'star-stitch',
    label: 'star — star stitch',
    // Six-point burst.
    svg: '<line x1="0" y1="-8" x2="0" y2="8" stroke="currentColor" stroke-width="2"/><line x1="-7" y1="-4" x2="7" y2="4" stroke="currentColor" stroke-width="2"/><line x1="-7" y1="4" x2="7" y2="-4" stroke="currentColor" stroke-width="2"/>',
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
  {
    craft: 'knitting',
    key: 'make-1',
    label: 'm1 — make 1',
    // Capital M-style glyph: two slanted strokes meeting at the centre.
    svg: '<path d="M -7 7 L -3 -7 L 0 0 L 3 -7 L 7 7" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'knitting',
    key: 'slip-stitch',
    label: 'sl1 — slip 1',
    // V glyph — the standard slip-stitch chart symbol.
    svg: '<path d="M -6 -7 L 0 7 L 6 -7" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'knitting',
    key: 'knit-tbl',
    label: 'k1tbl — knit through back loop',
    // Circle-with-dot glyph: the twisted-stitch symbol convention.
    svg: '<circle cx="0" cy="0" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="0" cy="0" r="1.5" fill="currentColor"/>',
  },
  {
    craft: 'knitting',
    key: 'cable-4-front',
    label: 'c4f — cable 4 front (left-leaning)',
    // Two crossed lines leaning left across a 4-wide cell strip. The
    // renderer pads in either direction; the glyph indicates the lean.
    svg: '<path d="M -9 -7 Q -9 0 0 0 Q 9 0 9 7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M 9 -7 Q 9 0 0 0 Q -9 0 -9 7" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'knitting',
    key: 'cable-4-back',
    label: 'c4b — cable 4 back (right-leaning)',
    // Mirror of cable-4-front. The two crossing arcs swap dominance.
    svg: '<path d="M 9 -7 Q 9 0 0 0 Q -9 0 -9 7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M -9 -7 Q -9 0 0 0 Q 9 0 9 7" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
]

/**
 * Cross-stitch symbols. Counted work sits on a grid, so every glyph is drawn
 * inside a faint cell square: the square is the fabric square, the mark inside
 * it is the stitch. That keeps the reference honest about where a stitch sits
 * relative to the hole it goes through, which is the thing a beginner is
 * trying to read off a chart.
 *
 * Drawn on the same 24x24 box as the other crafts, so the shared glyph
 * renderer needs no special case.
 */
const CELL = '<rect x="-9" y="-9" width="18" height="18" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.45"/>'

const CROSS_STITCH_SYMBOLS: ChartSymbolDefinition[] = [
  {
    craft: 'cross-stitch',
    key: 'full-cross',
    label: 'Full cross stitch',
    // Two diagonals corner to corner: one square, one stitch.
    svg: CELL + '<line x1="-9" y1="9" x2="9" y2="-9" stroke="currentColor" stroke-width="2"/><line x1="-9" y1="-9" x2="9" y2="9" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'half-stitch',
    label: 'Half stitch',
    // The first leg only, bottom left to top right.
    svg: CELL + '<line x1="-9" y1="9" x2="9" y2="-9" stroke="currentColor" stroke-width="2"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'quarter-stitch',
    label: 'Quarter stitch',
    // Corner into the centre of the square.
    svg: CELL + '<line x1="-9" y1="9" x2="0" y2="0" stroke="currentColor" stroke-width="2"/><circle cx="0" cy="0" r="1.3" fill="currentColor"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'three-quarter-stitch',
    label: 'Three-quarter stitch',
    // A half stitch plus a quarter into the centre: the shape that fills a
    // triangle of the square.
    svg: CELL + '<line x1="-9" y1="9" x2="9" y2="-9" stroke="currentColor" stroke-width="2"/><line x1="-9" y1="-9" x2="0" y2="0" stroke="currentColor" stroke-width="2"/><circle cx="0" cy="0" r="1.3" fill="currentColor"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'back-stitch',
    label: 'Back-stitch',
    // A solid line worked along the edge of the squares, hole to hole.
    svg: CELL + '<line x1="-9" y1="0" x2="9" y2="0" stroke="currentColor" stroke-width="2.4"/><circle cx="-9" cy="0" r="1.6" fill="currentColor"/><circle cx="9" cy="0" r="1.6" fill="currentColor"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'running-stitch',
    label: 'Running stitch',
    // A dashed line: stitch, gap, stitch.
    svg: CELL + '<line x1="-9" y1="0" x2="9" y2="0" stroke="currentColor" stroke-width="2.4" stroke-dasharray="5 3"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'long-stitch',
    label: 'Long stitch',
    // One straight stitch spanning more than one square.
    svg: CELL + '<line x1="-11" y1="6" x2="11" y2="-6" stroke="currentColor" stroke-width="2.4"/><circle cx="-11" cy="6" r="1.6" fill="currentColor"/><circle cx="11" cy="-6" r="1.6" fill="currentColor"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'french-knot',
    label: 'French knot',
    // A filled bead sitting on the fabric with the wrap showing.
    svg: CELL + '<circle cx="0" cy="0" r="4.5" fill="currentColor"/><path d="M -7 4 Q -4 6 -1 4.4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'lazy-daisy',
    label: 'Lazy daisy',
    // A single chain loop anchored at the base.
    svg: CELL + '<path d="M 0 8 Q -6 0 0 -8 Q 6 0 0 8 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="0" y1="-8" x2="0" y2="-10.5" stroke="currentColor" stroke-width="1.8"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'parking',
    label: 'Parking',
    // Not a stitch but a way of working a chart, so the glyph shows the
    // needle itself: left standing in the square it will next be used in,
    // thread still on it, waiting to be picked up again.
    svg:
      CELL +
      '<line x1="-3.5" y1="8.5" x2="5.2" y2="-6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<ellipse cx="6.3" cy="-8.7" rx="1.2" ry="3" transform="rotate(-29 6.3 -8.7)" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<path d="M 8 -10.4 Q 11 -7.5 9.6 -3.5 Q 8.8 -1 10.4 0.8" fill="none" stroke="currentColor" stroke-width="1.1"/>',
  },
  {
    craft: 'cross-stitch',
    key: 'satin-stitch',
    label: 'Satin stitch',
    // Parallel straight stitches laid side by side to fill the shape.
    svg: CELL + '<line x1="-6" y1="8" x2="-6" y2="-8" stroke="currentColor" stroke-width="1.8"/><line x1="-2" y1="8" x2="-2" y2="-8" stroke="currentColor" stroke-width="1.8"/><line x1="2" y1="8" x2="2" y2="-8" stroke="currentColor" stroke-width="1.8"/><line x1="6" y1="8" x2="6" y2="-8" stroke="currentColor" stroke-width="1.8"/>',
  },
]

const ALL_SYMBOLS = [...CROCHET_SYMBOLS, ...KNITTING_SYMBOLS, ...CROSS_STITCH_SYMBOLS]

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
