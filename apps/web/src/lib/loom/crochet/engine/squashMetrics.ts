/**
 * SOFT-SQUASH METRICS — the measuring stick for the squash pass (groundwork,
 * 17 Oct 2026; design note `crochet-bar/jobs/soft-squash.md`).
 *
 * A real stuffed toy is soft: the head presses into the body, the body sits
 * flat on the cloth, a limb dents the fabric where it is sewn. Ours are rigid
 * shells placed so they touch or overlap. Before anyone teaches the engine to
 * squash, this module MEASURES how a settled composition meets itself and the
 * table, so a future squash can be held to numbers instead of to an eye alone:
 *
 *  - per joined pair (a part and the part it is placed `on`): the nearest
 *    yarn-surface GAP (negative = the two yarns clip through each other), the
 *    INTERPENETRATION depth (how far one piece's fabric sits inside the
 *    other's settled shell — the hidden seam today), the CONTACT PATCH (the
 *    area of fabric lying within touching distance of the other piece), the
 *    joint FOOTPRINT (the area the contact region spans) and their ratio,
 *    `contactFill` (a hard crossing line is near 0, a pressed lens near 1),
 *    and the parent's DENT round the join;
 *  - per part and for the whole toy: the GROUND patch (fabric within a half
 *    yarn of the table), the part's plan footprint, the FLAT-BOTTOM ratio
 *    (the patch's equivalent diameter over the footprint's) and the lowest
 *    point (below zero = sunk through the table).
 *
 * READ-ONLY. It reads the composed world (`CompiledComposition.placed[].ctrl`)
 * and never writes a node, so it cannot move a geometry hash or a settled
 * size; `squashMetrics.test.ts` re-checks the hash after measuring.
 *
 * Pure geometry: no dependency on the relaxer, so the test can exercise it on
 * synthetic shapes (two balls touching, crossing, pressed into a lens).
 */

import type { V3 } from '../yarnLoop'
import type { CompiledComposition } from './composition'
import { YARN_WEIGHT_RADIUS_MM } from './program'

/** How a part was made, which says which measures mean anything on it. */
export type SquashPartKind = 'stuffed' | 'tube' | 'pressed' | 'disc' | 'custom'

export interface SquashPartInput {
  name: string
  /** The part it is placed on ('ground' for a piece on the table). */
  on: string
  kind: SquashPartKind
  /** World centre-line control points (mm). */
  ctrl: V3[]
  /** The rendered yarn radius of this part (mm). */
  yarnMm: number
}

export interface SquashInput {
  name: string
  /** The composition's yarn radius (mm): the grid and band scale. */
  yr: number
  parts: SquashPartInput[]
}

export interface PairMetrics {
  child: string
  parent: string
  kinds: string
  /** True when one is placed `on` the other (a sewn or stacked join); false
   *  for two pieces that merely come within touching distance. */
  joined: boolean
  /** Set when the join runs through a hidden connector (a head joined to
   *  the body through a neck buried inside the head). */
  joinedVia?: string
  /** True when one is an ancestor of the other down the placement chain (an
   *  arm on the bodice on the body is related to the body). */
  related: boolean
  /** True when either piece is (nearly) wholly inside the other's shell. */
  buried: boolean
  /** Nearest yarn-surface gap, mm (centre-line distance minus both radii).
   *  Negative = the yarns clip. `null` = nothing within the search radius. */
  gapMm: number | null
  /** Deepest child fabric inside the parent's shell (mm, >= 0), or null when
   *  the parent has no closed shell (pressed, disc, custom). */
  childIntoParentMm: number | null
  /** Deepest parent fabric inside the child's shell (mm), likewise. */
  parentIntoChildMm: number | null
  /** Fraction of the child's nodes inside the parent's shell. */
  childInsideFrac: number | null
  /** Fraction of the parent's nodes inside the child's shell. */
  parentInsideFrac: number | null
  /** max(childIntoParentMm, parentIntoChildMm), 0 when neither is defined. */
  penetrationMm: number
  /** Area (mm²) of fabric within touching distance of the other piece,
   *  averaged over the two sides. */
  contactPatchMm2: number
  /** Area (mm²) the contact region spans (convex hull of the projected
   *  contact fabric). */
  footprintMm2: number
  /** contactPatchMm2 / footprintMm2 (0..1; 0 when there is no contact). */
  contactFill: number
  /** How far the parent's fabric round the join sits below its own shell,
   *  relative to the rest of the parent (mm; > 0 = dented in). null when the
   *  parent has no shell or there is no contact. */
  parentDentMm: number | null
}

