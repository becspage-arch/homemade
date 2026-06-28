/**
 * General flat swatch builder — rows of arbitrary stitch types, proving the
 * dictionary + relaxation handle MIXED stitches (sc / hdc / dc together). Each
 * row's height comes from its stitch's `heightFactor`, so taller stitches build
 * taller bands; every stitch still links to the head of the stitch below, exactly
 * as before. The relaxer is unchanged — only the topology fed to it varies.
 */

import { type RNode, type DistConstraint, type YarnModel } from './relax'
import { STITCHES, type StitchId } from './dictionary'

export interface BuiltSwatch {
  model: YarnModel
  stitchLoops: number[][]
  yarnRadiusMm: number
  widthMm: number
  heightMm: number
}

// One stitch loop, 9 control nodes in cell-local mm. Width `a` (half), the post
// runs from the feet at the bottom up to the head; `b` (half-height) scales with
// the stitch type so sc/hdc/dc read as short/medium/tall.
function loopLocal(a: number, b: number, yr: number): [number, number, number][] {
  return [
    [-a * 0.55, -b * 1.05, -yr * 0.9], // 0 left foot (behind, links to row below)
    [-a * 0.82, -b * 0.45, -yr * 0.1], // 1 left leg lower
    [-a * 0.74, b * 0.2, yr * 0.35], // 2 left leg upper
    [-a * 0.36, b * 0.86, yr * 0.75], // 3 head left loop
    [0, b * 1.0, yr * 0.7], // 4 head top (worked into by the next row)
    [a * 0.36, b * 0.86, yr * 0.75], // 5 head right loop
    [a * 0.74, b * 0.2, yr * 0.35], // 6 right leg upper
    [a * 0.82, -b * 0.45, -yr * 0.1], // 7 right leg lower
    [a * 0.55, -b * 1.05, -yr * 0.9], // 8 right foot (behind)
  ]
}

export function buildSwatch(rowTypes: StitchId[], stitchesPerRow: number, yarnRadiusMm: number): BuiltSwatch {
  const yr = yarnRadiusMm
  const W = stitchesPerRow
  const sw = yr * 3.4 // stitch width (slightly denser than the first slice)
  const baseRow = yr * 3.6 // sc row height
  const a = sw * 0.5

  // Cumulative y of each row's BASE (bottom) and the centre of each row.
  const rowHeight = rowTypes.map((t) => baseRow * STITCHES[t].heightFactor)
  const rowBase: number[] = [0]
  for (let j = 0; j < rowTypes.length; j++) rowBase.push(rowBase[j]! + rowHeight[j]!)

  const nodes: RNode[] = []
  const dist: DistConstraint[] = []
  const bend: DistConstraint[] = []
  const strand: number[] = []
  const along: number[] = []
  const stitchLoops: number[][] = []
  const idx = (i: number, j: number): number => j * W + i

  const dst = (i: number, j: number): number =>
    Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y, nodes[i]!.z - nodes[j]!.z)

  for (let j = 0; j < rowTypes.length; j++) {
    const b = rowHeight[j]! * 0.5
    const cy = rowBase[j]! + b // row centre
    for (let i = 0; i < W; i++) {
      const cx = i * sw
      const local = loopLocal(a, b, yr)
      const base = nodes.length
      const loop: number[] = []
      for (let k = 0; k < 9; k++) {
        const [lx, ly, lz] = local[k]!
        const isFoot = k === 0 || k === 8
        const pinned = j === 0 && isFoot
        nodes.push({ x: cx + lx, y: cy + ly, z: pinned ? 0 : lz, w: pinned ? 0 : 1 })
        strand.push(idx(i, j))
        along.push(k)
        loop.push(base + k)
      }
      stitchLoops.push(loop)

      for (let k = 0; k < 8; k++) dist.push({ a: base + k, b: base + k + 1, rest: dst(base + k, base + k + 1), k: 1 })
      for (let k = 0; k < 7; k++) bend.push({ a: base + k, b: base + k + 2, rest: dst(base + k, base + k + 2), k: 0.25 })

      if (j > 0) {
        const belowHead = stitchLoops[idx(i, j - 1)]![4]!
        dist.push({ a: base + 0, b: belowHead, rest: yr * 1.7, k: 0.5 })
        dist.push({ a: base + 8, b: belowHead, rest: yr * 1.7, k: 0.5 })
      }
      if (i > 0) {
        const prevHeadR = stitchLoops[idx(i - 1, j)]![5]!
        dist.push({ a: prevHeadR, b: base + 3, rest: dst(prevHeadR, base + 3), k: 0.4 })
      }
    }
  }

  return {
    model: { nodes, dist, bend, strand, along },
    stitchLoops,
    yarnRadiusMm: yr,
    widthMm: W * sw,
    heightMm: rowBase[rowTypes.length]!,
  }
}
