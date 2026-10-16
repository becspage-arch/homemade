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
import type { BuiltMotif, MotifOptions } from './types'

export const STAR_COLOURS = { main: '#a8843a' } // antique gold (#c9a24a rendered yellow)

/** The point, from the tip down: the stitch worked into each chain. */
export const STAR_POINT: StitchId[] = ['slst', 'sc', 'hdc', 'dc', 'tr']
export const STAR_ROUNDS = [5, 10, 15]
const POINTS = 5
const TIP_REACH = 0.8
const TIP_LIFT = 0.4
const SKIP = 2 // round-3 stitches skipped between a point's base and its sl st

interface StarSpec { rounds: number[]; point: StitchId[]; skip: number }
/** The sizes: 'standard' (~63 mm at fine cotton) and 'small' (a tree topper:
 *  one round of 5 and ch-3 points, ~37 mm at fine, ~28 mm at lace — the chains
 *  set the floor; two rounds with ch-4 points settled 40-46 mm). */
export const STAR_SIZES: Record<'standard' | 'small', StarSpec> = {
  standard: { rounds: STAR_ROUNDS, point: STAR_POINT, skip: SKIP },
  small: { rounds: [5], point: ['slst', 'sc'], skip: 0 },
}

export function buildStar(o?: MotifOptions): BuiltMotif {
  const spec = STAR_SIZES[o?.size ?? 'standard']
  const STAR_ROUNDS = spec.rounds, STAR_POINT = spec.point, SKIP = spec.skip
  const y = motifYarn(o)
  const col = colourOpts(STAR_COLOURS, o)
  const yr = y.yr
  const m = new MotifStrand(yr, col.main!)
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
  const piece = pieceOf('star', m, built)
  void add; void len
  const words = starWords(spec)
  return assemble('star', 'Five-point star', o, [piece], words, materialsLine(o, ['gold']))
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
