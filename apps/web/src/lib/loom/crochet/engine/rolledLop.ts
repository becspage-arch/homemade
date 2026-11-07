/**
 * THE ROLLED-EDGE LOP EAR (ears-1107): a general long hanging ear with a
 * plump rolled rim round a recessed lining, sewn on by its pinched base. For
 * any lop-eared toy: a bunny, a lop dog, a made-up creature (CUTE-RULES 21:
 * the bar bunny's lops are "rolled outer edges around the lining", about
 * 2.5 thickest to thinnest rim as seen; the flat pressed lop reads 1.0).
 *
 * The construction is the long oval cup a maker works for a lined lop:
 *
 *   Ch N (the ear's length). Round 1 round both sides of the chain, then
 *   increase rounds flat at the two ends (3 a end a round: the flat floor of
 *   the ear, worked in the LINING colour), then rounds worked even in the
 *   main colour (the wall), the last of them FOLDED back over the outside of
 *   the wall into a thick rolled lip all round (chainOval.ts `rimFold`, the
 *   tube's fold brim on an oval). Optionally one more PART ROUND over the
 *   outer side of the ear (`outerRoll`), folded with the rim, so the roll is
 *   two rounds deep down that edge and one round elsewhere (the cup ear's
 *   top roll, pinchEar.ts, on an oval). The base (the slip-knot end of the
 *   chain) is PINCHED until the two sides of the rim meet, held with two
 *   small stitches, and the ear is sewn to the head by that pinch alone, so
 *   it hangs with its lined hollow facing forward and the rolled rim free.
 *
 * Construction honesty: every stitch is chainOval's (a pinned foundation
 * chain, one strand, the locked emitters); the fold is the profile the
 * counts lay; the pinch is the relax's one-sided V plates (relax.ts
 * `pinch`, the cup ear's), never a pin. The audit runs on the settled piece
 * in its own per-node frame (`auditChainOvalSettled`); the pose that turns it
 * to hang from its pinch is rigid.
 *
 * Posed frame (what a placement sees, pinchEar's): the pinch at the origin
 * end, the ear hanging along local +z (the placement's `aim`), the hollow
 * facing local +x (the placement's `spin`). Opt-in: nothing imports this
 * unless a preset's switch is on.
 */

import { STITCHES } from './dictionary'
import { rowPitchYr, type BuiltContinuous } from './yarnPath'
import { relax } from './relax'
import { auditChainOvalSettled, buildChainOval, chainOvalPlan, chainOvalWords, type ChainOvalOptions } from './chainOval'
import type { AmigurumiPart, PartPlacement } from './composition'

export interface RolledLopOptions {
  /** The foundation chain, ch N: the ear's straight length (6-60). */
  chain: number
  /** Increase rounds after round 1, flat (3 at each end): the ear's floor
   *  and its width (1-6). */
  rounds: number
  /** Rounds worked even under the fold: the wall's depth (1-3, default 2:
   *  measured on the bunny M, one wall round leaves a hollow too shallow to
   *  read from the front (rule 21 10-14, a sliver of opening), two read
   *  2.5, three fail the audit). */
  wall?: number
  /** Rounds folded back into the rolled rim (1-2, default 1). */
  rim?: 1 | 2
  /** A part round over the ear's outer long side, folded with the rim, so
   *  the roll is a round deeper there (default true). `side` +1 is the side
   *  the round works first (side A), -1 the other: a pair of ears takes one
   *  of each so both thick rolls are on the outer edges. */
  outerRoll?: boolean | { side?: 1 | -1 }
  /** How far the base is pinched, 0.3..1 (default 1, the two sides of the
   *  rim meet). */
  pinch?: number
  /** A contrast lining (hex): round 1 and the increase rounds (the floor). */
  liningHex?: string
}

/** Measured (ears-1107): the part round's end must stay clear of the pinch's
 *  V, `ceil(count / 6)` sts (pinchEar.ts `topRollGapSts`) on a round cup;
 *  the oval's part round ends on the outer side short of the base fan by
 *  this many stitches. */
const OUTER_ROLL_CLEAR_STS = (count: number): number => Math.ceil(count / 6)

