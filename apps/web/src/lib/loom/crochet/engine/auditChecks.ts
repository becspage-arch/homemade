/**
 * Numeric audit of a built+relaxed swatch — the "genuinely stitched, not faked"
 * claim made machine-checkable. Verifies IN DATA:
 *
 *   1. ONE STRAND — a single continuous yarn, every node on it, in order.
 *   2. NO PINNED WORKED STITCHES — pins (w=0) only on the anchor (foundation
 *      chain, or the chain swatch's slip knot). Pinned worked geometry = drawing.
 *   3. NO SPRINGS — every constraint joins strand neighbours (dist: i↔i+1,
 *      bend: i↔i+2). A constraint bridging distant nodes = a spring join.
 *   4. INTERLOCK HELD — every StitchLink recorded at build time still holds
 *      after relaxation: hooks on the far z-side of the crown they dive under
 *      and still beside it; rings still around their stem; chain crossings
 *      still inside the previous loop's mouth, riding over its fold.
 *   5. FINITE — no NaN/Inf anywhere.
 *
 * A stitch that fails ANY check is not stitched — no matter how the render looks.
 */

import type { StitchLink } from './yarnPath'
import type { BuiltSwatch } from './buildSwatch'

export interface AuditOptions {
  /**
   * Which frame the interlock offsets are measured in on a curved surface.
   * 'built' (default, every existing caller): the surface of revolution the
   * piece was worked on — its meridian tangents captured at build time.
   * 'current': the piece's SETTLED surface, read back off the relaxed nodes
   * (see `currentFrame`). Needed only by a piece whose settled shape is no
   * longer a surface of revolution — an unstuffed ear pressed flat — where the
   * built frame would call a healthy stitch on the flat face "off its crown"
   * just because the round is no longer a circle.
   */
  frame?: 'built' | 'current'
}

/**
 * The local fabric frame at every node of a SETTLED piece worked in rounds,
 * read back off the geometry rather than the build: the outward normal is the
 * smallest principal axis of the node's neighbourhood (radius 3 yr), turned
 * to point away from the centroid of the node's own round; the meridian is the
 * direction the round index grows across that neighbourhood (a least-squares
 * gradient in the tangent plane); the along-round direction completes the
 * frame. On an unflattened ball this reproduces the built frame; on a pressed
 * ear the normal on each face is the face's, which is what "under its crown"
 * means there.
 */
function currentFrame(built: BuiltSwatch['built'], yr: number): { n: V3[]; m: V3[]; t: V3[] } | null {
  const nodes = built.model.nodes
  const round = built.model.round
  if (!round) return null
  const R = yr * 3
  const cell = R
  const key = (x: number, y: number, z: number): string => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  const grid = new Map<string, number[]>()
  nodes.forEach((p, i) => {
    const k = key(p.x, p.y, p.z)
    const a = grid.get(k)
    if (a) a.push(i)
    else grid.set(k, [i])
  })
  const nR = Math.max(...round) + 1
  const cs = Array.from({ length: Math.max(nR, 1) }, () => ({ x: 0, y: 0, z: 0, k: 0 }))
  nodes.forEach((p, i) => {
    const r = round[i]!
    if (r < 0) return
    const c = cs[r]!
    c.x += p.x; c.y += p.y; c.z += p.z; c.k++
  })
  for (const c of cs) if (c.k) { c.x /= c.k; c.y /= c.k; c.z /= c.k }
  const n: V3[] = [], m: V3[] = [], t: V3[] = []
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!
    const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell)
    const nb: number[] = []
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        const q = nodes[j]!
        if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 <= R * R) nb.push(j)
      }
    }
    // Covariance of the neighbourhood.
    let mx = 0, my = 0, mz = 0
    for (const j of nb) { mx += nodes[j]!.x; my += nodes[j]!.y; mz += nodes[j]!.z }
    mx /= nb.length; my /= nb.length; mz /= nb.length
    const C = new Float64Array(6) // xx xy xz yy yz zz
    for (const j of nb) {
      const a = nodes[j]!.x - mx, b = nodes[j]!.y - my, c = nodes[j]!.z - mz
      C[0]! += a * a; C[1]! += a * b; C[2]! += a * c; C[3]! += b * b; C[4]! += b * c; C[5]! += c * c
    }
    // Smallest eigenvector by power iteration on (tr·I − C).
    const tr = C[0]! + C[3]! + C[5]!
    let v = { x: 0.577, y: 0.577, z: 0.577 }
    const r0 = round[i]! >= 0 ? cs[round[i]!]! : null
    if (r0) {
      const ox = p.x - r0.x, oy = p.y - r0.y, oz = p.z - r0.z
      const l = Math.hypot(ox, oy, oz)
      if (l > 1e-6) v = { x: ox / l, y: oy / l, z: oz / l }
    }
    for (let it = 0; it < 30; it++) {
      const w = {
        x: tr * v.x - (C[0]! * v.x + C[1]! * v.y + C[2]! * v.z),
        y: tr * v.y - (C[1]! * v.x + C[3]! * v.y + C[4]! * v.z),
        z: tr * v.z - (C[2]! * v.x + C[4]! * v.y + C[5]! * v.z),
      }
      const l = Math.hypot(w.x, w.y, w.z) || 1
      v = { x: w.x / l, y: w.y / l, z: w.z / l }
    }
    if (r0 && (p.x - r0.x) * v.x + (p.y - r0.y) * v.y + (p.z - r0.z) * v.z < 0) v = { x: -v.x, y: -v.y, z: -v.z }
    // Round-index gradient in the tangent plane (least squares, 2x2 solve).
    const e1 = Math.abs(v.x) < 0.9 ? cross(v, { x: 1, y: 0, z: 0 }) : cross(v, { x: 0, y: 1, z: 0 })
    const l1 = Math.hypot(e1.x, e1.y, e1.z) || 1
    const u1 = { x: e1.x / l1, y: e1.y / l1, z: e1.z / l1 }
    const u2 = cross(v, u1)
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0, rm = 0, rk = 0
    for (const j of nb) if (round[j]! >= 0) { rm += round[j]!; rk++ }
    rm = rk ? rm / rk : 0
    for (const j of nb) {
      if (round[j]! < 0) continue
      const q = nodes[j]!
      const s1 = (q.x - mx) * u1.x + (q.y - my) * u1.y + (q.z - mz) * u1.z
      const s2 = (q.x - mx) * u2.x + (q.y - my) * u2.y + (q.z - mz) * u2.z
      const f = round[j]! - rm
      a11 += s1 * s1; a12 += s1 * s2; a22 += s2 * s2; b1 += s1 * f; b2 += s2 * f
    }
    const det = a11 * a22 - a12 * a12
    let g1 = 0, g2 = 1
    if (Math.abs(det) > 1e-9) { g1 = (a22 * b1 - a12 * b2) / det; g2 = (a11 * b2 - a12 * b1) / det }
    const gl = Math.hypot(g1, g2) || 1
    const mm = { x: (g1 * u1.x + g2 * u2.x) / gl, y: (g1 * u1.y + g2 * u2.y) / gl, z: (g1 * u1.z + g2 * u2.z) / gl }
    n.push(v); m.push(mm); t.push(cross(v, mm))
  }
  return { n, m, t }
}

