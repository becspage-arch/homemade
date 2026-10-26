/**
 * THE CUTE MEASURER (cute-engine plan step 3, 26 Oct 2026).
 *
 * Reads, off a COMPILED toy, every quantity the cute rules (cuteRules.ts,
 * crochet-bar/CUTE-RULES.md) are written in, the way the rules' photos were
 * measured: a FRONT VIEW of the settled geometry, every length divided by the
 * toy's own head width W, head height H or toy height T.
 *
 *  - The front view: the program's camera yaw (`yawDeg`, the direction the
 *    faces are turned to by `faceDir`) gives the toy's front f = (sin yaw,
 *    cos yaw, 0) and its across axis u = (cos yaw, -sin yaw, 0); a point is
 *    seen at (u, z), its depth toward the lens is w. Extents are of the strand
 *    centre-lines plus a yarn radius each side (the yarn's own surface).
 *  - A front-view SILHOUETTE rasterised from the placed strands (parts and
 *    hair: every segment splatted as a yarn-thick capsule, holes filled) at
 *    the photos' own scale (~310 px across the head), traced, and read with
 *    the same corner / straight-run code as measure_cute.py (rules 13, 33, 34).
 *  - A CENTRE LINE fitted along a tube or bent piece: the strand is worked
 *    round by round, so a window of one round's share of the strand is one
 *    ring, its centroid a point on the axis and its spread the ring's radius
 *    (rules 24, 25, 26, 27, 28, 29, 31).
 *  - EAR RIM THICKNESS seen from the front (rule 21; extends earPiece.ts
 *    `earMetrics`, which measures a cup's opening in its own frame): a depth
 *    map of the ear, the opening = fabric recessed behind the plane of its
 *    outline, the rim = fabric between the outline and the opening, its
 *    thickness read round the opening.
 *  - From the PROGRAM: the asymmetry count (36), the curl-size spread off the
 *    hair patches' settled loops (37).
 *  - COLOUR (10, 14, 15, 16) is a PROXY: the part / prop / embroidery hex in
 *    CIE Lab (D65, as the photos were read). The render's light moves L* by
 *    10-20, so these never gate a build; a colour read off the render is
 *    later work.
 *
 * Pure: reads the compiled toy, changes nothing (no geometry hash moves).
 */

import type { V3 } from '../yarnLoop'
import type { CompiledComposition, CompositionProgram, PlacedPart } from './composition'
import type { CuteQuantity, ToyFamily } from './cuteRules'
import { loopBodies } from './hairPatch'

/** Where a measured value came from. */
export type CuteSource =
  /** Read off the settled geometry. */
  | 'geometry'
  /** Read off the program (placements, specs). */
  | 'program'
  /** A colour proxy (hex in Lab), not the render's colour. */
  | 'proxy'

export interface CuteMeasurement {
  family: ToyFamily | null
  /** How the family was found. */
  familyFrom: 'program' | 'inferred' | 'none'
  values: Partial<Record<CuteQuantity, number>>
  source: Partial<Record<CuteQuantity, CuteSource>>
  /** Quantities this toy has nothing to measure for (no horns, no hair...). */
  absent: Partial<Record<CuteQuantity, string>>
  /** The normalisers, mm. */
  W: number
  H: number
  T: number
  /** Short notes on how a value was read (for the report). */
  notes: string[]
}

// ─── small vector / colour helpers ─────────────────────────────────────────

interface P3 { u: number; z: number; w: number }

const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z
const len3 = (a: V3): number => Math.hypot(a.x, a.y, a.z)

