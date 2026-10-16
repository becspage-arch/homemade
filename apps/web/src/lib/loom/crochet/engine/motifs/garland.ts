/**
 * GARLAND (first assembly, audit rounds 8 + 9 together; bar: the flower wall
 * hanging of bar-flower-wall-hanging.png — roses, daisies, leaf vines and
 * berries hung on cords from a driftwood stick).
 *
 * Nothing new is stitched here: the garland takes the finished motifs (each
 * relaxed and audited in its own build) and SEWS them — a long olive chain is
 * the cord, and every piece is placed along it by a rigid pose on top of its
 * own. Three short cords hang from the stick: a leaf vine, a cord of roses
 * and a daisy between leaves, and a cord of berries with small leaves. The
 * stick itself is a prop in the scene (motifScene), not yarn.
 */

import type { StitchId } from '../dictionary'
import { MotifStrand } from './kit'
import { leafPiece } from './leaf'
// The motifs it sews (importing registers them).
import './leaf-vine'
import './rolled-rose'
import './daisy'
import './layered-rose'
import './berry'
import { getMotif } from './registry'
import { assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'
import type { MotifProp } from './motifScene'

export const GARLAND_COLOURS = { cord: '#46503a', leaf: '#4a553d' }
/** The cords, left to right: x (mm) along the stick and their length in chains. */
export const GARLAND_CORDS = [
  { x: -74, ch: 0 }, // the leaf vine's own chain is this cord
  { x: 0, ch: 48 },
  { x: 74, ch: 52 },
]
export const GARLAND_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'dc', 'hdc', 'sc']
const STICK_LEN = 210
const STICK_R = 5.5

/** A rigid placement of a finished piece: turn in the plane (deg), move. */
function placed(p: MotifPiece, name: string, at: V3, spinDeg = 0, flip = false): MotifPiece {
  const th = (spinDeg * Math.PI) / 180
  const cs = Math.cos(th), sn = Math.sin(th)
  const inner = p.pose
  return {
    ...p,
    name,
    pose: (q, i) => {
      const r = inner ? inner(q, i) : q
      const y = flip ? -r.y : r.y
      const z = flip ? -r.z : r.z
      return { x: at.x + r.x * cs - y * sn, y: at.y + r.x * sn + y * cs, z: at.z + z }
    },
  }
}

/** Where every piece of a built motif sits as a block: its posed centre. */
function centreOf(m: BuiltMotif): V3 {
  let sx = 0, sy = 0, n = 0, zMin = Infinity
  for (const p of m.pieces) {
    for (const ni of p.built.strandPath) {
      const q0 = p.built.model.nodes[ni]!
      const q = p.pose ? p.pose({ x: q0.x, y: q0.y, z: q0.z }, ni) : q0
      sx += q.x; sy += q.y; n++
      zMin = Math.min(zMin, q.z)
    }
  }
  return { x: sx / n, y: sy / n, z: zMin }
}

/** All the pieces of a finished motif placed with its centre at `at`. */
function placeMotif(m: BuiltMotif, label: string, at: V3, spinDeg = 0): MotifPiece[] {
  const c = centreOf(m)
  const th = (spinDeg * Math.PI) / 180
  const cs = Math.cos(th), sn = Math.sin(th)
  return m.pieces.map((p, k) => {
    const inner = p.pose
    return {
      ...p,
      name: `${label} ${p.name}${m.pieces.length > 1 ? '' : ''} ${k + 1}`.replace(/\s+/g, ' '),
      pose: (q, i) => {
        const r = inner ? inner(q, i) : q
        const x = r.x - c.x, y = r.y - c.y
        return { x: at.x + x * cs - y * sn, y: at.y + x * sn + y * cs, z: at.z + (r.z - c.z) }
      },
    }
  })
}