function validate(o: RolledLopOptions): void {
  if (!Number.isInteger(o.chain) || o.chain < 6 || o.chain > 60) throw new Error(`rolled lop: the chain is 6-60 ch (got ${o.chain})`)
  if (!Number.isInteger(o.rounds) || o.rounds < 1 || o.rounds > 6) throw new Error(`rolled lop: 1-6 flat increase rounds (got ${o.rounds})`)
  const w = o.wall ?? 2
  if (!Number.isInteger(w) || w < 1 || w > 3) throw new Error(`rolled lop: the wall is 1-3 even rounds (got ${w})`)
  const r = o.rim ?? 1
  if (r !== 1 && r !== 2) throw new Error(`rolled lop: the rim is 1 or 2 folded rounds (got ${r})`)
  const p = o.pinch ?? 1
  if (p < 0.3 || p > 1) throw new Error(`rolled lop: the pinch is 0.3..1 (got ${p})`)
}

const outerSide = (o: RolledLopOptions): 1 | -1 | 0 => (o.outerRoll === false ? 0 : typeof o.outerRoll === 'object' ? (o.outerRoll.side ?? 1) : 1)

/** The part round's stitches (0 = none): from the round's start (the middle
 *  of the tip's fan, the hook end of the chain) along side A, stopping
 *  clear of the base fan. Side -1 is the same count turned and worked back
 *  over the tip's other half and side B (a part row). */
export function outerRollStitches(o: RolledLopOptions): number {
  if (!outerSide(o)) return 0
  const plan = chainOvalPlan(baseOval(o))
  const last = plan[plan.length - 1]!
  // Side +1: the tip fan's leading half and side A, short of the base fan.
  const A = last.side.filter((s) => s === 'A').length
  return Math.max(2, last.head + A - OUTER_ROLL_CLEAR_STS(last.count))
}

/** The oval without the part round. */
function baseOval(o: RolledLopOptions): ChainOvalOptions {
  validate(o)
  const rim = o.rim ?? 1
  return { kind: 'stuffed', chain: o.chain, rounds: o.rounds, endInc: 3, even: (o.wall ?? 2) + rim, rimFold: rim }
}

/** The chain-oval options the ear is built from (the part round, when there
 *  is one, is one more even round worked over its stitches only). */
export function rolledLopOval(o: RolledLopOptions): ChainOvalOptions {
  const b = baseOval(o)
  const n = outerRollStitches(o)
  if (!n) return b
  return { ...b, even: b.even! + 1, rimFold: b.rimFold! + 1, partialLast: n }
}

/** The ear's stitch counts per round (the part round at its full count, as
 *  a part round's line is counted in `rolledLopWords`). */
export function rolledLopRounds(o: RolledLopOptions): number[] {
  return chainOvalPlan(rolledLopOval(o)).map((r) => r.count)
}

/** The ear's words (UK): the oval, the lining change, the part round, the
 *  fold, the pinch and the sewing by it. */
export function rolledLopWords(o: RolledLopOptions): string[] {
  const ov = rolledLopOval(o)
  const lines = chainOvalWords(ov, 'ear').slice(0, -1)
  const n = outerRollStitches(o)
  const side = outerSide(o)
  const rim = o.rim ?? 1
  const out: string[] = []
  const liningUpTo = o.rounds + 1 // round 1 and the increase rounds
  if (o.liningHex) out.push('Start with the lining yarn.')
  for (const l of lines) {
    const m = /^Round (\d+):/.exec(l)
    if (m && o.liningHex && Number(m[1]) === liningUpTo + 1) out.push('Change to the main yarn.')
    if (m && n && Number(m[1]) === ov.rounds + 1 + ov.even!) {
      // The part round: worked over the outer side only.
      out.push(side > 0
        ? `Round ${m[1]} (part round, down the outer side of the ear): dc in next ${n} sts only, leaving the rest of the round unworked; sl st in next st. (${n} sts)`
        : `Round ${m[1]} (part row, down the outer side of the ear): turn, ch 1, and working back along the round you just made, dc in next ${n} sts only, leaving the rest unworked; sl st in next st. (${n} sts)`)
      continue
    }
    out.push(l)
  }
  out.push(
    'Do not stuff and do not close the ear: fasten off leaving a long tail for sewing, so the rim stays open.',
    `Fold the last ${rim + (n ? 1 : 0) === 1 ? 'round' : `${rim + (n ? 1 : 0)} rounds`} back over the outside of the ear, so the rim rolls outward into a thick lip all round${n ? ', a round deeper down the outer side where the part round is' : ''}.`,
    `Sew the base of the rim together where you pinch it: at the starting end of the chain (the slip knot end), fold the ear so the two sides of the rim${(o.pinch ?? 1) >= 0.7 ? ' meet' : ' come close'}, and take 2 small stitches through both layers with the tail to hold the pinch.`,
    `Sew the ear to the head by the pinch only, so it hangs with the ${o.liningHex ? 'lined ' : ''}hollow facing forward and the rolled rim free all round.`,
  )
  return out
}

