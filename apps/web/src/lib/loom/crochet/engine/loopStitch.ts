/**
 * LOOP STITCH (UK lp st) and the loop-stitch FRINGE / HAIR PATCH — §8j.
 *
 * The real stitch, as a maker works it (UK terms): on a wrong-side row (or with
 * the inside of a piece facing you in the round), insert the hook into the next
 * stitch, wrap the working yarn from front to back round a finger held behind
 * the work, catch the yarn behind the finger and pull it through the stitch
 * (2 loops on hook), yarn round hook and pull through both. The finger is then
 * slipped out and a loop of yarn is left standing on the side AWAY from you —
 * the right side. It is a plain dc (UK; US sc) whose insertion carries a long
 * extra length of yarn.
 *
 * Traced as that one strand does it, so nothing is drawn:
 *
 *   down-leg → approach the stitch below
 *     → root A: the yarn passes UNDER the head of the stitch below (the
 *       insertion) — a recorded, audited hook
 *     → through the work to the far side
 *     → the LOOP: out round the finger and back (loose yarn)
 *     → back through the work beside root A
 *     → root B: the catch, pulled under the head of the stitch below — the
 *       stitch's own hook, also audited
 *     → up-leg → head (the yarn-round-hook that closes the stitch).
 *
 * Both strands of the loop's root genuinely pass under the head below and are
 * clamped there by the stitch closing round them, which is why a loop stitch
 * cannot pull out. That clamp is held by collision like every other interlock
 * in the engine; the loop's body is LOOSE yarn (YarnModel.loose): not blocked
 * to the fabric's worked shape, acted on by gravity, held only by its own
 * length, stiffness and collision.
 *
 * A TWISTED loop (`twist` > 0) is the same loop twisted round a few times
 * before the stitch is finished; the two strands ply round each other and, in
 * a springy yarn like chenille, the loop curls back on itself (`curl`). The
 * relaxer has no torsion, so the curl is the twisted loop's own set (its
 * starting curvature, which the bending constraints remember exactly as they do
 * for every stitch), then collision and gravity settle it.
 */

import type { CoilShape, LoopShape } from './dictionary'

/** Deterministic per-stitch variation in [-1, 1] (the finger wrap is never
 *  exactly the same twice). */
export function loopJitter(j: number, c: number, k: number): number {
  let h = (j * 73856093) ^ (c * 19349663) ^ (k * 83492791)
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995)
  h ^= h >>> 15
  return ((h >>> 0) % 20001) / 10000 - 1
}

type V = { x: number; y: number; z: number }
const add = (a: V, b: V, k = 1): V => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k })
const rotZ = (v: V, g: number): V => ({
  x: v.x * Math.cos(g) - v.y * Math.sin(g),
  y: v.x * Math.sin(g) + v.y * Math.cos(g),
  z: v.z,
})

const unitV = (v: V): V | null => {
  const l = Math.hypot(v.x, v.y, v.z)
  return l < 1e-9 ? null : { x: v.x / l, y: v.y / l, z: v.z / l }
}
const crossV = (a: V, b: V): V => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const dotV = (a: V, b: V): number => a.x * b.x + a.y * b.y + a.z * b.z
/** Rotate v about the unit axis k by angle t (Rodrigues). */
const rotAxis = (v: V, k: V, t: number): V => {
  const c = Math.cos(t), sn = Math.sin(t)
  const kv = crossV(k, v), kd = dotV(k, v)
  return { x: v.x * c + kv.x * sn + k.x * kd * (1 - c), y: v.y * c + kv.y * sn + k.y * kd * (1 - c), z: v.z * c + kv.z * sn + k.z * kd * (1 - c) }
}

/**
 * The loop's frame when its plane FACES a direction (LoopShape.facePlane):
 * the plane normal is the given direction (turned to point out of the work,
 * a plane has no sign) tilted by up to ±jitterDeg two ways, the loop's
 * length axis e0 is the straight-out direction projected onto that plane
 * (so the ring still stands out of the fabric, leaning only as far as it
 * must), and a1 completes a right-handed frame with e0 × a1 = the normal.
 * Null when the direction is degenerate or lies along the loop's side.
 */
