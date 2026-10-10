/**
 * TUBE SHAPING — the OPEN-ENDED round form (hats, cowls, baskets, socks, …).
 *
 * The sphere (`buildSphere`, shaping.ts) is a closed bag: a magic ring at one
 * pole, a fasten-off drawn shut at the other, stuffing pressing the fabric out
 * from inside. A tube is the same continuous no-turn spiral of genuinely hooked
 * stitches laid on a surface of revolution, with three things different:
 *
 *   1. ONE END IS OPEN. The last round is not gathered into a pole; the tail is
 *      woven back along it like a disc's, and the rim stays a rim.
 *   2. THE ANCHOR MAY BE A CHAIN RING. A hat starts at a magic ring (closed
 *      crown); a cowl starts with a foundation chain joined into a ring, so
 *      both ends are open. The joined chain is the pinned anchor exactly the way
 *      the foundation chain is for flat work (three nodes a crown, proud, pinned)
 *      — bent round the start of the profile instead of laid in a line.
 *   3. NO STUFFING. The model carries no per-node `round` index, which is the
 *      gate the relaxer's pressure term reads (§8f-9), so a tube settles as
 *      FABRIC held to its worked shape (the `surface` layout hold, the blocked /
 *      worn / standing analog), never as a pressurised bag.
 *
 * On top of that: counts that rise, hold and fall (`roundOps` between any two
 * rounds, the same even-distribution a designer writes), spiral OR joined
 * rounds (a slip stitch into the round's first stitch and a chain up — both
 * real yarn: the sl st is a recorded, audited hook), a body in sc / hdc / dc,
 * and a brim that is either a 1×1 FRONT/BACK-POST rib (fpdc / bpdc worked
 * around the posts below — `emitPostStitchRound` is the post branch of the
 * flat grid builder traced through the surface frame, a genuine ring around the
 * stem held by collision, role 'ring') or a FOLD (the last rounds of the
 * profile turn back up the outside of the body, two fabric layers a yarn apart,
 * the fold's own face turned out — which is what a folded brim really is).
 *
 * Everything here is one strand, every interlock recorded, the whole thing
 * audited in the surface frame exactly like the sphere. Nothing in this file is
 * imported by any existing builder, so every existing geometry hash is
 * untouched by construction.
 */

import { STITCHES, type StitchId } from './dictionary'
import { HOOK_SPREAD_YR, createStrand, dimsFor, emitHeadLoop, emitPlainStitch, headApexRelief, rowPitchYr, type BuiltContinuous, type StitchDims, type StrandCtx } from './yarnPath'
import { emitDecrease, roundOps } from './shaping'

/** How the tube starts. */
export type TubeAnchor = 'ring' | 'chain'
/** How one round runs into the next. */
export type TubeJoin = 'spiral' | 'joined'
/** The brim at the open end: a 1×1 post rib, a plain fold, or a RIDGE brim —
 *  the last rounds worked in one loop only (sc blo / flo), the unworked loop
 *  floating as a dense horizontal ridge a round: the closed, snug rib a hat
 *  band or a nightcap's folded brim really has (a post rib is an open lattice
 *  by comparison). */
export type TubeBrimKind = 'rib' | 'fold' | 'ridge'
/** How the first rounds off a magic ring are laid: a hat crown domes, a
 *  basket base is a flat disc, a nightcap / sock toe is a CONE (every round
 *  spends what its radius change leaves on height — the tapered tail a
 *  nightcap is worked tip-first). Ignored for a chain anchor. */
export type TubeCap = 'dome' | 'flat' | 'cone'

/** A brim over the LAST `rounds` rounds of the profile. */
export interface TubeBrim {
  kind: TubeBrimKind
  rounds: number
  /** ridge: fold the brim up the outside of the body as well (a nightcap's
   *  turned-up band). A folded brim shows the WRONG side of its rounds, so a
   *  folded ridge brim is worked in the FRONT loop (the back loop floats as
   *  the ridge on the back, which the fold turns out) and an unfolded one in
   *  the BACK loop. `loop` overrides that choice. */
  fold?: boolean
  loop?: 'back' | 'front'
}

