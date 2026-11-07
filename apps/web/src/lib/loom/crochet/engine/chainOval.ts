/**
 * THE OVAL WORKED ROUND A FOUNDATION CHAIN (engine-shapes-1107).
 *
 * Bec, 7 Nov: "an engine that can build all kinds of adorable toys including
 * made up ones and real looking ones". The lamb (jobs/lamb-1027.md, lesson 8)
 * showed the gap: a muzzle, a snout, a face or belly patch, a sole, an oval
 * head or body is made in amigurumi by the standard OVAL construction, and the
 * engine could only work an oval END TO END (a stretched ball from a magic
 * ring), so the stitches ran up and down the face ("stitched up and down ...
 * wobbly vs soft gently curved"). This is the real construction:
 *
 *   Ch N. Round 1: starting in the 2nd ch from the hook, work along the chain,
 *   3 sts in the last ch (round the end), then along the OTHER side of the same
 *   chain, 2 sts in the first ch (the round closes on itself). Every later
 *   round increases AT THE ENDS (the two fans round the chain's ends); the
 *   sides are worked one stitch in each.
 *
 * So the stitches circle the chain in CONCENTRIC OVAL ROUNDS, and the outline
 * of every round is the oval round the chain. That is what is built here, and
 * nothing else shapes it:
 *
 *   1. A pinned FOUNDATION CHAIN (the anchor, like the magic ring): N chain
 *      stitches along local x, each a small loop with an "A" side and a "B"
 *      side. Round 1's stitches wrap the chain (link role 'ring', as round 1
 *      wraps a magic ring): side A into the A loops, 3 round ch 1's end, side
 *      B into the B loops, 2 more into the 2nd ch from the hook.
 *   2. Every later stitch is emitted by the locked emitters (`emitPlainStitch`,
 *      `emitDecrease`) on the stitch BELOW it, exactly as a ball's rounds are.
 *      An increase is two stitches into one; a decrease two into one head.
 *   3. THE SURFACE THE COUNTS MAKE (like `buildSphere`'s intrinsic profile):
 *      round k's crown line is the curve at offset rho_k round the chain's
 *      core (the stadium: the chain's ends at +-c, rounded by rho), with rho_k
 *      the offset whose perimeter is round k's own stitch count x the stitch
 *      pitch; its height comes from meridian continuity (each round sits one
 *      round of fabric from the last: what the offset does not use, height
 *      does). +3 at each end a round is a flat oval (it lies flat); fewer
 *      climbs into a dome or a cup; rounds worked even are the walls; the
 *      decreases mirror the increases and close it. Two Chaikin passes round
 *      the profile's corners (stuffing / blocking cannot crease).
 *   4. Each node's own 3D frame (meridian + outward normal) is recorded
 *      (`YarnModel.frame3`, the bent tube's form of the 'surface' hold), so the
 *      relax holds every round where it was worked and the audit measures
 *      every hook against its crown in that frame.
 *
 * Kinds: 'stuffed' (a muzzle or snout sewn on by its open last round, or a
 * closed oval head / body / foot when `closed`) and 'patch' (a flat or gently
 * cupped appliqué: a face patch, a belly patch, a sole; never stuffed, sewn
 * flat). The words come from the same plan (`chainOvalWords`), read back by
 * chainOval.test.ts.
 *
 * Local frame: the chain along x (ch 1, the slip-knot end, at -x), the right
 * side up (+z): the chain is the top of the dome, the last round the bottom
 * (the open edge of a muzzle is local z min, so a `dir` placement seats it on
 * the face with the dome standing out along `aim`, and `spin` lays the chain
 * across). A patch lies in x-y with its right side +z (a `form: 'disc'` drape).
 *
 * Opt-in: nothing imports this unless a preset asks for it, so every existing
 * geometry hash is unchanged.
 */

import { STITCHES, type ShapeOp } from './dictionary'
import { HOOK_SPREAD_YR, createStrand, dimsFor, emitPlainStitch, headApexRelief, rowPitchYr, type BuiltContinuous } from './yarnPath'
import { emitDecrease } from './shaping'
import { relax } from './relax'
import { auditProblems } from './auditChecks'
import { FrontRaster, outlineSoftness } from './cuteMeasure'
import type { AmigurumiPart, PartPlacement } from './composition'
import type { EmbroideryStitch } from './faceEmbroidery'

export type ChainOvalKind = 'stuffed' | 'patch'

export interface ChainOvalOptions {
  kind: ChainOvalKind
  /** The foundation chain, ch N (>= 3). The oval's straight middle is N - 2
   *  chains long; a short chain against the rounds is a soft, nearly round
   *  oval, a long one a long flat-sided oval. */
  chain: number
  /** Increase rounds after round 1 (>= 0): the oval's size. */
  rounds: number
  /** Increases at EACH end, per increase round (1-3; a list = one per round).
   *  3 lies flat (the standard flat oval); 2 climbs into a soft dome; 1 a deep
   *  cup. Default: from `flatness`. */
  endInc?: number | number[]
  /** When `endInc` is absent: the share of the increase rounds worked flat
   *  (3 at each end), the rest at 2 (the dome). Default 1 for a patch, 0.5
   *  for a stuffed piece. */
  flatness?: number
  /** Rounds worked even after the increases (the depth: a muzzle's sides, a
   *  cup's wall). Default 0. */
  even?: number
  /** A stuffed piece only: decrease back down (the increases mirrored) and
   *  sew the last round closed along the chain's line: a closed oval head,
   *  body, foot or ball-ended snout. Default false (open: sewn on by its last
   *  round). */
  closed?: boolean
}

/** Where a stitch sits round the oval: the fan round the end of the chain
 *  the round starts at (E1, split across the round's start), side A, the fan
 *  round the far end (E0, ch 1), side B. */
export type OvalSide = 'E1' | 'A' | 'E0' | 'B'

export interface OvalRound {
  /** Stitches made. */
  count: number
  /** Ops over the round BELOW, in work order (empty for round 1, which is
   *  worked into the chain). */
  ops: ShapeOp[]
  /** Where each made stitch sits. */
  side: OvalSide[]
  /** Leading and trailing E1 stitches (the fan the round starts in). */
  head: number
  tail: number
}

const MAX_END_INC = 3

function validate(o: ChainOvalOptions): void {
  if (!Number.isInteger(o.chain) || o.chain < 3 || o.chain > 60) throw new Error(`oval: the chain is 3-60 ch (got ${o.chain})`)
  if (!Number.isInteger(o.rounds) || o.rounds < 0 || o.rounds > 30) throw new Error(`oval: 0-30 increase rounds (got ${o.rounds})`)
  const ev = o.even ?? 0
  if (!Number.isInteger(ev) || ev < 0 || ev > 40) throw new Error(`oval: 0-40 even rounds (got ${ev})`)
  for (const e of endIncs(o)) if (!Number.isInteger(e) || e < 1 || e > MAX_END_INC) throw new Error(`oval: 1-${MAX_END_INC} increases at each end (got ${e})`)
  if (o.closed && o.kind !== 'stuffed') throw new Error('oval: only a stuffed piece is closed')
  if (o.flatness != null && (o.flatness < 0 || o.flatness > 1)) throw new Error(`oval: flatness is 0..1 (got ${o.flatness})`)
}

/** The increases at each end, per increase round. */
export function endIncs(o: ChainOvalOptions): number[] {
  if (Array.isArray(o.endInc)) {
    if (o.endInc.length !== o.rounds) throw new Error(`oval: ${o.endInc.length} end increases for ${o.rounds} rounds`)
    return o.endInc.slice()
  }
  if (typeof o.endInc === 'number') return Array.from({ length: o.rounds }, () => o.endInc as number)
  const flat = o.flatness ?? (o.kind === 'patch' ? 1 : 0.5)
  const nFlat = Math.round(o.rounds * flat)
  return Array.from({ length: o.rounds }, (_, i) => (i < nFlat ? 3 : 2))
}

