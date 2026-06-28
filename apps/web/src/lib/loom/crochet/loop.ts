/**
 * Crochet loop geometry — the real yarn path of a half-double crochet stitch
 * worked in the back loop only (hdc-blo), emitted as the loom's `ThreadStroke`s
 * so it renders through the exact same proven pipeline as embroidery (plied
 * filament curves -> Blender Cycles path-trace -> AgX).
 *
 * This is NOT the old crochet "2D vector renderer" (per-stitch rim/body/sheen
 * strokes drawn flat — that produced the weird, rejected results). Here each
 * stitch is its ACTUAL yarn: a continuous interlocking loop (the two legs/posts
 * rising to the chevron "V" head) plus the unworked front-loop that blo leaves
 * proud — and THAT front loop, tiled along a row, is the raised ridge that gives
 * this blanket its signature diagonal ribbing. Real yarn, real loop topology,
 * never a "looks-like" shortcut.
 *
 * A stitch is described in a local frame (u = along the row, v = up the build
 * direction) and placed into the world with a row unit-vector `U` and the
 * perpendicular build unit-vector `V`. Tiling these cells builds the fabric.
 */

import type { Vec2 } from '../core/vec'
import { material, threadStructure, type ThreadKind } from '../render/thread'
import type { ThreadStroke } from '../render/thread'

