/**
 * Shaped fabric builders — increases, decreases, and working in the round off a
 * magic ring. Same invariants as the flat grid builder, enforced by the same
 * audit: ONE continuous strand, every interlock a genuine hook under the crown
 * below held by self-collision, pins only on the anchor (foundation chain /
 * magic ring), no springs.
 *
 * What shaping adds over the grid:
 *  - rows/rounds have their OWN stitch counts; each new stitch's crown sits on
 *    its own row's lattice while its hook reaches whatever it consumes below
 *    (emitPlainStitch's xCrown/xHook split). An INCREASE is two full stitches
 *    hooking the same below-crown — the legs genuinely fan from the shared base.
 *  - a DECREASE (st2tog) is one stitch whose down-leg hooks under the first
 *    below-crown, rises partway, dives under the SECOND, and throws a single
 *    crown above the pair — two real hooks, one head (emitDecrease).
 *  - WORKING IN THE ROUND lays the same excursions through a polar frame
 *    (arc length ↔ x, radius ↔ y, relief stays z). Amigurumi spiral rounds are
 *    worked without turning, so there is no face flip — every round's relief
 *    faces the same way, exactly like the real fabric.
 */

import { STITCHES, type StitchId, type ShapeOp } from './dictionary'
import {
  createStrand,
  stitchDims,
  emitPlainStitch,
  BASE_ROW_YR,
  type BuiltContinuous,
  type StrandCtx,
  type StitchDims,
  ridgeDebugNodes,
} from './yarnPath'

interface Crown {
  back: number
  front: number
  /** Fabric-frame position along the row (world x when flat, arc length in rounds). */
  x: number
}

const consumes = (op: ShapeOp): number => (op === 'dec' ? 2 : 1)

/**
 * One DECREASE (st2tog) excursion: down-leg → hook under below-crown A → rise
 * partway toward this stitch's own crown → dive → hook under below-crown B →
 * up-leg → ONE crown at xCrown. Both hooks are genuine interlocks (recorded,
 * audited); the gathered look must emerge from the two converging legs.
 */
export interface DecSpec {
  j: number
  c: number
  id: StitchId
  s: number
  fz: number
  by: number
  ty: number
  xCrown: number
  /** First + second consumed below crowns, in WORK order. */
  b1: Crown
  b2: Crown
  cy1?: number
  cy2?: number
  place?: (lx: number, ly: number) => { x: number; y: number }
}

export function emitDecrease(S: StrandCtx, d: StitchDims, spec: DecSpec): { crown: number } {
  const { z, zh, cw, pw, dh } = d
  const { j, c, s, fz, by, ty } = spec
  const px = ty - by
  const P = spec.place
  const push = P
    ? (lx: number, ly: number, zz: number, w = 1): number => {
        const p = P(lx, ly)
        return S.push(p.x, p.y, zz, w)
      }
    : S.push
  const xC = spec.xCrown
  const x1 = spec.b1.x
  const x2 = spec.b2.x
  const cy1 = spec.cy1 ?? S.nodes[spec.b1.back]!.y
  const cy2 = spec.cy2 ?? S.nodes[spec.b2.back]!.y
  const hz1 = (S.nodes[spec.b1.back]!.z >= 0 ? -1 : 1) * z * 1.6
  const hz2 = (S.nodes[spec.b2.back]!.z >= 0 ? -1 : 1) * z * 1.6
  const xa1 = (f: number): number => x1 + (xC - x1) * f // first leg: insertion 1 → crown
  const xa2 = (f: number): number => x2 + (xC - x2) * f // last leg: insertion 2 → crown

  // Down into the FIRST stitch, exactly like a plain stitch's start.
  push(xa1(1) + s * pw, by + px * 0.8, z * fz)
  push(xa1(0.65) + s * pw, by + px * 0.52, z * fz)
  push(xa1(0.33) + s * pw, by + px * 0.26, z * 1.1 * fz)
  push(x1 + s * pw * 0.4, cy1 + dh * 0.5, z * 0.6 * fz)
  const h1 = push(x1, cy1 - dh, hz1)
  S.links.push({ j, c, role: 'hook', hook: h1, below: spec.b1.back })
  push(x1 - s * pw * 0.4, cy1 + dh * 0.5, z * 0.6 * fz)
  // The first pulled-up loop rises toward the shared crown…
  push(xa1(0.33) - s * pw, by + px * 0.26, z * 1.1 * fz)
  push(xa1(0.65) - s * pw, by + px * 0.52, z * fz)
  push(xa1(0.85) - s * pw * 0.6, by + px * 0.72, z * fz)
  // …then the yarn dives straight back down into the SECOND stitch.
  push(xa2(0.55) + s * pw * 0.6, by + px * 0.45, z * 1.05 * fz)
  push(x2 + s * pw * 0.4, cy2 + dh * 0.5, z * 0.6 * fz)
  const h2 = push(x2, cy2 - dh, hz2)
  S.links.push({ j, c, role: 'hook', hook: h2, below: spec.b2.back })
  push(x2 - s * pw * 0.4, cy2 + dh * 0.5, z * 0.6 * fz)
  // Final up-leg to the single gathered crown.
  push(xa2(0.33) - s * pw, by + px * 0.26, z * 1.1 * fz)
  push(xa2(0.65) - s * pw, by + px * 0.52, z * fz)
  push(xa2(1) - s * pw, by + px * 0.8, z * fz)
  push(xC - s * cw, ty - dh * 0.3, zh * fz)
  const crown = push(xC, ty, zh * 1.15 * fz)
  push(xC + s * cw, ty - dh * 0.3, zh * fz)
  return { crown }
}

