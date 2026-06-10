// Drop-shoulder grading (knit).
//
// Construction: simplest of the six shapes. Body is two rectangles
// (front + back) knit flat from hem to shoulder, no armhole shaping.
// Sleeves are tapered rectangles knit cuff-up. Shoulder seam sits well
// off the natural shoulder, giving the silhouette its name. Common in
// oversized indie patterns; the easiest shape for beginner sweater
// knitters because the only shaping is the optional neckline.

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

export interface DropShoulderInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeDropShoulder(input: DropShoulderInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  // Drop-shoulder uses positive ease even when the preset is ZERO; the
  // silhouette depends on extra room across the shoulders.
  const bustCm = applyEase(body.bust, input.easePreset) + 4
  const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
  const panelStitches = Math.round(bustStitchCount / 2)
  const hemStitchCount = roundEvenly(bustStitchCount * fab.hemStitchMultiplier)

  // Drop sits halfway between natural shoulder and elbow.
  const dropCm = body.upperArm / 2
  const armholeDepth = body.shoulderWidth * 0.5 + dropCm + 4
  const yokeDepth = armholeDepth
  const armholeDepthRows = Math.round(armholeDepth * rowsPerCm)
  const sleeveCapDepth = 0 // unshaped sleeve

  // Sleeves taper from cuff to a wide opening matching armhole × 2.
  const upperArmCircumference = armholeDepth * 2
  const sleeveBicepStitchCount = roundEvenly(upperArmCircumference * stitchesPerCm)
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)
  const sleeveCuffStitchCount = roundEvenly(sleeveCuffCircumference * stitchesPerCm)
  const sleeveCm = body.armLength - body.shoulderWidth * 0.3
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const neckCircumference = body.neck + 6
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 2)

  const bodyLengthCm =
    body.bodyLength - body.backLengthToWaist * 0.4 + (opts.bodyLengthAdjustCm ?? 0)
  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yokeDepthRows = 0
  const yokeIncreaseRows = 0
  const underarmStitchCount = 0

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
    shape: 'DROP_SHOULDER' satisfies ConstructionShape,
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
        `Work back panel: cast on ${panelStitches} stitches, work hem ribbing then change to the larger needle and work straight in stocking stitch for ${bodyLengthRows + armholeDepthRows} rows. Cast off.`,
        `Work front panel the same as back, shaping a shallow neckline by casting off the centre ${Math.round(neckStitchCount * 0.5)} stitches and decreasing 1 stitch each neck edge every other row for ${Math.round(armholeDepthRows * 0.3)} rows.`,
        `Work each sleeve: cast on ${sleeveCuffStitchCount} stitches, work cuff ribbing then change to the larger needle and increase evenly to ${sleeveBicepStitchCount} over ${sleeveLengthRows} rows. Cast off.`,
        `Sew shoulder seams leaving a ${Math.round(neckCircumference)}cm gap for the neckline.`,
        `Lay each sleeve flat across the open armhole and sew the cast-off edge to the panel along the straight edge.`,
        `Sew side seams and underarm seams in one continuous mattress-stitch line.`,
        `Pick up ${neckStitchCount} stitches around the neckline and work neck ribbing. Cast off in pattern. Weave in ends and block.`,
      ],
      seams: ['shoulder seams', 'sleeve to body', 'side seams', 'underarm seams'],
    },
  }
}
