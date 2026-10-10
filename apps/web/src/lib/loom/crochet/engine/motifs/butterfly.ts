/**
 * BUTTERFLY (audit round 8; bar: the dusty-blue and peach butterflies on
 * bar-flower-wall-hanging.png; built-how ref real/8-butterflies.jpg — "flat
 * butterflies worked in rounds of contrast colours, with an edging round").
 *
 * Four wings, each a small flat circle worked in the round from a magic ring
 * (the upper wings three rounds, the lower two) finished with an edging round
 * in cream, sewn in pairs either side of a chain body whose tail is knotted
 * for an antenna. The deep waist between the wings is simply where the four
 * circles meet; the sewing is the pose.
 *
 * (Rounds 1-3 of this audit worked all four wings into one centre — straight
 * into the ring (crowded, 12-16 failures), then over a 20-st second round: it
 * was audit clean but rendered as a scalloped disc, the notches between wings
 * filled by the chains standing at each wing's edges.)
 */

import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, sub, unit, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const BUTTERFLY_COLOURS = { wing: '#9fb4c9', edge: '#eee3cf', body: '#7a6250' } // dusty blue, cream, cocoa

interface WingSpec {
  /** Stitches per round in the wing colour (a flat circle: +6 a round). */
  rounds: number[]
  /** The edging round in cream: 2 sc in every `incEvery`-th st. */
  incEvery: number
}
export const UPPER_WING: WingSpec = { rounds: [6, 12, 18], incEvery: 3 }
export const LOWER_WING: WingSpec = { rounds: [6, 12], incEvery: 2 }