export interface GroundPartMetrics {
  part: string
  kind: SquashPartKind
  /** Lowest centre-line point (mm; < 0 = through the table). */
  minZ: number
  /** Fabric within half a yarn radius of the table, plan area (mm²). */
  patchMm2: number
  /** The part's own plan footprint (mm²). */
  footprintMm2: number
  /** sqrt(patch / footprint): equivalent diameters. A rigid ball of radius R
   *  on a band h reads sqrt(2h/R) (~0.2 on a 35 mm ball); a toy sat flat on
   *  its bottom reads 0.5 or more. */
  flatBottomRatio: number
}

export interface SquashMetrics {
  name: string
  yr: number
  pairs: PairMetrics[]
  /** Every part with fabric within the ground band. */
  ground: GroundPartMetrics[]
  /** The whole toy's ground patch (mm²) and lowest point. */
  groundPatchMm2: number
  minZ: number
}

// ─── Constants: the measuring bands (not knobs of the toy). ───

/** Grid cell for area estimates, in yarn radii. */
const CELL_YR = 1.5
/** Contact = centre-lines within this multiple of the two radii' sum. */
const CONTACT_SLACK = 1.3
/** The ground band, in yarn radii above z = 0. */
const GROUND_BAND_YR = 0.5
/** A piece this much inside another's shell is a hidden connector (a neck
 *  inside the head), not a surface that can press. */
const BURIED_FRAC = 0.9
/** Gap search radius (mm, in yarn radii): beyond it a pair reads "apart". */
const GAP_SEARCH_YR = 12

// ─── Small geometry helpers. ───

/** A uniform hash grid over points, for nearest-neighbour queries. */
class Grid {
  private readonly cells = new Map<string, number[]>()
  constructor(readonly pts: V3[], readonly cell: number) {
    for (let i = 0; i < pts.length; i++) {
      const k = this.key(pts[i]!)
      const c = this.cells.get(k)
      if (c) c.push(i)
      else this.cells.set(k, [i])
    }
  }
  private key(p: V3): string {
    return `${Math.floor(p.x / this.cell)},${Math.floor(p.y / this.cell)},${Math.floor(p.z / this.cell)}`
  }
  /** Distance to the nearest point, searching out to `maxR` (Infinity if none). */
  nearest(p: V3, maxR: number): number {
    const ix = Math.floor(p.x / this.cell), iy = Math.floor(p.y / this.cell), iz = Math.floor(p.z / this.cell)
    const ring = Math.ceil(maxR / this.cell)
    let best = Infinity
    for (let r = 0; r <= ring; r++) {
      // Once a hit is closer than everything the next shell could hold, stop.
      if (best < (r - 1) * this.cell) break
      for (let dx = -r; dx <= r; dx++)
        for (let dy = -r; dy <= r; dy++)
          for (let dz = -r; dz <= r; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue
            const c = this.cells.get(`${ix + dx},${iy + dy},${iz + dz}`)
            if (!c) continue
            for (const j of c) {
              const q = this.pts[j]!
              const d = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z)
              if (d < best) best = d
            }
          }
    }
    return best <= maxR ? best : Infinity
  }
}

/** A part's settled shell as a surface of revolution about its pole axis
 *  (first → last strand point), widest radius per axial bin, smoothed once.
 *  The same reading the composition's own contact pass makes; kept here as
 *  its own copy so this module stays read-only and independent of it. */
interface Shell {
  c: V3
  axis: V3
  t0: number
  step: number
  R: number[]
}

