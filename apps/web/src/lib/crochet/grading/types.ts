import type { SizeName } from './size-charts'
import type { EasePreset } from './ease-presets'

export type ConstructionShape =
  | 'TOP_DOWN_RAGLAN'
  | 'TOP_DOWN_YOKE'
  | 'BOTTOM_UP_SET_IN'
  | 'DROP_SHOULDER'
  | 'SIDE_TO_SIDE'

export type GarmentType =
  | 'PULLOVER'
  | 'CARDIGAN'
  | 'VEST'
  | 'TANK'
  | 'TUNIC'
  | 'DRESS'

export interface Gauge {
  /** Stitches over a 10 cm horizontal swatch. */
  stitchesPer10cm: number
  /** Rows over a 10 cm vertical swatch. */
  rowsPer10cm: number
}

export interface ShapeOptions {
  /** Override neck back width as a fraction of bust (default 0.20). */
  backNeckWidth?: number
  /** Override raglan line slope, rows-per-increase (default 2). */
  raglanLineSlope?: number
  /** Override sleeve cuff circumference relative to upper arm (default 0.65). */
  sleeveCuffRatio?: number
  /** Override yarn weight category for yardage estimate (default 4 / aran). */
  yarnWeightCategory?: 1 | 2 | 3 | 4 | 5 | 6 | 7
  /** Override hem stitches if pattern uses a non-standard hem allowance. */
  hemAllowanceCm?: number
  /** Length adjustment: positive = longer body, negative = cropped. */
  bodyLengthAdjustCm?: number
}

export interface FinishedMeasurements {
  bust: number
  body: number
  sleeve: number
  upperArm: number
  cuff: number
  neck: number
}

export interface AssemblyInstructions {
  /** Ordered list of steps. Each is a single-sentence plain-English step. */
  steps: string[]
  /** Names of seams to sew if any. Empty for seamless constructions. */
  seams: string[]
}

export interface GradedPattern {
  size: SizeName
  shape: ConstructionShape
  garmentType: GarmentType
  gauge: Gauge
  easePreset: EasePreset

  /** Stitch count at the hem. */
  hemStitches: number
  /** Stitch count at the bust. */
  bustStitches: number
  /** Underarm stitches added when seaming sleeves to body (raglan / yoke). */
  underarmStitches: number
  /** Stitch count at sleeve cuff. */
  sleeveCuffStitches: number
  /** Stitch count at sleeve bicep (after raglan / yoke increases). */
  sleeveBicepStitches: number
  /** Stitch count around the neckline opening. */
  neckStitches: number

  /** Body length from underarm to hem, in rows. */
  bodyLengthRows: number
  /** Sleeve length from underarm to cuff, in rows. */
  sleeveLengthRows: number
  /** Raglan / yoke depth from neck to underarm, in rows. */
  yokeDepthRows: number
  /** Number of increase rows in the yoke / raglan section. */
  yokeIncreaseRows: number

  yarnRequiredGrams: number
  yarnRequiredYards: number

  finishedMeasurements: FinishedMeasurements
  assemblyInstructions: AssemblyInstructions
}

export interface VerificationResult {
  ok: boolean
  issues: string[]
}
