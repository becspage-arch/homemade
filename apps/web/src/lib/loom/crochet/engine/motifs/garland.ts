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
import { YARN_WEIGHT_RADIUS_MM } from '../program'
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

export const GARLAND_COLOURS = {
  cord: '#4e5844', cord2: '#d9cbb2', leaf: '#5e6a55', leaf2: '#6e7a68',
  // r15: the bar's palette — a dusty mauve rose, a PEACH rose, pink and peach puffs, mustard little flowers, blue and peach butterflies
  rose: '#9c6c78', rose2: '#d4a08a', rose3: '#a87884', puff: '#c49aa2', puff2: '#dcae9a', mustard: '#c9a24a', butterfly2: '#d9a98f',
}
/** The cords, left to right (r15): x (mm) along the branch, length in chains,
 *  and what each is — a leaf vine (olive or the greyer sage), a plain olive
 *  cord ending in a berry, a thin bare CREAM cord (some with a berry at the
 *  end), or a TWISTED cord (a sage chain wound round a straight cream chain).
 *  The bar's cords hang two to three times the flower band's height, at many
 *  different lengths, so the piece cascades. */
export type CordKind = 'vine' | 'berry' | 'bare' | 'twist'
export const GARLAND_CORDS: { x: number; ch: number; kind: CordKind; cream?: boolean; grey?: boolean; endBerry?: boolean }[] = [
  { x: -192, ch: 92, kind: 'vine' },
  { x: -170, ch: 68, kind: 'bare', cream: true, endBerry: true },
  { x: -148, ch: 122, kind: 'vine', grey: true },
  { x: -118, ch: 98, kind: 'twist' },
  { x: -96, ch: 52, kind: 'berry' },
  { x: -70, ch: 108, kind: 'vine' },
  { x: -42, ch: 118, kind: 'bare', cream: true },
  { x: -14, ch: 78, kind: 'vine', grey: true },
  { x: 12, ch: 84, kind: 'twist' },
  { x: 36, ch: 62, kind: 'berry', cream: true },
  { x: 62, ch: 128, kind: 'vine' },
  { x: 90, ch: 94, kind: 'bare', cream: true, endBerry: true },
  { x: 118, ch: 100, kind: 'vine', grey: true },
  { x: 146, ch: 44, kind: 'berry' },
  { x: 176, ch: 72, kind: 'vine' },
  { x: 198, ch: 58, kind: 'bare', cream: true },
]
/** A vine's leaves: the first at this chain, then every `VINE_EVERY` chains, alternating sides. */
export const VINE_FIRST = 7
export const VINE_EVERY = 8 // r15: the bar's leaves sit about a leaf length apart along the vine
/** The vine leaf (r10): smaller than leaf-vine's — the bar's vine leaves are small grey-sage ovals, r9's 8-st leaves were big blades. */
export const GARLAND_VINE_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc']
/** The small leaf tucked between the flowers in the band. */
export const GARLAND_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'dc', 'hdc', 'sc']
const BRANCH_LEN = 430
const BRANCH_R = 6.5
/** The branch rises to the right (mm over its length), as the bar's driftwood does. */
const BRANCH_RISE = 24
/** The branch's height (engine y) at x: the cords hang from it. */
function branchY(x: number): number {
  const t = (x + BRANCH_LEN / 2) / BRANCH_LEN
  return -BRANCH_RISE / 2 + BRANCH_RISE * t + Math.sin(t * Math.PI) * 5 + Math.sin(t * 9.1) * 2.2
}
/** The twisted cord: the sage chain winds round the straight cream chain this far out (mm) with this pitch (mm per turn). */
const TWIST_R = 2.4
const TWIST_PITCH = 40

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
 *  forward it is sewn; spin deg; colour role). Looser than r9-14's packed
 *  band: the bar's flowers sit along the branch with leaves showing between
 *  them, the big roses spaced out, the small puffs, buds and mustard flowers
 *  tucked between, a few trailing lower so the band's edge tumbles. */