function buildShell(cloud: V3[], bins = 16): Shell {
  let cx = 0, cy = 0, cz = 0
  for (const p of cloud) { cx += p.x; cy += p.y; cz += p.z }
  const c: V3 = { x: cx / cloud.length, y: cy / cloud.length, z: cz / cloud.length }
  const p0 = cloud[0]!, p1 = cloud[cloud.length - 1]!
  const al = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z) || 1
  const axis: V3 = { x: (p1.x - p0.x) / al, y: (p1.y - p0.y) / al, z: (p1.z - p0.z) / al }
  let lo = Infinity, hi = -Infinity
  for (const p of cloud) {
    const t = (p.x - c.x) * axis.x + (p.y - c.y) * axis.y + (p.z - c.z) * axis.z
    if (t < lo) lo = t
    if (t > hi) hi = t
  }
  const step = (hi - lo) / bins || 1
  const R = new Array<number>(bins + 1).fill(0)
  for (const p of cloud) {
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z
    const t = dx * axis.x + dy * axis.y + dz * axis.z
    const rho = Math.sqrt(Math.max(dx * dx + dy * dy + dz * dz - t * t, 0))
    const k = Math.max(0, Math.min(bins, Math.round((t - lo) / step)))
    if (rho > R[k]!) R[k] = rho
  }
  const Rs = R.slice()
  for (let k = 1; k < R.length - 1; k++) Rs[k] = (R[k - 1]! + 2 * R[k]! + R[k + 1]!) / 4
  return { c, axis, t0: lo, step, R: Rs }
}

/** Depth of a point inside a shell (mm, > 0 = inside, < 0 = outside by
 *  that much radially); null past a pole. */
function shellDepth(sh: Shell, p: V3): number | null {
  const dx = p.x - sh.c.x, dy = p.y - sh.c.y, dz = p.z - sh.c.z
  const t = dx * sh.axis.x + dy * sh.axis.y + dz * sh.axis.z
  const rho = Math.sqrt(Math.max(dx * dx + dy * dy + dz * dz - t * t, 0))
  const f = (t - sh.t0) / sh.step
  if (f < 0 || f > sh.R.length - 1) return null
  const i = Math.max(0, Math.min(sh.R.length - 2, Math.floor(f)))
  const u = f - i
  const radial = sh.R[i]! * (1 - u) + sh.R[i + 1]! * u - rho
  if (radial <= 0) return radial
  // Inside: the nearer of the radial and the two axial rays to the surface
  // (each is a distance to a surface point, so their minimum is the closest
  // of the three; without the axial rays a point near a pole on the axis
  // would read the whole equatorial radius deep).
  const t1 = sh.t0 + sh.step * (sh.R.length - 1)
  return Math.min(radial, t - sh.t0, t1 - t)
}

function hasShell(kind: SquashPartKind): boolean {
  return kind === 'stuffed' || kind === 'tube'
}

/** Occupied-cell area of 2-D points (mm²). */
function occupancyArea(pts: [number, number][], cell: number): number {
  const s = new Set<string>()
  for (const [u, v] of pts) s.add(`${Math.floor(u / cell)},${Math.floor(v / cell)}`)
  return s.size * cell * cell
}

/** Convex hull area of 2-D points (monotone chain). */
function hullArea(pts: [number, number][]): number {
  if (pts.length < 3) return 0
  const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: [number, number], a: [number, number], b: [number, number]): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: [number, number][] = []
  for (const p of P) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: [number, number][] = []
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i]!
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop()
    upper.push(p)
  }
  const h = lower.slice(0, -1).concat(upper.slice(0, -1))
  let a = 0
  for (let i = 0; i < h.length; i++) {
    const p = h[i]!, q = h[(i + 1) % h.length]!
    a += p[0] * q[1] - q[0] * p[1]
  }
  return Math.abs(a) / 2
}

/** Project points onto the plane square to unit `n` (2-D coordinates). */
function project(pts: V3[], n: V3): [number, number][] {
  // Any unit vector not parallel to n, then two in-plane axes.
  const a: V3 = Math.abs(n.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 }
  const d = a.x * n.x + a.y * n.y + a.z * n.z
  let e1 = { x: a.x - d * n.x, y: a.y - d * n.y, z: a.z - d * n.z }
  const l1 = Math.hypot(e1.x, e1.y, e1.z) || 1
  e1 = { x: e1.x / l1, y: e1.y / l1, z: e1.z / l1 }
  const e2 = { x: n.y * e1.z - n.z * e1.y, y: n.z * e1.x - n.x * e1.z, z: n.x * e1.y - n.y * e1.x }
  return pts.map((p) => [p.x * e1.x + p.y * e1.y + p.z * e1.z, p.x * e2.x + p.y * e2.y + p.z * e2.z])
}

function centroid(pts: V3[]): V3 {
  let x = 0, y = 0, z = 0
  for (const p of pts) { x += p.x; y += p.y; z += p.z }
  const n = pts.length || 1
  return { x: x / n, y: y / n, z: z / n }
}

