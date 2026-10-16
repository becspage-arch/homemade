/**
 * GARLAND — the flower WALL HANGING (audit rounds 8 + 9 together; bar:
 * bar-flower-wall-hanging.png — big roses, daisies, puff flowers and buds
 * packed along a driftwood branch, butterflies among them, and long leaf vines
 * and cords hanging straight down by gravity at many lengths, berries at the
 * ends).
 *
 * Nothing new is stitched here: the garland takes the finished motifs (each
 * relaxed and audited in its own build) and SEWS them. Eleven cords hang from
 * the branch, six of them leaf vines (a long olive chain with small two-sided
 * leaves sewn alternately all the way down) and five plain chains ending in a
 * berry. The flowers are sewn in a dense band along the top over the cords,
 * overlapping: the roses and puff flowers in front, the daisies and buds
 * between them, small leaves tucked behind. Every placement is a rigid pose of
 * a finished piece. Engine +y is UP (the branch's axis is y = 0; the cords hang
 * to negative y); motifScene's `hang` view stands it upright on the wall
 * stage. The branch and the hanging string are scene props, not yarn.
 *
 * (Round 6-8: three to five cords on a straight stick, shot as a flat-lay on
 * linen — a sparse lattice, small in frame. Round 9: upright, eleven cords,
 * the dense band, buds, two butterflies, a real branch.)
 */

import type { StitchId } from '../dictionary'
import { MotifStrand } from './kit'
import { leafPiece } from './leaf'
import { VINE_LEAF_SIDE, VINE_LEAF_STEM } from './leaf-vine'
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
/** The cords, left to right: x (mm) along the branch, their length in chains,
 *  and what they are: a leaf vine, or a plain cord with a berry at the end. */
export const GARLAND_CORDS: { x: number; ch: number; kind: 'vine' | 'berry' }[] = [
  { x: -140, ch: 50, kind: 'vine' },
  { x: -112, ch: 34, kind: 'berry' },
  { x: -84, ch: 40, kind: 'vine' },
  { x: -56, ch: 26, kind: 'berry' },
  { x: -28, ch: 60, kind: 'vine' },
  { x: 0, ch: 44, kind: 'berry' },
  { x: 28, ch: 30, kind: 'berry' },
  { x: 56, ch: 54, kind: 'vine' },
  { x: 84, ch: 20, kind: 'berry' },
  { x: 112, ch: 42, kind: 'vine' },
  { x: 140, ch: 32, kind: 'berry' },
]
/** A vine's leaves: the first at this chain, then every `VINE_EVERY` chains, alternating sides. */
export const VINE_FIRST = 7
export const VINE_EVERY = 6
/** The small leaf tucked behind the flowers in the band. */
export const GARLAND_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'dc', 'hdc', 'sc']
const BRANCH_LEN = 360
const BRANCH_R = 6

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

/** Where every piece of a built motif sits as a block: its posed centre, and its lowest relief. */
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

/** All the pieces of a finished motif placed with its centre at `at` (its back on z = at.z). */
function placeMotif(m: BuiltMotif, label: string, at: V3, spinDeg = 0): MotifPiece[] {
  const c = centreOf(m)
  const th = (spinDeg * Math.PI) / 180
  const cs = Math.cos(th), sn = Math.sin(th)
  return m.pieces.map((p, k) => {
    const inner = p.pose
    return {
      ...p,
      name: `${label} ${p.name} ${k + 1}`.replace(/\s+/g, ' '),
      pose: (q, i) => {
        const r = inner ? inner(q, i) : q
        const x = r.x - c.x, y = r.y - c.y
        return { x: at.x + x * cs - y * sn, y: at.y + x * sn + y * cs, z: at.z + (r.z - c.z) }
      },
    }
  })
}

/** The band of flowers along the top (x, y in mm below the branch; z = how far
 *  forward it is sewn; spin deg). Roses and puff flowers in front, daisies and
 *  buds between, so they overlap the way the bar's do. */
