// Oval primitive.
//
// Worked from a foundation chain rather than a magic ring. The chain
// determines the long axis; the row-by-row pattern builds out the rest.
// Common amigurumi use: heads with longer nose-to-back-of-skull
// proportion, feet/paws, eggs (vertical oval).
//
// Foundation: chain (longAxis × stitchesPerCm - shortAxis × stitchesPerCm)
// stitches. Work along both sides of the chain to produce an oval base.
// Then mirror the sphere-style increase/decrease pattern.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface OvalInput {
  longAxisCm: number
  shortAxisCm: number
  gauge: AmigurumiGauge
  label?: string
}

export function oval(input: OvalInput): AmigurumiPiece {
  const { longAxisCm, shortAxisCm, gauge } = input
  if (longAxisCm <= 0 || shortAxisCm <= 0) {
    throw new Error('Oval long and short axes must be positive.')
  }
  if (longAxisCm < shortAxisCm) {
    throw new Error('longAxisCm must be greater than or equal to shortAxisCm.')
  }

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const rowsPerCm = gauge.rowsPer10cm / 10

  const foundationCh = Math.max(
    2,
    Math.round((longAxisCm - shortAxisCm) * stitchesPerCm),
  )
  const baseRoundStitches = foundationCh * 2 + 6 // worked along both sides + ends
  const equatorStitches = Math.max(
    baseRoundStitches + 6,
    Math.round(Math.PI * shortAxisCm * stitchesPerCm + 2 * foundationCh / 1) / 6 * 6 | 0 || baseRoundStitches + 6,
  )
  // Smoother: equator = base + 6 stitches per increase round, increasing
  // until the short-axis circumference is reached.
  const increaseRounds = Math.max(
    2,
    Math.round((equatorStitches - baseRoundStitches) / 6),
  )
  const actualEquator = baseRoundStitches + 6 * increaseRounds
  const totalHeight = shortAxisCm
  const heightRounds = Math.max(2 * increaseRounds, Math.round(totalHeight * rowsPerCm))
  const straightRounds = Math.max(0, heightRounds - 2 * increaseRounds)

  const rows: AmigurumiRound[] = []
  rows.push({
      round: 1,
      instructions: `Chain ${foundationCh + 2}. Working along chain: 2 sc in 2nd ch from hook, sc in next ${foundationCh - 1} ch, 3 sc in last ch, rotate. Along opposite side: sc in next ${foundationCh - 1} ch, 2 sc in last ch (${baseRoundStitches} st)`,
      stitchCount: baseRoundStitches,
  })

  // Increase rounds - add 6 evenly each round.
  for (let k = 1; k <= increaseRounds; k++) {
    const count = baseRoundStitches + 6 * k
    rows.push({
        round: rows.length + 1,
        instructions: `Increase 6 stitches evenly around (${count} st)`,
        stitchCount: count,
    })
  }

  // Straight body.
  for (let i = 0; i < straightRounds; i++) {
    rows.push({
        round: rows.length + 1,
        instructions: `sc in each st (${actualEquator} st)`,
        stitchCount: actualEquator,
    })
  }

  // Decrease back down.
  for (let k = increaseRounds - 1; k >= 0; k--) {
    const count = baseRoundStitches + 6 * k
    rows.push({
        round: rows.length + 1,
        instructions: `Decrease 6 stitches evenly around (${count} st)`,
        stitchCount: count,
    })
  }

  rows[rows.length - 1] = {
    ...rows[rows.length - 1]!,
    instructions: rows[rows.length - 1]!.instructions + '. FO leaving 15 cm tail for closure.',
  }

  // Surface ≈ ellipsoid surface (Knud-Thomsen approximation).
  const a = longAxisCm / 2
  const b = shortAxisCm / 2
  const c = shortAxisCm / 2
  const p = 1.6075
  const surfaceSqCm = 4 * Math.PI * Math.pow((Math.pow(a * b, p) + Math.pow(a * c, p) + Math.pow(b * c, p)) / 3, 1 / p)
  const gramsPer100SqCm = 4.0
  const yarnRequiredGrams = Math.max(2, Math.round((surfaceSqCm / 100) * gramsPer100SqCm))

  return {
    label: input.label,
    shape: 'OVAL',
    finishedDimensionsCm: { width: shortAxisCm, height: longAxisCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: `Stuff lightly along the long axis to keep the oval shape; over-stuffing rounds it out toward a sphere.`,
  }
}
