/**
 * LAYERED ROSE (audit round 9; bar: the small cupped pink roses of
 * bar-flower-wall-hanging.png; built-how ref real/9-big-rose-stem.jpg, graded
 * petals in layers).
 *
 * Three pieces stacked and sewn, the way layered roses are made: two flat petal
 * layers worked in the round — a small flat centre, then one round whose
 * outline is the petals (into each group of stitches short, tall, tall, short:
 * the heights make the rounded petal) — a large one
 * underneath and a smaller one on top turned half a petal, and a rolled bud of
 * small petals (rolled-rose.ts) sewn in the middle.
 */

import type { StitchId } from '../dictionary'
import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, shapedRound, sub, unit, type Crown } from './kit'
import { rolledStrip } from './rolled-rose'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const LAYERED_ROSE_COLOURS = { main: '#d4919a' } // rose pink

interface Layer {
  name: string
  centre: number[]
  /** Into each group of the last centre round: stitch and count, per crown. */
  petal: { id: StitchId; n: number }[]
}

const one = (ids: StitchId[]): { id: StitchId; n: number }[] => ids.map((id) => ({ id, n: 1 }))
/** One stitch into each crown. (Fanning two or three tall stitches into one
 *  crown of the flat centre crowded the second post out of its own yarn-over
 *  collars — 5/105-110 interlocks failed — so each petal spreads over as many
 *  crowns as it has stitches and takes its rounded outline from the heights.) */
export const LAYERS: Layer[] = [
  { name: 'outer petals', centre: [5, 10, 15, 20, 25, 30], petal: one(['sc', 'dc', 'tr', 'tr', 'dc', 'sc']) },
  { name: 'inner petals', centre: [5, 10, 15, 20], petal: one(['sc', 'dc', 'dc', 'sc']) },
]
const PETALS = 5

export const BUD_PETALS: StitchId[][] = [
  ['sc', 'hdc', 'hdc', 'sc'],
  ['sc', 'hdc', 'dc', 'hdc', 'sc'],
  ['hdc', 'dc', 'dc', 'dc', 'hdc'],
]

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
  const R = r + yr * rowPitchYr('tr')
  return pieceOf(L.name, m, m.finish(R * 2, R * 2))
}

export function buildLayeredRose(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(LAYERED_ROSE_COLOURS, o)
  const yr = y.yr
  const outer = layerPiece(yr, col.main!, LAYERS[0]!)
  const innerRaw = layerPiece(yr, col.main!, LAYERS[1]!)
  const half = Math.PI / PETALS
  const cs = Math.cos(half), sn = Math.sin(half)
  // Each layer sewn on the one below, a yarn's thickness up, turned half a petal.
  const inner: MotifPiece = { ...innerRaw, pose: (p) => ({ x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: p.z + yr * 2.2 }) }
  const budRaw = rolledStrip(yr, col.main!, BUD_PETALS, 'bud', { pitchYr: 3.6, r0Yr: 1.2, lean0: 4, lean1: 22, turnsFull: 1.5 })
  const bud: MotifPiece = { ...budRaw, pose: (p, i) => { const q = budRaw.pose!(p, i); return { x: q.x, y: q.y, z: q.z + yr * 3.4 } } }
  return assemble('layered-rose', 'Layered rose', o, [outer, inner, bud], layeredRoseWords(), materialsLine(o, ['rose pink']))
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
    'Outer layer:', ...layerWords(LAYERS[0]!).map((s) => `  ${s}`),
    'Inner layer:', ...layerWords(LAYERS[1]!).map((s) => `  ${s}`),
    `Bud: ch ${BUD_PETALS.reduce((a, p) => a + p.length + 1, 0) + 1}; starting in the 2nd ch from hook, work ${BUD_PETALS.length} petals [the petal's sts, one in each ch, then sl st in next ch], growing from ${BUD_PETALS[0]!.map((id) => UK[id]).join(', ')} to ${BUD_PETALS[BUD_PETALS.length - 1]!.map((id) => UK[id]).join(', ')}. Fasten off; roll up tightly from the small end and stitch through the base.`,
    'Sew the inner layer on the outer, turned so its petals sit between the outer petals; sew the bud in the middle.',
  ]
}

registerMotif({ id: 'layered-rose', label: 'Layered rose', round: 9, colours: LAYERED_ROSE_COLOURS, build: buildLayeredRose })
