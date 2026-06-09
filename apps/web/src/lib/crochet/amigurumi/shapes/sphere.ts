// Sphere primitive.
//
// Standard amigurumi construction: start with 6 sc in a magic ring,
// increase by 6 stitches per round for the first n rounds (reaching the
// equator stitch count), work straight at the equator for as many rounds
// as the diameter calls for, then mirror the decrease pattern down to 6
// and close with a slip-stitch closure.
//
// Equator stitch count = π × diameter × stitchesPerCm.
// Increase round k stitch count = 6 × k.
// To reach equator stitch count E, increases run for ceil(E / 6) rounds.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface SphereInput {
  diameterCm: number
  gauge: AmigurumiGauge
  yarnGramsPerMetre?: number
  label?: string
}

export function sphere(input: SphereInput): AmigurumiPiece {
  const { diameterCm, gauge } = input
  if (diameterCm <= 0) throw new Error('Sphere diameter must be positive.')

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const equatorStitches = Math.max(12, Math.round(Math.PI * diameterCm * stitchesPerCm / 6) * 6)
  const halfRounds = equatorStitches / 6 // number of increase rounds

  // The sphere's height in rounds equals roughly (diameter × rowsPerCm).
  const totalRoundsApprox = Math.max(2 * halfRounds, Math.round(diameterCm * (gauge.rowsPer10cm / 10)))
  const straightRoundsAtEquator = Math.max(0, totalRoundsApprox - 2 * halfRounds)

  const rows: AmigurumiRound[] = []
  rows.push({ round: 1, instructions: '6 sc in magic ring', stitchCount: 6 })

  // Increase rounds 2 through halfRounds.
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

  // Straight equator rounds.
  for (let i = 0; i < straightRoundsAtEquator; i++) {
    rows.push({
      round: rows.length + 1,
      instructions: `sc in each st (${equatorStitches} st)`,
      stitchCount: equatorStitches,
    })
  }

  // Mirror decrease rounds.
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

  // Final closing round (already at 6 st from the loop above).
  const closingIndex = rows.length
  rows[closingIndex - 1] = {
    ...rows[closingIndex - 1]!,
    instructions: rows[closingIndex - 1]!.instructions + '. FO leaving 15 cm tail for closure.',
  }

  // Yarn estimate: surface area of a sphere = π × d^2.
  const surfaceSqCm = Math.PI * diameterCm * diameterCm
  const gramsPer100SqCm = 4.0 // single-crochet amigurumi at tight tension
  const yarnRequiredGrams = Math.max(2, Math.round((surfaceSqCm / 100) * gramsPer100SqCm))

  return {
    label: input.label,
    shape: 'SPHERE',
    finishedDimensionsCm: { width: diameterCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: `Stuff firmly through round ${Math.round(rows.length * 0.8)}, then taper the stuffing toward the closure so the seam closes cleanly.`,
  }
}
