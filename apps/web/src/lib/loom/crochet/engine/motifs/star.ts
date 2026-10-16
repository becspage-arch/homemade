/**
 * FIVE-POINT STAR (audit round 8; bar: the gold star toppers on
 * bar-spiral-trees.png, the stars on the nativity wreath in real/).
 *
 * Worked in the round from a magic ring (5, 10, 15 sts), then the points are
 * CHAINED OUT and WORKED BACK along the chain with graded stitches — sl st at
 * the tip, then dc, htr, tr, dtr (UK) down to the base — and each point is
 * anchored by a sl st into the round, two stitches on. The chain is one edge of
 * the point, the tops of the graded stitches the other: the triangle EMERGES
 * from the stitch heights, nothing places it.
 *
 * (Rounds 2 and 3 of the audit tried the other way — a flat centre to 25 sts
 * and one round whose heights make the points, sl st/dc, tr, trtr or dtr, tr,
 * then a dc edging round, kit.shapedRound. Audit clean, but both rendered as a
 * ragged blob: the tall posts on the outside of a wide round stand apart and
 * the outline never reads as five points. The chained points read as a star;
 * what they still lack against the bar is width — see the job log.)
 */

import { rowPitchYr, type StitchId } from '../dictionary'
import {
  MotifStrand, crownRound, intoRingRound, nearAngle, polar, along, polarV, sub, unit, add, mul, len,
  type Crown,
} from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const STAR_COLOURS = { main: '#a8843a' } // antique gold (#c9a24a rendered yellow)

/** The point, from the tip down: the stitch worked into each chain. Round 5
 *  of the audit: a centre one round bigger (20 sts, four a point) and a
 *  point one chain shorter ending in tr (UK) at the base — a point about as
 *  wide at its base as it is long, like the bar's fat short points; r1-4's
 *  ch 6 points ending in dtr were long and thin. */
export const STAR_POINT: StitchId[] = ['slst', 'sc', 'hdc', 'dc']
export const STAR_ROUNDS = [5, 10, 15, 20]
const POINTS = 5
const TIP_REACH = 0.8
const TIP_LIFT = 0.4
const SKIP = 2 // round-3 stitches skipped between a point's base and its sl st

export interface StarSpec { rounds: number[]; point: StitchId[]; skip: number }
/** The sizes: 'standard' (~55 mm at fine cotton) and 'small' (a tree topper:
 *  one round of 5 and ch-3 points, ~37 mm at fine, ~28 mm at lace — the chains
 *  set the floor; two rounds with ch-4 points settled 40-46 mm). */
export const STAR_SIZES: Record<'standard' | 'small' | 'topper', StarSpec> = {
  standard: { rounds: STAR_ROUNDS, point: STAR_POINT, skip: SKIP },
  small: { rounds: [5], point: ['slst', 'sc'], skip: 0 },
  /** The spiral trees' TOPPER (spiralHanging.ts, Fable pass 2): the bar's star
   *  is a SOLID body with five short crisp points. Three rounds (5, 10, 15) make
   *  the body; ch-4 points (sl st, UK dc, htr) over two skipped stitches: ~42 mm
   *  at lace (two rounds with ch-3 points read as a wiry starfish on the tree,
   *  and a two-stitch point leaned into a pinwheel: the chain is one edge of
   *  the point and the stitches the other, so a third stitch squares it). */
  topper: { rounds: [5, 10, 15], point: ['slst', 'sc', 'hdc'], skip: 2 },
}

export function buildStar(o?: MotifOptions): BuiltMotif {
  const spec = STAR_SIZES[o?.size ?? 'standard']
  const y = motifYarn(o)
  const col = colourOpts(STAR_COLOURS, o)
  if (!o?.puffed) {
    const piece = starPiece(y.yr, col.main!, spec)
    return assemble('star', 'Five-point star', o, [piece], starWords(spec), materialsLine(o, ['gold']))
  }
  // PUFFED (round 6; bar: the plump flat-faced toppers of bar-spiral-trees.png):
  // two identical stars sewn wrong sides together with a little stuffing. Each
  // is worked flat and audited flat; the sewing is the pose — the front bows
  // up, the back bows down, both most at the centre and flat at the tips, and
  // the two are turned so a point stands at the top. The second star is the
  // first turned over (a half turn about y), the way the maker flips it.
  const flat = starPiece(y.yr, col.main!, spec)
  const yr = y.yr
  const { th, R } = tipOf(flat)
  const rot = Math.PI / 2 - th
  const H = yr * PUFF_YR
  const puff = (sign: 1 | -1): MotifPiece['pose'] => (p) => {
    // Turn a point to the top, then turn the back star over (x and z).
    const x1 = p.x * Math.cos(rot) - p.y * Math.sin(rot)
    const yy = p.x * Math.sin(rot) + p.y * Math.cos(rot)
    const x = sign * x1
    const rho = Math.min(1, Math.hypot(x, yy) / R)
    const dome = H * Math.cos((rho * Math.PI) / 2)
    return { x, y: yy, z: H + yr + sign * (dome + p.z) }
  }
  const front = { ...flat, name: 'front', pose: puff(1) }
  const back = starPiece(y.yr, col.main!, spec, 'back', puff(-1))
  const words = starWords(spec).slice(0, -1).concat([
    'Fasten off, pull the magic ring tight and weave in the ends. Make a second star the same.',
    'Place the two stars wrong sides together and sew them together round the edge through the outer stitches, adding a little stuffing before you close so the star plumps up.',
  ])
  return assemble('star', 'Five-point star', o, [front, back], words, materialsLine(o, ['gold']).concat(['A little toy stuffing.']))
}

