/**
 * PUFF ROSE (audit round 9; bar: the small round puffy pink flowers of
 * bar-flower-wall-hanging.png — four or five FAT rounded lobes, like a little
 * five-petal blossom or a closed bud, round a cream centre).
 *
 * Seven pieces, sewn: a small flat BACKING disc (two rounds of dc, UK), FIVE
 * PETALS that are each a small circle (magic ring, 6 dc, 12 dc, 18 dc) cupped
 * in the hand into a plump dome, sewn in a ring on the backing with their
 * domes leaning in so the five lobes meet, and a tiny pale CENTRE (one round of
 * dc into a ring) sewn in the middle. Every piece is worked flat in the round,
 * relaxed and audited as worked; the cupping and the lean are the pose.
 *
 * `bud` = the same flower closed: four petals leaning in hard with no centre,
 * the bar's rosebuds between the open flowers.
 *
 * (Rounds 2-4: two flat petal layers + a rolled bud, then a rolled strip on a
 * base — a disc, then a cupped roll. Rounds 5-7: two layers of five height-
 * shaped petals cupped onto spheres — a bowl with a bumpy rim. Round 8: two
 * layers of five bobbles — a frilly carnation of ten small loops. The bar's
 * lobes are fat rounded puffs: a petal is now a whole small circle, domed.)
 */

import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const LAYERED_ROSE_COLOURS = { main: '#b07a86', centre: '#e8d6c8' } // dusty rose, pale blush

/** The petal circle, dc rounds (UK). */
export const PETAL_ROUNDS = [6, 12, 18]
export const BACKING_ROUNDS = [6, 12]
const CENTRE_ROUND = 6
/** Open flower: five lobes leaning in; bud: four lobes closed over the middle. */
const OPEN = { petals: 5, leanDeg: 24, ringYr: 6.8, domeFrac: 1.6 }
const BUD = { petals: 4, leanDeg: 45, ringYr: 5.0, domeFrac: 1.45 }

