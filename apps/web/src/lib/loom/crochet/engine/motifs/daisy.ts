/**
 * DAISY (audit round 9; bar: the cream-petalled daisies with mustard centres on
 * bar-flower-wall-hanging.png).
 *
 * A two-round centre (5, 10 dc, UK) in mustard, then ten petals in cream, each
 * CHAINED OUT from the centre and WORKED BACK down the chain with graded
 * stitches — dc at the tip, tr, two dtr at the widest, tr, dc at the base —
 * and anchored with a sl st into the next centre stitch. The chain is one edge
 * of each petal, the stitch tops the other; the rounded petal emerges from the
 * heights.
 */

import { rowPitchYr, type StitchId } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, nearAngle, polar, polarV, unit, sub, type Crown } from './kit'
import { intoChain } from './leaf'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions } from './types'

export const DAISY_COLOURS = { centre: '#c9a03c', petal: '#f1e8d6' } // mustard, cream

/** A petal, tip to base. */
export const DAISY_PETAL: StitchId[] = (process.env.DPETAL ?? 'dc,tr,tr,tr,dc,hdc').split(',') as StitchId[]
export const DAISY_CENTRE = (process.env.DCENTRE ?? '8,16,24').split(',').map(Number)
export const DAISY_PETALS = 8

export function buildDaisy(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(DAISY_COLOURS, o)
  const yr = y.yr
  const m = new MotifStrand(yr, col.centre!)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(DAISY_CENTRE[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < DAISY_CENTRE.length; q++) {
    const step = DAISY_CENTRE[q]! / DAISY_CENTRE[q - 1]! // 2 = every st, 1.5 = every 2nd
    const ops = below.map((_, i) => (step >= 2 || i % 2 === 1 ? 'inc' : 'st')) as ('st' | 'inc')[]
    const a = crownRound(m, c, below, ops, 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.setColour(col.petal!)
  m.sectionName = 'petals'
  const n = DAISY_PETALS
  const per = below.length / n
  const nCh = DAISY_PETAL.length + 1
  for (let k = 0; k < n; k++) {
    const start = m.cursor
    const dir = unit(sub(start, c))
    const th = Math.atan2(dir.y, dir.x)
    const tip = polarV(c, r + yr * 2.6 * nCh * 0.95, th)
    const loops = m.chain(nCh, [start, tip], { turning: 1 })
    for (let i = 0; i < DAISY_PETAL.length; i++) intoChain(m, loops[nCh - 2 - i]!, DAISY_PETAL[i]!, 'L')
    // sl st into the next centre stitch
    const target = below[(k + 1) * per - 1]!
    const thT = Math.atan2(target.p.y, target.p.x)
    m.stitch({ id: 'slst', frame: polar(c, r), xCrown: nearAngle(thT, thT) * r, xHook: thT * r, into: { kind: 'crown', crown: target }, by: r })
  }
  m.fastenOff(unit(sub(c, m.cursor)))
  const R = r + yr * 2.6 * nCh
  const built = m.finish(R * 2, R * 2)
  const piece = pieceOf('daisy', m, built)
  return assemble('daisy', 'Daisy', o, [piece], daisyWords(), materialsLine(o, ['mustard', 'cream']))
}

export function daisyWords(): string[] {
  const rounds = DAISY_CENTRE.map((cnt, q) => {
    if (q === 0) return `Round 1: ${cnt} ${UK.sc} into the ring. (${cnt} sts)`
    const step = cnt / DAISY_CENTRE[q - 1]!
    return step >= 2
      ? `Round ${q + 1}: 2 ${UK.sc} in each st around. (${cnt} sts)`
      : `Round ${q + 1}: [${UK.sc} in next st, 2 ${UK.sc} in next st] around. (${cnt} sts)`
  })
  const per = DAISY_CENTRE[DAISY_CENTRE.length - 1]! / DAISY_PETALS
  const nCh = DAISY_PETAL.length + 1
  const runs: string[] = []
  for (let i = 0; i < DAISY_PETAL.length; ) {
    let j = i
    while (j < DAISY_PETAL.length && DAISY_PETAL[j] === DAISY_PETAL[i]) j++
    const k = j - i
    const where = i === 0 ? '2nd ch from hook' : k === 1 ? 'next ch' : `each of the next ${k} ch`
    runs.push(`${UK[DAISY_PETAL[i]!]} in ${where}`)
    i = j
  }
  return [
    'With mustard, make a magic ring.',
    ...rounds,
    'Change to cream.',
    `Round ${DAISY_CENTRE.length + 1} (petals): [ch ${nCh}, ${runs.join(', ')}, skip the next ${per - 1} sts of round ${DAISY_CENTRE.length}, sl st in next st] ${DAISY_PETALS} times. (${DAISY_PETALS} petals)`,
    'Fasten off, pull the ring tight and weave in the ends.',
  ]
}

registerMotif({ id: 'daisy', label: 'Daisy', round: 9, colours: DAISY_COLOURS, build: buildDaisy })