export const GARLAND_BAND: { what: 'rose' | 'puff' | 'bud' | 'daisy' | 'butterfly' | 'mustard'; x: number; y: number; z: number; spin?: number; col?: string }[] = [
  { what: 'rose', x: -124, y: -42, z: 8, spin: 20, col: 'rose' },
  { what: 'rose', x: -2, y: -36, z: 8, spin: -30, col: 'rose2' },
  { what: 'rose', x: 132, y: -46, z: 8, spin: 50, col: 'rose3' },
  { what: 'daisy', x: -176, y: -34, z: 4, spin: 12 },
  { what: 'daisy', x: -64, y: -26, z: 4, spin: -8 },
  { what: 'daisy', x: 58, y: -30, z: 4, spin: 20 },
  { what: 'daisy', x: 182, y: -40, z: 4, spin: 5 },
  { what: 'daisy', x: -44, y: -78, z: 4, spin: -14 },
  { what: 'daisy', x: 92, y: -74, z: 4, spin: 9 },
  { what: 'puff', x: -84, y: -64, z: 7, col: 'puff' },
  { what: 'puff', x: 34, y: -70, z: 7, spin: 36, col: 'puff2' },
  { what: 'puff', x: 160, y: -82, z: 7, spin: 10, col: 'puff' },
  { what: 'puff', x: -150, y: -80, z: 7, spin: 24, col: 'puff2' },
  { what: 'mustard', x: -112, y: -92, z: 6, spin: 15 },
  { what: 'mustard', x: 118, y: -22, z: 6, spin: -20 },
  { what: 'mustard', x: 12, y: -96, z: 6, spin: 40 },
  { what: 'bud', x: -32, y: -58, z: 6, spin: -8, col: 'puff' },
  { what: 'bud', x: 72, y: -54, z: 6, spin: 30, col: 'puff2' },
  { what: 'bud', x: 196, y: -70, z: 6, spin: 15, col: 'puff' },
  { what: 'bud', x: -196, y: -62, z: 6, spin: 20, col: 'puff2' },
  { what: 'bud', x: -70, y: -108, z: 5, spin: 10, col: 'puff' },
  { what: 'bud', x: 136, y: -110, z: 5, spin: -25, col: 'puff2' },
  { what: 'butterfly', x: -166, y: -2, z: 6, spin: 20 },
  { what: 'butterfly', x: 24, y: -12, z: 6, spin: -12, col: 'butterfly2' },
  { what: 'butterfly', x: 178, y: -4, z: 6, spin: -15 },
]
/** Small leaves tucked between the flowers: x, y, angle (deg, 0 = pointing right), flipped. */
const BAND_LEAVES: [number, number, number, boolean][] = [
  [-200, -14, -150, false], [-150, -30, -40, true], [-100, -24, -160, false], [-30, -14, -30, true],
  [12, -60, -140, false], [48, -8, -35, true], [96, -50, -150, false], [150, -30, -40, true],
  [196, -56, -140, false], [-86, -92, -120, false], [36, -84, -60, true], [120, -8, -20, true],
  [-56, -96, -110, false], [-4, -82, -70, true], [90, -98, -120, false], [-130, -66, -60, true], [170, -62, -130, false], [60, -102, -100, false],
  [-178, -72, -100, false], [-20, -36, -150, false], [140, -78, -50, true], [-116, -8, -70, true],
]

