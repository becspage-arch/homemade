// Top-down circular yoke grading.
//
// Construction: worked in the round from the neck down. Increases are
// distributed in three (sometimes four) increase rounds spaced at 30%,
// 60%, 90% of yoke depth, with each round adding enough stitches to
// hit the bust circumference at the underarm. The traditional ratio
// (referenced in pre-1980s European pattern manuals) is roughly 1.4×
// stitches at first round, 1.4× at second, 1.4× at third, which compounds
// to ~2.74× the neck - close to the common bust-to-neck ratio for
// typical sizes.

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

export interface YokeInput {
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradeTopDownYoke(input: YokeInput): GradedPattern {
  const body = getBodyMeasurements(input.size)
  const opts = input.options ?? {}
  const stitchesPerCm = input.gauge.stitchesPer10cm / 10
  const rowsPerCm = input.gauge.rowsPer10cm / 10

  const bustCm = applyEase(body.bust, input.easePreset)
  const bustStitches = roundEvenly(bustCm * stitchesPerCm)
  const hemStitches = bustStitches

  // Neckline sits a bit higher / wider than raglan since circular yokes
  // pull the neck towards the body symmetrically.
  const neckCm = body.neck + 4
  const neckStitches = roundToMultiple(neckCm * stitchesPerCm, 6)

  const yokeDepthCm = body.shoulderWidth * 0.7 + 2
  const yokeDepthRows = Math.max(10, Math.round(yokeDepthCm * rowsPerCm))

  // Three increase rounds, geometric-mean style. Solve for ratio R so
  // neckStitches × R^3 ~= bustStitchesAtYokeBottom (before underarm cast-off).
  const yokeBottomStitches = Math.max(bustStitches, Math.round(neckStitches * 2.74))
  const ratio = Math.pow(yokeBottomStitches / neckStitches, 1 / 3)
  const increaseRound1 = Math.round(neckStitches * ratio)
  const increaseRound2 = Math.round(increaseRound1 * ratio)
  const increaseRound3 = Math.round(increaseRound2 * ratio)
  const yokeIncreaseRows = 3

  const underarmStitches = roundEvenly(Math.max(4, bustCm * stitchesPerCm * 0.05))
  // Sleeve gets roughly 1/4 of the yoke bottom each.
  const sleeveBicepStitches = roundEvenly(
    Math.round(increaseRound3 * 0.25) + underarmStitches,
  )

  const cuffRatio = opts.sleeveCuffRatio ?? 0.65
  const sleeveCuffStitches = roundEvenly(sleeveBicepStitches * cuffRatio)
  const sleeveCm = body.armLength
  const sleeveLengthRows = Math.round(sleeveCm * rowsPerCm)

  const bodyLengthCm = body.bodyLength
  - body.backLengthToWaist * 0.45
  + (opts.bodyLengthAdjustCm ?? 0)
  const bodyLengthRows = Math.round(bodyLengthCm * rowsPerCm)

  const yarn = estimateYarn(
    {
      bodyBust: bustCm,
      bodyLength: bodyLengthCm + yokeDepthCm,
      sleeveUpper: sleeveBicepStitches / stitchesPerCm,
      sleeveLength: sleeveCm,
      hasSleeves: input.garmentType !== 'TANK' && input.garmentType !== 'VEST',
    },
    opts.yarnWeightCategory ?? 4,
  )

  return {
    size: input.size,
    shape: 'TOP_DOWN_YOKE' satisfies ConstructionShape,
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
        `Chain ${neckStitches + 1} and join in the round; work neckline ribbing if pattern includes one.`,
        `Round ${Math.round(yokeDepthRows * 0.3)}: increase to ${increaseRound1} stitches evenly spaced.`,
        `Round ${Math.round(yokeDepthRows * 0.6)}: increase to ${increaseRound2} stitches.`,
        `Round ${Math.round(yokeDepthRows * 0.9)}: increase to ${increaseRound3} stitches.`,
        `At underarm (round ${yokeDepthRows}), set aside sleeve sections on scrap yarn and chain ${underarmStitches} stitches across each underarm gap.`,
        `Continue body in the round for ${bodyLengthRows} rows then work hem trim.`,
        `Rejoin yarn at each underarm, pick up ${underarmStitches} stitches across the gusset, and work each sleeve down to ${sleeveCuffStitches} stitches over ${sleeveLengthRows} rows.`,
        `Weave in ends and block to finished measurements.`,
      ],
      seams: [],
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
