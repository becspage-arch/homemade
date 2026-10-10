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
  RING_PHASE, type Crown,
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

export function buildStar(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(STAR_COLOURS, o)
  const yr = y.yr
  const m = new MotifStrand(yr, col.main!)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(STAR_ROUNDS[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  {
    const a = crownRound(m, c, below, below.map(() => 'inc'), 'sc', r)
    below = a.crowns
    r = a.r
  }
  {
    const a = crownRound(m, c, below, below.map((_, i) => (i % 2 === 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  const rim = below // 15
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
  const words = starWords()
  return assemble('star', 'Five-point star', o, [piece], words, materialsLine(o, ['gold']))
}

export function starWords(): string[] {
  const [a, b, cc] = STAR_ROUNDS as [number, number, number]
  const pt = STAR_POINT.map((id, i) => (i === 0 ? `${UK[id]} in 2nd ch from hook` : `${UK[id]} in next ch`)).join(', ')
  return [
    'Make a magic ring.',
    `Round 1: ${a} ${UK.sc} into the ring. (${a} sts)`,
    `Round 2: 2 ${UK.sc} in each st around. (${b} sts)`,
    `Round 3: [${UK.sc} in next st, 2 ${UK.sc} in next st] ${a} times. (${cc} sts)`,
    'Work rounds 1 to 3 in a continuous spiral without joining; mark the first stitch of each round.',
    `Round 4 (points): [ch ${STAR_POINT.length + 1}, ${pt}, skip next ${SKIP} sts of round 3, sl st in next st] ${POINTS} times. (${POINTS} points)`,
    'Fasten off, pull the magic ring tight and weave in the ends.',
  ]
}

registerMotif({ id: 'star', label: 'Five-point star', round: 8, colours: STAR_COLOURS, build: buildStar })