export interface TubeSpec {
  /** The body stitch: sc, hdc or dc. */
  stitch: StitchId
  /** Stitches per round, in work order — EVERY worked round, brim included.
   *  For a 'chain' anchor the foundation chain is `rounds[0]` long. */
  rounds: number[]
  anchor: TubeAnchor
  join: TubeJoin
  cap?: TubeCap
  /** A brim over the LAST `rounds` rounds of the profile. */
  brim?: TubeBrim
  /** Column-gauge override (yarn radii), the density knob — same as buildSphere. */
  gaugeYr?: number
}

/** The brim rib stitches, in the order they alternate around the round. */
export const RIB_PAIR: [StitchId, StitchId] = ['fpdc', 'bpdc']

/** Meridian advance per round, a multiple of the row pitch — the sphere's own
 *  `SPHERE_DRIFT_SCALE` (round work travels a touch further per round). */
const DRIFT_SCALE = 1.05
/** The two no-turn construction flags the sphere settled on (§8f-5, §8f-6). */
const SURFACE_LAY = 1
const BACK_CROSS = 1
/** Centre-to-centre spacing of the two fabric layers of a folded brim, in yarn
 *  radii. Two surfaces of relief ±0.5yr each, plus a clear collision diameter
 *  (1.25yr) between them. */
const FOLD_GAP_YR = 2.8

interface Profile {
  at: (ly: number) => { r: number; z: number; tr: number; tz: number; nr: number; nz: number }
  rOfRound: (k: number) => number
  /** Meridian coordinate of the first worked round / the anchor. */
  m0: number
}

/**
 * The INTRINSIC surface of a tube — the sphere's (`intrinsicProfile`,
 * shaping.ts) with a flat-cap option, a chain-ring start and the folded brim.
 * Radius per round from the count (circumference = count·gauge); height from
 * meridian-pitch continuity (what radius change does not use, height takes);
 * two Chaikin passes round the corners (a worn / standing fabric has no crease
 * either — §8e); arclength-parameterised so fabric length maps 1:1.
 */