export const GARLAND_BAND: { what: 'rose' | 'puff' | 'bud' | 'daisy' | 'butterfly'; x: number; y: number; z: number; spin?: number }[] = [
  { what: 'daisy', x: -120, y: -22, z: 4 },
  { what: 'daisy', x: -50, y: -16, z: 4, spin: 12 },
  { what: 'daisy', x: 8, y: -20, z: 4, spin: -8 },
  { what: 'daisy', x: 64, y: -14, z: 4, spin: 20 },
  { what: 'daisy', x: 146, y: -38, z: 4, spin: 5 },
  { what: 'daisy', x: -98, y: -56, z: 4, spin: -14 },
  { what: 'bud', x: -52, y: -60, z: 6 },
  { what: 'bud', x: 12, y: -62, z: 6, spin: 30 },
  { what: 'bud', x: 108, y: -64, z: 6, spin: 15 },
  { what: 'puff', x: -22, y: -40, z: 7 },
  { what: 'puff', x: 86, y: -46, z: 7, spin: 36 },
  { what: 'rose', x: -78, y: -32, z: 8, spin: 20 },
  { what: 'rose', x: 42, y: -36, z: 8, spin: -30 },
  { what: 'rose', x: 124, y: -22, z: 7, spin: 60 },
  { what: 'butterfly', x: -148, y: -46, z: 5, spin: 20 },
  { what: 'butterfly', x: 150, y: -6, z: 5, spin: -15 },
]
/** Small leaves tucked behind the band: x, y, angle (deg, 0 = pointing right), flipped. */
const BAND_LEAVES: [number, number, number, boolean][] = [
  [-132, -10, -150, false], [-100, -30, -40, true], [-64, -40, -160, false], [-36, -14, -30, true],
  [-8, -56, -140, false], [28, -12, -35, true], [58, -56, -150, false], [100, -30, -40, true],
  [134, -56, -140, false], [-86, -72, -120, false], [36, -70, -60, true], [120, -8, -20, true],
]

export function buildGarland(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(GARLAND_COLOURS, o)
  const yr = y.yr
  const pitch = yr * 2.6
  const pieces: MotifPiece[] = []
  // Two leaves, each audited once and sewn many times: the vine leaf and the small band leaf.
  const stemEnd = (leaf: MotifPiece): V3 => {
    const ln = leaf.built.model.nodes
    let se = ln[0]!
    for (const n of ln) if (n.x < se.x) se = n
    return { x: se.x, y: se.y, z: se.z }
  }
  const vineLeaf = leafPiece(yr, col.leaf!, VINE_LEAF_SIDE, VINE_LEAF_STEM, 'vine leaf')
  const bandLeaf = leafPiece(yr, col.leaf!, GARLAND_LEAF_SIDE, 2, 'leaf')
  const leafAt = (proto: MotifPiece, at: V3, angDeg: number, flip: boolean, name: string): MotifPiece => {
    const se = stemEnd(proto)
    return placed({ ...proto, pose: (q) => ({ x: q.x - se.x, y: q.y - se.y, z: q.z - se.z }) }, name, at, angDeg, flip)
  }
  const berry = getMotif('berry').build(o)
  const ball = { ...berry, pieces: berry.pieces.filter((p) => p.name !== 'stalk') }
  // The cords: chains hanging straight down from the branch (y = 0 is its axis).
  GARLAND_CORDS.forEach((cd, i) => {
    const m = new MotifStrand(yr, col.cord!)
    const top = { x: cd.x, y: BRANCH_R + yr }
    m.slipKnot(top, { x: 0, y: -1 })
    m.chain(cd.ch, [top, { x: cd.x, y: top.y - pitch * cd.ch }])
    m.fastenOff({ x: 0, y: -1 })
    const built = m.finish(yr * 4, pitch * cd.ch)
    pieces.push(pieceOf(`cord ${i + 1}`, m, built))
    const nodes = built.model.nodes
    const at = (k: number): V3 => {
      const yk = top.y - pitch * (k + 0.5)
      let best = nodes[0]!, bd = Infinity
      for (const n of nodes) { const d = Math.abs(n.y - yk); if (d < bd) { bd = d; best = n } }
      return { x: best.x, y: best.y, z: best.z + yr * 1.2 }
    }
    if (cd.kind === 'vine') {
      let side = i % 2 === 0
      for (let k = VINE_FIRST; k < cd.ch - 2; k += VINE_EVERY) {
        pieces.push(leafAt(vineLeaf, at(k), side ? -35 : -145, side, `vine ${i + 1} leaf ${k}`))
        side = !side
      }
      // a last leaf at the very end of the vine, hanging straight down
      pieces.push(leafAt(vineLeaf, at(cd.ch - 1), -90, false, `vine ${i + 1} tip leaf`))
    } else {
      const end = at(cd.ch - 1)
      pieces.push(...placeMotif(ball, `berry ${i + 1}`, { x: end.x, y: end.y - 9, z: 0 }, i % 2 ? 10 : -10))
    }
  })
  // The band of flowers over the cords.
  const rose = getMotif('rolled-rose').build(o)
  // The daisy in a finer thread: at 4 ply it is half as wide again as the rose, and the bar's daisies are the smaller flower.
  const daisy = getMotif('daisy').build({ ...o, yarnWeight: 'lace' })
  const puff = getMotif('layered-rose').build(o)
  const bud = getMotif('layered-rose').build({ ...o, bud: true })
  const butterfly = getMotif('butterfly').build(o)
  const motifs = { rose, daisy, puff, bud, butterfly }
  const counts: Record<string, number> = {}
  BAND_LEAVES.forEach(([x, yy, ang, flip], k) => pieces.push(leafAt(bandLeaf, { x, y: yy, z: 1.5 }, ang, flip, `band leaf ${k + 1}`)))
  for (const b of GARLAND_BAND) {
    counts[b.what] = (counts[b.what] ?? 0) + 1
    pieces.push(...placeMotif(motifs[b.what], `${b.what} ${counts[b.what]}`, { x: b.x, y: b.y, z: b.z }, b.spin ?? 0))
  }
  const words = garlandWords()
  return assemble('garland', 'Flower wall hanging', o, pieces, words, materialsLine(o, ['olive', 'sage', 'dusty mauve', 'dusty rose', 'cream', 'mustard', 'terracotta', 'dusty blue']).concat(['A small ball of lace-weight cotton in cream and mustard for the daisies, with a 1.75 mm hook.', 'A piece of driftwood about 36 cm long and a length of jute string to hang it.']))
}