/** sRGB hex -> CIE Lab (D65), the space the photos' colours were read in. */
export function hexToLab(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  const [r, g, b] = lin as [number, number, number]
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
  const f = (t: number): number => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  const fx = f(X), fy = f(Y), fz = f(Z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** The front view of a program: across (u), toward the lens (f). */
export function frontFrame(p: Pick<CompositionProgram, 'yawDeg'>): { u: V3; f: V3 } {
  const t = ((p.yawDeg ?? 0) * Math.PI) / 180
  return { u: { x: Math.cos(t), y: -Math.sin(t), z: 0 }, f: { x: Math.sin(t), y: Math.cos(t), z: 0 } }
}

// ─── the front-view raster ─────────────────────────────────────────────────

/** A boolean (and optionally depth) raster of the front view. */
export class FrontRaster {
  readonly nx: number
  readonly nz: number
  readonly mask: Uint8Array
  readonly depth: Float32Array
  constructor(readonly u0: number, readonly z0: number, readonly cell: number, u1: number, z1: number) {
    this.nx = Math.max(1, Math.ceil((u1 - u0) / cell) + 1)
    this.nz = Math.max(1, Math.ceil((z1 - z0) / cell) + 1)
    this.mask = new Uint8Array(this.nx * this.nz)
    this.depth = new Float32Array(this.nx * this.nz).fill(-Infinity)
  }
  /** A disc of radius r (mm) at (u, z), depth w (front-most kept). */
  disc(u: number, z: number, r: number, w: number): void {
    const c = this.cell
    const i0 = Math.max(0, Math.floor((u - r - this.u0) / c)), i1 = Math.min(this.nx - 1, Math.ceil((u + r - this.u0) / c))
    const j0 = Math.max(0, Math.floor((z - r - this.z0) / c)), j1 = Math.min(this.nz - 1, Math.ceil((z + r - this.z0) / c))
    const r2 = r * r
    for (let j = j0; j <= j1; j++) {
      const dz = this.z0 + j * c - z
      for (let i = i0; i <= i1; i++) {
        const du = this.u0 + i * c - u
        if (du * du + dz * dz > r2) continue
        const k = j * this.nx + i
        this.mask[k] = 1
        if (w > this.depth[k]!) this.depth[k] = w
      }
    }
  }
  /** A yarn-thick capsule along a polyline (consecutive points joined). */
  polyline(pts: P3[], r: number): void {
    const step = Math.max(this.cell * 0.6, r * 0.5)
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!
      this.disc(a.u, a.z, r, a.w)
      const b = pts[i + 1]
      if (!b) continue
      const d = Math.hypot(b.u - a.u, b.z - a.z)
      // A jump longer than a few yarn diameters is a break in the strand's
      // order (a separately sewn run), not yarn: do not bridge it.
      if (d > r * 8) continue
      const n = Math.floor(d / step)
      for (let s = 1; s < n; s++) {
        const t = s / n
        this.disc(a.u + (b.u - a.u) * t, a.z + (b.z - a.z) * t, r, a.w + (b.w - a.w) * t)
      }
    }
  }
  at(i: number, j: number): number {
    return i < 0 || j < 0 || i >= this.nx || j >= this.nz ? 0 : this.mask[j * this.nx + i]!
  }
  /** Fill every enclosed hole (background not reachable from the border). */
  fillHoles(): void {
    const { nx, nz, mask } = this
    const seen = new Uint8Array(nx * nz)
    const stack: number[] = []
    for (let i = 0; i < nx; i++) { stack.push(i, (nz - 1) * nx + i) }
    for (let j = 0; j < nz; j++) { stack.push(j * nx, j * nx + nx - 1) }
    while (stack.length) {
      const k = stack.pop()!
      if (seen[k] || mask[k]) continue
      seen[k] = 1
      const i = k % nx, j = (k - i) / nx
      if (i > 0) stack.push(k - 1)
      if (i < nx - 1) stack.push(k + 1)
      if (j > 0) stack.push(k - nx)
      if (j < nz - 1) stack.push(k + nx)
    }
    for (let k = 0; k < nx * nz; k++) if (!seen[k] && !mask[k]) mask[k] = 1
  }
  /** The occupied span of row z (mm), or null. */
  rowSpan(z: number): [number, number] | null {
    const j = Math.round((z - this.z0) / this.cell)
    if (j < 0 || j >= this.nz) return null
    let lo = -1, hi = -1
    for (let i = 0; i < this.nx; i++) if (this.mask[j * this.nx + i]) { if (lo < 0) lo = i; hi = i }
    return lo < 0 ? null : [this.u0 + lo * this.cell, this.u0 + hi * this.cell]
  }
  /** The outer boundary of the largest blob, traced (Moore neighbour), in
   *  raster cells, anticlockwise or clockwise (the caller normalises). */
  outline(): [number, number][] {
    const { nx, nz } = this
    // Keep only the largest 8-connected component.
    const lab = new Int32Array(nx * nz).fill(-1)
    let best = -1, bestN = 0, start = -1
    let id = 0
    for (let k0 = 0; k0 < nx * nz; k0++) {
      if (!this.mask[k0] || lab[k0]! >= 0) continue
      const stack = [k0]
      lab[k0] = id
      let n = 0, first = k0
      while (stack.length) {
        const k = stack.pop()!
        n++
        if (k < first) first = k
        const i = k % nx, j = (k - i) / nx
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const ii = i + di, jj = j + dj
          if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue
          const kk = jj * nx + ii
          if (this.mask[kk] && lab[kk]! < 0) { lab[kk] = id; stack.push(kk) }
        }
      }
      if (n > bestN) { bestN = n; best = id; start = first }
      id++
    }
    if (start < 0) return []
    const inside = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < nx && j < nz && lab[j * nx + i] === best
    // Moore tracing from the first cell in scan order (its left is empty).
    const dirs: [number, number][] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
    const si = start % nx, sj = (start - si) / nx
    const out: [number, number][] = [[si, sj]]
    let ci = si, cj = sj
    let back = 4 // we came from the left (west)
    for (let guard = 0; guard < nx * nz * 4; guard++) {
      let found = false
      for (let t = 1; t <= 8; t++) {
        const d = (back + t) % 8
        const ni = ci + dirs[d]![0], nj = cj + dirs[d]![1]
        if (inside(ni, nj)) {
          back = (d + 4) % 8
          ci = ni; cj = nj
          found = true
          break
        }
      }
      if (!found) break
      if (ci === si && cj === sj) break
      out.push([ci, cj])
    }
    return out
  }
}

/**
 * Sharp convex corners and the longest straight outline run, ported from
 * measure_cute.py `softness()`: the contour smoothed by a 5-point box, a turn
 * of more than 70 deg over 0.04 W either side is a corner (runs of corner
 * points merge), a straight run stays within 0.012 W of its chord. Only the
 * part of the contour with z >= zLo (the head and what is on it) counts.
 * `headWpx` is the head width in raster cells.
 */
export function outlineSoftness(contour: [number, number][], headWpx: number, keepRow: (j: number) => boolean): { sharpCorners: number; straightRunToW: number; corners: [number, number][] } {
  const n = contour.length
  if (n < 20) return { sharpCorners: 0, straightRunToW: 0, corners: [] }
  const k = 5
  const c: [number, number][] = contour.map((_, i) => {
    let sx = 0, sy = 0
    for (let d = -2; d <= 2; d++) { const q = contour[(i + d + n) % n]!; sx += q[0]; sy += q[1] }
    return [sx / k, sy / k]
  })
  const keep = c.map((_, i) => keepRow(contour[i]![1]))
  const w = Math.max(3, Math.floor(0.04 * headWpx))
  const ang = c.map((p, i) => {
    const a = c[(i - w + n) % n]!, b = c[(i + w) % n]!
    const v1x = p[0] - a[0], v1y = p[1] - a[1], v2x = b[0] - p[0], v2y = b[1] - p[1]
    return (Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y) * 180) / Math.PI
  })
  const sgn = Math.sign(ang.reduce((s, a) => s + a, 0)) || 1
  const idx: number[] = []
  for (let i = 0; i < n; i++) if (ang[i]! * sgn > 70 && keep[i]) idx.push(i)
  const groups: number[][] = []
  for (const i of idx) {
    const g = groups[groups.length - 1]
    if (g && i - g[g.length - 1]! <= w) g.push(i)
    else groups.push([i])
  }
  // A corner straddling the contour's start is one corner, not two.
  if (groups.length > 1 && groups[0]![0]! + n - groups[groups.length - 1]!.at(-1)! <= w) {
    groups[0] = [...groups.pop()!.map((i) => i - n), ...groups[0]!]
  }
  const corners: [number, number][] = groups.map((g) => c[(g[Math.floor(g.length / 2)]! + n) % n]!)
  // The straight runs.
  const tol = 0.012 * headWpx
  const step = Math.max(1, Math.floor(0.01 * headWpx))
  const minRun = Math.floor(0.05 * headWpx)
  let best = 0
  for (let i = 0; i < n; i += step) {
    if (!keep[i]) continue
    let j = i + minRun
    const p0 = c[i]!
    while (j < i + n && keep[j % n]) {
      const pe = c[j % n]!
      const dx = pe[0] - p0[0], dy = pe[1] - p0[1]
      const L = Math.hypot(dx, dy)
      let bad = false
      if (L >= 1) {
        for (let m = i; m <= j; m++) {
          const q = c[m % n]!
          if (Math.abs(dx * (q[1] - p0[1]) - dy * (q[0] - p0[0])) / L > tol) { bad = true; break }
        }
      }
      if (bad) break
      j += step
    }
    const e = c[(j - step + n) % n]!
    const run = Math.hypot(e[0] - p0[0], e[1] - p0[1])
    if (run > best) best = run
  }
  return { sharpCorners: corners.length, straightRunToW: best / headWpx, corners }
}

