/**
 * DAISY (audit round 9; bar: the cream-petalled daisies with mustard centres on
 * bar-flower-wall-hanging.png).
 *
 * Two kinds of piece, sewn: a three-round centre (8, 16, 24 dc, UK) in mustard,
 * and eight petals in cream, each a small two-sided leaf — a chain worked up
 * one side with graded heights (htr, tr, tr, tr, htr), a rounded
 * (htr, ch 1, htr) tip in the last chain, and back down the other side — so
 * the petal is a broad symmetric oval with its chain as the centre vein, the
 * way the bar's petals are. The petals are sewn in a ring with their bases
 * under the centre, and the centre sits proud on top of them (its dome is the
 * sewing's pose; the centre is audited flat as worked).
 *
 * (Rounds 1-4 of the audit chained each petal out from the centre and worked
 * back down one side only: audit clean, but every petal was a ladder with one
 * straight chain edge and a pointed corner at the turning chain, and the
 * petals never touched. A petal cannot be worked both sides in one pass from
 * a centre — the hook ends at the tip — so the bar's broad petals are made
 * separately and sewn.)
 */

import { rowPitchYr, type StitchId } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, sub, unit, type Crown } from './kit'
import { leafPiece, leafWords } from './leaf'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const DAISY_COLOURS = { centre: '#c39433', petal: '#e2d2b4' } // ochre mustard, warm cream (r2-4's creams rendered white)

/** One side of a petal, base to tip. */
export const DAISY_PETAL: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc'] // r6's 5-st htr-tr petals overlapped into a scalloped disc; one st longer and a step lower = a narrower oval with air between the petals (7 sts a side read as a snowflake)
export const DAISY_CENTRE = [8, 16, 24]
export const DAISY_PETALS = 8
/** `size: 'small'` (r10, the garland): a two-round centre and a petal one st shorter, ~70% the width — the bar's daisies are the smaller flower beside its roses. */
export const DAISY_CENTRE_SMALL = [6, 12]
export const DAISY_PETAL_SMALL: StitchId[] = ['sc', 'dc', 'dc', 'sc'] // 5 sts a side was still 53 mm at lace beside a 55 mm rose
/** How far (yarn radii) each petal's base is tucked under the centre, and how
 *  high the centre's dome stands over the petals. */
const TUCK_YR = 2.5
const DOME_YR = 2.6
const LIFT_YR = 1.6

export function daisyCentre(yr: number, hex: string, rounds: number[] = DAISY_CENTRE): { piece: MotifPiece; r: number } {
  const m = new MotifStrand(yr, hex)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(rounds[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < rounds.length; q++) {
    const step = rounds[q]! / rounds[q - 1]! // 2 = every st, 1.5 = every 2nd
    const ops = below.map((_, i) => (step >= 2 || i % 2 === 1 ? 'inc' : 'st')) as ('st' | 'inc')[]
    const a = crownRound(m, c, below, ops, 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.fastenOff(unit(sub(c, m.cursor)))
  const R = r + yr
  // The dome: the centre sewn on top of the petal bases stands proud, highest
  // in the middle (a rigid lift plus a shallow paraboloid).
  const pose = (p: V3): V3 => {
    const rr = Math.hypot(p.x, p.y)
    const t = Math.min(1, rr / R)
    return { x: p.x, y: p.y, z: p.z + yr * LIFT_YR + yr * DOME_YR * (1 - t * t) }
  }
  return { piece: pieceOf('centre', m, m.finish(R * 2, R * 2), pose), r }
}

export function buildDaisy(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(DAISY_COLOURS, o)
  const yr = y.yr
  const small = o?.size === 'small'
  const centre = daisyCentre(yr, col.centre!, small ? DAISY_CENTRE_SMALL : DAISY_CENTRE)
  // One petal, relaxed and audited once; the eight sewn petals are poses of it.
  // r11: a blunt (htr, htr) tip — the ch-1 'round' tip rendered as a notch at every petal end.
  const proto = leafPiece(yr, col.petal!, small ? DAISY_PETAL_SMALL : DAISY_PETAL, 0, 'petal', undefined, 'blunt')
  const ln = proto.built.model.nodes
  let xMin = Infinity, ySum = 0
  for (const n of ln) { xMin = Math.min(xMin, n.x); ySum += n.y }
  const yMid = ySum / ln.length
  // The petal lies along x with its tip at the +x end (the chain was made from
  // the tip toward −x); its base (the −x end) is tucked under the centre.
  const rBase = centre.r - yr * TUCK_YR
  const pieces: MotifPiece[] = []
  for (let k = 0; k < DAISY_PETALS; k++) {
    const th = (k / DAISY_PETALS) * Math.PI * 2 + Math.PI / 2
    const cs = Math.cos(th), sn = Math.sin(th)
    pieces.push({
      ...proto,
      name: `petal ${k + 1}`,
      pose: (p) => {
        const lx = rBase + (p.x - xMin)
        const ly = p.y - yMid
        return { x: lx * cs - ly * sn, y: lx * sn + ly * cs, z: p.z }
      },
    })
  }
  pieces.push(centre.piece)
  return assemble('daisy', 'Daisy', o, pieces, daisyWords(small), materialsLine(o, ['mustard', 'cream']))
}

export function daisyWords(small = false): string[] {
  const CENTRE = small ? DAISY_CENTRE_SMALL : DAISY_CENTRE
  const rounds = CENTRE.map((cnt, q) => {
    if (q === 0) return `  Round 1: ${cnt} ${UK.sc} into the ring. (${cnt} sts)`
    const step = cnt / CENTRE[q - 1]!
    return step >= 2
      ? `  Round ${q + 1}: 2 ${UK.sc} in each st around. (${cnt} sts)`
      : `  Round ${q + 1}: [${UK.sc} in next st, 2 ${UK.sc} in next st] around. (${cnt} sts)`
  })
  const petal = leafWords(small ? DAISY_PETAL_SMALL : DAISY_PETAL, 0, 'blunt', 'Petal').slice(0, -1)
  return [
    'Centre, with mustard: make a magic ring.',
    ...rounds,
    '  Fasten off, pull the ring tight and leave a tail for sewing.',
    `Petals (make ${DAISY_PETALS}), with cream:`,
    ...petal.map((s) => `  ${s}`),
    '  Fasten off, leaving a tail for sewing.',
    'Lay the petals in a ring with their bases overlapping in the middle, sew the bases together, then sew the centre on top so it covers them and stands proud.',
  ]
}

registerMotif({ id: 'daisy', label: 'Daisy', round: 9, colours: DAISY_COLOURS, build: buildDaisy })
