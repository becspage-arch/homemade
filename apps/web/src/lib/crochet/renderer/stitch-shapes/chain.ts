import type { StitchShape } from '../types'

/**
 * Chain stitch — `ch`. Low-profile horizontal oval. Used as foundation
 * and corner gap markers. Height ~0.45 units.
 *
 * Convention: chain reads as a slim flattened oval centred on the
 * stitch's anchor; the renderer rotates it with the round so the long
 * axis of the chain follows the circumference.
 */
export const CHAIN: StitchShape = {
  key: 'chain',
  label: 'chain',
  heightUnits: 0.45,
  widthUnits: 1,
  path: 'M -0.42 -0.22 Q 0 -0.05 0.42 -0.22 Q 0 -0.4 -0.42 -0.22 Z',
  flavour: 'flat',
}
