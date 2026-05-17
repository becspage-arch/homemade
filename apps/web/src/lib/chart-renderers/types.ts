/**
 * Shared types for the chart-renderers family.
 *
 * Four diagram families live here:
 *
 *   - `CalligraphyExemplarDefinition` — one letter exemplar showing the
 *     outline, the numbered stroke order, the optional skeletal ductus,
 *     and the guide-lines for the named alphabet.
 *
 *   - `OrigamiFoldDefinition` — a sequence of fold steps for one origami
 *     model. The v1 renderer supports basic folds only (mountain, valley)
 *     with straight or curved arrows. Advanced manoeuvres (inside reverse,
 *     petal, squash, sink, swivel, 3D collapse) are on the deferred-work
 *     list and aren't expressible here.
 *
 *   - `WeavingDraftDefinition` — a standard four-block weaving draft
 *     (threading × shafts, shafts × treadles tie-up, treadles × picks
 *     treadling, plus a computed drawdown). Renders the same shape for
 *     frame / rigid-heddle / four-shaft / tapestry / inkle / card looms;
 *     the renderer relabels the columns per loom type.
 *
 *   - `MacrameKnotDefinition` — one knot from the ten-knot fundamental
 *     library, drawn as a cord-path diagram with optional multi-step
 *     build-up. Renders cord routes, over/under crossings, and the
 *     final tied state.
 *
 * Definitions are stored in the TipTap node's `attrs.definition` and
 * rendered server-side — no client hooks, no canvas. SSG / RSC-safe.
 */

// ───────────────────────────────────────────────────────────────────────
// Calligraphy
// ───────────────────────────────────────────────────────────────────────

/** Alphabets the v1 calligraphy exemplar renderer seeds. The brief seeds
 *  the catalogue with these three; later alphabets are added by widening
 *  the union and dropping new glyphs into the per-alphabet sets. */
export type CalligraphyAlphabet =
  | 'foundational-lower'
  | 'roman-capital'
  | 'italic-lower'

/** The five guide-lines a calligraphy exemplar can show. The renderer
 *  shows whichever of these the definition lists. */
export type CalligraphyGuideLine =
  | 'ascender'
  | 'cap-height'
  | 'x-height'
  | 'baseline'
  | 'descender'

/** Arrow placement on a stroke. The renderer puts the arrowhead at the
 *  end of the path; `none` is for the skeletal-spine case where the arrow
 *  isn't meaningful. */
export type CalligraphyArrowPlacement = 'end' | 'middle' | 'none'

export interface CalligraphyStroke {
  /** 1-indexed stroke order — the number drawn next to the start of the
   *  stroke on the exemplar. */
  stroke: number

  /** SVG path string for the stroke spine. Drawn in the 100×100 unit box
   *  the renderer uses internally; the renderer scales to the final SVG.
   *  Author convention: top-left is (0, 0), bottom-right is (100, 100). */
  path: string

  /** Where the arrowhead sits on the path. Defaults to `'end'`. */
  arrowAt?: CalligraphyArrowPlacement
}

export interface CalligraphyExemplarDefinition {
  /** Which canonical alphabet this letter is from. */
  alphabet: CalligraphyAlphabet

  /** The letter being exemplified — lower-case, upper-case, or a numeral
   *  or punctuation glyph. */
  letter: string

  /** Nib angle in degrees from the baseline. Foundational ~30°,
   *  Italic ~45°, Roman capital ~0° for broad strokes. The renderer
   *  surfaces this as a small label inside the exemplar. */
  nibAngle: number

  /** x-height in nib-widths — Foundational ~4, Italic ~5. Drives the
   *  spacing of the guide-lines on the exemplar. */
  xHeight: number

  /** Which guide-lines to draw. Subset of the five. Authors usually
   *  draw the four that matter for the letter (a lower-case `a` doesn't
   *  need the ascender line; a capital `A` doesn't need x-height). */
  guideLines: CalligraphyGuideLine[]

