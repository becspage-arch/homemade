// Capsule primitive - cylinder with rounded hemispheres at each end.
//
// Used for limbs that have rounded tips (paws, mitten ends), bodies of
// long animals, and stacked-body amigurumi where each segment reads as
// soft. Built by stacking sphere-increase, cylinder-straight, sphere-
// decrease sections.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface CapsuleInput {
  diameterCm: number
  /** Total length end-to-end including the rounded caps. */
  lengthCm: number
  gauge: AmigurumiGauge
  label?: string
}

export function capsule(input: CapsuleInput): AmigurumiPiece {
  const { diameterCm, lengthCm, gauge } = input
  if (diameterCm <= 0 || lengthCm <= 0) {
    throw new Error('Capsule diameter and length must be positive.')
  }
  if (lengthCm < diameterCm) {
    throw new Error('Capsule length must be at least equal to diameter.')
  }

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const rowsPerCm = gauge.rowsPer10cm / 10
  const equatorStitches = Math.max(12, Math.round(Math.PI * diameterCm * stitchesPerCm / 6) * 6)
  const halfRounds = equatorStitches / 6
  const straightLengthCm = Math.max(0, lengthCm - diameterCm)
  const straightRounds = Math.round(straightLengthCm * rowsPerCm)

  const rows: AmigurumiRound[] = []
  rows.push({ round: 1, instructions: '6 sc in magic ring', stitchCount: 6 })

  // Cap A increases.
  for (let k = 2; k <= halfRounds; k++) {
    const count = 6 * k
    const segment = k - 1
    const pattern = segment === 1 ? 'inc' : `${segment} sc, inc`
    rows.push({
        round: rows.length + 1,
        instructions: `[${pattern}] × 6 (${count} st)`,
        stitchCount: count,
    })
  }

  // Straight body.
  for (let i = 0; i < straightRounds; i++) {
    rows.push({
        round: rows.length + 1,
        instructions: `sc in each st (${equatorStitches} st)`,
        stitchCount: equatorStitches,
    })
  }

  // Cap B decreases.
  for (let k = halfRounds - 1; k >= 1; k--) {
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

  // Surface ≈ sphere + lateral cylinder.
  const sphereSurface = Math.PI * diameterCm * diameterCm
  const cylinderLateral = Math.PI * diameterCm * straightLengthCm
  const gramsPer100SqCm = 4.0
  const yarnRequiredGrams = Math.max(
    2,
    Math.round(((sphereSurface + cylinderLateral) / 100) * gramsPer100SqCm),
  )

  return {
    label: input.label,
    shape: 'CAPSULE',
    finishedDimensionsCm: { width: diameterCm, height: lengthCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: `Stuff each cap firmly so it holds a rounded shape, packing the straight middle to a comfortable softness.`,
  }
}
