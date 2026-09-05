/**
 * Thin vertical slice — a plain single-crochet swatch, the simplest fabric, used
 * to PROVE the relaxation produces recognisable crochet before any of the wider
 * engine (full dictionary, graph, 3D) is built.
 *
 * Minimal dictionary: a foundation chain (ch, pinned) + single crochet (sc). Each
 * sc is one yarn loop (an Ω: two feet, two legs, a head) worked into the stitch
 * directly below. We build the loops ALREADY threaded — each stitch's two feet
 * straddle the head of the stitch below, behind it in z, so the below-head pokes
 * up between them — then hand the whole thing to `relax()`, which snugs every loop
 * to a yarn-width and resolves the real interlocked shapes. Nothing here is the
 * final stitch geometry; it is the topology + a loose start. The relax does the rest.
 */

import { type RNode, type DistConstraint, type YarnModel } from './relax'

export interface ScSwatchSpec {
  stitches: number
  rows: number
  /** Yarn bundle radius (mm). */
  yarnRadiusMm: number
}

export interface BuiltSwatch {
  model: YarnModel
  /** Node indices of each stitch's loop, in worked order. */
  stitchLoops: number[][]
  yarnRadiusMm: number
}

// One sc loop, 9 control nodes in cell-local mm (origin = cell centre).
// Ω shape: feet low + BEHIND (−z), head high + PROUD (+z).
function loopLocal(a: number, b: number, yr: number): [number, number, number][] {
  return [
    [-a * 0.55, -b * 1.05, -yr * 0.9], // 0 left foot (behind, reaches below)
    [-a * 0.82, -b * 0.2, -yr * 0.1], // 1 left leg
    [-a * 0.72, b * 0.45, yr * 0.5], // 2 left shoulder
    [-a * 0.34, b * 0.92, yr * 0.75], // 3 head left
    [0, b * 1.02, yr * 0.78], // 4 head top (this is the loop the NEXT row works into)
    [a * 0.34, b * 0.92, yr * 0.75], // 5 head right
    [a * 0.72, b * 0.45, yr * 0.5], // 6 right shoulder
    [a * 0.82, -b * 0.2, -yr * 0.1], // 7 right leg
    [a * 0.55, -b * 1.05, -yr * 0.9], // 8 right foot (behind)
  ]
}

export function buildScSwatch(spec: ScSwatchSpec): BuiltSwatch {
  const { stitches: W, rows: H, yarnRadiusMm: yr } = spec
  const sw = yr * 4 // loose gauge so loops are clearly visible in the proof
  const rh = yr * 4
  const a = sw * 0.5
  const b = rh * 0.5

  const nodes: RNode[] = []
  const dist: DistConstraint[] = []
  const bend: DistConstraint[] = []
  const strand: number[] = []
  const along: number[] = []
  const stitchLoops: number[][] = []

  const dst = (i: number, j: number): number =>
    Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y, nodes[i]!.z - nodes[j]!.z)

  const idx = (i: number, j: number): number => j * W + i // stitch index -> loop array

  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const cx = i * sw
      const cy = j * rh
      const local = loopLocal(a, b, yr)
      const base = nodes.length
      const sIdx = idx(i, j)
      const loop: number[] = []
      for (let k = 0; k < 9; k++) {
        const [lx, ly, lz] = local[k]!
        // Bottom row's feet are the foundation chain: pin them to the plane.
        const isFoot = k === 0 || k === 8
        const pinned = j === 0 && isFoot
        nodes.push({ x: cx + lx, y: cy + ly, z: pinned ? 0 : lz, w: pinned ? 0 : 1 })
        strand.push(sIdx)
        along.push(k)
        loop.push(base + k)
      }
      stitchLoops.push(loop)

      // Yarn length along the loop + bending.
      for (let k = 0; k < 8; k++) dist.push({ a: base + k, b: base + k + 1, rest: dst(base + k, base + k + 1), k: 1 })
      for (let k = 0; k < 7; k++) bend.push({ a: base + k, b: base + k + 2, rest: dst(base + k, base + k + 2), k: 0.25 })

      // Link to the stitch below: both feet pull toward the below-stitch HEAD, so
      // they wrap around it (the below-head pokes up between them). This is the
      // interlock that makes it fabric.
      if (j > 0) {
        const belowHead = stitchLoops[idx(i, j - 1)]![4]!
        dist.push({ a: base + 0, b: belowHead, rest: yr * 1.7, k: 0.5 })
        dist.push({ a: base + 8, b: belowHead, rest: yr * 1.7, k: 0.5 })
      }

      // Row continuity: chain this head to the previous stitch's head (one yarn).
      if (i > 0) {
        const prevHeadR = stitchLoops[idx(i - 1, j)]![5]!
        dist.push({ a: prevHeadR, b: base + 3, rest: dst(prevHeadR, base + 3), k: 0.4 })
      }
    }
  }

  return { model: { nodes, dist, bend, strand, along }, stitchLoops, yarnRadiusMm: yr }
}
