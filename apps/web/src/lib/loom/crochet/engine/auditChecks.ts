/**
 * Numeric audit of a built+relaxed swatch — the "genuinely stitched, not faked"
 * claim made machine-checkable. Verifies IN DATA:
 *
 *   1. ONE STRAND — a single continuous yarn, every node on it, in order.
 *   2. NO PINNED WORKED STITCHES — pins (w=0) only on the anchor (foundation
 *      chain, or the chain swatch's slip knot). Pinned worked geometry = drawing.
 *   3. NO SPRINGS — every constraint joins strand neighbours (dist: i↔i+1,
 *      bend: i↔i+2). A constraint bridging distant nodes = a spring join.
 *   4. INTERLOCK HELD — every StitchLink recorded at build time still holds
 *      after relaxation: hooks on the far z-side of the crown they dive under
 *      and still beside it; rings still around their stem; chain crossings
 *      still inside the previous loop's mouth, riding over its fold.
 *   5. FINITE — no NaN/Inf anywhere.
 *
 * A stitch that fails ANY check is not stitched — no matter how the render looks.
 */

import type { StitchLink } from './yarnPath'
import type { BuiltSwatch } from './buildSwatch'

export function auditProblems(swatch: BuiltSwatch, arg: string, W: number, yr: number): string[] {
  const { built } = swatch
  const { nodes, dist, bend } = built.model
  const problems: string[] = []

  // 5. Finite.
  const badNode = nodes.findIndex((n) => !Number.isFinite(n.x + n.y + n.z))
  if (badNode >= 0) problems.push(`node ${badNode} is not finite`)

  // 1. One strand: every node appears exactly once, in build order.
  if (built.strandPath.length !== nodes.length)
    problems.push(`strand covers ${built.strandPath.length}/${nodes.length} nodes — not one strand`)
  else if (built.strandPath.some((ni, k) => ni !== k)) problems.push('strand path is out of order')

  // 2. Pins only on the anchor. For ch the anchor is the slip knot (its 11
  // build nodes); for worked swatches the foundation chain (3 nodes/column).
  const pinLimit = arg === 'ch' ? 11 : 3 * W
  const badPins = nodes.map((n, i) => ({ n, i })).filter(({ n, i }) => n.w === 0 && i >= pinLimit)
  if (badPins.length) problems.push(`${badPins.length} pinned WORKED nodes (first at ${badPins[0]!.i}) — pinned drawing, not stitching`)

  // 3. No springs: constraints only between strand neighbours.
  const springs = [
    ...dist.filter((c) => Math.abs(c.a - c.b) > 1),
    ...bend.filter((c) => Math.abs(c.a - c.b) > 2),
  ]
  if (springs.length) problems.push(`${springs.length} spring-like constraints (e.g. ${springs[0]!.a}↔${springs[0]!.b})`)

  // 3b. A build that records no interlocks has nothing holding it together.
  if (built.links.length === 0) problems.push('build recorded ZERO interlocks — nothing links the yarn')

  // 4. Interlocks held after relax.
  const linkFails: string[] = []
  const check = (l: StitchLink): string | null => {
    const h = nodes[l.hook]!
    const b = nodes[l.below]!
    if (l.role === 'hook') {
      // Dives under the crown to its far z-side and stays beside/below it.
      if (h.z * b.z > 0 && Math.abs(h.z - b.z) < yr * 0.45) return 'hook settled on the SAME side as its crown'
      if (Math.abs(h.x - b.x) > yr * 2.5) return `hook slipped sideways off its crown (dx=${((h.x - b.x) / yr).toFixed(2)}yr)`
      if (h.y - b.y > yr * 1.2) return `hook floated above its crown (dy=${((h.y - b.y) / yr).toFixed(2)}yr)`
      return null
    }
    if (l.role === 'ring') {
      // Encircles the stem: still beside it, far side still z-separated.
      if (Math.abs(h.x - b.x) > yr * 2.5) return `ring slipped off its stem (dx=${((h.x - b.x) / yr).toFixed(2)}yr)`
      if (Math.abs(h.y - b.y) > yr * 3.0) return `ring slid up/down its stem (dy=${((h.y - b.y) / yr).toFixed(2)}yr)`
      return null
    }
    // 'cross' (chain): inside the previous loop's mouth, before its fold, over it.
    const dx = b.x - h.x // fold apex is beyond the crossing, along +x
    if (dx < 0) return `crossing is past its loop's fold (dx=${(dx / yr).toFixed(2)}yr) — expelled forward`
    if (dx > yr * 2.6) return `crossing slid back out of its loop (dx=${(dx / yr).toFixed(2)}yr)`
    if (Math.abs(h.y - b.y) > yr * 1.6) return `crossing outside the loop's mouth (dy=${((h.y - b.y) / yr).toFixed(2)}yr) — expelled sideways`
    if (h.z < b.z - yr * 0.15) return 'crossing settled UNDER the fold it should ride over'
    return null
  }
  for (const l of built.links) {
    const err = check(l)
    if (err) linkFails.push(`  [${l.role} j${l.j} c${l.c}] ${err}`)
  }
  if (linkFails.length)
    problems.push(
      `${linkFails.length}/${built.links.length} interlocks FAILED:\n${linkFails.slice(0, 6).join('\n')}${linkFails.length > 6 ? '\n  …' : ''}`,
    )

  return problems
}