// ─── the fitted centre line ────────────────────────────────────────────────

export interface CentreLine {
  /** Ring centroids, base (the end sewn on) to tip, world mm. */
  pts: V3[]
  /** Each ring's mean centre-line radius (mm). */
  radius: number[]
  /** Each ring's strand points (world). */
  rings: V3[][]
  /** Arc length from the base to each point (mm). */
  s: number[]
}

/**
 * Fit the centre line of a piece worked in the round: the strand runs round
 * by round, so the window of strand points that is round k's share of the
 * stitches is one ring. `ctrl` is the strand (world), `rounds` the stitch
 * counts in working order. The end nearest `baseNear` is the base.
 */
export function fitCentreLine(ctrl: V3[], rounds: number[], baseNear: V3): CentreLine | null {
  const total = rounds.reduce((a, b) => a + b, 0)
  if (ctrl.length < 12 || total <= 0 || rounds.length < 3) return null
  const pts: V3[] = []
  const radius: number[] = []
  const rings: V3[][] = []
  let cum = 0
  for (const st of rounds) {
    const i0 = Math.floor((cum / total) * ctrl.length)
    cum += st
    const i1 = Math.max(i0 + 1, Math.floor((cum / total) * ctrl.length))
    let x = 0, y = 0, z = 0
    for (let i = i0; i < i1; i++) { x += ctrl[i]!.x; y += ctrl[i]!.y; z += ctrl[i]!.z }
    const m = i1 - i0
    const c = { x: x / m, y: y / m, z: z / m }
    let r = 0
    for (let i = i0; i < i1; i++) r += Math.hypot(ctrl[i]!.x - c.x, ctrl[i]!.y - c.y, ctrl[i]!.z - c.z)
    pts.push(c)
    radius.push(r / m)
    rings.push(ctrl.slice(i0, i1))
  }
  const d0 = len3({ x: pts[0]!.x - baseNear.x, y: pts[0]!.y - baseNear.y, z: pts[0]!.z - baseNear.z })
  const d1 = len3({ x: pts[pts.length - 1]!.x - baseNear.x, y: pts[pts.length - 1]!.y - baseNear.y, z: pts[pts.length - 1]!.z - baseNear.z })
  if (d1 < d0) { pts.reverse(); radius.reverse(); rings.reverse() }
  const s = [0]
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1]! + len3({ x: pts[i]!.x - pts[i - 1]!.x, y: pts[i]!.y - pts[i - 1]!.y, z: pts[i]!.z - pts[i - 1]!.z }))
  return { pts, radius, rings, s }
}

/** The part of a centre line the lens sees beyond its parent: from the
 *  last point still inside the parent's front-view silhouette (`inside`) to
 *  the tip (the photos read a horn from where it leaves the head's outline).
 *  The whole line when it never enters, or when fewer than 3 points stay. */
export function clipCentreLine(cl: CentreLine, inside: (p: V3) => boolean): CentreLine {
  let k = -1
  for (let i = 0; i < cl.pts.length; i++) if (inside(cl.pts[i]!)) k = i
  if (k < 0 || cl.pts.length - k < 3) return cl
  const pts = cl.pts.slice(k), radius = cl.radius.slice(k), rings = cl.rings.slice(k)
  const s = [0]
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1]! + len3({ x: pts[i]!.x - pts[i - 1]!.x, y: pts[i]!.y - pts[i - 1]!.y, z: pts[i]!.z - pts[i - 1]!.z }))
  return { pts, radius, rings, s }
}

/** A value along the centre line at arc fraction t (linear). */
function alongAt(cl: CentreLine, vals: number[], t: number): number {
  const L = cl.s[cl.s.length - 1]!
  const target = t * L
  for (let i = 1; i < cl.s.length; i++) {
    if (cl.s[i]! >= target) {
      const a = cl.s[i - 1]!, b = cl.s[i]!
      const f = b > a ? (target - a) / (b - a) : 0
      return vals[i - 1]! + (vals[i]! - vals[i - 1]!) * f
    }
  }
  return vals[vals.length - 1]!
}

/** A centre line read in the front view: sagitta / chord, bend (base half to
 *  tip half, + = turning up), chord elevation, arc length (all as the photos
 *  read a horn: measure_cute.py `horn()`), and the settled thickness profile. */
export function centreLineShape(cl: CentreLine, proj: (p: V3) => P3, yr: number): { sagitta: number; bendDeg: number; elevationDeg: number; arcMm: number; taper: number; thickAt: (t: number) => number } {
  const p2 = cl.pts.map(proj)
  const base = p2[0]!, tip = p2[p2.length - 1]!
  const du = tip.u - base.u, dz = tip.z - base.z
  const chord = Math.hypot(du, dz) || 1
  let sag = 0
  for (const q of p2) sag = Math.max(sag, Math.abs(du * (q.z - base.z) - dz * (q.u - base.u)) / chord)
  // The mid point: half the 2-D arc length.
  const s2 = [0]
  for (let i = 1; i < p2.length; i++) s2.push(s2[i - 1]! + Math.hypot(p2[i]!.u - p2[i - 1]!.u, p2[i]!.z - p2[i - 1]!.z))
  const L2 = s2[s2.length - 1]!
  let mi = 0
  while (mi < s2.length - 1 && s2[mi]! < L2 / 2) mi++
  const mid = p2[mi]!
  const deg = (a: number): number => (a * 180) / Math.PI
  const a1 = deg(Math.atan2(mid.z - base.z, Math.abs(mid.u - base.u)))
  const a2 = deg(Math.atan2(tip.z - mid.z, Math.abs(tip.u - mid.u)))
  // Each ring's width AS SEEN: its strand's extent across the centre line's
  // front-view direction there, plus the yarn either side. A ring pointing
  // at the lens (no front-view direction) reads its widest extent.
  const thick = cl.rings.map((ring, i) => {
    const a = p2[Math.max(0, i - 1)]!, b = p2[Math.min(p2.length - 1, i + 1)]!
    let tu = b.u - a.u, tz = b.z - a.z
    const tl = Math.hypot(tu, tz)
    const q = ring.map(proj)
    if (tl < 1e-6 || tl < 0.25 * len3({ x: cl.pts[Math.min(p2.length - 1, i + 1)]!.x - cl.pts[Math.max(0, i - 1)]!.x, y: cl.pts[Math.min(p2.length - 1, i + 1)]!.y - cl.pts[Math.max(0, i - 1)]!.y, z: cl.pts[Math.min(p2.length - 1, i + 1)]!.z - cl.pts[Math.max(0, i - 1)]!.z })) {
      let best = 0
      for (const x of q) for (const y of q) best = Math.max(best, Math.hypot(x.u - y.u, x.z - y.z))
      return best + 2 * yr
    }
    tu /= tl; tz /= tl
    let lo = Infinity, hi = -Infinity
    for (const x of q) { const v = -tz * x.u + tu * x.z; if (v < lo) lo = v; if (v > hi) hi = v }
    return hi - lo + 2 * yr
  })
  const thickAt = (t: number): number => alongAt(cl, thick, t)
  return {
    sagitta: sag / chord,
    bendDeg: a2 - a1,
    elevationDeg: deg(Math.atan2(dz, Math.abs(du))),
    // The last ring's centroid is a ring radius and a yarn short of the tip.
    arcMm: L2 + yr + cl.radius[cl.radius.length - 1]!,
    taper: thickAt(0.85) / thickAt(0.15),
    thickAt,
  }
}