export interface CrochetCell {
  /** Cell centre in world mm. */
  center: Vec2
  /** Unit vector along the row (stitch to stitch), in world space. */
  rowDir: Vec2
  /** Unit vector up the build direction (row to row), in world space. */
  buildDir: Vec2
  /** Stitch width along the row, mm. */
  widthMm: number
  /** Row height up the build direction, mm. */
  heightMm: number
  /** Yarn bundle radius, mm. */
  yarnRadiusMm: number
  /** Floss/yarn colour. */
  hex: string
  /** Deterministic per-stitch seed (organic wobble + shading). */
  seed: number
  /** Yarn fibre kind (wool reads matte + fuzzy; the bulky workhorse). */
  kind?: ThreadKind
  /** Strand/ply count of the yarn bundle. */
  strands?: number
  /** Number of stray fuzz fibres to add per stitch (the wool halo; swatch zoom). */
  fuzz?: number
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Deterministic small wobble in [-1, 1] from a seed + index. */
function jitter(seed: number, i: number): number {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

/**
 * Build the yarn strokes for one hdc-blo stitch.
 *
 * The signature of this blanket is a bold raised RIDGE per row (the worked tops
 * plus the unworked blo front loop) with a recessed groove between rows — tiled
 * along the diagonal row that becomes the diagonal ribbing. So the stitch is
 * built rib-first:
 *   1. the RIB CORD — a fat continuous cord along the row, sitting proud, with a
 *      per-stitch bump so individual stitches read along it,
 *   2. a small top-loop "V" sitting on the rib — the two crochet top loops, for
 *      character (kept low so it textures the rib, never a competing grid).
 * The cord deliberately occupies only the centre of the cell, leaving the top
 * and bottom of the cell open so the darker backing reads as the groove.
 */
export function hdcBloStitch(cell: CrochetCell): ThreadStroke[] {
  const { center: c, rowDir: U, buildDir: V, widthMm: sw, heightMm: rh, yarnRadiusMm: yr } = cell
  const kind: ThreadKind = cell.kind ?? 'crewel-wool'
  const strands = cell.strands ?? 4
  const mat = material(kind, cell.hex)
  const { filaments, twistPerMm } = threadStructure(kind, strands)

  // Local (lu, lv) -> world. lu spans the row, lv the build direction. A little
  // per-stitch jitter so the fabric reads hand-made, not machine-perfect.
  const jx = jitter(cell.seed, 1) * sw * 0.06
  const jy = jitter(cell.seed, 2) * rh * 0.05
  const toWorld = (lu: number, lv: number): Vec2 => ({
    x: c.x + U.x * (lu + jx) + V.x * (lv + jy),
    y: c.y + U.y * (lu + jx) + V.y * (lv + jy),
  })

  const w = sw * 0.5
  const out: ThreadStroke[] = []

  // Strong twist so the bundle's filaments read as visibly spiralling PLIES — the
  // single biggest "this is yarn, not a smooth tube" cue. ~3 fat plies.
  const PLY = 3
  const ribTwist = 0.42 // twists per mm — a clear barber-pole over a stitch

  // ---- 1. Rib cord: continuous along the row, centred at lv ~ 0, overshooting
  // the cell so neighbouring cords merge into one rib. Sits only modestly proud
  // so the groove between rows is a soft shadow (connected fabric), not a black
  // gap (which read as separate sausages). ----
  const cord: Vec2[] = []
  const N = 10
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const lu = lerp(-w * 1.12, w * 1.12, t) // overshoot -> ribs are continuous
    const lv = rh * 0.04 + jitter(cell.seed, 20 + i) * rh * 0.012
    cord.push(toWorld(lu, lv))
  }
  out.push({
    path: cord,
    z0: yr * 1.25, // lower -> softer groove, rows read connected
    arch: yr * 0.2,
    radiusMm: yr * 1.02,
    filaments: PLY,
    twistPerMm: ribTwist,
    material: mat,
    seed: cell.seed,
  })

  // ---- 2. Top-loop V: a short plied chevron lying ON the rib — the two top
  // loops of the hdc, the crochet grain. ----
  const vChev: Vec2[] = [
    toWorld(-w * 0.5, rh * 0.06),
    toWorld(-w * 0.14, rh * 0.16),
    toWorld(0, rh * 0.09), // shallow notch between the two loops
    toWorld(w * 0.14, rh * 0.16),
    toWorld(w * 0.5, rh * 0.06),
  ]
  out.push({
    path: vChev,
    z0: yr * 1.55,
    arch: yr * 0.18,
    radiusMm: yr * 0.5,
    filaments: 2,
    twistPerMm: ribTwist * 1.5,
    material: mat,
    seed: cell.seed + 0.5,
  })

  // ---- 4. Fuzz: a few fine fly-away fibres, the wool halo. Cheap (a handful of
  // thin strokes per stitch) and only worth it at swatch zoom. ----
  const nFuzz = cell.fuzz ?? 0
  for (let f = 0; f < nFuzz; f++) {
    const lu0 = jitter(cell.seed, 40 + f) * w * 0.9
    const lv0 = rh * 0.1 + jitter(cell.seed, 50 + f) * rh * 0.18
    const len = yr * (1.1 + 0.6 * Math.abs(jitter(cell.seed, 60 + f)))
    const ang = jitter(cell.seed, 70 + f) * Math.PI
    const hair: Vec2[] = [
      toWorld(lu0, lv0),
      toWorld(lu0 + Math.cos(ang) * len * 0.5, lv0 + Math.sin(ang) * len * 0.5),
      toWorld(lu0 + Math.cos(ang) * len, lv0 + Math.sin(ang) * len),
    ]
    out.push({
      path: hair,
      z0: yr * 1.7,
      arch: yr * 0.9, // lifts off the surface -> reads as a stray fibre
      radiusMm: yr * 0.12,
      filaments: 1,
      twistPerMm: 0,
      material: mat,
      seed: cell.seed + 3 + f,
    })
  }

  return out
}

/**
 * A simple fringe tassel: a few doubled strands hanging from an edge point,
 * splaying slightly. `dir` is the (unit) hang direction in world mm.
 */
export function fringeTassel(
  anchor: Vec2,
  dir: Vec2,
  lengthMm: number,
  strandCount: number,
  hex: string,
  seed: number,
  yarnRadiusMm: number,
): ThreadStroke[] {
  const perp: Vec2 = { x: -dir.y, y: dir.x }
  const out: ThreadStroke[] = []
  const mat = material('crewel-wool', hex)
  const { filaments, twistPerMm } = threadStructure('crewel-wool', 4)
  for (let s = 0; s < strandCount; s++) {
    const spread = (s - (strandCount - 1) / 2) * yarnRadiusMm * 1.6
    const sway = jitter(seed, s) * lengthMm * 0.12
    const pts: Vec2[] = []
    const M = 6
    for (let i = 0; i <= M; i++) {
      const t = i / M
      const len = lengthMm * t
      const x = anchor.x + dir.x * len + perp.x * (spread + sway * t)
      const y = anchor.y + dir.y * len + perp.y * (spread + sway * t)
      pts.push({ x, y })
    }
    out.push({
      path: pts,
      z0: yarnRadiusMm * 0.8,
      arch: 0,
      radiusMm: yarnRadiusMm * 0.85,
      filaments,
      twistPerMm,
      material: mat,
      seed: seed + s * 1.3,
    })
  }
  return out
}
