/**
 * LEAF (audit round 8; bar: the sage leaves on the vines of
 * bar-flower-wall-hanging.png; built-how ref real/8-leaves.jpg).
 *
 * Chain and work BOTH sides with graded stitch heights: a chain is made from
 * the leaf tip to the stem end; the stem is worked back in sl sts; then up one
 * side of the chain dc, htr, tr, dtr, dtr, tr, htr, dc (UK) to the tip, a (dc, ch 2,
 * dc) point in the first chain, and back down the other side of the chain to
 * the stem. The chain is the centre spine; the outline is the stitch heights.
 */

import type { StitchId } from '../dictionary'
import { MotifStrand, along, mul, add, type ChainLoop, type Crown } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const LEAF_COLOURS = { main: '#9aab8a' } // sage

/** One side of the leaf, from the stem end to the tip (the other side is
 *  worked tip to stem with the same heights reversed). */
export const LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'tr', 'tr', 'dc', 'hdc', 'sc']
export const LEAF_STEM = 4

/** Work a stitch into a chain loop from one side ('L' = the chain's left leg
 *  while travelling back toward its start, 'R' = the right leg travelling
 *  forward again). */
export function intoChain(m: MotifStrand, L: ChainLoop, id: StitchId, side: 'L' | 'R', o: { xShift?: number; ty?: number } = {}): Crown {
  const f = along(L.c, side === 'L' ? mul(L.u, -1) : L.u)
  const node = side === 'L' ? L.legL : L.legR
  const leg = m.nodes[node]!
  const loc = f.local({ x: leg.x, y: leg.y })
  return m.stitch({ id, frame: f, xCrown: loc.lx + (o.xShift ?? 0), into: { kind: 'node', node }, ...(o.ty !== undefined ? { ty: loc.ly + o.ty } : {}) })
}

/**
 * The two-sided leaf round its midrib chain `loops` (loops[0] at the tip,
 * loops[side.length] the first stem chain). Side A runs stem→tip on the chains'
 * left legs, the point, side B tip→stem on their right legs.
 */
export function workLeafAround(m: MotifStrand, loops: ChainLoop[], side: StitchId[]): void {
  const n = side.length
  const yr = m.yr
  // Side A: from the stem end (loops[n]) to the tip (loops[1]).
  for (let i = 0; i < n; i++) intoChain(m, loops[n - i]!, side[i]!, 'L')
  // The point: (dc, ch 2, dc) in the first chain made.
  const tipL = loops[0]!
  intoChain(m, tipL, 'sc', 'L')
  const out = add(tipL.c, mul(tipL.u, -yr * 3.2))
  m.chain(2, [m.cursor, out], { turning: 2 })
  intoChain(m, tipL, 'sc', 'R')
  // Side B: tip to stem, the same heights reversed.
  for (let i = 0; i < n; i++) intoChain(m, loops[1 + i]!, side[n - 1 - i]!, 'R')
}

/** One leaf with its stem, relaxed and audited: the chain made from the tip
 *  (at the origin) along −x to the stem end, which settles near
 *  x = −(chains) × 2.6yr. */
export function leafPiece(yr: number, hex: string, side: StitchId[] = LEAF_SIDE, stem = LEAF_STEM, name = 'leaf', pose?: MotifPiece['pose']): MotifPiece {
  const m = new MotifStrand(yr, hex)
  const n = side.length
  const nCh = n + 1 + stem + 1 // leaf chains + the tip chain + the stem + the turning chain
  const u = { x: -1, y: 0 }
  const L0 = yr * 2.6 * nCh
  m.slipKnot({ x: 0, y: 0 }, u)
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -L0, y: 0 }], { turning: 1 })
  // loops[0..n] = tip chain + leaf chains, loops[n+1 .. n+stem] = the stem, then the turning chain and the hook loop.
  m.sectionName = 'stem'
  for (let i = 0; i < stem; i++) intoChain(m, loops[nCh - 2 - i]!, 'slst', 'L')
  m.sectionName = 'leaf'
  workLeafAround(m, loops, side)
  // Join at the leaf base: sl st in the next chain (the stem's first).
  intoChain(m, loops[n + 1]!, 'slst', 'R')
  m.fastenOff({ x: -1, y: 0.3 })
  const built = m.finish(L0, yr * 16)
  return pieceOf(name, m, built, pose)
}

export function buildLeaf(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(LEAF_COLOURS, o)
  const piece = leafPiece(y.yr, col.main!)
  return assemble('leaf', 'Leaf with stem', o, [piece], leafWords(), materialsLine(o, ['sage']))
}

export function leafWords(side: StitchId[] = LEAF_SIDE, stem = LEAF_STEM): string[] {
  const n = side.length
  const nCh = n + 1 + stem + 1
  const sideA = runWords(side)
  const sideB = runWords([...side].reverse())
  return [
    `Ch ${nCh}.`,
    `Stem: sl st in 2nd ch from hook and in each of the next ${stem - 1} ch. (${stem} sts)`,
    `Leaf, first side: ${sideA}. (${n} sts)`,
    `Tip: (${UK.sc}, ch 2, ${UK.sc}) in the last ch.`,
    `Second side: working along the other side of the chain, ${sideB}, sl st in the next ch. (${n + 1} sts)`,
    'Fasten off and weave in the ends; the chain down the middle is the leaf\'s centre vein.',
  ]
}

/** "dc in next ch, htr in next ch, tr in next 3 ch, ..." — runs grouped. */
export function runWords(ids: StitchId[], unit = 'ch'): string {
  const parts: string[] = []
  for (let i = 0; i < ids.length; ) {
    let j = i
    while (j < ids.length && ids[j] === ids[i]) j++
    const k = j - i
    parts.push(k === 1 ? `${UK[ids[i]!]} in next ${unit}` : `${UK[ids[i]!]} in each of the next ${k} ${unit}`)
    i = j
  }
  return parts.join(', ')
}

registerMotif({ id: 'leaf', label: 'Leaf with stem', round: 8, colours: LEAF_COLOURS, build: buildLeaf })
