// Top-down raglan grading.
//
// Construction: worked in the round from the neck down. Four raglan
// increase lines run from neck to underarm, two stitches added per line
// every other row (eight stitches per increase round). At the underarm
// the sleeves are set aside on scrap yarn, an underarm gusset is cast
// on, and the body works straight to hem. Sleeves are picked up from
// the held stitches and worked down to cuff.
//
// Reference formulas: standard raglan grading principles documented
// in pre-1980s pattern manuals such as Weldon's Practical Needlework
// (public domain). The percentage system used here (back neck = 20%
// of bust, sleeves get 25% of yoke increases each, front/back get 25%
// each) is a long-standing convention in raglan drafting, not a
// proprietary technique.

import type {
  ConstructionShape,
  GarmentType,
  Gauge,
  GradedPattern,
  ShapeOptions,
} from '../types'
import type { SizeName } from '../size-charts'
import { getBodyMeasurements } from '../size-charts'
import { applyEase, type EasePreset } from '../ease-presets'
import { estimateYarn } from '../yarn-estimate'

export interface RaglanInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeTopDownRaglan(input: RaglanInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const backNeckFraction = opts.backNeckWidth ?? 0.20
  const neckCm = body.neck + 2
  const slope = opts.raglanLineSlope ?? 2

  const hemAllowance = opts.hemAllowanceCm ?? 0
  const bodyLengthCm = body.bodyLength
    - body.backLengthToWaist * 0.45
    + (opts.bodyLengthAdjustCm ?? 0)
    + hemAllowance

  const bustStitches = roundEvenly(bustCm * stitchesPerCm)
  const hemStitches = bustStitches
  const neckStitches = roundToMultiple(neckCm * stitchesPerCm, 4)
  const yokeDepthCm = (body.bust * 0.5 - body.shoulderWidth) * 0.5 + body.shoulderWidth * 0.25
  const yokeDepthRows = Math.max(8, Math.round(yokeDepthCm * rowsPerCm))
  const yokeIncreaseRows = Math.round(yokeDepthRows / slope)

  // Distribute neck stitches: back/front each take (1 - backNeckFraction)/2
  // of remaining after sleeves; sleeves take backNeckFraction/2 each.
  const sleeveNeckStitches = Math.max(2, Math.round(neckStitches * backNeckFraction / 2))
  const bodyNeckStitches = Math.round((neckStitches - sleeveNeckStitches * 2) / 2)
  void bodyNeckStitches

  // After yokeIncreaseRows of 8-stitch increases, total stitches grow by
  // 8 * yokeIncreaseRows. The bust circumference at the bottom of the yoke
  // equals neckStitches + 8 * yokeIncreaseRows, minus underarm stitches that
  // get cast off to the gusset.
  const yokeBottomStitches = neckStitches + 8 * yokeIncreaseRows
  const underarmStitches = roundEvenly(Math.max(4, bustCm * stitchesPerCm * 0.04))

  // Body at the bust: take the front + back portion of the yoke bottom plus
  // the underarm cast-on stitches that join the body in the round.
  const sleeveBicepStitches = roundEvenly(
    (yokeBottomStitches - bodyAndUnderarmShare(yokeBottomStitches)) / 2 + underarmStitches,
  )
  const sleeveCm = body.armLength + (opts.bodyLengthAdjustCm ?? 0) * 0
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)
  const cuffRatio = opts.sleeveCuffRatio ?? 0.65
  const sleeveCuffStitches = roundEvenly(sleeveBicepStitches * cuffRatio)

  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yarn = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + yokeDepthCm,
      sleeveUpper: (sleeveBicepStitches / stitchesPerCm),
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )

  return {
    size: input.size,
    shape: 'TOP_DOWN_RAGLAN' satisfies ConstructionShape,
    garmentType: input.garmentType,
    gauge: input.gauge,
    easePreset: input.easePreset,

    hemStitches,
    bustStitches,
    underarmStitches,
    sleeveCuffStitches,
    sleeveBicepStitches,
    neckStitches,

    bodyLengthRows,
    sleeveLengthRows,
    yokeDepthRows,
    yokeIncreaseRows,

    yarnRequiredGrams: yarn.grams,
    yarnRequiredYards: yarn.yards,

    finishedMeasurements: {
      bust: roundTenth(bustStitches / stitchesPerCm),
      body: roundTenth(bodyLengthCm + yokeDepthCm),
      sleeve: roundTenth(sleeveCm),
      upperArm: roundTenth(sleeveBicepStitches / stitchesPerCm),
      cuff: roundTenth(sleeveCuffStitches / stitchesPerCm),
      neck: roundTenth(neckStitches / stitchesPerCm),
    },

    assemblyInstructions: {
      steps: [
        `Chain ${neckStitches + 1} and join in the round.`,
        `Work raglan increase rounds: 8 stitches added every ${slope} rounds for ${yokeIncreaseRows} increase rounds.`,
        `At underarm, set aside each sleeve section on scrap yarn and chain ${underarmStitches} stitches across each underarm gap.`,
        `Continue body in the round for ${bodyLengthRows} rows then work hem trim.`,
        `Rejoin yarn at each underarm, pick up ${underarmStitches} stitches across the gusset, and work each sleeve in the round, decreasing to ${sleeveCuffStitches} stitches over ${sleeveLengthRows} rows.`,
        `Weave in ends and block to finished measurements.`,
      ],
      seams: [],
    },
  }
}

function bodyAndUnderarmShare(total: number): number {
  return Math.round(total * 0.5)
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
