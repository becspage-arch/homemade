/**
 * DRAPE RELAX — gravity, a table and self-collision for a SOFT finished piece.
 *
 * The stitch relax (relax.ts) holds a piece to the surface it was worked on:
 * right for a blocked swatch or a stuffed toy, wrong for a beanie put down on
 * a table or a cowl lying in a loop. A space warp of that surface (bendTube,
 * collapseTube) can bend a tube but cannot make its fabric BUNCH: a flattened
 * dome's rounds settle into each other, folds pick their own radius, two
 * layers press on each other, and the whole thing finds its own rest on the
 * table. Those are what gravity, a ground plane and self-collision do.
 *
 * Staging only, the same contract as bendTube / loopStrip / turnOver: the
 * stitched geometry and the written pattern never change. The drape runs on a
 * built, relaxed, audited piece and moves it on the way to the scene JSON.
 * Nothing here is read by relax, the audit or the geometry hash.
 *
 * HOW. Two levels, because a yarn is a chain and a fabric is a sheet:
 *
 *  1. The piece's SHELL. A tube is a surface of revolution worked in rounds,
 *     so every yarn node has a place on it: a meridian coordinate v (which
 *     round, how far through it), a hoop coordinate u (its angle) and a normal
 *     offset n (how far in or out of the fabric's mid-surface that bit of yarn
 *     sits — the stitch relief). The shell is sampled as a coarse quad mesh,
 *     one row per round and a column about every stitch, in the model frame.
 *
 *  2. The CLOTH. That coarse mesh is relaxed as a sheet: it keeps its lengths
 *     (hoop, meridian and the diagonals, so it neither stretches nor shears),
 *     resists bending softly through two-apart distance constraints whose rest
 *     lengths carry the worked curvature (a dome remembers it was a dome, as a
 *     blocked hat does), falls under gravity, cannot pass through the table
 *     or through itself (point collision at the fabric's own thickness) and
 *     stops against any prop (a bust form, a table edge). Position-based
 *     dynamics with Verlet velocities and friction on contact — the same
 *     Gauss-Seidel projection as relax.ts, with time in it.
 *
 *  3. The yarn RIDES the sheet: each node goes back to the same (v, u, n) on
 *     the settled mesh. Within a quad the fabric moves as a whole, so every
 *     stitch keeps its shape; across a fold the outside stretches and the
 *     inside gathers by (1 ± n·κ), which is what a folded sleeve of crochet
 *     does too. The round trip on an undraped mesh reproduces the relaxed
 *     geometry to a fraction of a yarn radius (drape.test.ts).
 *
 * Runtime is the coarse mesh's (a few thousand nodes, a couple of seconds),
 * not the yarn's (tens of thousands), which is what makes it usable inside a
 * render job.
 */

import type { V3 } from '../yarnLoop'
import type { BuiltContinuous } from './yarnPath'
import { collapseTube, type TubeCollapse } from './tubeStaging'

export type DrapeCollider =
  /** An axis-aligned ellipsoid (a head, a bust, a pouffe): centre and
   *  semi-axes (mm). With `hex` it is also rendered as a matte prop. */
  | { kind: 'ellipsoid'; centre: V3; semi: V3; hex?: string; gloss?: number }
  /** A capsule between two points (a neck, a dowel, an arm). */
  | { kind: 'capsule'; a: V3; b: V3; radius: number }
  /** The table ends at `xEdge`: fabric beyond it hangs over a rounded edge of
   *  `radius`; the table top is the drape's floor, its face drops below. */
  | { kind: 'tableEdge'; xEdge: number; radius: number }

export interface DrapeOptions {
  /** How the piece is put down before it settles (default 'collapsed'):
   *  - 'collapsed': laid doubled on the table from `collapseTube` (a beanie
   *    or cowl put down flat); `collapse` tunes it.
   *  - 'side': the standing piece rolled onto its side and dropped.
   *  - 'standing': left standing on its open end and let slump (a cowl ring).
   *  - 'flat': a flat piece put down as worked (its default).
   *  - 'custom': `initial` maps the coarse rest mesh to its start. */
  start?: 'collapsed' | 'side' | 'standing' | 'flat' | 'custom'
  collapse?: Partial<Omit<TubeCollapse, 'yarnRadiusMm' | 'roundRadius' | 'axial'>>
  initial?: (rest: V3[], rows: number, cols: number) => V3[]
  /** Gravity (mm per step², default 0.06). */
  gravity?: number
  /** Simulation steps (default 700) and constraint passes a step (default 8). */
  steps?: number
  iterations?: number
  /** Stiffness 0..1 of the in-sheet terms (default 1 stretch, 0.6 shear) and of
   *  the bending resistance (default 0.12: a worsted hdc fabric; 0.04 reads as
   *  a limp fine fabric, 0.3 as a stiff felted one). */
  stretchK?: number
  shearK?: number
  bendK?: number
  /** The fabric's thickness for self-collision, in yarn radii (default from the
   *  piece's own measured relief; a soft fabric lies a little thinner). */
  thicknessYr?: number
  /** Contact friction 0..1 (default 0.6) and velocity damping (default 0.985). */
  friction?: number
  damping?: number
  /** Coarse columns round the piece (default: one per stitch of the widest
   *  round, 24..144). */
  cols?: number
  /** Props the fabric settles against (sim frame: the table is z = 0). */
  colliders?: DrapeCollider[]
  /** Deterministic jitter seed (default 1) so symmetric folds choose a side. */
  seed?: number
  /** Camera overrides for the draped hero (see `drapedView`). */
  view?: { marginFactor?: number; tiltDeg?: number; yawDeg?: number; aimHeightFrac?: number; groundScale?: number; stageZoom?: number }
}