export function buildGarland(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(GARLAND_COLOURS, o)
  const yr = y.yr
  const pitch = yr * 2.6
  const pieces: MotifPiece[] = []
  // The cords: chains hanging from the stick (y = 0 is the stick's axis).
  const cordAt: ((k: number) => V3)[] = []
  GARLAND_CORDS.forEach((cd, i) => {
    if (cd.ch === 0) { cordAt.push(() => ({ x: cd.x, y: 0, z: 0 })); return }
    const m = new MotifStrand(yr, col.cord!)
    m.slipKnot({ x: cd.x, y: STICK_R + yr }, { x: 0, y: -1 })
    m.chain(cd.ch, [{ x: cd.x, y: STICK_R + yr }, { x: cd.x, y: STICK_R + yr - pitch * cd.ch }])
    m.fastenOff({ x: 0, y: -1 })
    const built = m.finish(yr * 4, pitch * cd.ch)
    pieces.push(pieceOf(`cord ${i + 1}`, m, built))
    const nodes = built.model.nodes
    cordAt.push((k) => {
      const yk = STICK_R + yr - pitch * (k + 0.5)
      let best = nodes[0]!, bd = Infinity
      for (const n of nodes) { const d = Math.abs(n.y - yk); if (d < bd) { bd = d; best = n } }
      return { x: best.x, y: best.y, z: best.z + yr * 1.2 }
    })
  })
  // One small leaf, audited once, sewn many times.
  const leaf = leafPiece(yr, col.leaf!, GARLAND_LEAF_SIDE, 2, 'leaf')
  const ln = leaf.built.model.nodes
  let se = ln[0]!
  for (const n of ln) if (n.x < se.x) se = n
  const leafAt = (at: V3, angDeg: number, flip: boolean, name: string): MotifPiece =>
    placed({ ...leaf, pose: (q) => ({ x: q.x - se.x, y: q.y - se.y, z: q.z - se.z }) }, name, at, angDeg, flip)

  // Cord 1: the leaf vine (its own motif, hung as it is).
  const vine = getMotif('leaf-vine').build(o)
  const vc = centreOf(vine)
  const vineTop = Math.max(...vine.pieces[0]!.built.model.nodes.map((n) => n.y))
  pieces.push(...placeMotif(vine, 'vine', { x: GARLAND_CORDS[0]!.x, y: STICK_R + yr - (vineTop - vc.y), z: 0 }))
  // Cord 2: a rolled rose, a daisy below it, a puff rose below that, leaves between.
  const c2 = cordAt[1]!
  const rose = getMotif('rolled-rose').build(o)
  // The daisy in a finer thread: at 4 ply it is half as wide again as the rose, and the bar's daisies are the smaller flower.
  const daisy = getMotif('daisy').build({ ...o, yarnWeight: 'lace' })
  const puff = getMotif('layered-rose').build(o)
  pieces.push(...placeMotif(rose, 'rose', { ...c2(7), z: 0 }, 20))
  pieces.push(leafAt(c2(15), -150, false, 'leaf a'), leafAt(c2(17), -30, true, 'leaf b'))
  pieces.push(...placeMotif(daisy, 'daisy', { ...c2(27), z: 0 }, 10))
  pieces.push(leafAt(c2(37), -140, false, 'leaf c'))
  pieces.push(...placeMotif(puff, 'puff rose', { ...c2(43), z: 0 }))
  // Cord 3: berries and small leaves.
  const c3 = cordAt[2]!
  const berry = getMotif('berry').build(o)
  const berryAt = (k: number, side: number): MotifPiece[] => {
    const at = c3(k)
    // the berry's own stalk is the cord here: hang the ball just off the cord
    const ball = berry.pieces.filter((p) => p.name !== 'stalk')
    return placeMotif({ ...berry, pieces: ball }, 'berry', { x: at.x + side * yr * 4, y: at.y, z: 0 }, side > 0 ? -12 : 12)
  }
  pieces.push(leafAt(c3(5), -35, true, 'leaf d'), ...berryAt(11, -1), leafAt(c3(18), -145, false, 'leaf e'),
    ...berryAt(25, 1), leafAt(c3(32), -40, true, 'leaf f'), ...berryAt(39, -1), leafAt(c3(46), -150, false, 'leaf g'))
  const words = garlandWords()
  return assemble('garland', 'Flower garland', o, pieces, words, materialsLine(o, ['olive', 'sage', 'dusty mauve', 'dusty rose', 'cream', 'mustard', 'terracotta']).concat(['A small ball of lace-weight cotton in cream and mustard for the daisy, with a 1.75 mm hook.', 'A driftwood stick about 18 cm long.']))
}

/** The driftwood stick the garland hangs from, as a scene prop. */
export function garlandProps(): MotifProp[] {
  return [{
    centre: { x: 0, y: 0, z: STICK_R },
    axes: [{ x: STICK_LEN / 2, y: 0, z: 0 }, { x: 0, y: STICK_R, z: 0 }, { x: 0, y: 0, z: STICK_R * 0.8 }],
    hex: '#b8a68e',
    gloss: 0.25,
  }]
}

export function garlandWords(): string[] {
  return [
    'Make the pieces: one leaf vine, one rolled rose, one daisy (in the lace-weight cotton, 1.75 mm hook), one puff rose, three berries (without stalks) and seven small leaves (the vine leaf, stem 2).',
    `Cords: with olive, ch ${GARLAND_CORDS.filter((c) => c.ch).map((c) => c.ch).join(' and ch ')} for the two cords (the vine's chain is the third), each starting with a long tail to tie to the stick.`,
    'Tie the vine and the two cords to the stick about 4.5 cm apart. Sew the rolled rose, two leaves, the daisy, a leaf and the puff rose down the middle cord; sew the berries and small leaves alternately down the right cord.',
    'Weave in the ends behind the pieces.',
  ]
}

registerMotif({ id: 'garland', label: 'Flower garland', round: 9, colours: GARLAND_COLOURS, build: buildGarland })
