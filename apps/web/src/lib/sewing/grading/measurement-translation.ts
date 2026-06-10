// SPDX-License-Identifier: MIT
// Translation between Homemade's UserSewingMeasurements keys (cm canonical)
// and freesewing's measurement vocabulary (mm canonical).
//
// Single source of truth for naming. Engine swap stays a one-file change
// because nothing outside this directory ever references freesewing's
// measurement keys.
//
// Where Homemade tracks a measurement and freesewing does not (or vice
// versa), the gap is documented in code and the function falls back to
// freesewing's CYC default for that key.

import type { MeasurementsPayload } from '../measurements'

/**
 * Freesewing's measurement keys are documented as part of the engine API:
 *   https://freesewing.org/docs/about/contributors/measurements
 *
 * Values in freesewing settings are millimetres (the Pattern() defaults
 * units to 'metric' which the renderer interprets as mm). Homemade
 * stores cm canonical so this layer multiplies by 10.
 */
export type FreesewingMeasurements = Record<string, number>

/**
 * Per-key mapping. The Homemade side is left as the literal field name
 * from UserSewingMeasurements; the freesewing side is the matching
 * freesewing measurement key.
 *
 * Where freesewing splits a Homemade measurement into multiple keys
 * (e.g. hpsToWaistBack / hpsToWaistFront from a single backWaistLength /
 * frontWaistLength), the table records both halves.
 *
 * Where the engine wants a key that has no direct Homemade equivalent,
 * the missing key is supplied from CYC defaults via the FREESEWING_DEFAULT_MM
 * table below. The wrapper emits a soft warning so admin telemetry
 * can flag patterns that lean on defaults heavily.
 */
const HOMEMADE_TO_FREESEWING: Array<{
  homemadeKey: keyof MeasurementsPayload
  freesewingKeys: string[]
  notes?: string
}> = [
  { homemadeKey: 'bustChestCm', freesewingKeys: ['chest'] },
  // Approximation; freesewing treats highBust as a discrete measurement
  // we currently do not collect. Falls back to default when absent.
  { homemadeKey: 'waistCm', freesewingKeys: ['waist'] },
  { homemadeKey: 'hipCm', freesewingKeys: ['hips', 'seat'] },
  { homemadeKey: 'inseamCm', freesewingKeys: ['inseam'] },
  {
    homemadeKey: 'bodyHeightCm',
    freesewingKeys: [],
    notes: 'Standing height is not a freesewing measurement; used only by Homemade size suggestion.',
  },
  { homemadeKey: 'bustPointCm', freesewingKeys: ['bustSpan'] },
  { homemadeKey: 'backWaistLengthCm', freesewingKeys: ['hpsToWaistBack'] },
  { homemadeKey: 'frontWaistLengthCm', freesewingKeys: ['hpsToWaistFront'] },
  { homemadeKey: 'shoulderWidthCm', freesewingKeys: ['shoulderToShoulder'] },
  { homemadeKey: 'armLengthCm', freesewingKeys: ['shoulderToWrist'] },
  { homemadeKey: 'wristCircumferenceCm', freesewingKeys: ['wrist'] },
  { homemadeKey: 'thighCircumferenceCm', freesewingKeys: ['upperLeg'] },
  { homemadeKey: 'calfCircumferenceCm', freesewingKeys: ['knee'] },
  { homemadeKey: 'ankleCircumferenceCm', freesewingKeys: ['ankle'] },
  { homemadeKey: 'neckCircumferenceCm', freesewingKeys: ['neck'] },
]

/**
 * CYC-standard defaults in millimetres. Used when freesewing requires a
 * measurement Homemade does not track. Sourced from freesewing's bundled
 * cisFemaleAdult38 / cisMaleAdult40 reference models.
 *
 * Two-axis: [womensDefault, mensDefault]. The caller picks per design
 * via the genderFamily field on SewingDesignConfig.
 */
