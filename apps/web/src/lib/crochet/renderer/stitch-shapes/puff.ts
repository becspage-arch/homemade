import type { StitchShape } from '../types'

/**
 * Puff — `puff`. Three to five soft loops drawn up and pulled together.
 * Reads as a softer, more textured cluster than bobble — the renderer
 * draws three vertical loops fanning slightly outward.
 */
export const PUFF: StitchShape = {
  key: 'puff',
  label: 'puff',
  heightUnits: 1.4,
  widthUnits: 1,
  // Three vertical strokes bowing outward — the "puff" silhouette.
  path:
    'M -0.20 -0.05 Q -0.32 -0.7 -0.18 -1.30 ' +
    'M 0 -0.05 Q 0 -0.7 0 -1.32 ' +
    'M 0.20 -0.05 Q 0.32 -0.7 0.18 -1.30',
  fillPath:
    'M -0.28 -0.30 Q -0.36 -0.9 0 -1.25 Q 0.36 -0.9 0.28 -0.30 ' +
    'Q 0 -0.20 -0.28 -0.30 Z',
  flavour: 'stroke-and-fill',
}
