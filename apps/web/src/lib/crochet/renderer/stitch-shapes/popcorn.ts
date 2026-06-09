import type { StitchShape } from '../types'

/**
 * Popcorn — `pc`. Five trebles joined at the top and pulled through to
 * pop forward. Reads as a more pronounced rounded blob than bobble, with
 * a faint outline halo.
 */
export const POPCORN: StitchShape = {
  key: 'popcorn',
  label: 'popcorn',
  heightUnits: 1.6,
  widthUnits: 1.1,
  path: 'M 0 -0.10 L 0 -0.30',
  // Larger, more spherical than bobble. The fill path draws the blob;
  // the renderer also adds a faint outline halo via stroke.
  fillPath:
    'M -0.40 -0.85 Q -0.50 -0.40 -0.10 -0.30 Q 0 -0.28 0.10 -0.30 ' +
    'Q 0.50 -0.40 0.40 -0.85 Q 0.30 -1.45 0 -1.5 Q -0.30 -1.45 -0.40 -0.85 Z',
  flavour: 'stroke-and-fill',
}
