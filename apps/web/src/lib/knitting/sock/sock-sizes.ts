// Sock sizing — UK / EU / US shoe sizes map to foot length and
// circumference.
//
// Reference: standard foot-measurement tables published by national
// shoe-sizing bodies (UK Shoe Last Code, EU Mondopoint, US Brannock).
// All publicly available. The foot-circumference numbers come from
// the average ratio of foot length to circumference (typically 0.9-
// 1.0 × foot length, person to person; we use the published mean per
// shoe size).
//
// Foot length is heel-to-toe with the foot flat. Foot circumference
// is around the ball of the foot at the widest point.

export type FootSizeName =
  | 'KIDS_5UK_22EU' | 'KIDS_8UK_25EU' | 'KIDS_11UK_29EU' | 'KIDS_13UK_31EU'
  | 'YOUTH_2UK_34EU'
  | 'W_3UK_36EU_5US' | 'W_4UK_37EU_6US' | 'W_5UK_38EU_7US' | 'W_6UK_39EU_8US'
  | 'W_7UK_40EU_9US' | 'W_8UK_41EU_10US' | 'W_9UK_42EU_11US'
  | 'M_7UK_41EU_8US' | 'M_8UK_42EU_9US' | 'M_9UK_43EU_10US' | 'M_10UK_44EU_11US'
  | 'M_11UK_45EU_12US' | 'M_12UK_46EU_13US'

export interface FootMeasurements {
  /** Foot length heel-to-toe in cm. */
  footLengthCm: number
  /** Foot circumference at the ball in cm. */
  footCircumferenceCm: number
  /** Ankle circumference (lowest part above the heel) in cm. */
  ankleCircumferenceCm: number
  /** Calf circumference (mid-calf) in cm. Used for knee-high socks. */
  calfCircumferenceCm: number
  /** Label shown in pattern listings. */
  label: string
}

// Kids and youth sizes — for baby and child socks.
export const KIDS_SIZE_CHART: Record<string, FootMeasurements> = {
  KIDS_5UK_22EU: { footLengthCm: 13, footCircumferenceCm: 13, ankleCircumferenceCm: 14, calfCircumferenceCm: 19, label: 'UK 5 / EU 22 (baby / toddler)' },
  KIDS_8UK_25EU: { footLengthCm: 15.5, footCircumferenceCm: 15, ankleCircumferenceCm: 16, calfCircumferenceCm: 22, label: 'UK 8 / EU 25 (small child)' },
  KIDS_11UK_29EU: { footLengthCm: 18, footCircumferenceCm: 17, ankleCircumferenceCm: 18, calfCircumferenceCm: 25, label: 'UK 11 / EU 29 (child)' },
  KIDS_13UK_31EU: { footLengthCm: 19.5, footCircumferenceCm: 18, ankleCircumferenceCm: 19, calfCircumferenceCm: 27, label: 'UK 13 / EU 31 (older child)' },
  YOUTH_2UK_34EU: { footLengthCm: 21.5, footCircumferenceCm: 19, ankleCircumferenceCm: 20, calfCircumferenceCm: 29, label: 'UK 2 / EU 34 (youth)' },
}

// Women adult sizes.
export const WOMENS_SIZE_CHART: Record<string, FootMeasurements> = {
  W_3UK_36EU_5US: { footLengthCm: 22.5, footCircumferenceCm: 20, ankleCircumferenceCm: 21, calfCircumferenceCm: 32, label: 'Women UK 3 / EU 36 / US 5' },
  W_4UK_37EU_6US: { footLengthCm: 23, footCircumferenceCm: 20.5, ankleCircumferenceCm: 21.5, calfCircumferenceCm: 33, label: 'Women UK 4 / EU 37 / US 6' },
  W_5UK_38EU_7US: { footLengthCm: 24, footCircumferenceCm: 21, ankleCircumferenceCm: 22, calfCircumferenceCm: 34, label: 'Women UK 5 / EU 38 / US 7' },
  W_6UK_39EU_8US: { footLengthCm: 24.5, footCircumferenceCm: 21.5, ankleCircumferenceCm: 22.5, calfCircumferenceCm: 35, label: 'Women UK 6 / EU 39 / US 8' },
  W_7UK_40EU_9US: { footLengthCm: 25.5, footCircumferenceCm: 22, ankleCircumferenceCm: 23, calfCircumferenceCm: 35.5, label: 'Women UK 7 / EU 40 / US 9' },
  W_8UK_41EU_10US: { footLengthCm: 26, footCircumferenceCm: 22.5, ankleCircumferenceCm: 23.5, calfCircumferenceCm: 36, label: 'Women UK 8 / EU 41 / US 10' },
  W_9UK_42EU_11US: { footLengthCm: 26.5, footCircumferenceCm: 23, ankleCircumferenceCm: 24, calfCircumferenceCm: 37, label: 'Women UK 9 / EU 42 / US 11' },
}

// Men adult sizes.
export const MENS_SIZE_CHART: Record<string, FootMeasurements> = {
  M_7UK_41EU_8US: { footLengthCm: 25.5, footCircumferenceCm: 23, ankleCircumferenceCm: 23.5, calfCircumferenceCm: 37, label: 'Men UK 7 / EU 41 / US 8' },
  M_8UK_42EU_9US: { footLengthCm: 26, footCircumferenceCm: 23.5, ankleCircumferenceCm: 24, calfCircumferenceCm: 38, label: 'Men UK 8 / EU 42 / US 9' },
  M_9UK_43EU_10US: { footLengthCm: 27, footCircumferenceCm: 24, ankleCircumferenceCm: 24.5, calfCircumferenceCm: 39, label: 'Men UK 9 / EU 43 / US 10' },
  M_10UK_44EU_11US: { footLengthCm: 27.5, footCircumferenceCm: 24.5, ankleCircumferenceCm: 25, calfCircumferenceCm: 39.5, label: 'Men UK 10 / EU 44 / US 11' },
  M_11UK_45EU_12US: { footLengthCm: 28.5, footCircumferenceCm: 25, ankleCircumferenceCm: 25.5, calfCircumferenceCm: 40, label: 'Men UK 11 / EU 45 / US 12' },
  M_12UK_46EU_13US: { footLengthCm: 29, footCircumferenceCm: 25.5, ankleCircumferenceCm: 26, calfCircumferenceCm: 41, label: 'Men UK 12 / EU 46 / US 13' },
}

const ALL_FOOT_CHARTS = {
  ...KIDS_SIZE_CHART,
  ...WOMENS_SIZE_CHART,
  ...MENS_SIZE_CHART,
} as Record<string, FootMeasurements>

export function getFootMeasurements(size: FootSizeName | string): FootMeasurements {
  const m = ALL_FOOT_CHARTS[size]
  if (!m) throw new Error(`Unknown sock size: ${size}`)
  return m
}

export function listAllFootSizes(): FootSizeName[] {
  return [
    ...(Object.keys(KIDS_SIZE_CHART) as FootSizeName[]),
    ...(Object.keys(WOMENS_SIZE_CHART) as FootSizeName[]),
    ...(Object.keys(MENS_SIZE_CHART) as FootSizeName[]),
  ]
}