export interface DrapeResult {
  /** The draped strand centreline in world mm (strand order), the table at z = 0. */
  world: V3[]
  /** The settled coarse mesh (rows × cols, row-major) for proofs and tests. */
  coarse: { rows: number; cols: number; pos: V3[]; rest: V3[] }
  /** Mean |stretch| of the coarse edges against rest (0 = isometric). */
  stretch: number
  /** How far the last step moved the mesh (mm, max over nodes): ~0 = settled. */
  lastMove: number
  thicknessMm: number
}

/** The shell coordinates of every yarn node of a built piece. */
interface ShellMap {
  rows: number
  cols: number
  /** Closed round the hoop (a tube) or an open sheet (a flat piece). */
  closed: boolean
  /** +1 when e_row × e_col is the outward normal, −1 when it is inward. */
  nSign: 1 | -1
  /** Row profile in the model frame: mean radius, height, meridian arclength. */
  R: Float64Array
  Z: Float64Array
  S: Float64Array
  /** Per yarn node: continuous row v, continuous column u (0..cols, wrapping), normal offset n. */
  v: Float64Array
  u: Float64Array
  n: Float64Array
}

const TAU = Math.PI * 2

/** Row normals (outward) from central differences of the profile, exactly the
 *  stencil the skinning uses on the mesh. */
function profileNormals(R: Float64Array, Z: Float64Array): { nr: Float64Array; nz: Float64Array } {
  const K = R.length
  const nr = new Float64Array(K)
  const nz = new Float64Array(K)
  for (let k = 0; k < K; k++) {
    const a = Math.max(0, k - 1)
    const b = Math.min(K - 1, k + 1)
    let tr = R[b]! - R[a]!
    let tz = Z[b]! - Z[a]!
    const L = Math.hypot(tr, tz) || 1
    tr /= L
    tz /= L
    nr[k] = -tz
    nz[k] = tr
  }
  return { nr, nz }
}

