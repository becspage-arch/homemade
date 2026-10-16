/**
 * LAYERED (PUFF) ROSE (audit round 9; bar: the small round puffy pink roses of
 * bar-flower-wall-hanging.png — four or five fat cupped lobes round a pale
 * centre; built-how ref real/9-big-rose-stem.jpg, graded petals in layers).
 *
 * Three pieces, each worked flat in the round and sewn stacked: an outer layer
 * of five petals (a small flat centre, then a round whose outline is the
 * petals — into each group of four stitches dc, dtr, dtr, dc, UK, so the
 * rounded lobe comes from the heights), a smaller inner layer of five petals
 * turned half a petal, and a tiny pale centre (one round of dc into a ring).
 * Each layer is cupped — bent up into a bowl so the petals stand and curl in,
 * the maker's shaping as the layers are sewn — so the stacked rose is a round
 * puff of lobes, not a disc. The cup is the pose; every layer is relaxed and
 * audited flat as it was worked.
 *
 * (Round 2 stacked two flat layers under a small rolled bud and rendered as a
 * flat scruffy disc; rounds 3-4 put a tightly rolled strip on a flat base and
 * read as a cupped roll, the wrong construction for the bar's puff roses.)
 */

import type { StitchId } from '../dictionary'
import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, shapedRound, sub, unit, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const LAYERED_ROSE_COLOURS = { main: '#b07a86', inner: '#bd8893', centre: '#e8d6c8' } // dusty rose, lighter rose, pale blush

interface Layer {
  name: string
  centre: number[]
  /** Into each group of the last centre round: stitch and count, per crown. */
  petal: { id: StitchId; n: number }[]
  /** Radius (yarn radii) of the sphere the flat layer is cupped onto. */
  cupYr: number
  /** Turn in its plane (deg) and lift (yarn radii) when stacked. */
  spinDeg: number
  liftYr: number
}

const one = (ids: StitchId[]): { id: StitchId; n: number }[] => ids.map((id) => ({ id, n: 1 }))
/** One stitch into each crown. (Fanning two or three tall stitches into one
 *  crown of the flat centre crowded the second post out of its own yarn-over
 *  collars — 5/105-110 interlocks failed — so each petal spreads over as many
 *  crowns as it has stitches and takes its rounded outline from the heights.) */
export const LAYERS: Layer[] = [
  // r5's htr-tr cups on 15 / 10.5 yr spheres rendered as one smooth bowl; deeper
  // scallops on shallower cups so each lobe reads.
  // r6's sc-dtr scallops on the shallower cups rendered as spiky head loops standing off the rim (an anemone):
  // back to r5's gentler heights, keeping r6's cups.
  // r7 (gentle heights on the shallower cups) was still a bowl with a bumpy rim. The bar's lobes are PUFFS: each
  // petal is now a bobble (five partial tr gathered to one top, UK) between two dc, so the lobe is a fat bump of
  // yarn, not an outline.
  { name: 'outer petals', centre: [5, 10, 15], petal: one(['sc', 'bobble', 'sc']), cupYr: 20, spinDeg: 0, liftYr: 0 },
  { name: 'inner petals', centre: [5, 10], petal: one(['bobble', 'sc']), cupYr: 12, spinDeg: 36, liftYr: 2.2 },
]
const PETALS = 5
const CENTRE_ROUND = 6

function layerPiece(yr: number, hex: string, L: Layer): MotifPiece {
  const m = new MotifStrand(yr, hex)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  let below: Crown[] = intoRingRound(m, ring, new Array(L.centre[0]).fill('sc'))
  let r = ring.r + yr * rowPitchYr('sc')
  for (let q = 1; q < L.centre.length; q++) {
    const every = below.length / PETALS
    const a = crownRound(m, c, below, below.map((_, i) => (i % every === every - 1 ? 'inc' : 'st')), 'sc', r)
    below = a.crowns
    r = a.r
  }
  m.sectionName = 'petals'
  const per = below.length / PETALS
  if (per !== L.petal.length) throw new Error(`${L.name}: ${below.length} sts do not divide into ${PETALS} petals of ${L.petal.length}`)
  shapedRound(m, c, below, below.map((_, i) => L.petal[i % per]!), r)
  m.fastenOff(unit(sub(c, m.cursor)))
  const R = r + yr * rowPitchYr('dc')
  return pieceOf(L.name, m, m.finish(R * 2, R * 2), cupPose(yr, L))
}