/** Indices of one fan in spatial order (E1: its trailing part, then its
 *  leading part; it straddles the round's start). */
function fanOf(side: OvalSide[], which: 'E0' | 'E1'): number[] {
  const n = side.length
  if (which === 'E0') return side.map((s, i) => (s === 'E0' ? i : -1)).filter((i) => i >= 0)
  let head = 0
  while (head < n && side[head] === 'E1') head++
  let tail = 0
  while (tail < n - head && side[n - 1 - tail] === 'E1') tail++
  const out: number[] = []
  for (let i = n - tail; i < n; i++) out.push(i)
  for (let i = 0; i < head; i++) out.push(i)
  return out
}

function headTail(side: OvalSide[]): { head: number; tail: number } {
  const n = side.length
  let head = 0
  while (head < n && side[head] === 'E1') head++
  let tail = 0
  while (tail < n - head && side[n - 1 - tail] === 'E1') tail++
  return { head, tail }
}

/**
 * THE PLAN: every round's count, its ops over the round below and where each
 * stitch sits. The increases are spread evenly through each end's fan (the
 * standard "2 in each of the 3 end sts", then "(1, inc) x 3", "(2, inc) x 3"),
 * alternately offset half a step so they never stack into a column. The
 * decreases of a closed piece mirror them.
 */
export function chainOvalPlan(o: ChainOvalOptions): OvalRound[] {
  validate(o)
  const N = o.chain
  const side1: OvalSide[] = ['E1', ...Array<OvalSide>(N - 3).fill('A'), 'E0', 'E0', 'E0', ...Array<OvalSide>(N - 3).fill('B'), 'E1', 'E1']
  const out: OvalRound[] = [{ count: 2 * N, ops: [], side: side1, head: 1, tail: 2 }]
  const push = (below: OvalRound, mark: Map<number, 'inc' | 'dec'>): void => {
    const ops: ShapeOp[] = []
    const side: OvalSide[] = []
    for (let i = 0; i < below.count; i++) {
      const m = mark.get(i)
      const s = below.side[i]!
      if (m === 'dec') { ops.push('dec'); side.push(s); i++ }
      else if (m === 'inc') { ops.push('inc'); side.push(s, s) }
      else { ops.push('st'); side.push(s) }
    }
    const ht = headTail(side)
    out.push({ count: side.length, ops, side, ...ht })
  }
  const incs = endIncs(o)
  incs.forEach((e, r) => {
    const below = out[out.length - 1]!
    const mark = new Map<number, 'inc' | 'dec'>()
    const stag = (r % 2) * 0.5
    for (const which of ['E1', 'E0'] as const) {
      const F = fanOf(below.side, which)
      if (e > F.length) throw new Error(`oval: ${e} increases in an end of ${F.length} sts`)
      for (let t = 0; t < e; t++) mark.set(F[Math.floor(((t + 0.5 + stag) * F.length) / e) % F.length]!, 'inc')
    }
    push(below, mark)
  })
  for (let r = 0; r < (o.even ?? 0); r++) push(out[out.length - 1]!, new Map())
  if (o.closed) {
    incs.slice().reverse().forEach((e, r) => {
      const below = out[out.length - 1]!
      const mark = new Map<number, 'inc' | 'dec'>()
      const used = new Set<number>()
      for (const which of ['E1', 'E0'] as const) {
        const F = fanOf(below.side, which)
        if (2 * e > F.length) throw new Error(`oval: ${e} decreases in an end of ${F.length} sts`)
        for (let t = 0; t < e; t++) {
          let p = Math.floor((t * F.length) / e + (r % 2) * 0.5)
          // A decrease takes two neighbours in WORK order: never across the
          // round's start (E1's trailing and leading parts), never overlapping.
          const ok = (q: number): boolean => q >= 0 && q + 1 < F.length && F[q + 1]! === F[q]! + 1 && !used.has(F[q]!) && !used.has(F[q + 1]!)
          if (!ok(p)) {
            // The nearest free pair; an end too tight for all of them (the
            // first increase round's 3 a end, mirrored) takes one fewer, and
            // the whip-stitched seam closes the rest.
            let bestQ = -1
            for (let q = 0; q < F.length; q++) if (ok(q) && (bestQ < 0 || Math.abs(q - p) < Math.abs(bestQ - p))) bestQ = q
            p = bestQ
          }
          if (p < 0) continue
          mark.set(F[p]!, 'dec')
          used.add(F[p]!); used.add(F[p + 1]!)
        }
      }
      push(below, mark)
    })
  }
  return out
}

/** Stitch counts per round, round 1 first. */
export function chainOvalRounds(o: ChainOvalOptions): number[] {
  return chainOvalPlan(o).map((r) => r.count)
}

// ─── The words ──────────────────────────────────────────────────────────────

/** One round's ops as a designer writes them: run-length, in work order. */
function opsWords(ops: ShapeOp[]): string {
  if (ops.every((op) => op === 'st')) return 'dc in each st around'
  const runs: string[] = []
  let i = 0
  while (i < ops.length) {
    const op = ops[i]!
    let n = 1
    while (i + n < ops.length && ops[i + n] === op) n++
    if (op === 'st') runs.push(`dc in next ${n === 1 ? 'st' : `${n} sts`}`)
    else if (op === 'inc') runs.push(n === 1 ? '2 dc in next st' : `[2 dc in next st] ${n} times`)
    else runs.push(n === 1 ? 'dc2tog' : `[dc2tog] ${n} times`)
    i += n
  }
  return runs.join(', ')
}

/** Round 1, worked into both sides of the chain (UK terms). */
export function chainRoundOneWords(N: number): string {
  const sideB = N - 3
  return `Round 1: starting in the 2nd ch from the hook, dc in next ${N - 2 === 1 ? 'ch' : `${N - 2} ch`}, 3 dc in last ch; ` +
    `working along the other side of the chain, ${sideB > 0 ? `dc in next ${sideB === 1 ? 'ch' : `${sideB} ch`}, ` : ''}2 dc in next ch. (${2 * N} sts)`
}

/** The piece's words, from the same plan the build works. `what` names it
 *  ("muzzle", "belly patch"). */
export function chainOvalWords(o: ChainOvalOptions, what = 'piece'): string[] {
  const plan = chainOvalPlan(o)
  const lines: string[] = [`Foundation: ch ${o.chain}. (${o.chain} sts)`, chainRoundOneWords(o.chain)]
  for (let k = 1; k < plan.length; k++) lines.push(`Round ${k + 1}: ${opsWords(plan[k]!.ops)}. (${plan[k]!.count} sts)`)
  lines.push('Work in a continuous spiral without joining; mark the first stitch of each round (it sits at the end of the oval where you started, beside the hook end of the chain).')
  if (o.kind === 'patch') {
    lines.push(`Fasten off with a sl st in the next st, leaving a long tail for sewing. Do not stuff: the ${what} lies flat${endIncs(o).some((e) => e < 3) ? ' and softly cupped' : ''}, the right side (the side facing you as you worked) out.`)
  } else if (o.closed) {
    lines.push('Stuff firmly as you go. Fasten off, leaving a tail; flatten the last round along the line of the chain and whip-stitch it closed.')
  } else {
    lines.push(`Fasten off, leaving a long tail for sewing. Stuff the ${what} lightly as you sew it on by its last round.`)
  }
  return lines
}

// ─── The geometry ───────────────────────────────────────────────────────────

/** Meridian advance a round, x the row pitch (the sphere's drift). */
const DRIFT_SCALE = 1.05
/** A foundation chain stitch is a little narrower than an sc's pitch. */
const CHAIN_PITCH = 0.9
const SURFACE_LAY = 1
const BACK_CROSS = 1

interface V3 { x: number; y: number; z: number }

/** The stadium's core: v in [0, 4) round it (0 = the round-start end, +x;
 *  1.5-2.5 = the far end, ch 1). Point on the core and the outward planar
 *  normal there. */
