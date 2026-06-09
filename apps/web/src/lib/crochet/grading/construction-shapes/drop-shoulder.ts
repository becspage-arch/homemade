// Drop-shoulder grading.
//
// Construction: simplest of the five shapes. Body is two rectangles
// (front + back), each cast on at full bust width and worked straight
// to shoulder. Sleeves are tapered rectangles worked from cuff up.
// The "shoulder seam" sits well off the natural shoulder, which is
// where the silhouette name comes from. No armhole shaping; the sleeve
// is simply sewn onto the straight edge.

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
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  // Drop-shoulder typically uses positive ease even when the preset
  // is ZERO; the silhouette depends on extra room across the shoulders.
  const bustCm = applyEase(body.bust, input.easePreset) + 4
  const bustStitches = roundEvenly(bustCm * stitchesPerCm)
  const panelStitches = Math.round(bustStitches / 2)
  const hemStitches = bustStitches

  // The shoulder line lands halfway between the natural shoulder and
  // the elbow on a drop-shoulder garment.
  const dropCm = (body.upperArm / 2) // approximate sleeve cap fall
  const armholeDepthCm = body.shoulderWidth * 0.5 + dropCm + 4
  const armholeDepthRows = Math.round(armholeDepthCm * rowsPerCm)

  // Sleeves: rectangular taper from cuff to a wide opening matching the
  // armhole depth × 2 across.
  const sleeveBicepCm = armholeDepthCm * 2
  const sleeveBicepStitches = roundEvenly(sleeveBicepCm * stitchesPerCm)
  const cuffRatio = opts.sleeveCuffRatio ?? 0.5
  const sleeveCuffStitches = roundEvenly(sleeveBicepStitches * cuffRatio)
  const sleeveCm = body.armLength - body.shoulderWidth * 0.3
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const neckCm = body.neck + 6
  const neckStitches = roundToMultiple(neckCm * stitchesPerCm, 2)

  const bodyLengthCm = body.bodyLength
    - body.backLengthToWaist * 0.4
    + (opts.bodyLengthAdjustCm ?? 0)
  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  // Drop-shoulder doesn't really have a yoke; expose 0 to keep the shape
  // of the GradedPattern stable across constructions.
  const yokeDepthRows = 0
  const yokeIncreaseRows = 0
  const underarmStitches = 0

  const yarn = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + armholeDepthCm,
      sleeveUpper: sleeveBicepCm,
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )

  return {
    size: input.size,
    shape: 'DROP_SHOULDER' satisfies ConstructionShape,
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
      upperArm: roundTenth(sleeveBicepCm),
      cuff: roundTenth(sleeveCuffStitches / stitchesPerCm),
      neck: roundTenth(neckStitches / stitchesPerCm),
    },

    assemblyInstructions: {
      steps: [
        `Work back panel: cast on ${panelStitches} stitches, work straight for ${bodyLengthRows + armholeDepthRows} rows.`,
        `Work front panel the same as back, shaping a shallow neckline over the final ${Math.round(armholeDepthRows * 0.3)} rows.`,
        `Work each sleeve: cast on ${sleeveCuffStitches}, increase evenly to ${sleeveBicepStitches} over ${sleeveLengthRows} rows.`,
        `Sew shoulder seams leaving a ${Math.round((neckCm))}cm gap for the neckline.`,
        `Lay each sleeve flat across the open armhole and sew in place along the straight edge.`,
        `Sew side seams and underarm seams in one continuous line.`,
        `Pick up ${neckStitches} stitches around the neckline and work neck trim. Weave in ends and block.`,
      ],
      seams: ['shoulder seams', 'sleeve to body', 'side seams', 'underarm seams'],
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
