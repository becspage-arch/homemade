/**
 * General flat swatch builder — anatomy-correct stitches.
 *
 * A crochet stitch is TWO parts, not one ring:
 *   - a TOP "V" — the two top loops, a small chain the NEXT row works into,
 *   - a POST hanging below it down to the stitch below — short for sc, taller for
 *     hdc, tall and DOUBLED for dc (the double yarn-over).
 * The row of top-Vs is the connective chain; the posts are the bars between rows.
 * Modelling that (instead of one big loop per stitch) is what makes sc read as
 * dense little V-rows and dc as tall airy posts. The relaxer is unchanged — it
 * just resolves this richer topology.
 */

import { type RNode, type DistConstraint, type YarnModel } from './relax'
import { STITCHES, type StitchId } from './dictionary'

export interface BuiltSwatch {
  model: YarnModel
  /** Yarn pieces to render — each an ordered list of node indices (a strand or loop). */
  pieces: number[][]
  yarnRadiusMm: number
  widthMm: number
  heightMm: number
}

interface Stitch {
  /** Top-loop node indices: [left, upL, upR, right, frontBottom]. */
  top: number[]
  /** Bottom node index of each post strand (links into the stitch below). */
  postBottoms: number[]
}

export function buildSwatch(rowTypes: StitchId[], stitchesPerRow: number, yarnRadiusMm: number): BuiltSwatch {
  const yr = yarnRadiusMm
  const W = stitchesPerRow
  const sw = yr * 3.0 // column spacing
  const tw = yr * 1.25 // top-loop half width
  const vh = yr * 0.7 // top-loop height
  const zr = yr * 0.85 // top relief above the fabric
  const basePost = yr * 2.4 // sc post length; taller stitches scale this up

  const nodes: RNode[] = []
  const dist: DistConstraint[] = []
  const bend: DistConstraint[] = []
  const strand: number[] = []
  const along: number[] = []
  const pieces: number[][] = []
  const stitches: Stitch[] = []
  const idx = (i: number, j: number): number => j * W + i

  const dst = (i: number, j: number): number =>
    Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y, nodes[i]!.z - nodes[j]!.z)

  let sid = 0
  const addNode = (x: number, y: number, z: number, w: number): number => {
    nodes.push({ x, y, z, w })
    strand.push(sid)
    along.push(nodes.length) // monotone; only same-strand adjacency matters
    return nodes.length - 1
  }

  // Cumulative top height of each row: a row's top sits `postLen` above the row below.
  const postLen = rowTypes.map((t) => basePost * STITCHES[t].heightFactor)
  const topY: number[] = []
  let acc = 0
  for (let j = 0; j < rowTypes.length; j++) {
    acc += postLen[j]!
    topY.push(acc)
  }

  for (let j = 0; j < rowTypes.length; j++) {
    const type = rowTypes[j]!
    const ty = topY[j]!
    const belowY = j === 0 ? 0 : topY[j - 1]!
    const nStrands = type === 'dc' || type === 'tr' ? 2 : 1 // dc/tr posts are doubled
    for (let i = 0; i < W; i++) {
      sid = idx(i, j)
      const cx = i * sw

      // --- Top "V" loop (5 nodes), lying along the row, raised. ---
      const T0 = addNode(cx - tw, ty, zr, 1) // left
      const T1 = addNode(cx - tw * 0.4, ty + vh, zr * 1.15, 1) // up-left
      const T2 = addNode(cx + tw * 0.4, ty + vh, zr * 1.15, 1) // up-right
      const T3 = addNode(cx + tw, ty, zr, 1) // right
      const T4 = addNode(cx, ty - vh * 0.7, zr * 0.7, 1) // front-bottom (posts attach here)
      const top = [T0, T1, T2, T3, T4]
      // close the V loop + bending
      dist.push({ a: T0, b: T1, rest: dst(T0, T1), k: 1 })
      dist.push({ a: T1, b: T2, rest: dst(T1, T2), k: 1 })
      dist.push({ a: T2, b: T3, rest: dst(T2, T3), k: 1 })
      dist.push({ a: T3, b: T4, rest: dst(T3, T4), k: 1 })
      dist.push({ a: T4, b: T0, rest: dst(T4, T0), k: 1 })
      bend.push({ a: T0, b: T2, rest: dst(T0, T2), k: 0.3 })
      bend.push({ a: T1, b: T3, rest: dst(T1, T3), k: 0.3 })
      pieces.push([T0, T1, T2, T3, T4, T0])

      // --- Post(s): from the top down to the row below. ---
      const len = postLen[j]!
      const nseg = Math.max(2, Math.round(len / (yr * 1.5)))
      const postBottoms: number[] = []
      for (let s = 0; s < nStrands; s++) {
        const off = nStrands === 1 ? 0 : (s === 0 ? -1 : 1) * tw * 0.5
        const piece: number[] = [T4]
        let prev = T4
        for (let k = 1; k <= nseg; k++) {
          const f = k / nseg
          const py = ty - vh * 0.7 - (ty - vh * 0.7 - belowY) * f
          const pinned = j === 0 && k === nseg
          const ni = addNode(cx + off, py, zr * 0.5 * (1 - f), pinned ? 0 : 1)
          dist.push({ a: prev, b: ni, rest: dst(prev, ni), k: 1 })
          if (k >= 2) bend.push({ a: piece[piece.length - 2]!, b: ni, rest: dst(piece[piece.length - 2]!, ni), k: 0.25 })
          piece.push(ni)
          prev = ni
        }
        postBottoms.push(prev)
        pieces.push(piece)
      }

      stitches.push({ top, postBottoms })

      // Link the post bottom(s) into the TOP V of the stitch below.
      if (j > 0) {
        const below = stitches[idx(i, j - 1)]!
        for (const pb of postBottoms) {
          dist.push({ a: pb, b: below.top[4]!, rest: yr * 1.2, k: 0.5 })
        }
      }
      // Row continuity: this top's right end chains to the previous stitch's top.
      if (i > 0) {
        const prevTop = stitches[idx(i - 1, j)]!.top
        dist.push({ a: prevTop[3]!, b: T0, rest: dst(prevTop[3]!, T0), k: 0.5 })
      }
    }
  }

  return { model: { nodes, dist, bend, strand, along }, pieces, yarnRadiusMm: yr, widthMm: W * sw, heightMm: acc }
}