/** A flat circle worked in dc rounds about the origin: returns the strand and its flat radius. */
export function disc(yr: number, hex: string, rounds: number[]): { m: MotifStrand; r: number } {
  const m = new MotifStrand(yr, hex)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(rounds[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < rounds.length; q++) {
    const inc = rounds[q]! - below.length
    if (inc <= 0 || below.length % inc !== 0) throw new Error(`disc: round ${rounds[q]} does not grow evenly from ${below.length}`)
    const every = below.length / inc
    const a = crownRound(m, c, below, below.map((_, i) => (i % every === every - 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.fastenOff({ x: 1, y: 0 })
  return { m, r: r + yr }
}

/** Cup a flat circle of radius `r` onto a sphere so it becomes a dome (arclength
 *  kept): `domeFrac` = r / sphere radius = the arc (rad) from the crown to the
 *  rim. The dome stands crown up with its rim on z = 0. */
function dome(r: number, domeFrac: number): (p: V3) => V3 {
  const Rs = r / domeFrac
  const phiMax = Math.min(r / Rs, Math.PI * 0.47)
  const h = Rs * (1 - Math.cos(phiMax))
  return (p) => {
    const rr = Math.hypot(p.x, p.y)
    const phi = Math.min(rr / Rs, Math.PI * 0.47)
    const rad = Rs * Math.sin(phi) + p.z * Math.cos(phi)
    const z = Rs * (1 - Math.cos(phi)) + p.z * Math.sin(phi)
    const ux = rr > 1e-9 ? p.x / rr : 1, uy = rr > 1e-9 ? p.y / rr : 0
    return { x: rad * ux, y: rad * uy, z: h - z }
  }
}

/** A domed petal stood on the backing at angle `th` round the middle, `ringYr`
 *  yarn radii out, leaning in by `leanDeg` so the lobes meet over the centre. */
function petalPose(yr: number, r: number, th: number, o: typeof OPEN, lift: number): (p: V3) => V3 {
  const d = dome(r, o.domeFrac)
  const lean = (o.leanDeg * Math.PI) / 180
  const cl = Math.cos(lean), sl = Math.sin(lean)
  const ct = Math.cos(th), st = Math.sin(th)
  const ring = yr * o.ringYr
  const w = (r / o.domeFrac) * Math.sin(Math.min(o.domeFrac, Math.PI * 0.47)) // the dome's half width
  return (p) => {
    const q = d(p)
    // petal local: +x points out from the flower's middle; tip the dome inward about its OUTER rim
    // (which stays on the backing), so its inner rim lifts toward the centre
    const x = q.x * cl + q.z * sl
    const z = -q.x * sl + q.z * cl + w * sl
    return { x: ct * (ring + x) - st * q.y, y: st * (ring + x) + ct * q.y, z: z + lift }
  }
}

export function buildLayeredRose(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(LAYERED_ROSE_COLOURS, o)
  const yr = y.yr
  const bud = o?.bud ?? false
  const spec = bud ? BUD : OPEN
  const pieces: MotifPiece[] = []
  const back = disc(yr, col.main!, BACKING_ROUNDS)
  pieces.push(pieceOf('backing', back.m, back.m.finish(back.r * 2, back.r * 2)))
  // One petal circle, relaxed and audited once; each sewn petal is a pose of it.
  const petal = disc(yr, col.main!, PETAL_ROUNDS)
  const proto = pieceOf('petal', petal.m, petal.m.finish(petal.r * 2, petal.r * 2))
  for (let k = 0; k < spec.petals; k++) {
    const th = Math.PI / 2 + (k / spec.petals) * Math.PI * 2
    pieces.push({ ...proto, name: `petal ${k + 1}`, pose: petalPose(yr, petal.r, th, spec, yr * 1.6) })
  }
  if (!bud) {
    const cen = disc(yr, col.centre!, [CENTRE_ROUND])
    // the centre sits in the middle at the height of the lobes' crowns
    const lift = yr * 1.6 + (petal.r / spec.domeFrac) * (1 - Math.cos(Math.min(spec.domeFrac, Math.PI * 0.47)))
    pieces.push(pieceOf('centre', cen.m, cen.m.finish(cen.r * 2, cen.r * 2), (p) => ({ x: p.x, y: p.y, z: p.z + lift })))
  }
  return assemble('layered-rose', bud ? 'Rosebud' : 'Puff rose', o, pieces, layeredRoseWords(bud), materialsLine(o, bud ? ['dusty rose'] : ['dusty rose', 'pale blush']))
}

export function discWords(rounds: number[]): string[] {
  const lines = ['Make a magic ring.', `Round 1: ${rounds[0]} ${UK.sc} into the ring. (${rounds[0]} sts)`]
  for (let q = 1; q < rounds.length; q++) {
    const every = rounds[q - 1]! / (rounds[q]! - rounds[q - 1]!)
    const run = every === 1 ? '' : every === 2 ? `${UK.sc} in next st, ` : `${UK.sc} in each of the next ${every - 1} sts, `
    lines.push(every === 1
      ? `Round ${q + 1}: 2 ${UK.sc} in each st around. (${rounds[q]} sts)`
      : `Round ${q + 1}: [${run}2 ${UK.sc} in next st] ${rounds[q - 1]! / every} times. (${rounds[q]} sts)`)
  }
  lines.push('Fasten off, leaving a tail for sewing.')
  return lines
}

export function layeredRoseWords(bud = false): string[] {
  const n = bud ? BUD.petals : OPEN.petals
  return [
    'Backing, with dusty rose:', ...discWords(BACKING_ROUNDS).map((s) => `  ${s}`),
    `Petals (make ${n}), with dusty rose:`, ...discWords(PETAL_ROUNDS).map((s) => `  ${s}`),
    ...(bud ? [] : [
      'Centre, with pale blush:',
      '  Make a magic ring.',
      `  Round 1: ${CENTRE_ROUND} ${UK.sc} into the ring. (${CENTRE_ROUND} sts)`,
      '  Fasten off, pull the ring tight and leave a tail for sewing.',
    ]),
    bud
      ? `Cup each petal in your hand into a dome and sew the ${n} domes to the backing in a ring, leaning in hard so they close over the middle like a bud; a stitch through the tops holds them.`
      : `Cup each petal in your hand into a plump dome and sew the ${n} domes to the backing in a ring, each leaning in a little so the lobes touch; sew the centre in the middle over their inner edges.`,
    'Weave in the ends behind the backing.',
  ]
}

registerMotif({ id: 'layered-rose', label: 'Puff rose', round: 9, colours: LAYERED_ROSE_COLOURS, build: buildLayeredRose })