export function buildGarland(o?: MotifOptions): BuiltMotif {
  const col = colourOpts(GARLAND_COLOURS, o)
  // r13: the cords and every leaf are in LACE-weight cotton — the bar's vines
  // are delicate, small smooth leaves on thin cords. r15: the small flowers
  // (daisies, puffs, buds, mustard flowers, butterflies, berries) are lace too,
  // so they sit small and fine against the vines the way the bar's do; only
  // the three big roses stay 4 ply.
  const yr = YARN_WEIGHT_RADIUS_MM.lace
  const lace: MotifOptions = { ...o, yarnWeight: 'lace' }
  const pitch = yr * 2.6
  const pieces: MotifPiece[] = []
  // Two leaves, each audited once and sewn many times: the vine leaf and the small band leaf.
  const stemEnd = (leaf: MotifPiece): V3 => {
    const ln = leaf.built.model.nodes
    let se = ln[0]!
    for (const n of ln) if (n.x < se.x) se = n
    return { x: se.x, y: se.y, z: se.z }
  }
  const vineLeaf = leafPiece(yr, col.leaf!, GARLAND_VINE_LEAF_SIDE, 2, 'vine leaf')
  const vineLeaf2 = leafPiece(yr, col.leaf2!, GARLAND_VINE_LEAF_SIDE, 2, 'vine leaf')
  const bandLeaf = leafPiece(yr, col.leaf!, GARLAND_LEAF_SIDE, 2, 'leaf')
  const bandLeaf2 = leafPiece(yr, col.leaf2!, GARLAND_LEAF_SIDE, 2, 'leaf')
  const leafAt = (proto: MotifPiece, at: V3, angDeg: number, flip: boolean, name: string): MotifPiece => {
    const se = stemEnd(proto)
    return placed({ ...proto, pose: (q) => ({ x: q.x - se.x, y: q.y - se.y, z: q.z - se.z }) }, name, at, angDeg, flip)
  }
  const berry = getMotif('berry').build(lace)
  const ball = { ...berry, pieces: berry.pieces.filter((p) => p.name !== 'stalk') }
  // The cords: chains hanging straight down from the branch (its axis is branchY(x)).
  GARLAND_CORDS.forEach((cd, i) => {
    const m = new MotifStrand(yr, cd.cream ? col.cord2! : col.cord!)
    const top = { x: cd.x, y: branchY(cd.x) + BRANCH_R + yr }
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
    if (cd.kind === 'twist') {
      // A sage chain wound round the cream cord in a helix and tacked: made
      // along the helix (a chain follows any path), so it is one honest chain.
      const turns = (pitch * cd.ch) / TWIST_PITCH
      const n = Math.round((cd.ch * Math.hypot(TWIST_PITCH, Math.PI * 2 * TWIST_R)) / TWIST_PITCH)
      const path: { x: number; y: number }[] = []
      const steps = n * 6
      for (let k = 0; k <= steps; k++) {
        const t = k / steps
        const th = t * turns * Math.PI * 2
        path.push({ x: cd.x + Math.cos(th) * TWIST_R, y: top.y - pitch * cd.ch * t })
        void Math.sin(th)
      }
      const w = new MotifStrand(yr, (i & 2) ? col.leaf2! : col.leaf!)
      w.slipKnot(path[0]!, { x: 0, y: -1 })
      w.chain(n, path)
      w.fastenOff({ x: 0, y: -1 })
      const wb = w.finish(TWIST_R * 2 + yr * 4, pitch * cd.ch)
      // the helix's depth: the winding chain passes in front of and behind the cord
      const zOf = (y: number): number => Math.sin(((top.y - y) / (pitch * cd.ch)) * turns * Math.PI * 2) * TWIST_R
      pieces.push(pieceOf(`twist ${i + 1}`, w, wb, (q) => ({ x: q.x, y: q.y, z: q.z + zOf(q.y) })))
      return
    }
    if (cd.kind === 'vine') {
      // r14: every other vine in the greyer sage with a slightly different leaf rhythm and droop, so the vines do not read as one repeated unit
      const grey = cd.grey ?? false
      const leaf = grey ? vineLeaf2 : vineLeaf
      const every = grey ? VINE_EVERY + 1 : VINE_EVERY
      const droop = grey ? 44 : 34
      let side = i % 2 === 0
      for (let k = VINE_FIRST + (grey ? 3 : 0); k < cd.ch - 3; k += every) {
        pieces.push(leafAt(leaf, at(k), side ? -droop : -180 + droop, side, `vine ${i + 1} leaf ${k}`))
        side = !side
      }
      // a last leaf at the very end of the vine, hanging straight down
      pieces.push(leafAt(leaf, at(cd.ch - 1), -90, false, `vine ${i + 1} tip leaf`))
      // a berry part way down some vines (the bar hangs berries among its leaves too)
      if (i % 5 === 0) {
        const mid = at(Math.round(cd.ch * 0.55) + 2)
        pieces.push(...placeMotif(ball, `vine ${i + 1} berry`, { x: mid.x + (i % 10 === 0 ? 6 : -6), y: mid.y, z: 1 }, 8))
      }
      return
    }
    if (cd.kind === 'berry' || cd.endBerry) {
      const end = at(cd.ch - 1)
      pieces.push(...placeMotif(ball, `berry ${i + 1}`, { x: end.x, y: end.y - 7, z: 0 }, i % 2 ? 10 : -10))
    }
  })
  // The band of flowers over the cords: each colour role built once.
  const built = new Map<string, BuiltMotif>()
  const motifFor = (b: (typeof GARLAND_BAND)[number]): BuiltMotif => {
    const key = `${b.what}:${b.col ?? ''}`
    let m = built.get(key)
    if (!m) {
      const main = b.col ? col[b.col]! : undefined
      m = b.what === 'rose' ? getMotif('rolled-rose').build({ ...o, colours: { main: main ?? col.rose! } })
        : b.what === 'daisy' ? getMotif('daisy').build({ ...lace, size: 'small' })
        : b.what === 'puff' ? getMotif('layered-rose').build({ ...lace, colours: { main: main ?? col.puff! } })
        : b.what === 'bud' ? getMotif('layered-rose').build({ ...lace, bud: true, colours: { main: main ?? col.puff! } })
        : b.what === 'mustard' ? getMotif('layered-rose').build({ ...lace, colours: { main: col.mustard!, centre: '#efe3cf' } })
        : getMotif('butterfly').build({ ...lace, ...(main ? { colours: { wing: main } } : {}) })
      built.set(key, m)
    }
    return m
  }
  const counts: Record<string, number> = {}
  BAND_LEAVES.forEach(([x, yy, ang, flip], k) => pieces.push(leafAt(k % 3 === 2 ? bandLeaf2 : bandLeaf, { x, y: yy + branchY(x) * 0.5, z: 1.5 }, ang, flip, `band leaf ${k + 1}`)))
  for (const b of GARLAND_BAND) {
    counts[b.what] = (counts[b.what] ?? 0) + 1
    pieces.push(...placeMotif(motifFor(b), `${b.what} ${counts[b.what]}`, { x: b.x, y: b.y + branchY(b.x) * 0.5, z: b.z }, b.spin ?? 0))
  }
  const words = garlandWords()
  return assemble('garland', 'Flower wall hanging', o, pieces, words, materialsLine(o, ['dusty mauve', 'peach', 'dusty rose']).concat(['Lace-weight cotton in olive, cream and grey-sage for the cords and leaves, in cream and mustard for the daisies, in dusty pink, peach and mustard for the small flowers and buds, in dusty blue and peach for the butterflies and in dusty terracotta for the berries, with a 1.75 mm hook.', 'A piece of driftwood about 43 cm long and a length of jute string to hang it.']))
}