// ─── the ear rim ───────────────────────────────────────────────────────────

/**
 * The rim of an ear SEEN FROM THE FRONT (rule 21): thickest / thinnest rim
 * round the opening. A depth map of the ear (front-most yarn per cell); the
 * plane of its outline (a least-squares fit to the depth along the outline,
 * so a tilted cup is read in its own tilt); the OPENING = fabric recessed
 * behind that plane by more than max(1.5 yr, 15% of the deepest recess); the
 * RIM thickness at each of 36 bearings round the opening's centre = from the
 * opening's edge out to the outline. A uniform cup reads ~1; a folded,
 * pinched ear reads 2-4. Null when no opening shows from the front (a closed
 * or pressed-flat ear, or one seen edge-on).
 */
export function earRimRatio(pts: P3[], yr: number, cell: number): { ratio: number; openingFrac: number } | null {
  if (pts.length < 20) return null
  let u0 = Infinity, u1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (const p of pts) { u0 = Math.min(u0, p.u); u1 = Math.max(u1, p.u); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z) }
  const R = new FrontRaster(u0 - 2 * yr, z0 - 2 * yr, cell, u1 + 2 * yr, z1 + 2 * yr)
  R.polyline(pts, yr)
  const { nx, nz, mask, depth } = R
  // Outline cells (occupied, with an empty 4-neighbour), and the plane fit.
  const bu: number[] = [], bz: number[] = [], bw: number[] = []
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i
    if (!mask[k]) continue
    if (R.at(i - 1, j) && R.at(i + 1, j) && R.at(i, j - 1) && R.at(i, j + 1)) continue
    bu.push(i); bz.push(j); bw.push(depth[k]!)
  }
  if (bu.length < 8) return null
  const plane = fitPlane(bu, bz, bw)
  let maxRec = 0
  const rec = new Float32Array(nx * nz)
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i
    if (!mask[k]) continue
    rec[k] = plane(i, j) - depth[k]!
    if (rec[k]! > maxRec) maxRec = rec[k]!
  }
  const thr = Math.max(1.5 * yr, 0.15 * maxRec)
  if (maxRec < 2 * yr) return null
  // The largest 4-connected recessed blob that does not touch the outline.
  const hol = new Uint8Array(nx * nz)
  for (let k = 0; k < nx * nz; k++) if (mask[k] && rec[k]! > thr) hol[k] = 1
  const lab = new Int32Array(nx * nz).fill(-1)
  let bestId = -1, bestN = 0, id = 0
  for (let k0 = 0; k0 < nx * nz; k0++) {
    if (!hol[k0] || lab[k0]! >= 0) continue
    const st = [k0]
    lab[k0] = id
    let n = 0
    while (st.length) {
      const k = st.pop()!
      n++
      const i = k % nx, j = (k - i) / nx
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const ii = i + di, jj = j + dj
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue
        const kk = jj * nx + ii
        if (hol[kk] && lab[kk]! < 0) { lab[kk] = id; st.push(kk) }
      }
    }
    if (n > bestN) { bestN = n; bestId = id }
    id++
  }
  let area = 0
  for (let k = 0; k < nx * nz; k++) if (mask[k]) area++
  if (bestId < 0 || bestN < Math.max(6, area * 0.03)) return null
  let ci = 0, cj = 0
  for (let k = 0; k < nx * nz; k++) if (lab[k] === bestId) { const i = k % nx; ci += i; cj += (k - i) / nx }
  ci /= bestN; cj /= bestN
  const BINS = 36
  const th: number[] = []
  for (let b = 0; b < BINS; b++) {
    let acc = 0, cnt = 0
    for (const off of [-1 / 3, 0, 1 / 3]) {
      const a = ((b + 0.5 + off) / BINS) * 2 * Math.PI
      const dx = Math.cos(a), dy = Math.sin(a)
      let lastHole = -1, lastOcc = -1
      for (let r = 0; r < nx + nz; r += 0.5) {
        const i = Math.round(ci + dx * r), j = Math.round(cj + dy * r)
        if (i < 0 || j < 0 || i >= nx || j >= nz) break
        const k = j * nx + i
        if (lab[k] === bestId) lastHole = r
        if (mask[k]) lastOcc = r
      }
      if (lastHole >= 0 && lastOcc > lastHole) { acc += lastOcc - lastHole; cnt++ }
    }
    th.push(cnt ? (acc / cnt) * cell : NaN)
  }
  const sm = th.map((_, b) => {
    const v = [th[(b + BINS - 1) % BINS]!, th[b]!, th[(b + 1) % BINS]!].filter((x) => Number.isFinite(x))
    return v.length ? v.reduce((a, x) => a + x, 0) / v.length : NaN
  }).filter((x) => Number.isFinite(x))
  if (sm.length < BINS / 2) return null
  const hi = Math.max(...sm)
  const lo = Math.max(Math.min(...sm), yr)
  return { ratio: hi / lo, openingFrac: bestN / area }
}

