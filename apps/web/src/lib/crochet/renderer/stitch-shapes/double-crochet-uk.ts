import type { StitchShape } from '../types'

/**
 * Double crochet (UK) — `dc` — equivalent to US single crochet. Short
 * vertical post, no slash. Height 1 unit.
 */
export const DOUBLE_CROCHET_UK: StitchShape = {
  key: 'double-crochet-uk',
  label: 'double crochet (UK)',
  heightUnits: 1,
  widthUnits: 1,
  // Twin verticals (yarn body) joined at the top by a soft cap.
  path:
    'M -0.16 -0.05 L -0.16 -0.92 Q -0.16 -1 0 -1 Q 0.16 -1 0.16 -0.92 L 0.16 -0.05 Z',
  flavour: 'stroke',
}