/** The driftwood branch the garland hangs from, and its hanging string, as scene props. */
export function garlandProps(): MotifProp[] {
  const branch: { p: V3; r: number }[] = []
  const n = 22
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const x = -BRANCH_LEN / 2 + BRANCH_LEN * t
    // r15: a gnarled, twisting bough rising to the right, thicker at the left,
    // its girth swelling and pinching along it like weathered driftwood
    const zb = BRANCH_R + Math.sin(k * 1.3) * 2.2 + Math.sin(t * 7) * 1.5
    const r = BRANCH_R * (1.12 - 0.3 * t) * (1 + 0.16 * Math.sin(k * 2.7) + 0.08 * Math.sin(k * 1.1))
    branch.push({ p: { x, y: branchY(x), z: zb }, r })
  }
  // a short side twig forking up off the branch toward the right end
  const fx = BRANCH_LEN * 0.28
  const twig: { p: V3; r: number }[] = [
    { p: { x: fx, y: branchY(fx) + 2, z: BRANCH_R }, r: BRANCH_R * 0.5 },
    { p: { x: fx + 24, y: branchY(fx) + 14, z: BRANCH_R + 2 }, r: BRANCH_R * 0.36 },
    { p: { x: fx + 44, y: branchY(fx) + 30, z: BRANCH_R + 1 }, r: BRANCH_R * 0.22 },
  ]
  const yL = branchY(-150), yR = branchY(150)
  const string: { p: V3; r: number }[] = [
    { p: { x: -150, y: yL + 6, z: BRANCH_R }, r: 1.3 }, { p: { x: -70, y: yL + 58, z: BRANCH_R }, r: 1.3 },
    { p: { x: 0, y: (yL + yR) / 2 + 90, z: BRANCH_R }, r: 1.3 },
    { p: { x: 70, y: yR + 58, z: BRANCH_R }, r: 1.3 }, { p: { x: 150, y: yR + 6, z: BRANCH_R }, r: 1.3 },
  ]
  return [{ branch, hex: '#a39584' }, { branch: twig, hex: '#a39584' }, { branch: string, hex: '#b9a07a' }]
}