function coreAt(v: number, c: number): { x: number; y: number; nx: number; ny: number } {
  const w = ((v % 4) + 4) % 4
  if (w < 0.5) { const t = w * Math.PI; return { x: c, y: 0, nx: Math.cos(t), ny: Math.sin(t) } }
  if (w < 1.5) return { x: c - (w - 0.5) * 2 * c, y: 0, nx: 0, ny: 1 }
  if (w < 2.5) { const t = Math.PI / 2 + (w - 1.5) * Math.PI; return { x: -c, y: 0, nx: Math.cos(t), ny: Math.sin(t) } }
  if (w < 3.5) return { x: -c + (w - 2.5) * 2 * c, y: 0, nx: 0, ny: -1 }
  const t = 1.5 * Math.PI + (w - 3.5) * Math.PI
  return { x: c, y: 0, nx: Math.cos(t), ny: Math.sin(t) }
}

/** Arc length along the stadium at offset rho -> v (unwrapped). */
function vOfS(s: number, rho: number, c: number): number {
  const q = (Math.PI * Math.max(rho, 1e-6)) / 2
  const L = 2 * c
  const P = 4 * q + 2 * L
  const turns = Math.floor(s / P)
  let r = s - turns * P
  let v: number
  if (r < q) v = (r / q) * 0.5
  else if ((r -= q) < L) v = 0.5 + r / (L || 1)
  else if ((r -= L) < 2 * q) v = 1.5 + r / (2 * q)
  else if ((r -= 2 * q) < L) v = 2.5 + r / (L || 1)
  else v = 3.5 + ((r - L) / q) * 0.5
  return turns * 4 + v
}

/** v (unwrapped) -> arc length along the stadium at offset rho. */
function sOfV(v: number, rho: number, c: number): number {
  const q = (Math.PI * Math.max(rho, 1e-6)) / 2
  const L = 2 * c
  const P = 4 * q + 2 * L
  const turns = Math.floor(v / 4)
  const w = v - turns * 4
  let s: number
  if (w < 0.5) s = (w / 0.5) * q
  else if (w < 1.5) s = q + (w - 0.5) * L
  else if (w < 2.5) s = q + L + (w - 1.5) * 2 * q
  else if (w < 3.5) s = 3 * q + L + (w - 2.5) * L
  else s = 3 * q + 2 * L + ((w - 3.5) / 0.5) * q
  return turns * P + s
}

/** The representative of v (mod 4) nearest to `near`. */
function nearV(v: number, near: number): number {
  return v + 4 * Math.round((near - v) / 4)
}

export interface ChainOvalGeometry {
  /** Core half-length (mm): the chain's two end stitches at +-c. */
  c: number
  /** Per round: offset (mm), meridian position of its crowns (mm). */
  rho: number[]
  ly: number[]
  /** The profile at a meridian position: offset, height, unit tangent. */
  at: (ly: number) => { rho: number; z: number; tr: number; tz: number }
}

/** The surface the counts make (see the file header, step 3). */
export function chainOvalGeometry(o: ChainOvalOptions, yr: number): ChainOvalGeometry {
  const counts = chainOvalRounds(o)
  const sw = yr * STITCHES.sc.gaugeYr
  const drift = yr * rowPitchYr('sc') * DRIFT_SCALE
  const c = ((o.chain - 2) * CHAIN_PITCH * sw) / 2
  const rho = counts.map((n) => Math.max(yr * 0.3, (n * sw - 4 * c) / (2 * Math.PI)))
  const pts: { r: number; z: number }[] = [{ r: 0, z: 0 }]
  for (let k = 0; k < rho.length; k++) {
    const prev = pts[pts.length - 1]!
    const dr = rho[k]! - prev.r
    pts.push({ r: rho[k]!, z: prev.z - Math.sqrt(Math.max(drift * drift - dr * dr, 0)) })
  }
  // A closed piece is sewn shut along the chain's line under its last round.
  if (o.closed) {
    const last = pts[pts.length - 1]!
    pts.push({ r: 0, z: last.z - Math.sqrt(Math.max(drift * drift - last.r * last.r, (0.25 * drift) ** 2)) })
  }
  let P = pts
  for (let pass = 0; pass < 2; pass++) {
    const Q = [P[0]!]
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i]!, b = P[i + 1]!
      Q.push({ r: a.r * 0.75 + b.r * 0.25, z: a.z * 0.75 + b.z * 0.25 })
      Q.push({ r: a.r * 0.25 + b.r * 0.75, z: a.z * 0.25 + b.z * 0.75 })
    }
    Q.push(P[P.length - 1]!)
    P = Q
  }
  // Sit it above the table.
  const lift = yr * 2 - Math.min(...P.map((p) => p.z))
  for (const p of P) p.z += lift
  const cum: number[] = [0]
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1]! + Math.hypot(P[i]!.r - P[i - 1]!.r, P[i]!.z - P[i - 1]!.z))
  const S = cum[cum.length - 1]!
  // The fabric's meridian length: one round of drift each (and, closed, the
  // seam under the last round).
  const Lf = drift * (counts.length + (o.closed ? 1 : 0))
  const at = (ly: number): { rho: number; z: number; tr: number; tz: number } => {
    if (ly <= 0) return { rho: ly, z: P[0]!.z, tr: 1, tz: 0 }
    const s = (ly / Lf) * S
    let i = 1
    while (i < cum.length - 1 && cum[i]! < s) i++
    const a = P[i - 1]!, b = P[i]!
    const seg = cum[i]! - cum[i - 1]! || 1
    const t = (s - cum[i - 1]!) / seg
    const L = Math.hypot(b.r - a.r, b.z - a.z) || 1
    return { rho: Math.max(0, a.r + (b.r - a.r) * t), z: a.z + (b.z - a.z) * t, tr: (b.r - a.r) / L, tz: (b.z - a.z) / L }
  }
  return { c, rho, ly: counts.map((_, k) => drift * (k + 1)), at }
}

/**
 * Build an oval worked round a foundation chain. Result: frame 'surface' with
 * every node's own frame (`model.frame3`), the chain the only pinned nodes,
 * one strand, `model.round` / `nodeRow` the worked round (-1 the chain), in
 * the local frame of the file header. Not relaxed.
 */