function tubeProfile(spec: TubeSpec, counts: number[], sw: number, rr: number, drift: number, yr: number): Profile {
  const cap = spec.cap ?? 'dome'
  const chain = spec.anchor === 'chain'
  const fold = tubeFoldRounds(spec)
  const body = counts.length - fold
  const rOf = (c: number): number => Math.max((c * sw) / (2 * Math.PI), yr * 0.6)
  // The start: a magic ring's own radius, or the chain ring at the first round's
  // own radius (the foundation chain IS the first round's circumference).
  const r0 = chain ? rOf(counts[0]!) : rr
  const rPts: number[] = [r0]
  const zPts: number[] = [0]
  // THE CAP. A hat crown is a DOME, not a cone: the counts' own radii set
  // where each round sits across, and the heights follow an elliptical dome
  // whose quarter-arc is the ascent's own meridian length (the rounds' pitch
  // times their number), so the fabric is neither stretched nor gathered to
  // reach the body. A cone is what constant dr/dz gives (sqrt(drift²−dr²) a
  // round); it is wrong for a crown — the first Fargate proof stood like a
  // tea cosy. A basket base is a genuinely flat disc (dz 0 where the counts
  // spend the whole pitch on radius).
  // A CONE (`cap: 'cone'`) is the pitch-continuity rule with no ascent at all:
  // the counts' own radii and whatever each round's radius change leaves of its
  // pitch as height, so a tip-first +2-a-round taper is a straight-sided cone.
  let ascent = 0
  if (!chain && cap === 'dome') {
    while (ascent < body - 1 && counts[ascent + 1]! > counts[ascent]!) ascent++
    ascent++ // rounds 0..ascent-1 climb; round ascent-1 is the widest
  }
  const R = ascent > 0 ? rOf(counts[ascent - 1]!) : 0
  const Lasc = ascent * drift
  // Ramanujan's quarter-ellipse length inverted for the dome height H (floored
  // at a shallow dome so a short ascent never flattens to a disc).
  const H = ascent > 0 ? Math.max(Math.sqrt(Math.max((8 * Lasc * Lasc) / (Math.PI * Math.PI) - R * R, 0)), 0.35 * R) : 0
  for (let k = 0; k < body; k++) {
    const r = rOf(counts[k]!)
    const dr = r - rPts[rPts.length - 1]!
    const floor = cap === 'flat' && !chain ? 0 : (0.25 * drift) ** 2
    // The chain ring sits AT the first round's radius and the first round rises
    // straight off it (one full pitch of height, no radius change).
    if (k < ascent) {
      const phi = Math.asin(Math.min(1, r / R))
      rPts.push(r)
      zPts.push(-H * (1 - Math.cos(phi)))
      continue
    }
    const dz = chain && k === 0 ? drift : Math.sqrt(Math.max(drift * drift - dr * dr, floor))
    rPts.push(r)
    zPts.push(zPts[zPts.length - 1]! - dz)
  }
  if (fold > 0) {
    // THE FOLD. The fabric turns back UP the outside of the body: the first brim
    // round sits level with the last body round a fabric-gap further out, the
    // rest climb a pitch a round. The smoothing below rounds the turn into the
    // U a real fold is.
    const rBody = rPts[rPts.length - 1]!
    const zBody = zPts[zPts.length - 1]!
    const rOut = rBody + yr * FOLD_GAP_YR
    for (let i = 0; i < fold; i++) {
      rPts.push(rOut)
      zPts.push(zBody + drift * i)
    }
  }
  // Each vertex carries its FABRIC coordinate (a round's pitch per vertex), and
  // the smoothing interpolates it with the point, so round k always lands on
  // the radius its count makes even where the dome's segments are shorter or
  // longer than a pitch.
  let P: { r: number; z: number; f: number }[] = rPts.map((r, i) => ({ r, z: zPts[i]!, f: i * drift }))
  for (let pass = 0; pass < 2; pass++) {
    const Q: { r: number; z: number; f: number }[] = [P[0]!]
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i]!
      const b = P[i + 1]!
      Q.push({ r: a.r * 0.75 + b.r * 0.25, z: a.z * 0.75 + b.z * 0.25, f: a.f * 0.75 + b.f * 0.25 })
      Q.push({ r: a.r * 0.25 + b.r * 0.75, z: a.z * 0.25 + b.z * 0.75, f: a.f * 0.25 + b.f * 0.75 })
    }
    Q.push(P[P.length - 1]!)
    P = Q
  }
  // Sit the whole profile above the table (the open rim, or the fold, is the
  // lowest point of a hat; the rotation into a standing basket is render-only).
  const lift = yr * 2 - Math.min(...P.map((p) => p.z))
  for (const p of P) p.z += lift
  const m0 = rr
  const at = (ly: number): { r: number; z: number; tr: number; tz: number; nr: number; nz: number } => {
    const f = Math.max(0, ly - m0)
    let i = 1
    while (i < P.length - 1 && P[i]!.f < f) i++
    const a = P[i - 1]!
    const b = P[i]!
    const t = Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f || 1)))
    const r = a.r + (b.r - a.r) * t
    const z = a.z + (b.z - a.z) * t
    const L = Math.hypot(b.r - a.r, b.z - a.z) || 1
    const tr = (b.r - a.r) / L
    const tz = (b.z - a.z) / L
    return { r, z, tr, tz, nr: -tz, nz: tr }
  }
  return { at, rOfRound: (k: number) => rPts[k + 1]!, m0 }
}

/** The worked rounds of a tube and the brim's rows, so a caller (instructions,
 *  chart, the Studio) can ask which rounds are ribbed without re-deriving. */
export function tubeRibRounds(spec: TubeSpec): Set<number> {
  const out = new Set<number>()
  if (spec.brim?.kind !== 'rib') return out
  for (let k = spec.rounds.length - spec.brim.rounds; k < spec.rounds.length; k++) if (k >= 0) out.add(k)
  return out
}

/** The rounds of a RIDGE brim (sc in one loop only). */
export function tubeRidgeRounds(spec: TubeSpec): Set<number> {
  const out = new Set<number>()
  if (spec.brim?.kind !== 'ridge') return out
  for (let k = spec.rounds.length - spec.brim.rounds; k < spec.rounds.length; k++) if (k >= 0) out.add(k)
  return out
}

/** The loop a ridge brim is worked in: the front loop when the brim folds up
 *  (so the ridge floats on the face the fold turns out), else the back loop. */
