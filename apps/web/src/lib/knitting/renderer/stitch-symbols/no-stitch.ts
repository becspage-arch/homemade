import type { KnittingSymbol } from '../types'

/**
 * No-stitch marker. Used in shaped lace where the stitch count varies
 * by row — the chart still occupies a rectangular grid visually but
 * some cells are placeholders that the knitter skips.
 *
 * Rendered as a grey-filled cell with a diagonal stripe pattern; the
 * composer recognises the `noStitch: true` flag and substitutes a
 * stripe pattern fill instead of placing the path.
 *
 * Source: Walker, Stahman's shawl charts.
 */
export const NO_STITCH: KnittingSymbol = {
  key: 'no-stitch',
  label: 'No stitch (skip cell)',
  abbreviation: '',
  // Path is unused for no-stitch cells — composer applies the stripe
  // pattern instead. Provide a tiny placeholder so the shape passes
  // verifier sanity checks.
  path: 'M 0 0 L 0 0',
  noStitch: true,
  excludeFromCount: true,
  source: 'Walker treasury, shawl chart convention',
}