export function buildChainOval(o: ChainOvalOptions, yarnRadiusMm: number): BuiltContinuous {
  const plan = chainOvalPlan(o)
  const yr = yarnRadiusMm
  const N = o.chain
  const G = chainOvalGeometry(o, yr)
  const { c } = G
  const sw = yr * STITCHES.sc.gaugeYr
  const chw = CHAIN_PITCH * sw
  const dims = dimsFor(yr, 'sc')
  const { zh } = dims
  const headLoopMm = yr * (STITCHES.sc.headLoopYr ?? 0)
  const crownNz = headApexRelief(zh, SURFACE_LAY)

  const S = createStrand()
  const { nodes, push } = S
  const frame3: { m: V3; n: V3 }[] = []
  const roundArr: number[] = []
  let roundNow = -1
  const surf = (v: number, ly: number, lz: number): V3 => {
    const q = G.at(ly)
    const k = coreAt(v, c)
    const N3 = { x: -q.tz * k.nx, y: -q.tz * k.ny, z: q.tr }
    frame3.push({ m: { x: q.tr * k.nx, y: q.tr * k.ny, z: q.tz }, n: N3 })
    roundArr.push(roundNow)
    return { x: k.x + q.rho * k.nx + N3.x * lz, y: k.y + q.rho * k.ny + N3.y * lz, z: q.z + N3.z * lz }
  }
  const mkPlace3 = (rhoK: number) => (lx: number, ly: number, lz: number): V3 => surf(vOfS(lx, rhoK, c), ly, lz)

  // ── THE FOUNDATION CHAIN (pinned: the anchor) ──
  // Chain c (0 = the first made, the slip-knot end, at x = -c) has an A loop
  // (+y, the side round 1 works first) and a B loop (-y, the other side); ch
  // N-1, the one next to the hook, is the turning chain beyond the +x end.
  const z0 = G.at(0).z
  const zc = zh * 0.5
  const pin = (x: number, y: number, z: number, m: V3): number => {
    frame3.push({ m, n: { x: 0, y: 0, z: 1 } })
    roundArr.push(-1)
    return push(x, y, z, 0)
  }
  const chainA: number[] = []
  const chainB: number[] = []
  const xOf = (i: number): number => -c + i * chw
  const endNode = pin(xOf(0) - chw * 0.45, 0, z0 + zc * 0.6, { x: -1, y: 0, z: 0 })
  for (let i = 0; i < N; i++) {
    const x = i < N - 1 ? xOf(i) : c + chw * 0.75
    chainB.push(pin(x - chw * 0.18, -yr * 0.55, z0 + zc, { x: 0, y: -1, z: 0 }))
    chainA.push(pin(x + chw * 0.18, yr * 0.55, z0 + zc, { x: 0, y: 1, z: 0 }))
    if (i < N - 1) pin(x + chw * 0.5, 0, z0 + zc * 0.6, { x: 1, y: 0, z: 0 })
  }
  const anchorPins = nodes.length

  interface Crown { back: number; front: number; v: number; ly: number }
  let below: Crown[] = []
  // ── THE ROUNDS ──
  for (let k = 0; k < plan.length; k++) {
    const R = plan[k]!
    const n = R.count
    const rhoK = G.rho[k]!
    const P = 4 * ((Math.PI * rhoK) / 2) + 4 * c
    const cStar = (R.head - R.tail) / 2
    const sAt = (i: number): number => ((i + 0.5 - cStar) * P) / n
    const lyK = G.ly[k]!
    const lyB = k === 0 ? 0 : G.ly[k - 1]!
    roundNow = k
    const place3 = mkPlace3(rhoK)
    const crowns: Crown[] = []
    if (k === 0) {
      // Round 1 wraps the chain: stitch i's chain loop, in the order worked.
      const target = (i: number): number => {
        if (i === 0) return chainA[N - 2]!
        if (i <= N - 3) return chainA[N - 2 - i]!
        if (i <= N) return endNode
        if (i <= 2 * N - 3) return chainB[i - N]!
        return chainB[N - 2]!
      }
      for (let i = 0; i < n; i++) {
        const xC = sAt(i)
        const r = emitPlainStitch(S, dims, {
          j: k, c: i, id: 'sc', s: 1, fz: 1, by: lyB, ty: lyK, xCrown: xC, xHook: xC,
          bcBack: target(i), bcFront: target(i), cyBelow: dims.dh + yr * 0.15, bcNormalZ: zc, place3,
          linkRole: 'ring', headLoopMm, surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
        })
        crowns.push({ back: r.crownBack, front: r.crownFront, v: vOfS(xC, rhoK, c), ly: lyK })
      }
    } else {
      let bi = 0
      let li = 0
      const sNear = (b: Crown, xC: number): number => sOfV(nearV(b.v, vOfS(xC, rhoK, c)), rhoK, c)
      for (let oi = 0; oi < R.ops.length; oi++) {
        const op = R.ops[oi]!
        if (op === 'dec') {
          const b1 = below[bi++]!
          const b2 = below[bi++]!
          const xC = sAt(li)
          const r = emitDecrease(S, dims, {
            j: k, c: oi, id: 'sc', s: 1, fz: 1, by: lyB, ty: lyK, xCrown: xC,
            b1: { back: b1.back, front: b1.front, x: sNear(b1, xC) },
            b2: { back: b2.back, front: b2.front, x: sNear(b2, xC) },
            cy1: b1.ly, cy2: b2.ly, bn1: crownNz, bn2: crownNz, place3, headLoopMm,
            surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
          })
          crowns.push({ back: r.crown, front: r.crown, v: vOfS(xC, rhoK, c), ly: lyK })
          li++
          continue
        }
        const b = below[bi++]!
        const m = op === 'inc' ? 2 : 1
        for (let t = 0; t < m; t++) {
          const xC = sAt(li)
          const hookOff = m === 2 ? yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1) : 0
          const r = emitPlainStitch(S, dims, {
            j: k, c: oi, id: 'sc', s: 1, fz: 1, by: lyB, ty: lyK, xCrown: xC, xHook: sNear(b, xC) + hookOff,
            bcBack: b.back, bcFront: b.front, cyBelow: b.ly, bcNormalZ: crownNz, place3,
            hookDepthScale: m === 2 && t === 1 ? 1.5 : 1, headLoopMm, surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
          })
          crowns.push({ back: r.crownBack, front: r.crownFront, v: vOfS(xC, rhoK, c), ly: lyK })
          li++
        }
      }
      if (bi !== below.length) throw new Error(`oval round ${k + 1}: consumed ${bi} of ${below.length}`)
    }
    below = crowns
  }

  // ── FASTEN OFF ──
  {
    const kEnd = plan.length - 1
    roundNow = kEnd
    const rhoE = G.rho[kEnd]!
    const placeEnd = mkPlace3(rhoE)
    const lyE = G.ly[kEnd]!
    const drift = yr * rowPitchYr('sc') * DRIFT_SCALE
    for (let t = 1; t <= 4; t++) {
      const sx = (0.012 * t) * (4 * ((Math.PI * rhoE) / 2) + 4 * c)
      // Closed: the tail runs into the sewn seam under the last round; open
      // or a patch: woven back along the edge.
      const ly = o.closed ? lyE + drift * 0.22 * t : lyE - drift * 0.12 * t
      const p = placeEnd(sx, ly, yr * (0.3 - 0.25 * t))
      push(p.x, p.y, p.z)
    }
  }

  if (frame3.length !== nodes.length || roundArr.length !== nodes.length) throw new Error(`oval frame capture out of sync: ${frame3.length} / ${roundArr.length} for ${nodes.length}`)
  const halfX = c + Math.max(...G.rho) + yr * 3
  const halfY = Math.max(...G.rho) + yr * 3
  return {
    model: { nodes, dist: S.dist, bend: S.bend, strand: new Array(nodes.length).fill(0), along: nodes.map((_, i) => i), frame3, round: roundArr },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: halfX * 2,
    heightMm: halfY * 2,
    anchorPins,
    frame: 'surface',
    nodeRow: roundArr.slice(),
  }
}

/** Relax as worked (the blocked hold along each node's own meridian), a patch
 *  lying on the table, a stuffed piece in the air. */
export function relaxChainOval(built: BuiltContinuous, o: ChainOvalOptions, yr: number, iterations = 560): void {
  relax(built.model, {
    collMinDist: yr * 1.25, collK: 0.28, collAdjacency: 9, planeZ: 0, planeK: 0,
    layoutK: 0.06, layoutMode: 'surface',
    ...(o.kind === 'patch' ? { floorZ: 0 } : {}),
    iterations,
  })
}

// ─── Measuring ──────────────────────────────────────────────────────────────

export interface ChainOvalMetrics {
  /** Settled extents (mm): along the chain, across it, and out of it (the
   *  dome's depth). */
  widthMm: number
  heightMm: number
  depthMm: number
  /** The outline seen square on (looking down local z), measured with the
   *  cute check's own contour code (rules 33 / 34): sharp convex corners and
   *  the longest straight run over the reference width (the piece's own, or
   *  the head's when given: the cute check's scale). */
  corners: number
  straightRunToWidth: number
  /** Concentric rounds: every round's crowns go once round the middle in
   *  order (each round's angle round the centre never turns back by more
   *  than a stitch), and every round lies outside the one before. */
  concentric: boolean
  /** The worst backward step of a round's crowns round the centre (deg) and
   *  the smallest growth of a round's mean distance from the centre (mm). */
  worstBackDeg: number
  minGrowthMm: number
}