export function tubeRidgeLoop(spec: TubeSpec): 'back' | 'front' {
  if (spec.brim?.kind !== 'ridge') return 'back'
  return spec.brim.loop ?? (spec.brim.fold ? 'front' : 'back')
}

/** The stitch worked on round k: the body stitch, or the one-loop sc of a
 *  ridge brim round (rib rounds are the post pair, handled by the builder). */
export function tubeRoundStitch(spec: TubeSpec, k: number): StitchId {
  if (tubeRidgeRounds(spec).has(k)) return tubeRidgeLoop(spec) === 'front' ? 'scflo' : 'scblo'
  return spec.stitch
}

/** How many of the last rounds turn back up the outside of the body. */
export function tubeFoldRounds(spec: TubeSpec): number {
  if (!spec.brim) return 0
  if (spec.brim.kind === 'fold') return spec.brim.rounds
  if (spec.brim.kind === 'ridge' && spec.brim.fold) return spec.brim.rounds
  return 0
}

/** Validate a tube spec the way the builder will — thrown as a plain Error so
 *  the program layer can report it before anything is built. */
export function validateTubeSpec(spec: TubeSpec): void {
  const { rounds } = spec
  if (rounds.length === 0) throw new Error('tube: needs at least one round')
  if (!['sc', 'hdc', 'dc'].includes(spec.stitch)) throw new Error(`tube: body stitch must be sc, hdc or dc (got ${spec.stitch})`)
  if (spec.anchor === 'ring' && rounds[0]! > 12) throw new Error(`tube: a magic ring takes at most 12 stitches (got ${rounds[0]})`)
  if (spec.anchor === 'chain' && rounds[0]! < 6) throw new Error(`tube: a chain ring needs at least 6 stitches (got ${rounds[0]})`)
  for (let k = 1; k < rounds.length; k++) {
    const prev = rounds[k - 1]!
    const cur = rounds[k]!
    if (cur > prev * 2) throw new Error(`tube: round ${k + 1} more than doubles (${prev} → ${cur})`)
    if (cur * 2 < prev) throw new Error(`tube: round ${k + 1} less than halves (${prev} → ${cur})`)
  }
  if (spec.brim) {
    if (spec.brim.rounds < 1 || spec.brim.rounds >= rounds.length)
      throw new Error(`tube: brim of ${spec.brim.rounds} rounds does not fit ${rounds.length} rounds`)
    for (const k of tubeRibRounds(spec)) {
      if (rounds[k]! % 2 !== 0) throw new Error(`tube: a 1×1 rib round needs an even count (round ${k + 1} has ${rounds[k]})`)
      if (rounds[k] !== rounds[k - 1]) throw new Error(`tube: a rib round cannot shape (round ${k + 1}: ${rounds[k - 1]} → ${rounds[k]})`)
    }
    if (spec.brim.kind === 'fold' || spec.brim.kind === 'ridge') {
      for (let k = rounds.length - spec.brim.rounds; k < rounds.length; k++)
        if (rounds[k] !== rounds[k - 1]) throw new Error(`tube: a ${spec.brim.kind} brim cannot shape (round ${k + 1})`)
    }
    if (spec.brim.kind === 'ridge' && spec.stitch !== 'sc')
      throw new Error(`tube: a ridge brim (sc in one loop) needs an sc body (got ${spec.stitch})`)
  }
}

interface PostRef {
  /** The node a post stitch rings around (the stem below). */
  node: number
  /** Its fabric-frame meridian coordinate and normal offset. */
  ly: number
  lz: number
}

interface TCrown {
  back: number
  front: number
  theta: number
  m: number
  nz: number
  post: PostRef
}

/**
 * One FRONT- or BACK-POST stitch in the round: the flat grid builder's post
 * branch (yarnPath.ts, §8f-7) traced through the 3D fabric frame. Down-leg on
 * the trailing side, a genuine RING around the stem below (recorded, audited —
 * role 'ring'), up-leg on the leading side, the head a real loop lying in the
 * surface like every other no-turn head. The post pops along the surface
 * NORMAL: fp proud outward, bp sunk inward — the rib.
 */