/** The oval's frame (chain along x, ch 1 at -x, the hollow opening to -z)
 *  turned so the base (ch 1's end) is at -y and the ear runs along +y: the
 *  cup ear's frame (pinchEar.ts), where the relax's pinch plates sit. */
const toCupFrame = (p: { x: number; y: number; z: number }): { x: number; y: number; z: number } => ({ x: -p.y, y: p.x, z: p.z })
/** The cup frame to the posed frame (pinch at min z, hanging +z, hollow +x). */
const pose = (p: { x: number; y: number; z: number }): { x: number; y: number; z: number } => ({ x: -p.z, y: -p.x, z: p.y })

export interface RolledLopBuild {
  built: BuiltContinuous
  problems: string[]
  /** The pinch (posed frame, mm): the point sewn to the head. */
  seat: { x: number; y: number; z: number }
  /** Posed extents (mm): length (z), width (y), and the hollow's depth (the
   *  rim's front plane to the floor's middle, before the pose). */
  lengthMm: number
  widthMm: number
  hollowMm: number
}

/** Build, relax (with the pinch), audit and pose one ear. */
export function buildRolledLop(o: RolledLopOptions, yr: number, side: 1 | -1 = 1): RolledLopBuild {
  const ov = rolledLopOval(o)
  const built = buildChainOval(ov, yr)
  const nodes = built.model.nodes
  // Side -1: the part row is turned and worked back down side B (the
  // words). The build has no turned row, so it lays that ear as the mirror
  // image across its length of the side +1 ear: the same stitches, the
  // spiral running the other way (an approximation the audit cannot tell
  // from the turned row; noted in ears-1107.md).
  const mirror = side < 0 && outerRollStitches(o) > 0
  const turn = (p: { x: number; y: number; z: number }) => { const q = toCupFrame(p); return mirror ? { x: -q.x, y: q.y, z: q.z } : q }
  for (const nd of nodes) { const q = turn(nd); nd.x = q.x; nd.y = q.y; nd.z = q.z }
  const f3 = built.model.frame3
  if (f3) for (const f of f3) { f.m = turn(f.m); f.n = turn(f.n) }
  // The foundation chain is free in the relax: it is the chain's own yarn,
  // not a ring held on a finger, and a pinned chain running into the pinch
  // holds the floor flat while the pinch folds it (round 1 then slid off the
  // chain's loops, measured: 5 of 224 at ch 24, 35 at ch 40).
  for (let i = 0; i < (built.anchorPins ?? 0); i++) nodes[i]!.w = 1
  const pinch = o.pinch ?? 1
  relax(built.model, {
    collMinDist: yr * 1.25, collK: 0.28, collAdjacency: 9, planeZ: 0, planeK: 0,
    layoutK: 0.06, layoutMode: 'surface',
    pinch: { halfAngleDeg: 90 - 40 * pinch, gap: 4 * yr },
    iterations: 560,
  })
  const problems = auditChainOvalSettled(built, yr)
  const body = nodes.slice(built.anchorPins ?? 0)
  // The hollow: the rim's lowest z (the opening, -z) to the floor's middle.
  let z0 = Infinity, y0 = Infinity, y1 = -Infinity
  for (const n of body) { z0 = Math.min(z0, n.z); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y) }
  const ym = (y0 + y1) / 2
  let floor = -Infinity
  for (const n of body) if (Math.abs(n.y - ym) < (y1 - y0) * 0.1 && Math.abs(n.x) < yr * 3) floor = Math.max(floor, n.z)
  const hollowMm = Number.isFinite(floor) ? floor - z0 : 0
  // The pinch: the lowest-y band (the base, where the plates drew the sides together).
  const band = body.filter((n) => n.y <= y0 + (y1 - y0) * 0.05)
  const m = band.reduce((a, n) => ({ x: a.x + n.x / band.length, y: a.y + n.y / band.length, z: a.z + n.z / band.length }), { x: 0, y: 0, z: 0 })
  for (const n of nodes) { const q = pose(n); n.x = q.x; n.y = q.y; n.z = q.z }
  if (f3) for (const f of f3) { f.m = pose(f.m); f.n = pose(f.n) }
  const seat = pose(m)
  let zMax = -Infinity, ylo = Infinity, yhi = -Infinity
  for (const n of body) { zMax = Math.max(zMax, n.z); ylo = Math.min(ylo, n.y); yhi = Math.max(yhi, n.y) }
  return { built, problems, seat, lengthMm: zMax - seat.z, widthMm: yhi - ylo, hollowMm }
}

