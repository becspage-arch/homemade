import type { StitchShape } from '../types'

/**
 * Foundation treble — `fdc-tr` / `cfd`. Treble post with a chain root at
 * the base (combines chain + treble in one stitch). Reads as a treble with
 * a small oval at the base.
 */
export const FOUNDATION_TREBLE: StitchShape = {
  key: 'foundation-treble',
  label: 'foundation treble',
  heightUnits: 2.1,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -1.92 Q -0.16 -2 0 -2 Q 0.16 -2 0.16 -1.92 L 0.16 -0.05 Z ' +
    'M -0.30 -0.85 L 0.30 -1.15 ' +
    'M -0.32 -0.10 Q 0 0.05 0.32 -0.10',
  flavour: 'stroke',
}
