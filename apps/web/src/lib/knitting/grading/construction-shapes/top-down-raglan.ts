// Top-down raglan grading (knit).
//
// Construction: worked in the round from the neck down. Four raglan
// increase lines run from neck to underarm, two stitches added per line
// every other round (eight stitches per increase round). At the
// underarm the sleeves are set aside on waste yarn, the body's
// underarm gusset is cast on, and the body works straight to hem.
// Sleeves are picked up from held stitches and worked down to cuff.
//
// Reference: standard raglan drafting principles documented in Weldon's
// Practical Knitter, Beeton's Book of Needlework, and Mary Thomas's
// Knitting Book (all public domain or out-of-copyright in UK/EU).

import type {
  ConstructionShape,
  GarmentType,
  GradedPattern,
  ShapeOptions,
  Gauge,
} from '../types'
import type { SizeName, BodyMeasurements } from '../size-charts'
import { getBodyMeasurements } from '../size-charts'
import { applyEase, type EasePreset } from '../ease-presets'
import { estimateYarn } from '../yarn-estimate'
import { fabricAdjustmentsFor } from '../gauge'
import { roundEvenly, roundToMultiple, roundTenth, defaultSleeveCuffCm } from '../helpers'

export interface RaglanInput {
  size: SizeName | 'CUSTOM'
  /** The maker's own measurements, in place of the chart row for `size`. */
  bodyMeasurements?: BodyMeasurements
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeTopDownRaglan(input: RaglanInput): GradedPattern {
  const body = input.bodyMeasurements ?? getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const backNeckFraction = opts.backNeckWidth ?? 0.20
  const slope = opts.raglanLineSlope ?? 2

  const neckCircumference = body.neck + 2
  const armholeDepth = body.shoulderWidth * 0.55 + 4
  const yokeDepth = armholeDepth + 2
  const upperArmCircumference = body.upperArm + 2
  const sleeveCapDepth = armholeDepth - 2
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)

  const hemAllowance = opts.hemAllowanceCm ?? 0
  const bodyLengthCm =
    body.bodyLength - body.backLengthToWaist * 0.45 + (opts.bodyLengthAdjustCm ?? 0) + hemAllowance

  const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
  const hemStitchCount = roundEvenly(bustStitchCount * fab.hemStitchMultiplier)
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 4)
  const yokeDepthRows = Math.max(8, Math.round(yokeDepth * rowsPerCm))
  const raglanIncreaseRows = Math.round(yokeDepthRows / slope)

  // Yoke bottom: increase rounds add 8 stitches each.
  const yokeBottomStitches = neckStitchCount + 8 * raglanIncreaseRows
  const underarmStitchCount = roundEvenly(Math.max(4, bustCm * stitchesPerCm * 0.04))

  // Body / sleeve split at the yoke bottom. Sleeves take backNeckFraction
  // of the bust stitches (each), body takes the rest.
  const sleeveShare = backNeckFraction
  const sleeveBicepStitchCount = roundEvenly(
    yokeBottomStitches * sleeveShare + underarmStitchCount,
  )
  const sleeveCuffStitchCount = roundEvenly(sleeveCuffCircumference * stitchesPerCm)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yarnBase = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + yokeDepth,
      sleeveUpper: upperArmCircumference,
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )
  const yarn = {
    grams: Math.round(yarnBase.grams * fab.yarnMultiplier),
    yards: Math.round(yarnBase.yards * fab.yarnMultiplier),
  }

  return {
    size: input.size,
    shape: 'TOP_DOWN_RAGLAN' satisfies ConstructionShape,
    garmentType: input.garmentType,
    gauge: input.gauge,
    easePreset: input.easePreset,

    bust: roundTenth(bustCm),
    waist: roundTenth(applyEase(body.waist, input.easePreset)),
    hip: roundTenth(applyEase(body.hip, input.easePreset)),
    length: roundTenth(bodyLengthCm + yokeDepth),
    sleeveLength: roundTenth(sleeveCm),
    shoulderWidth: roundTenth(body.shoulderWidth),

    yokeDepth: roundTenth(yokeDepth),
    neckCircumference: roundTenth(neckCircumference),
    armholeDepth: roundTenth(armholeDepth),
    sleeveCapDepth: roundTenth(sleeveCapDepth),
    upperArmCircumference: roundTenth(upperArmCircumference),
    wristCircumference: roundTenth(body.wrist),
    sleeveCuffCircumference: roundTenth(sleeveCuffCircumference),

    hemStitchCount,
    bustStitchCount,
    underarmStitchCount,
    sleeveCuffStitchCount,
    sleeveBicepStitchCount,
    neckStitchCount,

    bodyLengthRows,
    sleeveLengthRows,
    yokeDepthRows,
    yokeIncreaseRows: raglanIncreaseRows,
    raglanIncreaseRows,

    yarnRequiredGrams: yarn.grams,
    yarnRequiredYards: yarn.yards,

    finishedMeasurements: {
      bust: roundTenth(bustCm),
      body: roundTenth(bodyLengthCm + yokeDepth),
      sleeve: roundTenth(sleeveCm),
      upperArm: roundTenth(upperArmCircumference),
      cuff: roundTenth(sleeveCuffCircumference),
      neck: roundTenth(neckCircumference),
      yokeDepth: roundTenth(yokeDepth),
      armholeDepth: roundTenth(armholeDepth),
      sleeveCapDepth: roundTenth(sleeveCapDepth),
    },

    assemblyInstructions: {
      steps: [
        `Cast on ${neckStitchCount} stitches on the smaller needle, place marker, and join in the round.`,
        `Work neckband ribbing then change to the larger needle. Place four raglan markers — back, right sleeve, front, left sleeve — by section width (back / front = ${Math.round((1 - 2 * sleeveShare) / 2 * 100)}% each, sleeves = ${Math.round(sleeveShare * 100)}% each).`,
        `Work raglan increase rounds: 8 stitches added (one each side of each marker) every ${slope} rounds for ${raglanIncreaseRows} increase rounds.`,
        `At the underarm round (round ${yokeDepthRows}), set aside each sleeve section on waste yarn and cast on ${underarmStitchCount} stitches across each underarm gap.`,
        `Continue body in the round for ${bodyLengthRows} rounds then work the ribbed hem and cast off in pattern.`,
        `Rejoin yarn at each underarm, pick up ${underarmStitchCount} stitches across the gusset, place a marker for the round, and work each sleeve down decreasing to ${sleeveCuffStitchCount} stitches over ${sleeveLengthRows} rows. Work cuff ribbing and cast off in pattern.`,
        `Weave in ends and block to finished measurements.`,
      ],
      seams: [],
    },
  }
}
