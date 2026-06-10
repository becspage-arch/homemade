/**
 * Sewing measurements. Shared helpers for the /me/sewing-measurements page
 * and the API route. Pure: no server-only deps, so the client editor can
 * import the field list. Canonical storage is cm everywhere per the locked
 * units rule (memory: feedback_measurement_units). Inches conversion
 * happens at render time, not at write time.
 */

export const DEFAULT_FIELDS = [
  'bustChestCm',
  'waistCm',
  'hipCm',
  'bodyHeightCm',
  'inseamCm',
] as const

export const ADVANCED_FIELDS = [
  'bustPointCm',
  'backWaistLengthCm',
  'frontWaistLengthCm',
  'shoulderWidthCm',
  'armLengthCm',
  'wristCircumferenceCm',
  'thighCircumferenceCm',
  'calfCircumferenceCm',
  'ankleCircumferenceCm',
  'neckCircumferenceCm',
] as const

export const ALL_FIELDS = [...DEFAULT_FIELDS, ...ADVANCED_FIELDS] as const

export type MeasurementField = (typeof ALL_FIELDS)[number]

const MIN_CM = 5
const MAX_CM = 300

export function normaliseMeasurement(input: unknown): number | null {
  if (input === null || input === '' || input === undefined) return null
  const num = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(num)) return null
  if (num <= 0) return null
  if (num < MIN_CM || num > MAX_CM) return null
  return Math.round(num * 100) / 100
}

export interface MeasurementsPayload {
  bustChestCm?: number | null
  waistCm?: number | null
  hipCm?: number | null
  bodyHeightCm?: number | null
  inseamCm?: number | null
  bustPointCm?: number | null
  backWaistLengthCm?: number | null
  frontWaistLengthCm?: number | null
  shoulderWidthCm?: number | null
  armLengthCm?: number | null
  wristCircumferenceCm?: number | null
  thighCircumferenceCm?: number | null
  calfCircumferenceCm?: number | null
  ankleCircumferenceCm?: number | null
  neckCircumferenceCm?: number | null
  notes?: string | null
  measurementPreference?: 'cm' | 'inches' | null
}

export function pickFields(raw: Record<string, unknown>): MeasurementsPayload {
  const out: MeasurementsPayload = {}
  for (const field of ALL_FIELDS) {
    if (field in raw) {
      const value = normaliseMeasurement(raw[field])
      out[field] = value
    }
  }
  if ('notes' in raw) {
    const v = raw['notes']
    out.notes = typeof v === 'string' ? (v.trim() === '' ? null : v.trim().slice(0, 2000)) : null
  }
  if ('measurementPreference' in raw) {
    const v = raw['measurementPreference']
    out.measurementPreference =
      v === 'inches' ? 'inches' : v === 'cm' ? 'cm' : null
  }
  return out
}
