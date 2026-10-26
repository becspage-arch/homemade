/**
 * TAPERED LIMBS (bent-tube pass, 2026-10-26; STITCH_ENGINE.md §8r). A slim
 * leg or arm the way amigurumi designers write one: worked from the FOOT (a
 * magic ring rising as a sphere's cap to the foot's width, so the foot is a
 * round ball end, not a flat disc), a couple of rounds held for the foot,
 * then narrowed a stitch at a time up the leg to a slimmer top, closed and
 * sewn on by the top. Counts only: built by the locked closed-piece builder
 * (`buildSphere`), stuffed and audited like every other part.
 */

import { sphereAscent } from './sphereProfile'

export interface TaperedLimb {
  /** The foot's width (stitches round the widest foot round). */
  foot: number
  /** The top's width, where it is sewn on (fewer = slimmer). */
  top: number
  /** Every round from the ring to the close. */
  length: number
  /** Rounds held at the foot's width (default 2: a round foot). */
  footHold?: number
}

/**
 * Stitches per round for a tapered limb. The foot climbs exactly as a ball's
 * cap does (`sphereAscent`, so it domes), holds, then the taper spreads the
 * decreases evenly over the leg (each round loses at most one stitch in
 * `foot - top` steps — a slow taper, never a step), and the last round halves
 * to close the top (≥ 6).
 */
export function taperedLimbRounds(o: TaperedLimb): number[] {
  const { up } = sphereAscent(o.foot)
  const w = up[up.length - 1]!
  const top = Math.min(o.top, w)
  const hold = o.footHold ?? 2
  const out = [...up, ...Array.from({ length: Math.max(0, hold - 1) }, () => w)]
  const taper = Math.max(1, o.length - out.length - 1)
  for (let i = 1; i <= taper; i++) out.push(Math.round(w + ((top - w) * i) / taper))
  out.push(Math.max(6, Math.ceil(top / 2)))
  return out
}
