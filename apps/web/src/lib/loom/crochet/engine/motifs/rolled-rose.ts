/**
 * ROLLED ROSE (audit round 9; bar: the dusty-pink spiral roses of
 * bar-flower-wall-hanging.png; built-how ref real/9-bridal-bouquet.jpg).
 *
 * A strip, rolled and sewn: a long foundation chain worked on BOTH sides — one
 * side a row of graded scallop petals (each a run of stitches rising and
 * falling in height across the chains, separated by a sl st; small petals at
 * the start of the row, tall ones at the end), then round the end of the chain
 * and back along its other side in dc (UK), a plain band that is the rolled
 * base of the rose. Two rows deep with the chain down the middle, the strip
 * reads as fabric when rolled, not as a row of posts (rounds 1-4 of the audit
 * rolled a one-row strip: a good spiral silhouette whose petals read as rope
 * strands). The strip is rolled from its start (the small petals become the
 * tight centre) and the base stitched through; the roll is the pose, applied
 * after the flat strip is relaxed and audited exactly as worked.
 */

import type { StitchId } from '../dictionary'
import { MotifStrand, add, mul, type ChainLoop } from './kit'
import { intoChain, runWords } from './leaf'
import { along, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const ROLLED_ROSE_COLOURS = { main: '#9c6c78' } // r10: with the tinted sheen (MOTIF_FIBRE_TUNE) #7a4a5a rendered a deep raspberry, so the hex comes back up toward the bar's dusty mauve-pink. // r6's #946070 and r7's #8a5868 both rendered a clean pink, a step lighter than the bar's deep dusty rose // dusty mauve (r4's #ad6c7a rendered salmon pink)

/** The petals in work order (the first ones roll into the centre). */
export const ROSE_PETALS: { n: number; sts: StitchId[] }[] = [
  { n: 4, sts: ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc'] },
  { n: 4, sts: ['hdc', 'dc', 'dc', 'dc', 'dc', 'hdc'] },
  { n: 4, sts: ['dc', 'dc', 'tr', 'tr', 'dc', 'dc'] },
]

/** Spiral pitch (radial growth per turn) as a multiple of the yarn radius, and
 *  the outward lean of the rolled petals from centre to rim (deg). */
const ROLL_PITCH_YR = 3.4 // r5's 4.6 left the stage showing between turns
const ROLL_R0_YR = 1.4
const LEAN0 = 4
const LEAN1 = 32 // r6's 24 showed only the petal rims from above (rope coils); leaning out shows the petal faces

export function rosePetalList(): StitchId[][] {
  const out: StitchId[][] = []
  for (const g of ROSE_PETALS) for (let i = 0; i < g.n; i++) out.push(g.sts)
  return out
}

export interface RollOpts {
  pitchYr?: number
  r0Yr?: number
  lean0?: number
  lean1?: number
  turnsFull?: number
  /** Work the plain dc band along the chain's other side (default true). */
  band?: boolean
  /** A second row of dc over the petal row's crowns (default true, r12): each
   *  petal is then two rows of fabric, a wide flat band when rolled, not a
   *  one-stitch arch that reads as a coil of rope. */
  topRow?: boolean
  /** Shell strip only: work the row-2 shells (default true), of this many stitches (SHELL_SIZE). */
  shells?: boolean
  shellSize?: number
}

/** A rolled strip as one piece: the foundation chain, one row of `petals`
 *  (each a run of stitches, then a sl st) worked back along it, then (band) a
 *  row of dc along the chain's other side, relaxed and audited flat, then posed
 *  rolled. */
export function rolledStrip(yr: number, hex: string, petals: StitchId[][], name = 'rose', roll: RollOpts = {}): MotifPiece {
  const worked = petals.reduce((a, p) => a + p.length + 1, 0) // each petal + its sl st
  const nCh = worked + 1 // + the turning chain
  const pitch = yr * 2.6
  const m = new MotifStrand(yr, hex)
  // The foundation chain, made along −x; the petal row is worked back along +x
  // with the petals standing toward −y, then the band along −x toward +y.
  m.slipKnot({ x: 0, y: 0 }, { x: -1, y: 0 })
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -pitch * nCh, y: 0 }], { turning: 1 })
  m.sectionName = 'petals'
  let k = nCh - 2 // the 2nd chain from the hook
  const crowns: Crown[] = []
  for (const p of petals) {
    for (const id of p) crowns.push(intoChain(m, loops[k--]!, id, 'L'))
    intoChain(m, loops[k--]!, 'slst', 'L')
  }
  const topRow = roll.topRow ?? true
  if (topRow) {
    // Row 2: turn and dc into every stitch of the petal row (sl sts too), back
    // along the strip, each at its own crown's height so the arched outline of
    // the petals is kept and every petal is two rows deep.
    m.sectionName = 'top row'
    const f = along({ x: 0, y: 0 }, { x: 1, y: 0 })
    const scPitch = yr * 2.6 * 0.85
    for (let i = crowns.length - 1; i >= 0; i--) {
      const c = crowns[i]!
      const loc = f.local(c.p)
      m.stitch({ id: 'sc', frame: f, xCrown: loc.lx, xHook: loc.lx, into: { kind: 'crown', crown: c }, by: loc.ly, ty: loc.ly + scPitch })
    }
  }
  const band = roll.band ?? true
  if (band) {
    // Round the end of the chain: dc into the other side of every worked chain
    // (after the top row the yarn is at the strip's start, so the band runs
    // from the start of the petal row to the first chain made; without it,
    // the other way).
    m.sectionName = 'band'
    if (topRow) for (let i = nCh - 2; i >= 0; i--) intoChain(m, loops[i]!, 'sc', 'R')
    else for (let i = 0; i <= nCh - 2; i++) intoChain(m, loops[i]!, 'sc', 'R')
    m.fastenOff({ x: topRow ? 1 : -1, y: 0 })
  } else {
    m.fastenOff({ x: topRow ? -1 : 1, y: 0 })
  }
  const built = m.finish(pitch * nCh, yr * 16)
  // The row's start (the first, smallest petal) is the chain's far end; the
  // band's outer edge is the strip's bottom when rolled.
  const body = built.model.nodes.slice(4)
  const xMin = Math.min(...body.map((n) => n.x))
  const yTop = band ? Math.max(...body.map((n) => n.y)) : 0
  const o = {
    pitch: yr * (roll.pitchYr ?? ROLL_PITCH_YR), r0: yr * (roll.r0Yr ?? ROLL_R0_YR),
    lean0: roll.lean0 ?? LEAN0, lean1: roll.lean1 ?? LEAN1, turnsFull: roll.turnsFull ?? 3.2,
  }
  return pieceOf(name, m, built, (p) => rollPose(p, xMin, yTop, yr, o))
}