/** Measure a built (and relaxed) oval in its own frame. */
export function chainOvalMetrics(o: ChainOvalOptions, built: BuiltContinuous, refWidthMm?: number): ChainOvalMetrics {
  const yr = built.yarnRadiusMm
  const nodes = built.model.nodes.slice(built.anchorPins)
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity
  for (const n of nodes) {
    x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); z0 = Math.min(z0, n.z); z1 = Math.max(z1, n.z)
  }
  const W = x1 - x0
  // The outline: every yarn as a yarn-thick capsule, ~310 px across.
  const px = 310
  const cell = W / px
  const R = new FrontRaster(x0 - 4 * yr, y0 - 4 * yr, cell, x1 + 4 * yr, y1 + 4 * yr)
  const all = built.model.nodes
  R.polyline(built.strandPath.map((i) => ({ u: all[i]!.x, z: all[i]!.y, w: all[i]!.z })), yr)
  R.fillHoles()
  // Corners and straight runs are judged against `refWidthMm` (the width the
  // cute check scales them by: the head's, for a piece on the face), the
  // piece's own width when absent.
  const soft = outlineSoftness(R.outline(), refWidthMm ? (px * refWidthMm) / W : px, () => true)
  // Concentric rounds: the crowns of each round (its nodes, a stitch's worth
  // of smoothing) round the piece's middle.
  const round = built.model.round ?? []
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  const plan = chainOvalPlan(o)
  let worstBack = 0
  let minGrowth = Infinity
  let prevMean = -Infinity
  for (let k = 0; k < plan.length; k++) {
    const pts = all.map((p, i) => ({ p, i })).filter((q) => round[q.i] === k && q.i < all.length - 4)
    if (!pts.length) continue
    const mean = pts.reduce((a, q) => a + Math.hypot(q.p.x - cx, q.p.y - cy), 0) / pts.length
    // An increase round lies outside the one before; a round worked even
    // stacks on it (a wall) and a decrease round comes back in.
    if (k > 0 && plan[k]!.count > plan[k - 1]!.count) minGrowth = Math.min(minGrowth, mean - prevMean)
    prevMean = mean
    // The round's path round the middle, smoothed over a stitch's nodes.
    const per = Math.max(1, Math.round(pts.length / plan[k]!.count))
    let ang = Math.atan2(pts[0]!.p.y - cy, pts[0]!.p.x - cx)
    let unwrapped = 0
    const series: number[] = []
    for (let j = 0; j < pts.length; j += per) {
      let sx = 0, sy = 0, m = 0
      for (let d = j; d < Math.min(pts.length, j + per); d++) { sx += pts[d]!.p.x; sy += pts[d]!.p.y; m++ }
      const a = Math.atan2(sy / m - cy, sx / m - cx)
      let da = a - ang
      while (da > Math.PI) da -= 2 * Math.PI
      while (da < -Math.PI) da += 2 * Math.PI
      unwrapped += da
      ang = a
      series.push(unwrapped)
    }
    let peak = -Infinity
    for (const v of series) {
      peak = Math.max(peak, v)
      worstBack = Math.max(worstBack, ((peak - v) * 180) / Math.PI)
    }
  }
  const stitchDeg = 360 / Math.max(...plan.map((r) => r.count)) * 2
  return {
    widthMm: W, heightMm: y1 - y0, depthMm: z1 - z0,
    corners: soft.sharpCorners, straightRunToWidth: soft.straightRunToW,
    concentric: worstBack <= Math.max(stitchDeg, 25) && minGrowth > 0,
    worstBackDeg: worstBack, minGrowthMm: Number.isFinite(minGrowth) ? minGrowth : 0,
  }
}

/**
 * The audit on the piece AS IT NOW LIES (after the composition draped it onto
 * the face): each node's frame is its built frame turned with the fabric —
 * the normal is the smallest principal axis of the settled neighbourhood
 * (3 yarn radii), on the same side as the built normal, and the meridian is
 * the built meridian laid into that tangent plane. Then the same audit.
 */
export function auditChainOvalSettled(built: BuiltContinuous, yr: number): string[] {
  const nodes = built.model.nodes
  const f3 = built.model.frame3
  if (!f3) return auditProblems({ built, recipe: undefined as never }, 'chain oval', 0, yr)
  const R = yr * 3
  const key = (x: number, y: number, z: number): string => `${Math.floor(x / R)},${Math.floor(y / R)},${Math.floor(z / R)}`
  const grid = new Map<string, number[]>()
  nodes.forEach((p, i) => { const k = key(p.x, p.y, p.z); const a = grid.get(k); if (a) a.push(i); else grid.set(k, [i]) })
  const frame: { m: V3; n: V3 }[] = nodes.map((p, i) => {
    const cx = Math.floor(p.x / R), cy = Math.floor(p.y / R), cz = Math.floor(p.z / R)
    let mx = 0, my = 0, mz = 0, k = 0
    const nb: number[] = []
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        const q = nodes[j]!
        if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 > R * R) continue
        nb.push(j); mx += q.x; my += q.y; mz += q.z; k++
      }
    }
    mx /= k; my /= k; mz /= k
    let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
    for (const j of nb) {
      const a = nodes[j]!.x - mx, b = nodes[j]!.y - my, c = nodes[j]!.z - mz
      xx += a * a; xy += a * b; xz += a * c; yy += b * b; yz += b * c; zz += c * c
    }
    const tr = xx + yy + zz
    const n0 = f3[i]!.n
    let v = { ...n0 }
    for (let it = 0; it < 30; it++) {
      const w = { x: tr * v.x - (xx * v.x + xy * v.y + xz * v.z), y: tr * v.y - (xy * v.x + yy * v.y + yz * v.z), z: tr * v.z - (xz * v.x + yz * v.y + zz * v.z) }
      const l = Math.hypot(w.x, w.y, w.z) || 1
      v = { x: w.x / l, y: w.y / l, z: w.z / l }
    }
    if (v.x * n0.x + v.y * n0.y + v.z * n0.z < 0) v = { x: -v.x, y: -v.y, z: -v.z }
    const m0 = f3[i]!.m
    const d = m0.x * v.x + m0.y * v.y + m0.z * v.z
    const m = { x: m0.x - d * v.x, y: m0.y - d * v.y, z: m0.z - d * v.z }
    const ml = Math.hypot(m.x, m.y, m.z) || 1
    return { n: v, m: { x: m.x / ml, y: m.y / ml, z: m.z / ml } }
  })
  return auditProblems({ built: { ...built, model: { ...built.model, frame3: frame } }, recipe: undefined as never }, 'chain oval', 0, yr)
}

export interface ChainOvalBuild {
  built: BuiltContinuous
  problems: string[]
  metrics: ChainOvalMetrics
}

/** Build, relax and audit one oval in its own frame. */
export function buildChainOvalPiece(o: ChainOvalOptions, yr: number): ChainOvalBuild {
  const built = buildChainOval(o, yr)
  relaxChainOval(built, o, yr)
  const problems = auditProblems({ built, recipe: undefined as never }, 'chain oval', 0, yr)
  return { built, problems, metrics: chainOvalMetrics(o, built) }
}

/**
 * Designing an oval from the size wanted (mm): how a designer picks the chain
 * and the rounds. The rounds set the height (twice the offset round the chain);
 * the chain sets how much wider than tall it is. `depthMm` (stuffed) is how far
 * it stands out; it is reached with dome rounds (2 at each end) and rounds
 * worked even. Returns the options; the build measures what they make.
 */
