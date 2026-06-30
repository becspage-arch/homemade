/**
 * Continuous-yarn fabric — the REAL model, genuinely STITCHED (not drawn).
 *
 * One unbroken strand traces the whole swatch exactly the way a hook lays it. The
 * yarn comes from the previous stitch's head (at the top of the row), reaches DOWN
 * and hooks UNDER the head-loop of the stitch below (the insertion), then is pulled
 * back UP, throwing its own head-loop at the top — the loop the NEXT row will hook
 * under in turn. Row after row, turning at each end.
 *
 * The interlock is NOT a spring tying a node to the head below, and the shape is NOT
 * a pinned drawing. The new stitch's descending leg is initialised on the OPPOSITE
 * z-side of the below crown (it dives behind a crown that rides proud in front), so
 * the two are topologically linked; SELF-COLLISION during relaxation (yarn cannot
 * pass through yarn) is what keeps them linked and opens every loop to a yarn-width.
 * The post HEIGHT relaxes out of the yarn fed per stitch: a dc feeds a longer leg
 * between the same two anchors than an sc, so it stands as a taller post.
 *
 * Only the foundation chain is pinned (the anchor edge); every worked stitch is free
 * and finds its shape under the constraints. See STITCH_ENGINE.md §2, §4, §9 and the
 * HARD RULE "no faking the stitch formation".
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

export interface BuildOpts {
  /** Per-stitch override (row j, column c) → stitch id. For patterns like
   *  basketweave / mixed-stitch motifs. Falls back to rowTypes[j] when absent. */
  stitchAt?: (j: number, c: number) => StitchId
}