/** Bend the flat layer onto a sphere of radius cupYr (arclength kept: the
 *  flat radius becomes an arc), turn it and lift it for the stack. */
function cupPose(yr: number, L: Layer): (p: V3) => V3 {
  const Rs = yr * L.cupYr
  const sp = (L.spinDeg * Math.PI) / 180
  const cs = Math.cos(sp), sn = Math.sin(sp)
  return (p) => {
    const r = Math.hypot(p.x, p.y)
    const phi = Math.min(r / Rs, Math.PI * 0.47)
    const rr = Rs * Math.sin(phi) + p.z * Math.cos(phi)
    const z = Rs * (1 - Math.cos(phi)) + p.z * Math.sin(phi) + (r > 1e-9 ? 0 : p.z)
    const ux = r > 1e-9 ? p.x / r : 1, uy = r > 1e-9 ? p.y / r : 0
    const x = rr * ux, y = rr * uy
    return { x: x * cs - y * sn, y: x * sn + y * cs, z: z + yr * L.liftYr + yr }
  }
}

function centrePiece(yr: number, hex: string, lift: number): MotifPiece {
  const m = new MotifStrand(yr, hex)
  const ring = m.magicRing({ x: 0, y: 0 })
  m.sectionName = 'centre'
  intoRingRound(m, ring, new Array(CENTRE_ROUND).fill('sc'))
  m.fastenOff({ x: 1, y: 0 })
  const R = ring.r + yr * rowPitchYr('sc') + yr
  return pieceOf('centre', m, m.finish(R * 2, R * 2), (p) => ({ x: p.x, y: p.y, z: p.z + lift }))
}

export function buildLayeredRose(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(LAYERED_ROSE_COLOURS, o)
  const yr = y.yr
  const outer = layerPiece(yr, col.main!, LAYERS[0]!)
  const inner = layerPiece(yr, col.inner!, LAYERS[1]!)
  const centre = centrePiece(yr, col.centre!, yr * (LAYERS[1]!.liftYr + 2.6))
  return assemble('layered-rose', 'Puff rose', o, [outer, inner, centre], layeredRoseWords(), materialsLine(o, ['dusty rose', 'lighter rose', 'pale blush']))
}

function layerWords(L: Layer): string[] {
  const lines = ['Make a magic ring.', `Round 1: ${L.centre[0]} ${UK.sc} into the ring. (${L.centre[0]} sts)`]
  for (let q = 1; q < L.centre.length; q++) {
    const every = L.centre[q - 1]! / PETALS
    const run = every === 1 ? '' : every === 2 ? `${UK.sc} in next st, ` : `${UK.sc} in each of the next ${every - 1} sts, `
    lines.push(every === 1
      ? `Round ${q + 1}: 2 ${UK.sc} in each st around. (${L.centre[q]} sts)`
      : `Round ${q + 1}: [${run}2 ${UK.sc} in next st] ${PETALS} times. (${L.centre[q]} sts)`)
  }
  const pt = L.petal.map((s) => (s.n === 1 ? `${UK[s.id]} in next st` : `${s.n} ${UK[s.id]} in next st`)).join(', ')
  const sts = L.petal.reduce((a, s) => a + s.n, 0) * PETALS
  lines.push(`Round ${L.centre.length + 1} (petals): [${pt}] ${PETALS} times. (${PETALS} petals, ${sts} sts)`)
  lines.push('Fasten off, leaving a tail for sewing.')
  return lines
}

export function layeredRoseWords(): string[] {
  return [
    'Outer petals, with dusty rose:', ...layerWords(LAYERS[0]!).map((s) => `  ${s}`),
    'Inner petals, with lighter rose:', ...layerWords(LAYERS[1]!).map((s) => `  ${s}`),
    'Centre, with pale blush:',
    '  Make a magic ring.',
    `  Round 1: ${CENTRE_ROUND} ${UK.sc} into the ring. (${CENTRE_ROUND} sts)`,
    '  Fasten off, pull the ring tight and leave a tail for sewing.',
    'Cup each petal layer in your hand so the petals stand up and curl in; sew the inner layer into the outer with its petals between the outer ones, then sew the centre in the middle. Sew through the middle of all three layers to hold the cup.',
  ]
}

registerMotif({ id: 'layered-rose', label: 'Puff rose', round: 9, colours: LAYERED_ROSE_COLOURS, build: buildLayeredRose })