export function designChainOval(want: { widthMm: number; heightMm: number; depthMm?: number; kind: ChainOvalKind; closed?: boolean }, yr: number): ChainOvalOptions {
  const sw = yr * STITCHES.sc.gaugeYr
  const drift = yr * rowPitchYr('sc') * DRIFT_SCALE
  // Half the height is the last round's offset; one yarn's thickness each side.
  const rhoWant = Math.max(drift, want.heightMm / 2 - yr)
  const totalRounds = Math.max(1, Math.round(rhoWant / drift))
  const c = Math.max(0, (want.widthMm - want.heightMm) / 2)
  const chain = Math.max(3, Math.round((2 * c) / (CHAIN_PITCH * sw)) + 2)
  if (want.kind === 'patch') return { kind: 'patch', chain, rounds: totalRounds - 1, endInc: 3 }
  // A stuffed piece: flat rounds (3 increases at each end) widen it fast,
  // dome rounds (2 at each end) climb as they widen, rounds worked even climb
  // a whole round each. Pick the mix whose built surface (the same geometry
  // the build places) reaches the height and the depth asked, fewest rounds
  // breaking a tie.
  const depthWant = Math.max(0, want.depthMm ?? want.heightMm * 0.3)
  let best: ChainOvalOptions | undefined
  let bestCost = Infinity
  for (let F = 0; F <= 10; F++) for (let D = 0; D <= 12; D++) for (let E = 0; E <= 10; E++) {
    if (F + D < 1) continue
    const o: ChainOvalOptions = { kind: 'stuffed', chain, rounds: F + D, endInc: [...Array<number>(F).fill(3), ...Array<number>(D).fill(2)], even: E, ...(want.closed ? { closed: true } : {}) }
    const G = chainOvalGeometry(o, yr)
    const rhoEnd = G.rho[G.rho.length - 1]!
    const depth = G.at(0).z - G.at(G.ly[G.ly.length - 1]!).z
    const cost = ((rhoEnd - rhoWant) / sw) ** 2 + 0.5 * ((depth - depthWant) / drift) ** 2 + 0.02 * (F + D + E)
    if (cost < bestCost) { bestCost = cost; best = o }
  }
  return best!
}

// ─── As a composition part ──────────────────────────────────────────────────

/**
 * One oval as a composition part (a custom piece: built, relaxed and audited
 * here, in the frame of the file header). A patch is draped flat onto its
 * parent (`form: 'disc'`); an open stuffed piece is seated by its open last
 * round (`place.dir`, `poleIn` false) with the dome along `aim` and the chain
 * across along `spin`, then draped so its rim follows the face
 * (`CustomPiece.drape`); either is re-audited where it lies. A closed piece
 * is placed whole like any closed piece.
 */
export function chainOvalPart(
  o: ChainOvalOptions,
  base: {
    name: string; colourHex: string; place: PartPlacement; sewNote?: string; what?: string
    colourChanges?: AmigurumiPart['colourChanges']; words?: string[]
    /** The assembly line for this piece (the pattern's own when absent). */
    joinWords?: string
  },
): AmigurumiPart {
  const rounds = chainOvalRounds(o)
  return {
    name: base.name,
    stitch: 'sc',
    rounds,
    colourHex: base.colourHex,
    words: base.words ?? chainOvalWords(o, base.what ?? base.name),
    ...(base.sewNote ? { sewNote: base.sewNote } : {}),
    ...(base.joinWords != null ? { joinWords: base.joinWords } : {}),
    ...(base.colourChanges ? { colourChanges: base.colourChanges } : {}),
    ...(o.kind === 'patch' ? { form: 'disc' as const } : {}),
    place: base.place,
    custom: {
      build: (yr: number) => {
        const b = buildChainOvalPiece(o, yr)
        // Re-audited where it lies once draped onto its parent (a patch, or
        // a muzzle's open round sewn round the face).
        // A patch, and a stuffed piece open at its last round, are draped
        // onto the parent's surface (their rim follows the face); a closed
        // piece is placed whole.
        return { built: b.built, problems: b.problems, audit: (bb) => auditChainOvalSettled(bb, yr), ...(o.closed ? {} : { drape: true }) }
      },
    },
  }
}

/** The azimuth (local, round the z axis) `step` stitch pitches on from
 *  stadium position `vWant` along round `round` (1-based), on the build's own
 *  placement of that round. (Not snapped to a stitch: the spiral staggers each
 *  round's stitches by up to half a pitch, which would set a symmetric motif
 *  crooked.) */
function spotTh(o: ChainOvalOptions, yr: number, round: number, vWant: number, step: number): { round: number; th: number } {
  const counts = chainOvalRounds(o)
  const k = Math.max(0, Math.min(counts.length - 1, Math.round(round) - 1))
  const G = chainOvalGeometry(o, yr)
  const rhoK = G.rho[k]!
  const { c } = G
  const P = 4 * ((Math.PI * rhoK) / 2) + 4 * c
  const v = vOfS(sOfV(vWant, rhoK, c) + step * (P / counts[k]!) + P, rhoK, c)
  const q = coreAt(v, c)
  return { round: k + 1, th: Math.atan2(q.y + rhoK * q.ny, q.x + rhoK * q.nx) }
}

/**
 * A spot on the oval for embroidery (faceEmbroidery `SurfaceSpot`), counted
 * the way the oval is made: on `round` (1-based, out from the chain), at the
 * stitch at the very end of that round's `end` fan (E1 the round-start end,
 * local +x; E0 the far end, ch 1, local -x), then `stOffset` stitches round
 * the oval toward local `side` y (+1 or -1). The azimuth is read off the
 * build's geometry, since an oval's stitches are not spread evenly round it.
 */
export function chainOvalSpot(o: ChainOvalOptions, yr: number, round: number, end: 'E0' | 'E1', stOffset: number, side: 1 | -1 = -1): { round: number; st: number; th: number } {
  // Round the E1 end the work runs toward +y; round the far end toward -y.
  const s = spotTh(o, yr, round, end === 'E1' ? 0 : 2, side * (end === 'E1' ? 1 : -1) * stOffset)
  return { round: s.round, st: 0, th: s.th }
}

/**
 * A spot on one long side of the oval: on `round`, at the stitch over the
 * middle of the chain on the `side` y side (+1 the side round 1 works first,
 * -1 the other), then `stOffset` stitches along toward local +x.
 */
export function chainOvalSideSpot(o: ChainOvalOptions, yr: number, round: number, side: 1 | -1, stOffset: number): { round: number; st: number; th: number } {
  // Along the +y side the work runs toward -x; along the -y side toward +x.
  const s = spotTh(o, yr, round, side > 0 ? 1 : 3, (side > 0 ? -1 : 1) * stOffset)
  return { round: s.round, st: 0, th: s.th }
}

/** The stadium position v (in [0, 4)) of the local point (x, y) about the
 *  core (the inverse of coreAt's direction). */
function vOfPoint(x: number, y: number, c: number): number {
  if (Math.abs(x) <= c) return y < 0 ? 2.5 + (x + c) / (2 * c || 1) : 0.5 + (c - x) / (2 * c || 1)
  const t = Math.atan2(y, x > 0 ? x - c : x + c)
  if (x > 0) return t >= 0 ? t / Math.PI : 4 + t / Math.PI
  return 1.5 + ((t < 0 ? t + 2 * Math.PI : t) - Math.PI / 2) / Math.PI
}

export interface ChainOvalNostrilOptions {
  /** How far down from the oval's top edge as seen, as a fraction of its seen
   *  height (0.3-0.5). Default 0.4 on the planned dome, 0.37 `asMade`. */
  down?: number
  /** How far in from each side, as a fraction of its width. Default 0.25. */
  inFrac?: number
  /** Mark length as seen, as a fraction of the seen height. Default 0.14. */
  length?: number
  /** The lean (degrees), top end inward. Default 28. */
  leanDeg?: number
  /** Parallel strands side by side (1 a slanted mark, 2 a rounded oval). Default 2. */
  strands?: 1 | 2
  /** Strand spacing (mm), centre to centre. Default 1.1. */
  strandMm?: number
  /** How far the muzzle's aim points DOWN from the line it is seen along
   *  (degrees; a muzzle set low on the face aims down, so its top half shows
   *  more and the chain sits low in the outline seen). Default 0. For a toy
   *  in the listing photo: `ovalViewTiltDeg` (its aim, the head's pitch and
   *  the listing camera). */
  viewTiltDeg?: number
  /** Place on the oval as it is MADE (engine-1107): its height per round
   *  read off the stuffed, relaxed build (`chainOvalRoundHeights`) instead
   *  of the planned dome. A stuffed oval stands taller at its walls and
   *  flatter over the top than the plan, so seen from above its top half
   *  shows less. Default false (the planned dome; no build). */
  asMade?: boolean
  /** The face the oval is draped onto (a stuffed oval sewn by its last
   *  round, `CustomPiece.drape`), as its radii of curvature across and up it
   *  (mm; one number = a sphere): its rim follows that curve, so its edges
   *  fall back from the viewer. For a head worked in the round:
   *  `wornHostRadii`. Absent = a flat face. */
  hostRadiusMm?: number | { across: number; up: number }
}

