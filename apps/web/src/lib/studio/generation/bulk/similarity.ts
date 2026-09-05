/**
 * Near-duplicate detection for generated catalogue artwork — pure, dependency-light
 * fingerprinting the publish path can run BEFORE a gem goes PUBLIC, and the offline
 * dedupe scan (`apps/web/scripts/xs-dedupe-scan.ts`) runs across the whole shelf.
 *
 * No `server-only`, no Prisma, no React: it takes a PNG Buffer and/or a PatternData
 * and returns numbers, so it is equally usable from a script, a job step and a test.
 *
 * Four independent signals, cheapest first:
 *   1. sha256 of the PNG bytes      — the same file republished.
 *   2. dHash-64 of the render       — the same picture (robust to re-encode/scale).
 *   3. dHash-256 of the render      — a finer grid, catches same picture at a
 *                                     different chart resolution / colour count.
 *   4. chart fingerprint            — the STITCHED artwork itself (24x24 mean-RGB
 *                                     blocks) plus the floss palette, so two rows
 *                                     converted from one source image still match
 *                                     even when the thumbnail crop differs.
 *
 * The verdict is deliberately BINARY. A "probably fine, have a look" tier just moves
 * the judgement call somewhere else; the thresholds below are set where a human
 * looking at the pair sheet says "that is the same design" (see CALIBRATION).
 */

import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { PatternData } from '@homemade/db'

// ───────────────────────────── image fingerprints ─────────────────────────────

/** Perceptual hashes of one rendered thumbnail. Hex strings, low bit first. */
export interface ImageFingerprint {
  /** 64-bit dHash (9x8 greyscale) — 16 hex chars. */
  dhash64: string
  /** 256-bit dHash (17x16 greyscale) — 64 hex chars. */
  dhash256: string
}

/** Difference hash at an arbitrary grid: (cols+1) x rows greyscale, row-wise deltas. */
async function dhash(png: Buffer, cols: number, rows: number): Promise<string> {
  const raw = await sharp(png)
    .flatten({ background: '#ffffff' })
    .greyscale()
    .resize(cols + 1, rows, { fit: 'fill', kernel: 'lanczos3' })
    .raw()
    .toBuffer()
  const bits: number[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * (cols + 1) + x
      bits.push(raw[i]! < raw[i + 1]! ? 1 : 0)
    }
  }
  let hex = ''
  for (let i = 0; i < bits.length; i += 4) {
    hex += ((bits[i]! << 3) | (bits[i + 1]! << 2) | (bits[i + 2]! << 1) | bits[i + 3]!).toString(16)
  }
  return hex
}

/** Both perceptual hashes for one PNG. */
export async function imageHash(png: Buffer): Promise<ImageFingerprint> {
  const [dhash64, dhash256] = await Promise.all([dhash(png, 8, 8), dhash(png, 16, 16)])
  return { dhash64, dhash256 }
}

const POPCOUNT = Array.from({ length: 16 }, (_, n) => ((n >> 0) & 1) + ((n >> 1) & 1) + ((n >> 2) & 1) + ((n >> 3) & 1))

/** Hamming distance between two equal-length hex strings, in bits. */
export function hammingHex(a: string, b: string): number {
  if (a.length !== b.length) throw new Error(`hammingHex: length mismatch ${a.length} vs ${b.length}`)
  let d = 0
  for (let i = 0; i < a.length; i++) {
    d += POPCOUNT[(parseInt(a[i]!, 16) ^ parseInt(b[i]!, 16)) & 0xf]!
  }
  return d
}

/** Hex sha256 of a buffer — the exact-file check. */
export function sha256Hex(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex')
}

// ───────────────────────────── chart fingerprints ─────────────────────────────

/** The stitched chart reduced to a comparable shape. */
export interface ChartFingerprint {
  /** 24x24 mean-RGB blocks, hex-encoded (3456 chars). */
  grid: string
  /** Sorted, de-duplicated floss codes. */
  palette: string[]
}

