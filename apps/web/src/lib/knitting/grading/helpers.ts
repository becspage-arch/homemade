// Shared rounding + adjustment helpers used by the construction-shape
// modules. Keeping the helpers in one place means all six shapes round
// to the same convention.

export function roundEvenly(n: number): number {
  const r = Math.round(n)
  return r % 2 === 0 ? r : r + 1
}

export function roundToMultiple(n: number, m: number): number {
  return Math.max(m, Math.round(n / m) * m)
}

export function roundTenth(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Compute the wrist circumference for the finished garment cuff. The
 * canonical body wrist is from size-charts; the sleeve cuff worn
 * usually carries 4-8 cm of positive ease at the cuff itself plus a
 * snug-rib finish.
 */
export function defaultSleeveCuffCm(bodyWristCm: number): number {
  return bodyWristCm + 4
}