/** Map every node of a built tube onto its shell (v, u, n). */
function shellOfTube(built: BuiltContinuous, cols: number): ShellMap {
  const nodes = built.model.nodes
  const nodeRow = built.nodeRow
  if (!nodeRow) throw new Error('drape: the piece carries no per-node round index (only tubes drape)')
  let kMax = -1
  let hasAnchor = false
  for (const k of nodeRow) { if (k > kMax) kMax = k; if (k < 0) hasAnchor = true }
  const off = hasAnchor ? 1 : 0
  const K = kMax + 1 + off
  const R = new Float64Array(K)
  const Z = new Float64Array(K)
  const cnt = new Float64Array(K)
  for (let i = 0; i < nodes.length; i++) {
    const row = nodeRow[i]! + off
    const p = nodes[i]!
    R[row]! += Math.hypot(p.x, p.y)
    Z[row]! += p.z
    cnt[row]! += 1
  }
  for (let k = 0; k < K; k++) { if (cnt[k]! > 0) { R[k]! /= cnt[k]!; Z[k]! /= cnt[k]! } else if (k > 0) { R[k] = R[k - 1]!; Z[k] = Z[k - 1]! } }
  const S = new Float64Array(K)
  for (let k = 1; k < K; k++) S[k] = S[k - 1]! + Math.hypot(R[k]! - R[k - 1]!, Z[k]! - Z[k - 1]!)
  const { nr, nz } = profileNormals(R, Z)
  const v = new Float64Array(nodes.length)
  const u = new Float64Array(nodes.length)
  const n = new Float64Array(nodes.length)
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!
    const pr = Math.hypot(p.x, p.y)
    const pz = p.z
    const row = nodeRow[i]! + off
    let best = Infinity
    let bv = row
    let bn = 0
    // Beyond the first and last rows the shell continues as the end segment
    // extrapolated (a rim's outermost loops sit past the last round's mean).
    const rowAt = (k: number): { r: number; z: number; nr: number; nz: number } => {
      if (k < 0 && K > 1) return { r: 2 * R[0]! - R[1]!, z: 2 * Z[0]! - Z[1]!, nr: nr[0]!, nz: nz[0]! }
      if (k >= K && K > 1) return { r: 2 * R[K - 1]! - R[K - 2]!, z: 2 * Z[K - 1]! - Z[K - 2]!, nr: nr[K - 1]!, nz: nz[K - 1]! }
      const kk = Math.max(0, Math.min(K - 1, k))
      return { r: R[kk]!, z: Z[kk]!, nr: nr[kk]!, nz: nz[kk]! }
    }
    for (const a of [row - 1, row]) {
      if (K < 2) continue
      const A = rowAt(a), B = rowAt(a + 1)
      const dr = B.r - A.r
      const dz = B.z - A.z
      const d2 = dr * dr + dz * dz
      if (d2 < 1e-12) continue
      let t = Math.max(0, Math.min(1, ((pr - A.r) * dr + (pz - A.z) * dz) / d2))
      let nn = 0
      let e = Infinity
      for (let it = 0; it < 4; it++) {
        let Nr = A.nr * (1 - t) + B.nr * t
        let Nz = A.nz * (1 - t) + B.nz * t
        const L = Math.hypot(Nr, Nz) || 1
        Nr /= L
        Nz /= L
        const Pr = A.r + dr * t
        const Pz = A.z + dz * t
        nn = (pr - Pr) * Nr + (pz - Pz) * Nz
        const qr = pr - nn * Nr
        const qz = pz - nn * Nz
        t = Math.max(0, Math.min(1, ((qr - A.r) * dr + (qz - A.z) * dz) / d2))
        e = Math.hypot(pr - (A.r + dr * t) - nn * Nr, pz - (A.z + dz * t) - nn * Nz)
      }
      if (e < best) { best = e; bv = a + t; bn = nn }
    }
    if (K === 1) { bv = 0; bn = pr - R[0]! }
    v[i] = bv
    n[i] = bn
    let th = Math.atan2(p.y, p.x)
    if (th < 0) th += TAU
    u[i] = (th / TAU) * cols
  }
  return { rows: K, cols, closed: true, nSign: 1, R, Z, S, v, u, n }
}

/**
 * Map every node of a built FLAT piece (rows of turned work, relaxed in the
 * x–y plane with relief in z) onto an open sheet: v from its row's worked
 * line (the mean y of each row), u from its x across the piece, n = z.
 */
function shellOfFlat(built: BuiltContinuous, cols: number): ShellMap {
  const nodes = built.model.nodes
  const nodeRow = built.nodeRow
  if (!nodeRow) throw new Error('drape: the piece carries no per-node row index')
  let kMax = -1
  let hasAnchor = false
  for (const k of nodeRow) { if (k > kMax) kMax = k; if (k < 0) hasAnchor = true }
  const off = hasAnchor ? 1 : 0
  const K = kMax + 1 + off
  const Y = new Float64Array(K)
  const cnt = new Float64Array(K)
  let xmin = Infinity, xmax = -Infinity
  for (let i = 0; i < nodes.length; i++) {
    const row = nodeRow[i]! + off
    Y[row]! += nodes[i]!.y
    cnt[row]! += 1
    if (nodes[i]!.x < xmin) xmin = nodes[i]!.x
    if (nodes[i]!.x > xmax) xmax = nodes[i]!.x
  }
  for (let k = 0; k < K; k++) { if (cnt[k]! > 0) Y[k]! /= cnt[k]!; else if (k > 0) Y[k] = Y[k - 1]! }
  // The sheet's columns span the piece's width with a little margin so the
  // selvedge loops sit inside the last quad.
  const pad = (xmax - xmin) * 0.01
  const X0 = xmin - pad
  const X1 = xmax + pad
  const v = new Float64Array(nodes.length)
  const u = new Float64Array(nodes.length)
  const n = new Float64Array(nodes.length)
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!
    const row = nodeRow[i]! + off
    // Rows are a monotone ladder in y: find v by linear interpolation between
    // the neighbouring row lines (extrapolated past the ends).
    let bv = row
    if (K > 1) {
      const a = row > 0 && (p.y - Y[row]!) * (Y[row - 1]! - Y[row]!) > 0 ? row - 1 : row
      const b = Math.min(K - 1, a + 1)
      const ya = a === b ? Y[K - 2]! : Y[a]!
      const yb = a === b ? Y[K - 1]! : Y[b]!
      const base = a === b ? K - 2 : a
      const dy = yb - ya
      bv = Math.abs(dy) < 1e-9 ? row : base + (p.y - ya) / dy
      bv = Math.max(-1, Math.min(K, bv))
    }
    v[i] = bv
    u[i] = ((p.x - X0) / (X1 - X0)) * (cols - 1)
    n[i] = p.z
  }
  // Row-major rest mesh encoded through R/Z/S for the shared helpers: here R is
  // the row's y line and the column x is laid by restMesh's flat branch.
  const R = Y
  const Z = new Float64Array(K)
  const S = new Float64Array(K)
  for (let k = 1; k < K; k++) S[k] = S[k - 1]! + Math.abs(Y[k]! - Y[k - 1]!)
  const m: ShellMap = { rows: K, cols, closed: false, nSign: -1, R, Z, S, v, u, n }
  flatX.set(m, [X0, X1])
  return m
}
/** The x span of a flat shell's columns (kept off the interface). */
const flatX = new WeakMap<ShellMap, [number, number]>()

