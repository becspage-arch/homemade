// Standard body measurements in centimetres.
//
// Source: Craft Yarn Council standard sizing (publicly published,
// https://www.craftyarncouncil.com/standards/body-sizing). The CYC charts
// are the closest thing the craft world has to a shared sizing baseline:
// most independent designers grade against them and most pattern testers
// expect them. Measurements here are the body, not the finished garment.
// Ease is layered on top by `ease-presets.ts`.
//
// All values in cm. Inches and other units are derived at render time
// from the canonical numbers.

export type WomensSize =
  | 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL' | '6XL'

export type MensSize =
  | 'M-XS' | 'M-S' | 'M-M' | 'M-L' | 'M-XL' | 'M-2XL' | 'M-3XL'

export type KidsSize =
  | 'K-2' | 'K-4' | 'K-6' | 'K-8' | 'K-10' | 'K-12' | 'K-14'

export type BabySize =
  | 'B-NB' | 'B-3M' | 'B-6M' | 'B-12M' | 'B-18M' | 'B-24M'

export type SizeName = WomensSize | MensSize | KidsSize | BabySize

export interface BodyMeasurements {
  /** Bust / chest circumference at fullest point. */
  bust: number
  /** Natural waist circumference. */
  waist: number
  /** Hip circumference at fullest point. */
  hip: number
  /** Centre back to natural waist. */
  backLengthToWaist: number
  /** Centre back neck base to hem at natural body length. */
  bodyLength: number
  /** Across-back shoulder width, acromion to acromion. */
  shoulderWidth: number
  /** Outer arm length, shoulder point to wrist. */
  armLength: number
  /** Upper arm circumference at widest point. */
  upperArm: number
  /** Neck base circumference. */
  neck: number
  /** Head circumference (kids and baby sizes only). */
  head?: number
}

export const WOMENS_SIZE_CHART: Record<WomensSize, BodyMeasurements> = {
  XS: { bust: 78, waist: 60, hip: 84, backLengthToWaist: 39.5, bodyLength: 58, shoulderWidth: 35, armLength: 73, upperArm: 26, neck: 35 },
  S:  { bust: 86, waist: 68, hip: 92, backLengthToWaist: 40.5, bodyLength: 59, shoulderWidth: 37, armLength: 74, upperArm: 28, neck: 36 },
  M:  { bust: 96, waist: 78, hip: 102, backLengthToWaist: 42, bodyLength: 60, shoulderWidth: 39, armLength: 75, upperArm: 30, neck: 37 },
  L:  { bust: 106, waist: 88, hip: 112, backLengthToWaist: 43, bodyLength: 61, shoulderWidth: 41, armLength: 76, upperArm: 33, neck: 38 },
  XL: { bust: 116, waist: 98, hip: 122, backLengthToWaist: 44, bodyLength: 62, shoulderWidth: 43, armLength: 76.5, upperArm: 36, neck: 39 },
  '2XL': { bust: 126, waist: 108, hip: 132, backLengthToWaist: 44.5, bodyLength: 63, shoulderWidth: 45, armLength: 77, upperArm: 39, neck: 40 },
  '3XL': { bust: 136, waist: 118, hip: 142, backLengthToWaist: 45, bodyLength: 64, shoulderWidth: 46.5, armLength: 77, upperArm: 42, neck: 41 },
  '4XL': { bust: 146, waist: 128, hip: 152, backLengthToWaist: 45.5, bodyLength: 64.5, shoulderWidth: 48, armLength: 77, upperArm: 44, neck: 42 },
  '5XL': { bust: 156, waist: 138, hip: 162, backLengthToWaist: 46, bodyLength: 65, shoulderWidth: 49.5, armLength: 77.5, upperArm: 46, neck: 43 },
  '6XL': { bust: 166, waist: 148, hip: 172, backLengthToWaist: 46.5, bodyLength: 65.5, shoulderWidth: 51, armLength: 77.5, upperArm: 48, neck: 44 },
}

