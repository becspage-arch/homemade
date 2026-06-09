// Pear primitive - asymmetric drop shape, narrow at the top, broad at
// the bottom. Common amigurumi use: bodies (sitting figures), heads with
// a chin, fruit shapes, snowmen bottom segments.
//
// Construction: short sharp increase from 6 to the upper-belly stitch
// count, longer slow increase to the lower-belly stitch count, straight
// short section, then rapid decrease to close the base.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiRound } from '../types'

export interface PearInput {
  /** The maximum diameter of the pear body (at the lower belly). */
  maxDiameterCm: number
  /** The diameter of the top of the pear (where it tapers). */
  topDiameterCm: number
  /** Total head-to-base height. */
  heightCm: number
  gauge: AmigurumiGauge
  label?: string
}

export function pear(input: PearInput): AmigurumiPiece {
  const { maxDiameterCm, topDiameterCm, heightCm, gauge } = input
  if (maxDiameterCm <= topDiameterCm) {
    throw new Error('Pear maxDiameter must be greater than topDiameter.')
  }
  if (heightCm <= 0) throw new Error('Pear height must be positive.')

  const stitchesPerCm = gauge.stitchesPer10cm / 10
  const rowsPerCm = gauge.rowsPer10cm / 10

  const topStitches = Math.max(12, Math.round(Math.PI * topDiameterCm * stitchesPerCm / 6) * 6)
  const maxStitches = Math.max(topStitches + 6, Math.round(Math.PI * maxDiameterCm * stitchesPerCm / 6) * 6)

  const topIncreaseRounds = topStitches / 6 // 6 to topStitches at 6 per round
  const bellyIncreaseRounds = Math.max(1, Math.round((maxStitches - topStitches) / 6))
  const totalRows = Math.max(2, Math.round(heightCm * rowsPerCm))
  const usedSoFar = topIncreaseRounds + bellyIncreaseRounds
  // Closure runs from maxStitches back down to 6 by 6 per round, mirroring
  // the entire ascent (top + belly), not just the top.
  const baseCloseRounds = (maxStitches - 6) / 6
  const straightRounds = Math.max(2, totalRows - usedSoFar - baseCloseRounds)

  const rows: AmigurumiRound[] = []
  rows.push({ round: 1, instructions: '6 sc in magic ring', stitchCount: 6 })

  // Sharp top increase: same as sphere cap.
  for (let k = 2; k <= topIncreaseRounds; k++) {
    const count = 6 * k
    const segment = k - 1
    const pattern = segment === 1 ? 'inc' : `${segment} sc, inc`
    rows.push({
        round: rows.length + 1,
        instructions: `[${pattern}] × 6 (${count} st)`,
        stitchCount: count,
    })
  }

  // Belly slow increase: 6 stitches evenly per round, slower angle.
  let currentCount = topStitches
  for (let i = 0; i < bellyIncreaseRounds; i++) {
    currentCount = Math.min(maxStitches, currentCount + 6)
    rows.push({
        round: rows.length + 1,
        instructions: `Increase 6 stitches evenly around (${currentCount} st)`,
        stitchCount: currentCount,
    })
  }

  // Straight belly.
  for (let i = 0; i < straightRounds; i++) {
    rows.push({
        round: rows.length + 1,
        instructions: `sc in each st (${maxStitches} st)`,
        stitchCount: maxStitches,
    })
  }

  // Base close - drop 6 stitches per round from maxStitches down to 6.
  let closeCount = maxStitches
  while (closeCount > 6) {
    closeCount -= 6
    const segment = closeCount / 6 - 1
    const pattern = segment <= 0 ? 'dec' : `${segment} sc, dec`
    rows.push({
        round: rows.length + 1,
        instructions: `[${pattern}] × 6 (${closeCount} st)`,
        stitchCount: closeCount,
    })
  }

  rows[rows.length - 1] = {
    ...rows[rows.length - 1]!,
    instructions: rows[rows.length - 1]!.instructions + '. FO leaving 15 cm tail for closure.',
  }

  // Pear surface ≈ truncated cone + spherical top cap.
  const rTop = topDiameterCm / 2
  const rMax = maxDiameterCm / 2
  const conePart = Math.PI * (rTop + rMax) * Math.sqrt(Math.pow(rMax - rTop, 2) + heightCm * heightCm)
  const topCap = 2 * Math.PI * rTop * rTop
  const baseCap = 2 * Math.PI * rMax * rMax * 0.5
  const surfaceSqCm = conePart + topCap + baseCap
  const gramsPer100SqCm = 4.0
  const yarnRequiredGrams = Math.max(2, Math.round((surfaceSqCm / 100) * gramsPer100SqCm))

  return {
    label: input.label,
    shape: 'PEAR',
    finishedDimensionsCm: { width: maxDiameterCm, height: heightCm },
    totalRounds: rows.length,
    rowByRow: rows,
    yarnRequiredGrams,
    stuffingNotes: `Stuff the belly section firmly so the pear holds its rounded base; stuff the upper taper less densely so the neck shape stays narrow.`,
  }
}
