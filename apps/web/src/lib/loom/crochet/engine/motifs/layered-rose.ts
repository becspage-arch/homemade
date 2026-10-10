/**
 * LAYERED ROSE (audit round 9; bar: the small cupped pink roses of
 * bar-flower-wall-hanging.png; built-how ref real/9-big-rose-stem.jpg, graded
 * petals in layers).
 *
 * Two pieces sewn together: a flat petal base worked in the round (a small flat
 * centre, then a round whose outline is five petals — into each group of
 * stitches short, tall, tall, short: the heights make the rounded petal) and,
 * on it, a cupped heart of petals: a strip of graded petals worked along a
 * chain (rolled-rose.ts), rolled tightly with the petals standing nearly
 * upright, so the layers of the rose are the turns of the roll.
 *
 * (Round 2 stacked two flat petal layers under a small rolled bud: it rendered
 * as a flat scruffy disc, nothing like the bar's small cupped roses.)
 */

import type { StitchId } from '../dictionary'
import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, shapedRound, sub, unit, type Crown } from './kit'
import { rolledStrip } from './rolled-rose'
import { runWords } from './leaf'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const LAYERED_ROSE_COLOURS = { main: '#dba3a6', base: '#c98589' } // rose pink, deeper pink

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
  ['sc', 'hdc', 'dc', 'hdc', 'sc'],
  ['hdc', 'dc', 'dc', 'dc', 'hdc'],
  ['hdc', 'dc', 'dc', 'dc', 'hdc'],
  ['hdc', 'dc', 'tr', 'dc', 'hdc'],
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
  // The petal base (one flat layer of five petals) under a cupped rolled heart
  // of petals that grow outward — the rose's layers are the turns of the roll,
  // each petal standing nearly upright so the heart is a cup, not a disc.
  const base = layerPiece(yr, col.base!, LAYERS[1]!)
  const budRaw = rolledStrip(yr, col.main!, BUD_PETALS, 'petals', { pitchYr: 3.6, r0Yr: 1.2, lean0: 2, lean1: 24, turnsFull: 2.4 })
  const bud: MotifPiece = { ...budRaw, pose: (p, i) => { const q = budRaw.pose!(p, i); return { x: q.x, y: q.y, z: q.z + yr * 2.0 } } }
  return assemble('layered-rose', 'Layered rose', o, [base, bud], layeredRoseWords(), materialsLine(o, ['rose pink', 'deeper pink']))
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
  const nCh = BUD_PETALS.reduce((a, p) => a + p.length + 1, 0) + 1
  const petals = BUD_PETALS.map((p) => `[${runWords(p)}, sl st in next ch]`).join(', ')
  return [
    'Base, with deeper pink:', ...layerWords(LAYERS[1]!).map((s) => `  ${s}`),
    'Petals, with rose pink:',
    `  Ch ${nCh}.`,
    `  Row 1: starting in the 2nd ch from hook, ${petals}. (${BUD_PETALS.length} petals)`,
    '  Fasten off, leaving a long tail.',
    'Roll the petal strip up tightly from the small petals, keeping the chain edge level at the bottom and the petals standing up so the rose is cupped; stitch through all the layers at the base. Sew the rose to the middle of the base.',
  ]
}

registerMotif({ id: 'layered-rose', label: 'Layered rose', round: 9, colours: LAYERED_ROSE_COLOURS, build: buildLayeredRose })
