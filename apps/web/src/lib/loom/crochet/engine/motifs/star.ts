/**
 * FIVE-POINT STAR (audit round 8; bar: the gold star toppers on
 * bar-spiral-trees.png — fat, short, rounded points round a radiating centre,
 * outlined by an edging round; the nativity-wreath stars in real/).
 *
 * Worked in the round from a magic ring: a flat centre growing by five a round,
 * then ONE round whose outline is the star — into each group of five stitches
 * a sl st, tr, trtr, tr, sl st (UK): the heights rise to the point and fall to the
 * valley, nothing places them — and an edging round of dc (UK) all round it,
 * fanned three into each point stitch and two either side of it, which crisps
 * and rounds the points the way the bar star's outline does.
 *
 * (Round 1 of this audit chained each point out and worked back along it with
 * graded stitches; the points came out long, thin and twisted at the tip — the
 * bar's are fat and short — and its chain edge could not take an edging: every
 * stitch worked into a chain's free leg dragged that chain's own crossings out
 * of their folds. Heights across the round give the bar's shape directly.)
 */

import { rowPitchYr, type StitchId } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, shapedRound, sub, unit, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions } from './types'

export const STAR_COLOURS = { main: '#b8913f' } // antique gold
const POINTS = 5
/** The flat centre: stitches per round (a round of +5 each time). */
export const STAR_ROUNDS = [5, 10, 15, 20, 25]
/** The points round, into each group of five: valley → point → valley. */
export const STAR_POINT: StitchId[] = ['slst', 'dc', 'dtr', 'dc', 'slst']
/** The edging round: dc (UK) into each points-round stitch, this many each. */
export const STAR_EDGE: number[] = [1, 2, 3, 2, 1]

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
  for (let q = 1; q < STAR_ROUNDS.length; q++) {
    const every = below.length / POINTS // one increase in every `every` sts
    const a = crownRound(m, c, below, below.map((_, i) => (i % every === every - 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.sectionName = 'points'
  const per = below.length / POINTS
  if (per !== STAR_POINT.length) throw new Error('star: the last centre round must give one point group per point')
  const pts = shapedRound(m, c, below, below.map((_, i) => ({ id: STAR_POINT[i % per]!, n: 1 })), r)
  m.sectionName = 'edging'
  shapedRound(m, c, pts, pts.map((_, i) => ({ id: 'sc' as StitchId, n: STAR_EDGE[i % per]! })), r + yr * rowPitchYr('sc'), { spreadRad: 0.07 })
  m.fastenOff(unit(sub(c, m.cursor)))
  const R = r + yr * (rowPitchYr('tr') + rowPitchYr('sc'))
  const built = m.finish(R * 2, R * 2)
  const piece = pieceOf('star', m, built)
  return assemble('star', 'Five-point star', o, [piece], starWords(), materialsLine(o, ['gold']))
}

export function starWords(): string[] {
  const lines = ['Make a magic ring.', `Round 1: ${STAR_ROUNDS[0]} ${UK.sc} into the ring. (${STAR_ROUNDS[0]} sts)`]
  for (let q = 1; q < STAR_ROUNDS.length; q++) {
    const every = STAR_ROUNDS[q - 1]! / POINTS
    const run = every === 2 ? `${UK.sc} in next st` : `${UK.sc} in each of the next ${every - 1} sts`
    lines.push(every === 1
      ? `Round ${q + 1}: 2 ${UK.sc} in each st around. (${STAR_ROUNDS[q]} sts)`
      : `Round ${q + 1}: [${run}, 2 ${UK.sc} in next st] ${POINTS} times. (${STAR_ROUNDS[q]} sts)`)
  }
  lines.push('Work the rounds in a continuous spiral without joining; mark the first stitch of each round.')
  const n = STAR_ROUNDS.length
  lines.push(`Round ${n + 1} (points): [${STAR_POINT.map((id) => `${UK[id]} in next st`).join(', ')}] ${POINTS} times. (${POINTS} points)`)
  const edge = STAR_EDGE.map((k) => (k === 1 ? `${UK.sc} in next st` : `${k} ${UK.sc} in next st`)).join(', ')
  const tot = STAR_EDGE.reduce((a, b) => a + b, 0) * POINTS
  lines.push(`Round ${n + 2} (edging): [${edge}] ${POINTS} times. (${tot} sts)`)
  lines.push('Fasten off, pull the magic ring tight and weave in the ends.')
  return lines
}

registerMotif({ id: 'star', label: 'Five-point star', round: 8, colours: STAR_COLOURS, build: buildStar })