function emitPostStitchRound(
  S: StrandCtx,
  d: StitchDims,
  a: {
    j: number
    c: number
    id: StitchId
    by: number
    ty: number
    xC: number
    stem: PostRef
    /** Column pack relative to the post stitch's own gauge (the grid builder's `pack`). */
    pack: number
    place3: (lx: number, ly: number, lz: number) => { x: number; y: number; z: number }
    headLoopMm: number
  },
): { crown: number; postMid: number; postLz: number; head: number[] } {
  const push = (lx: number, ly: number, lz: number, w = 1): number => {
    const p = a.place3(lx, ly, lz)
    return S.push(p.x, p.y, p.z, w)
  }
  const { j, c, id, by, ty, xC: x } = a
  const s = 1
  const fz = 1
  const sd = -s
  const z = d.z
  const zh = d.zh
  const cw = d.cw * a.pack
  const pw = d.pw * a.pack
  const dh = d.dh
  const px = ty - by
  const front = id === 'fpdc' ? 1 : -1
  const ppz = id === 'fpdc' ? z * 3.0 : -z * 2.2
  const legHalf = (f: number): number => pw * (0.18 + 0.82 * f)
  const ay = a.stem.ly
  const az = a.stem.lz
  push(x + sd * legHalf(1), by + px * 0.85, zh * 0.35 * fz)
  push(x + sd * legHalf(0.62), by + px * 0.52, ppz)
  push(x + sd * legHalf(0.26), by + px * 0.22, ppz)
  push(x + cw * 1.15, ay, az)
  const ringFar = push(x, ay - dh * 0.2, az - front * cw * 1.5)
  S.links.push({ j, c, role: 'ring', hook: ringFar, below: a.stem.node })
  push(x - cw * 1.15, ay, az)
  push(x - sd * legHalf(0.26), by + px * 0.22, ppz)
  const postMid = push(x - sd * legHalf(0.62), by + px * 0.52, ppz)
  push(x - sd * legHalf(1), by + px * 0.85, zh * 0.35 * fz)
  const h = emitHeadLoop(push, { xC: x, ty, s, sd, fz, zh, dh, pw, cw, hl: a.headLoopMm, lay: SURFACE_LAY })
  const head: number[] = []
  for (let k = h.trailA; k <= h.trailB; k++) head.push(k)
  return { crown: h.crown, postMid, postLz: ppz, head }
}

/**
 * Build a tube. Same shape of result as `buildSphere`: frame 'surface', per-node
 * meridian tangents, the anchor pinned, every other node free, one strand.
 * `nodeRow` carries the worked ROUND per node (−1 for the anchor) so the render
 * can stripe rounds.
 */
