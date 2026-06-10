// Flap-and-gusset heel.
//
// The traditional cuff-down sock heel. After the leg, half the stitches
// (heel stitches) work back and forth for a flap of slipped-stitch
// fabric. The flap is turned with paired short-row decreases producing
// a curved heel cup. Stitches are then picked up along each side of the
// flap (gusset increases) and decreased back to the original foot
// stitch count over the gusset rows.
//
// Reference: documented in PD pattern manuals — Weldon's Practical
// Knitting, Beeton's Book of Needlework. The construction is many
// centuries old; the stitch counts here follow the standard ratios.

import type { Gauge } from '../../grading/gauge'

export interface FlapGussetInput {
  footCircumferenceCm: number
  gauge: Gauge
  legStitchCount: number
}

export interface FlapGussetOutput {
  heelFlapStitches: number
  heelFlapRows: number
  heelTurnRows: number
  heelTurnStitchCount: number
  gussetStitchesPickedUp: number
  gussetPeakStitchCount: number
  gussetRows: number
}

export function flapAndGussetHeel(input: FlapGussetInput): FlapGussetOutput {
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  // Heel flap takes half the leg stitches.
  const heelFlapStitches = Math.round(input.legStitchCount / 2)
  // Flap is square-ish: rows ≈ stitches × (rowGauge/stitchGauge).
  const heelFlapRows = Math.round(heelFlapStitches * (rowsPerCm / stitchesPerCm))

  // Heel turn: standard three-section turn leaves about heelFlap × 0.6
  // stitches after the decreases. Rows: about heelFlap × 0.45 rows.
  const heelTurnStitchCount = Math.max(8, Math.round(heelFlapStitches * 0.6))
  const heelTurnRows = Math.max(6, Math.round(heelFlapStitches * 0.45))

  // Gusset pick-up: one stitch per heel-flap row each side, plus the
  // remaining heel-turn stitches. Peak = heelTurn + 2 × (flapRows/2).
  const gussetStitchesPickedUp = Math.round(heelFlapRows / 2)
  const gussetPeakStitchCount =
    heelTurnStitchCount + input.legStitchCount + 2 * gussetStitchesPickedUp
  // Gusset decreases — 2 stitches every other round — back down to the
  // original foot stitch count (= legStitchCount).
  const gussetDecreaseTarget = input.legStitchCount
  const gussetRoundsNeeded = (gussetPeakStitchCount - gussetDecreaseTarget) / 2
  const gussetRows = Math.round(gussetRoundsNeeded * 2)

  return {
    heelFlapStitches,
    heelFlapRows,
    heelTurnRows,
    heelTurnStitchCount,
    gussetStitchesPickedUp,
    gussetPeakStitchCount,
    gussetRows,
  }
}