function fitPlane(xs: number[], ys: number[], ws: number[]): (x: number, y: number) => number {
  // Least squares w = a x + b y + c.
  let sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0, sxw = 0, syw = 0, sw = 0
  const n = xs.length
  for (let i = 0; i < n; i++) {
    const x = xs[i]!, y = ys[i]!, w = ws[i]!
    sxx += x * x; sxy += x * y; syy += y * y; sx += x; sy += y; sxw += x * w; syw += y * w; sw += w
  }
  const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]]
  const B = [sxw, syw, sw]
  const det = (m: number[][]): number =>
    m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
    m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
    m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)
  const D = det(A)
  if (Math.abs(D) < 1e-9) { const mw = sw / n; return () => mw }
  const col = (c: number): number[][] => A.map((row, r) => row.map((v, k) => (k === c ? B[r]! : v)))
  const a = det(col(0)) / D, b = det(col(1)) / D, c = det(col(2)) / D
  return (x, y) => a * x + b * y + c
}

// ─── the family ────────────────────────────────────────────────────────────

/** Which family's ranges a toy is checked against: the program's own
 *  `cute.family`, else read from its pieces and how they are stacked. Null = not a figure (a ball, an
 *  egg, a wall hanging): no cute rules apply. */
export function inferToyFamily(p: CompositionProgram): { family: ToyFamily | null; from: CuteMeasurement['familyFrom'] } {
  if (p.cute?.family) return { family: p.cute.family, from: 'program' }
  const names = new Set(p.parts.map((x) => x.name))
  if (!names.has('head')) return { family: null, from: 'none' }
  // A doll stands: her body is stacked on her legs (an animal toy's body
  // sits on the table); dressed, she has a hair cap, a bodice or a skirt.
  const bodyOn = (p.parts.find((x) => x.name === 'body')?.place as { on?: string } | undefined)?.on ?? ''
  if (names.has('hair-cap') || names.has('bodice') || names.has('skirt') || /^leg-[lr]$/.test(bodyOn)) return { family: 'doll', from: 'inferred' }
  const has = (re: RegExp): boolean => [...names].some((n) => re.test(n))
  if (has(/^horn-[lr]$/) || (has(/^front-leg-[lr]$/) && has(/^back-leg-[lr]$/))) return { family: 'quadruped-seated', from: 'inferred' }
  if (has(/^arm-[lr]$/) || has(/^wing-[lr]$/) || has(/^leg-[lr]$/)) return { family: 'biped-animal', from: 'inferred' }
  return { family: null, from: 'none' }
}

// ─── the measurer ──────────────────────────────────────────────────────────

/** Hooks for a probe or a test to look at the rasters the measurer reads. */
export interface CuteDebug {
  silhouette?: (r: FrontRaster, contour: [number, number][], chinRow: number, corners: [number, number][]) => void
}

/** The silhouette's scale: cells across the head, as the photos (~310 px). */
const HEAD_PX = 310

/**
 * Measure every cute-rule quantity this toy has the pieces for. Never
 * throws for a missing piece: what it cannot measure goes in `absent`.
 */
