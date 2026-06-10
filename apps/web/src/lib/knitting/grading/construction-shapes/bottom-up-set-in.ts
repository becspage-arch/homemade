// Bottom-up set-in sleeve grading (knit).
//
// Construction: two body panels (front + back) worked flat from hem to
// shoulder. At the armhole, stitches are bound off then decreased every
// other row to shape the armscye. Sleeves are worked separately from
// cuff up, increasing to bicep, then the sleeve cap is shaped with
// paired decreases mirroring the armhole curve. Pieces are sewn at
// shoulders, set-in sleeves, side seams, and underarm seams.
//
// Reference: tailoring drafting principles in PD manuals (Weldon's,
// Beeton's). The armhole-depth = shoulderWidth × 0.55 + 4 cm
// convention is a long-standing knitting tailoring rule of thumb.

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

export interface SetInInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeBottomUpSetIn(input: SetInInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
  const panelBustStitches = Math.round(bustStitchCount / 2)
  const hemStitchCount = roundEvenly(bustStitchCount * fab.hemStitchMultiplier)

  const armholeDepth = body.shoulderWidth * 0.55 + 4
  const yokeDepth = armholeDepth
  const armholeDepthRows = Math.round(armholeDepth * rowsPerCm)

  // Armhole bind-off ~8% of panel stitches each side.
  const armholeBindOffPerSide = Math.max(2, Math.round(panelBustStitches * 0.08))
  const shoulderStitches =
    panelBustStitches - 2 * armholeBindOffPerSide - 2 * Math.round(armholeBindOffPerSide * 0.5)

  // Sleeve.
  const upperArmCircumference = body.upperArm + 4 // set-in carries positive ease
  const sleeveBicepStitchCount = roundEvenly(upperArmCircumference * stitchesPerCm)
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)
  const sleeveCuffStitchCount = roundEvenly(sleeveCuffCircumference * stitchesPerCm)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  // Sleeve cap depth roughly equal to armhole depth - 2.
  const sleeveCapDepth = armholeDepth - 2
  const yokeDepthRows = Math.round(sleeveCapDepth * rowsPerCm)
  const yokeIncreaseRows = Math.round(yokeDepthRows * 0.7)

  const neckCircumference = body.neck + 4
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 2)

  const underarmStitchCount = armholeBindOffPerSide

  const bodyLengthCm =
    body.bodyLength - body.backLengthToWaist * 0.45 + (opts.bodyLengthAdjustCm ?? 0)
  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yarnBase = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + armholeDepth,
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
    shape: 'BOTTOM_UP_SET_IN' satisfies ConstructionShape,
    garmentType: input.garmentType,
    gauge: input.gauge,
    easePreset: input.easePreset,

    bust: roundTenth(bustCm),
    waist: roundTenth(applyEase(body.waist, input.easePreset)),
    hip: roundTenth(applyEase(body.hip, input.easePreset)),
    length: roundTenth(bodyLengthCm + armholeDepth),
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
      body: roundTenth(bodyLengthCm + armholeDepth),
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
        `Work back panel: cast on ${panelBustStitches} stitches on the smaller needle, work hem ribbing then change to the larger needle and work in stocking stitch for ${bodyLengthRows} rows.`,
        `At the armhole, cast off ${armholeBindOffPerSide} stitches at the start of the next two rows then decrease 1 stitch each side every other row over ${Math.round(armholeDepthRows * 0.3)} rows. Work straight to total armhole depth of ${armholeDepthRows} rows.`,
        `Shape the neckline and shoulders over the final ${Math.round(armholeDepthRows * 0.25)} rows leaving ${shoulderStitches} stitches per shoulder. Cast off shoulder stitches.`,
        `Work front panel the same shape as back, casting off centre neck stitches earlier for a lower neckline cut.`,
        `Work each sleeve: cast on ${sleeveCuffStitchCount} stitches on the smaller needle, work cuff ribbing then change to the larger needle and increase evenly to ${sleeveBicepStitchCount} over ${sleeveLengthRows} rows.`,
        `Shape sleeve cap: cast off ${armholeBindOffPerSide} stitches each side, decrease 1 stitch each side every other row over ${yokeDepthRows} rows, cast off remaining stitches.`,
        `Sew shoulder seams. Set sleeves into armholes easing the cap. Sew side seams and underarm seams in one continuous mattress-stitch line.`,
        `Pick up ${neckStitchCount} stitches around the neckline and work neck ribbing. Cast off in pattern. Weave in ends and block.`,
      ],
      seams: ['shoulder seams', 'set-in sleeve seams', 'side seams', 'underarm seams'],
    },
  }
}
