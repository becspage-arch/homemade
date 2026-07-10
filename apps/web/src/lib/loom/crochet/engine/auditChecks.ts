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

export function auditProblems(swatch: BuiltSwatch, _arg: string, _W: number, yr: number): string[] {
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

  // 2. Pins only on the anchor — the builder declares how many nodes at the
  // start of the strand are the legitimate pinned anchor (foundation chain,
  // slip knot, magic ring, cast-on).
  const pinLimit = built.anchorPins
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

  // 4. Interlocks held after relax. Offsets are measured in the FABRIC frame:
  // flat swatches use world x/y; work in the round maps along-the-row to the
  // tangential direction and row-height to the radial one ("above its crown" on
  // a disc means radially outward, not world +y).
  const linkFails: string[] = []
  const mer = built.model.meridian
  const rel = (hi: number, bi: number): { x: number; y: number } => {
    const h = nodes[hi]!
    const b = nodes[bi]!
    if (built.frame === 'polar' || built.frame === 'surface') {
      const rh = Math.hypot(h.x, h.y)
      const rb = Math.hypot(b.x, b.y)
      let da = Math.atan2(h.y, h.x) - Math.atan2(b.y, b.x)
      if (da > Math.PI) da -= Math.PI * 2
      if (da < -Math.PI) da += Math.PI * 2
      const dx = da * ((rh + rb) / 2)
      if (built.frame === 'surface' && mer) {
        // Row-height direction = the local meridian tangent at the below node.
        const t = mer[bi]!
        return { x: dx, y: (rh - rb) * t.tr + (h.z - b.z) * t.tz }
      }
      return { x: dx, y: rh - rb }
    }
    return { x: h.x - b.x, y: h.y - b.y }
  }
  const check = (l: StitchLink): string | null => {
    const h = nodes[l.hook]!
    const b = nodes[l.below]!
    const d = rel(l.hook, l.below)
    if (l.role === 'hook') {
      // Dives under the crown to its far side and stays beside/below it. On a
      // curved surface "side" is the local NORMAL, not global z: n = (-tz, tr)
      // rotated from the below node's meridian tangent; our rounds always hook
      // INWARD, so the hook must sit clearly on the inward-normal side.
      if (built.frame === 'surface' && mer) {
        const t = mer[l.below]!
        const rh = Math.hypot(h.x, h.y)
        const rb = Math.hypot(b.x, b.y)
        const dn = (rh - rb) * -t.tz + (h.z - b.z) * t.tr
        if (dn > -yr * 0.45) return `hook did not get under its crown (dn=${(dn / yr).toFixed(2)}yr)`
      } else if (h.z * b.z > 0 && Math.abs(h.z - b.z) < yr * 0.45) {
        return 'hook settled on the SAME side as its crown'
      }
      if (Math.abs(d.x) > yr * 2.5) return `hook slipped sideways off its crown (dx=${(d.x / yr).toFixed(2)}yr)`
      if (d.y > yr * 1.2) return `hook floated above its crown (dy=${(d.y / yr).toFixed(2)}yr)`
      return null
    }
    if (l.role === 'ring') {
      // Encircles the stem: still beside it, far side still z-separated.
      if (Math.abs(d.x) > yr * 2.5) return `ring slipped off its stem (dx=${(d.x / yr).toFixed(2)}yr)`
      if (Math.abs(d.y) > yr * 3.0) return `ring slid up/down its stem (dy=${(d.y / yr).toFixed(2)}yr)`
      return null
    }
    if (l.role === 'through') {
      // A knit leg passing the old head's mouth: still within the mouth, still
      // on the fabric's face side of the head (zSign from the build).
      const sign = l.zSign ?? 1
      if (Math.abs(d.x) > yr * 2.0) return `leg slipped sideways out of the mouth (dx=${(d.x / yr).toFixed(2)}yr)`
      if (Math.abs(d.y) > yr * 2.0) return `leg slid up/down out of the mouth (dy=${(d.y / yr).toFixed(2)}yr)`
      if ((h.z - b.z) * sign < yr * 0.15) return `leg settled BEHIND the head it must pass in front of (dz=${(((h.z - b.z) * sign) / yr).toFixed(2)}yr)`
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
