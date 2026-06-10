// Contiguous set-in sleeve grading (knit). The Susie Myers method:
// top-down construction that produces a set-in sleeve seamlessly.
//
// Construction: cast on at the neck, work straight across the
// shoulders building both fronts + back as one continuous yoke, then
// introduce the sleeve by working short-row "saddles" off the shoulder
// line. The sleeve cap grows with each saddle row pair; once the cap
// reaches the bicep depth the sleeve stitches are placed on waste yarn
// and the body works straight to hem. Sleeves are picked up later and
// worked cuff-down. The result reads as a set-in sleeve from the
// outside but has no shoulder seam to sew.
//
// Reference: Susie Myers wrote up the contiguous method on her blog
// (technique not copyrightable; explained in our own words here).
// Useful because it combines the seamless workflow of top-down raglan
// with the more tailored look of set-in sleeves.

import type {
  ConstructionShape,
  GarmentType,
  GradedPattern,
  ShapeOptions,
  Gauge,
} from '../types'
import type { SizeName } from '../size-charts'
import { getBodyMeasurements } from '../size-charts'
import { applyEase, type EasePreset } from '../ease-presets'
import { estimateYarn } from '../yarn-estimate'
import { fabricAdjustmentsFor } from '../gauge'
import { roundEvenly, roundToMultiple, roundTenth, defaultSleeveCuffCm } from '../helpers'

export interface ContiguousInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeContiguousSetIn(input: ContiguousInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
  const hemStitchCount = roundEvenly(bustStitchCount * fab.hemStitchMultiplier)

  // Contiguous neckline sits slightly narrower than yoke because the
  // shoulder line is fully built before the sleeves begin.
  const neckCircumference = body.neck + 2
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 2)

  const armholeDepth = body.shoulderWidth * 0.55 + 4
  const yokeDepth = armholeDepth + 1
  const sleeveCapDepth = armholeDepth - 2
  const upperArmCircumference = body.upperArm + 3
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)
  const yokeDepthRows = Math.max(10, Math.round(yokeDepth * rowsPerCm))

  // Shoulder build-up takes ~30% of yoke depth; sleeve saddles take
  // the rest.
  const yokeIncreaseRows = Math.round(yokeDepthRows * 0.7)
  const underarmStitchCount = roundEvenly(Math.max(4, bustCm * stitchesPerCm * 0.04))
  const sleeveBicepStitchCount = roundEvenly(
    upperArmCircumference * stitchesPerCm + underarmStitchCount,
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
    shape: 'CONTIGUOUS_SET_IN' satisfies ConstructionShape,
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
        `Cast on ${neckStitchCount} stitches on the smaller needle, place markers for front / back / shoulder seams, work neckband ribbing.`,
        `Change to the larger needle. Build the shoulder line by working short-row pairs across the shoulder markers for ${Math.round(yokeDepthRows * 0.3)} rows; the shoulder saddle reaches its full ${roundTenth(body.shoulderWidth)}cm width before the sleeves begin.`,
        `Begin the contiguous sleeve cap: each row pair adds 1 stitch each side of each shoulder marker. Work ${yokeIncreaseRows} pairs of saddle increase rows to build the sleeve cap to ${sleeveBicepStitchCount} stitches.`,
        `At the underarm row (row ${yokeDepthRows}), set aside each sleeve section on waste yarn and cast on ${underarmStitchCount} stitches across each underarm gap. Join in the round.`,
        `Continue body in the round for ${bodyLengthRows} rounds then work the ribbed hem and cast off in pattern.`,
        `Rejoin yarn at each underarm, pick up ${underarmStitchCount} stitches across the gusset, and work each sleeve down decreasing to ${sleeveCuffStitchCount} stitches over ${sleeveLengthRows} rows. Work cuff ribbing and cast off in pattern.`,
        `Weave in ends and block to finished measurements.`,
      ],
      seams: [],
    },
  }
}
