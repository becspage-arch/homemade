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

export interface TubeCollapse {
  /** Fold radius where the flattened loop turns (mm): how tightly the fabric
   *  bends at the two edges of a tube lying flat. A few yarn diameters. */
  foldRadiusMm: number
  /** The piece's own yarn radius (sets the layer gap). */
  yarnRadiusMm: number
  /** Soft folds in the top layer: amplitude (mm) and how many waves run
   *  along the tube's axis. 0 = a flat doubled band. */
  foldAmpMm?: number
  foldWaves?: number
  /** A gentle plan-view curl of the lying piece (mm). */
  curlMm?: number
  /** Azimuth the piece is laid along (deg from +x). */
  dirDeg?: number
  /** The worked radius of each control point's own ROUND (mm, one per ctrl
   *  point). When given it replaces the height-bin estimate — exact for a
   *  dome, whose rounds climb mostly in radius and share a thin slab of z. */
  roundRadius?: number[]
}

/**
 * COLLAPSED staging for a tube: lay it on the table the way a soft cowl or a
 * beanie lies when it is put down — its axis horizontal, every round
 * flattened into two layers joined by two soft folded edges, the top layer
 * settling in gentle waves. Each round keeps its own circumference (each
 * point keeps its arc position round the flattened loop of its OWN worked
 * radius, so a beanie's crown narrows to its pole), the axis direction
 * becomes length along the table, and the stitch relief rides the local
 * surface normal of the flattened loop. Staging only, like `bendTube`.
 *
 * Local frame in: axis z, centred on x = y = 0. Out: world mm on the table.
 */
export function collapseTube(ctrl: V3[], c: TubeCollapse): V3[] {
  const yr = c.yarnRadiusMm
  const rho = Math.max(c.foldRadiusMm, yr * 2)
  let zmin = Infinity, zmax = -Infinity
  for (const p of ctrl) { if (p.z < zmin) zmin = p.z; if (p.z > zmax) zmax = p.z }
  const Lax = zmax - zmin
  // The worked radius ALONG the axis: mean radius per height bin, smoothed.
  const BINS = 24
  const sumR = new Float64Array(BINS + 1)
  const cnt = new Float64Array(BINS + 1)
  for (const p of ctrl) {
    const k = Math.max(0, Math.min(BINS, Math.round(((p.z - zmin) / Math.max(Lax, 1e-6)) * BINS)))
    sumR[k]! += Math.hypot(p.x, p.y)
    cnt[k]! += 1
  }
  const Rb = new Float64Array(BINS + 1)
  for (let k = 0; k <= BINS; k++) Rb[k] = cnt[k]! ? sumR[k]! / cnt[k]! : k > 0 ? Rb[k - 1]! : 0
  for (let pass = 0; pass < 2; pass++) for (let k = 1; k < BINS; k++) Rb[k] = (Rb[k - 1]! + 2 * Rb[k]! + Rb[k + 1]!) / 4
  const radiusAt = (z: number): number => {
    const f = ((z - zmin) / Math.max(Lax, 1e-6)) * BINS
    const i = Math.max(0, Math.min(BINS - 1, Math.floor(f)))
    const w = f - i
    return Rb[i]! * (1 - w) + Rb[i + 1]! * w
  }
  const gapMid = yr * 2.6
  const amp = c.foldAmpMm ?? 0
  const waves = c.foldWaves ?? 2.5
  const curl = c.curlMm ?? 0
  const az = ((c.dirDeg ?? 0) * Math.PI) / 180
  const ca = Math.cos(az), sa = Math.sin(az)
  return ctrl.map((p, idx) => {
    const r = Math.hypot(p.x, p.y)
    const R = c.roundRadius ? Math.max(c.roundRadius[idx] ?? radiusAt(p.z), yr * 0.6) : radiusAt(p.z)
    const n = r - R // relief: outward of the worked surface
    const C = 2 * Math.PI * R
    // The fold radius shrinks with the round near a closed crown.
    const rhoL = Math.min(rho, Math.max(yr * 1.5, R * 0.9))
    const Ls = Math.max(0, C / 2 - Math.PI * rhoL) // each straight run
    const th = Math.atan2(p.y, p.x)
    const a = ((th + Math.PI) / (2 * Math.PI)) * C // 0..C round the loop
    const u = p.z - zmin // 0..Lax along the table
    const f = u / Math.max(Lax, 1e-6)
    const sag = amp * Math.sin(waves * Math.PI * f) * Math.sin(Math.PI * f)
    // Walk the flattened loop: bottom straight (a in [0, Ls]), far fold
    // (semicircle up), top straight back, near fold (semicircle down).
    let x = 0, z = 0, nx = 0, nz = 0
    const sep = (s: number): number =>
      Math.min(2 * rhoL, gapMid + (2 * rhoL - gapMid) * Math.min(1, (Math.abs(s - Ls / 2) / Math.max(Ls / 2, 1e-6)) ** 2))
    if (a < Ls) {
      x = a; z = 0; nx = 0; nz = -1
    } else if (a < Ls + Math.PI * rhoL) {
      const ph = (a - Ls) / rhoL
      x = Ls + rhoL * Math.sin(ph)
      z = rhoL - rhoL * Math.cos(ph)
      nx = Math.sin(ph); nz = -Math.cos(ph)
    } else if (a < 2 * Ls + Math.PI * rhoL) {
      const sb = a - Ls - Math.PI * rhoL
      x = Ls - sb
      z = sep(x) + sag
      nx = 0; nz = 1
    } else {
      const ph = (a - 2 * Ls - Math.PI * rhoL) / rhoL
      x = -rhoL * Math.sin(ph)
      z = rhoL + rhoL * Math.cos(ph)
      nx = -Math.sin(ph); nz = Math.cos(ph)
    }
    x -= Ls / 2
    z += yr * 1.2
    x += nx * n
    z += nz * n
    const y = u - Lax / 2
    const xc = x + curl * Math.sin(Math.PI * f)
    return { x: xc * ca - y * sa, y: xc * sa + y * ca, z }
  })
}