/** The listing photo's camera tilt (degrees, 90 = level): photo 'v3', the
 *  listing preset (soft-light-1027, `HERO_PHOTO_LISTING_BY.windowsill.
 *  photoTiltDeg` in render/blenderScene.ts, 83 = looking down 7 deg). The
 *  rule-calib r1 and engine-shapes renders used the same tilt under v2. Kept
 *  here (not imported) until that branch is merged; the render owns it. */
export const LISTING_CAMERA_TILT_DEG = 83

/**
 * How far a piece's aim points DOWN from the line the listing camera sees it
 * along (degrees), for any toy: the aim's own angle below level, plus the
 * head's pitch in the program (+ = nodded down; 0 when the preset's face
 * directions already carry it), plus how far the camera looks down
 * (90 - `cameraTiltDeg`). engine-1107: replaces the cow's hand-fitted
 * `COW_NOSTRIL_VIEW_EXTRA_DEG` (28 deg), which stood in for the camera
 * (7 deg) and for the planned dome's error against the made, draped muzzle
 * (`asMade`, `hostRadiusMm`).
 */
export function ovalViewTiltDeg(aim: { x: number; y: number; z: number }, opts: { headPitchDeg?: number; cameraTiltDeg?: number } = {}): number {
  const below = (Math.atan2(-aim.z, Math.hypot(aim.x, aim.y)) * 180) / Math.PI
  return below + (opts.headPitchDeg ?? 0) + (90 - (opts.cameraTiltDeg ?? LISTING_CAMERA_TILT_DEG))
}

/**
 * The face a piece is draped onto, for a head worked in the round: its radius
 * of curvature ACROSS the face and UP it (mm), at the head's widest round,
 * over `spanMm` either side (the piece's half-size). Round the head's axis it
 * is the widest round's radius (its circumference over 2 pi); along the axis
 * it is the meridian's, from the counts (each round one round of fabric on
 * from the last: what the radius does not use, length does), so straight
 * rounds read flat. `axis`: which way the head's axis runs on the face
 * ('across' for a head worked side to side, the cow's; 'up' for one worked
 * from the crown down).
 */
export function wornHostRadii(rounds: number[], yr: number, axis: 'across' | 'up', spanMm: number): { across: number; up: number } {
  const sw = yr * STITCHES.sc.gaugeYr
  const drift = yr * rowPitchYr('sc') * DRIFT_SCALE
  const r = rounds.map((n) => (n * sw) / (2 * Math.PI))
  const z: number[] = [0]
  for (let k = 1; k < r.length; k++) z.push(z[k - 1]! + Math.sqrt(Math.max(drift * drift - (r[k]! - r[k - 1]!) ** 2, 0)))
  const R = Math.max(...r)
  // The widest band's middle, then how far the profile falls in by spanMm
  // either way along the axis: the meridian's sag s^2 / 2 rho.
  const wide = r.map((v, k) => (v >= R - 1e-9 ? z[k]! : NaN)).filter(Number.isFinite)
  const mid = (Math.min(...wide) + Math.max(...wide)) / 2
  const rAt = (zz: number): number => {
    if (zz <= z[0]!) return r[0]!
    for (let k = 1; k < z.length; k++) if (zz <= z[k]!) return r[k - 1]! + ((r[k]! - r[k - 1]!) * (zz - z[k - 1]!)) / (z[k]! - z[k - 1]! || 1)
    return r[r.length - 1]!
  }
  const fall = (R - rAt(mid - spanMm) + R - rAt(mid + spanMm)) / 2
  const meridian = fall > 1e-6 ? Math.max(R, (spanMm * spanMm) / (2 * fall)) : 1e6
  return axis === 'across' ? { across: meridian, up: R } : { across: R, up: meridian }
}

const ROUND_HEIGHTS = new Map<string, { top: number[]; offset: number[]; edge: number }>()
/**
 * The oval as it is made, read off the stuffed, relaxed build in its own
 * frame (the same build the composition sews on, before it is draped):
 * `top`, the height (local z, mm) of the outer fabric over the chain (index
 * 0) and over each round (index k = round k: its highest yarn, the crowns
 * the eye sees); `offset`, how far each round's crowns lie out from the
 * chain along its straight sides (mm; the stuffing pushes them a little past
 * the plan's); `edge`, the lowest yarn of the last round (the edge sewn to
 * the face). Memoised per options and yarn: the build takes seconds.
 */
export function chainOvalRoundHeights(o: ChainOvalOptions, yr: number): { top: number[]; offset: number[]; edge: number } {
  const key = `${JSON.stringify(o)}@${yr}`
  const hit = ROUND_HEIGHTS.get(key)
  if (hit) return hit
  const built = buildChainOval(o, yr)
  relaxChainOval(built, o, yr)
  const round = built.model.round ?? []
  const n = chainOvalRounds(o).length
  const top = new Array<number>(n + 1).fill(-Infinity)
  const offset = new Array<number>(n + 1).fill(0)
  const G = chainOvalGeometry(o, yr), c = G.c
  let edge = Infinity
  built.model.nodes.forEach((p, i) => {
    // model.round: 0-based worked round, -1 the chain.
    const k = round[i] ?? -1
    const j = k < 0 ? 0 : k + 1
    if (j > n) return
    top[j] = Math.max(top[j]!, p.z)
    if (j && Math.abs(p.x) <= c) offset[j] = Math.max(offset[j]!, Math.abs(p.y))
    if (j === n) edge = Math.min(edge, p.z)
  })
  for (let j = 0; j <= n; j++) if (!Number.isFinite(top[j]!)) top[j] = j ? top[j - 1]! : 0
  for (let j = 1; j <= n; j++) if (!offset[j]) offset[j] = G.rho[j - 1]!
  const out = { top, offset, edge: Number.isFinite(edge) ? edge : top[n]! }
  ROUND_HEIGHTS.set(key, out)
  return out
}

/**
 * THE OVAL MUZZLE'S NOSTRILS, a default for any muzzle worked round a chain
 * (engine-shapes-1107 follow-up, Fable 7 Nov): one short slanted oval each
 * side, on the upper half of the oval as seen (`down` of its seen height
 * down from the top edge; local -y is the top), a quarter of its width in
 * from each side, the top of each leaning in, so the pair reads as nostrils
 * and never as a mouth. Placed on the oval's own planned dome (offset and
 * height per round, `chainOvalGeometry`) seen along its aim tilted up by
 * `viewTiltDeg`: each end of a mark is the visible dome point under it. The
 * words count the way the oval is made: rounds out from the chain, stitches
 * along from the stitch over the middle of the chain on the top side.
 */