export function buildTube(spec: TubeSpec, yarnRadiusMm: number): BuiltContinuous {
  validateTubeSpec(spec)
  const yr = yarnRadiusMm
  const st = spec.stitch
  const sw = yr * (spec.gaugeYr ?? STITCHES[st].gaugeYr)
  const dims = dimsFor(yr, st)
  const { zh } = dims
  const headLoopMm = yr * (STITCHES[st].headLoopYr ?? 0)
  const yarnOvers = STITCHES[st].yarnOvers ?? 0
  const yarnOverMm = yr * (STITCHES[st].yarnOverYr ?? 1)
  const rowH = yr * rowPitchYr(st)
  const drift = rowH * DRIFT_SCALE
  const counts = spec.rounds.slice()
  const ribRounds = tubeRibRounds(spec)
  // The rib's own cell, packed to the body's column pitch the way the grid
  // builder packs a post to the swatch's gauge (§8f-7).
  const ribDims = dimsFor(yr, 'fpdc')
  const ribPack = sw / (yr * STITCHES.fpdc.gaugeYr)
  const ribRowH = yr * rowPitchYr('fpdc') * DRIFT_SCALE
  const ribHeadLoopMm = yr * (STITCHES.fpdc.headLoopYr ?? 0) * ribPack

  const S = createStrand()
  const { nodes, push } = S

  const chain = spec.anchor === 'chain'
  const rr = chain ? 0 : yr * 1.15
  const prof = tubeProfile(spec, counts, sw, rr, drift, yr)
  // Where each round sits along the meridian. Rib rounds are dc-height, so they
  // advance further than a body round (the profile is arclength-parameterised
  // over the SUM, so a rib round genuinely takes more of the surface).
  const rounds: number[] = []
  {
    let m = rr
    for (let k = 0; k < counts.length; k++) {
      m += ribRounds.has(k) ? ribRowH : drift
      rounds.push(m)
    }
  }
  // tubeProfile laid its surface at `drift` a round; re-parameterise so the
  // fabric coordinate still maps 1:1 onto the profile when rib rounds are taller.
  const mEnd = rounds[rounds.length - 1]!
  const profScale = (counts.length * drift) / (mEnd - rr)
  const atM = (ly: number): ReturnType<Profile['at']> => prof.at(rr + (ly - rr) * profScale)

  const merArr: { tr: number; tz: number }[] = []
  const nodeRow: number[] = []
  let roundNow = -1
  const mkPlace3 =
    (rRef: number) =>
    (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
      const th = lx / rRef
      const q = atM(ly)
      merArr.push({ tr: q.tr, tz: q.tz })
      nodeRow.push(roundNow)
      const rp = Math.max(q.r + q.nr * lz, 1e-3)
      return { x: rp * Math.cos(th), y: rp * Math.sin(th), z: q.z + q.nz * lz }
    }

  const crownNz = headLoopMm > 0 ? headApexRelief(zh, SURFACE_LAY) : zh * 1.15
  // Where a body stitch's post-mid node is BUILT (emitPlainStitch, backCross 1):
  // the bare re-cut post's mid node, or the collared post's 0.65-height leg node.
  const bodyPostLz =
    yarnOvers > 0
      ? -dims.z * 3.56 + (dims.z * 3.56 + dims.z * 0.6) * 0.65
      : -dims.z * 2.13
  let below: TCrown[] = []
  let anchorPins = 0
  let phase = 0
  let mPrev = rr
  let count = 0

  // ── THE ANCHOR ────────────────────────────────────────────────────────────
  const RING_N = 18
  const ringNodes: number[] = []
  if (!chain) {
    // Magic ring at the start pole — exactly the sphere's.
    const ringPlace = mkPlace3(rr)
    for (let i = 0; i < RING_N; i++) {
      const a = (i / RING_N) * Math.PI * 2
      const p = ringPlace(a * rr, rr, zh * 0.5)
      push(p.x, p.y, p.z, 0)
      ringNodes.push(nodes.length - 1)
    }
    phase = ((RING_N - 1) / RING_N) * Math.PI * 2
    anchorPins = RING_N
  } else {
    // A foundation chain joined into a ring: `rounds[0]` proud crowns, pinned,
    // laid round the profile's start — the flat grid builder's foundation bent
    // into a circle. The first worked round hooks these exactly as row 0 hooks
    // a straight foundation.
    const n0 = counts[0]!
    const rRef = Math.max(prof.at(rr).r, 1e-3)
    const place = mkPlace3(rRef)
    const dh = dims.dh
    const cw = dims.cw
    for (let c = 0; c < n0; c++) {
      const th = ((c + 0.5) / n0) * Math.PI * 2
      const x = th * rRef
      const a = place(x - cw, rr - dh * 0.4, zh)
      push(a.x, a.y, a.z, 0)
      const b = place(x, rr, zh * 1.15)
      const crown = push(b.x, b.y, b.z, 0)
      const d = place(x + cw, rr - dh * 0.4, zh)
      push(d.x, d.y, d.z, 0)
      below.push({ back: crown, front: crown, theta: th, m: rr, nz: zh * 1.15, post: { node: crown, ly: rr, lz: zh * 1.15 } })
    }
    phase = 0
    anchorPins = 3 * n0
    count = n0
  }

  // ── THE ROUNDS ────────────────────────────────────────────────────────────
  const joined = spec.join === 'joined'
  for (let k = 0; k < counts.length; k++) {
    const mK = rounds[k]!
    const prev = count
    count = counts[k]!
    const rib = ribRounds.has(k)
    const rRef = Math.max(prof.rOfRound(k), 1e-3)
    roundNow = k
    const place3 = mkPlace3(rRef)
    const crowns: TCrown[] = []
    const by = mPrev
    const ty = mK
    const px = ty - by

    if (joined && k > 0) {
      // JOIN: a slip stitch into the first stitch of the round just worked — a
      // genuine hook under that crown (recorded) — then the chain up into this
      // round (real slack, like the turning chain of flat work).
      const b0 = below[0]!
      const rB = Math.max(prof.rOfRound(k - 1), 1e-3)
      const placeB = mkPlace3(rB)
      const pushB = (lx: number, ly: number, lz: number): number => {
        const p = placeB(lx, ly, lz)
        return S.push(p.x, p.y, p.z)
      }
      const x0 = (b0.theta + Math.PI * 2) * rB
      const xH = x0 + yr * HOOK_SPREAD_YR * 0.6
      const z = dims.z
      const dh = dims.dh
      const hookZ = (b0.nz >= 0 ? -1 : 1) * z * (1.6 - 0.3 * SURFACE_LAY + 2.47 * BACK_CROSS)
      const nearZB = (z * 0.5 + (-z * 4.05 - z * 0.5) * BACK_CROSS)
      pushB(xH - dims.pw * 0.3, b0.m + dh * 0.5, nearZB)
      const slst = pushB(xH, b0.m - dh, hookZ)
      S.links.push({ j: k, c: -1, role: 'hook', hook: slst, below: b0.back })
      pushB(xH + dims.pw * 0.3, b0.m + dh * 0.5, nearZB)
      // ch 1 / 2 / 3 up: one node per chain, rising to this round's first head.
      const nCh = st === 'dc' ? 3 : st === 'hdc' ? 2 : 1
      const xw = (phase + (0.5 / count) * Math.PI * 2) * rRef
      const pushK = (lx: number, ly: number, lz: number): number => {
        const p = place3(lx, ly, lz)
        return S.push(p.x, p.y, p.z)
      }
      for (let t = 1; t <= nCh + 1; t++) {
        const f = t / (nCh + 1)
        pushK(xw - dims.cw * (0.9 - 0.8 * f), by + px * (0.3 + 0.65 * f), zh * (0.9 - 0.5 * f))
      }
    }

    if (k === 0 && !chain) {
      // Round 1 wraps the magic ring strand (role 'ring'), as on the sphere.
      const cyEff = rr * 0.95 + dims.dh
      for (let i = 0; i < count; i++) {
        const th = phase + ((i + 0.5) / count) * Math.PI * 2
        const ring = ringNodes[Math.round(((th / (Math.PI * 2)) % 1) * RING_N) % RING_N]!
        const xC = th * rRef
        const r = emitPlainStitch(S, dims, {
          j: k, c: i, id: st, s: 1, fz: 1, by, ty, xCrown: xC, xHook: xC,
          bcBack: ring, bcFront: ring, cyBelow: cyEff, bcNormalZ: zh * 0.5, place3,
          linkRole: 'ring', headLoopMm, yarnOvers, yarnOverMm, surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
        })
        crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, m: mK, nz: crownNz, post: { node: r.postMid, ly: by + px * 0.52, lz: bodyPostLz } })
      }
    } else if (rib) {
      // THE RIB: fpdc / bpdc alternating around, each ringing the post below.
      for (let i = 0; i < count; i++) {
        const b = below[i]!
        const th = phase + ((i + 0.5) / count) * Math.PI * 2
        const id = RIB_PAIR[i % 2]!
        const r = emitPostStitchRound(S, ribDims, {
          j: k, c: i, id, by, ty, xC: th * rRef, stem: b.post, pack: ribPack, place3, headLoopMm: ribHeadLoopMm,
        })
        crowns.push({ back: r.crown, front: r.crown, theta: th, m: mK, nz: headApexRelief(ribDims.zh, SURFACE_LAY), post: { node: r.postMid, ly: by + px * 0.52, lz: r.postLz } })
      }
    } else {
      // A ridge-brim round is the same sc excursion hooked under ONE loop of
      // the crown below (sc blo / flo — yarnPath's loopMode); every other
      // round is the body stitch. Same dims, same pitch, same gauge as sc.
      const rid = tubeRoundStitch(spec, k)
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
            j: k, c: oi, id: st, s: 1, fz: 1, by, ty, xCrown: xC,
            b1: { back: b1.back, front: b1.front, x: b1.theta * rRef },
            b2: { back: b2.back, front: b2.front, x: b2.theta * rRef },
            cy1: b1.m, cy2: b2.m, bn1: b1.nz, bn2: b2.nz, place3, headLoopMm,
            surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
          })
          crowns.push({ back: r.crown, front: r.crown, theta: th, m: mK, nz: crownNz, post: { node: r.crown, ly: ty, lz: crownNz } })
          li++
        } else {
          const b = below[bi++]!
          const n = op === 'inc' ? 2 : 1
          for (let t = 0; t < n; t++) {
            const th = phase + ((li + 0.5) / count) * Math.PI * 2
            const xC = th * rRef
            // An inc pair's hooks sit side by side; a joined round's FIRST hook
            // sits beside the slip stitch that already dived under that crown.
            const hookOff =
              n === 2
                ? yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1)
                : joined && k > 0 && oi === 0
                  ? -yr * HOOK_SPREAD_YR * 0.6
                  : 0
            const hookDepthScale = n === 2 && t === 1 ? 1.5 : 1
            const r = emitPlainStitch(S, dims, {
              j: k, c: oi, id: rid, s: 1, fz: 1, by, ty, xCrown: xC,
              xHook: b.theta * rRef + hookOff, bcBack: b.back, bcFront: b.front,
              cyBelow: b.m, bcNormalZ: b.nz, place3, hookDepthScale, headLoopMm,
              yarnOvers, yarnOverMm, surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
            })
            crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, m: mK, nz: crownNz, post: { node: r.postMid, ly: by + px * 0.52, lz: bodyPostLz } })
            li++
          }
        }
      }
      if (bi !== below.length) throw new Error(`tube round ${k + 1}: consumed ${bi} of ${below.length} stitches below`)
    }
    below = crowns
    mPrev = mK
  }

  // ── THE OPEN END ──────────────────────────────────────────────────────────
  // Fasten off along the rim: the tail woven back along the last round, tucked
  // behind the fabric (a disc's ending). The strand must not stop dead at the
  // final crown (§8c) — and nothing gathers this end: it stays open.
  const rEnd = Math.max(prof.rOfRound(counts.length - 1), 1e-3)
  roundNow = counts.length - 1
  const placeEnd = mkPlace3(rEnd)
  const lastRowH = ribRounds.has(counts.length - 1) ? ribRowH : drift
  for (let t = 1; t <= 4; t++) {
    const th = phase + Math.PI * 2 * (1 + 0.012 * t)
    const ly = mPrev - lastRowH * 0.12 * t
    const p = placeEnd(th * rEnd, ly, yr * (0.3 - 0.25 * t))
    push(p.x, p.y, p.z)
  }

  if (merArr.length !== nodes.length)
    throw new Error(`tube frame capture out of sync: ${merArr.length} frames for ${nodes.length} nodes`)
  const strand = new Array(nodes.length).fill(0)
  const along = nodes.map((_, i) => i)
  const halfSpan = Math.max(...counts.map((c) => (c * sw) / (2 * Math.PI))) + yr * (3 + (tubeFoldRounds(spec) > 0 ? FOLD_GAP_YR : 0))
  return {
    // No `round` index on purpose: that is the relaxer's stuffing gate, and a
    // tube is fabric, not a bag.
    model: { nodes, dist: S.dist, bend: S.bend, strand, along, meridian: merArr },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: halfSpan * 2,
    heightMm: halfSpan * 2,
    anchorPins,
    frame: 'surface',
    nodeRow,
  }
}

/** The settled size of a tube in mm: footprint across (x–y) and height (z). */
export function tubeSettledSizeMm(built: BuiltContinuous): { width: number; height: number } {
  const nodes = built.model.nodes.slice(built.anchorPins)
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const n of nodes) {
    if (n.x < minx) minx = n.x
    if (n.x > maxx) maxx = n.x
    if (n.y < miny) miny = n.y
    if (n.y > maxy) maxy = n.y
    if (n.z < minz) minz = n.z
    if (n.z > maxz) maxz = n.z
  }
  return { width: Math.max(maxx - minx, maxy - miny), height: maxz - minz }
}