/** The driftwood branch the garland hangs from, and its hanging string, as scene props. */
export function garlandProps(): MotifProp[] {
  const branch: { p: V3; r: number }[] = []
  const n = 14
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const x = -BRANCH_LEN / 2 + BRANCH_LEN * t
    // a gently bowed, slightly crooked bough, thicker at the left
    const yb = Math.sin(t * Math.PI) * 6 + Math.sin(k * 2.1) * 1.4
    const zb = BRANCH_R + Math.sin(k * 1.3) * 1.2
    branch.push({ p: { x, y: yb, z: zb }, r: BRANCH_R * (1.1 - 0.25 * t) * (1 + 0.08 * Math.sin(k * 2.7)) })
  }
  const string: { p: V3; r: number }[] = [
    { p: { x: -126, y: 8, z: BRANCH_R }, r: 1.3 }, { p: { x: -60, y: 56, z: BRANCH_R }, r: 1.3 },
    { p: { x: 0, y: 100, z: BRANCH_R }, r: 1.3 },
    { p: { x: 60, y: 56, z: BRANCH_R }, r: 1.3 }, { p: { x: 126, y: 8, z: BRANCH_R }, r: 1.3 },
  ]
  return [{ branch, hex: '#8a7a66' }, { branch: string, hex: '#b9a07a' }]
}

export function garlandWords(): string[] {
  const vines = GARLAND_CORDS.filter((c) => c.kind === 'vine')
  const berries = GARLAND_CORDS.filter((c) => c.kind === 'berry')
  const band = GARLAND_BAND.reduce<Record<string, number>>((a, b) => ({ ...a, [b.what]: (a[b.what] ?? 0) + 1 }), {})
  const leaves = vines.reduce((a, c) => a + Math.ceil((c.ch - 2 - VINE_FIRST) / VINE_EVERY) + 1, 0)
  return [
    `Make the pieces: ${band.rose} rolled roses, ${band.puff} puff roses, ${band.bud} rosebuds, ${band.daisy} daisies (in the lace-weight cotton, 1.75 mm hook), ${band.butterfly} butterflies, ${berries.length} berries (without stalks), ${leaves} vine leaves (the leaf vine's leaf) and ${BAND_LEAVES.length} small leaves (the vine leaf two tr shorter, stem 2).`,
    `Cords: with olive, leaving a long tail to tie to the branch, ch ${GARLAND_CORDS.map((c) => c.ch).join(', ch ')} (left to right); fasten off each.`,
    `Tie the cords to the branch about 3 cm apart. Vines (cords ${vines.map((c) => GARLAND_CORDS.indexOf(c) + 1).join(', ')}): sew a vine leaf at ch ${VINE_FIRST} and every ${VINE_EVERY} chains down, alternating sides, each angled down, and one at the end pointing straight down. Berry cords: sew a berry over the last chain.`,
    'The band: sew the small leaves to the cords just under the branch, then the daisies and buds over them, then the roses, puff roses and butterflies on top, overlapping so no cord shows between the flowers.',
    'Weave in the ends behind the pieces. Tie the jute string to the branch ends to hang it.',
  ]
}

registerMotif({ id: 'garland', label: 'Flower wall hanging', round: 9, colours: GARLAND_COLOURS, build: buildGarland })