export function faceFrame(face: V, jitterDeg: number, side: number, s: number, j: number, c: number): { e0: V; a1: V; b0: V } | null {
  let n = unitV(face)
  if (!n) return null
  const out: V = { x: 0, y: 0, z: side }
  if (dotV(n, out) < 0) n = { x: -n.x, y: -n.y, z: -n.z }
  // Two perpendicular tilt axes across the normal, jittered deterministically.
  let t1 = crossV(n, out)
  if (Math.hypot(t1.x, t1.y, t1.z) < 1e-6) t1 = crossV(n, { x: 1, y: 0, z: 0 })
  const k1 = unitV(t1)!
  const k2 = crossV(n, k1)
  const jr = (jitterDeg * Math.PI) / 180
  n = rotAxis(rotAxis(n, k1, jr * loopJitter(j, c, 3)), k2, jr * loopJitter(j, c, 4))
  const od = dotV(out, n)
  const e0 = unitV({ x: out.x - n.x * od, y: out.y - n.y * od, z: out.z - n.z * od })
  if (!e0) return null
  const a1 = crossV(n, e0)
  return { e0, a1: { x: a1.x * s, y: a1.y * s, z: a1.z * s }, b0: { x: n.x * s, y: n.y * s, z: n.z * s } }
}

export interface LoopEmit {
  /** Fabric-frame x of the insertion (the below crown's column). */
  xH: number
  /** Fabric-frame y the hook passes at (under the head below). */
  yRoot: number
  /** The hook's z (its dive side, as the plain-stitch emitter computes it). */
  hookZ: number
  /** Which z side the loop stands out on: the side AWAY from the worker (−fz). */
  side: number
  /** Work direction along the row (±1). */
  s: number
  yr: number
  shape: LoopShape
  j: number
  c: number
}

/**
 * Push one loop stitch's loop onto the strand: root A (under the head below),
 * the pass through the work, the loose loop body, the pass back. The caller
 * then pushes root B (the stitch's own hook node) and records both links.
 * Returns root A and the loose body's node indices.
 */
