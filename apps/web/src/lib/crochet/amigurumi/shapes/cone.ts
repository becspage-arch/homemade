// Cone primitive.
//
// Worked from the tip (6 sc in magic ring) outward to the base. Increase
// rate determines the angle of the cone - gentler increases for a tall
// thin cone, faster for a flatter cone.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface ConeInput {
  baseDiameterCm: number
  heightCm: number
  gauge: AmigurumiGauge
  label?: string
}

export function cone(input: ConeInput): AmigurumiPiece {
  const { baseDiameterCm, heightCm, gauge } = input
  if (baseDiameterCm <= 0 || heightCm <= 0) {
    throw new Error('Cone base diameter and height must be positive.')
  }

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const rowsPerCm = gauge.rowsPer10cm / 10
  const baseStitches = Math.max(12, Math.round(Math.PI * baseDiameterCm * stitchesPerCm / 6) * 6)
  const totalRounds = Math.max(2, Math.round(heightCm * rowsPerCm))

  // Distribute increases across the rounds: total increases needed =
  // (baseStitches - 6). Spread them across totalRounds - 1 rounds.
  // Some rounds add 6 stitches, others 0, alternating to keep the cone
  // angle smooth.
  const totalIncreases = baseStitches - 6
  const increaseRounds = Math.max(1, Math.round(totalIncreases / 6))
  const straightRounds = Math.max(0, totalRounds - 1 - increaseRounds)

  const rows: AmigurumiRound[] = []
  rows.push({ round: 1, instructions: '6 sc in magic ring', stitchCount: 6 })

  // Interleave: every (totalRounds-1)/increaseRounds rounds is an
  // increase round. Use a simple step ratio.
  const step = (totalRounds - 1) / Math.max(1, increaseRounds + straightRounds)
  let stitchCount = 6
  let nextIncreaseAt = step
  let increaseIdx = 0
  for (let r = 2; r <= totalRounds; r++) {
    if (increaseIdx < increaseRounds && r >= Math.round(nextIncreaseAt + 1)) {
      const segment = stitchCount / 6
      stitchCount += 6
      const pattern = segment === 1 ? 'inc' : `${segment - 1} sc, inc`
      rows.push({
          round: r,
          instructions: `[${pattern}] × 6 (${stitchCount} st)`,
          stitchCount,
      })
      increaseIdx += 1
      nextIncreaseAt += step
    } else {
      rows.push({
          round: r,
          instructions: `sc in each st (${stitchCount} st)`,
          stitchCount,
      })
    }
  }

  rows[rows.length - 1] = {
    ...rows[rows.length - 1]!,
    instructions: rows[rows.length - 1]!.instructions + '. FO leaving 20 cm tail for attaching to body.',
  }

  // Lateral surface ≈ π × r × slant.
  const r = baseDiameterCm / 2
  const slant = Math.sqrt(r * r + heightCm * heightCm)
  const surfaceSqCm = Math.PI * r * slant
  const gramsPer100SqCm = 4.0
  const yarnRequiredGrams = Math.max(2, Math.round((surfaceSqCm / 100) * gramsPer100SqCm))

  return {
    label: input.label,
    shape: 'CONE',
    finishedDimensionsCm: { width: baseDiameterCm, height: heightCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: `Stuff the cone from base toward tip, packing firmly so the cone holds its angle without slumping.`,
  }
}
