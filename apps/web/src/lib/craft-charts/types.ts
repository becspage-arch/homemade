/**
 * Generic craft-chart definition. The same shape powers crochet motif charts
 * (in-the-round + flat), knitting charts (flat grid), and the future
 * needlework (cross-stitch + tatting) chart variants.
 *
 * The definition is stored as a JSON column on `Tutorial.chartDefinition`
 * and rendered by `apps/web/src/lib/craft-charts/svg-chart.tsx`. Symbol keys
 * resolve via `apps/web/src/lib/craft-charts/chart-symbols.ts`, which is
 * craft-aware (a crochet `treble` glyph is different from a knitting `cable
 * 6 front` glyph).
 *
 * Author convention: the brief carries one `chartDefinition` per chart-
 * worthy tutorial — every in-the-round motif (granny square, hexagon),
 * every multi-row stitch sample where the chart reads better than the
 * written instructions, and every advanced colourwork repeat.
 */

export type ChartLayout = 'round' | 'flat'

export type Craft = 'crochet' | 'knitting' | 'cross-stitch' | 'tatting'

export interface ChartDefinition {
  /** Caption shown above the chart ("Granny square — first three rounds"). */
  title?: string

  /** 'round' for in-the-round work (granny square, hexagon, doily); 'flat'
   *  for row-by-row work (dishcloth, scarf, blanket panel). */
  layout: ChartLayout

  /** The craft the chart is keyed to. Drives the glyph mapping. */
  craft: Craft

  /** UK terminology by default; 'us' for charts written from a US source. */
  terminologyConvention?: 'uk' | 'us'

  /** Rounds for `layout: 'round'`. Ignored when layout is 'flat'. */
  rounds?: ChartRound[]

  /** Rows for `layout: 'flat'`. Ignored when layout is 'round'. */
  rows?: ChartRow[]

  /** Plain-prose caption shown beneath the chart. Keep short — the chart
   *  speaks for itself; the caption surfaces a single context line ("read
   *  right-side rows right-to-left, wrong-side rows left-to-right"). */
  caption?: string
}

export interface ChartRound {
  /** 1-indexed round number. */
  roundNumber: number

  /** Optional label shown on the chart ("Rnd 1"). Defaults to "Rnd N". */
  label?: string

  /** Ordered list of stitches around the round. The renderer lays them on
   *  a circle of radius proportional to the round number. */
  stitches: ChartStitch[]
}

export interface ChartRow {
  /** 1-indexed row number, counted from the bottom of the chart. */
  rowNumber: number

  /** Defaults true. False for wrong-side rows (read left-to-right). */
  rightSide?: boolean

  /** Optional label ("Row 4 RS" / "Row 5 WS"). Defaults derived from
   *  `rowNumber` + `rightSide`. */
  label?: string

  /** Ordered list of stitches in working order. For a right-side row, the
   *  first stitch is rendered at the right; for a wrong-side row it's at
   *  the left. The renderer mirrors automatically. */
  stitches: ChartStitch[]
}

export interface ChartStitch {
  /** Symbol key — must exist in `chart-symbols.ts` for the row's craft.
   *  Falls back to a labelled placeholder when the key is unknown. */
  symbol: string

  /** Optional in-line repeat count. The renderer expands a `count: 3` cell
   *  into three consecutive cells of the same symbol. Defaults to 1. */
  count?: number

  /** Optional in-cell label. Used for "ch 2" (chain 2) repeats where the
   *  number is part of the read instead of the chart-cell count. */
  label?: string

  /** Optional colour key when the chart is colourwork. Resolved by the
   *  renderer against the colour palette in the chart definition (added
   *  per-tutorial via the body's `infoPanel` legend block when used). */
  colourKey?: string
}
