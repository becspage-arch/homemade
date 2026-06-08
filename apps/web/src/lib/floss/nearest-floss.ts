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
import { ANCHOR_TABLE } from './anchor-table'
import { MADEIRA_TABLE } from './madeira-table'
import { brandEquivalent, colourDistance } from './equivalence-table'

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

const labCache = new Map<'DMC' | 'ANCHOR' | 'MADEIRA', [number, number, number][]>()

function labFor(brand: 'DMC' | 'ANCHOR' | 'MADEIRA'): [number, number, number][] {
  const cached = labCache.get(brand)
  if (cached) return cached
  const table = brand === 'DMC' ? DMC_TABLE : brand === 'ANCHOR' ? ANCHOR_TABLE : MADEIRA_TABLE
  const lab = table.map((entry) => {
    const [r, g, b] = hexToRgb(entry.rgb)
    return rgbToLab(r, g, b)
  })
  labCache.set(brand, lab)
  return lab
}

export function pickBrandTable(brand: 'DMC' | 'ANCHOR' | 'MADEIRA' | undefined): FlossEntry[] {
  if (brand === 'ANCHOR') return ANCHOR_TABLE
  if (brand === 'MADEIRA') return MADEIRA_TABLE
  return DMC_TABLE
}

export function nearestFloss(
  targetHex: string,
  opts: NearestOptions = {},
): { entry: FlossEntry; index: number; distance: number } {
  const brand = opts.brand ?? 'DMC'
  const table = pickBrandTable(brand)
  const lab = labFor(brand)
  const [r, g, b] = hexToRgb(targetHex)
  const [l, a, bb] = rgbToLab(r, g, b)
  let bestIndex = 0
  let bestD = Number.POSITIVE_INFINITY
  const indices = opts.candidates ?? table.map((_, i) => i)
  for (const i of indices) {
    const labEntry = lab[i]
    if (!labEntry) continue
    const dl = labEntry[0] - l
    const da = labEntry[1] - a
    const db = labEntry[2] - bb
    const d = dl * dl + da * da + db * db
    if (d < bestD) {
      bestD = d
      bestIndex = i
    }
  }
  return { entry: { ...table[bestIndex]!, brand }, index: bestIndex, distance: Math.sqrt(bestD) }
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

/**
 * One swap result per source palette entry. `exact` mirrors the
 * published cross-reference; `closestMatch` is true when the swap
 * fell back to perceptual nearest-by-RGB. `distance` is the CIELAB
 * ΔE between source and target — a value above ~5 is a visible
 * shift the Studio surfaces in the preview warning.
 */
export interface BrandSwapResult {
  source: FlossEntry
  target: FlossEntry
  closestMatch: boolean
  distance: number
}

/**
 * Build a per-entry brand swap proposal for an entire palette.
 * Returns one BrandSwapResult per source entry, in order. The
 * Studio renders this as a side-by-side preview so the user can
 * see exact-vs-closest before committing, and (in a follow-up
 * pass) pick a per-colour override if they prefer a different
 * target code than the auto-mapped one.
 */
export function swapBrand(
  palette: FlossEntry[],
  toBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
): BrandSwapResult[] {
  const results: BrandSwapResult[] = []
  for (const source of palette) {
    if (source.brand === toBrand) {
      results.push({ source, target: source, closestMatch: false, distance: 0 })
      continue
    }
    const lookup = brandEquivalent(source.brand, source.code, toBrand)
    if (!lookup) {
      // No published equivalent and no nearest-by-RGB possible (e.g. the
      // source brand isn't in any table yet). Fall back to a perceptual
      // nearest-by-RGB pick from the target table directly.
      const { entry, distance } = nearestFloss(source.rgb, { brand: toBrand })
      results.push({ source, target: entry, closestMatch: true, distance })
      continue
    }
    const targetTable = pickBrandTable(toBrand)
    const targetEntry = targetTable.find((e) => e.code === lookup.code)
    if (!targetEntry) {
      // The equivalence row pointed at a code that isn't in the embedded
      // target table yet. Fall back to nearest-by-RGB from source.rgb.
      const { entry, distance } = nearestFloss(source.rgb, { brand: toBrand })
      results.push({ source, target: entry, closestMatch: true, distance })
      continue
    }
    const distance = colourDistance(source.brand, source.code, toBrand, targetEntry.code) ?? 0
    results.push({
      source,
      target: {
        ...targetEntry,
        // Preserve strands settings from the source palette entry so the
        // floss-list skein estimate stays consistent across the swap.
        // The Studio writes these onto the target after applying any
        // per-colour overrides the user made in the preview.
      },
      closestMatch: !lookup.exact,
      distance,
    })
  }
  return results
}