/** The coarse rest mesh in the model frame (row-major, rows × cols). */
function restMesh(m: ShellMap): V3[] {
  const out: V3[] = []
  const fx = flatX.get(m)
  for (let k = 0; k < m.rows; k++) {
    for (let j = 0; j < m.cols; j++) {
      if (fx) {
        out.push({ x: fx[0] + ((fx[1] - fx[0]) * j) / (m.cols - 1), y: m.R[k]!, z: 0 })
      } else {
        const th = (j / m.cols) * TAU
        out.push({ x: m.R[k]! * Math.cos(th), y: m.R[k]! * Math.sin(th), z: m.Z[k]! })
      }
    }
  }
  return out
}

/** Outward unit normals of a mesh, rows × cols, central differences (one-sided
 *  at the end rows), e_meridian × e_hoop. */
function meshNormals(pos: V3[], rows: number, cols: number, closed = true, sign = 1): V3[] {
  const out: V3[] = new Array(rows * cols)
  for (let k = 0; k < rows; k++) {
    const ka = Math.max(0, k - 1)
    const kb = Math.min(rows - 1, k + 1)
    for (let j = 0; j < cols; j++) {
      const ja = closed ? (j + cols - 1) % cols : Math.max(0, j - 1)
      const jb = closed ? (j + 1) % cols : Math.min(cols - 1, j + 1)
      const a = pos[ka * cols + j]!, b = pos[kb * cols + j]!
      const c = pos[k * cols + ja]!, d = pos[k * cols + jb]!
      const sx = b.x - a.x, sy = b.y - a.y, sz = b.z - a.z
      const hx = d.x - c.x, hy = d.y - c.y, hz = d.z - c.z
      let nx = sy * hz - sz * hy
      let ny = sz * hx - sx * hz
      let nz = sx * hy - sy * hx
      const L = Math.hypot(nx, ny, nz)
      if (L < 1e-9) { out[k * cols + j] = { x: 0, y: 0, z: 1 }; continue }
      nx /= L; ny /= L; nz /= L
      out[k * cols + j] = { x: nx * sign, y: ny * sign, z: nz * sign }
    }
  }
  return out
}

/** Put every yarn node back on a (settled) mesh at its own (v, u, n). */
function skin(m: ShellMap, pos: V3[]): V3[] {
  const { rows, cols } = m
  const N = meshNormals(pos, rows, cols, m.closed, m.nSign)
  const out: V3[] = new Array(m.v.length)
  for (let i = 0; i < m.v.length; i++) {
    const v = Math.max(-1, Math.min(rows, m.v[i]!))
    // Past either end row the shell is the end segment extrapolated (tv < 0 or > 1).
    const k0 = Math.max(0, Math.min(rows - 2, Math.floor(v)))
    const k1 = Math.min(rows - 1, k0 + 1)
    const tv = v - k0
    let u = m.u[i]!
    let j0: number, j1: number, tu: number
    if (m.closed) {
      u %= cols
      if (u < 0) u += cols
      j0 = Math.floor(u) % cols
      j1 = (j0 + 1) % cols
      tu = u - Math.floor(u)
    } else {
      // Past either selvedge the sheet is its end column extrapolated.
      u = Math.max(-1, Math.min(cols, u))
      j0 = Math.max(0, Math.min(cols - 2, Math.floor(u)))
      j1 = j0 + 1
      tu = u - j0
    }
    const w00 = (1 - tv) * (1 - tu), w01 = (1 - tv) * tu, w10 = tv * (1 - tu), w11 = tv * tu
    const i00 = k0 * cols + j0, i01 = k0 * cols + j1, i10 = k1 * cols + j0, i11 = k1 * cols + j1
    const p00 = pos[i00]!, p01 = pos[i01]!, p10 = pos[i10]!, p11 = pos[i11]!
    const n00 = N[i00]!, n01 = N[i01]!, n10 = N[i10]!, n11 = N[i11]!
    let nx = w00 * n00.x + w01 * n01.x + w10 * n10.x + w11 * n11.x
    let ny = w00 * n00.y + w01 * n01.y + w10 * n10.y + w11 * n11.y
    let nz = w00 * n00.z + w01 * n01.z + w10 * n10.z + w11 * n11.z
    const L = Math.hypot(nx, ny, nz) || 1
    nx /= L; ny /= L; nz /= L
    const n = m.n[i]!
    out[i] = {
      x: w00 * p00.x + w01 * p01.x + w10 * p10.x + w11 * p11.x + n * nx,
      y: w00 * p00.y + w01 * p01.y + w10 * p10.y + w11 * p11.y + n * ny,
      z: w00 * p00.z + w01 * p01.z + w10 * p10.z + w11 * p11.z + n * nz,
    }
  }
  return out
}

