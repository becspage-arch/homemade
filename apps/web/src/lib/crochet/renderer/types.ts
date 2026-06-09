/**
 * Crochet finished-piece renderer types.
 *
 * The renderer takes the same `ChartDefinition` shape that the working-chart
 * SVG renderer uses (apps/web/src/lib/craft-charts/types.ts) and outputs an
 * SVG that looks like the finished motif — yarn-shaped stitches in the
 * pattern's palette colours, laid out per the chart's geometry, no symbol
 * glyphs.
 *
 * Working chart vs finished piece:
 *   - Working chart (craft-charts/svg-chart.tsx) draws 24x24 symbol glyphs at
 *     each chart cell — readable while crocheting, not realistic.
 *   - Finished piece (this library) draws shaped yarn strokes per stitch in
 *     the palette colours — realistic enough for hero / thumbnail / library
 *     card, no AI image generation.
 *
 * Both libraries consume the same chartData. A pattern's hero comes from this
 * renderer; the in-product chart view stays on craft-charts.
 */

/**
 * Stitch shape definition. Each entry describes one crochet stitch as an SVG
 * path drawn in a normalised coordinate space:
 *
 *   - Base at (0, 0) — where the stitch joins the previous row / round.
 *   - Top at (0, -heightUnits) — where the next stitch attaches.
 *   - Width spans roughly x = [-0.5, +0.5].
 *
 * The renderer translates, rotates and scales the path per stitch position.
 * Paths use 'M' / 'L' / 'Q' / 'C' / 'Z' as standard SVG path commands.
 *
 * 'fillPath' is the optional inner-body region — when set, the renderer fills
 * it with the palette colour; otherwise it strokes 'path' with a thick yarn
 * stroke. Both produce yarn-like results; fillPath is for stitches that read
 * better as a solid blob (bobble, popcorn, puff).
 */
export interface StitchShape {
  /** Symbol key matches Stitch.chartSymbol / ChartStitch.symbol. */
  key: string

  /** Short label for debug + verifier output ("treble", "bobble"). */
  label: string

  /** Stitch height in units. chain ~0.45, sl st ~0.3, dc 1, htr 1.4, tr 2,
   *  dtr 2.8, trtr 3.6. Used by the layout engine to step rounds outward. */
  heightUnits: number

  /** Stitch width in units. Default 1 — most stitches occupy one "column".
   *  Wider clusters (shell = 1.4) are handled at the chart-stitch level via
   *  the count expansion; this field stays 1 for the per-stitch path. */
  widthUnits: number

  /** SVG path drawn with the base at (0, 0) pointing up. Use this when the
   *  stitch reads better as a stroked yarn outline (most stitches). */
  path: string

  /** Optional filled blob for stitches that read better as solid (bobble,
   *  popcorn, puff). When present, the renderer fills it AND strokes 'path'. */
  fillPath?: string

  /** Render flavour:
   *  - 'stroke' (default) — thick yarn stroke along 'path'.
   *  - 'fill'             — fill 'fillPath' as a solid blob.
   *  - 'stroke-and-fill'  — both (post stitches + the blob).
   *  - 'flat'             — thinner stroke for low-profile stitches
   *                          (chain, slip-stitch, joins). */
  flavour?: 'stroke' | 'fill' | 'stroke-and-fill' | 'flat'

  /** Treat the stitch as a structural marker rather than a visible stitch
   *  (magic-ring centre, foundation row). The renderer draws a faint
   *  scaffolding mark instead of a yarn shape. */
  marker?: boolean
}

/** Resolved colour palette — keyed by `ChartStitch.colourKey`. Per-round
 *  defaults are applied when a stitch lacks a colourKey. */
export interface RendererPalette {
  /** Map of colourKey → CSS hex (#rrggbb). */
  byKey: Record<string, string>

  /** Per-round colour cycle when stitches don't carry a colourKey. The
   *  renderer indexes the array by `roundNumber - 1` (wrap-around). */
  perRound: string[]

  /** Background fill ("fabric" colour). Defaults to a soft cream. */
  background: string
}

/** Final geometry of one rendered stitch. */
export interface StitchPlacement {
  shape: StitchShape
  /** Centre x in pixels. */
  cx: number
  /** Centre y in pixels. */
  cy: number
  /** Rotation in radians applied around (cx, cy). 0 = pointing up. */
  rotationRad: number
  /** Pixel scale applied to the unit path. */
  scalePx: number
  /** Resolved colour for this stitch (#rrggbb). */
  colour: string
  /** 1-indexed round / row this stitch belongs to. Used by the verifier. */
  roundNumber: number
  /** Stitch index within the round / row. */
  indexInRound: number
}

/** What the layout engine returns. */
export interface LayoutResult {
  /** Pixel width of the output canvas. */
  width: number
  /** Pixel height of the output canvas. */
  height: number
  /** Placements in render order (back-to-front for round work). */
  placements: StitchPlacement[]
  /** Detected motif shape — drives the optional outline + caption. */
  shape: MotifShape
}

/** Inferred motif geometry. Drives layout. */
export type MotifShape =
  | { kind: 'round' }
  | { kind: 'square' }
  | { kind: 'hexagon' }
  | { kind: 'flat'; rows: number; columns: number }

/** Options threaded through to `renderPattern`. */
export interface RenderOptions {
  /** Pixel size per unit. Final canvas is roughly 2 * outerRadius * UNIT_PX
   *  for round work; rows * UNIT_PX for flat work. Defaults to a value
   *  that produces a ~1200px output for the typical 3-round motif. */
  unitPx?: number

  /** Optional palette override. When omitted, a category-appropriate set
   *  of warm-natural yarn colours is used. */
  palette?: RendererPalette

  /** Title shown on the hero (defaults off — heroes don't carry labels). */
  showTitle?: boolean

  /** Render the centre crosshair (debug). Defaults to false. */
  showCentreCrosshair?: boolean
}

/** Verifier verdict. */
export interface VerifyResult {
  ok: boolean
  issues: string[]
  /** Total stitch count placed by the layout. */
  stitchCount: number
  /** Expected stitch count derived from the chart's count expansion. */
  expectedStitchCount: number
  /** Bounding box of all placements (px). */
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
}
