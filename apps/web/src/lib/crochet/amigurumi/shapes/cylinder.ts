// Cylinder primitive.
//
// Construction: magic-ring base of 6 sc, increase to circumference
// stitch count, work straight for the body, close (or leave open if a
// limb or appendage).

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface CylinderInput {
  diameterCm: number
  heightCm: number
  gauge: AmigurumiGauge
  /** If true, both ends close. If false, the top is left open (a limb). */
  closeBothEnds?: boolean
  label?: string
}

export function cylinder(input: CylinderInput): AmigurumiPiece {
  const { diameterCm, heightCm, gauge } = input
  if (diameterCm <= 0 || heightCm <= 0) {
    throw new Error('Cylinder diameter and height must be positive.')
  }

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const rowsPerCm = gauge.rowsPer10cm / 10
  const circumferenceStitches = Math.max(12, Math.round(Math.PI * diameterCm * stitchesPerCm / 6) * 6)
  const baseIncreaseRounds = circumferenceStitches / 6
  const bodyRounds = Math.max(2, Math.round(heightCm * rowsPerCm) - baseIncreaseRounds)

  const rows: AmigurumiRound[] = []
  rows.push({ round: 1, instructions: '6 sc in magic ring', stitchCount: 6 })

  for (let k = 2; k <= baseIncreaseRounds; k++) {
    const count = 6 * k
    const segment = k - 1
    const pattern = segment === 1 ? 'inc' : `${segment} sc, inc`
    rows.push({
      round: rows.length + 1,
      instructions: `[${pattern}] × 6 (${count} st)`,
      stitchCount: count,
    })
  }

  for (let i = 0; i < bodyRounds; i++) {
    rows.push({
      round: rows.length + 1,
      instructions: `sc in each st (${circumferenceStitches} st)`,
      stitchCount: circumferenceStitches,
    })
  }

  if (input.closeBothEnds) {
    for (let k = baseIncreaseRounds - 1; k >= 1; k--) {
      const count = 6 * k
      const segment = k - 1
      const pattern = segment === 0 ? 'dec' : `${segment} sc, dec`
      rows.push({
        round: rows.length + 1,
        instructions: `[${pattern}] × 6 (${count} st)`,
        stitchCount: count,
      })
    }
    rows[rows.length - 1] = {
      ...rows[rows.length - 1]!,
      instructions: rows[rows.length - 1]!.instructions + '. FO leaving 15 cm tail for closure.',
    }
  } else {
    rows[rows.length - 1] = {
      ...rows[rows.length - 1]!,
      instructions: rows[rows.length - 1]!.instructions + '. FO leaving 30 cm tail for joining to body.',
    }
  }

  const sideSurface = Math.PI * diameterCm * heightCm
  const endSurface = Math.PI * (diameterCm / 2) ** 2 * (input.closeBothEnds ? 2 : 1)
  const gramsPer100SqCm = 4.0
  const yarnRequiredGrams = Math.max(2, Math.round(((sideSurface + endSurface) / 100) * gramsPer100SqCm))

  return {
    label: input.label,
    shape: 'CYLINDER',
    finishedDimensionsCm: { width: diameterCm, height: heightCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: input.closeBothEnds
      ? `Stuff firmly through the body, less densely near each end so the closure seam sits flat.`
      : `Stuff firmly through the body, leaving the open end empty so it can attach to the next piece.`,
  }
}