/**
 * Flat shaped rows: a foundation chain of W0, then rows of ShapeOps (work
 * order). Serpentine + turned exactly like the grid builder; each row's crowns
 * sit on that row's own lattice, centred over the fabric below.
 */
export function buildShaped(
  st: StitchId,
  rowPlans: ShapeOp[][],
  W0: number,
  yarnRadiusMm: number,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const sw = yr * STITCHES[st].gaugeYr
  const dims = stitchDims(yr)
  const { zh, cw, dh } = dims
  const rowH = yr * BASE_ROW_YR * STITCHES[st].heightFactor

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // Foundation chain: pinned proud crowns — the same anchor as the grid builder.
  let below: Crown[] = []
  for (let c = 0; c < W0; c++) {
    push(c * sw - cw, -dh * 0.4, zh, 0)
    const crown = push(c * sw, 0, zh * 1.15, 0)
    push(c * sw + cw, -dh * 0.4, zh, 0)
    below.push({ back: crown, front: crown, x: c * sw })
  }

  let minX = 0
  let maxX = (W0 - 1) * sw

  for (let j = 0; j < rowPlans.length; j++) {
    const ops = rowPlans[j]!
    const consumed = ops.reduce((a, o) => a + consumes(o), 0)
    if (consumed !== below.length)
      throw new Error(
        `shaped row ${j}: ops consume ${consumed} stitches but the row below has ${below.length}`,
      )
    const count = ops.reduce((a, o) => a + (o === 'inc' ? 2 : 1), 0)
    const by = j * rowH
    const ty = (j + 1) * rowH
    const dir = j % 2 === 0 ? -1 : 1 // foundation ends right → first row starts right
    const fz = j % 2 === 0 ? 1 : -1 // TURN the work each row
    // This row's crown lattice, centred over the fabric below, at the row's own
    // even spacing. The fabric takes its REAL width: an inc-per-edge row is a
    // full stitch wider at each end, with the flare stitch leaning outward from
    // the shared base. (An earlier end-clamp to 0.55·sw compressed 0.45·sw per
    // row per edge into the corner — the denied width had nowhere to go and the
    // stacked corner incs buckled forward out of plane, +z growing 0 → 0.95 →
    // 3.1yr up the rows. The corner-hook problem the clamp was aimed at was
    // actually the coincident pair-hook inits — fixed at the source below.)
    const belowCenter = (below[0]!.x + below[below.length - 1]!.x) / 2
    const x0 = belowCenter - ((count - 1) / 2) * sw
    const lattice = Array.from({ length: count }, (_, i) => x0 + i * sw)
    const crowns: (Crown | null)[] = new Array(count).fill(null)
    // Work order: consume below + fill the lattice from whichever end the row starts.
    const belowWork = dir > 0 ? below : below.slice().reverse()
    const latticeAt = (k: number): number => (dir > 0 ? k : count - 1 - k)
    let bi = 0
    let li = 0

    // The turning chain up into EVERY row (ch 1, turn — what a crocheter really
    // does). The grid builder gets away with slack at row 0 only because its
    // reaches are symmetric; a shaped row's first stitch reaches eccentrically
    // (an inc fans sideways, a dec spans two crowns), and without real slack at
    // the turn the corner hook strangles — the audit caught exactly that (scinc
    // j0 c0, scdec row-start decs).
    {
      const xw = lattice[latticeAt(0)]!
      push(xw - dir * cw * 0.8, by + (ty - by) * 0.75, zh * 0.9 * fz)
      push(xw - dir * cw * 0.1, by + (ty - by) * 0.95, zh * 0.4 * fz)
    }

    for (let oi = 0; oi < ops.length; oi++) {
      const op = ops[oi]!
      if (op === 'dec') {
        const b1 = belowWork[bi++]!
        const b2 = belowWork[bi++]!
        const idx = latticeAt(li++)
        const xC = lattice[idx]!
        const r = emitDecrease(S, dims, { j, c: oi, id: st, s: dir, fz, by, ty, xCrown: xC, b1, b2 })
        crowns[idx] = { back: r.crown, front: r.crown, x: xC }
      } else {
        const b = belowWork[bi++]!
        const n = op === 'inc' ? 2 : 1
        // An increase pair works its OVER-THE-BASE stitch first, then the one
        // that fans outward — the real order at a row edge (2 sc in the first
        // st: the first sits above the base, the second flares). Working the
        // overhang first drags the corner hook sideways off the pinned
        // foundation crown (the audit caught it: scinc j0 c0 flipped sides).
        const slots = Array.from({ length: n }, () => latticeAt(li++))
        slots.sort((a, b2) => Math.abs(lattice[a]! - b.x) - Math.abs(lattice[b2]! - b.x))
        for (let t = 0; t < slots.length; t++) {
          const idx = slots[t]!
          const xC = lattice[idx]!
          // An inc pair inserts SIDE BY SIDE under the shared crown — the two
          // hooks must not initialise coincident, or collision splits them in an
          // arbitrary direction (measured at the turn corner: the first hook got
          // expelled UP over the crown instead of under it).
          const hookOff = n === 1 ? 0 : dims.pw * 0.6 * (t === 0 ? 1 : -1) * dir
          const r = emitPlainStitch(S, dims, {
            j,
            c: oi,
            id: st,
            s: dir,
            fz,
            by,
            ty,
            xCrown: xC,
            xHook: b.x + hookOff,
            bcBack: b.back,
            bcFront: b.front,
          })
          crowns[idx] = { back: r.crownBack, front: r.crownFront, x: xC }
        }
      }
    }
    below = crowns as Crown[]
    minX = Math.min(minX, below[0]!.x)
    maxX = Math.max(maxX, below[below.length - 1]!.x)
  }

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: maxX - minX + sw,
    heightMm: rowPlans.length * rowH + rowH,
    anchorPins: 3 * W0,
  }
}

