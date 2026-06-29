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
  const sw = yr * 2.4 // column spacing — denser
  const tw = yr * 1.0 // stitch half-width
  const vh = yr * 0.66 // V height — shorter/blockier (sc is compact, not a tall knit V)
  const z = yr * 0.5 // front relief of the visible V
  const baseRow = yr * 1.7 // shorter rows -> dense sc, not airy

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

  // Foundation (row 0): pinned front "V" crowns the first row links behind.
  const vBelow: number[] = new Array(W).fill(-1) // each stitch's V-centre below
  for (let c = 0; c < W; c++) {
    push(c * sw - tw, vh * 0.6, z, 0)
    const vc = push(c * sw, -vh * 0.4, z, 0) // V bottom-centre
    push(c * sw + tw, vh * 0.6, z, 0)
    vBelow[c] = vc
  }

  // Worked rows: each stitch is a clean FRONT V (visible, +z); the link to the
  // row below is a small excursion BEHIND the fabric (−z), hidden by the backing,
  // so the top face reads as a tidy grid of V's — like real single crochet.
  for (let j = 0; j < rowTypes.length; j++) {
    const ty = yTop[j]!
    const by = j === 0 ? 0 : yTop[j - 1]!
    const mid = (ty + by) * 0.5
    const dir = j % 2 === 0 ? 1 : -1
    const vThis: number[] = new Array(W).fill(-1)
    // hdc/dc/tr leave a visible horizontal "third loop" ridge across each row —
    // the signature bar that tells hdc apart from sc.
    const tall = rowTypes[j] === 'hdc' || rowTypes[j] === 'dc' || rowTypes[j] === 'tr'

    for (let o = 0; o < W; o++) {
      const c = dir > 0 ? o : W - 1 - o
      const s = dir
      const x = c * sw
      const bv = vBelow[c]!
      const isDc = rowTypes[j] === 'dc' || rowTypes[j] === 'tr'

      let link: number
      let vc: number
      if (isDc) {
        // dc/tr: a VISIBLE tall front POST (down one side, up the other — the
        // double-bar of a dc) worked into the stitch below, then the V on top.
        // The post stands on the front (+z), which is the whole look of dc.
        push(x - s * tw * 0.45, ty - vh * 0.3, z)
        push(x - s * tw * 0.4, (ty + by) * 0.5, z * 1.0) // left post strand, down
        push(x - s * tw * 0.2, by + vh * 0.35, z * 0.6)
        link = push(x, by + vh * 0.1, -z * 0.5) // brief dip behind to hook the below V
        push(x + s * tw * 0.2, by + vh * 0.35, z * 0.6)
        push(x + s * tw * 0.4, (ty + by) * 0.5, z * 1.0) // right post strand, up
        push(x + s * tw * 0.45, ty - vh * 0.3, z)
        push(x - s * tw, ty + vh * 0.45, z)
        vc = push(x, ty + vh * 0.8, z * 1.1) // V top (the chain the next row works)
        push(x + s * tw, ty + vh * 0.45, z)
      } else {
        // sc/hdc: link routed BEHIND (hidden); front shows a flat barred top.
        push(x + s * tw * 0.4, mid, -z * 0.6)
        link = push(x, by + vh * 0.2, -z * 1.5) // tucked behind the below stitch
        push(x - s * tw * 0.4, mid, -z * 0.6)
        // hdc third-loop ridge: a horizontal bar across the front-base, proud (+z).
        if (tall) {
          push(x - s * tw * 0.95, ty - vh * 0.95, z * 1.2)
          push(x + s * tw * 0.95, ty - vh * 0.95, z * 1.2)
        }
        push(x - s * tw, ty + vh * 0.15, z)
        push(x - s * tw * 0.34, ty + vh * 0.6, z * 1.05) // bar, left
        vc = push(x, ty + vh * 0.2, z * 1.0) // shallow notch (not a deep knit V)
        push(x + s * tw * 0.34, ty + vh * 0.6, z * 1.05) // bar, right
        push(x + s * tw, ty + vh * 0.15, z)
      }
      vThis[c] = vc

      if (bv >= 0) dist.push({ a: link, b: bv, rest: yr * 1.1, k: 0.45 })
    }

    for (let c = 0; c < W; c++) vBelow[c] = vThis[c]!
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