/** Least-variance direction of a point set (the normal of its best plane),
 *  by power iteration on the inverted covariance's shift. */
function planeNormal(pts: V3[], fallback: V3): V3 {
  if (pts.length < 3) return fallback
  const c = centroid(pts)
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (const p of pts) {
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z
    xx += dx * dx; xy += dx * dy; xz += dx * dz; yy += dy * dy; yz += dy * dz; zz += dz * dz
  }
  // Smallest eigenvector of C = largest of (tr·I − C).
  const tr = xx + yy + zz
  const M = [[tr - xx, -xy, -xz], [-xy, tr - yy, -yz], [-xz, -yz, tr - zz]]
  let v = { x: fallback.x + 1e-3, y: fallback.y + 2e-3, z: fallback.z + 3e-3 }
  for (let k = 0; k < 60; k++) {
    const w = {
      x: M[0]![0]! * v.x + M[0]![1]! * v.y + M[0]![2]! * v.z,
      y: M[1]![0]! * v.x + M[1]![1]! * v.y + M[1]![2]! * v.z,
      z: M[2]![0]! * v.x + M[2]![1]! * v.y + M[2]![2]! * v.z,
    }
    const l = Math.hypot(w.x, w.y, w.z) || 1
    v = { x: w.x / l, y: w.y / l, z: w.z / l }
  }
  return v
}

interface Box { minx: number; maxx: number; miny: number; maxy: number; minz: number; maxz: number }
function bounds(pts: V3[]): Box {
  const b: Box = { minx: Infinity, maxx: -Infinity, miny: Infinity, maxy: -Infinity, minz: Infinity, maxz: -Infinity }
  for (const p of pts) {
    if (p.x < b.minx) b.minx = p.x
    if (p.x > b.maxx) b.maxx = p.x
    if (p.y < b.miny) b.miny = p.y
    if (p.y > b.maxy) b.maxy = p.y
    if (p.z < b.minz) b.minz = p.z
    if (p.z > b.maxz) b.maxz = p.z
  }
  return b
}
function boxGap(a: Box, b: Box): number {
  const dx = Math.max(0, a.minx - b.maxx, b.minx - a.maxx)
  const dy = Math.max(0, a.miny - b.maxy, b.miny - a.maxy)
  const dz = Math.max(0, a.minz - b.maxz, b.minz - a.maxz)
  return Math.hypot(dx, dy, dz)
}

// `|| 0` folds -0 into 0, so a metric survives a JSON round trip unchanged.
const r1 = (v: number): number => Math.round(v * 10) / 10 || 0
const r3 = (v: number): number => Math.round(v * 1000) / 1000 || 0

// ─── The measures. ───

