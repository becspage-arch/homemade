import type { StitchShape } from '../types'

/**
 * Slip stitch — `sl st`. The lowest-profile stitch. Used for joining
 * rounds, moving along a row, surface decoration. Renders as a small flat
 * loop just above the previous row.
 */
export const SLIP_STITCH: StitchShape = {
  key: 'slip-stitch',
  label: 'slip stitch',
  heightUnits: 0.3,
  widthUnits: 1,
  path: 'M -0.32 -0.12 Q 0 -0.32 0.32 -0.12 Q 0 -0.02 -0.32 -0.12 Z',
  flavour: 'flat',
}