/** Fixed block resolution of the chart fingerprint. */
export const CHART_BLOCKS = 24

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/**
 * Downsample the stitched cell grid to a fixed 24x24 mean-RGB block image. Bare
 * fabric cells count as the fabric colour, so the negative space of the design is
 * part of the signature (a wreath and a full-bleed scene never collide).
 *
 * Resolution-independent by construction: a 120x120 and a 200x200 chart of the same
 * artwork reduce to near-identical blocks.
 */
export function chartFingerprint(data: PatternData): ChartFingerprint {
  const { width, height, cells } = data.grid
  const n = CHART_BLOCKS
  const fabric = hexToRgb(data.fabric?.colourRgb ?? '#F5EBD8')
  const rgbOf = new Map<string, [number, number, number]>()
  for (const p of data.palette) rgbOf.set(p.symbol, hexToRgb(p.rgb))

  // Cells per block along each axis (blocks are as even as the grid allows).
  const colsIn = new Array<number>(n).fill(0)
  for (let x = 0; x < width; x++) colsIn[Math.min(n - 1, Math.floor((x * n) / width))]!++
  const rowsIn = new Array<number>(n).fill(0)
  for (let y = 0; y < height; y++) rowsIn[Math.min(n - 1, Math.floor((y * n) / height))]!++

  // Start every block at the fabric colour, then add each stitched cell's delta —
  // O(stitched cells) instead of O(grid).
  const sum = new Float64Array(n * n * 3)
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const count = colsIn[bx]! * rowsIn[by]!
      const o = (by * n + bx) * 3
      sum[o] = fabric[0] * count
      sum[o + 1] = fabric[1] * count
      sum[o + 2] = fabric[2] * count
    }
  }
  for (const c of cells) {
    const rgb = rgbOf.get(c.s)
    if (!rgb) continue
    const bx = Math.min(n - 1, Math.floor((c.x * n) / width))
    const by = Math.min(n - 1, Math.floor((c.y * n) / height))
    const o = (by * n + bx) * 3
    sum[o] = sum[o]! + (rgb[0] - fabric[0])
    sum[o + 1] = sum[o + 1]! + (rgb[1] - fabric[1])
    sum[o + 2] = sum[o + 2]! + (rgb[2] - fabric[2])
  }

  const out = Buffer.allocUnsafe(n * n * 3)
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const count = Math.max(1, colsIn[bx]! * rowsIn[by]!)
      const o = (by * n + bx) * 3
      out[o] = Math.max(0, Math.min(255, Math.round(sum[o]! / count)))
      out[o + 1] = Math.max(0, Math.min(255, Math.round(sum[o + 1]! / count)))
      out[o + 2] = Math.max(0, Math.min(255, Math.round(sum[o + 2]! / count)))
    }
  }
  const palette = [...new Set(data.palette.map((p) => p.code))].sort()
  return { grid: out.toString('hex'), palette }
}

/** Mean absolute per-channel difference of two chart fingerprints, 0..1. */
export function chartDistance(a: ChartFingerprint, b: ChartFingerprint): number {
  const ga = Buffer.from(a.grid, 'hex')
  const gb = Buffer.from(b.grid, 'hex')
  if (ga.length !== gb.length) throw new Error('chartDistance: fingerprint length mismatch')
  let total = 0
  for (let i = 0; i < ga.length; i++) total += Math.abs(ga[i]! - gb[i]!)
  return total / (ga.length * 255)
}

/** Jaccard overlap of two floss palettes, 0..1. */
export function paletteJaccard(a: ChartFingerprint, b: ChartFingerprint): number {
  const sa = new Set(a.palette)
  const sb = new Set(b.palette)
  if (sa.size === 0 && sb.size === 0) return 1
  let inter = 0
  for (const c of sa) if (sb.has(c)) inter++
  return inter / (sa.size + sb.size - inter)
}

// ───────────────────────────────── the verdict ─────────────────────────────────