/**
 * Working in the round off a MAGIC RING: a continuous spiral (no join, no
 * turn) of `counts[k]` stitches per round — counts up by 6 per round makes the
 * classic flat amigurumi disc. The magic ring is the anchor: a pre-tightened
 * pinned loop of the same strand (the analog of the pinned foundation chain);
 * round 1's stitches genuinely hook AROUND the ring strand, exactly like
 * hooking a crown — the ring cannot escape the six hooks without yarn passing
 * through yarn.
 */
export function buildRounds(
  st: StitchId,
  counts: number[],
  yarnRadiusMm: number,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const sw = yr * STITCHES[st].gaugeYr
  const dims = stitchDims(yr)
  const { zh } = dims
  const rowH = yr * BASE_ROW_YR * STITCHES[st].heightFactor
  const drift = rowH * 1.05 // radial pitch per round (slight stretch vs a flat row)

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // The magic ring: a drawn-tight loop, pinned (the anchor). Its hole is about a
  // yarn-diameter across once tightened.
  const rr = yr * 1.15
  const RING_N = 18
  const ringNodes: number[] = []
  for (let i = 0; i < RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2
    ringNodes.push(push(Math.cos(a) * rr, Math.sin(a) * rr, zh * 0.5, 0))
  }
  // Every round starts where the ring strand ends, so the working yarn steps
  // straight from the ring into round 1 (no float across the hole) and each
  // round's first stitch sits over the one below (a true continuous spiral).
  const phase = ((RING_N - 1) / RING_N) * Math.PI * 2

  interface RCrown {
    back: number
    front: number
    theta: number
    r: number
  }
  let below: RCrown[] = []
  let rPrev = rr

  for (let k = 0; k < counts.length; k++) {
    const count = counts[k]!
    const rK = rr + drift * (k + 1)
    const rRef = rK
    const place = (lx: number, ly: number): { x: number; y: number } => {
      const th = lx / rRef
      return { x: Math.cos(th) * ly, y: Math.sin(th) * ly }
    }
    const crowns: RCrown[] = []
    if (k === 0) {
      // Round 1: `count` stitches hooked around the ring strand itself.
      for (let i = 0; i < count; i++) {
        const th = phase + ((i + 0.5) / count) * Math.PI * 2
        const ring = ringNodes[Math.round(((th / (Math.PI * 2)) % 1) * RING_N) % RING_N]!
        const xC = th * rRef
        const r = emitPlainStitch(S, dims, {
          j: k,
          c: i,
          id: st,
          s: 1,
          fz: 1, // no turn in the round — every round works the same face
          by: rPrev,
          ty: rK,
          xCrown: xC,
          xHook: xC,
          bcBack: ring,
          bcFront: ring,
          cyBelow: rr,
          place,
        })
        crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, r: rK })
      }
    } else {
      // Round k+1: 6 evenly spaced increase segments — ((k−1) st, inc) × 6.
      if (count !== below.length + 6 || below.length % 6 !== 0)
        throw new Error(`round ${k}: counts must grow by 6 per round (got ${below.length} → ${count})`)
      const per = below.length / 6
      const ops: ShapeOp[] = []
      for (let g = 0; g < 6; g++) {
        for (let t = 0; t < per - 1; t++) ops.push('st')
        ops.push('inc')
      }
      let bi = 0
      let li = 0
      for (let oi = 0; oi < ops.length; oi++) {
        const b = below[bi++]!
        const n = ops[oi] === 'inc' ? 2 : 1
        for (let t = 0; t < n; t++) {
          const th = phase + ((li + 0.5) / count) * Math.PI * 2
          const xC = th * rRef
          // Same side-by-side insertion offset as flat shaping: an inc pair's two
          // hooks must not initialise coincident under the shared crown.
          const hookOff = n === 1 ? 0 : dims.pw * 0.6 * (t === 0 ? 1 : -1)
          const r = emitPlainStitch(S, dims, {
            j: k,
            c: oi,
            id: st,
            s: 1,
            fz: 1,
            by: rPrev,
            ty: rK,
            xCrown: xC,
            xHook: b.theta * rRef + hookOff,
            bcBack: b.back,
            bcFront: b.front,
            cyBelow: b.r,
            place,
          })
          crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, r: rK })
          li++
        }
      }
    }
    below = crowns
    rPrev = rK
  }

  // FASTEN OFF: the tail pulled through the last loop and laid back along the
  // round, tucking behind the fabric — a woven-in end. The strand must not stop
  // dead at the final crown: a dangling end leaves the last stitch
  // half-supported, and the audit caught its inc pair's first hook flipped onto
  // its crown (hz +0.33 vs its twin's healthy −1.30).
  for (let t = 1; t <= 4; t++) {
    const th = phase + Math.PI * 2 * (1 + 0.012 * t)
    const ly = rPrev - rowH * 0.12 * t
    push(Math.cos(th) * ly, Math.sin(th) * ly, yr * (0.3 - 0.25 * t))
  }

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  const rOut = rPrev + rowH
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: rOut * 2,
    heightMm: rOut * 2,
    anchorPins: RING_N,
    frame: 'polar',
  }
}
