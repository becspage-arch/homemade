// Afterthought (peasant) heel.
//
// The sock is worked as one continuous tube from cuff to toe with a
// waste-yarn placeholder where the heel will sit. After the toe is
// grafted, the knitter picks out the waste yarn, exposes the live
// stitches above and below, and works the heel as a small toe-shape
// cup. The result is a sock with no shaping interruption in the leg
// fabric — useful for self-striping yarns where flap-and-gusset would
// break the stripe sequence at the heel.
//
// The afterthought heel is a small "second toe" — paired decreases
// every other round from the picked-up stitches down to 16-24 stitches
// then grafted.

import type { Gauge } from '../../grading/gauge'

export interface AfterthoughtHeelInput {
  legStitchCount: number
  footCircumferenceCm: number
  gauge: Gauge
}

export interface AfterthoughtHeelOutput {
  /** Stitches picked up after removing the waste yarn (half top, half
   *  bottom). */
  heelStitchesPickedUp: number
  /** Rows worked on the heel "second toe". */
  heelTurnRows: number
  /** Stitch count at the heel-toe graft. */
  heelGraftStitches: number
  /** No gusset on afterthought heels. */
  gussetPeakStitchCount: number
  gussetRows: number
}

export function afterthoughtHeel(input: AfterthoughtHeelInput): AfterthoughtHeelOutput {
  // Picked-up stitches = leg stitch count (the heel sits where a row of
  // waste yarn used to be, occupying the full circumference).
  const heelStitchesPickedUp = input.legStitchCount
  // Decrease to ~25% of starting then graft.
  const heelGraftStitches = Math.max(16, Math.round(input.legStitchCount * 0.25))
  // Rows = (start - end) / 2 (we decrease 4 per round, 2 sides × 2).
  const heelTurnRows = Math.round((heelStitchesPickedUp - heelGraftStitches) / 4) * 2

  return {
    heelStitchesPickedUp,
    heelTurnRows,
    heelGraftStitches,
    gussetPeakStitchCount: input.legStitchCount,
    gussetRows: 0,
  }
}
