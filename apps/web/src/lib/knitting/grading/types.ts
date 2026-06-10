import type { SizeName } from './size-charts'
import type { EasePreset } from './ease-presets'
import type { Gauge, DominantFabric } from './gauge'

export type { Gauge, DominantFabric } from './gauge'

export type ConstructionShape =
  | 'TOP_DOWN_RAGLAN'
  | 'TOP_DOWN_YOKE'
  | 'BOTTOM_UP_SET_IN'
  | 'DROP_SHOULDER'
  | 'SIDE_TO_SIDE'
  | 'CONTIGUOUS_SET_IN'

export type GarmentType =
  | 'PULLOVER'
  | 'CARDIGAN'
  | 'VEST'
  | 'TANK'
  | 'TUNIC'
  | 'DRESS'

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
  /** Dominant fabric of the body; defaults to STOCKINETTE. */
  dominantFabric?: DominantFabric
}

export interface FinishedMeasurements {
  bust: number
  body: number
  sleeve: number
  upperArm: number
  cuff: number
  neck: number
  /** Locked K-5 keys mirrored on the finished-measurement view. */
  yokeDepth: number
  armholeDepth: number
  sleeveCapDepth: number
}

export interface AssemblyInstructions {
  /** Ordered list of steps. Each is a single-sentence plain-English step. */
  steps: string[]
  /** Names of seams to sew if any. Empty for seamless constructions. */
  seams: string[]
}

/**
 * A graded knitting pattern for one size. The seven keys
 *
 *   yokeDepth, neckCircumference, armholeDepth, sleeveCapDepth,
 *   upperArmCircumference, wristCircumference, sleeveCuffCircumference
 *
 * are the locked K-5 sweater grading keys named up-front in commit
 * a29b705e and the K-4.3 SchematicRenderer SizeRow type. They appear
 * verbatim on the schema's sizesGraded JSON column so the author
 * prompt + grading library + schematic renderer all agree.
 */
export interface GradedPattern {
  size: SizeName
  shape: ConstructionShape
  garmentType: GarmentType
  gauge: Gauge
  easePreset: EasePreset

  // ── Locked schema keys (K-3 + K-4.1 core + K-5 sweater) ──────────
  /** Body bust circumference in cm. */
  bust: number
  /** Body waist circumference in cm. */
  waist: number
  /** Body hip circumference in cm. */
  hip: number
  /** Body length cuff-to-hem in cm. */
  length: number
  /** Sleeve length underarm-to-cuff in cm. */
  sleeveLength: number
  /** Shoulder width across the back in cm. */
  shoulderWidth: number

  /** K-5 — Yoke depth (neck base to underarm) in cm. */
  yokeDepth: number
  /** K-5 — Neck opening circumference in cm. */
  neckCircumference: number
  /** K-5 — Armhole depth (shoulder to underarm) in cm. */
  armholeDepth: number
  /** K-5 — Sleeve cap depth from bicep to shoulder seam in cm. */
  sleeveCapDepth: number
  /** K-5 — Upper arm circumference at bicep in cm. */
  upperArmCircumference: number
  /** K-5 — Wrist circumference (canonical body wrist) in cm. */
  wristCircumference: number
  /** K-5 — Sleeve cuff circumference (ribbed) in cm. */
  sleeveCuffCircumference: number

  // ── Stitch counts at the key working points ──────────────────────
  hemStitchCount: number
  bustStitchCount: number
  underarmStitchCount: number
  sleeveCuffStitchCount: number
  sleeveBicepStitchCount: number
  neckStitchCount: number

  // ── Row counts ───────────────────────────────────────────────────
  bodyLengthRows: number
  sleeveLengthRows: number
  yokeDepthRows: number
  yokeIncreaseRows: number
  raglanIncreaseRows?: number

  // ── Yarn requirement ─────────────────────────────────────────────
  yarnRequiredGrams: number
  yarnRequiredYards: number

  finishedMeasurements: FinishedMeasurements
  assemblyInstructions: AssemblyInstructions
}

export interface VerificationResult {
  ok: boolean
  issues: string[]
}

export interface GarmentGradeInput {
  constructionShape: ConstructionShape
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}