export function buildContinuous(
  rowTypes: StitchId[],
  stitchesPerRow: number,
  yarnRadiusMm: number,
  opts: BuildOpts = {},
): BuiltContinuous {
  const yr = yarnRadiusMm
  const W = stitchesPerRow
  // Column spacing is gauge: a short stitch (sc) packs dense with almost no holes;
  // a tall stitch (dc/tr) is more open. Keyed off the swatch's stitch.
  const st0 = rowTypes[0] ?? 'sc'
  const sw =
    yr *
    (st0 === 'fpdc' || st0 === 'bpdc'
      ? 1.9 // post stitches pack DENSE — ribs touch into solid fabric, not isolated sticks
      : st0 === 'slst'
        ? 1.9
        : st0 === 'sc' || st0 === 'scblo' || st0 === 'scflo'
          ? 2.0
          : st0 === 'hdc'
            ? 2.2
            : 2.5) // column spacing
  const z = yr * 0.3 // base relief (gentle — turned fabric is fairly flat, not corrugated)
  const zh = yr * 0.5 // crown relief (the head rides proud on its worked face)
  const cw = yr * 0.4 // crown half-width — a slim head-line, not a fat rope
  const pw = yr * 0.35 // post half-width (the down-leg and up-leg straddle this → one solid post)
  const dh = yr * 0.55 // how far the hook dives above/below the crown it links
  const baseRow = yr * 1.55 // row pitch per unit heightFactor (sc short, dc tall)

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

  // Add a node to the END of the running strand; auto-bond it to the previous one
  // (distance = keep length; bend = resist kinking). NOTHING is joined by any other
  // means — links between rows are physical (collision), never a spring.
  let prev = -1
  const push = (x: number, y: number, zz: number, w = 1): number => {
    nodes.push({ x, y, z: zz, w })
    const idx = nodes.length - 1
    if (prev >= 0) {
      dist.push({ a: prev, b: idx, rest: dst(prev, idx), k: 1 })
      if (strandPath.length >= 2) {
        const pp = strandPath[strandPath.length - 2]!
        // Firm bending = real yarn stiffness. A worked post is a semi-rigid column;
        // without this the long dc post coils into the gap instead of standing tall.
        bend.push({ a: pp, b: idx, rest: dst(pp, idx), k: 0.7 })
      }
    }
    strandPath.push(idx)
    prev = idx
    return idx
  }

  // Per column, the BACK loop and FRONT loop of the stitch below (the head's two
  // loops). A normal stitch hooks the back loop; back-loop-only / front-loop-only
  // pick one and leave the other floating as a ridge. For a plain head the two
  // point at the same node, so plain stitches behave exactly as before.
  const belowBack: number[] = new Array(W).fill(-1)
  const belowFront: number[] = new Array(W).fill(-1)

  // Foundation chain (row -1): a row of proud crowns, pinned (the cast-on edge the
  // first worked row hooks into). One continuous strand, left to right.
  for (let c = 0; c < W; c++) {
    push(c * sw - cw, -dh * 0.4, zh, 0)
    const crown = push(c * sw, 0, zh * 1.15, 0)
    push(c * sw + cw, -dh * 0.4, zh, 0)
    belowBack[c] = crown
    belowFront[c] = crown
  }

  // Worked rows. Each stitch: down-leg → hook UNDER the below crown → up-leg → throw
  // this stitch's crown. The work is TURNED at each row end: in the fabric's fixed
  // frame that means the hook alternates direction and the yarn continues straight
  // from where the last row ended — never floating back. The foundation is built
  // left→right (ends on the RIGHT), so the first worked row starts on the right
  // (dir = −1) and turns into it like every other row; otherwise the yarn floats
  // across from the foundation's right end to a left-hand start.
  // Post mid of the stitch below at each column — the stem a front/back-post stitch
  // rings around. Seeded to the foundation crown (row 0 has no real post below).
  const postBelow: number[] = belowBack.slice()

  for (let j = 0; j < rowTypes.length; j++) {
    const ty = yTop[j]!
    const by = j === 0 ? 0 : yTop[j - 1]!
    const dir = j % 2 === 0 ? -1 : 1
    // TURN the work: alternate rows are worked from the opposite face (right side /
    // wrong side). `fz` carries the stitch's +z/−z handedness. The hook always dives
    // to the OPPOSITE z-side of whichever loop it links, so the interlock is real on
    // either face.
    const fz = j % 2 === 0 ? 1 : -1
    const crownThisBack: number[] = new Array(W).fill(-1)
    const crownThisFront: number[] = new Array(W).fill(-1)
    const postThis: number[] = new Array(W).fill(-1)

    for (let o = 0; o < W; o++) {
      const c = dir > 0 ? o : W - 1 - o
      const s = dir
      const x = c * sw
      const id = opts.stitchAt ? opts.stitchAt(j, c) : rowTypes[j]!
      // Per-stitch variants: hdc's third loop; blo/flo loop choice; front/back post.
      const thirdLoop = id === 'hdc'
      const loopMode = id === 'scblo' ? 'blo' : id === 'scflo' ? 'flo' : 'both'
      const postMode = id === 'fpdc' ? 'fp' : id === 'bpdc' ? 'bp' : 'none'
      const px = ty - by // post span (tall for dc, short for sc)

      if (postMode !== 'none') {
        // FRONT/BACK POST: instead of hooking the head, the yarn RINGS around the
        // stem of the post below (front post pops the new post PROUD on the front,
        // back post sinks it to the back). The ring threads the post and is held on
        // it by collision — a genuine wrap, not a spring. This is what builds the
        // raised/recessed columns of post-stitch ribbing + basketweave.
        const pa = postBelow[c]!
        const ay = nodes[pa]!.y
        const az = nodes[pa]!.z
        const front = postMode === 'fp' ? 1 : -1
        // Only the post BODY pops (fp proud forward, bp mildly recessed but still
        // visible); the HEAD stays at the fabric plane so the stitch-to-stitch travel
        // runs flat along the row — otherwise adjacent fp/bp heads jump z and tangle.
        const ppz = postMode === 'fp' ? z * 3.0 : -z * 2.2 // fp ribs pop forward, bp valleys sink back — the contrast IS the rib
        // A FULL two-strand post (like a dc), wrapped around the stem below and popped
        // boldly forward (fp) or back (bp). Heads stay at the PLANE so the row's travel
        // runs flat and alternating fp/bp columns don't tangle; the body pop alone
        // makes the raised ribs + recessed valleys.
        push(x + s * pw, by + px * 0.85, zh * 0.35 * fz) // leave the previous head near the plane
        push(x + s * pw, by + px * 0.52, ppz) // down-leg, popped
        push(x + s * pw, by + px * 0.22, ppz)
        // ring around the below post stem (encircle it → linked, collision-held)
        push(x + cw * 1.15, ay, az)
        push(x, ay - dh * 0.2, az - front * cw * 1.5) // around the far z-side of the stem
        push(x - cw * 1.15, ay, az)
        push(x - s * pw, by + px * 0.22, ppz) // up-leg, popped
        const postMid = push(x - s * pw, by + px * 0.52, ppz)
        push(x - s * pw, by + px * 0.85, zh * 0.35 * fz)
        postThis[c] = postMid
        // Head at the PLANE (flat) — keeps the row connected and lets fp/bp alternate.
        push(x - s * cw, ty - dh * 0.3, zh * fz)
        const crown = push(x, ty, zh * 1.15 * fz)
        push(x + s * cw, ty - dh * 0.3, zh * fz)
        crownThisBack[c] = crown
        crownThisFront[c] = crown
        continue
      }

      const bc = (loopMode === 'flo' ? belowFront[c] : belowBack[c])! // the loop this stitch hooks under
      const bcOther = (loopMode === 'flo' ? belowBack[c] : belowFront[c])! // the loop left to float as a ridge
      const cy = nodes[bc]!.y // its actual y (the row joins where the loop below sits)
      const hookZ = (nodes[bc]!.z >= 0 ? -1 : 1) * z * 1.6 // dive to the FAR side of that crown

      // hdc third loop: the start-of-stitch yarn-over, laid horizontally across the
      // head line before the hook dives. Consecutive ones form the signature ridge.
      if (thirdLoop) push(x + s * cw * 1.1, ty - dh * 0.9, z * 1.7 * fz)
      // Down-leg: descend the worked face from the previous head toward the insertion.
      push(x + s * pw, by + px * 0.8, z * fz)
      push(x + s * pw, by + px * 0.52, z * fz)
      push(x + s * pw, by + px * 0.26, z * 1.1 * fz)
      push(x + s * pw * 0.4, cy + dh * 0.5, z * 0.6 * fz) // approach the below crown
      // Hook UNDER the crown below — tuck to the far z-side of it. Collision (neither
      // can pass through the other) holds the link — no spring.
      push(x, cy - dh, hookZ)
      push(x - s * pw * 0.4, cy + dh * 0.5, z * 0.6 * fz) // emerge
      // Up-leg: pulled back UP just beside the down-leg → the two strands of the post.
      push(x - s * pw, by + px * 0.26, z * 1.1 * fz)
      const postMid = push(x - s * pw, by + px * 0.52, z * fz)
      push(x - s * pw, by + px * 0.8, z * fz)
      postThis[c] = postMid
      // Float the BELOW head's unworked loop proud as a ridge (only blo/flo leave one).
      if (loopMode !== 'both' && bcOther !== bc) nodes[bcOther]!.z *= 1.7

      // Throw this stitch's crown. A plain stitch leaves a single apex (back == front,
      // identical to before); blo/flo split it into a back loop + proud front loop.
      push(x - s * cw, ty - dh * 0.3, zh * fz)
      if (loopMode === 'both') {
        const crown = push(x, ty, zh * 1.15 * fz)
        crownThisBack[c] = crown
        crownThisFront[c] = crown
      } else {
        crownThisBack[c] = push(x - s * cw * 0.18, ty, zh * 0.72 * fz) // back loop (tucked)
        crownThisFront[c] = push(x + s * cw * 0.18, ty, zh * 1.25 * fz) // front loop (proud)
      }
      push(x + s * cw, ty - dh * 0.3, zh * fz)
    }

    for (let c = 0; c < W; c++) {
      belowBack[c] = crownThisBack[c]!
      belowFront[c] = crownThisFront[c]!
      postBelow[c] = postThis[c]!
    }
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
