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

import type { LoopShape } from './dictionary'

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
  const yaw = 70 * vary * loopJitter(j, c, 4) * (Math.PI / 180)
  // Root A: under the head of the stitch below, beside where the hook will be.
  const rootA = push(xH + s * r0, yRoot, hookZ)
  // Through the work to the far side (a yarn beyond the hook if the hook is
  // already on that side, just past the fabric if it is not).
  const zP = Math.sign(hookZ) === side ? side * (Math.abs(hookZ) + yr * 0.9) : side * yr * 1.5
  const P: V = { x: xH, y: yRoot, z: zP }
  push(xH + s * r0, yRoot, zP)
  // The loop's frame: e0 straight out of the far face, tipped DOWN the fabric
  // by the droop (the finger pulls the loop down behind the work); d0 the
  // in-plane direction it curls toward; a1 across the loop (along the row).
  const e0 = rotZ({ x: 0, y: -Math.sin(droop), z: side * Math.cos(droop) }, yaw)
  const d0 = rotZ({ x: 0, y: -Math.cos(droop), z: -side * Math.sin(droop) }, yaw)
  const a1 = rotZ({ x: s, y: 0, z: 0 }, yaw)
  const curl = shape.curl
  // A second lateral, perpendicular to both (completes the frame).
  const b0: V = {
    x: e0.y * a1.z - e0.z * a1.y,
    y: e0.z * a1.x - e0.x * a1.z,
    z: e0.x * a1.y - e0.y * a1.x,
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