/** The ear's flat size from its counts (mm): length along the chain and
 *  width across, the wall and the roll included. */
export function rolledLopSizeMm(o: RolledLopOptions, yr: number): { lengthMm: number; widthMm: number } {
  const sw = yr * STITCHES.sc.gaugeYr
  const drift = yr * rowPitchYr('sc')
  const c = ((o.chain - 2) * 0.9 * sw) / 2
  const plan = chainOvalPlan(baseOval(o))
  const floor = plan[o.rounds]!.count
  const rho = (floor * sw - 4 * c) / (2 * Math.PI)
  const out = rho + yr * 2.8 + drift * 0.5
  return { lengthMm: 2 * (c + out), widthMm: 2 * out }
}

/** Designing the ear from the size wanted (mm), the way a designer picks the
 *  chain and the rounds. */
export function designRolledLop(want: { lengthMm: number; widthMm: number; liningHex?: string }, yr: number): RolledLopOptions {
  let best: RolledLopOptions | undefined
  let bestCost = Infinity
  for (let rounds = 1; rounds <= 6; rounds++) for (let chain = 6; chain <= 60; chain++) {
    const o: RolledLopOptions = { chain, rounds, ...(want.liningHex ? { liningHex: want.liningHex } : {}) }
    const s = rolledLopSizeMm(o, yr)
    const cost = ((s.lengthMm - want.lengthMm) / want.lengthMm) ** 2 + 2 * ((s.widthMm - want.widthMm) / want.widthMm) ** 2
    if (cost < bestCost) { bestCost = cost; best = o }
  }
  return best!
}

/**
 * One rolled lop as a composition part. Place it with `dir` on the head,
 * `aim` the way it hangs, `spin` the way its hollow faces, `poleIn` false;
 * the pinch is seated on the join (CustomPiece.seat). `side` -1 builds the
 * mirror ear (the part round down the other long edge).
 */
export function rolledLopPart(
  o: RolledLopOptions,
  base: { name: string; colourHex: string; place: PartPlacement; sewNote?: string; side?: 1 | -1 },
): AmigurumiPart {
  const side = base.side ?? 1
  const oo: RolledLopOptions = outerSide(o) ? { ...o, outerRoll: { side } } : o
  return {
    name: base.name,
    stitch: 'sc',
    rounds: rolledLopRounds(oo),
    colourHex: o.liningHex ?? base.colourHex,
    ...(o.liningHex ? { colourChanges: [{ fromRound: o.rounds + 2, hex: base.colourHex, label: 'main' }] } : {}),
    words: rolledLopWords(oo),
    ...(base.sewNote ? { sewNote: base.sewNote } : {}),
    place: base.place,
    custom: {
      build: (yr: number) => {
        const b = buildRolledLop(o, yr, side)
        return { built: b.built, problems: b.problems, seat: b.seat, audit: (bb: BuiltContinuous) => auditChainOvalSettled(bb, yr) }
      },
    },
  }
}
