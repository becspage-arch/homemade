/**
 * WORN / SLOUCHED staging for a tube — render-time presentation of the SAME
 * stitched piece, like `loopStrip`, `flatbandStrip` and `turnOver` in
 * programScene.ts.
 *
 * A tube is relaxed as fabric held to its worked surface (STITCH_ENGINE §8h):
 * right for a blocked piece, wrong for a nightcap flopping over a head or a
 * slouchy beanie. What a real soft hat does is BEND: the fabric keeps every
 * stitch where it was worked and the surface it lies on curves. That is what
 * `bendTube` does: above a start height the tube's straight axis is replaced
 * by a planar curve whose heading ramps smoothly from vertical to `angleDeg`
 * over `lengthMm` and then runs straight, and every point rides the curve in
 * the axis's own moving frame (its height becomes arclength, its two cross-
 * axis offsets ride the frame's normal and binormal). On the axis this is an
 * isometry; off it the outside of the bend stretches and the inside gathers
 * by (1 ± r·κ), which is what a bent sleeve of fabric does too (the inside
 * puckers). Keep r·κ modest and the stitches stay honest.
 *
 * Nothing here touches relax, audit or the geometry hash: it is applied to
 * the strand centreline just before the plies are laid, on the way to the
 * scene JSON.
 */

import type { V3 } from '../yarnLoop'

export interface TubeBend {
  /** Where the bend begins (local z, mm): below this the tube is unchanged —
   *  for a worn hat, just above the head's crown, which holds it straight. */
  startZ: number
  /** Over how much of the axis (mm) the heading turns from straight to the
   *  full angle. Shorter = a sharper crease. */
  lengthMm: number
  /** The final lean of the axis off vertical (deg). 90 = horizontal, >90 =
   *  hanging back down (a nightcap's tail past its crown). */
  angleDeg: number
  /** Which way it leans: azimuth in the x–y plane (deg, 0 = +x, 90 = +y). */
  dirDeg: number
  /** A fixed extra twist of the fall after the bend (deg) — a tail that has
   *  flopped rarely hangs dead in the lean plane. Default 0. */
  swayDeg?: number
}

/** C¹ ramp (smootherstep): zero slope at both ends so curvature starts and
 *  ends at nothing — no crease where the straight part meets the bend. */
function ramp(t: number): number {
  const u = Math.max(0, Math.min(1, t))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/**
 * Bend a tube's control points (local frame: axis = z, centred on x = y = 0)
 * above `startZ`. Pure; returns a new array.
 */
export function bendTube(ctrl: V3[], b: TubeBend): V3[] {
  const theta = (b.angleDeg * Math.PI) / 180
  const sway = ((b.swayDeg ?? 0) * Math.PI) / 180
  const az = (b.dirDeg * Math.PI) / 180
  const ux = Math.cos(az)
  const uy = Math.sin(az)
  // The lean direction u and the across direction v in the x–y plane.
  const vx = -uy
  const vy = ux
  const L = Math.max(b.lengthMm, 1e-3)
  // Integrate the axis curve once, finely, over the ramp; beyond it the axis
  // is a straight line at the final heading.
  const STEPS = 400
  const ds = L / STEPS
  const cu: number[] = [0] // along u
  const cz: number[] = [0] // along z
  const th: number[] = [0]
  for (let i = 1; i <= STEPS; i++) {
    const s = i * ds
    const t = theta * ramp(s / L)
    // Midpoint heading for the step.
    const tm = theta * ramp((s - ds / 2) / L)
    cu.push(cu[i - 1]! + Math.sin(tm) * ds)
    cz.push(cz[i - 1]! + Math.cos(tm) * ds)
    th.push(t)
  }
  const axisAt = (s: number): { au: number; az: number; t: number } => {
    if (s >= L) {
      const e = s - L
      return { au: cu[STEPS]! + Math.sin(theta) * e, az: cz[STEPS]! + Math.cos(theta) * e, t: theta }
    }
    const f = s / ds
    const i = Math.min(STEPS - 1, Math.floor(f))
    const w = f - i
    return {
      au: cu[i]! * (1 - w) + cu[i + 1]! * w,
      az: cz[i]! * (1 - w) + cz[i + 1]! * w,
      t: th[i]! * (1 - w) + th[i + 1]! * w,
    }
  }
  return ctrl.map((p) => {
    const s = p.z - b.startZ
    if (s <= 0) return { x: p.x, y: p.y, z: p.z }
    const a = p.x * ux + p.y * uy // offset along the lean (inside of the bend)
    const c = p.x * vx + p.y * vy // offset across it
    const { au, az: azz, t } = axisAt(s)
    // Frame: tangent T = (sin t · u, cos t · z); in-plane normal N (what +u
    // was) = (cos t · u, −sin t · z); binormal = v, with the optional sway
    // rotating N and v about T once the heading has settled.
    const sw = sway * ramp(s / L)
    const cs = Math.cos(sw)
    const sn = Math.sin(sw)
    const na = a * cs - c * sn
    const nc = a * sn + c * cs
    const nu = Math.cos(t) * na
    const nz = -Math.sin(t) * na
    const X = (au + nu) * ux + nc * vx
    const Y = (au + nu) * uy + nc * vy
    const Z = b.startZ + azz + nz
    return { x: X, y: Y, z: Z }
  })
}

/** A rigid transform: rotate about x (tilt), then about z (turn), then
 *  translate. Used to seat a worn accessory on a part of a composition. */
export function rigidPlace(ctrl: V3[], o: { tiltDeg?: number; turnDeg?: number; T: V3 }): V3[] {
  const tx = ((o.tiltDeg ?? 0) * Math.PI) / 180
  const tz = ((o.turnDeg ?? 0) * Math.PI) / 180
  const cx = Math.cos(tx), sx = Math.sin(tx)
  const cz = Math.cos(tz), sz = Math.sin(tz)
  return ctrl.map((p) => {
    // Tilt about x: y' = y cos − z sin, z' = y sin + z cos.
    const y1 = p.y * cx - p.z * sx
    const z1 = p.y * sx + p.z * cx
    const x1 = p.x
    // Turn about z.
    const x2 = x1 * cz - y1 * sz
    const y2 = x1 * sz + y1 * cz
    return { x: x2 + o.T.x, y: y2 + o.T.y, z: z1 + o.T.z }
  })
}