export function emitLoop(
  push: (x: number, y: number, z: number, w?: number) => number,
  a: LoopEmit,
): { rootA: number; body: number[] } {
  const { xH, yRoot, hookZ, side, s, yr, shape, j, c } = a
  const r0 = yr * 0.7 // the two root strands sit side by side under the head
  const vary = shape.vary
  const Lv = yr * shape.lengthYr * (1 + vary * loopJitter(j, c, 1))
  const hw = yr * shape.halfWidthYr * (1 + 0.5 * vary * loopJitter(j, c, 2))
  const droop = ((shape.droopDeg + 40 * vary * loopJitter(j, c, 3)) * Math.PI) / 180
  // Which way the loop's plane faces varies most of all: a loop slipped off the
  // finger turns whichever way it was let go.
  const yaw = 180 * vary * loopJitter(j, c, 4) * (Math.PI / 180)
  // Root A: under the head of the stitch below, beside where the hook will be.
  const rootA = push(xH + s * r0, yRoot, hookZ)
  // Through the work to the far side (a yarn beyond the hook if the hook is
  // already on that side, just past the fabric if it is not).
  const zP = Math.sign(hookZ) === side ? side * (Math.abs(hookZ) + yr * 0.9) : side * yr * 1.5
  const P: V = { x: xH, y: yRoot, z: zP }
  push(xH + s * r0, yRoot, zP)
  // The loop's frame: e0 straight out of the far face, tipped DOWN the fabric
  // by the droop (the finger pulls the loop down behind the work); a1 across
  // the loop (along the row); b0 completes the frame.
  let e0 = rotZ({ x: 0, y: -Math.sin(droop), z: side * Math.cos(droop) }, yaw)
  let a1 = rotZ({ x: s, y: 0, z: 0 }, yaw)
  const curl = shape.curl
  // A second lateral, perpendicular to both (completes the frame).
  let b0: V = {
    x: e0.y * a1.z - e0.z * a1.y,
    y: e0.z * a1.x - e0.x * a1.z,
    z: e0.x * a1.y - e0.y * a1.x,
  }
  if (shape.facePlane) {
    const f = faceFrame(shape.facePlane, shape.faceJitterDeg ?? 15, side, s, j, c)
    if (f) ({ e0, a1, b0 } = f)
  }
  if (shape.coil) {
    // A COILED CURL (cow-build-1025): the same root and passes, the body a
    // tight corkscrew of its own (`emitCoil`).
    const body = emitCoil(push, { P: { x: xH + s * r0, y: yRoot, z: zP }, e0, a1, b0, side, yr, coil: shape.coil, vary, j, c })
    push(xH - s * r0, yRoot, zP)
    return { rootA, body }
  }
  // The loop's AXIS. Straight out (curl 0), or a CORKSCREW round the outward
  // direction (curl = turns over the loop's length): a twisted loop that has
  // sprung back on itself. It winds round e0, so it can never curl back into
  // the work. Returns the point and the two laterals across the axis there
  // (the loop's two strands are offset along them).
  const helixAngle = (52 * Math.PI) / 180
  const axis = (u: number): { X: V; L1: V; L2: V } => {
    if (curl <= 0) return { X: add(P, e0, u), L1: a1, L2: b0 }
    const th = (2 * Math.PI * curl * u) / Lv
    const rc = (Lv * Math.sin(helixAngle)) / (2 * Math.PI * curl)
    const X = add(add(add(P, e0, u * Math.cos(helixAngle)), a1, rc * (Math.cos(th) - 1)), b0, rc * Math.sin(th))
    // Principal normal points at the corkscrew's axis; the binormal completes it.
    const Nh: V = add({ x: a1.x * -Math.cos(th), y: a1.y * -Math.cos(th), z: a1.z * -Math.cos(th) }, b0, -Math.sin(th))
    const T: V = add(add({ x: e0.x * Math.cos(helixAngle), y: e0.y * Math.cos(helixAngle), z: e0.z * Math.cos(helixAngle) }, a1, -Math.sin(helixAngle) * Math.sin(th)), b0, Math.sin(helixAngle) * Math.cos(th))
    const B: V = { x: T.y * Nh.z - T.z * Nh.y, y: T.z * Nh.x - T.x * Nh.z, z: T.x * Nh.y - T.y * Nh.x }
    return { X, L1: B, L2: Nh }
  }
  const per = 2 * Lv + Math.PI * hw
  const n = Math.max(10, Math.ceil(per / (yr * 0.75)))
  const body: number[] = []
  for (let i = 1; i < n; i++) {
    // Evenly spaced ALONG the loop: out along one strand, round the finger,
    // back along the other.
    const f = i / n
    const t = f <= 0.5 ? f * 2 : (1 - f) * 2
    const psi = f <= 0.5 ? Math.acos(1 - 2 * t) : 2 * Math.PI - Math.acos(1 - 2 * t)
    const u = (Lv * (1 - Math.cos(psi))) / 2
    // Open teardrop across the loop: the two root strands (±r0) open out to the
    // finger's width and close round the far end.
    const v = hw * Math.sin(psi) * Math.sqrt(Math.sin(psi / 2)) + r0 * Math.cos(psi / 2)
    const phi = shape.twist * Math.PI * (u / Lv)
    const { X, L1, L2 } = axis(u)
    const q = add(add(X, L1, v * Math.cos(phi)), L2, v * Math.sin(phi))
    body.push(push(q.x, q.y, q.z))
  }
  // Back through the work beside root A.
  push(xH - s * r0, yRoot, zP)
  return { rootA, body }
}

/** Where one coiled curl's body starts and how it is framed (`emitCoil`). */
export interface CoilEmit {
  /** The pass through the work the body leaves from (the root). */
  P: V
  /** Straight out of the work (tipped by the droop, or in the faced plane). */
  e0: V
  /** Across the loop (along the row, or the faced plane's second axis). */
  a1: V
  /** The loop plane's normal (the faced direction when faced). */
  b0: V
  /** Which z side the loop stands out on. */
  side: number
  yr: number
  coil: CoilShape
  vary: number
  j: number
  c: number
}

