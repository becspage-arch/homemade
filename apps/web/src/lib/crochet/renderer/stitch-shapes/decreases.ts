import type { StitchShape } from '../types'

/**
 * dc2tog / invisible-dec — two stitches worked together to decrease. Reads
 * as two narrowing posts meeting at the top.
 */
export const DC2TOG: StitchShape = {
  key: 'dc2tog',
  label: 'dc2tog',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.30 -0.05 L 0 -0.92 ' +
    'M 0.30 -0.05 L 0 -0.92 ' +
    'M -0.10 -0.92 L 0.10 -0.92',
  flavour: 'stroke',
}

export const INVISIBLE_DECREASE: StitchShape = {
  key: 'invisible-dec',
  label: 'invisible decrease',
  heightUnits: 1,
  widthUnits: 1,
  // Visually similar to dc2tog with slightly tighter peak.
  path:
    'M -0.24 -0.05 L 0 -0.92 ' +
    'M 0.24 -0.05 L 0 -0.92',
  flavour: 'stroke',
}
