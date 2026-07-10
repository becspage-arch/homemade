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
  /** Curved surfaces: full 3D frame + the two below crowns' local normal offsets (see emitPlainStitch). */
  place3?: (lx: number, ly: number, lz: number) => { x: number; y: number; z: number }
  bn1?: number
  bn2?: number
}

export function emitDecrease(S: StrandCtx, d: StitchDims, spec: DecSpec): { crown: number } {
  const { z, zh, cw, pw, dh } = d
  const { j, c, s, fz, by, ty } = spec
  const px = ty - by
  const P = spec.place
  const P3 = spec.place3
  const push = P3
    ? (lx: number, ly: number, lz: number, w = 1): number => {
        const p = P3(lx, ly, lz)
        return S.push(p.x, p.y, p.z, w)
      }
    : P
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
  const bn1 = spec.bn1 ?? S.nodes[spec.b1.back]!.z
  const bn2 = spec.bn2 ?? S.nodes[spec.b2.back]!.z
  const hz1 = (bn1 >= 0 ? -1 : 1) * z * 1.6
  const hz2 = (bn2 >= 0 ? -1 : 1) * z * 1.6
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

  // FASTEN OFF (same lesson as rounds): weave the tail back along the last row.
  // A dangling strand end leaves the final stitch half-supported — the scdec
  // render showed it sagging into a frayed lump at the bottom corner.
  const jL = rowPlans.length - 1
  const dirL = jL % 2 === 0 ? -1 : 1
  const xEnd = below[dirL > 0 ? below.length - 1 : 0]!.x
  for (let t = 1; t <= 4; t++) {
    push(xEnd - dirL * sw * 0.35 * t, (jL + 1) * rowH - rowH * 0.25, yr * (0.3 - 0.22 * t))
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
          linkRole: 'ring', // round 1 WRAPS the ring strand (a stem, not a crown)
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

/**
 * Even distribution of increases/decreases around a round — real ball-pattern
 * math: from `prev` stitches to `next`, spread the incs (or decs) evenly so the
 * shaping never stacks into a seam.
 */
export function roundOps(prev: number, next: number, stagger = 0): ShapeOp[] {
  // `stagger` (0 or 0.5) shifts the shaping positions by half a segment — real
  // patterns alternate it round to round so incs/decs never stack into columns
  // (stacked shaping bulges, and a stacked inc pair loses the fight for space
  // under its shared crown: the ball's one residual audit fail sat exactly on
  // an inc column).
  if (next >= prev) {
    const inc = next - prev
    if (inc > prev) throw new Error(`round cannot more than double (${prev} -> ${next})`)
    const ops: ShapeOp[] = Array(prev).fill('st') as ShapeOp[]
    for (let t = 0; t < inc; t++) ops[Math.floor(((t + 0.5 + stagger) * prev) / inc) % prev] = 'inc'
    return ops
  }
  const dec = prev - next
  if (dec > next) throw new Error(`round cannot less than halve (${prev} -> ${next})`)
  const ops: ShapeOp[] = Array(next).fill('st') as ShapeOp[]
  for (let t = 0; t < dec; t++) ops[Math.floor(((t + 0.5 + stagger) * next) / dec) % next] = 'dec'
  return ops
}

/**
 * A SPHERE worked in the round — the first 3D surface. The same continuous
 * no-turn spiral as the disc, laid on a ball instead of a plane: rounds are
 * latitude circles, the meridian arclength from the top pole is the fabric's
 * row coordinate, and the stitch relief rides the local surface NORMAL
 * (emitPlainStitch's place3). Counts per round come from the profile
 * (circumference / gauge, evenly distributed incs down to the equator, then
 * mirrored decs — the real amigurumi ball recipe). The magic ring anchors the
 * top pole; the fasten-off tail spirals into the bottom pole. The relaxer
 * holds each node at its worked latitude along the local meridian tangent
 * (layoutMode 'surface' — the stuffing/blocked-to-shape analog); the model
 * carries per-node meridian tangents for that pull and for the audit's
 * surface-frame link checks.
 */
export function buildSphere(
  st: StitchId,
  equatorCount: number,
  yarnRadiusMm: number,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const sw = yr * STITCHES[st].gaugeYr
  const dims = stitchDims(yr)
  const { zh } = dims
  const rowH = yr * BASE_ROW_YR * STITCHES[st].heightFactor
  const drift = rowH * 1.05
  const R = (equatorCount * sw) / (2 * Math.PI)
  const Z0 = R + yr * 1.5 // sphere centre height — the ball rests on the table (floorZ 0)

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // Surface of revolution: meridian arclength m from the TOP pole. A sphere's
  // normal offset is simply a radius change: point = C + (R+lz) * u(m, theta).
  const rOf = (m: number): number => R * Math.sin(m / R)
  const mkPlace3 =
    (rRef: number) =>
    (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
      const th = lx / rRef
      const rr2 = (R + lz) * Math.sin(ly / R)
      return {
        x: rr2 * Math.cos(th),
        y: rr2 * Math.sin(th),
        z: Z0 + (R + lz) * Math.cos(ly / R),
      }
    }

  // MAGIC RING at the top pole (the anchor), lying on the surface.
  const rr = yr * 1.15
  const RING_N = 18
  const ringNodes: number[] = []
  const ringPlace = mkPlace3(Math.max(rOf(rr), 1e-3))
  for (let i = 0; i < RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2
    const p = ringPlace(a * Math.max(rOf(rr), 1e-3), rr, zh * 0.5)
    push(p.x, p.y, p.z, 0)
    ringNodes.push(nodes.length - 1)
  }
  const phase = ((RING_N - 1) / RING_N) * Math.PI * 2

  interface SCrown {
    back: number
    front: number
    theta: number
    m: number
    nz: number // the crown's local normal offset (for the next round's dive side)
  }
  const crownNz = zh * 1.15
  let below: SCrown[] = []
  let mPrev = rr
  let count = 0

  // Round meridians: step down the sphere until just short of the bottom pole.
  const mMax = Math.PI * R - rr
  const rounds: number[] = []
  for (let m = rr + drift; m <= mMax - drift * 0.35; m += drift) rounds.push(m)

  for (let k = 0; k < rounds.length; k++) {
    const mK = rounds[k]!
    const prev = count
    const target = Math.max(4, Math.round((2 * Math.PI * rOf(mK)) / sw))
    // The canonical ball recipe: 6 in the ring, then AT MOST ±6 per round
    // toward the profile's target. Profile-hugging counts put 7 incs in a
    // 12-stitch round (shaping density no real pattern uses) and the crowded
    // cap kept one pair-hook ambiguous; ±6 growth is both the craft standard
    // and what the pole can physically fit.
    count = prev === 0 ? Math.min(6, target) : prev + Math.max(-6, Math.min(6, target - prev))
    const rRef = Math.max(rOf(mK), 1e-3)
    const place3 = mkPlace3(rRef)
    const crowns: SCrown[] = []

    if (k === 0) {
      // Round 1: hooked around the ring strand itself. The emitter aims the
      // dive at cyBelow − dh, which on the flat disc puts six hooks on a
      // 0.6yr-radius circle — they crowd (spacing ≪ the collision diameter)
      // and on the disc they escape RADIALLY, staying under the flat fabric.
      // On the DOME the escape direction is up-and-over the ring ("outward" at
      // a pole is up) — the audit measured hooks 1.2–2.0yr OUTSIDE the ring.
      // Real magic-ring wraps sit AT the ring radius (the hole is filled, the
      // yarn squashes) and pass under in the NORMAL direction, so aim the dive
      // there instead of further inside.
      const cyEff = rr * 0.95 + dims.dh
      for (let i = 0; i < count; i++) {
        const th = phase + ((i + 0.5) / count) * Math.PI * 2
        const ring = ringNodes[Math.round(((th / (Math.PI * 2)) % 1) * RING_N) % RING_N]!
        const xC = th * rRef
        const r = emitPlainStitch(S, dims, {
          j: k,
          c: i,
          id: st,
          s: 1,
          fz: 1,
          by: mPrev,
          ty: mK,
          xCrown: xC,
          xHook: xC,
          bcBack: ring,
          bcFront: ring,
          cyBelow: cyEff,
          bcNormalZ: zh * 0.5,
          place3,
          linkRole: 'ring', // round 1 WRAPS the ring strand (a stem, not a crown)
        })
        crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, m: mK, nz: crownNz })
      }
    } else {
      const ops = roundOps(prev, count, (k % 2) * 0.5)
      let bi = 0
      let li = 0
      for (let oi = 0; oi < ops.length; oi++) {
        const op = ops[oi]!
        if (op === 'dec') {
          const b1 = below[bi++]!
          const b2 = below[bi++]!
          const th = phase + ((li + 0.5) / count) * Math.PI * 2
          const xC = th * rRef
          const r = emitDecrease(S, dims, {
            j: k,
            c: oi,
            id: st,
            s: 1,
            fz: 1,
            by: mPrev,
            ty: mK,
            xCrown: xC,
            b1: { back: b1.back, front: b1.front, x: b1.theta * rRef },
            b2: { back: b2.back, front: b2.front, x: b2.theta * rRef },
            cy1: b1.m,
            cy2: b2.m,
            bn1: b1.nz,
            bn2: b2.nz,
            place3,
          })
          crowns.push({ back: r.crown, front: r.crown, theta: th, m: mK, nz: crownNz })
          li++
        } else {
          const b = below[bi++]!
          const n = op === 'inc' ? 2 : 1
          for (let t = 0; t < n; t++) {
            const th = phase + ((li + 0.5) / count) * Math.PI * 2
            const xC = th * rRef
            const hookOff = n === 1 ? 0 : dims.pw * 0.6 * (t === 0 ? 1 : -1)
            const r = emitPlainStitch(S, dims, {
              j: k,
              c: oi,
              id: st,
              s: 1,
              fz: 1,
              by: mPrev,
              ty: mK,
              xCrown: xC,
              xHook: b.theta * rRef + hookOff,
              bcBack: b.back,
              bcFront: b.front,
              cyBelow: b.m,
              bcNormalZ: b.nz,
              place3,
            })
            crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, m: mK, nz: crownNz })
            li++
          }
        }
      }
    }
    below = crowns
    mPrev = mK
  }

  // FASTEN OFF into the bottom pole: the tail spirals in through the last
  // round's remaining hole and is drawn tight — same lesson as the disc: the
  // strand must not stop dead at the final crown.
  const rRefEnd = Math.max(rOf(mPrev), 1e-3)
  const placeEnd = mkPlace3(rRefEnd)
  for (let t = 1; t <= 4; t++) {
    const th = phase + Math.PI * 2 * (1 + 0.012 * t)
    const m = Math.min(mPrev + drift * 0.22 * t, Math.PI * R - yr * 0.4)
    const p = placeEnd(th * rRefEnd, m, yr * (0.3 - 0.25 * t))
    push(p.x, p.y, p.z)
  }

  // Per-node meridian tangents (from the sphere's own geometry, at INIT).
  const meridian = nodes.map((n) => {
    const rc = Math.hypot(n.x, n.y)
    const dzc = n.z - Z0
    const L = Math.hypot(rc, dzc) || 1
    return { tr: dzc / L, tz: -rc / L }
  })

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along, meridian },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: (R + yr * 3) * 2,
    heightMm: (R + yr * 3) * 2,
    anchorPins: RING_N,
    frame: 'surface',
  }
}