/** The coil's per-stitch numbers after the deterministic variation: radius
 *  and turns vary by up to ±25% / ±20% of `vary`, and the hand of the twist
 *  (which way it springs back) is either, stitch by stitch. */
export function coilDims(a: Pick<CoilEmit, 'yr' | 'coil' | 'vary' | 'j' | 'c'>): { R: number; turns: number; pitch: number; pair: number; hand: number } {
  const { yr, coil, vary, j, c } = a
  return {
    R: yr * coil.radiusYr * (1 + 0.25 * vary * loopJitter(j, c, 11)),
    turns: coil.turns * (1 + 0.2 * vary * loopJitter(j, c, 12)),
    pitch: yr * coil.pitchYr,
    pair: yr * (coil.pairYr ?? 0.7),
    hand: loopJitter(j, c, 13) >= 0 ? 1 : -1,
  }
}

/**
 * A COILED CURL's body (cow-build-1025; LoopShape.coil). The loop stitch's
 * loop, twisted on the finger until it springs back into a tight corkscrew
 * when let go: the doubled strand (the loop's two legs side by side, `pair`
 * apart along the axis) winds `turns` times round an axis, out from the
 * root along one leg, round the tip, back along the other. Each turn lies in
 * the loop's plane (e0 out of the work, a1 across), so the first turn leaves
 * the root along the work and rises 2R out of it like an open ring; the axis
 * is the plane's normal (b0, turned to point out of the work), so the coil
 * advances `pitch` a turn along it — seen along the facing, a little ring
 * curled on itself. Only its own footprint (about 2R across): it never
 * reaches the next curl the way a long open loop does.
 *
 * Pushes the body's nodes (loose, evenly spaced about 0.75 yr) and returns
 * their indices; the caller pushes the pass back through the work.
 */
export function emitCoil(push: (x: number, y: number, z: number, w?: number) => number, a: CoilEmit): number[] {
  const { P, e0, a1, b0, side, yr } = a
  const { R, turns, pitch, pair, hand } = coilDims(a)
  let ax = unitV(b0) ?? { x: 0, y: 1, z: 0 }
  if (dotV(ax, { x: 0, y: 0, z: side }) < 0) ax = { x: -ax.x, y: -ax.y, z: -ax.z }
  const T0 = 2 * Math.PI * turns
  const helix = (th: number): V => add(add(add(P, e0, R * (1 - Math.cos(th))), a1, hand * R * Math.sin(th)), ax, (pitch * th) / (2 * Math.PI))
  const tangent = (th: number): V => unitV(add(add(add({ x: 0, y: 0, z: 0 }, e0, R * Math.sin(th)), a1, hand * R * Math.cos(th)), ax, pitch / (2 * Math.PI)))!
  const legLen = turns * Math.hypot(2 * Math.PI * R, pitch)
  const n = Math.max(8, Math.ceil(legLen / (yr * 0.75)))
  const body: number[] = []
  const at = (q: V): void => {
    body.push(push(q.x, q.y, q.z))
  }
  // Out along the first leg (offset +pair along the axis) ...
  for (let i = 1; i <= n; i++) at(add(helix((T0 * i) / n), ax, pair))
  // ... round the tip (a half circle from one leg to the other) ...
  const T = tangent(T0)
  const tipN = Math.max(3, Math.ceil((Math.PI * pair) / (yr * 0.75)))
  const tip = helix(T0)
  for (let i = 1; i < tipN; i++) {
    const al = (Math.PI * i) / tipN
    at(add(add(tip, ax, pair * Math.cos(al)), T, pair * Math.sin(al)))
  }
  // ... and back along the second (offset -pair) to the root.
  for (let i = n; i >= 1; i--) at(add(helix((T0 * i) / n), ax, -pair))
  return body
}

// ── The coils' build-time check (cow-build-1025) ───────────────────────────

