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
import './butterfly'
import { getMotif } from './registry'
import { assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'
import type { MotifProp } from './motifScene'

export const GARLAND_COLOURS = { cord: '#46503a', leaf: '#4a553d' }
/** The cords, left to right: x (mm) along the stick and their length in chains. */
export const GARLAND_CORDS = [
  { x: -124, ch: 0 }, // the leaf vine's own chain is this cord
  { x: -62, ch: 58 },
  { x: 0, ch: 64 },
  { x: 62, ch: 60 },
  { x: 124, ch: 0 }, // a second vine
]
export const GARLAND_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'dc', 'hdc', 'sc']
const STICK_LEN = 310
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

  // Cords 1 and 5: leaf vines (their own motif, hung as they are; the second turned so its leaves alternate the other way).
  const vine = getMotif('leaf-vine').build(o)
  const vc = centreOf(vine)
  const vineTop = Math.max(...vine.pieces[0]!.built.model.nodes.map((n) => n.y))
  const vineY = STICK_R + yr - (vineTop - vc.y)
  pieces.push(...placeMotif(vine, 'vine', { x: GARLAND_CORDS[0]!.x, y: vineY, z: 0 }))
  pieces.push(...placeMotif(vine, 'vine 2', { x: GARLAND_CORDS[4]!.x, y: vineY, z: 0 }).map((p) => {
    const inner = p.pose!
    return { ...p, pose: (q: V3, i: number) => { const r = inner(q, i); return { x: 2 * GARLAND_CORDS[4]!.x - r.x, y: r.y, z: r.z } } }
  }))
  const rose = getMotif('rolled-rose').build(o)
  // The daisy in a finer thread: at 4 ply it is half as wide again as the rose, and the bar's daisies are the smaller flower.
  const daisy = getMotif('daisy').build({ ...o, yarnWeight: 'lace' })
  const puff = getMotif('layered-rose').build(o)
  const berry = getMotif('berry').build(o)
  const berryAt = (c: (k: number) => V3, k: number, side: number, label: string): MotifPiece[] => {
    const at = c(k)
    // the berry's own stalk is the cord here: hang the ball just off the cord
    const ball = berry.pieces.filter((p) => p.name !== 'stalk')
    return placeMotif({ ...berry, pieces: ball }, label, { x: at.x + side * yr * 4, y: at.y, z: 0 }, side > 0 ? -12 : 12)
  }
  // Cord 2: a rolled rose at the top, leaves, a daisy, a berry.
  const c2 = cordAt[1]!
  pieces.push(...placeMotif(rose, 'rose', { ...c2(6), z: 0 }, 20))
  pieces.push(leafAt(c2(14), -150, false, 'leaf a'), leafAt(c2(16), -30, true, 'leaf b'))
  pieces.push(...placeMotif(daisy, 'daisy', { ...c2(25), z: 0 }, 10))
  pieces.push(leafAt(c2(33), -140, false, 'leaf c'), ...berryAt(c2, 39, 1, 'berry a'), leafAt(c2(46), -35, true, 'leaf k'), leafAt(c2(53), -145, false, 'leaf l'))
  // Cord 3: a daisy, leaves, a puff rose, a leaf, a rose at the bottom.
  const c3 = cordAt[2]!
  pieces.push(...placeMotif(daisy, 'daisy 2', { ...c3(5), z: 0 }, -15))
  pieces.push(leafAt(c3(13), -35, true, 'leaf d'), leafAt(c3(15), -145, false, 'leaf e'))
  pieces.push(...placeMotif(puff, 'puff rose', { ...c3(23), z: 0 }))
  pieces.push(leafAt(c3(31), -40, true, 'leaf f'))
  pieces.push(...placeMotif(rose, 'rose 2', { ...c3(42), z: 0 }, -40))
  pieces.push(leafAt(c3(52), -40, true, 'leaf m'), ...berryAt(c3, 58, -1, 'berry e'))
  // A butterfly resting between the first cords, just under the stick.
  const butterfly = getMotif('butterfly').build(o)
  pieces.push(...placeMotif(butterfly, 'butterfly', { x: -31, y: -STICK_R - yr * 14, z: 0 }, 25))
  // Cord 4: a puff rose, then berries and small leaves.
  const c4 = cordAt[3]!
  pieces.push(...placeMotif(puff, 'puff rose 2', { ...c4(5), z: 0 }, 36))
  pieces.push(leafAt(c4(12), -35, true, 'leaf g'), ...berryAt(c4, 18, -1, 'berry b'), leafAt(c4(25), -145, false, 'leaf h'),
    ...berryAt(c4, 32, 1, 'berry c'), leafAt(c4(39), -40, true, 'leaf i'), ...berryAt(c4, 46, -1, 'berry d'), leafAt(c4(52), -150, false, 'leaf j'), leafAt(c4(58), -40, true, 'leaf n'))
  const words = garlandWords()
  return assemble('garland', 'Flower garland', o, pieces, words, materialsLine(o, ['olive', 'sage', 'dusty mauve', 'dusty rose', 'cream', 'mustard', 'terracotta']).concat(['A small ball of lace-weight cotton in cream and mustard for the daisy, with a 1.75 mm hook.', 'A driftwood stick about 30 cm long.']))
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
    'Make the pieces: two leaf vines, two rolled roses, two daisies (in the lace-weight cotton, 1.75 mm hook), two puff roses, one butterfly, five berries (without stalks) and fourteen small leaves (the vine leaf, stem 2).',
    `Cords: with olive, ch ${GARLAND_CORDS.filter((c) => c.ch).map((c) => c.ch).join(', ch ')} for the three middle cords (the vines' chains are the outer two), each starting with a long tail to tie to the stick.`,
    'Tie the vines and the three cords to the stick about 6 cm apart. Down the left cord sew a rolled rose, two leaves, a daisy, a leaf and a berry; down the middle cord a daisy, two leaves, a puff rose, a leaf and the second rose; down the right cord the second puff rose, then berries and small leaves alternately. Sew the butterfly just under the stick between the first two cords.',
    'Weave in the ends behind the pieces.',
  ]
}

registerMotif({ id: 'garland', label: 'Flower garland', round: 9, colours: GARLAND_COLOURS, build: buildGarland })