/**
 * SHELL ROSE (r15): the real rolled-rose construction. Row 1 is a MESH along
 * the foundation chain — a dtr (UK) post, ch 3, skip 2 ch, repeat — and row 2
 * works a SHELL of five stitches into every chain SPACE of the mesh with a sl
 * st into each post top between (the kit's chain-space hook: each shell stitch
 * goes under the ch-4 at its own point along it). The first three shells are
 * htr, the rest tr, so the small petals roll into the centre. Then the band along the chain's other
 * side, and the roll. Fanning five stitches into ONE chain failed the audit in
 * every probe (r13: the extra posts slip out of the chain's mouth); a chain
 * space is the loop a real shell is worked into.
 */
export const SHELL_PETALS: { n: number; st: StitchId }[] = [
  { n: 3, st: 'hdc' },
  { n: 8, st: 'dc' }, // dtr shells (UK) left one collar marginal in the audit; tr shells are clean
]
export const SHELL_SIZE = 5
export const SHELL_CH = 4
export const SHELL_SKIP = 3

export function shellPetalList(): StitchId[] {
  const out: StitchId[] = []
  for (const g of SHELL_PETALS) for (let i = 0; i < g.n; i++) out.push(g.st)
  return out
}

/** `k`-th of `n` stitches of a shell worked into the chain space `sp` (the
 *  ch-3's loops, in the order they were made, i.e. running toward −x), the
 *  shell standing toward −y like the petal row. Each stitch encircles the
 *  chain at its own point along the space and its crown fans out. */