/** How much a puffed star's face bows up at the centre, in yarn radii. */
const PUFF_YR = 1.7 // r6's 2.4 read as a lumpy mound; the bar's star is plump but flat-faced

/** The angle (rad) of the first point's tip and the tip radius of a flat star. */
function tipOf(p: MotifPiece): { th: number; R: number } {
  let best = 0, R = 0
  for (const i of p.built.strandPath) {
    const n = p.built.model.nodes[i]!
    const r = Math.hypot(n.x, n.y)
    if (r > R) { R = r; best = Math.atan2(n.y, n.x) }
  }
  return { th: best, R }
}

/** One star as a piece: the centre rounds, then the chained points, relaxed
 *  and audited (also a berry's calyx: one round of 5 and ch-2 points). */
export function starPiece(yr: number, hex: string, spec: StarSpec, name = 'star', pose?: MotifPiece['pose']): MotifPiece {
  const STAR_ROUNDS = spec.rounds, STAR_POINT = spec.point, SKIP = spec.skip
  const m = new MotifStrand(yr, hex)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(STAR_ROUNDS[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < STAR_ROUNDS.length; q++) {
    const every = below.length / POINTS // one increase in every `every` sts
    const a = crownRound(m, c, below, below.map((_, i) => (i % every === every - 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  const rim = below
  const nRim = rim.length
  const thOf = (k: number): number => Math.atan2(rim[((k % nRim) + nRim) % nRim]!.p.y, rim[((k % nRim) + nRim) % nRim]!.p.x)
  const per = nRim / POINTS
  m.sectionName = 'points'
  for (let k = 0; k < POINTS; k++) {
    const s0 = k * per - 1 // the stitch the point's chain starts from
    const sTo = s0 + SKIP + 1 // the stitch its sl st goes into
    const th0 = thOf(s0)
    const thTo = nearAngle(thOf(sTo), th0)
    // The point's axis is half way across its base; its tip stands out along it.
    const thAx = (th0 + thTo) / 2
    const nCh = STAR_POINT.length + 1
    const B = m.cursor
    const tip = polarV(c, r + yr * 2.6 * nCh * 0.92, thAx)
    const loops = m.chain(nCh, [B, tip], { turning: 1 })
    // Work back from the tip: skip the last chain (it turns the point).
    for (let i = 0; i < STAR_POINT.length; i++) {
      const L = loops[nCh - 2 - i]!
      const f = along(L.c, mul(L.u, -1))
      const leg = m.nodes[L.legL]!
      const lx = f.local({ x: leg.x, y: leg.y }).lx
      // The sl st at the tip is worked into the 2nd ch with the turning chain
      // still on the hook, so its head closes AT the tip: it sits out over the
      // skipped chain, not over its own insertion.
      const tipPull = i === 0 ? yr * 2.6 * TIP_REACH : 0
      const ly = f.local({ x: leg.x, y: leg.y }).ly
      m.stitch({ id: STAR_POINT[i]!, frame: f, xCrown: lx - tipPull, into: { kind: 'node', node: L.legL }, ...(i === 0 ? { ty: ly + yr * TIP_LIFT } : {}) })
    }
    // sl st into the round, SKIP stitches on.
    const target = rim[((sTo % nRim) + nRim) % nRim]!
    const fr = polar(c, r)
    const thT = Math.atan2(target.p.y, target.p.x)
    m.stitch({ id: 'slst', frame: fr, xCrown: nearAngle(thT, thT) * r, xHook: thT * r, into: { kind: 'crown', crown: target }, by: r })
  }
  const end = m.cursor
  m.fastenOff(unit(sub({ x: 0, y: 0 }, end)))
  const R = r + yr * 2.6 * (STAR_POINT.length + 1)
  const built = m.finish(R * 2, R * 2)
  void add; void len
  return pieceOf(name, m, built, pose)
}

export function starWords(spec: StarSpec = STAR_SIZES.standard): string[] {
  const { rounds, point, skip } = spec
  const pt = point.map((id, i) => (i === 0 ? `${UK[id]} in 2nd ch from hook` : `${UK[id]} in next ch`)).join(', ')
  const lines = ['Make a magic ring.', `Round 1: ${rounds[0]} ${UK.sc} into the ring. (${rounds[0]} sts)`]
  for (let q = 1; q < rounds.length; q++) {
    const every = rounds[q - 1]! / POINTS
    lines.push(every === 1
      ? `Round ${q + 1}: 2 ${UK.sc} in each st around. (${rounds[q]} sts)`
      : `Round ${q + 1}: [${every === 2 ? `${UK.sc} in next st` : `${UK.sc} in each of the next ${every - 1} sts`}, 2 ${UK.sc} in next st] ${POINTS} times. (${rounds[q]} sts)`)
  }
  const n = rounds.length
  lines.push(n === 1 ? 'Do not join.' : `Work rounds 1 to ${n} in a continuous spiral without joining; mark the first stitch of each round.`)
  lines.push(`Round ${n + 1} (points): [ch ${point.length + 1}, ${pt}, ${skip === 0 ? '' : `skip next ${skip === 1 ? 'st' : `${skip} sts`} of round ${n}, `}sl st in next st] ${POINTS} times. (${POINTS} points)`)
  lines.push('Fasten off, pull the magic ring tight and weave in the ends.')
  return lines
}

registerMotif({ id: 'star', label: 'Five-point star', round: 8, colours: STAR_COLOURS, build: buildStar })