/** The Gauss LINKING NUMBER of two closed polylines (each closed from its
 *  last point back to its first): the exact sum over segment pairs of the
 *  signed solid angle (Klenin & Langowski 2000), divided by 4 pi. 0 for two
 *  curls that only sit beside or over each other, ±1 when one is threaded
 *  through the other — the chain-link the open rings made. */
export function linkingNumber(A: V[], B: V[]): number {
  let total = 0
  const na = A.length
  const nb = B.length
  for (let i = 0; i < na; i++) {
    const p1 = A[i]!
    const p2 = A[(i + 1) % na]!
    for (let k = 0; k < nb; k++) {
      const p3 = B[k]!
      const p4 = B[(k + 1) % nb]!
      total += segmentSolidAngle(p1, p2, p3, p4)
    }
  }
  return total / (4 * Math.PI)
}

const subV = (a: V, b: V): V => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })

function segmentSolidAngle(p1: V, p2: V, p3: V, p4: V): number {
  const r13 = subV(p3, p1)
  const r14 = subV(p4, p1)
  const r23 = subV(p3, p2)
  const r24 = subV(p4, p2)
  const faces = [crossV(r13, r14), crossV(r14, r24), crossV(r24, r23), crossV(r23, r13)].map(unitV)
  if (faces.some((f) => !f)) return 0
  const [n1, n2, n3, n4] = faces as V[]
  const asin = (x: number): number => Math.asin(Math.max(-1, Math.min(1, x)))
  const omega = asin(dotV(n1!, n2!)) + asin(dotV(n2!, n3!)) + asin(dotV(n3!, n4!)) + asin(dotV(n4!, n1!))
  const sgn = Math.sign(dotV(crossV(subV(p4, p3), subV(p2, p1)), r13))
  return omega * sgn
}

/** The closest approach of two polylines' nodes (mm). */
export function closestApproach(A: V[], B: V[]): number {
  let best = Infinity
  for (const p of A) for (const q of B) {
    const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/**
 * The COIL AUDIT (cow-build-1025): for every pair of curls, (1) their
 * linking number is 0 — no curl threaded through another — and (2) their
 * centre-lines never come nearer than `clearMm` (two drawn strand radii:
 * the yarn of one curl does not pass into the yarn of the next). Each curl
 * is its body closed through its root. Returns the problems, empty when
 * every curl sits on its own.
 */
export function coilProblems(curls: V[][], clearMm: number): string[] {
  const out: string[] = []
  const box = curls.map((cv) => {
    const b = { lo: { x: Infinity, y: Infinity, z: Infinity }, hi: { x: -Infinity, y: -Infinity, z: -Infinity } }
    for (const p of cv) {
      b.lo = { x: Math.min(b.lo.x, p.x), y: Math.min(b.lo.y, p.y), z: Math.min(b.lo.z, p.z) }
      b.hi = { x: Math.max(b.hi.x, p.x), y: Math.max(b.hi.y, p.y), z: Math.max(b.hi.z, p.z) }
    }
    return b
  })
  for (let i = 0; i < curls.length; i++) {
    for (let k = i + 1; k < curls.length; k++) {
      const bi = box[i]!
      const bk = box[k]!
      // Boxes further apart than the clearance can neither touch nor link.
      if (bi.lo.x > bk.hi.x + clearMm || bk.lo.x > bi.hi.x + clearMm || bi.lo.y > bk.hi.y + clearMm || bk.lo.y > bi.hi.y + clearMm || bi.lo.z > bk.hi.z + clearMm || bk.lo.z > bi.hi.z + clearMm) continue
      const lk = linkingNumber(curls[i]!, curls[k]!)
      if (Math.abs(lk) > 0.5) out.push(`curls ${i} and ${k} are linked (linking number ${lk.toFixed(2)})`)
      const d = closestApproach(curls[i]!, curls[k]!)
      if (d < clearMm) out.push(`curls ${i} and ${k} touch: centre-lines ${d.toFixed(2)} mm apart (clearance ${clearMm.toFixed(2)} mm)`)
    }
  }
  return out
}
