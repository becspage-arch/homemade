// Short-row heels — German, Japanese, and Dutch variants.
//
// Short-row heels work the heel turn directly across half the stitches
// without a separate flap. The three variants differ only in how the
// wrapping-and-turning is hidden:
//
// - German: turn produces "double stitches" that resolve when worked.
//   Stretchy, fast.
// - Japanese: marker pin + lift method. Cleaner stitch surface; slower.
// - Dutch: traditional W&T (wrap-and-turn). Classic look, learning
//   curve.
//
// The stitch maths is identical across all three; the difference is
// purely the wrap mechanism. So we share one function and label by
// variant.

import type { Gauge } from '../../grading/gauge'

export type ShortRowVariant = 'GERMAN' | 'JAPANESE' | 'DUTCH'

export interface ShortRowHeelInput {
  legStitchCount: number
  variant: ShortRowVariant
  gauge: Gauge
}

export interface ShortRowHeelOutput {
  heelFlapStitches: number
  heelFlapRows: number
  heelTurnRows: number
  heelTurnStitchCount: number
  gussetStitchesPickedUp: number
  gussetPeakStitchCount: number
  gussetRows: number
  shortRowPairsWedge1: number
  shortRowPairsWedge2: number
}

export function shortRowHeel(input: ShortRowHeelInput): ShortRowHeelOutput {
  // Half the stitches form the heel cup.
  const heelStitches = Math.round(input.legStitchCount / 2)

  // First wedge: short-row down to about 1/3 of heel stitches active.
  // Second wedge: short-row back up to all heel stitches active.
  const wedge1Pairs = Math.max(3, Math.round(heelStitches * 0.33))
  const wedge2Pairs = wedge1Pairs

  // Total rows: 2 rows per pair × 2 wedges.
  const heelTurnRows = (wedge1Pairs + wedge2Pairs) * 2

  // Short-row heels have no flap and no gusset increase — the foot
  // continues at the original leg stitch count straight off the heel.
  return {
    heelFlapStitches: heelStitches,
    heelFlapRows: 0,
    heelTurnRows,
    heelTurnStitchCount: heelStitches,
    gussetStitchesPickedUp: 0,
    gussetPeakStitchCount: input.legStitchCount,
    gussetRows: 0,
    shortRowPairsWedge1: wedge1Pairs,
    shortRowPairsWedge2: wedge2Pairs,
  }
}

export function shortRowHeelLabel(variant: ShortRowVariant): string {
  switch (variant) {
    case 'GERMAN': return 'German short-row heel'
    case 'JAPANESE': return 'Japanese short-row heel'
    case 'DUTCH': return 'Dutch short-row heel'
  }
}
