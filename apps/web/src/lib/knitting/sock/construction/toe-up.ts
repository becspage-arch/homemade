// Toe-up sock construction.
//
// Cast on with Judy's Magic cast-on at the toe. Increase to foot
// stitch count with paired increases. Work the foot, then the heel
// (short-row variants or a heel flap worked in mirror image of cuff-
// down), then the leg, then the cuff ribbing. Cast off with a
// stretchy bind-off (Jeny's Surprisingly Stretchy, sewn bind-off).
//
// Useful because the knitter knows exactly how much yarn the foot
// took before starting the leg — the leg can stretch to use whatever
// yarn remains. Common in indie sock patterns since the early 2000s
// when Judy Becker published the Magic cast-on.

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

export interface ToeUpInput {
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

export function gradeToeUpSock(input: ToeUpInput): SockGradedPattern {
  const foot = getFootMeasurements(input.size)
  const opts = input.options ?? {}
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const footEase = opts.footEaseCm ?? -2
  const targetFootCircumference = foot.footCircumferenceCm + footEase
  const footStitchCount = roundToMultiple(targetFootCircumference * stitchesPerCm, 4)
  const legStitchCount = footStitchCount

  // Toe-up starts at Judy's magic cast-on (small number of stitches).
  // Standard 16-24 cast on stitches.
  const startingStitchCount = Math.max(16, roundEvenly(footStitchCount * 0.25))
  const toeStitchCount = startingStitchCount

  const toeShapingCm = foot.footLengthCm * 0.18
  const toeRows = Math.round(toeShapingCm * rowsPerCm)

  const heelCupDepthCm = foot.footCircumferenceCm / 4
  const footStraightCm = foot.footLengthCm - heelCupDepthCm - toeShapingCm
  const footRows = Math.round(footStraightCm * rowsPerCm)

  const legLengthCm = opts.legLengthCm ?? 18
  const cuffRibCm = 4
  const cuffRibRows = Math.round(cuffRibCm * rowsPerCm)
  const legRows = Math.round((legLengthCm - cuffRibCm) * rowsPerCm)

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
      // Toe-up flap-and-gusset: gusset increases come BEFORE the heel
      // (mirror of cuff-down where they come after).
      heelOut = flapAndGussetHeel({
        footCircumferenceCm: targetFootCircumference,
        gauge: input.gauge,
        legStitchCount: footStitchCount,
      })
      break
    case 'SHORT_ROW_GERMAN':
    case 'SHORT_ROW_JAPANESE':
    case 'SHORT_ROW_DUTCH': {
      const v = input.heelStyle === 'SHORT_ROW_GERMAN' ? 'GERMAN'
        : input.heelStyle === 'SHORT_ROW_JAPANESE' ? 'JAPANESE' : 'DUTCH'
      heelOut = shortRowHeel({ legStitchCount: footStitchCount, variant: v, gauge: input.gauge })
      break
    }
    case 'AFTERTHOUGHT': {
      const r = afterthoughtHeel({
        legStitchCount: footStitchCount,
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

  // Sock fabric ~2.8× denser than garment stockinette — see cuff-down
  // for the calibration rationale.
  const SOCK_DENSITY_FACTOR = 2.8
  const tubeSqCm = 2 * (legLengthCm + foot.footLengthCm) * targetFootCircumference
  const c = consumptionForWeight(opts.yarnWeightCategory ?? 1)
  const sqUnits = tubeSqCm / 100
  const yarnRequiredGrams = Math.round(sqUnits * c.gramsPer100SqCm * SOCK_DENSITY_FACTOR)
  const yarnRequiredYards = Math.round(sqUnits * c.yardsPer100SqCm * SOCK_DENSITY_FACTOR)

  const heelStyleLabel = labelForHeelStyle(input.heelStyle)

  const steps = [
    `Cast on ${startingStitchCount} stitches using Judy's magic cast-on (${startingStitchCount / 2} on each needle).`,
    `Toe: increase 4 stitches every other round for ${toeRows} rounds up to ${footStitchCount} stitches.`,
    `Work the foot in pattern for ${footRows} rounds.`,
    input.heelStyle === 'AFTERTHOUGHT'
      ? `Mark the heel position with a row of waste yarn across half the stitches and continue.`
      : input.heelStyle === 'FLAP_AND_GUSSET'
        ? `Increase 1 stitch each side of the sole every other round for ${heelOut.gussetRows} rounds up to ${heelOut.gussetPeakStitchCount} stitches (gusset). Turn the heel with the ${heelStyleLabel} maths: heel turn ${heelOut.heelTurnRows} rows leaving ${heelOut.heelTurnStitchCount} stitches.`
        : `Work the ${heelStyleLabel} on half the stitches: ${heelOut.heelTurnRows} rows of short-row pairs.`,
    `Work leg in pattern for ${legRows} rounds.`,
    `Work cuff in 2x2 rib for ${cuffRibRows} rounds.`,
    `Cast off with a stretchy cast-off (Jeny's surprisingly stretchy or sewn bind-off).`,
    input.heelStyle === 'AFTERTHOUGHT'
      ? `Remove the waste yarn marker, pick up ${heelOut.heelFlapStitches} stitches above and below, and decrease 4 stitches every other round for ${heelOut.heelTurnRows} rounds down to ${heelOut.heelTurnStitchCount} stitches, then graft.`
      : ``,
    `Weave in ends and block.`,
  ].filter(s => s.length > 0)

  return {
    size: input.size,
    construction: 'TOE_UP',
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