// ── the cloth ───────────────────────────────────────────────────────────────

interface Edge { a: number; b: number; rest: number; k: number }

class Hash {
  cell: number
  map = new Map<number, number[]>()
  constructor(cell: number) { this.cell = cell }
  key(x: number, y: number, z: number): number {
    return (Math.floor(x / this.cell) * 73856093) ^ (Math.floor(y / this.cell) * 19349663) ^ (Math.floor(z / this.cell) * 83492791)
  }
  build(p: V3[]): void {
    this.map.clear()
    for (let i = 0; i < p.length; i++) {
      const k = this.key(p[i]!.x, p[i]!.y, p[i]!.z)
      const arr = this.map.get(k)
      if (arr) arr.push(i); else this.map.set(k, [i])
    }
  }
  near(q: V3, out: number[]): void {
    out.length = 0
    const cx = Math.floor(q.x / this.cell), cy = Math.floor(q.y / this.cell), cz = Math.floor(q.z / this.cell)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      const arr = this.map.get(((cx + dx) * 73856093) ^ ((cy + dy) * 19349663) ^ ((cz + dz) * 83492791))
      if (arr) for (const i of arr) out.push(i)
    }
  }
}

/** Signed distance and outward gradient of a collider at p (sim frame). */
function colliderSdf(c: DrapeCollider, p: V3): { d: number; g: V3 } {
  if (c.kind === 'ellipsoid') {
    const qx = (p.x - c.centre.x) / c.semi.x, qy = (p.y - c.centre.y) / c.semi.y, qz = (p.z - c.centre.z) / c.semi.z
    const q = Math.hypot(qx, qy, qz) || 1e-9
    // Approximate distance: scaled radial gap along the gradient of the quadric.
    let gx = qx / (c.semi.x * q), gy = qy / (c.semi.y * q), gz = qz / (c.semi.z * q)
    const gl = Math.hypot(gx, gy, gz) || 1
    gx /= gl; gy /= gl; gz /= gl
    const d = (q - 1) / gl
    return { d, g: { x: gx, y: gy, z: gz } }
  }
  if (c.kind === 'capsule') {
    const ax = c.b.x - c.a.x, ay = c.b.y - c.a.y, az = c.b.z - c.a.z
    const L2 = ax * ax + ay * ay + az * az || 1e-9
    const t = Math.max(0, Math.min(1, ((p.x - c.a.x) * ax + (p.y - c.a.y) * ay + (p.z - c.a.z) * az) / L2))
    const cx = c.a.x + ax * t, cy = c.a.y + ay * t, cz = c.a.z + az * t
    let gx = p.x - cx, gy = p.y - cy, gz = p.z - cz
    const d = Math.hypot(gx, gy, gz)
    if (d < 1e-9) return { d: -c.radius, g: { x: 0, y: 0, z: 1 } }
    gx /= d; gy /= d; gz /= d
    return { d: d - c.radius, g: { x: gx, y: gy, z: gz } }
  }
  // tableEdge: the table is x <= xEdge, z <= 0, its edge rounded by `radius`.
  const r = c.radius
  const qx = p.x - (c.xEdge - r)
  const qz = p.z - -r
  const mx = Math.max(qx, 0), mz = Math.max(qz, 0)
  const d = Math.hypot(mx, mz) + Math.min(Math.max(qx, qz), 0) - r
  let gx: number, gz: number
  if (qx > 0 && qz > 0) { const L = Math.hypot(qx, qz) || 1; gx = qx / L; gz = qz / L }
  else if (qx > qz) { gx = 1; gz = 0 } else { gx = 0; gz = 1 }
  return { d, g: { x: gx, y: 0, z: gz } }
}

function project(p: V3[], w: Float64Array, e: Edge): void {
  const a = p[e.a]!, b = p[e.b]!
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
  const d = Math.hypot(dx, dy, dz)
  if (d < 1e-6) return
  const ws = w[e.a]! + w[e.b]!
  if (ws === 0) return
  const corr = ((d - e.rest) / d) * e.k
  const fa = corr * (w[e.a]! / ws), fb = corr * (w[e.b]! / ws)
  a.x += dx * fa; a.y += dy * fa; a.z += dz * fa
  b.x -= dx * fb; b.y -= dy * fb; b.z -= dz * fb
}

