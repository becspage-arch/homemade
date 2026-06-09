// Bottom-up set-in sleeve grading.
//
// Construction: two body panels (front + back) worked flat from hem to
// shoulder. At the armhole, stitches are decreased to shape the armscye.
// Sleeves are worked separately from cuff up, increasing to bicep, then
// the sleeve cap is shaped with paired decreases that mirror the armhole
// curve. Pieces are sewn together at shoulders, set-in sleeves, side
// seams, and underarm seams.
//
// Reference: standard set-in sleeve drafting principles documented in
// pre-1980s tailoring manuals (out of copyright). The armhole-depth =
// shoulder-to-bust × 0.5 + 4 cm convention is a long-standing
// tailoring rule of thumb.

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
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const bustStitches = roundEvenly(bustCm * stitchesPerCm)
  // Half for each panel.
  const panelBustStitches = Math.round(bustStitches / 2)
  const hemStitches = bustStitches

  // Armhole depth: shoulder-to-bust drop plus ~4 cm shaping room.
  const armholeDepthCm = body.shoulderWidth * 0.55 + 4
  const armholeDepthRows = Math.round(armholeDepthCm * rowsPerCm)

  // Armhole bind-off: ~8% of panel stitches each side.
  const armholeBindOffPerSide = Math.max(2, Math.round(panelBustStitches * 0.08))
  const shoulderStitches = panelBustStitches - 2 * armholeBindOffPerSide
    - 2 * Math.round(armholeBindOffPerSide * 0.5)

  // Sleeve.
  const upperArmCm = body.upperArm + 4 // set-in sleeves carry a touch of positive ease
  const sleeveBicepStitches = roundEvenly(upperArmCm * stitchesPerCm)
  const cuffRatio = opts.sleeveCuffRatio ?? 0.6
  const sleeveCuffStitches = roundEvenly(sleeveBicepStitches * cuffRatio)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  // Sleeve cap: depth roughly equal to armhole depth - 2 cm.
  const sleeveCapDepthCm = armholeDepthCm - 2
  const yokeDepthRows = Math.round(sleeveCapDepthCm * rowsPerCm)
  const yokeIncreaseRows = Math.round(yokeDepthRows * 0.7)

  // Neckline shaping.
  const neckCm = body.neck + 4
  const neckStitches = roundToMultiple(neckCm * stitchesPerCm, 2)

  // Underarm at the body panel: stitches bound off at the start of the
  // armhole; we surface this for consistency with raglan / yoke pieces.
  const underarmStitches = armholeBindOffPerSide

  const bodyLengthCm = body.bodyLength
    - body.backLengthToWaist * 0.45
    + (opts.bodyLengthAdjustCm ?? 0)
  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yarn = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + armholeDepthCm,
      sleeveUpper: upperArmCm,
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )

  return {
    size: input.size,
    shape: 'BOTTOM_UP_SET_IN' satisfies ConstructionShape,
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
      body: roundTenth(bodyLengthCm + armholeDepthCm),
      sleeve: roundTenth(sleeveCm),
      upperArm: roundTenth(upperArmCm),
      cuff: roundTenth(sleeveCuffStitches / stitchesPerCm),
      neck: roundTenth(neckStitches / stitchesPerCm),
    },

    assemblyInstructions: {
      steps: [
        `Work back panel: cast on ${panelBustStitches} stitches, work flat for ${bodyLengthRows} rows.`,
        `At armhole, bind off ${armholeBindOffPerSide} stitches each side then decrease 1 stitch each side every other row over ${Math.round(armholeDepthRows * 0.3)} rows; work straight to total armhole depth of ${armholeDepthRows} rows.`,
        `Shape neckline and shoulders over the final ${Math.round(armholeDepthRows * 0.25)} rows leaving ${shoulderStitches} stitches per shoulder.`,
        `Work front panel the same shape as back but with a lower neckline cut.`,
        `Work each sleeve: cast on ${sleeveCuffStitches}, increase evenly to ${sleeveBicepStitches} over ${sleeveLengthRows} rows.`,
        `Shape sleeve cap: bind off ${armholeBindOffPerSide} stitches each side, decrease 1 stitch each side every other row over ${yokeDepthRows} rows.`,
        `Sew shoulder seams. Set sleeves into armholes easing the cap. Sew side seams and underarm seams in one continuous line.`,
        `Pick up ${neckStitches} stitches around the neckline and work neck trim. Weave in ends and block.`,
      ],
      seams: ['shoulder seams', 'set-in sleeve seams', 'side seams', 'underarm seams'],
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
