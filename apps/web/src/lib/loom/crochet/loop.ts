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

const _lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Deterministic small wobble in [-1, 1] from a seed + index. */
function jitter(seed: number, i: number): number {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

/**
 * Build the yarn strokes for one hdc-blo stitch.
 *
 * Modelled as the REAL hdc loop, not a cord: each stitch is a continuous strand
 * that rises on two legs to a head split by a shallow V-notch (the two top loops
 * of a crochet stitch), then back down — an interlocking loop. With a half-stitch
 * stagger row-to-row, one row's legs nest down between the heads of the row below
 * (exactly how crochet fabric links), and the row of V-notched heads reads as the
 * chain-top ridge. That nested-loop structure — NOT a twisted cord — is what makes
 * the eye read "crochet". Worked in blo, so the heads ride at the front of the cell.
 */
export function hdcBloStitch(cell: CrochetCell): ThreadStroke[] {
  const { center: c, rowDir: U, buildDir: V, widthMm: sw, heightMm: rh, yarnRadiusMm: yr } = cell
  const kind: ThreadKind = cell.kind ?? 'crewel-wool'
  const strands = cell.strands ?? 4
  const mat = material(kind, cell.hex)
  const { filaments } = threadStructure(kind, strands)

  // Local (lu, lv) -> world. lu spans the row, lv the build direction. A little
  // per-stitch jitter so the fabric reads hand-made, not machine-perfect.
  const jx = jitter(cell.seed, 1) * sw * 0.05
  const jy = jitter(cell.seed, 2) * rh * 0.04
  const toWorld = (lu: number, lv: number): Vec2 => ({
    x: c.x + U.x * (lu + jx) + V.x * (lv + jy),
    y: c.y + U.y * (lu + jx) + V.y * (lv + jy),
  })

  const w = sw * 0.5
  const h = rh * 0.5
  const out: ThreadStroke[] = []

  const PLY = 3 // fat plies + twist so it reads as spun yarn, not a smooth tube
  const twist = 0.34

  // ---- The stitch loop: left foot -> up the left leg -> over the head (with a
  // central V-notch = the two top loops) -> down the right leg -> right foot. The
  // feet sink toward the row below; the head rides high at the front of the cell
  // (blo). Tiled with the row stagger, the feet nest between the heads below. ----
  // The head dominates (it is the visible part of a blo stitch); the legs are
  // short and tuck under. Two head peaks split by a deep central V-notch = the two
  // top loops of the hdc. A row of these = the chain-top ridge, clearly made of
  // stitches.
  // Compressed into the upper ~60% of the cell, so the lower part is a recessed
  // VALLEY between rows — the rib reads as a raised ridge with a groove below it,
  // not a cell-filling blob. Feet land at the valley floor (into the row below).
  const loop: Vec2[] = [
    toWorld(-w * 0.42, -h * 0.15), // left foot at the valley floor
    toWorld(-w * 0.66, h * 0.35), // left leg, bowed out
    toWorld(-w * 0.5, h * 0.72), // left shoulder rising
    toWorld(-w * 0.26, h * 0.99), // LEFT top loop (peak)
    toWorld(0, h * 0.58), // V-notch between the two top loops
    toWorld(w * 0.26, h * 0.99), // RIGHT top loop (peak)
    toWorld(w * 0.5, h * 0.72), // right shoulder
    toWorld(w * 0.66, h * 0.35), // right leg, bowed out
    toWorld(w * 0.42, -h * 0.15), // right foot
  ]
  out.push({
    path: loop,
    z0: yr * 0.85,
    arch: yr * 1.25, // the two top loops stand proud of the fabric
    radiusMm: yr * 0.9,
    filaments: PLY,
    twistPerMm: twist,
    material: mat,
    seed: cell.seed,
  })

  // ---- Fuzz: a few fine fly-away fibres (the wool halo). Optional; swatch zoom. ----
  const nFuzz = cell.fuzz ?? 0
  for (let f = 0; f < nFuzz; f++) {
    const lu0 = jitter(cell.seed, 40 + f) * w * 0.9
    const lv0 = h * 0.2 + jitter(cell.seed, 50 + f) * rh * 0.18
    const len = yr * (1.0 + 0.6 * Math.abs(jitter(cell.seed, 60 + f)))
    const ang = jitter(cell.seed, 70 + f) * Math.PI
    const hair: Vec2[] = [
      toWorld(lu0, lv0),
      toWorld(lu0 + Math.cos(ang) * len, lv0 + Math.sin(ang) * len),
    ]
    out.push({
      path: hair,
      z0: yr * 1.7,
      arch: yr * 0.9,
      radiusMm: yr * 0.12,
      filaments: 1,
      twistPerMm: 0,
      material: mat,
      seed: cell.seed + 3 + f,
    })
  }

  void filaments
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
