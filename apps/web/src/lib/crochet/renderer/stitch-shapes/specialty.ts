import type { StitchShape } from '../types'

/**
 * Specialty / hard-to-stylise stitches.
 *
 * Tunisian, broomstick, hairpin and crocodile stitches don't have
 * standardised single-stitch glyphs in the IRC / Drops convention.
 * Each entry here is a clean abstract representation of the stitch's
 * silhouette — recognisable without being photoreal.
 *
 * The Stitch master table references these via the same `chartSymbol` key,
 * so the renderer can pull them for both swatches and motif rendering.
 */

// ─── Tunisian ────────────────────────────────────────────────────────────

/**
 * Tunisian simple stitch — `tss`. A vertical bar with a small horizontal
 * cap at the top. The defining feature is the vertical loops; the renderer
 * marks them as a single bold post.
 */
export const TUNISIAN_SIMPLE: StitchShape = {
  key: 'tunisian-simple',
  label: 'Tunisian simple',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.10 -0.05 L -0.10 -0.92 ' +
    'M 0.10 -0.05 L 0.10 -0.92 ' +
    'M -0.18 -0.92 L 0.18 -0.92',
  flavour: 'stroke',
}

/** Tunisian knit stitch — `tks`. Same silhouette as knit V. */
export const TUNISIAN_KNIT: StitchShape = {
  key: 'tunisian-knit',
  label: 'Tunisian knit',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.25 0 L 0 -0.92 L 0.25 0',
  flavour: 'stroke',
}

/** Tunisian purl stitch — `tps`. Small dot at the post. */
export const TUNISIAN_PURL: StitchShape = {
  key: 'tunisian-purl',
  label: 'Tunisian purl',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M 0 -0.05 L 0 -0.92',
  fillPath: 'M -0.15 -0.50 A 0.15 0.15 0 1 0 0.15 -0.50 A 0.15 0.15 0 1 0 -0.15 -0.50 Z',
  flavour: 'stroke-and-fill',
}

/** Tunisian full stitch — `tfs`. Two posts side by side. */
export const TUNISIAN_FULL: StitchShape = {
  key: 'tunisian-full',
  label: 'Tunisian full',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.20 -0.05 L -0.20 -0.92 ' +
    'M 0 -0.05 L 0 -0.92 ' +
    'M 0.20 -0.05 L 0.20 -0.92',
  flavour: 'stroke',
}

/** Tunisian honeycomb — `thc`. Alternating knit + purl posts → diamond. */
export const TUNISIAN_HONEYCOMB: StitchShape = {
  key: 'tunisian-honeycomb',
  label: 'Tunisian honeycomb',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.30 -0.05 L 0 -0.48 L 0.30 -0.05 ' +
    'M -0.30 -0.92 L 0 -0.48 L 0.30 -0.92',
  flavour: 'stroke',
}

/** Tunisian extended — `tes`. Taller silhouette with an extension link. */
export const TUNISIAN_EXTENDED: StitchShape = {
  key: 'tunisian-extended',
  label: 'Tunisian extended',
  heightUnits: 1.4,
  widthUnits: 1,
  path:
    'M -0.10 -0.05 L -0.10 -1.32 ' +
    'M 0.10 -0.05 L 0.10 -1.32 ' +
    'M -0.18 -1.32 L 0.18 -1.32',
  flavour: 'stroke',
}

// ─── Broomstick + hairpin ────────────────────────────────────────────────

/**
 * Broomstick lace — `broomstick-loop` / `broomstick-cluster`. Loops pulled
 * up over a wide pin. Renders as a tall narrow loop silhouette.
 */
export const BROOMSTICK_LOOP: StitchShape = {
  key: 'broomstick-loop',
  label: 'broomstick loop',
  heightUnits: 2.5,
  widthUnits: 0.6,
  path:
    'M -0.10 0 L -0.10 -2.5 ' +
    'M 0.10 0 L 0.10 -2.5 ' +
    'M -0.10 -2.5 Q 0 -2.7 0.10 -2.5',
  flavour: 'stroke',
}