/**
 * Drape a built, relaxed tube: returns the strand centreline settled on the
 * table (world mm, z = 0 is the table top).
 */
export function drapeTube(built: BuiltContinuous, yr: number, o: DrapeOptions = {}): DrapeResult {
  return settle(built, yr, shellOfTube(built, o.cols ?? defaultCols(built)), o)
}

/** Drape a built, relaxed FLAT piece (a square, a small blanket): the sheet is
 *  put down as worked (`start` 'flat', the default) or by `initial`, and
 *  settles over whatever props are given (a pouffe, a table edge). */
export function drapeFlat(built: BuiltContinuous, yr: number, o: DrapeOptions = {}): DrapeResult {
  return settle(built, yr, shellOfFlat(built, o.cols ?? defaultCols(built)), o)
}

/** One coarse column a stitch of the widest row (~17 yarn nodes a stitch). */
function defaultCols(built: BuiltContinuous): number {
  const per = new Map<number, number>()
  for (const k of built.nodeRow ?? []) per.set(k, (per.get(k) ?? 0) + 1)
  let maxNodes = 0
  for (const [k, c] of per) if (k >= 0 && c > maxNodes) maxNodes = c
  const maxCount = Math.round(maxNodes / 17)
  return Math.max(24, Math.min(144, maxCount || 48))
}