export function garlandWords(): string[] {
  const vines = GARLAND_CORDS.filter((c) => c.kind === 'vine')
  const twists = GARLAND_CORDS.filter((c) => c.kind === 'twist')
  const berries = GARLAND_CORDS.filter((c) => c.kind === 'berry' || c.endBerry).length + vines.filter((_, i) => GARLAND_CORDS.indexOf(vines[i]!) % 5 === 0).length
  const band = GARLAND_BAND.reduce<Record<string, number>>((a, b) => ({ ...a, [b.what]: (a[b.what] ?? 0) + 1 }), {})
  const leaves = vines.reduce((a, c) => a + Math.ceil((c.ch - 3 - VINE_FIRST) / VINE_EVERY) + 1, 0)
  const num = (i: number): string => `${GARLAND_CORDS.indexOf(GARLAND_CORDS[i]!) + 1}`
  return [
    `Make the pieces: ${band.rose} rolled roses in 4 ply (one dusty mauve, one peach, one dusty rose), and in the lace-weight cotton (1.75 mm hook) ${band.puff} puff roses (pink and peach), ${band.mustard} mustard puff flowers with cream centres, ${band.bud} rosebuds, ${band.daisy} small daisies, ${band.butterfly} butterflies (two blue, one peach), ${berries} berries (without stalks), ${leaves} vine leaves (the small leaf below, two tr shorter again) and ${BAND_LEAVES.length} small leaves (the leaf vine's leaf two tr shorter, stem 2), the leaves in olive and grey-sage.`,
    `Cords (lace-weight cotton, 1.75 mm hook): leaving a long tail to tie to the branch, ch ${GARLAND_CORDS.map((c) => `${c.ch}${c.cream ? ' (cream)' : ''}`).join(', ch ')} (left to right, olive unless marked); fasten off each.`,
    `Twisted cords (${twists.map((c) => num(GARLAND_CORDS.indexOf(c))).join(' and ')}): with sage, make a chain a third longer than the cream cord, wind it round the cord in a loose spiral and tack it in place every few turns.`,
    `Tie the cords to the branch at uneven spaces, 2 to 3 cm apart. Vines (cords ${vines.map((c) => num(GARLAND_CORDS.indexOf(c))).join(', ')}): sew a vine leaf at ch ${VINE_FIRST} and about every ${VINE_EVERY} chains down, alternating sides, each angled down, and one at the end pointing straight down; the grey-sage vines a chain or two further apart. Berry cords and the cream cords marked: sew a berry over the last chain.`,
    'The band: sew the small leaves to the cords just under the branch, then the daisies, buds and mustard flowers over them, then the roses, puff roses and butterflies on top, with leaves showing between the flowers; let a few buds trail lower than the rest.',
    'Weave in the ends behind the pieces. Tie the jute string to the branch ends to hang it.',
  ]
}

registerMotif({ id: 'garland', label: 'Flower wall hanging', round: 9, colours: GARLAND_COLOURS, build: buildGarland })
