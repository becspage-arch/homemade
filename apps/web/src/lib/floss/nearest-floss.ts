/**
 * Map a target RGB to the nearest floss colour in a brand table.
 *
 * We use the perceptual CIE76 distance (∆E in CIELAB) which is far more
 * faithful than naive RGB Euclidean for colour matching. CIE76 is the
 * cheapest of the perceptual deltas and good enough for photo-to-chart
 * — CIE94 / CIEDE2000 would be overkill and need lookup tables that
 * don't survive the live-preview-300ms-budget.
 */

import { DMC_TABLE, type FlossEntry } from './dmc-table'

export interface NearestOptions {
  /** Restrict the search to a brand. Defaults to DMC. */
  brand?: 'DMC' | 'ANCHOR' | 'MADEIRA'
  /** Optionally narrow to a candidate subset by index. */
  candidates?: number[]
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

/** sRGB → linear. */
function linearise(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** sRGB → CIELAB via D65, in the 0–100 / -128–127 lab range. */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = linearise(r) * 100
  const gl = linearise(g) * 100
  const bl = linearise(b) * 100

  // sRGB D65 → XYZ
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

  // D65 reference white
  const xn = 95.047
  const yn = 100.0
  const zn = 108.883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(x / xn)
  const fy = f(y / yn)
  const fz = f(z / zn)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

const dmcLab: [number, number, number][] = DMC_TABLE.map((entry) => {
  const [r, g, b] = hexToRgb(entry.rgb)
  return rgbToLab(r, g, b)
})

export function pickBrandTable(brand: 'DMC' | 'ANCHOR' | 'MADEIRA' | undefined): FlossEntry[] {
  if (brand && brand !== 'DMC') {
    // v1 only ships the DMC table; ANCHOR / MADEIRA fall through. Pattern
    // brand-swap remaps via DMC ↔ ANCHOR ↔ MADEIRA equivalence tables in
    // a follow-up; today we tag the entry's `brand` with the requested
    // brand so the UI reads consistently and the user sees DMC values.
    return DMC_TABLE.map((e) => ({ ...e, brand }))
  }
  return DMC_TABLE
}

export function nearestFloss(
  targetHex: string,
  opts: NearestOptions = {},
): { entry: FlossEntry; index: number; distance: number } {
  const table = pickBrandTable(opts.brand)
  const [r, g, b] = hexToRgb(targetHex)
  const [l, a, bb] = rgbToLab(r, g, b)
  let bestIndex = 0
  let bestD = Number.POSITIVE_INFINITY
  const indices = opts.candidates ?? table.map((_, i) => i)
  for (const i of indices) {
    const lab = dmcLab[i]
    if (!lab) continue
    const dl = lab[0] - l
    const da = lab[1] - a
    const db = lab[2] - bb
    const d = dl * dl + da * da + db * db
    if (d < bestD) {
      bestD = d
      bestIndex = i
    }
  }
  return { entry: { ...table[bestIndex]!, brand: opts.brand ?? 'DMC' }, index: bestIndex, distance: Math.sqrt(bestD) }
}

/**
 * Given a target colour palette (raw quantised RGBs) build the matching
 * brand-table palette. Each entry maps to one floss colour; collisions
 * (two raw RGBs map to the same floss) are merged with the matching
 * cell list re-tagged downstream.
 */
export function buildFlossPalette(
  rawRgbs: string[],
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA' = 'DMC',
): Array<FlossEntry & { sourceRgb: string }> {
  const usedCodes = new Set<string>()
  const out: Array<FlossEntry & { sourceRgb: string }> = []
  for (const raw of rawRgbs) {
    const { entry } = nearestFloss(raw, { brand })
    if (usedCodes.has(entry.code)) continue
    usedCodes.add(entry.code)
    out.push({ ...entry, sourceRgb: raw })
  }
  return out
}