function wingPiece(yr: number, wing: string, edge: string, w: WingSpec, name: string, at: { x: number; y: number; z: number }): MotifPiece {
  const m = new MotifStrand(yr, wing)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  let below: Crown[] = intoRingRound(m, ring, new Array(w.rounds[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < w.rounds.length; q++) {
    const every = below.length / 6
    const a = crownRound(m, c, below, below.map((_, i) => (i % every === every - 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.setColour(edge)
  m.sectionName = 'edging'
  const a = crownRound(m, c, below, below.map((_, i) => (i % w.incEvery === w.incEvery - 1 ? 'inc' : 'st')), 'sc', r)
  r = a.r
  m.fastenOff(unit(sub(c, m.cursor)))
  const built = m.finish(r * 2, r * 2)
  return pieceOf(name, m, built, (p) => ({ x: p.x + at.x, y: p.y + at.y, z: p.z + at.z }))
}

/** Settled radius of a wing (to place the four of them). */
function wingRadius(yr: number, w: WingSpec): number {
  return yr * (0.85 + rowPitchYr('sc') * (w.rounds.length + 1))
}

export function buildButterfly(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(BUTTERFLY_COLOURS, o)
  const yr = y.yr
  const Ru = wingRadius(yr, UPPER_WING), Rl = wingRadius(yr, LOWER_WING)
  const gap = yr * 1.2 // the body lies in this gap
  // The upper wings are sewn overlapping the tops of the lower ones (a yarn
  // layer up), the body over both.
  const pieces: MotifPiece[] = []
  for (const sx of [1, -1]) {
    pieces.push(wingPiece(yr, col.wing!, col.edge!, UPPER_WING, sx > 0 ? 'upper right wing' : 'upper left wing', { x: sx * (Ru + gap), y: Ru * 0.55, z: yr * 2.2 }))
    pieces.push(wingPiece(yr, col.wing!, col.edge!, LOWER_WING, sx > 0 ? 'lower right wing' : 'lower left wing', { x: sx * (Rl + gap * 0.8), y: -Rl * 1.05, z: 0 }))
  }
  pieces.push(buildBody(yr, col.body!, Ru * 0.55 + Ru * 0.6))
  return assemble('butterfly', 'Butterfly', o, pieces, butterflyWords(), materialsLine(o, ['dusty blue', 'cream', 'cocoa']))
}

export const BODY_CH = 9

/** The body: a chain laid down the middle and sewn on, its two tails knotted
 *  at the top for antennae. Relaxed on its own, then laid on the wings. */
function buildBody(yr: number, hex: string, top: number): MotifPiece {
  const m = new MotifStrand(yr, hex)
  const L = yr * 2.6 * BODY_CH
  // Made from the head end down: the slip knot at the top.
  m.slipKnot({ x: 0, y: 0 }, { x: 0, y: -1 })
  m.chain(BODY_CH, [{ x: 0, y: 0 }, { x: 0, y: -L }])
  // The working end is drawn through, carried up behind the body to the head
  // and out as the second antenna; the first is the slip knot's own tail.
  const from = m.nodes.length
  const pts: [number, number][] = []
  for (let t = 1; t <= 10; t++) pts.push([yr * 0.3 * Math.sin(t), -L + (L + yr * 2) * (t / 10)])
  for (const [x, yy] of pts) m.push({ x, y: yy }, -yr * 1.2)
  for (let t = 1; t <= 9; t++) {
    const a = 0.35 + t * 0.06
    m.push({ x: Math.sin(a) * yr * 1.6 * t * 0.9, y: yr * 2 + Math.cos(a) * yr * 1.6 * t }, yr * 0.2)
  }
  // knot at the tip: a small turn of yarn round itself
  const tip = m.cursor
  for (let t = 0; t < 6; t++) m.push({ x: tip.x + Math.cos(t * 1.2) * yr * 0.8, y: tip.y + Math.sin(t * 1.2) * yr * 0.8 }, yr * (0.6 + 0.2 * (t % 2)))
  m.markLoose(from)
  const built = m.finish(yr * 6, L)
  // Laid down the middle of the wings, a yarn's thickness proud of them.
  const piece = pieceOf('body', m, built, (p) => ({ x: p.x, y: p.y + top, z: p.z + yr * 4.4 }))
  return piece
}

export function butterflyWords(): string[] {
  const wing = (w: WingSpec, label: string): string[] => {
    const lines = [`${label} (make 2), with dusty blue: make a magic ring.`, `  Round 1: ${w.rounds[0]} ${UK.sc} into the ring. (${w.rounds[0]} sts)`]
    for (let q = 1; q < w.rounds.length; q++) {
      const every = w.rounds[q - 1]! / 6
      lines.push(every === 1
        ? `  Round ${q + 1}: 2 ${UK.sc} in each st around. (${w.rounds[q]} sts)`
        : `  Round ${q + 1}: [${every === 2 ? `${UK.sc} in next st` : `${UK.sc} in each of the next ${every - 1} sts`}, 2 ${UK.sc} in next st] 6 times. (${w.rounds[q]} sts)`)
    }
    const last = w.rounds[w.rounds.length - 1]!
    const n = w.rounds.length + 1
    const run = w.incEvery === 2 ? `${UK.sc} in next st` : `${UK.sc} in each of the next ${w.incEvery - 1} sts`
    lines.push(`  Change to cream. Round ${n} (edging): [${run}, 2 ${UK.sc} in next st] around. (${last + last / w.incEvery} sts)`)
    lines.push('  Fasten off, leaving a tail for sewing.')
    return lines
  }
  return [
    ...wing(UPPER_WING, 'Upper wings'),
    ...wing(LOWER_WING, 'Lower wings'),
    `Body: with cocoa, leaving a 6 cm tail, ch ${BODY_CH}; fasten off leaving a 15 cm tail.`,
    'Sew the upper wings side by side with the lower wings below them, edges touching at the middle; sew the body down the middle over the joins. Bring both tails out at the top for the antennae and tie a small knot near the end of each.',
  ]
}

registerMotif({ id: 'butterfly', label: 'Butterfly', round: 8, colours: BUTTERFLY_COLOURS, build: buildButterfly })
