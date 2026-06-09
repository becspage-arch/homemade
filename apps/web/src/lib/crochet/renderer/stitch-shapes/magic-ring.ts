import type { StitchShape } from '../types'

/**
 * Magic ring — `MR`. Structural marker, not a yarn shape. Reads as a small
 * adjustable loop at the very centre of the motif. The renderer draws it
 * as a faint hollow circle so it sits behind the round-1 stitches without
 * fighting for visual weight.
 */
export const MAGIC_RING: StitchShape = {
  key: 'magic-ring',
  label: 'magic ring',
  heightUnits: 0.4,
  widthUnits: 1,
  // Small open circle centred on the stitch anchor.
  path: 'M -0.22 -0.2 A 0.22 0.22 0 1 0 0.22 -0.2 A 0.22 0.22 0 1 0 -0.22 -0.2 Z',
  flavour: 'flat',
  marker: true,
}
