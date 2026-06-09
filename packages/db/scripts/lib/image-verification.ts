/**
 * Image verification gate for Pipeline B (Fal img2img heroes).
 *
 * The gate compares a control image (the synthetic chart render — the
 * geometric truth) against a candidate image (the Fal img2img output) and
 * decides whether structure is preserved.
 *
 * Two complementary checks:
 *
 *   1. dHash distance — difference-hash on a 9x8 grayscale downsample.
 *      Robust to lighting changes / colour shifts but tracks global
 *      layout. Returns Hamming distance over 64 bits. Lower = more
 *      similar. The brief sets a 12-bit threshold; the worker tunes
 *      within (0, 18).
 *
 *   2. Cosine similarity on a 64-bin grayscale histogram — catches
 *      cases where dHash matches by coincidence but the overall tonal
 *      distribution diverged (e.g. Fal turned the cream fabric purple).
 *      Returns 0-1; higher = more similar. 0.85 minimum per the brief.
 *
 * Both must pass for a verdict of "preserved." Either side failing
 * triggers the retry at lower denoise; a second failure routes to
 * synthetic-fallback.
 *
 * Pure sharp — no other deps. Returns numeric values; callers compose
 * the pass/fail decision so the threshold can be tuned per pattern type.
 */

import sharp from 'sharp'

export interface VerificationResult {
  /** 0-64 Hamming distance on dHash. Lower = more similar. */
  dHashDistance: number
  /** 0-1 cosine similarity on grayscale histogram. Higher = more similar. */
  histogramCosine: number
  /** True when both metrics pass the supplied thresholds. */
  passed: boolean
  /** Free-form summary used for logging + status reasons. */
  summary: string
}

export interface VerificationThresholds {
  /** Max dHash Hamming distance to count as pass. Default 12. */
  maxDHashDistance?: number
  /** Min histogram cosine to count as pass. Default 0.85. */
  minHistogramCosine?: number
}

const HASH_W = 9
const HASH_H = 8
const HIST_BUCKETS = 64

async function loadGrayscaleHash(input: Buffer): Promise<Buffer> {
  return sharp(input).removeAlpha().grayscale().resize(HASH_W, HASH_H, { fit: 'fill' }).raw().toBuffer()
}

/**
 * Difference hash. Compare adjacent pixels in each row of a 9x8
 * grayscale image; bit = 1 if right > left. 8 rows * 8 comparisons =
 * 64-bit hash returned as a Uint8Array length 8.
 */
function dHash(grayBuf: Buffer): Uint8Array {
  const out = new Uint8Array(8)
  for (let y = 0; y < HASH_H; y++) {
    let byte = 0
    for (let x = 0; x < HASH_W - 1; x++) {
      const left = grayBuf[y * HASH_W + x]!
      const right = grayBuf[y * HASH_W + x + 1]!
      const bit = right > left ? 1 : 0
      byte = (byte << 1) | bit
    }
    out[y] = byte
  }
  return out
}

function hammingDistance(a: Uint8Array, b: Uint8Array): number {
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    let x = a[i]! ^ b[i]!
    while (x) {
      dist += x & 1
      x >>= 1
    }
  }
  return dist
}

async function grayscaleHistogram(input: Buffer): Promise<Float32Array> {
  const buf = await sharp(input)
    .removeAlpha()
    .grayscale()
    .resize(64, 64, { fit: 'fill' })
    .raw()
    .toBuffer()
  const hist = new Float32Array(HIST_BUCKETS)
  for (const v of buf) {
    const bucket = Math.min(HIST_BUCKETS - 1, (v * HIST_BUCKETS) >> 8)
    hist[bucket]!++
  }
  // L2-normalise so vectors of different total counts compare cleanly.
  let sumSq = 0
  for (const v of hist) sumSq += v * v
  const norm = Math.sqrt(sumSq) || 1
  for (let i = 0; i < hist.length; i++) hist[i]! /= norm
  return hist
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i]! * b[i]!
  return Math.max(0, Math.min(1, dot))
}

export async function verifyAgainstControl(
  controlPng: Buffer,
  candidatePng: Buffer,
  thresholds: VerificationThresholds = {},
): Promise<VerificationResult> {
  const maxD = thresholds.maxDHashDistance ?? 12
  const minC = thresholds.minHistogramCosine ?? 0.85

  const [controlGray, candidateGray] = await Promise.all([
    loadGrayscaleHash(controlPng),
    loadGrayscaleHash(candidatePng),
  ])
  const dDist = hammingDistance(dHash(controlGray), dHash(candidateGray))

  const [controlHist, candidateHist] = await Promise.all([
    grayscaleHistogram(controlPng),
    grayscaleHistogram(candidatePng),
  ])
  const hCos = cosineSimilarity(controlHist, candidateHist)

  const passed = dDist <= maxD && hCos >= minC
  const summary = `dHash=${dDist}/${maxD} histCos=${hCos.toFixed(3)}/${minC} → ${passed ? 'PASS' : 'FAIL'}`

  return { dHashDistance: dDist, histogramCosine: hCos, passed, summary }
}