function settle(built: BuiltContinuous, yr: number, m: ShellMap, o: DrapeOptions): DrapeResult {
  const { rows, cols, closed } = m
  const rest = restMesh(m)
  const N = rest.length

  // The fabric's thickness: its relief band (2nd..98th percentile of n) plus
  // the yarn itself. Coarse nodes collide at this diameter.
  let T: number
  if (o.thicknessYr) T = o.thicknessYr * yr
  else {
    const ns = Array.from(m.n).sort((a, b) => a - b)
    const lo = ns[Math.floor(ns.length * 0.02)] ?? 0
    const hi = ns[Math.floor(ns.length * 0.98)] ?? 0
    T = Math.max(2.2 * yr, (hi - lo) * 0.8 + 1.7 * yr)
  }
  const floorZ = T / 2

  // Inverse masses from the rest area each node carries (the pole rows are
  // tiny and must not out-vote the body).
  const w = new Float64Array(N)
  {
    const area = new Float64Array(rows)
    let aMax = 0
    const fx = flatX.get(m)
    for (let k = 0; k < rows; k++) {
      const ka = Math.max(0, k - 1), kb = Math.min(rows - 1, k + 1)
      const mer = Math.hypot(m.R[kb]! - m.R[ka]!, m.Z[kb]! - m.Z[ka]!) / Math.max(1, kb - ka)
      const hoop = fx ? (fx[1] - fx[0]) / (cols - 1) : (TAU * m.R[k]!) / cols
      area[k] = mer * hoop
      if (area[k]! > aMax) aMax = area[k]!
    }
    for (let k = 0; k < rows; k++) for (let j = 0; j < cols; j++) w[k * cols + j] = 1 / Math.max(area[k]!, aMax * 0.15, 1e-6)
    const wMean = w.reduce((a, b) => a + b, 0) / N
    for (let i = 0; i < N; i++) w[i] = w[i]! / wMean
  }

  // Constraints: stretch (hoop + meridian), shear (diagonals), bend (two apart).
  const kS = o.stretchK ?? 1
  const kH = o.shearK ?? 0.6
  const kB = o.bendK ?? 0.12
  const edges: Edge[] = []
  const dist = (a: number, b: number): number => Math.hypot(rest[a]!.x - rest[b]!.x, rest[a]!.y - rest[b]!.y, rest[a]!.z - rest[b]!.z)
  const id = (k: number, j: number): number => k * cols + ((j % cols) + cols) % cols
  // An open sheet has no edge across its selvedges.
  const across = (j: number): boolean => closed || j < cols
  for (let k = 0; k < rows; k++) {
    for (let j = 0; j < cols; j++) {
      const a = id(k, j)
      if (across(j + 1)) edges.push({ a, b: id(k, j + 1), rest: dist(a, id(k, j + 1)), k: kS })
      if (k + 1 < rows) {
        edges.push({ a, b: id(k + 1, j), rest: dist(a, id(k + 1, j)), k: kS })
        if (across(j + 1)) {
          edges.push({ a, b: id(k + 1, j + 1), rest: dist(a, id(k + 1, j + 1)), k: kH })
          edges.push({ a: id(k, j + 1), b: id(k + 1, j), rest: dist(id(k, j + 1), id(k + 1, j)), k: kH })
        }
      }
    }
  }
  // The pole: the magic ring and the first round or two are smaller across
  // than the fabric is thick — a real crown's centre is a firm little disc, not
  // a sheet that can crumple. Every pair in those rows (and the first row
  // outside them) is tied at its rest distance, so the pole moves rigidly.
  {
    let kp = -1
    if (closed) for (let k = 0; k < rows; k++) if (m.R[k]! < T) kp = k; else break
    if (kp >= 0 && kp + 1 < rows) {
      const ids: number[] = []
      for (let k = 0; k <= kp + 1; k++) for (let j = 0; j < cols; j++) ids.push(id(k, j))
      for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
        const d = dist(ids[a]!, ids[b]!)
        if (d > 1e-6) edges.push({ a: ids[a]!, b: ids[b]!, rest: d, k: 1 })
      }
    }
  }
  const bends: Edge[] = []
  for (let k = 0; k < rows; k++) {
    for (let j = 0; j < cols; j++) {
      const a = id(k, j)
      if (cols > 4 && across(j + 2)) bends.push({ a, b: id(k, j + 2), rest: dist(a, id(k, j + 2)), k: kB })
      if (k + 2 < rows) bends.push({ a, b: id(k + 2, j), rest: dist(a, id(k + 2, j)), k: kB })
    }
  }
  // Pairs that touch at rest (neighbours, the two faces of a folded brim)
  // never collide; everything else keeps a fabric thickness apart.
  const bonded = new Set<number>()
  const pkey = (a: number, b: number): number => (a < b ? a * N + b : b * N + a)
  {
    const h = new Hash(T * 1.2)
    h.build(rest)
    const near: number[] = []
    for (let i = 0; i < N; i++) {
      h.near(rest[i]!, near)
      for (const j of near) if (j > i && dist(i, j) < T * 1.2) bonded.add(pkey(i, j))
    }
  }

  // ── the start ────────────────────────────────────────────────────────────
  let pos: V3[]
  const start = o.start ?? (o.initial ? 'custom' : closed ? 'collapsed' : 'flat')
  if (start === 'custom' && o.initial) pos = o.initial(rest.map((p) => ({ ...p })), rows, cols)
  else if (start === 'collapsed' && closed) {
    const roundRadius: number[] = []
    const axial: number[] = []
    for (let k = 0; k < rows; k++) for (let j = 0; j < cols; j++) { roundRadius.push(m.R[k]!); axial.push(m.S[k]!) }
    pos = collapseTube(rest, { foldRadiusMm: yr * 4, ...o.collapse, yarnRadiusMm: yr, roundRadius, axial })
  } else if (start === 'side') {
    pos = rest.map((p) => ({ x: p.x, y: -p.z, z: p.y }))
  } else {
    pos = rest.map((p) => ({ ...p }))
  }
  {
    let zmin = Infinity
    for (const p of pos) if (p.z < zmin) zmin = p.z
    const lift = floorZ + yr * 0.5 - zmin
    for (const p of pos) p.z += lift
  }
  // Deterministic jitter so a perfectly symmetric start still buckles.
  {
    let s = (o.seed ?? 1) >>> 0 || 1
    const rnd = (): number => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 - 0.5 }
    for (const p of pos) { p.x += rnd() * yr * 0.02; p.y += rnd() * yr * 0.02; p.z += rnd() * yr * 0.02 }
  }

  // ── settle ───────────────────────────────────────────────────────────────
  const g = o.gravity ?? 0.06
  const steps = o.steps ?? 700
  const iters = o.iterations ?? 8
  const damp = o.damping ?? 0.985
  const mu = o.friction ?? 0.6
  const vmax = T * 0.45
  const prev = pos.map((p) => ({ ...p }))
  const colliders = o.colliders ?? []
  const edgeTable = colliders.find((c) => c.kind === 'tableEdge')
  const grid = new Hash(T)
  const near: number[] = []
  const T2 = T * T
  let lastMove = 0
  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < N; i++) {
      const p = pos[i]!, q = prev[i]!
      let vx = (p.x - q.x) * damp, vy = (p.y - q.y) * damp, vz = (p.z - q.z) * damp - g
      const vl = Math.hypot(vx, vy, vz)
      if (vl > vmax) { vx *= vmax / vl; vy *= vmax / vl; vz *= vmax / vl }
      q.x = p.x; q.y = p.y; q.z = p.z
      p.x += vx; p.y += vy; p.z += vz
    }
    for (let it = 0; it < iters; it++) {
      for (const e of edges) project(pos, w, e)
      for (const e of bends) project(pos, w, e)
      // Self-collision at the fabric thickness (once a step: the costly pass).
      if (it === iters - 1) {
      grid.build(pos)
      for (let i = 0; i < N; i++) {
        const a = pos[i]!
        grid.near(a, near)
        for (const j of near) {
          if (j <= i || bonded.has(pkey(i, j))) continue
          const b = pos[j]!
          const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
          const d2 = dx * dx + dy * dy + dz * dz
          if (d2 >= T2 || d2 < 1e-12) continue
          const d = Math.sqrt(d2)
          const ws = w[i]! + w[j]!
          const corr = ((T - d) / d) * 0.5
          const fa = corr * (w[i]! / ws), fb = corr * (w[j]! / ws)
          a.x -= dx * fa; a.y -= dy * fa; a.z -= dz * fa
          b.x += dx * fb; b.y += dy * fb; b.z += dz * fb
        }
      }
      }
      // Props, then the table (one-sided, with friction on contact).
      for (let i = 0; i < N; i++) {
        const p = pos[i]!
        let contact = false
        for (const c of colliders) {
          const { d, g: gr } = colliderSdf(c, p)
          const gap = c.kind === 'tableEdge' ? floorZ : T / 2
          if (d < gap) {
            const push = gap - d
            p.x += gr.x * push; p.y += gr.y * push; p.z += gr.z * push
            contact = true
          }
        }
        const onTable = edgeTable ? p.x <= edgeTable.xEdge - edgeTable.radius : true
        if (onTable && p.z < floorZ) { p.z = floorZ; contact = true }
        if (contact) {
          const q = prev[i]!
          p.x = q.x + (p.x - q.x) * (1 - mu)
          p.y = q.y + (p.y - q.y) * (1 - mu)
        }
      }
    }
    if (step === steps - 1) {
      for (let i = 0; i < N; i++) {
        const mv = Math.hypot(pos[i]!.x - prev[i]!.x, pos[i]!.y - prev[i]!.y, pos[i]!.z - prev[i]!.z)
        if (mv > lastMove) lastMove = mv
      }
    }
  }
  let stretch = 0
  for (const e of edges) {
    const a = pos[e.a]!, b = pos[e.b]!
    const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
    if (e.rest > 1e-6) stretch += Math.abs(d - e.rest) / e.rest
  }
  stretch /= edges.length

  // Yarn back on the settled sheet, in strand order, the table at z = 0.
  const nodesWorld = skin(m, pos)
  const world = built.strandPath.map((ni) => nodesWorld[ni]!)
  return { world, coarse: { rows, cols, pos, rest }, stretch, lastMove, thicknessMm: T }
}

