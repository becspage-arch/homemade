import type { StitchShape } from '../types'

/**
 * Half treble — `htr` (UK) — equivalent to US half double crochet. Taller
 * than dc, shorter than tr. Renders as a vertical post with a small
 * crossbar near the top representing the single yarn-over.
 */
export const HALF_TREBLE: StitchShape = {
  key: 'half-treble',
  label: 'half treble',
  heightUnits: 1.4,
  widthUnits: 1,
  // Post + crossbar near the top.
  path:
    'M -0.16 -0.05 L -0.16 -1.32 Q -0.16 -1.4 0 -1.4 Q 0.16 -1.4 0.16 -1.32 L 0.16 -0.05 Z ' +
    'M -0.32 -1.1 L 0.32 -1.1',
  flavour: 'stroke',
}