export function measureCute(p: CompositionProgram, c: CompiledComposition, debug?: CuteDebug): CuteMeasurement {
  const { family, from } = inferToyFamily(p)
  const values: CuteMeasurement['values'] = {}
  const source: CuteMeasurement['source'] = {}
  const absent: CuteMeasurement['absent'] = {}
  const notes: string[] = []
  const out: CuteMeasurement = { family, familyFrom: from, values, source, absent, W: 0, H: 0, T: 0, notes }
  const head = c.placed.find((pp) => pp.part.name === 'head')
  if (!family || !head) return out
  const yr = c.yr
  const set = (q: CuteQuantity, v: number | null | undefined, s: CuteSource): void => {
    if (v == null || !Number.isFinite(v)) return
    values[q] = Math.round(v * 1000) / 1000
    source[q] = s
  }
  const miss = (q: CuteQuantity, why: string): void => { absent[q] = why }

  const F = frontFrame(p)
  const proj = (v: V3): P3 => ({ u: dot(v, F.u), z: v.z, w: dot(v, F.f) })
  const ext = (pts: V3[]): { u0: number; u1: number; z0: number; z1: number } => {
    let u0 = Infinity, u1 = -Infinity, z0 = Infinity, z1 = -Infinity
    for (const v of pts) { const q = dot(v, F.u); if (q < u0) u0 = q; if (q > u1) u1 = q; if (v.z < z0) z0 = v.z; if (v.z > z1) z1 = v.z }
    return { u0: u0 - yr, u1: u1 + yr, z0: z0 - yr, z1: z1 + yr }
  }
  const named = (re: RegExp): PlacedPart[] => c.placed.filter((pp) => re.test(pp.part.name))
  const one = (n: string): PlacedPart | undefined => c.placed.find((pp) => pp.part.name === n)
  const cloud = (pps: PlacedPart[]): V3[] => pps.flatMap((pp) => pp.ctrl)
  const centroid = (pts: V3[]): V3 => {
    let x = 0, y = 0, z = 0
    for (const v of pts) { x += v.x; y += v.y; z += v.z }
    return { x: x / pts.length, y: y / pts.length, z: z / pts.length }
  }

  const muzzle = one('muzzle')
  const ears = named(/^ear-[lr]$/)
  const horns = named(/^horn-[lr]$/)
  const frontLimbs = named(/^(front-leg|arm)-[lr]$/)
  const backLegs = named(/^back-leg-[lr]$/)
  const feet = named(/^leg-[lr]$/)
  const tail = one('tail')
  const hairCap = one('hair-cap')
  const torso = [one('body'), one('bodice')].filter((x): x is PlacedPart => !!x)

  // ── the normalisers ──
  const he = ext(head.ctrl)
  const W = he.u1 - he.u0
  const hairTop = Math.max(-Infinity, ...c.hair.map((h) => ext(h.ctrl).z1), hairCap ? ext(hairCap.ctrl).z1 : -Infinity)
  const top = Math.max(he.z1, hairTop)
  const chin = Math.min(he.z0, muzzle ? ext(muzzle.ctrl).z0 : Infinity)
  const H = top - chin
  let ground = Infinity
  for (const pp of c.placed) ground = Math.min(ground, pp.bounds.minz - yr)
  const T = top - ground
  out.W = W; out.H = H; out.T = T
  const headC = centroid(head.ctrl)
  const midU = dot(headC, F.u)

  // ── proportion ──
  set('headHeightShare', H / T, 'geometry')
  if (torso.length) {
    const te = ext(cloud([...torso, ...frontLimbs]))
    set('headToTorsoWidth', W / (te.u1 - te.u0), 'geometry')
  } else miss('headToTorsoWidth', 'no body')
  {
    const skip = new Set<PlacedPart>([head, ...ears, ...horns, ...(hairCap ? [hairCap] : [])])
    const below = c.placed.filter((pp) => !skip.has(pp)).flatMap((pp) => pp.ctrl).filter((v) => v.z < chin)
    if (below.length && ears.length) {
      const be = ext(below)
      const ee = ext(cloud([head, ...ears]))
      set('earSpanToWidest', (ee.u1 - ee.u0) / (be.u1 - be.u0), 'geometry')
    } else miss('earSpanToWidest', ears.length ? 'nothing below the chin' : 'no ears')
  }
  if (backLegs.length) { const b = ext(cloud(backLegs)); set('haunchToHead', (b.u1 - b.u0) / W, 'geometry') } else miss('haunchToHead', 'no seated back legs')

  // ── the eyes (safety-eye props, else embroidered eyes) ──
  interface Eye { u: number; z: number; halfU: number; halfZ: number; hex: string }
  const eyes: Eye[] = []
  for (const pr of c.props.filter((q) => /^eye-[lr]$/.test(q.name))) {
    const halfU = Math.sqrt(pr.axes.reduce((a, ax) => a + dot(ax, F.u) ** 2, 0))
    const halfZ = Math.sqrt(pr.axes.reduce((a, ax) => a + ax.z ** 2, 0))
    eyes.push({ u: dot(pr.centre, F.u), z: pr.centre.z, halfU, halfZ, hex: pr.hex })
  }
  if (!eyes.length) {
    for (const e of c.embroidery.filter((q) => /^eye-[lr]$/.test(q.name))) {
      const pts = e.strands.flat()
      if (!pts.length) continue
      const ee = ext(pts)
      eyes.push({ u: (ee.u0 + ee.u1) / 2, z: (ee.z0 + ee.z1) / 2, halfU: (ee.u1 - ee.u0) / 2 - yr + e.radiusMm, halfZ: (ee.z1 - ee.z0) / 2 - yr + e.radiusMm, hex: e.hex })
    }
  }
  eyes.sort((a, b) => a.u - b.u)
  const eyeL = eyes[0], eyeR = eyes[eyes.length - 1]
  const eyeZ = eyes.length ? eyes.reduce((a, e) => a + e.z, 0) / eyes.length : NaN
  if (eyes.length >= 2) {
    set('eyeSpacing', (eyeR!.u - eyeL!.u) / W, 'geometry')
    set('eyeHeightFromChin', (eyeZ - chin) / H, 'geometry')
    set('eyeSize', (eyes.reduce((a, e) => a + 2 * e.halfU, 0) / eyes.length) / W, 'geometry')
    set('headTiltDeg', Math.abs((Math.atan2(eyeR!.z - eyeL!.z, eyeR!.u - eyeL!.u) * 180) / Math.PI), 'geometry')
  } else {
    for (const q of ['eyeSpacing', 'eyeHeightFromChin', 'eyeSize', 'headTiltDeg'] as const) miss(q, 'no pair of eyes')
  }

  // ── the muzzle ──
  if (muzzle) {
    const me = ext(muzzle.ctrl)
    set('muzzleWidth', (me.u1 - me.u0) / W, 'geometry')
    set('muzzleHeight', (me.z1 - me.z0) / H, 'geometry')
    if (eyes.length >= 2) {
      const lowEye = Math.min(...eyes.map((e) => e.z - e.halfZ))
      set('eyeMuzzleGap', (lowEye - me.z1) / W, 'geometry')
      set('eyeInsetFromMuzzleEdge', ((eyeL!.u - me.u0) + (me.u1 - eyeR!.u)) / 2 / W, 'geometry')
    }
    // The muzzle is the chin (rule 13): the head's and the muzzle's front-
    // view row widths 85% of the way down the muzzle.
    const cell = W / HEAD_PX
    const both = new FrontRaster(he.u0 - W * 0.3, chin - H * 0.1, cell, he.u1 + W * 0.3, top + H * 0.1)
    both.polyline(head.ctrl.map(proj), yr)
    both.polyline(muzzle.ctrl.map(proj), yr)
    both.fillHoles()
    const mr = new FrontRaster(he.u0 - W * 0.3, chin - H * 0.1, cell, he.u1 + W * 0.3, top + H * 0.1)
    mr.polyline(muzzle.ctrl.map(proj), yr)
    mr.fillHoles()
    const zRow = me.z1 - 0.85 * (me.z1 - me.z0)
    const hs = both.rowSpan(zRow), ms = mr.rowSpan(zRow)
    if (hs && ms) set('chinOverhang', ((hs[1] - hs[0]) - (ms[1] - ms[0])) / W, 'geometry')
  } else {
    for (const q of ['muzzleWidth', 'muzzleHeight', 'eyeMuzzleGap', 'eyeInsetFromMuzzleEdge', 'chinOverhang'] as const) miss(q, 'no muzzle')
  }

  // ── colour proxies (hex in Lab) ──
  const faceLab = hexToLab(head.part.colourHex)
  if (eyes.length) set('eyeFaceDeltaL', faceLab[0] - hexToLab(eyes[0]!.hex)[0], 'proxy')
  if (muzzle) {
    const ml = hexToLab(muzzle.part.colourHex)
    set('muzzleFaceDeltaL', ml[0] - faceLab[0], 'proxy')
    set('muzzleWarmthB', ml[2], 'proxy')
  }
  const blush = c.embroidery.filter((e) => /^(blush|cheek)/.test(e.name))
  if (blush.length) {
    set('blushDeltaA', hexToLab(blush[0]!.hex)[1] - faceLab[1], 'proxy')
    const bz = blush.map((b) => { const e = ext(b.strands.flat()); return (e.z0 + e.z1) / 2 })
    if (Number.isFinite(eyeZ)) set('blushBelowEye', (eyeZ - bz.reduce((a, z) => a + z, 0) / bz.length) / H, 'geometry')
  } else { miss('blushDeltaA', 'no blush'); miss('blushBelowEye', 'no blush') }

  // ── the ears ──
  if (ears.length) {
    const prot: number[] = [], above: number[] = [], aspect: number[] = [], lens: number[] = [], widths: number[] = [], rims: number[] = []
    for (const ear of ears) {
      const e = ext(ear.ctrl)
      const left = (e.u0 + e.u1) / 2 < midU
      prot.push(left ? he.u0 - e.u0 : e.u1 - he.u1)
      // The part of the ear the lens sees beside the head (the photos' box).
      const out = ear.ctrl.filter((v) => (left ? dot(v, F.u) < he.u0 : dot(v, F.u) > he.u1))
      const oe = out.length > 4 ? ext(out) : e
      const ow = left ? he.u0 - oe.u0 : oe.u1 - he.u1
      if (Number.isFinite(eyeZ)) above.push(((oe.z0 + oe.z1) / 2 - eyeZ) / H)
      if (out.length > 4 && ow > 0) aspect.push((oe.z1 - oe.z0) / ow)
      lens.push((e.z1 - e.z0) / H)
      widths.push((e.u1 - e.u0) / W)
      const rim = earRimRatio(ear.ctrl.map(proj), yr, W / HEAD_PX)
      if (rim) rims.push(rim.ratio)
    }
    const mean = (a: number[]): number => a.reduce((s, x) => s + x, 0) / a.length
    set('earProtrusion', mean(prot) / W, 'geometry')
    if (above.length) set('earAboveEye', mean(above), 'geometry')
    if (aspect.length) set('earAspect', mean(aspect), 'geometry')
    else miss('earAspect', 'the ears do not show beside the head')
    // The lop rules read only LOPS: ears hanging past the eye line, at least
    // 0.6 of the head tall (a bear's round ears are not lops).
    const lops = ears.every((ear) => { const e = ext(ear.ctrl); return Number.isFinite(eyeZ) && e.z0 < eyeZ && (e.z1 - e.z0) / H > 0.6 })
    if (lops) {
      set('earLength', mean(lens), 'geometry')
      set('earWidth', mean(widths), 'geometry')
    } else { miss('earLength', 'the ears are not lops'); miss('earWidth', 'the ears are not lops') }
    if (rims.length) set('earRimRatio', mean(rims), 'geometry')
    else { set('earRimRatio', 1, 'geometry'); notes.push('ears: no opening shows from the front (a closed or flat ear), rim read as uniform (1.0)') }
  } else {
    for (const q of ['earProtrusion', 'earAboveEye', 'earAspect', 'earLength', 'earWidth', 'earRimRatio'] as const) miss(q, 'no ears')
  }

  // ── appendages: horns, else a tail ──
  const lineOf = (pp: PlacedPart, near: V3): CentreLine | null => fitCentreLine(pp.ctrl, pp.part.rounds, near)
  // A horn is read from where it leaves the head's front-view outline (the
  // head and the hair on it: a fringe hides the horns' roots).
  let insideHead: ((v: V3) => boolean) | null = null
  if (horns.length) {
    const cell = W / HEAD_PX
    const hr = new FrontRaster(he.u0 - W, he.z0 - H, cell, he.u1 + W, he.z1 + H)
    hr.polyline(head.ctrl.map(proj), yr)
    for (const h of c.hair) hr.polyline(h.ctrl.map(proj), yr)
    hr.fillHoles()
    insideHead = (v) => { const q = proj(v); return hr.at(Math.round((q.u - hr.u0) / cell), Math.round((q.z - hr.z0) / cell)) === 1 }
  }
  const hornLines = horns.map((h) => lineOf(h, headC)).filter((x): x is CentreLine => !!x).map((cl) => clipCentreLine(cl, insideHead!))
  const appLines = hornLines.length ? hornLines : tail ? [lineOf(tail, centroid(cloud(torso.length ? torso : [head])))].filter((x): x is CentreLine => !!x) : []
  if (appLines.length) {
    const shapes = appLines.map((cl) => centreLineShape(cl, proj, yr))
    const mean = (f: (s: (typeof shapes)[number]) => number): number => shapes.reduce((a, s) => a + f(s), 0) / shapes.length
    set('appendageSagitta', mean((s) => s.sagitta), 'geometry')
    set('appendageBendDeg', mean((s) => s.bendDeg), 'geometry')
    set('appendageTaper', mean((s) => s.taper), 'geometry')
    if (!hornLines.length) notes.push('appendage: no horns, the tail read as the appendage (curve, bend, taper)')
    if (hornLines.length) {
      set('appendageElevationDeg', mean((s) => s.elevationDeg), 'geometry')
      set('appendageLength', mean((s) => s.arcMm) / W, 'geometry')
    } else { miss('appendageElevationDeg', 'no horns'); miss('appendageLength', 'no horns') }
  } else {
    for (const q of ['appendageSagitta', 'appendageBendDeg', 'appendageTaper', 'appendageElevationDeg', 'appendageLength'] as const) miss(q, 'no horn or tail')
  }

  // ── limbs ──
  if (frontLimbs.length) {
    const body = torso.length ? centroid(cloud(torso)) : headC
    const lines = frontLimbs.map((l) => lineOf(l, body)).filter((x): x is CentreLine => !!x)
    if (lines.length) {
      const mids = lines.map((cl) => centreLineShape(cl, proj, yr).thickAt(0.5))
      set('limbThickness', mids.reduce((a, x) => a + x, 0) / mids.length / W, 'geometry')
      // The end bulge: the widest ring over the far 30% (the foot or hoof)
      // against mid-length.
      const bulge = lines.map((cl) => {
        const sh = centreLineShape(cl, proj, yr)
        let best = 0
        for (let t = 0.7; t <= 0.951; t += 0.025) best = Math.max(best, sh.thickAt(t))
        return best / sh.thickAt(0.5)
      })
      set('limbEndBulge', bulge.reduce((a, x) => a + x, 0) / bulge.length, 'geometry')
    }
    const ls = frontLimbs.map((l) => ext(l.ctrl)).sort((a, b) => a.u0 - b.u0)
    if (ls.length >= 2) set('limbGap', (ls[ls.length - 1]!.u0 - ls[0]!.u1) / W, 'geometry')
  } else for (const q of ['limbThickness', 'limbEndBulge', 'limbGap'] as const) miss(q, 'no front legs or arms')
  if (feet.length) {
    const fw = feet.map((f) => { const e = ext(f.ctrl); return (e.u1 - e.u0) / W })
    set('footWidth', fw.reduce((a, x) => a + x, 0) / fw.length, 'geometry')
  } else miss('footWidth', 'no feet')

  // ── softness: the front-view silhouette of the whole toy ──
  {
    const cell = W / HEAD_PX
    let u0 = Infinity, u1 = -Infinity
    const all: V3[][] = [...c.placed.map((pp) => pp.ctrl), ...c.hair.map((h) => h.ctrl)]
    for (const pts of all) { const e = ext(pts); u0 = Math.min(u0, e.u0); u1 = Math.max(u1, e.u1) }
    const zTop = Math.max(...all.map((pts) => ext(pts).z1))
    const R = new FrontRaster(u0 - 4 * yr, ground - 4 * yr, cell, u1 + 4 * yr, zTop + 4 * yr)
    for (const pts of all) R.polyline(pts.map(proj), yr)
    R.fillHoles()
    const contour = R.outline()
    const jChin = (chin - R.z0) / cell
    const soft = outlineSoftness(contour, HEAD_PX, (j) => j >= jChin)
    debug?.silhouette?.(R, contour, jChin, soft.corners)
    set('sharpCorners', soft.sharpCorners, 'geometry')
    set('straightRun', soft.straightRunToW, 'geometry')
  }

  // ── curls: the settled loops of every hair patch ──
  const sizes: number[] = []
  for (const h of c.hair) {
    const nodes = h.built.model.nodes
    for (const body of loopBodies(h.built)) {
      if (body.length < 4) continue
      const pts = body.map((i) => nodes[i]!)
      const m = centroid(pts)
      let r2 = 0
      for (const v of pts) r2 += (v.x - m.x) ** 2 + (v.y - m.y) ** 2 + (v.z - m.z) ** 2
      sizes.push(2 * Math.sqrt(r2 / pts.length))
    }
  }
  let curlCV: number | null = null
  if (sizes.length >= 3) {
    const mean = sizes.reduce((a, x) => a + x, 0) / sizes.length
    const sd = Math.sqrt(sizes.reduce((a, x) => a + (x - mean) ** 2, 0) / sizes.length)
    curlCV = sd / mean
    set('curlSizeCV', curlCV, 'geometry')
  } else miss('curlSizeCV', 'no curly fringe or mane')

  // ── deliberate asymmetries (rule 36), read off the program and its pieces ──
  {
    const cues: string[] = []
    if ((values.headTiltDeg ?? 0) >= 2) cues.push('head tilt')
    // A pair of pieces that are not mirror images about the face's midline:
    // an offset, a crossed or a one-sided lean (spirals alone differ by far
    // less than 0.08 W).
    // Left and right pieces of the same name (a toe bean is matched with
    // whichever bean on the other foot mirrors it best).
    const sides = new Map<string, { l: PlacedPart[]; r: PlacedPart[] }>()
    for (const pp of c.placed) {
      const m = /^(.*)-([lr])\d*$/.exec(pp.part.name)
      if (!m) continue
      const g = sides.get(m[1]!) ?? { l: [], r: [] }
      g[m[2] as 'l' | 'r'].push(pp)
      sides.set(m[1]!, g)
    }
    const parentOf = (x: PlacedPart): V3 | null => {
      const on = (x.part.place as { on?: string } | undefined)?.on
      const par = on && on !== 'ground' ? one(on) : undefined
      return par ? centroid(par.ctrl) : null
    }
    // How far a pair is from mirror images (place and size) about the
    // midline, in the toy's own frame (world x: the body is built square to
    // it) or in the face's (u: the face pieces are turned to the lens),
    // whichever reads it more mirrored. The midline: between the two pieces'
    // parents (a toe bean on each foot), else the head's.
    const mirrorOff = (pa: PlacedPart, pb: PlacedPart): number => {
      const qa = parentOf(pa), qb = parentOf(pb)
      const pc = qa && qb ? { x: (qa.x + qb.x) / 2, y: (qa.y + qb.y) / 2, z: (qa.z + qb.z) / 2 } : null
      const ca = centroid(pa.ctrl), cb = centroid(pb.ctrl)
      const ba = pa.bounds, bb = pb.bounds
      const offWorld = Math.max(
        Math.hypot(ca.x + cb.x - 2 * (pc ? pc.x : 0), ca.y - cb.y, ca.z - cb.z),
        Math.abs((ba.maxx - ba.minx) - (bb.maxx - bb.minx)) + Math.abs((ba.maxz - ba.minz) - (bb.maxz - bb.minz)),
      )
      const a = proj(ca), b = proj(cb), mu = pc ? dot(pc, F.u) : midU
      const ea = ext(pa.ctrl), eb = ext(pb.ctrl)
      const offFace = Math.max(
        Math.hypot(a.u + b.u - 2 * mu, a.w - b.w, a.z - b.z),
        Math.abs((ea.u1 - ea.u0) - (eb.u1 - eb.u0)) + Math.abs((ea.z1 - ea.z0) - (eb.z1 - eb.z0)),
      )
      return Math.min(offWorld, offFace)
    }
    for (const [k, g] of sides) {
      if (g.l.length !== g.r.length) { cues.push(`${k} on one side only`); continue }
      if (g.l.some((pa) => Math.min(...g.r.map((pb) => mirrorOff(pa, pb))) > 0.08 * W)) cues.push(`${k} not mirrored`)
    }
    // A hair patch or a fringe swept to one side.
    for (const h of p.hair ?? []) {
      const d = h.dir
      const l = Math.hypot(d.x, d.y, d.z) || 1
      if (Math.abs(dot(d, F.u)) / l > 0.15) cues.push(`${h.name} swept to one side`)
    }
    for (const a of p.accessories ?? []) {
      if (a.kind === 'nightcap' && a.bend && (a.bend.angleDeg ?? 0) > 20) {
        const az = ((a.bend.dirDeg ?? 0) * Math.PI) / 180
        if (Math.abs(Math.cos(az) * F.u.x + Math.sin(az) * F.u.y) > 0.3) cues.push('hat tail flopped to one side')
      }
      if (a.kind !== 'nightcap' && 'fringe' in a && a.fringe && (a.fringe.partAz ?? 0) !== 0) cues.push('side-swept fringe')
    }
    // An embroidered feature with no mirror (a single brow, a side smile).
    const emb = c.embroidery.map((e) => { const pts = e.strands.flat(); return pts.length ? { n: e.name, c: proj(centroid(pts)) } : null }).filter((x): x is { n: string; c: P3 } => !!x)
    for (const e of emb) {
      const off = e.c.u - midU
      if (Math.abs(off) < 0.06 * W) continue
      if (!emb.some((o) => o !== e && Math.abs(o.c.u - midU + off) < 0.06 * W && Math.abs(o.c.z - e.c.z) < 0.06 * W)) cues.push(`${e.n} unmirrored`)
    }
    if (curlCV != null && curlCV >= 0.18 && curlCV <= 0.4) cues.push('mixed curls')
    set('asymmetryCues', cues.length, 'program')
    if (cues.length) notes.push(`asymmetry: ${cues.join(', ')}`)
  }
  return out
}
