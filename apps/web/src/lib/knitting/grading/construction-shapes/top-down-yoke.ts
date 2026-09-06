// Top-down circular yoke grading (knit).
//
// Construction: worked in the round from the neck down. Increases are
// distributed across three increase rounds at roughly 30%, 60%, and 90%
// of yoke depth, each scaling neck stitches towards the bust width.
// German short rows lift the back neck higher than the front (typically
// 5 short-row pairs across the yoke depth). At the underarm sleeves
// are set aside, an underarm gusset is cast on, and body works straight
// to hem. Yoke is the canonical Fair Isle / Lopi / Bohus construction.
//
// Reference: Elizabeth Zimmermann's percentage system (PD pre-1964),
// Susanna Hansson's Bohus work (technique described in PD references),
// Mary Thomas's Knitting Book.

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

export interface YokeInput {
  size: SizeName | 'CUSTOM'
  /** The maker's own measurements, in place of the chart row for `size`. */
  bodyMeasurements?: BodyMeasurements
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeTopDownYoke(input: YokeInput): GradedPattern {
  const body = input.bodyMeasurements ?? getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  // Default to STOCKINETTE so plain yokes (Drops Air style) don't get
  // the colourwork yarn boost. Authors opt into COLOURWORK_STRANDED
  // (and the +70% yarn) by passing `dominantFabric: 'COLOURWORK_STRANDED'`.
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
  const hemStitchCount = roundEvenly(bustStitchCount * fab.hemStitchMultiplier)

  // Circular yoke pulls the neck towards body symmetrically, so a
  // slightly wider neck than raglan.
  const neckCircumference = body.neck + 4
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 6)

  const yokeDepth = body.shoulderWidth * 0.6 + 4
  const armholeDepth = yokeDepth - 2
  const sleeveCapDepth = armholeDepth - 2
  const upperArmCircumference = body.upperArm + 2
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)
  const yokeDepthRows = Math.max(10, Math.round(yokeDepth * rowsPerCm))

  // Three increase rounds, geometric-mean style. Solve for ratio R so
  // neckStitches × R^3 ≈ bustStitchCount before underarm cast-off.
  const yokeBottomStitches = Math.max(bustStitchCount, Math.round(neckStitchCount * 2.74))
  const ratio = Math.pow(yokeBottomStitches / neckStitchCount, 1 / 3)
  const increaseRound1 = Math.round(neckStitchCount * ratio)
  const increaseRound2 = Math.round(increaseRound1 * ratio)
  const increaseRound3 = Math.round(increaseRound2 * ratio)
  const yokeIncreaseRows = 3

  const underarmStitchCount = roundEvenly(Math.max(4, bustCm * stitchesPerCm * 0.05))
  // Sleeve gets roughly 1/4 of yoke bottom each.
  const sleeveBicepStitchCount = roundEvenly(
    Math.round(increaseRound3 * 0.25) + underarmStitchCount,
  )

  const sleeveCuffStitchCount = roundEvenly(sleeveCuffCircumference * stitchesPerCm)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const bodyLengthCm =
    body.bodyLength - body.backLengthToWaist * 0.45 + (opts.bodyLengthAdjustCm ?? 0)
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
    shape: 'TOP_DOWN_YOKE' satisfies ConstructionShape,
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
    yokeIncreaseRows,

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
        `Cast on ${neckStitchCount} stitches on the smaller needle and join in the round.`,
        `Work neckband ribbing then change to the larger needle. Work 5 pairs of German short rows across the back third of the yoke so the back sits ~4 rows higher than the front.`,
        `Round ${Math.round(yokeDepthRows * 0.3)}: increase to ${increaseRound1} stitches evenly spaced.`,
        `Round ${Math.round(yokeDepthRows * 0.6)}: increase to ${increaseRound2} stitches.`,
        `Round ${Math.round(yokeDepthRows * 0.9)}: increase to ${increaseRound3} stitches.`,
        `At the underarm round (round ${yokeDepthRows}), set aside each sleeve section on waste yarn and cast on ${underarmStitchCount} stitches across each underarm gap.`,
        `Continue body in the round for ${bodyLengthRows} rounds then work the ribbed hem and cast off in pattern.`,
        `Rejoin yarn at each underarm, pick up ${underarmStitchCount} stitches across the gusset, and work each sleeve down decreasing to ${sleeveCuffStitchCount} stitches over ${sleeveLengthRows} rows. Work cuff ribbing and cast off in pattern.`,
        `Weave in ends and block to finished measurements.`,
      ],
      seams: [],
    },
  }
}
