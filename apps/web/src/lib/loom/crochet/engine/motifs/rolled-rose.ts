/**
 * ROLLED ROSE (audit round 9; bar: the dusty-pink spiral roses of
 * bar-flower-wall-hanging.png; built-how ref real/9-bridal-bouquet.jpg).
 *
 * A strip, rolled and sewn: a long foundation chain, then ONE row worked back
 * along it of graded scallop petals — each petal a run of stitches rising and
 * falling in height across the chains (no shared base, so nothing crowds),
 * separated by a sl st — small petals at the start of the row, tall ones at the
 * end. The strip is then rolled from its start (the small petals become the
 * tight centre) and the base stitched through; the rolled strip is the pose,
 * applied after the flat strip is relaxed and audited exactly as worked.
 */

import type { StitchId } from '../dictionary'
import { MotifStrand } from './kit'
import { intoChain, runWords } from './leaf'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const ROLLED_ROSE_COLOURS = { main: '#ad6c7a' } // dusty mauve (pinks render lighter and warmer)

/** The petals in work order (the first ones roll into the centre). */
export const ROSE_PETALS: { n: number; sts: StitchId[] }[] = [
  { n: 3, sts: ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc'] },
  { n: 3, sts: ['sc', 'dc', 'tr', 'tr', 'dc', 'sc'] },
  { n: 3, sts: ['hdc', 'dc', 'tr', 'tr', 'tr', 'dc', 'hdc'] },
]

/** Spiral pitch (radial growth per turn) as a multiple of the yarn radius, and
 *  the outward lean of the rolled petals from centre to rim (deg). */
const ROLL_PITCH_YR = 3.8
const ROLL_R0_YR = 1.6
const LEAN0 = 6
const LEAN1 = 32

export function rosePetalList(): StitchId[][] {
  const out: StitchId[][] = []
  for (const g of ROSE_PETALS) for (let i = 0; i < g.n; i++) out.push(g.sts)
  return out
}

/** A rolled strip as one piece: the foundation chain, one row of `petals`
 *  (each a run of stitches, then a sl st) worked back along it, relaxed and
 *  audited flat, then posed rolled. */
export function rolledStrip(
  yr: number, hex: string, petals: StitchId[][], name = 'rose',
  roll: { pitchYr?: number; r0Yr?: number; lean0?: number; lean1?: number; turnsFull?: number } = {},
): MotifPiece {
  const worked = petals.reduce((a, p) => a + p.length + 1, 0) // each petal + its sl st
  const nCh = worked + 1 // + the turning chain
  const pitch = yr * 2.6
  const m = new MotifStrand(yr, hex)
  // The foundation chain, made along −x; the row is worked back along +x with
  // the petals standing toward −y.
  m.slipKnot({ x: 0, y: 0 }, { x: -1, y: 0 })
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -pitch * nCh, y: 0 }], { turning: 1 })
  m.sectionName = 'petals'
  let k = nCh - 2 // the 2nd chain from the hook
  for (const p of petals) {
    for (const id of p) intoChain(m, loops[k--]!, id, 'L')
    intoChain(m, loops[k--]!, 'slst', 'L')
  }
  m.fastenOff({ x: 1, y: 0 })
  const built = m.finish(pitch * nCh, yr * 14)
  // Where the row starts (the first petal): the far end of the chain.
  const x0 = Math.max(...built.model.nodes.slice(4).map((n) => n.x))
  const o = {
    pitch: yr * (roll.pitchYr ?? ROLL_PITCH_YR), r0: yr * (roll.r0Yr ?? ROLL_R0_YR),
    lean0: roll.lean0 ?? LEAN0, lean1: roll.lean1 ?? LEAN1, turnsFull: roll.turnsFull ?? 3.2,
  }
  return pieceOf(name, m, built, (p) => rollPose(p, x0, yr, o))
}

export function buildRolledRose(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(ROLLED_ROSE_COLOURS, o)
  const piece = rolledStrip(y.yr, col.main!, rosePetalList())
  return assemble('rolled-rose', 'Rolled rose', o, [piece], rolledRoseWords(), materialsLine(o, ['dusty pink']))
}

/**
 * Roll the flat strip: arclength from the row's start along the chain becomes
 * an Archimedean spiral round the rose's centre (z up), the stitch height (−y)
 * stands up out of the table leaning outward more on each turn, the strip's
 * own thickness (z) lies radially. A rigid bend of the relaxed strip — the
 * maker's rolling — so the audited stitches are not moved relative to one
 * another along the strip.
 */
function rollPose(p: V3, x0: number, yr: number, o: { pitch: number; r0: number; lean0: number; lean1: number; turnsFull: number }): V3 {
  const s = Math.max(0, x0 - p.x)
  const b = o.pitch / (Math.PI * 2)
  const r0 = o.r0
  // arclength of r = r0 + bθ ≈ r0θ + bθ²/2 → θ(s)
  const th = (-r0 + Math.sqrt(r0 * r0 + 2 * b * s)) / b
  const r = r0 + b * th
  const turns = th / (Math.PI * 2)
  const lean = ((o.lean0 + (o.lean1 - o.lean0) * Math.min(1, turns / o.turnsFull)) * Math.PI) / 180
  const h = Math.max(0, -p.y) // height up the strip
  const rr = r + p.z + h * Math.sin(lean)
  return { x: rr * Math.cos(th), y: rr * Math.sin(th), z: h * Math.cos(lean) + yr }
}

export function rolledRoseWords(): string[] {
  const petals = rosePetalList()
  const worked = petals.reduce((a, p) => a + p.length + 1, 0)
  const nCh = worked + 1
  const groups = ROSE_PETALS.map((g, i) => {
    const first = i === 0 ? ' (starting in the 2nd ch from hook)' : ''
    return `[${runWords(g.sts)}, sl st in next ch] ${g.n} times${first}`
  })
  void UK
  return [
    `Ch ${nCh}.`,
    `Row 1 (petals): ${groups.join(', then ')}. (${petals.length} petals)`,
    'Fasten off, leaving a long tail.',
    'Starting from the small petals, roll the strip up with the chain edge at the bottom, letting the petals open out as you go; stitch through all the layers at the base with the tail to hold the roll.',
  ]
}

registerMotif({ id: 'rolled-rose', label: 'Rolled rose', round: 9, colours: ROLLED_ROSE_COLOURS, build: buildRolledRose })