  /** The ordered list of strokes. Each carries an SVG path and an
   *  arrow placement. The renderer numbers them in order. */
  ductus: CalligraphyStroke[]

  /** Optional outline path for the finished letterform. When present
   *  the renderer fills it lightly behind the ductus so the reader sees
   *  the finished letter together with the stroke order. */
  outline?: string
}

// ───────────────────────────────────────────────────────────────────────
// Origami
// ───────────────────────────────────────────────────────────────────────

/** Basic fold kinds supported by the v1 renderer. */
export type OrigamiFoldKind = 'mountain' | 'valley'

/** Arrow paths supported by the v1 renderer. `straight` is a simple
 *  short arrow placed at the midpoint of the fold line, perpendicular
 *  to it, pointing in the fold direction. `curved` is a half-arc that
 *  rotates a flap around the fold line. */
export type OrigamiArrowKind = 'straight' | 'curved' | 'none'

/** A point in the 100×100 unit box per step. */
export type OrigamiPoint = readonly [number, number]

export interface OrigamiFold {
  /** Mountain or valley. Mountain = dash-dot line; valley = dashed
   *  line. */
  kind: OrigamiFoldKind

  /** Start point of the fold line, in 100×100 units. */
  from: OrigamiPoint

  /** End point of the fold line, in 100×100 units. */
  to: OrigamiPoint

  /** What kind of arrow accompanies the fold. Defaults to `straight`. */
  arrow?: OrigamiArrowKind

  /** For curved arrows, which side of the line the flap rotates over.
   *  `left` or `right` looking from `from` toward `to`. Ignored for
   *  straight + none arrows. Defaults to `right`. */
  arrowSide?: 'left' | 'right'
}

export interface OrigamiStep {
  /** 1-indexed step number. */
  stepNumber: number

  /** Optional short caption shown beneath the diagram. */
  caption?: string

  /** Folds rendered in this step. Authors can stack multiple folds
   *  per step where the move is a single coordinated action (e.g.
   *  "fold both diagonals to find the centre" = two folds, one step). */
  folds: OrigamiFold[]

  /** Optional outline path for the paper shape at the start of the
   *  step. Defaults to a unit square (the renderer draws a 100×100
   *  square if this is omitted). For steps after a fold has changed
   *  the silhouette, supply the new outline so the diagram reads true. */
  outline?: string
}

export interface OrigamiFoldDefinition {
  /** Title of the model — "Crane — preliminary base", "Samurai hat".
   *  Surfaced as the figure caption. */
  title?: string

  /** Total step count, for the reader's progress sense. Should equal
   *  `steps.length`; the renderer surfaces it as "Step N of M". */
  stepCount: number

  /** Ordered list of steps. The renderer stacks them vertically. */
  steps: OrigamiStep[]
}

// ───────────────────────────────────────────────────────────────────────
// Weaving draft
// ───────────────────────────────────────────────────────────────────────

/** Loom types the weaving-draft renderer relabels for. The four-block
 *  draft layout is identical across all of them; only the column /
 *  treadle-label vocabulary changes (`shaft` for floor looms, `card`
 *  for tablet weaving, `pick-up` for inkle, `slot/hole` for
 *  rigid-heddle, `weft-pass` for frame / tapestry).
 *
 *  Card weaving (tablet weaving) uses the same draft shape — each
 *  "shaft" maps to one card, each "treadle" maps to one
 *  card-rotation; the renderer relabels the headers but the layout
 *  stays the standard four-block draft. */
export type WeavingLoomType =
  | 'frame'
  | 'rigid-heddle'
  | 'four-shaft'
  | 'tapestry'
  | 'inkle'
  | 'card'

