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

import { STITCHES, SHELL_N, type StitchId, type ShapeOp } from './dictionary'
import {
  createStrand,
  stitchDims,
  dimsFor,
  HOOK_SPREAD_YR,
  rowPitchYr,
  emitPlainStitch,
  emitHeadLoop,
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

const consumes = (op: ShapeOp): number => (op === 'dec' || op === 'cross' ? 2 : 1) // others consume one below-crown
const produces = (op: ShapeOp): number =>
  op === 'inc' || op === 'cross' ? 2 : op === 'shell' ? SHELL_N : op === 'skip' ? 0 : 1

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
  /**
   * Head-loop half-span in mm (§8f). 0 / absent → the legacy three-node crown
   * BUMP. A decrease throws exactly one head, and it is the same head every
   * other stitch throws, so it gets the same loop from the same emitter.
   */
  headLoopMm?: number
}

export function emitDecrease(S: StrandCtx, d: StitchDims, spec: DecSpec): { crown: number; head: number[] } {
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

  // A decrease is TWO partial posts sharing one head, so it takes the same
  // re-cut anatomy as a plain stitch (§8f rounds 1–2), gated on the same flag:
  // legs that run monotonically in the work direction and taper toward their
  // insertion (a V that splays instead of two parallel bars), and a head that is
  // a real two-strand LOOP instead of a three-node bump. A stitch that passes no
  // head span keeps exactly the legacy excursion.
  const hl = spec.headLoopMm ?? 0
  const recut = hl > 0
  const sd = recut ? -s : s
  const legHalf = (f: number): number => (recut ? pw * (0.06 + 0.94 * f) : pw)
  const legZ = recut ? z * 0.6 : z
  const legZHi = recut ? z * 0.6 : z * 1.1
  const legZMid = recut ? z * 0.6 : z * 1.05
  const nearZ = recut ? z * 0.5 : z * 0.6
  const nearHalf = recut ? 0.12 : 0.4

  // Down into the FIRST stitch, exactly like a plain stitch's start.
  push(xa1(1) + sd * legHalf(1), by + px * 0.8, legZ * fz)
  push(xa1(0.65) + sd * legHalf(0.65), by + px * 0.52, legZ * fz)
  push(xa1(0.33) + sd * legHalf(0.33), by + px * 0.26, legZHi * fz)
  push(x1 + sd * pw * nearHalf, cy1 + dh * 0.5, nearZ * fz)
  const h1 = push(x1, cy1 - dh, hz1)
  S.links.push({ j, c, role: 'hook', hook: h1, below: spec.b1.back })
  push(x1 - sd * pw * nearHalf, cy1 + dh * 0.5, nearZ * fz)
  // The first pulled-up loop rises toward the shared crown…
  push(xa1(0.33) - sd * legHalf(0.33), by + px * 0.26, legZHi * fz)
  push(xa1(0.65) - sd * legHalf(0.65), by + px * 0.52, legZ * fz)
  push(xa1(0.85) - sd * legHalf(0.85) * 0.6, by + px * 0.72, legZ * fz)
  // …then the yarn dives straight back down into the SECOND stitch.
  push(xa2(0.55) + sd * legHalf(0.55) * 0.6, by + px * 0.45, legZMid * fz)
  push(x2 + sd * pw * nearHalf, cy2 + dh * 0.5, nearZ * fz)
  const h2 = push(x2, cy2 - dh, hz2)
  S.links.push({ j, c, role: 'hook', hook: h2, below: spec.b2.back })
  push(x2 - sd * pw * nearHalf, cy2 + dh * 0.5, nearZ * fz)
  // Final up-leg to the single gathered crown.
  push(xa2(0.33) - sd * legHalf(0.33), by + px * 0.26, legZHi * fz)
  push(xa2(0.65) - sd * legHalf(0.65), by + px * 0.52, legZ * fz)
  push(xa2(1) - sd * legHalf(1), by + px * 0.8, legZ * fz)
  if (recut) {
    const h = emitHeadLoop(push, { xC, ty, s, sd, fz, zh, dh, pw, cw, hl })
    const head: number[] = []
    for (let k = h.trailA; k <= h.trailB; k++) head.push(k)
    return { crown: h.crown, head }
  }
  const t0 = push(xC - s * cw, ty - dh * 0.3, zh * fz)
  const crown = push(xC, ty, zh * 1.15 * fz)
  const t1 = push(xC + s * cw, ty - dh * 0.3, zh * fz)
  return { crown, head: [t0, crown, t1] }
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
  /** Per-swatch column-gauge override (yarn radii), leaving the driving stitch's
   *  locked dictionary gauge untouched — packs open shaped fabrics (shell/V) so
   *  their fans touch. */
  gaugeYr?: number,
  /** Per-swatch row-pitch scale (default 1) — packs the rows vertically for a
   *  dense scalloped fabric without changing the stitch's dictionary height. */
  rowScale?: number,
  /** Keep the PRE-CELL lattice for this swatch (§8f-3): the shared `stitchDims`,
   *  `BASE_ROW_YR · heightFactor` row pitch, the three-node crown bump and a bare
   *  post. Only the two FAN swatches use it — see the comment on `cell` below. */
  legacyCell?: boolean,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const sw = yr * (gaugeYr ?? STITCHES[st].gaugeYr)
  // THE REAL CELL (§8f-3). The shaped builder used to keep the legacy shared
  // lattice while the flat grid builder took each stitch's own published gauge,
  // which is why every shaped swatch had to pin an explicit pre-pass `gaugeYr`.
  // It now takes the same cell: the stitch's own row pitch, post half-width,
  // crown half-width and relief budget, its yarn-over collars, and the head as a
  // real two-strand loop (including the decrease's — that was the piece that had
  // to be built before the pins could come off).
  //
  // The two FAN swatches (shell, vstitch) opt out. A fan works several stitches
  // into ONE below-crown, and the corrected cell makes every one of them bigger
  // at a base that is already a traffic jam: probed one variable at a time, a
  // shell on the new cell fails 9/130 interlocks with the collars and the head
  // loop, 4/65 with the collars off, 6/130 with the head loop off — and 0 with
  // both off. There is no gauge/row-pack setting that clears it either: a
  // 5×4 sweep of gauge 1.9–3.4 against row-pack 0.72–1.15 never reached zero for
  // shell and reached it only at scattered points for vstitch, which is the
  // cable lesson (§9) — a magic number is not a fix. Turning a dc's yarn-over
  // off inside a fan would be faking the stitch, so the fans keep the lattice
  // they were calibrated on and stay bit-identical until the crowding at a
  // shared base is solved properly.
  const cell = !legacyCell
  const dims = cell ? dimsFor(yr, st) : stitchDims(yr)
  const { z, zh, cw, dh } = dims
  const headLoopMm = cell ? yr * (STITCHES[st].headLoopYr ?? 0) : 0
  const yarnOvers = cell ? (STITCHES[st].yarnOvers ?? 0) : 0
  const yarnOverMm = yr * (STITCHES[st].yarnOverYr ?? 1)
  const rowH = cell
    ? yr * rowPitchYr(st) * (rowScale ?? 1)
    : yr * BASE_ROW_YR * STITCHES[st].heightFactor * (rowScale ?? 1)

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // Foundation chain: a LOW bumpy cast-on edge near the fabric plane — only the
  // crown apex rides modestly proud (+z), enough for row 0 to dive to its far
  // side; the connectors between crowns tuck back. The grid builder pins its
  // foundation as a full proud forward rail (zh ≈ +0.5yr) which the wide flat
  // fabric hides as a straight bottom edge — but a SHAPED trapezoid fans up from
  // a narrow base, so that same proud rail reads as a heavy forward LIP curling
  // off the point (z-profile: foundation +0.52 vs first row −0.55, a ~1.1yr step).
  // Sitting the foundation near the plane closes the step without moving any
  // locked stitch (this foundation is buildShaped's own).
  // The rendered lip is the pinned foundation riding forward of the fabric — a
  // continuous proud rail (zh ≈ +0.5yr) at the NARROW point of a shaped
  // trapezoid, where the flat grid builder's identical rail is instead hidden as
  // a straight wide bottom edge. Tuck the connectors BETWEEN crowns to the back
  // so the foundation reads as a row of low bumps, not a rail — but leave the two
  // EDGE crowns fully proud (connectors included). The corner stitch off a pinned
  // edge has the least slack, and an increase corner works two hooks into the one
  // corner crown; tucking its connectors strangled that dive (audit j0 c0). The
  // crown APEXES stay proud everywhere so every first-row hook dives cleanly.
  let below: Crown[] = []
  for (let c = 0; c < W0; c++) {
    const edge = c === 0 || c === W0 - 1
    const zc = edge ? zh : -z * 0.15 // edge crowns keep their proud connectors; interior tucks just below the plane (enough to break the proud rail, gentle enough not to dish the whole bottom back)
    push(c * sw - cw, -dh * 0.4, zc, 0)
    const crown = push(c * sw, 0, zh * 1.15, 0)
    push(c * sw + cw, -dh * 0.4, zc, 0)
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
    const count = ops.reduce((a, o) => a + produces(o), 0)
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
      if (op === 'skip') {
        // Pass a below-crown without working it (the space a shell's fan fills).
        bi++
        continue
      }
      if (op === 'shell') {
        // SHELL_N stitches fanned into ONE below-crown — a bigger version of the
        // increase. The N hooks enter the shared base SIDE BY SIDE (never
        // coincident, same lesson as the inc pair) spread across ±0.7·pw; their
        // crowns fan across SHELL_N lattice slots so the fan opens out.
        const b = belowWork[bi++]!
        const n = SHELL_N
        for (let t = 0; t < n; t++) {
          const idx = latticeAt(li++)
          const xC = lattice[idx]!
          const hookOff = ((t - (n - 1) / 2) / (n - 1)) * (yr * HOOK_SPREAD_YR) * 1.4 * dir
          const r = emitPlainStitch(S, dims, {
            j, c: oi, id: st, s: dir, fz, by, ty,
            xCrown: xC, xHook: b.x + hookOff, bcBack: b.back, bcFront: b.front,
            headLoopMm, yarnOvers, yarnOverMm,
          })
          crowns[idx] = { back: r.crownBack, front: r.crownFront, x: xC }
        }
        continue
      }
      if (op === 'cross') {
        // CROSSED PAIR (crossed dc): the crocheter skips a stitch, works into
        // the NEXT (b2), then works into the SKIPPED one (b1) — so the strand's
        // first stitch reaches FORWARD to b2 and the second reaches BACK to b1;
        // crowns land in lattice order and the legs genuinely cross between.
        // The second-worked stitch passes in FRONT of the first (the classic
        // look): give it fuller leg relief and calm the first's, so collision
        // resolves the crossing to a consistent z-order instead of a coin-flip.
        const b1 = belowWork[bi++]!
        const b2 = belowWork[bi++]!
        const reach = [b2, b1] // work order: forward first, then back to the skipped
        const relief = [0.4, 1.75] // DEEPER front/back z-split (was 0.6/1.4): the shallow split let some pairs settle parallel (both posts same z-side → diagonal slants, not an X); a bolder split makes the second post unambiguously cross in FRONT so the X dominates every pair
        for (let t = 0; t < 2; t++) {
          const idx = latticeAt(li++)
          const xC = lattice[idx]!
          const b = reach[t]!
          const r = emitPlainStitch(S, dims, {
            j, c: oi, id: st, s: dir, fz, by, ty,
            xCrown: xC, xHook: b.x, bcBack: b.back, bcFront: b.front,
            legReliefScale: relief[t]!,
            headLoopMm, yarnOvers, yarnOverMm,
          })
          crowns[idx] = { back: r.crownBack, front: r.crownFront, x: xC }
        }
        continue
      }
      if (op === 'dec') {
        const b1 = belowWork[bi++]!
        const b2 = belowWork[bi++]!
        const idx = latticeAt(li++)
        const xC = lattice[idx]!
        const r = emitDecrease(S, dims, { j, c: oi, id: st, s: dir, fz, by, ty, xCrown: xC, b1, b2, headLoopMm })
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
          const hookOff = (n === 1 ? 0 : yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1)) * dir
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
            headLoopMm,
            yarnOvers,
            yarnOverMm,
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
  /**
   * Per-swatch RADIAL pitch override in yarn radii — a disc's one density knob.
   * A disc has no free column gauge (§8f-4): with the counts growing +6 and the
   * radius growing by `drift` per round, the tangential spacing settles at
   * 2π·drift/6 by construction, so the radial pitch sets both. A column-gauge
   * override here would silently do nothing, which is why this is the radial
   * one. Absent → the stitch's own row pitch, which is what a round of fabric is.
   */
  radialPitchYr?: number,
): BuiltContinuous {
  const yr = yarnRadiusMm
  // The real cell (§8f-3) — the same one the flat grid builder takes, including
  // the head as a two-strand LOOP. The canopy below is re-derived from it in the
  // same pass, because the two are one mechanism: the canopy says where a crown
  // sits relative to the crowd under it, and re-cutting the crown without
  // re-cutting the canopy is what broke a disc interlock the first time this was
  // tried (§8f-2).
  const dims = dimsFor(yr, st)
  const { zh } = dims
  const headLoopMm = yr * (STITCHES[st].headLoopYr ?? 0)
  const rowH = yr * rowPitchYr(st)
  // Radial pitch per round = the stitch's own ROW PITCH, because that is what a
  // round of fabric is (§8f-3). Two constraints have to agree on a flat disc and
  // now do: geometry says a +6 round needs circumference 6·sw = 2π·Δr, i.e.
  // Δr ≈ 0.955·sw, and the fabric says Δr is one row pitch. Before the cell they
  // disagreed badly, so drift was tied to the gauge with a 0.9 pack factor and
  // the disc's density was a knob rather than a measurement. With the real cell
  // the disc's own gauge is derived FROM the agreement (sw = rowPitch / 0.955,
  // which is why mrdisc works a touch tighter than flat sc — exactly what a real
  // flat circle needs, or it ruffles), and drift is simply the row pitch.
  const drift = yr * (radialPitchYr ?? rowPitchYr(st))
  // Same-face rounds pile every stitch's leg bulge on ONE face (no turn cancels it),
  // so the surface between the proud crowns reads knotty. Calm the leg bulge; crown
  // height + dive depth (the interlock) are left full, unlike the burned crownLay.
  const ROUND_LEG_RELIEF = 0.7

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // The magic ring: a drawn-tight loop, pinned (the anchor). Its hole is about a
  // yarn-diameter across once tightened — kept SMALL so round 1 closes around a
  // near-invisible centre (the reference disc has a pinprick middle, not an open
  // hole). The 6 round-1 hooks crowd this radius and collision spreads them; the
  // 'ring' link role tolerates that squash (it is held by wrapping, not a z-side).
  const rr = yr * 0.85
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
  // The visible V of every stitch (crown apex + its two trail nodes) is exempt
  // from the crown canopy; everything else stays under it (see YarnModel.zCap).
  // The apex is tracked SEPARATELY so it can ride a touch prouder than its two
  // flanks — a flat floor clamped all three to one plane, which flattened the V
  // and let it rotate in-plane (probe: apexZ 0.97 vs flankZ 0.92, ~0.05yr — no
  // point, so the Vs flopped sideways). A raised apex is a real 3D chevron that
  // reads as an outward-pointing stitch and resists the flop.
  const canopyExempt = new Set<number>() // the head's other strands
  const canopyApex = new Set<number>() // the apex — prouder floor
  // The WHOLE head is exempt, not three nodes round the apex: a re-cut head is a
  // six-node LOOP, and a ceiling cutting across it crushes flat the very
  // paired-loop top the close-range pass exists to produce.
  const exemptCrown = (apex: number, head: number[]): void => {
    for (const nIdx of head) if (nIdx !== apex) canopyExempt.add(nIdx)
    canopyApex.add(apex)
  }

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
          legReliefScale: ROUND_LEG_RELIEF, // calm the same-face leg bulge (§8c round-fabric look pass)
          linkRole: 'ring', // round 1 WRAPS the ring strand (a stem, not a crown)
          headLoopMm,
        })
        exemptCrown(r.crownBack, r.head)
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
          const hookOff = n === 1 ? 0 : yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1)
          const hookDepthScale = n === 2 && t === 1 ? 1.5 : 1 // pair-second tucks deeper (canopy seam fix)
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
            legReliefScale: ROUND_LEG_RELIEF,
            hookDepthScale,
            headLoopMm,
          })
          exemptCrown(r.crownBack, r.head)
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
  // The crown canopy: non-crown nodes stay UNDER the crown line; the crown
  // chain lies ON it (the taut chain-line of a real disc rides on top of the
  // yarn mass and hides the crowded legs beneath — YarnModel.zBand; probed:
  // without the crown floor, hooked-from-below crowns sink into the crowd).
  // Re-derived from the re-cut head (§8f-3), keyed to the crown's own BUILT
  // relief the way the sphere's radial band already was. With a three-node bump
  // for a head the floors sat well ABOVE where the crown was built and had to —
  // a bump has no structure of its own to hold, so the canopy shaped it. A head
  // that is a real six-node LOOP does have structure: it needs the crowd tucked
  // out from under it and nothing else, so the rest of the head takes no bound
  // at all (a single flank floor across a tilted loop flattens the very loop the
  // close-range pass exists to produce), and the apex takes a floor AT its built
  // offset — enough to stop it being dragged down into the crowd by the hooks
  // that link it, never enough to push it out.
  const crownZ = headLoopMm > 0 ? zh * 0.8 : zh * 1.15
  const CANOPY = crownZ * 0.65
  const APEX_LO = crownZ
  const zBand = nodes.map((n, i) =>
    n.w === 0
      ? null
      : canopyApex.has(i)
        ? { lo: APEX_LO }
        : canopyExempt.has(i)
          ? null
          : { hi: CANOPY },
  )
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along, zBand },
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
 * The INTRINSIC surface a rounds-pattern defines: radius per round from its
 * stitch count (circumference = count·gauge, exactly like the disc), height
 * from meridian-pitch continuity (each round sits one row-pitch of FABRIC away
 * from the last — what radius change doesn't use, height does). This is the
 * true geometry of real patterns: a +6 increase cap is intrinsically a flat
 * disc (Δr ≈ the pitch, so Δz ≈ 0), straight rounds are a vertical barrel, and
 * the "ball" look of the canonical pattern comes from stuffing rounding the
 * corner between them. Forcing pattern counts onto a rigid analytic sphere
 * compressed the cap rounds ~20% and left one pair-hook permanently shallow —
 * the pattern must define its own surface. Tube / egg / bowl fall out free.
 */
interface RevProfile {
  /** Profile point + local frame at fabric-meridian coordinate ly. */
  at: (ly: number) => { r: number; z: number; tr: number; tz: number; nr: number; nz: number }
  /** Nominal radius of round k (for the arc-length reference). */
  rOfRound: (k: number) => number
}

function intrinsicProfile(
  counts: number[],
  sw: number,
  rr: number,
  drift: number,
  yr: number,
): RevProfile {
  const rPts: number[] = [rr]
  for (const c of counts) rPts.push(Math.max((c * sw) / (2 * Math.PI), yr * 0.6))
  const zPts: number[] = [0]
  for (let k = 1; k < rPts.length; k++) {
    const dr = rPts[k]! - rPts[k - 1]!
    // The fabric feeds `drift` of meridian per round; radius change uses part,
    // height takes the rest (floored so the surface never goes truly flat-flat
    // — even a disc-like cap descends a whisker, keeping normals well-defined).
    const dz = Math.sqrt(Math.max(drift * drift - dr * dr, (0.25 * drift) ** 2))
    zPts.push(zPts[k - 1]! - dz)
  }
  // SMOOTH the corners (two Chaikin passes, endpoints kept): a piecewise-linear
  // profile creases at cap→barrel corners, and hooks reaching across a crease
  // land displaced from their crowns (audit: "floated above" clusters at
  // EXACTLY both corners). Stuffed fabric physically cannot crease — the
  // smoothing IS the stuffing rounding the corner.
  let P: { r: number; z: number }[] = rPts.map((r, i) => ({ r, z: zPts[i]! }))
  for (let pass = 0; pass < 2; pass++) {
    const Q: { r: number; z: number }[] = [P[0]!]
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i]!
      const b = P[i + 1]!
      Q.push({ r: a.r * 0.75 + b.r * 0.25, z: a.z * 0.75 + b.z * 0.25 })
      Q.push({ r: a.r * 0.25 + b.r * 0.75, z: a.z * 0.25 + b.z * 0.75 })
    }
    Q.push(P[P.length - 1]!)
    P = Q
  }
  // Sit the whole profile above the table.
  const lift = yr * 2 - Math.min(...P.map((p) => p.z))
  for (const p of P) p.z += lift
  // Arclength parameterisation: fabric meridian length maps 1:1 onto the
  // smoothed curve's length, so ly keeps meaning "fabric worked so far".
  const cum: number[] = [0]
  for (let i = 1; i < P.length; i++)
    cum.push(cum[i - 1]! + Math.hypot(P[i]!.r - P[i - 1]!.r, P[i]!.z - P[i - 1]!.z))
  const S_total = cum[cum.length - 1]!
  const L_fabric = counts.length * drift
  const at = (ly: number): { r: number; z: number; tr: number; tz: number; nr: number; nz: number } => {
    const s = ((ly - rr) / L_fabric) * S_total
    // find the segment containing arclength s (linear scan — profiles are tiny)
    let i = 1
    while (i < cum.length - 1 && cum[i]! < s) i++
    const a = P[i - 1]!
    const b = P[i]!
    const segLen = cum[i]! - cum[i - 1]! || 1
    const t = (s - cum[i - 1]!) / segLen
    const r = a.r + (b.r - a.r) * t
    const z = a.z + (b.z - a.z) * t
    const L = Math.hypot(b.r - a.r, b.z - a.z) || 1
    const tr = (b.r - a.r) / L
    const tz = (b.z - a.z) / L
    return { r, z, tr, tz, nr: -tz, nz: tr } // outward normal = tangent rotated +90°
  }
  return { at, rOfRound: (k: number) => rPts[k + 1]! }
}

