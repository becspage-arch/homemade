/**
 * FIDELITY GATE — the safeguard that makes shipping an AI-finished hero safe.
 *
 * The hero is a promise: "stitch this and you get THIS." The locked upscale pass
 * shouldn't move or recolour anything, but we must PROVE it per image rather than
 * trust it. This compares the AI-finished hero against the deterministic base
 * (the exact pattern) and fails if the design drifted:
 *   - structure: correlation of edge maps (did shapes/positions move?)
 *   - colour:    low-res per-cell colour delta (did colours shift?)
 *
 * A fail means: do not ship — re-run with a lower creativity (more faithful) or
 * fall back to the deterministic base. This first-pass check is deterministic and
 * free; a Claude Code vision session is the authoritative second opinion on
 * anything borderline.
 *
 *   cd apps/web && npx tsx scripts/loom-fidelity-gate.ts <base.png> <final.png>
 */
import sharp from 'sharp'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const STRUCT_MIN_DEFAULT = 0.45 // edge-map correlation floor
export const COLOUR_MAX_DEFAULT = 0.1 // mean per-cell colour delta ceiling

const BASE = process.argv[2]
const FINAL = process.argv[3]
const STRUCT_MIN = Number(process.argv[4] ?? STRUCT_MIN_DEFAULT)
const COLOUR_MAX = Number(process.argv[5] ?? COLOUR_MAX_DEFAULT)

async function gray(path: string, n: number): Promise<Float64Array> {
  const { data } = await sharp(resolve(process.cwd(), path))
    .resize(n, n, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const out = new Float64Array(n * n)
  for (let i = 0; i < n * n; i++) out[i] = data[i]! / 255
  return out
}

/** Gradient magnitude (Sobel-ish) — the structural signal, lighting-invariant. */
function edges(g: Float64Array, n: number): Float64Array {
  const e = new Float64Array(n * n)
  for (let y = 1; y < n - 1; y++) {
    for (let x = 1; x < n - 1; x++) {
      const i = y * n + x
      const gx = g[i + 1]! - g[i - 1]!
      const gy = g[i + n]! - g[i - n]!
      e[i] = Math.hypot(gx, gy)
    }
  }
  return e
}

function pearson(a: Float64Array, b: Float64Array): number {
  let ma = 0
  let mb = 0
  for (let i = 0; i < a.length; i++) {
    ma += a[i]!
    mb += b[i]!
  }
  ma /= a.length
  mb /= b.length
  let cov = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < a.length; i++) {
    const da = a[i]! - ma
    const db = b[i]! - mb
    cov += da * db
    va += da * da
    vb += db * db
  }
  return cov / (Math.sqrt(va * vb) || 1)
}

async function colourDelta(p1: string, p2: string, n: number): Promise<number> {
  const opts = { fit: 'fill' as const }
  const a = await sharp(resolve(process.cwd(), p1)).resize(n, n, opts).removeAlpha().raw().toBuffer()
  const b = await sharp(resolve(process.cwd(), p2)).resize(n, n, opts).removeAlpha().raw().toBuffer()
  let sum = 0
  for (let i = 0; i < n * n * 3; i++) sum += Math.abs(a[i]! - b[i]!) / 255
  return sum / (n * n * 3)
}

export interface FidelityVerdict {
  base: string
  final: string
  structureScore: number
  colourDelta: number
  thresholds: { STRUCT_MIN: number; COLOUR_MAX: number }
  pass: boolean
}

/**
 * Reusable fidelity check — the same maths the CLI runs, returned as a verdict
 * object so `renderHero` can gate in-process (no subprocess, no exit code).
 */
export async function fidelityGate(
  basePath: string,
  finalPath: string,
  thresholds: { structMin?: number; colourMax?: number } = {},
): Promise<FidelityVerdict> {
  const structMin = thresholds.structMin ?? STRUCT_MIN_DEFAULT
  const colourMax = thresholds.colourMax ?? COLOUR_MAX_DEFAULT
  const N = 256
  const [ba, fi] = await Promise.all([gray(basePath, N), gray(finalPath, N)])
  const structure = pearson(edges(ba, N), edges(fi, N))
  const colour = await colourDelta(basePath, finalPath, 48)
  return {
    base: basePath,
    final: finalPath,
    structureScore: +structure.toFixed(3),
    colourDelta: +colour.toFixed(3),
    thresholds: { STRUCT_MIN: structMin, COLOUR_MAX: colourMax },
    pass: structure >= structMin && colour <= colourMax,
  }
}

async function main(): Promise<void> {
  if (!BASE || !FINAL) {
    console.error('usage: loom-fidelity-gate.ts <base.png> <final.png>')
    process.exit(2)
  }
  const verdict = await fidelityGate(BASE, FINAL, { structMin: STRUCT_MIN, colourMax: COLOUR_MAX })
  console.log(JSON.stringify(verdict, null, 2))
  process.exit(verdict.pass ? 0 : 1)
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  main().catch((e) => {
    console.error('[gate] FAILED:', e instanceof Error ? e.message : String(e))
    process.exit(2)
  })
}