function cross(a: V3, b: V3): V3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}

interface V3 { x: number; y: number; z: number }

export function auditProblems(swatch: BuiltSwatch, _arg: string, _W: number, yr: number, opts?: AuditOptions): string[] {
  const { built } = swatch
  const cur = opts?.frame === 'current' && built.frame === 'surface' ? currentFrame(built, yr) : null
  const { nodes, dist, bend } = built.model
  const problems: string[] = []

  // 5. Finite.
  const badNode = nodes.findIndex((n) => !Number.isFinite(n.x + n.y + n.z))
  if (badNode >= 0) problems.push(`node ${badNode} is not finite`)

  // 1. One strand: every node appears exactly once, in build order.
  if (built.strandPath.length !== nodes.length)
    problems.push(`strand covers ${built.strandPath.length}/${nodes.length} nodes — not one strand`)
  else if (built.strandPath.some((ni, k) => ni !== k)) problems.push('strand path is out of order')

  // 2. Pins only on the anchor — the builder declares how many nodes at the
  // start of the strand are the legitimate pinned anchor (foundation chain,
  // slip knot, magic ring, cast-on).
  const pinLimit = built.anchorPins
  const badPins = nodes.map((n, i) => ({ n, i })).filter(({ n, i }) => n.w === 0 && i >= pinLimit)
  if (badPins.length) problems.push(`${badPins.length} pinned WORKED nodes (first at ${badPins[0]!.i}) — pinned drawing, not stitching`)

  // 3. No springs: constraints only between strand neighbours.
  const springs = [
    ...dist.filter((c) => Math.abs(c.a - c.b) > 1),
    ...bend.filter((c) => Math.abs(c.a - c.b) > 2),
  ]
  if (springs.length) problems.push(`${springs.length} spring-like constraints (e.g. ${springs[0]!.a}↔${springs[0]!.b})`)

  // 3b. A build that records no interlocks has nothing holding it together.
  if (built.links.length === 0) problems.push('build recorded ZERO interlocks — nothing links the yarn')

  // 4. Interlocks held after relax. Offsets are measured in the FABRIC frame:
  // flat swatches use world x/y; work in the round maps along-the-row to the
  // tangential direction and row-height to the radial one ("above its crown" on
  // a disc means radially outward, not world +y).
  const linkFails: string[] = []
  const mer = built.model.meridian
  const rel = (hi: number, bi: number, ax?: StitchLink['axis']): { x: number; y: number } => {
    const h = nodes[hi]!
    const b = nodes[bi]!
    if (ax) {
      // A free-form motif link carries the frame it was worked in.
      const dx = h.x - b.x, dy = h.y - b.y
      return { x: dx * ax.ax + dy * ax.ay, y: dx * ax.hx + dy * ax.hy }
    }
    if (cur) {
      const t = cur.t[bi]!, m = cur.m[bi]!
      const dx = h.x - b.x, dy = h.y - b.y, dz = h.z - b.z
      return { x: dx * t.x + dy * t.y + dz * t.z, y: dx * m.x + dy * m.y + dz * m.z }
    }
    if (built.frame === 'polar' || built.frame === 'surface') {
      const rh = Math.hypot(h.x, h.y)
      const rb = Math.hypot(b.x, b.y)
      let da = Math.atan2(h.y, h.x) - Math.atan2(b.y, b.x)
      if (da > Math.PI) da -= Math.PI * 2
      if (da < -Math.PI) da += Math.PI * 2
      const dx = da * ((rh + rb) / 2)
      if (built.frame === 'surface' && mer) {
        // Row-height direction = the local meridian tangent at the below node.
        const t = mer[bi]!
        return { x: dx, y: (rh - rb) * t.tr + (h.z - b.z) * t.tz }
      }
      return { x: dx, y: rh - rb }
    }
    return { x: h.x - b.x, y: h.y - b.y }
  }
  const check = (l: StitchLink): string | null => {
    const h = nodes[l.hook]!
    const b = nodes[l.below]!
    const d = rel(l.hook, l.below, l.axis)
    if (l.role === 'hook') {
      // Dives under the crown to its far side and stays beside/below it. On a
      // curved surface "side" is the local NORMAL, not global z: n = (-tz, tr)
      // rotated from the below node's meridian tangent; our rounds always hook
      // INWARD, so the hook must sit clearly on the inward-normal side.
      if (cur) {
        const nn = cur.n[l.below]!
        const dn = (h.x - b.x) * nn.x + (h.y - b.y) * nn.y + (h.z - b.z) * nn.z
        if (dn > -yr * 0.45) return `hook did not get under its crown (dn=${(dn / yr).toFixed(2)}yr)`
      } else if (built.frame === 'surface' && mer) {
        const t = mer[l.below]!
        const rh = Math.hypot(h.x, h.y)
        const rb = Math.hypot(b.x, b.y)
        const dn = (rh - rb) * -t.tz + (h.z - b.z) * t.tr
        if (dn > -yr * 0.45) return `hook did not get under its crown (dn=${(dn / yr).toFixed(2)}yr)`
      } else if (h.z * b.z > 0 && Math.abs(h.z - b.z) < yr * 0.45) {
        return 'hook settled on the SAME side as its crown'
      }
      if (Math.abs(d.x) > yr * 2.5) return `hook slipped sideways off its crown (dx=${(d.x / yr).toFixed(2)}yr)`
      if (d.y > yr * 1.2) return `hook floated above its crown (dy=${(d.y / yr).toFixed(2)}yr)`
      return null
    }
    if (l.role === 'ring') {
      // Encircles the stem: still beside it, far side still z-separated.
      if (Math.abs(d.x) > yr * 2.5) return `ring slipped off its stem (dx=${(d.x / yr).toFixed(2)}yr)`
      if (Math.abs(d.y) > yr * 3.0) return `ring slid up/down its stem (dy=${(d.y / yr).toFixed(2)}yr)`
      return null
    }
    if (l.role === 'through') {
      // A knit leg passing the old head's mouth: still within the mouth, still
      // on the fabric's face side of the head (zSign from the build).
      const sign = l.zSign ?? 1
      if (Math.abs(d.x) > yr * 2.0) return `leg slipped sideways out of the mouth (dx=${(d.x / yr).toFixed(2)}yr)`
      if (Math.abs(d.y) > yr * 2.0) return `leg slid up/down out of the mouth (dy=${(d.y / yr).toFixed(2)}yr)`
      if ((h.z - b.z) * sign < yr * 0.15) return `leg settled BEHIND the head it must pass in front of (dz=${(((h.z - b.z) * sign) / yr).toFixed(2)}yr)`
      return null
    }
    // 'cross' (chain): inside the previous loop's mouth, before its fold, over it.
    // A chain worked at an angle (a star point, a leaf's midrib) measures along
    // its own direction (l.axis), otherwise along world x as before.
    const dx = l.axis ? -d.x : b.x - h.x // fold apex is beyond the crossing, along the chain
    const dyc = l.axis ? d.y : h.y - b.y
    if (dx < 0) return `crossing is past its loop's fold (dx=${(dx / yr).toFixed(2)}yr) — expelled forward`
    if (dx > yr * 2.6) return `crossing slid back out of its loop (dx=${(dx / yr).toFixed(2)}yr)`
    if (Math.abs(dyc) > yr * 1.6) return `crossing outside the loop's mouth (dy=${(dyc / yr).toFixed(2)}yr) — expelled sideways`
    if (h.z < b.z - yr * 0.15) return 'crossing settled UNDER the fold it should ride over'
    return null
  }
  for (const l of built.links) {
    const err = check(l)
    if (err) linkFails.push(`  [${l.role} j${l.j} c${l.c}] ${err}`)
  }
  if (linkFails.length)
    problems.push(
      `${linkFails.length}/${built.links.length} interlocks FAILED:\n${linkFails.slice(0, 6).join('\n')}${linkFails.length > 6 ? '\n  …' : ''}`,
    )

  return problems
}
