// Side-to-side grading (knit).
//
// Construction: worked as a long rectangle from one cuff edge to the
// other. Rows run vertically when worn. Sleeves extend off the cast-on
// and cast-off edges. Armhole sits at the transition from body to
// sleeve as a vertical slit; neckline is a curved cast-off across the
// centre rows. The row direction itself becomes the design feature.
//
// Uncommon in commercial knitwear but useful for stripes, gradient
// dyes, and where the worked-direction line adds interest. Reference:
// turn-of-the-century pattern drafting (public domain) used this
// construction for shawl-collared jackets and cocoon sweaters.

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
import { consumptionForWeight } from '../yarn-estimate'
import { fabricAdjustmentsFor } from '../gauge'
import { roundEvenly, roundToMultiple, roundTenth, defaultSleeveCuffCm } from '../helpers'

export interface SideToSideInput {
  size: SizeName | 'CUSTOM'
  /** The maker's own measurements, in place of the chart row for `size`. */
  bodyMeasurements?: BodyMeasurements
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeSideToSide(input: SideToSideInput): GradedPattern {
  const body = input.bodyMeasurements ?? getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  // Piece-width direction runs hem-to-shoulder (so vertical when worn).
  // Each row's stitch count = piece height in stitches.
  const pieceWidthCm =
    body.bodyLength - body.backLengthToWaist * 0.4 + (opts.bodyLengthAdjustCm ?? 0)
  const pieceWidthStitches = roundEvenly(pieceWidthCm * stitchesPerCm * fab.bodyStitchMultiplier)

  // Row-direction runs cuff-to-cuff across the body. Body section width
  // (between the two armholes) = bust/2 folded; sleeves extend beyond.
  const bodyRowSpanCm = bustCm / 2 + body.armLength * 2
  const bodyRowSpanRows = roundEvenly(bodyRowSpanCm * rowsPerCm)

  // For the schema's hemStitchCount / bustStitchCount semantics we map
  // them to the cast-on (= piece height) since side-to-side has the
  // same count at both ends.
  const hemStitchCount = pieceWidthStitches
  const bustStitchCount = pieceWidthStitches

  const upperArmCircumference = body.upperArm + 2
  const sleeveCuffCircumference = defaultSleeveCuffCm(body.wrist)
  const sleeveBicepStitchCount = roundEvenly(upperArmCircumference * stitchesPerCm)
  const sleeveCuffStitchCount = roundEvenly(sleeveCuffCircumference * stitchesPerCm)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const armholeDepth = body.upperArm / 2 + 2
  const yokeDepth = armholeDepth
  const sleeveCapDepth = 0
  const yokeDepthRows = Math.round(armholeDepth * rowsPerCm)
  const yokeIncreaseRows = 0

  const neckCircumference = body.neck + 4
  const neckStitchCount = roundToMultiple(neckCircumference * stitchesPerCm, 2)

  const bodyLengthRows = bodyRowSpanRows
  const underarmStitchCount = 0

  // Side-to-side works one long rectangle cuff-to-cuff: the worked
  // fabric area is pieceWidth × rowSpan, no separate sleeves to add.
  // Cardigans add ~30% for front overlap + shawl-collar edges + the
  // double-layer button bands typical of side-to-side cardigan drafts.
  const cardiganOverlap = input.garmentType === 'CARDIGAN' ? 1.3 : 1.0
  const rectangleSqCm = pieceWidthCm * bodyRowSpanCm * cardiganOverlap
  const consumption = consumptionForWeight(opts.yarnWeightCategory ?? 4)
  const sqUnits = rectangleSqCm / 100
  const yarnBase = {
    grams: Math.round(sqUnits * consumption.gramsPer100SqCm),
    yards: Math.round(sqUnits * consumption.yardsPer100SqCm),
  }
  const yarn = {
    grams: Math.round(yarnBase.grams * fab.yarnMultiplier),
    yards: Math.round(yarnBase.yards * fab.yarnMultiplier),
  }

  return {
    size: input.size,
    shape: 'SIDE_TO_SIDE' satisfies ConstructionShape,
    garmentType: input.garmentType,
    gauge: input.gauge,
    easePreset: input.easePreset,

    bust: roundTenth(bustCm),
    waist: roundTenth(applyEase(body.waist, input.easePreset)),
    hip: roundTenth(applyEase(body.hip, input.easePreset)),
    length: roundTenth(pieceWidthCm),
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
      body: roundTenth(pieceWidthCm),
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
        `Cast on ${pieceWidthStitches} stitches at the first cuff edge.`,
        `Work straight for ${sleeveLengthRows} rows to the first armhole.`,
        `At the first armhole, cast off ${Math.round(yokeDepthRows)} stitches for the sleeve fold and continue working the body section.`,
        `Work the body across ${bodyRowSpanRows - 2 * sleeveLengthRows} rows, shaping the neckline by casting off ${Math.round(neckStitchCount / 4)} stitches in the centre over ${Math.round(yokeDepthRows * 0.3)} rows.`,
        `At the second armhole, rebuild the sleeve edge by casting on ${Math.round(yokeDepthRows)} extra stitches.`,
        `Work the second sleeve for ${sleeveLengthRows} rows, then cast off all stitches.`,
        `Fold along the shoulder line and sew underarm + sleeve seams.`,
        `Pick up ${neckStitchCount} stitches around the neckline and work neck ribbing. Cast off in pattern. Weave in ends and block.`,
      ],
      seams: ['underarm seams', 'sleeve seams'],
    },
  }
}