function measurePair(child: SquashPartInput, parent: SquashPartInput, yr: number, joined: boolean, related: boolean): PairMetrics {
  const touch = (child.yarnMm + parent.yarnMm) * CONTACT_SLACK
  const searchR = GAP_SEARCH_YR * yr
  const gridP = new Grid(parent.ctrl, Math.max(touch, yr * 2))
  const gridC = new Grid(child.ctrl, Math.max(touch, yr * 2))
  const pShell = hasShell(parent.kind) ? buildShell(parent.ctrl) : null
  const cShell = hasShell(child.kind) ? buildShell(child.ctrl) : null

  // Interpenetration against each side's closed shell. A node with depth > 0
  // is under the other piece's outermost yarn: HIDDEN (the seam, or a clip).
  const depthC = child.ctrl.map((p) => (pShell ? shellDepth(pShell, p) : null))
  const depthP = parent.ctrl.map((p) => (cShell ? shellDepth(cShell, p) : null))
  const deepest = (d: (number | null)[]): number => d.reduce<number>((m, h) => (h != null && h > m ? h : m), 0)
  const insideOf = (d: (number | null)[]): number => d.filter((h) => h != null && h > 0).length / Math.max(d.length, 1)
  const cIntoP = pShell ? deepest(depthC) : null
  const pIntoC = cShell ? deepest(depthP) : null
  const cInside = pShell ? insideOf(depthC) : null
  const pInside = cShell ? insideOf(depthP) : null

  // Contact: VISIBLE fabric (not under the other's shell) within touching
  // distance of the other piece's yarn. A rigid crossing leaves only a thin
  // ring of it round the crossing line; a pressed join leaves a filled lens.
  let minD = Infinity
  const contactC: V3[] = []
  for (let i = 0; i < child.ctrl.length; i++) {
    const p = child.ctrl[i]!
    // The search only has to beat the best gap so far (and still see contact).
    const d = gridP.nearest(p, Math.max(touch, Math.min(searchR, minD)))
    if (d < minD) minD = d
    const h = depthC[i]
    if (d <= touch && !(h != null && h > 0)) contactC.push(p)
  }
  const contactP: V3[] = []
  for (let i = 0; i < parent.ctrl.length; i++) {
    const h = depthP[i]
    if (h != null && h > 0) continue
    if (gridC.nearest(parent.ctrl[i]!, touch) <= touch) contactP.push(parent.ctrl[i]!)
  }

  // Patch: occupancy of each side's contact fabric on the contact region's
  // best plane, averaged; footprint: the hull of both together.
  const all = contactC.concat(contactP)
  const cc = centroid(child.ctrl), pc = centroid(parent.ctrl)
  const between = (() => {
    const v = { x: cc.x - pc.x, y: cc.y - pc.y, z: cc.z - pc.z }
    const l = Math.hypot(v.x, v.y, v.z) || 1
    return { x: v.x / l, y: v.y / l, z: v.z / l }
  })()
  const n = planeNormal(all, between)
  const cell = CELL_YR * yr
  const patch = all.length ? (occupancyArea(project(contactC, n), cell) + occupancyArea(project(contactP, n), cell)) / 2 : 0
  const foot = all.length >= 3 ? Math.max(hullArea(project(all, n)), patch) : patch
  const fill = foot > 0 ? patch / foot : 0

  // The parent's dent round the join: visible parent fabric near (not in)
  // the contact, how far it sits below the parent's own shell, against the
  // parent's average (the yarn's own relief cancels).
  let dent: number | null = null
  if (pShell && all.length) {
    const jc = centroid(all)
    const rad = Math.sqrt(foot / Math.PI) + 3 * yr
    let ring = 0, rk = 0, glob = 0, gk = 0
    for (let i = 0; i < parent.ctrl.length; i++) {
      const p = parent.ctrl[i]!
      const h = shellDepth(pShell, p)
      if (h == null) continue
      glob += h; gk++
      const hc = depthP[i]
      if (hc != null && hc > 0) continue
      if (Math.hypot(p.x - jc.x, p.y - jc.y, p.z - jc.z) > rad) continue
      if (gridC.nearest(p, touch) <= touch) continue
      ring += h; rk++
    }
    if (rk && gk) dent = ring / rk - glob / gk
  }

  const gap = Number.isFinite(minD) ? minD - child.yarnMm - parent.yarnMm : null
  return {
    child: child.name,
    parent: parent.name,
    kinds: `${child.kind}/${parent.kind}`,
    joined,
    related,
    buried: (cInside ?? 0) >= BURIED_FRAC || (pInside ?? 0) >= BURIED_FRAC,
    gapMm: gap == null ? null : r1(gap),
    childIntoParentMm: cIntoP == null ? null : r1(cIntoP),
    parentIntoChildMm: pIntoC == null ? null : r1(pIntoC),
    childInsideFrac: cInside == null ? null : r3(cInside),
    parentInsideFrac: pInside == null ? null : r3(pInside),
    penetrationMm: r1(Math.max(cIntoP ?? 0, pIntoC ?? 0)),
    contactPatchMm2: Math.round(patch),
    footprintMm2: Math.round(foot),
    contactFill: r3(fill),
    parentDentMm: dent == null ? null : r1(dent),
  }
}

function measureGround(part: SquashPartInput, yr: number): GroundPartMetrics | null {
  const band = GROUND_BAND_YR * yr
  let minZ = Infinity
  const low: [number, number][] = []
  for (const p of part.ctrl) {
    if (p.z < minZ) minZ = p.z
    if (p.z <= band) low.push([p.x, p.y])
  }
  if (!low.length) return null
  const cell = CELL_YR * yr
  const patch = occupancyArea(low, cell)
  const foot = occupancyArea(part.ctrl.map((p) => [p.x, p.y] as [number, number]), cell)
  return {
    part: part.name,
    kind: part.kind,
    minZ: r1(minZ),
    patchMm2: Math.round(patch),
    footprintMm2: Math.round(foot),
    flatBottomRatio: r3(foot > 0 ? Math.sqrt(patch / foot) : 0),
  }
}