function intoSpace(m: MotifStrand, sp: ChainLoop[], id: StitchId, k: number, n: number, heightScale = 1): Crown {
  // The strand of the space, loop by loop: the hook goes UNDER the chain, so a
  // stitch wraps one of its legs (the fold is tucked behind; a hook under the
  // fold itself lifted it over its own crossing and failed the chain's audit).
  // Row 2 travels back (−x) over a space made toward +x, so the first shell
  // stitch takes the leg nearest the post just slip-stitched and the last the
  // far end: the yarn never jumps across the space.
  // Only the leg on the shell's own side (the right leg: the space runs +x,
  // the shells stand −y) at two points, near the fold and mid-leg — a hook
  // over to the far leg crossed the chain and lifted its folds.
  const run: number[] = []
  for (const L of sp) {
    const at = L.nodes.indexOf(L.legR)
    run.push(L.nodes[Math.min(L.nodes.length - 1, at + 2)]!, L.legR)
  }
  run.reverse()
  const t = (k + 0.5) / n
  const node = run[Math.min(run.length - 1, Math.round(t * run.length - 0.5))]!
  const q = m.nodes[node]!
  // the space runs from its first loop's centre to its last's
  const a = sp[0]!.c, b = sp[sp.length - 1]!.c
  const u = { x: b.x - a.x, y: b.y - a.y }
  const mid = add(a, mul(u, 0.5))
  const f = along(mid, u) // the space runs toward +x (row 1 travels back along the chain), so heights point −y, the petal side
  const loc = f.local({ x: q.x, y: q.y })
  const width = Math.hypot(u.x, u.y) + m.yr * 2.6
  const xCrown = (0.5 - t) * width * 1.15
  return m.stitch({ id, frame: f, xCrown, xHook: loc.lx, into: { kind: 'space', node }, by: loc.ly, heightScale, })
}

/** The shell strip as one piece: the chain, the row-1 mesh, the row-2 shells,
 *  the band, relaxed and audited flat, then rolled. */
export function shellStrip(yr: number, hex: string, petals: StitchId[] = shellPetalList(), name = 'rose', roll: RollOpts = {}): MotifPiece {
  const P = petals.length
  const nCh = (P + 1) + P * SHELL_SKIP + 1 // the posts, the skipped chains, the turning chain
  const pitch = yr * 2.6
  const m = new MotifStrand(yr, hex)
  m.slipKnot({ x: 0, y: 0 }, { x: -1, y: 0 })
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -pitch * nCh, y: 0 }], { turning: 1 })
  // Row 1 (the mesh), worked back toward +x on the chains' left legs: a post
  // in the 2nd ch from hook, then [ch 3, skip 2 ch, post in next ch].
  m.sectionName = 'mesh'
  const posts: Crown[] = []
  const spaces: ChainLoop[][] = []
  let k = nCh - 2
  posts.push(intoChain(m, loops[k]!, 'dc', 'L'))
  for (let i = 0; i < P; i++) {
    const from = m.cursor
    const next = loops[k - SHELL_SKIP - 1]!
    const to = { x: next.c.x, y: from.y }
    const ch = m.chain(SHELL_CH, [from, to])
    spaces.push(ch.slice(0, SHELL_CH))
    k -= SHELL_SKIP + 1
    posts.push(intoChain(m, loops[k]!, 'dc', 'L'))
  }
  // Row 2 (the shells), turned, worked back toward −x: sl st in the post,
  // then the shell in the space, to the end.
  m.sectionName = 'shells'
  const f2 = along({ x: 0, y: 0 }, { x: 1, y: 0 }) // heights toward −y like every row-2 stitch (the work travels −x, but a frame's along-direction only sets the audit's sign)
  const doShells = roll.shells ?? true
  const doBand = roll.band ?? true
  const slIn = (c: Crown): void => {
    const loc = f2.local(c.p)
    m.stitch({ id: 'slst', frame: f2, xCrown: loc.lx, xHook: loc.lx, into: { kind: 'crown', crown: c }, by: loc.ly })
  }
  if (doShells) {
    for (let i = P; i >= 1; i--) {
      slIn(posts[i]!)
      const sp = spaces[i - 1]!
      const sz = roll.shellSize ?? SHELL_SIZE
      for (let j = 0; j < sz; j++) intoSpace(m, sp, petals[i - 1]!, j, sz)
    }
    slIn(posts[0]!)
  }
  // The band: round the end and dc along the other side of the foundation chain.
  if (doBand) {
    m.sectionName = 'band'
    if (doShells) for (let i = nCh - 2; i >= 0; i--) intoChain(m, loops[i]!, 'sc', 'R')
    else for (let i = 0; i <= nCh - 2; i++) intoChain(m, loops[i]!, 'sc', 'R')
  }
  m.fastenOff({ x: doShells ? 1 : -1, y: 0 })
  const built = m.finish(pitch * nCh, yr * 20)
  const body = built.model.nodes.slice(4)
  const xMin = Math.min(...body.map((n) => n.x))
  const yTop = Math.max(...body.map((n) => n.y))
  const o = {
    pitch: yr * (roll.pitchYr ?? SHELL_ROLL_PITCH_YR), r0: yr * (roll.r0Yr ?? ROLL_R0_YR),
    lean0: roll.lean0 ?? SHELL_LEAN0, lean1: roll.lean1 ?? SHELL_LEAN1, turnsFull: roll.turnsFull ?? 3.0,
  }
  return pieceOf(name, m, built, (p) => rollPose(p, xMin, yTop, yr, o))
}
const SHELL_ROLL_PITCH_YR = 4.2
const SHELL_LEAN0 = 10
const SHELL_LEAN1 = 50