export const BROOMSTICK_CLUSTER: StitchShape = {
  key: 'broomstick-cluster',
  label: 'broomstick cluster',
  heightUnits: 2.5,
  widthUnits: 1.4,
  path:
    'M -0.50 -0.10 L -0.20 -2.4 ' +
    'M -0.10 -0.10 L -0.05 -2.4 ' +
    'M 0.10 -0.10 L 0.05 -2.4 ' +
    'M 0.50 -0.10 L 0.20 -2.4 ' +
    'M -0.50 -0.10 L 0.50 -0.10',
  flavour: 'stroke',
}

/** Hairpin braid loop — `hairpin-basic` / `hairpin-join`. */
export const HAIRPIN_BASIC: StitchShape = {
  key: 'hairpin-basic',
  label: 'hairpin braid',
  heightUnits: 2.6,
  widthUnits: 0.7,
  path:
    'M -0.20 0 L -0.20 -2.45 Q -0.20 -2.6 0 -2.6 Q 0.20 -2.6 0.20 -2.45 L 0.20 0',
  flavour: 'stroke',
}

export const HAIRPIN_JOIN: StitchShape = {
  key: 'hairpin-join',
  label: 'hairpin join',
  heightUnits: 1,
  widthUnits: 1,
  // Twin loops indicating two hairpin braid edges joined.
  path:
    'M -0.25 -0.05 L -0.25 -0.95 ' +
    'M 0.25 -0.05 L 0.25 -0.95 ' +
    'M -0.25 -0.50 L 0.25 -0.50',
  flavour: 'stroke',
}

// ─── Other specialty silhouettes ─────────────────────────────────────────

/** Crocodile stitch — `crocodile`. Scaled "leaf" silhouette. */
export const CROCODILE: StitchShape = {
  key: 'crocodile',
  label: 'crocodile stitch',
  heightUnits: 1.6,
  widthUnits: 1.2,
  path:
    'M -0.55 0 Q -0.30 -1.0 0 -1.6 Q 0.30 -1.0 0.55 0 ' +
    'M -0.40 -0.40 Q 0 -0.10 0.40 -0.40 ' +
    'M -0.30 -0.85 Q 0 -0.55 0.30 -0.85',
  flavour: 'stroke',
}

/** Solomon's knot — `solomons-knot`. Extended chain with a knot dot. */
export const SOLOMONS_KNOT: StitchShape = {
  key: 'solomons-knot',
  label: "Solomon's knot",
  heightUnits: 1.4,
  widthUnits: 0.5,
  path: 'M 0 0 L 0 -1.4',
  fillPath: 'M -0.13 -0.7 A 0.13 0.13 0 1 0 0.13 -0.7 A 0.13 0.13 0 1 0 -0.13 -0.7 Z',
  flavour: 'stroke-and-fill',
}

/** Irish-motif rose — `irish-motif`. Circular rosette silhouette. */
export const IRISH_MOTIF: StitchShape = {
  key: 'irish-motif',
  label: 'Irish motif',
  heightUnits: 1.2,
  widthUnits: 1.2,
  // Rosette outline + inner whorl.
  path:
    'M 0 0 ' +
    'C 0.30 -0.10 0.60 -0.30 0.60 -0.60 ' +
    'C 0.60 -0.95 0.30 -1.20 0 -1.20 ' +
    'C -0.30 -1.20 -0.60 -0.95 -0.60 -0.60 ' +
    'C -0.60 -0.30 -0.30 -0.10 0 0 Z ' +
    'M 0 -0.30 Q 0.30 -0.50 0.30 -0.70 Q 0 -0.85 -0.30 -0.70 Q -0.30 -0.50 0 -0.30',
  flavour: 'stroke',
}

/** Spider stitch — `spider`. Loose spread cluster radiating outward. */
export const SPIDER: StitchShape = {
  key: 'spider',
  label: 'spider stitch',
  heightUnits: 1.6,
  widthUnits: 1.2,
  path:
    'M 0 0 L -0.55 -1.55 ' +
    'M 0 0 L -0.25 -1.6 ' +
    'M 0 0 L 0 -1.6 ' +
    'M 0 0 L 0.25 -1.6 ' +
    'M 0 0 L 0.55 -1.55',
  flavour: 'stroke',
}