/** Measure a composed world. Read-only. */
export function measureSquash(input: SquashInput): SquashMetrics {
  // Every pair that comes within touching distance, joined or not: a paw
  // resting on the tummy or an ear on a foot presses as much as a seam does.
  // A joined pair is measured even when apart (a sewn piece whose fabric
  // never reaches its parent is worth seeing).
  const pairs: PairMetrics[] = []
  const boxes = input.parts.map((p) => bounds(p.ctrl))
  const onOf = new Map(input.parts.map((p) => [p.name, p.on]))
  const isAncestor = (anc: string, of: string): boolean => {
    let cur = onOf.get(of)
    for (let guard = 0; cur && cur !== 'ground' && guard < 64; guard++) {
      if (cur === anc) return true
      cur = onOf.get(cur)
    }
    return false
  }
  for (let j = 0; j < input.parts.length; j++)
    for (let i = 0; i < j; i++) {
      const a = input.parts[j]!, b = input.parts[i]!
      const joined = a.on === b.name || b.on === a.name
      const [child, parent, cb, pb] = b.on === a.name ? [b, a, boxes[i]!, boxes[j]!] : [a, b, boxes[j]!, boxes[i]!]
      const touch = (a.yarnMm + b.yarnMm) * CONTACT_SLACK
      if (!joined && boxGap(cb, pb) > touch) continue
      pairs.push(measurePair(child, parent, input.yr, joined, isAncestor(a.name, b.name) || isAncestor(b.name, a.name)))
    }
  // A piece stacked through a hidden connector (a head on a neck that sits
  // wholly inside it, the neck on the body) is joined to the connector's
  // own parent: the head presses on the body.
  const byName = new Map(input.parts.map((p) => [p.name, p]))
  for (const conn of pairs) {
    if (!conn.joined || !conn.buried) continue
    const hidden = (conn.parentInsideFrac ?? 0) >= BURIED_FRAC ? conn.parent : conn.child
    const outer = hidden === conn.parent ? conn.child : conn.parent
    const below = byName.get(hidden)?.on
    if (!below || below === 'ground' || below === outer) continue
    for (const p of pairs)
      if ((p.child === outer && p.parent === below) || (p.child === below && p.parent === outer)) {
        p.joined = true
        p.joinedVia = hidden
      }
  }
  const ground: GroundPartMetrics[] = []
  for (const part of input.parts) {
    const g = measureGround(part, input.yr)
    if (g) ground.push(g)
  }
  const cell = CELL_YR * input.yr
  const band = GROUND_BAND_YR * input.yr
  const low: [number, number][] = []
  let minZ = Infinity
  for (const part of input.parts)
    for (const p of part.ctrl) {
      if (p.z < minZ) minZ = p.z
      if (p.z <= band) low.push([p.x, p.y])
    }
  return {
    name: input.name,
    yr: input.yr,
    pairs,
    ground,
    groundPatchMm2: Math.round(occupancyArea(low, cell)),
    minZ: r1(minZ),
  }
}

/** What kind of piece a compiled part is, for the measures. */
export function squashKind(part: CompiledComposition['placed'][number]['part']): SquashPartKind {
  if (part.custom) return 'custom'
  if (part.form === 'disc') return 'disc'
  if (part.press || part.pinch) return 'pressed'
  if (part.tube) return 'tube'
  return 'stuffed'
}

/** The measuring input for a compiled composition. Copies the control
 *  points, so nothing the measures do can reach the compiled geometry. */
export function squashInputFromCompiled(name: string, compiled: CompiledComposition): SquashInput {
  return {
    name,
    yr: compiled.yr,
    parts: compiled.placed.map((pp) => ({
      name: pp.part.name,
      on: (pp.part.place as { on: string }).on,
      kind: squashKind(pp.part),
      ctrl: pp.ctrl.map((v) => ({ x: v.x, y: v.y, z: v.z })),
      // A piece worked in a lighter yarn renders that much finer (composition
      // `partScale`); every other piece in the composition's yarn.
      yarnMm: pp.part.yarnWeight ? YARN_WEIGHT_RADIUS_MM[pp.part.yarnWeight] : compiled.yr,
    })),
  }
}