/**
 * A SPHERE worked in the round — the first 3D surface. The same continuous
 * no-turn spiral as the disc, laid on a ball instead of a plane: rounds are
 * latitude circles, the meridian arclength from the top pole is the fabric's
 * row coordinate, and the stitch relief rides the local surface NORMAL
 * (emitPlainStitch's place3). Counts per round come from the profile
 * (circumference / gauge, evenly distributed incs down to the equator, then
 * mirrored decs — the real amigurumi ball recipe), or from an explicit PATTERN
 * (patternCounts), which then defines its own intrinsic surface (above). The
 * magic ring anchors the top pole; the fasten-off tail spirals into the bottom
 * pole. The relaxer holds each node at its worked latitude along the local
 * meridian tangent (layoutMode 'surface' — the stuffing/blocked-to-shape
 * analog); the model carries per-node meridian tangents for that pull and for
 * the audit's surface-frame link checks.
 */
export function buildSphere(
  st: StitchId,
  equatorCount: number,
  yarnRadiusMm: number,
  /** Explicit stitches-per-round from a PATTERN (program.ts). When given, the
   *  profile radius comes from the widest round and the counts are the
   *  pattern's own; when absent, counts derive from the profile (the canonical
   *  ±6 ball recipe). Either way the audit gates the result. */
  patternCounts?: number[],
  /** Per-swatch stitch-gauge override (yarn radii) — the density knob, same as
   *  buildRounds. Leaves the driving stitch's locked dictionary gauge untouched. */
  gaugeYr?: number,
): BuiltContinuous {
  const yr = yarnRadiusMm
  const sw = yr * (gaugeYr ?? STITCHES[st].gaugeYr)
  // The real cell (§8f-3), with the radial canopy re-derived alongside it — see
  // the same note in buildRounds.
  const dims = dimsFor(yr, st)
  const { zh } = dims
  const headLoopMm = yr * (STITCHES[st].headLoopYr ?? 0)
  const rowH = yr * rowPitchYr(st)
  // Meridian pitch per round stays at the ROW HEIGHT (unlike the flat disc, where
  // drift is radial and must track the width gauge). On a sphere the tangential
  // packing comes from the count derivation (target = 2π·r/sw), which already
  // tightens when the gauge override shrinks sw — so the density knob packs the
  // stitches AROUND each round without over-crowding the meridian (tying drift to
  // sw here floated a round-2 inc hook 1.49yr up-meridian). Unchanged from the
  // locked ball geometry when no override is passed.
  const drift = rowH * 1.05
  const eq = patternCounts ? Math.max(...patternCounts) : equatorCount
  const R = (eq * sw) / (2 * Math.PI)
  const Z0 = R + yr * 1.5 // sphere centre height — the ball rests on the table (floorZ 0)

  ridgeDebugNodes.length = 0
  const S = createStrand()
  const { nodes, push } = S

  // rr defined below is also the intrinsic profile's start — hoist it.
  const rrHoist = yr * 1.15
  const prof = patternCounts ? intrinsicProfile(patternCounts, sw, rrHoist, rowH * 1.05, yr) : null
  // Pattern branch: every node's EXACT local frame, captured at build time in
  // push order (each mkPlace3 closure runs exactly once per placed node — the
  // ring, every stitch, and the fasten-off all place through it). A post-build
  // nearest-segment lookup was tried first and drifted: nodes near segment
  // boundaries got a neighbour's tangent and the layout pull migrated them
  // along the meridian (audit: scattered "floated above its crown" at 1.2–1.4yr).
  const merArr: { tr: number; tz: number }[] = []

  // Surface of revolution: meridian arclength m from the TOP pole. The
  // analytic sphere (derived counts): normal offset is simply a radius change,
  // point = C + (R+lz) * u(m, theta). Pattern counts: the pattern's own
  // intrinsic profile, same (lx, ly, lz) semantics.
  const rOf = (m: number): number => R * Math.sin(m / R)
  const mkPlace3 = (rRef: number) =>
    prof
      ? (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
          const th = lx / rRef
          const q = prof.at(ly)
          merArr.push({ tr: q.tr, tz: q.tz })
          const rp = Math.max(q.r + q.nr * lz, 1e-3)
          return { x: rp * Math.cos(th), y: rp * Math.sin(th), z: q.z + q.nz * lz }
        }
      : (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
          const th = lx / rRef
          const rr2 = (R + lz) * Math.sin(ly / R)
          return {
            x: rr2 * Math.cos(th),
            y: rr2 * Math.sin(th),
            z: Z0 + (R + lz) * Math.cos(ly / R),
          }
        }

  // MAGIC RING at the top pole (the anchor), lying on the surface. For the
  // analytic ball, keep it SMALL so round 1 closes the top pole to a pinprick
  // (the render showed an open hole at the pole); the pattern-driven branch keeps
  // rrHoist as its intrinsic-profile start so program.ts geometry is unchanged.
  const rr = patternCounts ? rrHoist : yr * 0.85
  const RING_N = 18
  const ringNodes: number[] = []
  const ringRRef = prof ? rr : Math.max(rOf(rr), 1e-3)
  const ringPlace = mkPlace3(ringRRef)
  for (let i = 0; i < RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2
    const p = ringPlace(a * ringRRef, rr, zh * 0.5)
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
  // The crown's BUILT normal offset — the dive-side reference the next round
  // works against, and the key the radial canopy is derived from. A re-cut head
  // throws its crown at zh·0.8 (emitHeadLoop), the legacy bump at zh·1.15.
  const crownNz = headLoopMm > 0 ? zh * 0.8 : zh * 1.15
  let below: SCrown[] = []
  let mPrev = rr
  let count = 0

  // Crown canopy (analytic sphere only): the same defect as the disc's — the
  // crowded pole legs erupt as fat loops between the Vs. Track each crown's
  // apex (the `below` target) and its two flanks so the radial band can tuck
  // the crowd under the crown line while the Vs ride proud. See §8c-3D.
  const canopyExempt = new Set<number>() // the head's other strands
  const canopyApex = new Set<number>() // the apex — prouder floor
  // The WHOLE head is exempt, not three nodes round the apex: a re-cut head is a
  // six-node LOOP, and a ceiling cutting across it crushes flat the very
  // paired-loop top the close-range pass exists to produce.
  const exemptCrown = (apex: number, head: number[]): void => {
    for (const nIdx of head) if (nIdx !== apex) canopyExempt.add(nIdx)
    canopyApex.add(apex)
  }

  // Round meridians: step down the sphere until just short of the bottom pole
  // (or exactly one per pattern round when the counts come from a pattern).
  const mMax = Math.PI * R - rr
  const rounds: number[] = []
  if (patternCounts) {
    // Clamp inside the pole so an over-tall pattern crowds (and fails the
    // audit) rather than folding through the apex.
    // The intrinsic profile handles any pattern length — no pole clamp needed.
    for (let k = 0; k < patternCounts.length; k++) rounds.push(rr + drift * (k + 1))
  } else {
    for (let m = rr + drift; m <= mMax - drift * 0.35; m += drift) rounds.push(m)
  }

  for (let k = 0; k < rounds.length; k++) {
    const mK = rounds[k]!
    const prev = count
    if (patternCounts) {
      count = patternCounts[k]!
    } else {
      const target = Math.max(4, Math.round((2 * Math.PI * rOf(mK)) / sw))
      // The canonical ball recipe: 6 in the ring, then AT MOST ±6 per round
      // toward the profile's target. Profile-hugging counts put 7 incs in a
      // 12-stitch round (shaping density no real pattern uses) and the crowded
      // cap kept one pair-hook ambiguous; ±6 growth is both the craft standard
      // and what the pole can physically fit.
      count = prev === 0 ? Math.min(6, target) : prev + Math.max(-6, Math.min(6, target - prev))
    }
    const rRef = prof ? Math.max(prof.rOfRound(k), 1e-3) : Math.max(rOf(mK), 1e-3)
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
          headLoopMm,
        })
        exemptCrown(r.crownBack, r.head)
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
            headLoopMm,
          })
          exemptCrown(r.crown, r.head)
          crowns.push({ back: r.crown, front: r.crown, theta: th, m: mK, nz: crownNz })
          li++
        } else {
          const b = below[bi++]!
          const n = op === 'inc' ? 2 : 1
          for (let t = 0; t < n; t++) {
            const th = phase + ((li + 0.5) / count) * Math.PI * 2
            const xC = th * rRef
            const hookOff = n === 1 ? 0 : yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1)
            const hookDepthScale = n === 2 && t === 1 ? 1.5 : 1 // pair-second tucks deeper (canopy seam fix)
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
              hookDepthScale,
              headLoopMm,
            })
            exemptCrown(r.crownBack, r.head)
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
  const rRefEnd = prof ? Math.max(prof.at(mPrev).r, 1e-3) : Math.max(rOf(mPrev), 1e-3)
  const placeEnd = mkPlace3(rRefEnd)
  for (let t = 1; t <= 4; t++) {
    const th = phase + Math.PI * 2 * (1 + 0.012 * t)
    const m = Math.min(mPrev + drift * 0.22 * t, Math.PI * R - yr * 0.4)
    const p = placeEnd(th * rRefEnd, m, yr * (0.3 - 0.25 * t))
    push(p.x, p.y, p.z)
  }

  // Per-node meridian tangents at INIT: the analytic sphere's from its centre;
  // the intrinsic profile's captured EXACTLY per node at build time (merArr).
  if (prof && merArr.length !== nodes.length)
    throw new Error(`intrinsic profile frame capture out of sync: ${merArr.length} frames for ${nodes.length} nodes`)
  const meridian = prof
    ? merArr
    : nodes.map((n) => {
        const rc = Math.hypot(n.x, n.y)
        const dzc = n.z - Z0
        const L = Math.hypot(rc, dzc) || 1
        return { tr: dzc / L, tz: -rc / L }
      })

  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  const halfSpan = prof
    ? Math.max(...(patternCounts ?? [eq]).map((c) => (c * sw) / (2 * Math.PI))) + yr * 3
    : R + yr * 3

  // The crown canopy on the analytic sphere: distance-from-centre bounds (the
  // radial analog of the disc's z-canopy). Non-crown nodes tuck UNDER the crown
  // line (a ceiling at R + zh·0.65 off the surface — the crowded pole legs
  // resolve INWARD, toward the stuffing, not out between the Vs); flanks ride
  // proud, the apex a touch prouder, so each pole stitch reads as a 3D chevron
  // instead of a fat loop. Bounds stay WITHIN the crown's built normal relief
  // (crownNz = zh·1.15) so the pole is not pushed off-surface — the ballooning
  // failure the soft normal pull was added to prevent. Intrinsic-profile balls
  // (patternCounts) are not metric spheres, so they keep the plain surface pull.
  // Bounds are keyed to the crown's built normal relief (crownNz = zh·1.15): the
  // ceiling tucks the crowd well under it, the floors sit AT OR BELOW the built
  // crown offsets so they only stop a crown sinking into the crowd — they never
  // push it further out (over-lifting the pole is the ballooning failure).
  const radialCenter = { x: 0, y: 0, z: Z0 }
  // Ceiling at 0.65·crownNz off the surface: the strongest crowd tuck that still
  // audits clean (0.6 is the edge; 0.55 and below drop an interlock). Floors sit
  // at/below the built crown offsets so they only stop a crown sinking into the
  // crowd, never push it out (the pole-ballooning failure).
  const CANOPY = R + crownNz * 0.65 // ceiling: crowd resolves inward under this
  const APEX_LO = R + crownNz // apex built at crownNz — a floor AT it, no push
  // The rest of the head keeps a floor here where the flat disc needs none
  // (§8f-4): a disc's crowd resolves DOWN into the table, a sphere's pole has
  // nowhere to go but out between the Vs, and with the head unbounded one
  // bottom-pole hook slipped 3.12yr sideways off its crown. Set at the head
  // loop's own LOWEST built offset (zh·0.2 = crownNz·0.25) so it stops a head
  // strand sinking without pushing any of them out — probed as a real basin,
  // not a knife edge: 0.2 through 0.72 of crownNz all audit clean, only an
  // unbounded head fails.
  const FLANK_LO = R + crownNz * 0.25
  const radialBand = prof
    ? undefined
    : nodes.map((n, i) =>
        n.w === 0
          ? null
          : canopyApex.has(i)
            ? { lo: APEX_LO }
            : canopyExempt.has(i)
              ? { lo: FLANK_LO }
              : { hi: CANOPY },
      )

  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand, along, meridian, radialBand, radialCenter },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: halfSpan * 2,
    heightMm: halfSpan * 2,
    anchorPins: RING_N,
    frame: 'surface',
  }
}
