/**
 * Shared types for the Paper & word chart renderers.
 *
 * Two diagram families live here:
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