// ─── Rails a future squash must satisfy. ───

export interface SquashRails {
  /** HOLD: lowest point no deeper than this through the table (mm). */
  maxBelowFloorMm: number
  /** HOLD: per pair, penetration may grow at most this over the recorded
   *  baseline (mm). Squash should turn hidden overlap into contact, not dig. */
  maxPenetrationGrowthMm: number
  /** HOLD: per pair, the yarns may clip at most this deep (mm, as a negative
   *  gap), over the baseline's own clip. */
  maxClipGrowthMm: number
  /** TARGET: two soft pieces that only touch (a paw on the tummy, two
   *  crossed arms) press, they do not pass through: penetration at most this
   *  many yarn radii. */
  maxUnjoinedPenetrationYr: number
  /** TARGET: every joined soft pair's contactFill at least this. */
  minContactFill: number
  /** TARGET: every stuffed piece standing on the table reaches this
   *  flat-bottom ratio. */
  minFlatBottomRatio: number
  /** TARGET: each joined soft pair's contact patch at least this many
   *  times its baseline. */
  minContactGrowth: number
}

/** Defaults. The HOLD rails pass on every preset today; the TARGET rails are
 *  what the squash pass is for, and fail today (see the design note). */
export const SQUASH_RAILS: SquashRails = {
  maxBelowFloorMm: 0.5,
  maxPenetrationGrowthMm: 1.0,
  maxClipGrowthMm: 0.5,
  maxUnjoinedPenetrationYr: 1,
  minContactFill: 0.6,
  minFlatBottomRatio: 0.45,
  minContactGrowth: 1.5,
}

export interface RailResult {
  hold: string[]
  target: string[]
}

/** Check a measurement against the rails, with an optional baseline (the
 *  same preset before squash) for the relative rails. */
export function checkSquashRails(m: SquashMetrics, baseline?: SquashMetrics, rails: SquashRails = SQUASH_RAILS): RailResult {
  const hold: string[] = []
  const target: string[] = []
  if (m.minZ < -rails.maxBelowFloorMm) hold.push(`${m.name}: lowest point ${m.minZ} mm through the table`)
  const base = new Map((baseline?.pairs ?? []).map((p) => [`${p.child}>${p.parent}`, p]))
  for (const p of m.pairs) {
    const b = base.get(`${p.child}>${p.parent}`)
    const label = `${m.name} ${p.child}>${p.parent}`
    if (b) {
      if (p.penetrationMm > b.penetrationMm + rails.maxPenetrationGrowthMm)
        hold.push(`${label}: penetration ${p.penetrationMm} mm, baseline ${b.penetrationMm}`)
      if (p.gapMm != null && b.gapMm != null && p.gapMm < Math.min(b.gapMm, 0) - rails.maxClipGrowthMm)
        hold.push(`${label}: yarns clip ${-p.gapMm} mm, baseline gap ${b.gapMm}`)
    }
    // The pressing targets: two soft (shelled) pieces that meet, neither one
    // a hidden connector, and actually touching (gap within one yarn).
    const soft = /^(stuffed|tube)\/(stuffed|tube)$/.test(p.kinds)
    if (!soft || p.buried || p.gapMm == null || p.gapMm > m.yr) continue
    if (p.joined) {
      if (p.contactFill < rails.minContactFill) target.push(`${label}: contactFill ${p.contactFill} < ${rails.minContactFill}`)
      if (b && p.contactPatchMm2 < b.contactPatchMm2 * rails.minContactGrowth)
        target.push(`${label}: contact ${p.contactPatchMm2} mm² < ${rails.minContactGrowth}x baseline ${b.contactPatchMm2}`)
    } else if (!p.related && p.penetrationMm > rails.maxUnjoinedPenetrationYr * m.yr) {
      target.push(`${label}: unjoined pieces pass ${p.penetrationMm} mm into each other (limit ${r1(rails.maxUnjoinedPenetrationYr * m.yr)})`)
    }
  }
  for (const g of m.ground) {
    if (g.kind !== 'stuffed' && g.kind !== 'tube') continue
    if (g.flatBottomRatio < rails.minFlatBottomRatio)
      target.push(`${m.name} ${g.part}: flat-bottom ${g.flatBottomRatio} < ${rails.minFlatBottomRatio}`)
  }
  return { hold, target }
}
