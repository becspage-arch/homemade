// Cuff-down sock construction.
//
// Cast on at the cuff. Work ribbed cuff, plain or patterned leg, then
// the heel (flap-and-gusset by default, or any short-row variant).
// Work the foot to the toe, decrease at the toe with paired decreases,
// and graft live stitches with Kitchener stitch.
//
// The historical default — every published sock pattern before short-
// row methods became popular used cuff-down construction. Easiest to
// "try on as you go" because the cuff is finished first; the most
// common choice for beginners.

import type { Gauge } from '../../grading/gauge'
import type {
  SockGradedPattern,
  SockOptions,
  SockHeelStyle,
} from '../types'
import type { FootSizeName } from '../sock-sizes'
import { getFootMeasurements } from '../sock-sizes'
import { flapAndGussetHeel } from '../heel/flap-and-gusset'
import { shortRowHeel } from '../heel/short-row'
import { afterthoughtHeel } from '../heel/afterthought'
import { consumptionForWeight } from '../../grading/yarn-estimate'

export interface CuffDownInput {
  size: FootSizeName | string
  gauge: Gauge
  heelStyle: SockHeelStyle
  options?: SockOptions
}

function roundEvenly(n: number): number {
  const r = Math.round(n)
  return r % 2 === 0 ? r : r + 1
}
function roundToMultiple(n: number, m: number): number {
  return Math.max(m, Math.round(n / m) * m)
}
function roundTenth(n: number): number {
  return Math.round(n * 10) / 10
}

