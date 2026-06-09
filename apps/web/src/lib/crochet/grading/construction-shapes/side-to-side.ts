// Side-to-side grading.
//
// Construction: worked as a long rectangle from one cuff edge to the
// other. Rows run vertically when worn. Body width = bust × 0.5 (each
// "side" of the garment), height of each row = stitch dimension.
// Sleeves extend off the cast-on and bind-off edges. Armhole is a
// mid-piece slit, neckline a curved cut-out across the centre rows.
//
// Side-to-side is uncommon in commercial patterns but useful for
// drape-forward fabrics and patterns where the row direction adds
// design interest. Reference: traditional turn-of-the-century pattern
// drafting (public domain) used this construction for shawl-collared
// jackets and cocoon-shape sweaters.

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

export interface SideToSideInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeSideToSide(input: SideToSideInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  // The piece-width direction runs from hem to shoulder (so vertical
  // when worn). Each row's stitch count = piece height in stitches.
  const pieceWidthCm = body.bodyLength
    - body.backLengthToWaist * 0.4
    + (opts.bodyLengthAdjustCm ?? 0)
  const pieceWidthStitches = roundEvenly(pieceWidthCm * stitchesPerCm)

  // The row-direction runs from one cuff across the body to the other.
  // Body section width (between the two armholes) = bust / 2 (folded).
  // Sleeves extend beyond on each side.
  const bodyRowSpanCm = bustCm / 2 + body.armLength * 2
  const bodyRowSpanRows = roundEvenly(bodyRowSpanCm * rowsPerCm)

  // For the "hemStitches" / "bustStitches" semantic in GradedPattern we
  // map them to the piece's cast-on (= piece height) since side-to-side
  // has the same count at both ends.
  const hemStitches = pieceWidthStitches
  const bustStitches = pieceWidthStitches

  // Sleeve cuff = upper arm circumference (the sleeve is unshaped here,
  // a flat rectangle extension of the body piece).
  const cuffRatio = opts.sleeveCuffRatio ?? 0.75
  const sleeveBicepStitches = roundEvenly(body.upperArm * stitchesPerCm)
  const sleeveCuffStitches = roundEvenly(sleeveBicepStitches * cuffRatio)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  // Armhole sits at the transition from body to sleeve: a vertical slit
  // across the centre rows. Depth = upperArm / 2 (the fold-down).
  const armholeDepthCm = body.upperArm / 2 + 2
  const yokeDepthRows = Math.round(armholeDepthCm * rowsPerCm)
  const yokeIncreaseRows = 0

  const neckCm = body.neck + 4
  const neckStitches = roundToMultiple(neckCm * stitchesPerCm, 2)

  // bodyLengthRows here = the long across-piece dimension.
  const bodyLengthRows = bodyRowSpanRows

  const underarmStitches = 0

  // Side-to-side cardigans carry a front overlap and shawl-collar style
  // edges that add ~15% to the fabric area over the basic rectangle.
  const cardiganOverlap = input.garmentType === 'CARDIGAN' ? 1.15 : 1.0
  const yarn = estimateYarn(
    {
      bodyBust: bustCm * cardiganOverlap,
      bodyLength: pieceWidthCm,
      sleeveUpper: body.upperArm,
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )

  return {
    size: input.size,
    shape: 'SIDE_TO_SIDE' satisfies ConstructionShape,
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
      bust: roundTenth(bustCm),
      body: roundTenth(pieceWidthCm),
      sleeve: roundTenth(sleeveCm),
      upperArm: roundTenth(body.upperArm),
      cuff: roundTenth(sleeveCuffStitches / stitchesPerCm),
      neck: roundTenth(neckStitches / stitchesPerCm),
    },

    assemblyInstructions: {
      steps: [
        `Cast on ${pieceWidthStitches} stitches at one cuff edge.`,
        `Work straight for ${sleeveLengthRows} rows to the first armhole.`,
        `At the first armhole, bind off ${Math.round(yokeDepthRows)} rows for the sleeve fold and continue working the body section.`,
        `Work the body across ${bodyRowSpanRows - 2 * sleeveLengthRows} rows, shaping the neckline by binding off ${Math.round(neckStitches / 4)} stitches in the centre over ${Math.round(yokeDepthRows * 0.3)} rows.`,
        `At the second armhole, rebuild the sleeve edge by chaining ${Math.round(yokeDepthRows)} extra rows of width.`,
        `Work the second sleeve for ${sleeveLengthRows} rows, then bind off all stitches.`,
        `Fold along the shoulder line and sew underarm + sleeve seams.`,
        `Pick up ${neckStitches} stitches around the neckline and work neck trim. Weave in ends and block.`,
      ],
      seams: ['underarm seams', 'sleeve seams'],
    },
  }
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
