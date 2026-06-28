/**
 * Continuous-yarn fabric — the REAL model.
 *
 * One unbroken strand traces the whole swatch exactly the way a hook lays it:
 * it dips DOWN into the stitch below, hooks UNDER that stitch's top, pulls back
 * UP, throws its own top loop, and travels on to the next stitch — row after row,
 * turning at each end. There are no separate "stitch pieces" and no spring links:
 * the interlock is the yarn physically passing under the loop below, held there
 * by self-collision during relaxation. This is what scales — every stitch (simple
 * or complex) is just a different excursion of the one strand, and 3D is the same
 * strand on a curved surface.
 *
 * A stitch's excursion (worked left→right with sign s, into the stitch below):
 *   top-left → down → behind below-top → UNDER below-top → behind → up → top-right
 *   → over the crown (the loop the next row will hook). Taller stitches (hdc/dc)
 *   just reach further down (a longer post).
 */

import { type RNode, type DistConstraint, type YarnModel } from './relax'
import { STITCHES, type StitchId } from './dictionary'

export interface BuiltContinuous {
  model: YarnModel
  /** The single ordered strand (node indices) to render as one yarn. */
  strandPath: number[]
  yarnRadiusMm: number
  widthMm: number
  heightMm: number
}

export function buildContinuous(rowTypes: StitchId[], stitchesPerRow: number, yarnRadiusMm: number): BuiltContinuous {
  const yr = yarnRadiusMm
  const W = stitchesPerRow
  const sw = yr * 2.6 // column spacing — denser (real sc packs small, even stitches)
  const tw = yr * 1.05 // stitch half-width
  const vh = yr * 0.42 // crown height — small
  const z = yr * 0.34 // front relief — very LOW, so sc lies nearly flat
  const baseRow = yr * 2.0

  const rowH = rowTypes.map((t) => baseRow * STITCHES[t].heightFactor)
  const yTop: number[] = []
  let acc = 0
  for (let j = 0; j < rowTypes.length; j++) {
    acc += rowH[j]!
    yTop.push(acc)
  }

  const nodes: RNode[] = []
  const dist: DistConstraint[] = []
  const bend: DistConstraint[] = []
  const strandPath: number[] = []
  const dst = (i: number, j: number): number =>
    Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y, nodes[i]!.z - nodes[j]!.z)

  // Add a node to the END of the running strand; auto-bond it to the previous one.
  let prev = -1
  const push = (x: number, y: number, zz: number, w = 1): number => {
    nodes.push({ x, y, z: zz, w })
    const idx = nodes.length - 1
    if (prev >= 0) {
      dist.push({ a: prev, b: idx, rest: dst(prev, idx), k: 1 })
      if (strandPath.length >= 2) {
        const pp = strandPath[strandPath.length - 2]!
        bend.push({ a: pp, b: idx, rest: dst(pp, idx), k: 0.22 })
      }
    }
    strandPath.push(idx)
    prev = idx
    return idx
  }

  // Foundation chain (row 0): pinned crowns the first row hooks into.
  const crownBelow: number[] = new Array(W).fill(-1)
  for (let c = 0; c < W; c++) {
    push(c * sw - tw, 0, z * 0.6, 0)
    const cr = push(c * sw, vh * 0.7, z * 0.7, 0)
    push(c * sw + tw, 0, z * 0.6, 0)
    crownBelow[c] = cr
  }

  // Worked rows.
  for (let j = 0; j < rowTypes.length; j++) {
    const ty = yTop[j]!
    const by = j === 0 ? 0 : yTop[j - 1]!
    const mid = (ty + by) * 0.5
    const dir = j % 2 === 0 ? 1 : -1 // serpentine
    const crownThis: number[] = new Array(W).fill(-1)

    // Turning chain at the start of the row (lifts the yarn to this row).
    const startC = dir > 0 ? 0 : W - 1
    push(startC * sw - dir * tw * 1.4, ty - vh, z * 0.6, 1)

    for (let o = 0; o < W; o++) {
      const c = dir > 0 ? o : W - 1 - o
      const s = dir
      const x = c * sw
      const bc = crownBelow[c]! // the crown of the stitch directly below
      const bx = bc >= 0 ? nodes[bc]!.x : x
      const byy = bc >= 0 ? nodes[bc]!.y : by

      // top-left -> down -> UNDER the below crown (threading) -> up -> top-right
      push(x - s * tw, ty, z)
      push(x - s * tw * 0.45, mid, z * 0.4)
      push(x - s * tw * 0.22, byy + vh * 0.35, -z * 0.95) // behind below crown (near side)
      const under = push(bx, byy - yr * 0.15, -z * 0.45) // UNDER the below crown
      push(x + s * tw * 0.22, byy + vh * 0.35, -z * 0.95) // behind below crown (far side)
      push(x + s * tw * 0.45, mid, z * 0.4)
      push(x + s * tw, ty, z) // top-right
      const cr = push(x, ty + vh, z * 1.15) // crown (next row hooks this)
      crownThis[c] = cr

      // Hold the stitch onto the correct stitch below (soft; collision does the rest).
      if (bc >= 0) dist.push({ a: under, b: bc, rest: yr * 1.0, k: 0.4 })
    }

    for (let c = 0; c < W; c++) crownBelow[c] = crownThis[c]!
  }

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  return {
    model: { nodes, dist, bend, strand, along },
    strandPath,
    yarnRadiusMm: yr,
    widthMm: W * sw,
    heightMm: acc,
  }
}