export function gradeCuffDownSock(input: CuffDownInput): SockGradedPattern {
  const foot = getFootMeasurements(input.size)
  const opts = input.options ?? {}
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  // Negative ease so the sock stretches over the foot.
  const footEase = opts.footEaseCm ?? -2
  const targetFootCircumference = foot.footCircumferenceCm + footEase
  // Stitch count must be a multiple of 4 for clean rib + heel split.
  const legStitchCount = roundToMultiple(targetFootCircumference * stitchesPerCm, 4)
  const startingStitchCount = legStitchCount
  const footStitchCount = legStitchCount

  const cuffRibCm = 4
  const cuffRibRows = Math.round(cuffRibCm * rowsPerCm)

  const legLengthCm = opts.legLengthCm ?? 18
  const legRows = Math.round((legLengthCm - cuffRibCm) * rowsPerCm)

  // Foot length: total foot length - heel cup depth - toe shaping length.
  const heelCupDepthCm = foot.footCircumferenceCm / 4 // approximate
  const toeShapingCm = foot.footLengthCm * 0.18 // about 18% of foot length
  const footStraightCm = foot.footLengthCm - heelCupDepthCm - toeShapingCm
  const footRows = Math.round(footStraightCm * rowsPerCm)

  // Toe decreases: from foot stitches down to ~16-24 stitches for graft.
  const toeStitchCount = Math.max(16, roundEvenly(footStitchCount * 0.25))
  const toeRows = Math.round(toeShapingCm * rowsPerCm)

  // Heel.
  let heelOut: {
    heelFlapStitches: number
    heelFlapRows: number
    heelTurnRows: number
    heelTurnStitchCount: number
    gussetStitchesPickedUp: number
    gussetPeakStitchCount: number
    gussetRows: number
  }
  switch (input.heelStyle) {
    case 'FLAP_AND_GUSSET':
      heelOut = flapAndGussetHeel({
        footCircumferenceCm: targetFootCircumference,
        gauge: input.gauge,
        legStitchCount,
      })
      break
    case 'SHORT_ROW_GERMAN':
    case 'SHORT_ROW_JAPANESE':
    case 'SHORT_ROW_DUTCH': {
      const v = input.heelStyle === 'SHORT_ROW_GERMAN' ? 'GERMAN'
        : input.heelStyle === 'SHORT_ROW_JAPANESE' ? 'JAPANESE' : 'DUTCH'
      heelOut = shortRowHeel({ legStitchCount, variant: v, gauge: input.gauge })
      break
    }
    case 'AFTERTHOUGHT': {
      const r = afterthoughtHeel({
        legStitchCount,
        footCircumferenceCm: targetFootCircumference,
        gauge: input.gauge,
      })
      heelOut = {
        heelFlapStitches: 0,
        heelFlapRows: 0,
        heelTurnRows: r.heelTurnRows,
        heelTurnStitchCount: r.heelGraftStitches,
        gussetStitchesPickedUp: 0,
        gussetPeakStitchCount: r.gussetPeakStitchCount,
        gussetRows: 0,
      }
      break
    }
  }

  // Yarn requirement: leg tube + foot tube + heel cup + toe cap, two
  // socks. Sock fabric is intentionally denser than garment stockinette
  // (high-twist sock yarn, tighter gauge for durability) so the per-cm-
  // squared consumption is ~2.8× the garment rate. Calibrated against
  // published Drops Design free sock patterns + the standard 100g
  // fingering ball = pair of women UK 6 crew socks rule of thumb.
  const SOCK_DENSITY_FACTOR = 2.8
  const tubeSqCm = 2 * (legLengthCm + foot.footLengthCm) * targetFootCircumference
  const c = consumptionForWeight(opts.yarnWeightCategory ?? 1)
  const sqUnits = tubeSqCm / 100
  const yarnRequiredGrams = Math.round(sqUnits * c.gramsPer100SqCm * SOCK_DENSITY_FACTOR)
  const yarnRequiredYards = Math.round(sqUnits * c.yardsPer100SqCm * SOCK_DENSITY_FACTOR)

  const heelStyleLabel = labelForHeelStyle(input.heelStyle)

  const steps = [
    `Cast on ${startingStitchCount} stitches on smaller needle and join in the round.`,
    `Work cuff in 2x2 rib for ${cuffRibRows} rounds.`,
    `Change to larger needle and work leg in pattern for ${legRows} rounds.`,
    input.heelStyle === 'AFTERTHOUGHT'
      ? `Mark the heel position by knitting a row of waste yarn across half the stitches, then continue knitting in pattern.`
      : `Work the ${heelStyleLabel} on the ${heelOut.heelFlapStitches} heel stitches: heel flap ${heelOut.heelFlapRows} rows, heel turn ${heelOut.heelTurnRows} rows leaving ${heelOut.heelTurnStitchCount} stitches.`,
    input.heelStyle === 'FLAP_AND_GUSSET'
      ? `Pick up ${heelOut.gussetStitchesPickedUp} stitches along each side of the heel flap (${heelOut.gussetPeakStitchCount} stitches total). Decrease at the gussets every other round for ${heelOut.gussetRows} rounds back to ${footStitchCount} stitches.`
      : `Continue at ${footStitchCount} stitches.`,
    `Work the foot in pattern for ${footRows} rounds.`,
    `Toe: decrease 4 stitches every other round for ${toeRows} rounds down to ${toeStitchCount} stitches.`,
    `Graft the toe with Kitchener stitch.`,
    input.heelStyle === 'AFTERTHOUGHT'
      ? `Remove the waste yarn marker, pick up ${heelOut.heelFlapStitches} stitches above and below, and work the afterthought heel as a small toe-shape: decrease 4 stitches every other round for ${heelOut.heelTurnRows} rounds down to ${heelOut.heelTurnStitchCount} stitches, then graft.`
      : `Weave in ends and block.`,
    input.heelStyle === 'AFTERTHOUGHT' ? 'Weave in ends and block.' : '',
  ].filter(s => s.length > 0)

  return {
    size: input.size,
    construction: 'CUFF_DOWN',
    heelStyle: input.heelStyle,
    gauge: input.gauge,

    startingStitchCount,
    legStitchCount,
    heelTurnStitchCount: heelOut.heelTurnStitchCount,
    gussetPeakStitchCount: heelOut.gussetPeakStitchCount,
    footStitchCount,
    toeStitchCount,

    cuffRibRows,
    legRows,
    heelFlapRows: heelOut.heelFlapRows,
    heelTurnRows: heelOut.heelTurnRows,
    gussetRows: heelOut.gussetRows,
    footRows,
    toeRows,

    finishedMeasurements: {
      footLengthCm: roundTenth(foot.footLengthCm),
      footCircumferenceCm: roundTenth(targetFootCircumference),
      ankleCircumferenceCm: roundTenth(foot.ankleCircumferenceCm + footEase),
      legLengthCm: roundTenth(legLengthCm),
    },

    yarnRequiredGrams,
    yarnRequiredYards,

    assemblyInstructions: { steps },
  }
}

function labelForHeelStyle(s: SockHeelStyle): string {
  switch (s) {
    case 'FLAP_AND_GUSSET': return 'flap-and-gusset heel'
    case 'SHORT_ROW_GERMAN': return 'German short-row heel'
    case 'SHORT_ROW_JAPANESE': return 'Japanese short-row heel'
    case 'SHORT_ROW_DUTCH': return 'Dutch short-row heel'
    case 'AFTERTHOUGHT': return 'afterthought heel'
  }
}
