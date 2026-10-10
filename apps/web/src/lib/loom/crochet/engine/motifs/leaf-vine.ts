/**
 * LEAF VINE (audit round 9; bar: the sage leaf vines hanging from the driftwood
 * of bar-flower-wall-hanging.png).
 *
 * A long chain for the vine and small two-sided leaves, each a leaf with its own
 * short stem (leaf.ts: chain from the tip, sl st the stem back, then up one
 * side with graded heights and down the other), sewn by their stems to the
 * vine at regular chains, alternating sides — how the bar's vines are put
 * together. Each leaf and the vine are separate pieces; the sewing is the pose.
 */

import type { StitchId } from '../dictionary'
import { MotifStrand } from './kit'
import { leafPiece, leafWords } from './leaf'
import { assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const VINE_COLOURS = { vine: '#74825c', leaf: '#859470' } // olive, sage olive
export const VINE_CH = 40
/** Leaves sewn at these chains (counted from the top), alternating sides. */
export const VINE_LEAF_AT = [5, 11, 17, 23, 29, 35]
export const VINE_LEAF_SIDE: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc']
export const VINE_LEAF_STEM = 3
/** Leaf angle from the vine, below the horizontal (deg). */
export const VINE_LEAF_DROOP = 40

export function buildLeafVine(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(VINE_COLOURS, o)
  const yr = y.yr
  const pitch = yr * 2.6
  // The vine: a slip knot and a long chain hanging down from the top.
  const m = new MotifStrand(yr, col.vine!)
  m.slipKnot({ x: 0, y: 0 }, { x: 0, y: -1 })
  m.chain(VINE_CH, [{ x: 0, y: 0 }, { x: 0, y: -pitch * VINE_CH }])
  m.fastenOff({ x: 0, y: -1 })
  const vb = m.finish(yr * 4, pitch * VINE_CH)
  const vine = pieceOf('vine', m, vb)
  // Where each chain of the settled vine is (its nodes in strand order).
  const vn = vb.model.nodes
  const vineAt = (k: number): V3 => {
    // nearest settled node to the k-th chain's nominal height
    const yk = -pitch * (k + 0.5)
    let best = vn[0]!, bd = Infinity
    for (const n of vn) { const d = Math.abs(n.y - yk); if (d < bd) { bd = d; best = n } }
    return { x: best.x, y: best.y, z: best.z }
  }
  // One leaf, relaxed and audited once; each sewn copy is a pose of it.
  const pieces: MotifPiece[] = [vine]
  const proto = leafPiece(yr, col.leaf!, VINE_LEAF_SIDE, VINE_LEAF_STEM, 'leaf')
  const ln = proto.built.model.nodes
  let se = ln[0]!
  for (const n of ln) if (n.x < se.x) se = n // the stem end
  VINE_LEAF_AT.forEach((k, i) => {
    const right = i % 2 === 0
    const phi = ((right ? -VINE_LEAF_DROOP : 180 + VINE_LEAF_DROOP) * Math.PI) / 180
    const cs = Math.cos(phi), sn = Math.sin(phi)
    const at = vineAt(k)
    // leaf local: stem end → origin, the leaf extending along +x; then turned and sewn on
    pieces.push({
      ...proto,
      name: `leaf ${i + 1}`,
      pose: (p) => {
        const lx = p.x - se.x, ly = p.y - se.y
        // the left-hand leaves are the same leaf turned over, so their right side still faces out
        const ly2 = right ? ly : -ly
        const z = right ? p.z - se.z : -(p.z - se.z)
        return { x: at.x + lx * cs - ly2 * sn, y: at.y + lx * sn + ly2 * cs, z: at.z + z + yr * 0.6 }
      },
    })
  })
  return assemble('leaf-vine', 'Leaf vine', o, pieces, vineWords(), materialsLine(o, ['deeper sage', 'sage']))
}

export function vineWords(): string[] {
  const leaf = leafWords(VINE_LEAF_SIDE, VINE_LEAF_STEM).slice(0, -1)
  return [
    `Leaves (make ${VINE_LEAF_AT.length}), with sage:`,
    ...leaf.map((s) => `  ${s}`),
    '  Fasten off, leaving a tail for sewing.',
    `Vine: with deeper sage, leaving a long tail for hanging, ch ${VINE_CH}; fasten off.`,
    `Sew the stem of a leaf to the vine at ch ${VINE_LEAF_AT.join(', ')} from the top, alternating sides, each leaf angled down; weave in the ends.`,
  ]
}

registerMotif({ id: 'leaf-vine', label: 'Leaf vine', round: 9, colours: VINE_COLOURS, build: buildLeafVine })
