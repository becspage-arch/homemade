import type { StitchShape } from '../types'

/**
 * Double treble — `dtr` (UK) — equivalent to US treble crochet. Tall post
 * with two yarn-over slashes. Height 2.8 units.
 */
export const DOUBLE_TREBLE: StitchShape = {
  key: 'double-treble',
  label: 'double treble',
  heightUnits: 2.8,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -2.72 Q -0.16 -2.8 0 -2.8 Q 0.16 -2.8 0.16 -2.72 L 0.16 -0.05 Z ' +
    'M -0.30 -0.95 L 0.30 -1.25 ' +
    'M -0.30 -1.65 L 0.30 -1.95',
  flavour: 'stroke',
}