/** The shell round trip with no drape at all: every node back where the relax
 *  left it (to a fraction of a yarn radius). Exposed for the test. */
export function shellRoundTrip(built: BuiltContinuous, cols = 72): { maxErr: number; meanErr: number } {
  const m = built.frame === 'surface' ? shellOfTube(built, cols) : shellOfFlat(built, cols)
  const back = skin(m, restMesh(m))
  const nodes = built.model.nodes
  let maxErr = 0, sum = 0
  for (let i = 0; i < nodes.length; i++) {
    const e = Math.hypot(back[i]!.x - nodes[i]!.x, back[i]!.y - nodes[i]!.y, back[i]!.z - nodes[i]!.z)
    if (e > maxErr) maxErr = e
    sum += e
  }
  return { maxErr, meanErr: sum / nodes.length }
}

/** The camera for a draped piece: a flat-lay product angle from above (NB a
 *  higher `tiltDeg` is a LOWER camera in loom_render_crochet.py), close in,
 *  aimed just above the table, on a wide ground. */
export function drapedView(o: DrapeOptions): {
  marginFactor: number; tiltDeg: number; openFabric: true; yawDeg: number; aimHeightFrac: number; lightRig: 'product'; groundScale: number
  stageTiltDeg: number; stageZoom: number
} {
  const v = o.view ?? {}
  const tilt = v.tiltDeg ?? 24
  return {
    marginFactor: v.marginFactor ?? 0.1,
    tiltDeg: tilt,
    // A styled set keeps its own eye-level camera unless told: the same tilt
    // from above, framed tighter than a toy (the piece is wide and low).
    stageTiltDeg: tilt,
    stageZoom: v.stageZoom ?? 0.72,
    openFabric: true,
    yawDeg: v.yawDeg ?? 18,
    aimHeightFrac: v.aimHeightFrac ?? 0.08,
    lightRig: 'product',
    groundScale: v.groundScale ?? 16,
  }
}

/** The render props of a drape's colliders (the ones given a colour). */
export function drapeProps(o: DrapeOptions): { centre: number[]; axes: number[][]; hex: string; gloss: number }[] {
  const out: { centre: number[]; axes: number[][]; hex: string; gloss: number }[] = []
  for (const c of o.colliders ?? []) {
    if (c.kind === 'ellipsoid' && c.hex) {
      out.push({ centre: [c.centre.x, c.centre.y, c.centre.z], axes: [[c.semi.x, 0, 0], [0, c.semi.y, 0], [0, 0, c.semi.z]], hex: c.hex, gloss: c.gloss ?? 0.1 })
    }
  }
  return out
}
