/**
 * Yarn-level crochet loop model.
 *
 * This is the REAL thing, not a drawn cord: each stitch is a continuous 3D yarn
 * centre-line that weaves — its link points dip BEHIND (−z) to pass through the
 * loops of the row below, while its head rides PROUD (+z). With a half-stitch
 * stagger row-to-row, one row's links sit at the next row's heads, so the rows
 * physically interlock (over/under). That weave is what the eye reads as knitted/
 * crocheted fabric; a centre-line with only a single arched hump (all the loom's
 * ThreadStroke primitive can do) cannot express it, which is why the earlier
 * cord/loop attempts read as rope or pebbles.
 *
 * The centre-line is then turned into spun yarn by spiralling a few plies around
 * it (a helix in a parallel-transported frame), and emitted as the same
 * `{ radiusMm, filaments[][][] }` 3D polylines the Blender backend already eats.
 */

import type { CrochetCell } from './loop'

export interface V3 {
  x: number
  y: number
  z: number
}

const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
const scale = (a: V3, s: number): V3 => ({ x: a.x * s, y: a.y * s, z: a.z * s })
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z
const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})
const len = (a: V3): number => Math.hypot(a.x, a.y, a.z)
const norm = (a: V3): V3 => {
  const l = len(a) || 1e-9
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}

function jitter(seed: number, i: number): number {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

/** Catmull-Rom smoothing of a 3D control polyline into a fine curve. */
export function smooth(ctrl: V3[], perSeg: number): V3[] {
  if (ctrl.length < 2) return ctrl.slice()
  const out: V3[] = []
  const pt = (i: number): V3 => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))]!
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = pt(i - 1)
    const p1 = pt(i)
    const p2 = pt(i + 1)
    const p3 = pt(i + 2)
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg
      const t2 = t * t
      const t3 = t2 * t
      const a = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)
      const b = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      const c = 0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
      out.push({ x: a, y: b, z: c })
    }
  }
  out.push(ctrl[ctrl.length - 1]!)
  return out
}

/**
 * The hdc-blo stitch centre-line for one cell, as a smooth 3D world-space curve
 * (mm). An arch that rides proud at the head and dips behind at the two link
 * points — the two top loops are a shallow notch in the crown. Slightly overshoots
 * the cell so neighbours bridge into a continuous row of yarn.
 */
export function hdcLoopCenterline(cell: CrochetCell): V3[] {
  const { center: c, rowDir: U, buildDir: Vb, widthMm: sw, heightMm: rh, yarnRadiusMm: yr } = cell
  const w = sw * 0.5
  const hh = rh * 0.5
  const jx = jitter(cell.seed, 1) * sw * 0.04
  const jy = jitter(cell.seed, 2) * rh * 0.03

  // local (lu in [-w..w], lv in [-hh..hh], lz in mm) -> world (x,y,z)
  const P = (luN: number, lvN: number, lzN: number): V3 => {
    const lu = luN * w + jx
    const lv = lvN * hh + jy
    return {
      x: c.x + U.x * lu + Vb.x * lv,
      y: c.y + U.y * lu + Vb.y * lv,
      z: lzN * yr,
    }
  }

  // Control points around the loop: behind at the links (−z), proud over the head
  // (+z), with a shallow notch between the two top loops.
  const ctrl: V3[] = [
    P(-1.06, -0.42, -1.7), // left link — tucks BEHIND (weaves through row below)
    P(-0.94, 0.06, -0.3),
    P(-0.74, 0.6, 0.95),
    P(-0.4, 0.98, 1.55), // left top loop (peak, proud)
    P(0.0, 0.78, 1.2), // notch between the two top loops
    P(0.4, 0.98, 1.55), // right top loop (peak, proud)
    P(0.74, 0.6, 0.95),
    P(0.94, 0.06, -0.3),
    P(1.06, -0.42, -1.7), // right link — BEHIND
  ]
  return smooth(ctrl, 8)
}

export interface YarnFilaments {
  radiusMm: number
  filaments: number[][][]
}

/**
 * Spiral `nPly` plies around a 3D centre-line (a helix in a parallel-transported
 * frame, so the frame never flips) → the spun-yarn filaments. `twistPerMm` sets
 * how tight the ply spiral is.
 */
export function pliedFilaments(center: V3[], bundleR: number, nPly: number, twistPerMm: number): YarnFilaments {
  const filRadius = (bundleR / Math.sqrt(nPly)) * 0.96
  const spread = Math.max(0, bundleR - filRadius)
  if (center.length < 2) return { radiusMm: filRadius, filaments: [] }

  // Tangents + arclength.
  const n = center.length
  const tan: V3[] = []
  const arc: number[] = [0]
  for (let i = 0; i < n; i++) {
    const a = center[Math.max(0, i)]!
    const b = center[Math.min(n - 1, i + 1)]!
    tan.push(norm(sub(b, a)))
    if (i > 0) arc.push(arc[i - 1]! + len(sub(center[i]!, center[i - 1]!)))
  }

  // Parallel-transported normal frame.
  const N1: V3[] = []
  const N2: V3[] = []
  let ref: V3 = Math.abs(tan[0]!.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  let prevN1 = norm(sub(ref, scale(tan[0]!, dot(ref, tan[0]!))))
  for (let i = 0; i < n; i++) {
    const T = tan[i]!
    let nrm = sub(prevN1, scale(T, dot(prevN1, T)))
    if (len(nrm) < 1e-6) {
      ref = Math.abs(T.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
      nrm = sub(ref, scale(T, dot(ref, T)))
    }
    const n1 = norm(nrm)
    const n2 = cross(T, n1)
    N1.push(n1)
    N2.push(n2)
    prevN1 = n1
  }

  const filaments: number[][][] = []
  for (let f = 0; f < nPly; f++) {
    const phase0 = (2 * Math.PI * f) / nPly
    const poly: number[][] = []
    for (let i = 0; i < n; i++) {
      const ph = arc[i]! * twistPerMm * 2 * Math.PI + phase0
      const off = add(scale(N1[i]!, Math.cos(ph) * spread), scale(N2[i]!, Math.sin(ph) * spread))
      const p = add(center[i]!, off)
      poly.push([p.x, p.y, p.z])
    }
    filaments.push(poly)
  }
  return { radiusMm: filRadius, filaments }
}

export interface YarnStroke {
  hex: string
  sheen: number
  radiusMm: number
  filaments: number[][][]
}

/** One hdc-blo stitch as spun-yarn filaments ready for the Blender scene. */
export function hdcYarnStroke(cell: CrochetCell, nPly = 3, twistPerMm = 0.22, sheen = 0.85): YarnStroke {
  const center = hdcLoopCenterline(cell)
  const { radiusMm, filaments } = pliedFilaments(center, cell.yarnRadiusMm * 0.9, nPly, twistPerMm)
  return { hex: cell.hex, sheen, radiusMm, filaments }
}
