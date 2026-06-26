/**
 * Needlework pattern engine — public surface.
 *
 * The deterministic back half of the surface-embroidery pattern-maker. Given a
 * pattern's structured elements (per-shape geometry + a controlled stitch slug +
 * DMC floss + an optional dark→light shade ramp), it produces the printable
 * DOCUMENT (transfer template, colour guide, floss key, stitch key, steps). The
 * SAME elements go to the loom's renderHero for the photoreal hero, so the
 * document and the finished piece are one dataset and cannot diverge.
 *
 * Shaded fills carry a `shade` ramp; the loom renders them as BLENDED
 * long-and-short (needle-painting) — there is no band-expansion step here.
 *
 * Reused by both our own catalogue generation and the customer
 * "describe an idea / upload a photo -> your own pattern" feature.
 */

export { buildPatternDocument } from './document'
export type { PatternDocument, FlossRow, StitchRow, ElementLabel } from './document'
export { patternToLineArtSvg } from './lineart'
export type { LineArtOptions } from './lineart'
export type { StitchedElement } from '../../loom/render/renderPattern'

/** A planned pattern element — the loom contract, with optional shading. */
export type { StitchedElement as ShadedElement } from '../../loom/render/renderPattern'