export function chainOvalNostrils(o: ChainOvalOptions, yr: number, opts: ChainOvalNostrilOptions = {}): { stitches: EmbroideryStitch[]; words: string } {
  // As made, 0.37: where the approved engine-shapes r4 nostrils (42% down
  // in the listing render) sit on the oval as made, seen at the listing tilt
  // (engine-1107, measured on the compiled cow); on the planned dome, 0.4.
  const down = opts.down ?? (opts.asMade ? 0.37 : 0.4), inFrac = opts.inFrac ?? 0.25
  if (down < 0.3 || down > 0.5) throw new Error(`chain oval nostrils: down is 0.3..0.5 of the height (got ${down})`)
  if (inFrac < 0.15 || inFrac > 0.4) throw new Error(`chain oval nostrils: inFrac is 0.15..0.4 of the width (got ${inFrac})`)
  const G = chainOvalGeometry(o, yr)
  const counts = chainOvalRounds(o)
  const { c, rho } = G
  const last = G.ly[G.ly.length - 1]!
  const al = ((opts.viewTiltDeg ?? 0) * Math.PI) / 180
  const ca = Math.cos(al), sa = Math.sin(al)
  // Seen up (v) and toward the viewer (d) of the local point (x, y, z).
  const seenV = (y: number, z: number): number => -y * ca - z * sa
  const seenD = (y: number, z: number): number => z * ca - y * sa
  // The height as made (engine-1107 `asMade`): the relaxed build's round
  // heights along the meridian (the chain at 0, round k at its crowns' ly),
  // in place of the plan's.
  const made = opts.asMade ? chainOvalRoundHeights(o, yr) : null
  const madeAt = (m: number[], ly: number): number => {
    if (ly <= 0) return m[0]!
    let prevLy = 0
    for (let k = 0; k < G.ly.length; k++) {
      const lk = G.ly[k]!
      if (ly <= lk) return m[k]! + (m[k + 1]! - m[k]!) * ((ly - prevLy) / (lk - prevLy || 1))
      prevLy = lk
    }
    return m[m.length - 1]!
  }
  // Draped onto a curved face (`hostRadiusMm`): every point falls back by
  // the face's sag under it.
  const Rh = typeof opts.hostRadiusMm === 'number' ? { across: opts.hostRadiusMm, up: opts.hostRadiusMm } : opts.hostRadiusMm
  const fallBy = (R: number, d: number): number => R - Math.sqrt(Math.max(R * R - d * d, 0))
  const sag = (x: number, y: number): number => (Rh ? fallBy(Rh.across, x) + fallBy(Rh.up, y) : 0)
  const N = 240
  const prof = Array.from({ length: N + 1 }, (_, i) => {
    const ly = (i / N) * last, g = G.at(ly)
    return made ? { ly, ...g, rho: Math.max(g.rho, madeAt(made.offset, ly)), z: madeAt(made.top, ly) } : { ly, ...g }
  })
  let vTop = -Infinity, vBot = Infinity, Ymax = 0
  for (const p of prof) Ymax = Math.max(Ymax, p.rho)
  // The outline as seen: every meridian round the stadium (on a flat face the
  // middle one bounds it; draped, the sides fall back too).
  // As made, the outline also takes the edge sewn to the face (the last
  // round's lowest yarn), under the last round's crowns.
  const outline = made ? [...prof, { rho: Ymax, z: made.edge }] : prof
  for (const p of outline) {
    for (const ux of Rh ? [-1, -0.5, 0, 0.5, 1] : [0]) {
      const x = ux * c
      for (const sy of [-1, 1]) {
        const y = sy * p.rho, z = p.z - sag(x, y)
        vTop = Math.max(vTop, seenV(y, z)); vBot = Math.min(vBot, seenV(y, z))
      }
    }
    if (Rh) {
      for (let j = 1; j < 12; j++) {
        const a = (j / 12) * Math.PI - Math.PI / 2
        for (const sx of [-1, 1]) {
          const x = sx * (c + p.rho * Math.cos(a)), y = p.rho * Math.sin(a), z = p.z - sag(x, y)
          vTop = Math.max(vTop, seenV(y, z)); vBot = Math.min(vBot, seenV(y, z))
        }
      }
    }
  }
  const H = vTop - vBot, X = c + Ymax
  // The visible dome point seen at (x, v): local (x, y) and its meridian ly.
  const at = (x: number, v: number): { x: number; y: number; ly: number } => {
    let best: { x: number; y: number; ly: number; d: number } | null = null
    for (const sy of [-1, 1]) {
      let prev: { v: number; d: number; y: number; ly: number } | null = null
      for (const p of prof) {
        const dx = Math.max(0, Math.abs(x) - c)
        if (p.rho < dx) { prev = null; continue }
        const y = sy * Math.sqrt(p.rho * p.rho - dx * dx), z = p.z - sag(x, y)
        const cur = { v: seenV(y, z), d: seenD(y, z), y, ly: p.ly }
        if (prev && (prev.v - v) * (cur.v - v) <= 0 && prev.v !== cur.v) {
          const t = (v - prev.v) / (cur.v - prev.v)
          const hit = { x, y: prev.y + (cur.y - prev.y) * t, ly: prev.ly + (cur.ly - prev.ly) * t, d: prev.d + (cur.d - prev.d) * t }
          if (!best || hit.d > best.d) best = hit
        }
        prev = cur
      }
    }
    if (!best) throw new Error('chain oval nostrils: a mark falls off the oval (narrow it with inFrac / length)')
    return best
  }
  // Meridian position -> fractional round (1-based).
  const roundOf = (ly: number): number => {
    if (ly <= G.ly[0]!) return 1
    for (let k = 1; k < G.ly.length; k++) if (ly <= G.ly[k]!) return k + (ly - G.ly[k - 1]!) / (G.ly[k]! - G.ly[k - 1]!)
    return G.ly.length
  }
  const spot = (q: { x: number; y: number; ly: number }): { round: number; st: number; th: number } => ({ round: roundOf(q.ly), st: 0, th: Math.atan2(q.y, q.x) })
  // Stitches along the top side from the middle, on the nearest whole round.
  const along = (q: { x: number; y: number; ly: number }): { round: number; sts: number } => {
    const r = Math.max(1, Math.min(counts.length, Math.round(roundOf(q.ly))))
    const rk = rho[r - 1]!
    const P = 4 * ((Math.PI * rk) / 2) + 4 * c
    const s = sOfV(vOfPoint(q.x, q.y, c), rk, c) - sOfV(3, rk, c)
    return { round: r, sts: Math.abs(s) / (P / counts[r - 1]!) }
  }
  const len = (opts.length ?? 0.14) * H
  const lean = ((opts.leanDeg ?? 28) * Math.PI) / 180
  const strands = opts.strands ?? 2, gap = opts.strandMm ?? 1.1
  const stitches: EmbroideryStitch[] = []
  let ends: { top: { round: number; sts: number }; bot: { round: number; sts: number } } | null = null
  for (const sx of [1, -1] as const) {
    const cx = sx * (X - inFrac * 2 * X), cv = vTop - down * H
    // Bottom to top as seen: up and in (toward x = 0).
    const ux = -sx * Math.sin(lean), uv = Math.cos(lean)
    for (let k = 0; k < strands; k++) {
      const off = strands === 1 ? 0 : (k - (strands - 1) / 2) * gap
      const px = cx + off * uv, pv = cv - off * ux
      const top = at(px + (ux * len) / 2, pv + (uv * len) / 2)
      const bot = at(px - (ux * len) / 2, pv - (uv * len) / 2)
      stitches.push({ from: spot(top), to: spot(bot), taut: true })
    }
    ends ??= { top: along(at(cx + (ux * len) / 2, cv + (uv * len) / 2)), bot: along(at(cx - (ux * len) / 2, cv - (uv * len) / 2)) }
  }
  const st = (v: number): string => { const h = Math.round(v * 2) / 2; return `${String(h).replace('.5', '½')} ${h === 1 ? 'stitch' : 'stitches'}` }
  const e = ends!
  const words =
    'Nostrils: the muzzle\'s rounds circle the chain, so count rounds out from the chain, and stitches along the top side (toward the eyes) from the stitch over the middle of the chain. ' +
    `For each nostril, bring the needle up on round ${e.top.round}, ${st(e.top.sts)} out from the middle, and take it down on round ${e.bot.round}, ${st(e.bot.sts)} out from the middle, ` +
    (strands > 1 ? 'then work a second stitch right beside it, so the nostril is a small slanted oval, ' : '') +
    'the top end leaning in toward the middle. Work the other nostril the same, mirrored on the other side. Pull snug, not tight.'
  return { stitches, words }
}