/**
 * CALIBRATION — measured on the September 2026 full-catalogue scan of the 1,153 PUBLIC
 * cross-stitch patterns (`scripts/xs-dedupe-scan.ts`, 664,128 pairs), by building contact
 * sheets of the pairs sitting either side of each boundary and LOOKING at them.
 *
 * Two measurements bracket every threshold:
 *  · the DUPLICATE side — the same thumbnail re-rendered (rescaled 0.82x, re-saturated)
 *    and the same chart re-converted at 0.75x / 0.55x grid resolution;
 *  · the DISTINCT side — the closest pairs in the catalogue that a look says are
 *    different designs. This shelf is stylistically repetitive on purpose (172
 *    landscapes, 131 monochrome), so that floor is low and the thresholds sit under it.
 *
 * The catalogue's renders are bbox-cropped beauty charts on near-white fabric, which
 * makes the coarse 8x8 dHash almost useless: the closest genuinely-different pair in
 * the whole catalogue is 3 bits apart (two different autumn woodlands), while a mere
 * rescale of one image moves it 5. T1 is therefore set BELOW that floor — it is a fast
 * "this is literally the same picture" guard, and the finer hashes do the real work.
 */

/**
 * dHash-64 hamming. Different designs bottom out at 3 in this catalogue, so anything
 * at or under 2 is the same picture. Deliberately below the noise floor of the metric.
 */
export const T1_DHASH64 = 2
/**
 * dHash-256 hamming. A re-render of the same image moves it at most 16; the closest
 * genuinely-different pair (a poppy field vs a lavender field) sits at 36. 30 keeps a
 * clear margin on both sides and catches the word-art pieces that share one template.
 */
export const T2_DHASH256 = 30
/**
 * Chart-block mean RGB distance. The same artwork re-converted at 0.55x grid scores up
 * to 0.055; every pair in the catalogue under 0.07 (with the palette rule below) is the
 * same design on inspection — two hatching chicks, two pop-art buns, the rainbow-heart
 * quote template. The first genuinely-different pair above it is a cockapoo vs a French
 * bulldog at 0.080, so this is the honest ceiling: pushed higher the metric stops
 * separating "same design" from "same shelf".
 */
export const T3_CHART = 0.07
/**
 * ...and only when the floss palettes overlap this much. This is what keeps the sparse
 * word-art and single-subject charts apart: the false candidates under 0.07 all sit at
 * a palette overlap of 0.39 or less, the true duplicates at 0.53 to 1.00.
 */
export const T4_PALETTE = 0.5

/** Everything the verdict needs about one pattern. */
export interface PatternFingerprint extends ImageFingerprint {
  /** sha256 of the thumbnail PNG bytes. */
  sha256: string
  chart: ChartFingerprint
}

export interface DuplicateVerdict {
  duplicate: boolean
  /** Human-readable reason — the rule that fired, with its measurement. */
  reason: string
}

/**
 * Binary near-duplicate verdict between two patterns. Cheapest rule first; the first
 * rule that fires wins and names itself.
 */
export function nearDuplicateVerdict(a: PatternFingerprint, b: PatternFingerprint): DuplicateVerdict {
  if (a.sha256 === b.sha256) return { duplicate: true, reason: 'identical thumbnail file (sha256)' }

  const d64 = hammingHex(a.dhash64, b.dhash64)
  if (d64 <= T1_DHASH64) return { duplicate: true, reason: `same image (dhash64 hamming ${d64} ≤ ${T1_DHASH64})` }

  const d256 = hammingHex(a.dhash256, b.dhash256)
  if (d256 <= T2_DHASH256) return { duplicate: true, reason: `same image (dhash256 hamming ${d256} ≤ ${T2_DHASH256})` }

  const cd = chartDistance(a.chart, b.chart)
  const pj = paletteJaccard(a.chart, b.chart)
  if (cd <= T3_CHART && pj >= T4_PALETTE) {
    return {
      duplicate: true,
      reason: `same chart (block distance ${cd.toFixed(4)} ≤ ${T3_CHART}, palette overlap ${pj.toFixed(2)} ≥ ${T4_PALETTE})`,
    }
  }
  return { duplicate: false, reason: `distinct (dhash64 ${d64}, dhash256 ${d256}, chart ${cd.toFixed(4)}, palette ${pj.toFixed(2)})` }
}