/**
 * Weaving draft — the standard four-block layout used by every
 * weaving-pattern publication from late-Victorian manuals onwards.
 *
 *   - `threading[]` is the warp-thread sequence. Each entry is the
 *     shaft (1-indexed) the warp thread passes through. Length
 *     equals the warp-repeat width.
 *   - `tieUp[treadle-1][shaft-1]` is the tie-up matrix. `1` means
 *     the treadle lifts that shaft when pressed; `0` means it does
 *     not. Outer length = treadle count; inner length = shaft count.
 *   - `treadling[]` is the pick-by-pick sequence of treadles
 *     pressed. Each entry is the treadle (1-indexed) used for that
 *     pick. Length equals the weft-repeat height.
 *   - The drawdown grid is computed by the renderer from the three
 *     fields above; authors do not specify it.
 *
 * Validation:
 *   - Every entry in `threading` must be ≥ 1 and ≤ `shaftCount`
 *     (derived from the tie-up width).
 *   - Every entry in `treadling` must be ≥ 1 and ≤ `treadleCount`
 *     (derived from the tie-up height).
 *   - Every cell in `tieUp` must be 0 or 1.
 *   - Plain-weave on a frame loom or tapestry is expressible as a
 *     2-shaft / 2-treadle straight-draw draft.
 */
export interface WeavingDraftDefinition {
  /** Title of the draft — "Plain weave on four shafts, straight
   *  draw", "Rosepath twill, 4-shaft". Surfaced as the figure
   *  caption. */
  title?: string

  /** Loom this draft is dressed for. Drives the header labels. */
  loomType: WeavingLoomType

  /** Threading sequence. One entry per warp thread; value is the
   *  shaft (or card) the thread passes through, 1-indexed. */
  threading: number[]

  /** Tie-up matrix: `tieUp[treadleIndex][shaftIndex]` is `1` when
   *  that treadle lifts that shaft, `0` otherwise. The matrix
   *  height is the treadle count; the width is the shaft count. */
  tieUp: Array<Array<0 | 1>>

  /** Treadling sequence. One entry per pick (weft row); value is
   *  the treadle (or card-rotation) used for that pick, 1-indexed. */
  treadling: number[]

  /** Optional plain-prose caption shown beneath the drawdown.
   *  Keep short — the draft speaks for itself. */
  caption?: string
}

// ───────────────────────────────────────────────────────────────────────
// Macramé knot
// ───────────────────────────────────────────────────────────────────────

/** The ten fundamental macramé knots the renderer can draw. Every
 *  macramé tutorial draws from this set; the renderer holds the
 *  cord-path geometry for each knot. Adding a knot is a matter of
 *  widening this union and adding a case to the renderer's switch. */
export type MacrameKnotType =
  | 'square'
  | 'half-hitch-left'
  | 'half-hitch-right'
  | 'larks-head'
  | 'double-half-hitch-left'
  | 'double-half-hitch-right'
  | 'alternating-square'
  | 'gathering'
  | 'overhand'
  | 'figure-8'

/**
 * Macramé knot diagram definition.
 *
 *   - `knotType` selects the cord-path geometry the renderer draws.
 *   - `cordCount` controls how many working / filler cords appear.
 *     `2` is the half-hitch / lark's-head / overhand / figure-8
 *     family (one cord over one). `4` is the square-knot family
 *     (two working cords over two filler cords). Some knots only
 *     accept one of the two values — the renderer falls back to the
 *     knot-canonical default if a mismatched value is passed.
 *   - `showSteps` toggles between a single final-state diagram
 *     (default — for PATTERN bodies that reference a knot already
 *     taught) and a multi-step diagram showing the cord positions
 *     at each stage of the knot (for the TECHNIQUE entry that
 *     teaches the knot for the first time).
 */
export interface MacrameKnotDefinition {
  /** The knot to draw. */
  knotType: MacrameKnotType

  /** Working-cord count. `2` for half-hitch family, `4` for
   *  square-knot family. Defaults to the knot-canonical value
   *  if omitted. */
  cordCount?: 2 | 4

  /** Whether to render the multi-step build-up (default false:
   *  single final-state diagram). Set true on the TECHNIQUE entry
   *  that teaches the knot. */
  showSteps?: boolean

  /** Optional caption shown beneath the diagram. Keep short. */
  caption?: string
}