const FREESEWING_DEFAULT_MM: Record<string, [number, number]> = {
  ankle: [245, 235],
  biceps: [270, 350],
  bustFront: [480, 560],
  bustPointToUnderbust: [100, 60],
  bustSpan: [160, 190],
  chest: [925, 1000],
  crossSeam: [740, 870],
  crossSeamFront: [370, 410],
  crotchDepth: [270, 340],
  heel: [315, 360],
  head: [565, 590],
  highBust: [865, 1030],
  highBustFront: [440, 570],
  hips: [900, 840],
  hpsToBust: [275, 280],
  hpsToWaistBack: [395, 470],
  hpsToWaistFront: [400, 460],
  inseam: [765, 780],
  knee: [380, 410],
  neck: [340, 380],
  seat: [1010, 1020],
  seatBack: [520, 560],
  shoulderSlope: [13, 13],
  shoulderToElbow: [340, 360],
  shoulderToShoulder: [415, 450],
  shoulderToWrist: [620, 660],
  underbust: [820, 940],
  upperLeg: [560, 590],
  waist: [720, 870],
  waistBack: [365, 425],
  waistToArmpit: [210, 240],
  waistToFloor: [1050, 1080],
  waistToHips: [120, 130],
  waistToKnee: [580, 600],
  waistToSeat: [220, 240],
  waistToUpperLeg: [60, 70],
  wrist: [165, 175],
}

export type GenderForDefaults = 'WOMENS' | 'MENS' | 'UNISEX' | 'KIDS' | 'BABIES'

function defaultIndex(gender: GenderForDefaults): 0 | 1 {
  return gender === 'MENS' ? 1 : 0
}

export interface TranslateOptions {
  /** Which CYC default column to fall back on for missing keys. */
  genderFamily: GenderForDefaults
  /**
   * Freesewing measurement keys this design needs. Missing keys are
   * back-filled from CYC defaults and reported in fallbacksUsed.
   */
  requiredMeasurements: string[]
  /**
   * Freesewing measurement keys this design can use if present. Not
   * back-filled; absent optional keys are simply not set.
   */
  optionalMeasurements?: string[]
}

export interface TranslateResult {
  measurements: FreesewingMeasurements
  /** Required keys that came from CYC defaults, not user data. */
  fallbacksUsed: string[]
  /** Homemade keys present on input that had no freesewing analogue. */
  unmappedHomemadeKeys: string[]
}

/**
 * Translate a Homemade measurements payload to the freesewing measurement
 * dictionary expected by `new Pattern({ measurements })`.
 *
 * Units: Homemade stores cm, freesewing wants mm. This function multiplies
 * by 10 across the board.
 *
 * Behaviour:
 *  - Map each present Homemade key to its freesewing counterpart(s).
 *  - For required freesewing keys still missing after the map, fall back
 *    to the CYC default column for the design's gender family.
 *  - Leave optional freesewing keys unset if not present (freesewing
 *    designs check `settings.measurements[key]` defensively).
 */
export function homemadeToFreesewing(
  payload: MeasurementsPayload,
  opts: TranslateOptions,
): TranslateResult {
  const out: FreesewingMeasurements = {}
  const unmapped: string[] = []

  for (const row of HOMEMADE_TO_FREESEWING) {
    const value = payload[row.homemadeKey]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    if (row.freesewingKeys.length === 0) {
      unmapped.push(row.homemadeKey as string)
      continue
    }
    const mm = value * 10
    for (const k of row.freesewingKeys) {
      out[k] = mm
    }
  }

  const idx = defaultIndex(opts.genderFamily)
  const fallbacks: string[] = []

  for (const required of opts.requiredMeasurements) {
    if (typeof out[required] === 'number') continue
    const def = FREESEWING_DEFAULT_MM[required]
    if (def) {
      out[required] = def[idx]
      fallbacks.push(required)
    }
  }

  return {
    measurements: out,
    fallbacksUsed: fallbacks,
    unmappedHomemadeKeys: unmapped,
  }
}

/** Test-only re-export: lets the test suite verify the full key map. */
export const _internal = {
  HOMEMADE_TO_FREESEWING,
  FREESEWING_DEFAULT_MM,
}