export const MENS_SIZE_CHART: Record<MensSize, BodyMeasurements> = {
  'M-XS': { bust: 86, waist: 76, hip: 88, backLengthToWaist: 44, bodyLength: 65, shoulderWidth: 41, armLength: 79, upperArm: 30, neck: 37 },
  'M-S':  { bust: 92, waist: 82, hip: 94, backLengthToWaist: 45, bodyLength: 66, shoulderWidth: 43, armLength: 80, upperArm: 32, neck: 38 },
  'M-M':  { bust: 102, waist: 90, hip: 102, backLengthToWaist: 46, bodyLength: 67, shoulderWidth: 45, armLength: 81, upperArm: 34, neck: 39.5 },
  'M-L':  { bust: 112, waist: 100, hip: 110, backLengthToWaist: 47, bodyLength: 68.5, shoulderWidth: 47, armLength: 82, upperArm: 36, neck: 41 },
  'M-XL': { bust: 122, waist: 110, hip: 118, backLengthToWaist: 48, bodyLength: 70, shoulderWidth: 49, armLength: 82.5, upperArm: 38.5, neck: 42.5 },
  'M-2XL': { bust: 132, waist: 122, hip: 128, backLengthToWaist: 48.5, bodyLength: 71, shoulderWidth: 51, armLength: 83, upperArm: 41, neck: 44 },
  'M-3XL': { bust: 142, waist: 132, hip: 138, backLengthToWaist: 49, bodyLength: 72, shoulderWidth: 53, armLength: 83, upperArm: 43, neck: 45 },
}

export const KIDS_SIZE_CHART: Record<KidsSize, BodyMeasurements> = {
  'K-2':  { bust: 53, waist: 51, hip: 56, backLengthToWaist: 22, bodyLength: 32, shoulderWidth: 23, armLength: 27, upperArm: 17, neck: 27, head: 49 },
  'K-4':  { bust: 56, waist: 53, hip: 59, backLengthToWaist: 24, bodyLength: 35, shoulderWidth: 25, armLength: 31, upperArm: 18, neck: 28, head: 50 },
  'K-6':  { bust: 60, waist: 56, hip: 63, backLengthToWaist: 27, bodyLength: 40, shoulderWidth: 27, armLength: 36, upperArm: 19, neck: 29, head: 51 },
  'K-8':  { bust: 66, waist: 60, hip: 69, backLengthToWaist: 30, bodyLength: 44, shoulderWidth: 29, armLength: 41, upperArm: 21, neck: 30, head: 52 },
  'K-10': { bust: 71, waist: 64, hip: 76, backLengthToWaist: 32, bodyLength: 48, shoulderWidth: 31, armLength: 46, upperArm: 23, neck: 31, head: 53 },
  'K-12': { bust: 76, waist: 67, hip: 81, backLengthToWaist: 35, bodyLength: 52, shoulderWidth: 33, armLength: 50, upperArm: 24, neck: 32, head: 54 },
  'K-14': { bust: 81, waist: 70, hip: 86, backLengthToWaist: 37, bodyLength: 55, shoulderWidth: 35, armLength: 53, upperArm: 26, neck: 33, head: 55 },
}

export const BABY_SIZE_CHART: Record<BabySize, BodyMeasurements> = {
  'B-NB':  { bust: 41, waist: 41, hip: 42, backLengthToWaist: 14, bodyLength: 20, shoulderWidth: 18, armLength: 18, upperArm: 13, neck: 25, head: 35 },
  'B-3M':  { bust: 43, waist: 43, hip: 44, backLengthToWaist: 15, bodyLength: 22, shoulderWidth: 19, armLength: 20, upperArm: 14, neck: 25.5, head: 40 },
  'B-6M':  { bust: 45, waist: 45, hip: 46, backLengthToWaist: 16, bodyLength: 24, shoulderWidth: 20, armLength: 22, upperArm: 15, neck: 26, head: 43 },
  'B-12M': { bust: 47, waist: 47, hip: 48, backLengthToWaist: 17, bodyLength: 26, shoulderWidth: 21, armLength: 24, upperArm: 16, neck: 26.5, head: 46 },
  'B-18M': { bust: 49, waist: 48, hip: 50, backLengthToWaist: 18, bodyLength: 28, shoulderWidth: 22, armLength: 26, upperArm: 16.5, neck: 27, head: 47 },
  'B-24M': { bust: 51, waist: 50, hip: 53, backLengthToWaist: 20, bodyLength: 30, shoulderWidth: 22.5, armLength: 28, upperArm: 17, neck: 27.5, head: 48 },
}

const ALL_CHARTS = {
  ...WOMENS_SIZE_CHART,
  ...MENS_SIZE_CHART,
  ...KIDS_SIZE_CHART,
  ...BABY_SIZE_CHART,
} as const

export function getBodyMeasurements(size: SizeName): BodyMeasurements {
  const m = (ALL_CHARTS as Record<string, BodyMeasurements>)[size]
  if (!m) throw new Error(`Unknown size: ${size}`)
  return m
}

export function listAllSizes(): SizeName[] {
  return [
    ...(Object.keys(WOMENS_SIZE_CHART) as WomensSize[]),
    ...(Object.keys(MENS_SIZE_CHART) as MensSize[]),
    ...(Object.keys(KIDS_SIZE_CHART) as KidsSize[]),
    ...(Object.keys(BABY_SIZE_CHART) as BabySize[]),
  ]
}