export function buildRolledRose(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(ROLLED_ROSE_COLOURS, o)
  const piece = shellStrip(y.yr, col.main!)
  return assemble('rolled-rose', 'Rolled rose', o, [piece], shellRoseWords(), materialsLine(o, ['dusty pink']))
}

export function shellRoseWords(): string[] {
  const petals = shellPetalList()
  const P = petals.length
  const nCh = (P + 1) + P * SHELL_SKIP + 1
  const groups = SHELL_PETALS.map((g) => `[sl st in next ${UK.dc}, ${SHELL_SIZE} ${UK[g.st]} in next ch-${SHELL_CH} sp] ${g.n} times`)
  return [
    `Ch ${nCh}.`,
    `Row 1 (mesh): ${UK.dc} in 2nd ch from hook, [ch ${SHELL_CH}, skip ${SHELL_SKIP} ch, ${UK.dc} in next ch] ${P} times. (${P + 1} ${UK.dc}, ${P} ch-${SHELL_CH} sps)`,
    `Row 2 (petals): turn, ${groups.join(', ')}, sl st in last ${UK.dc}. (${P} shells)`,
    `Row 3 (base band): working along the other side of the foundation chain, ${UK.sc} in each ch to the end. (${nCh - 1} sts)`,
    'Fasten off, leaving a long tail.',
    'Starting from the small petals, roll the strip up with the band at the bottom, letting the shells open outward as you go; stitch through all the layers of the band with the tail to hold the roll.',
  ]
}

/**
 * Roll the flat strip: arclength from the row's start along the chain becomes
 * an Archimedean spiral round the rose's centre (z up), the strip's height
 * (from the band's outer edge, +y, up through the chain to the petal tops, −y)
 * stands up out of the table leaning outward more on each turn, the strip's
 * own thickness (z) lies radially. A rigid bend of the relaxed strip — the
 * maker's rolling — so the audited stitches are not moved relative to one
 * another along the strip.
 */
function rollPose(p: V3, xMin: number, yTop: number, yr: number, o: { pitch: number; r0: number; lean0: number; lean1: number; turnsFull: number }): V3 {
  const s = Math.max(0, p.x - xMin)
  const b = o.pitch / (Math.PI * 2)
  const r0 = o.r0
  // arclength of r = r0 + bθ ≈ r0θ + bθ²/2 → θ(s)
  const th = (-r0 + Math.sqrt(r0 * r0 + 2 * b * s)) / b
  const r = r0 + b * th
  const turns = th / (Math.PI * 2)
  const lean = ((o.lean0 + (o.lean1 - o.lean0) * Math.min(1, turns / o.turnsFull)) * Math.PI) / 180
  const h = Math.max(0, yTop - p.y) // height up the strip from the band's edge
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
  return [
    `Ch ${nCh}.`,
    `Row 1 (petals): ${groups.join(', then ')}. (${petals.length} petals)`,
    `Row 2: ch 1, turn, ${UK.sc} in each st of row 1 back along the strip, at the height of the stitch below. (${worked} sts)`,
    `Row 3 (base band): working along the other side of the foundation chain, ${UK.sc} in each ch to the end. (${nCh - 1} sts)`,
    'Fasten off, leaving a long tail.',
    'Starting from the small petals, roll the strip up with the band at the bottom, letting the petals open out as you go; stitch through all the layers of the band with the tail to hold the roll.',
  ]
}

registerMotif({ id: 'rolled-rose', label: 'Rolled rose', round: 9, colours: ROLLED_ROSE_COLOURS, build: buildRolledRose })
