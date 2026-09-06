import type { FootSizeName, FootMeasurements } from './sock-sizes'
import type { Gauge } from '../grading/gauge'

export type SockConstruction =
  | 'CUFF_DOWN'
  | 'TOE_UP'

export type SockHeelStyle =
  | 'FLAP_AND_GUSSET'
  | 'SHORT_ROW_GERMAN'
  | 'SHORT_ROW_JAPANESE'
  | 'SHORT_ROW_DUTCH'
  | 'AFTERTHOUGHT'

export interface SockOptions {
  /** Override sock leg length above the heel in cm (default 18 — mid-calf
   *  for standard adult sizes). Set higher for knee-high. */
  legLengthCm?: number
  /** Negative ease applied to the foot circumference for snug fit
   *  (default -2 cm — socks need to stretch over the foot). */
  footEaseCm?: number
  /** Heel-flap row count override; default scales with foot
   *  circumference. */
  heelFlapRows?: number
  /** Yarn weight category (default 1 — fingering, the standard sock
   *  weight). */
  yarnWeightCategory?: 1 | 2 | 3 | 4 | 5
}

export interface SockFinishedMeasurements {
  footLengthCm: number
  footCircumferenceCm: number
  ankleCircumferenceCm: number
  legLengthCm: number
}

export interface SockGradedPattern {
  size: FootSizeName | string
  construction: SockConstruction
  heelStyle: SockHeelStyle
  gauge: Gauge

  // ── Stitch counts ────────────────────────────────────────────────
  /** Cuff cast-on stitch count (cuff-down) or toe final stitch count
   *  (toe-up). */
  startingStitchCount: number
  /** Leg stitch count after ribbed cuff. */
  legStitchCount: number
  /** Stitch count after heel turn, before gusset begins. */
  heelTurnStitchCount: number
  /** Maximum stitch count during gusset (cuff-down) or leg join
   *  (toe-up). */
  gussetPeakStitchCount: number
  /** Foot stitch count (instep + sole). */
  footStitchCount: number
  /** Toe / cuff stitch count at grafting / cast-off. */
  toeStitchCount: number

  // ── Row counts ───────────────────────────────────────────────────
  cuffRibRows: number
  legRows: number
  heelFlapRows: number
  heelTurnRows: number
  gussetRows: number
  footRows: number
  toeRows: number

  // ── Finished dimensions ──────────────────────────────────────────
  finishedMeasurements: SockFinishedMeasurements

  // ── Yarn requirement ─────────────────────────────────────────────
  yarnRequiredGrams: number
  yarnRequiredYards: number

  // ── Ordered assembly steps ───────────────────────────────────────
  assemblyInstructions: {
    steps: string[]
  }
}

export interface SockVerificationResult {
  ok: boolean
  issues: string[]
}

export interface SockGradeInput {
  construction: SockConstruction
  heelStyle: SockHeelStyle
  size: FootSizeName | string
  gauge: Gauge
  options?: SockOptions
  /**
   * The maker's own foot measurements, in place of the standard chart row
   * for `size`. Set this and the construction module grades from these
   * numbers and never touches the size charts — the whole of custom fit.
   * Pair it with `size: 'CUSTOM'` so the returned pattern is labelled
   * honestly.
   */
  footMeasurements?: FootMeasurements
}
