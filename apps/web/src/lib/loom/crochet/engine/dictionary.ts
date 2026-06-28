/**
 * Stitch dictionary — each stitch defined ONCE by its parameters, not its picture.
 *
 * The whole point of the engine: adding a stitch is one entry here, and it works
 * everywhere (any swatch, any item, alongside any other stitch). For the crochet
 * basics the defining difference is HEIGHT — how many times the yarn is wrapped /
 * how tall the post is: sc is short, hdc taller, dc taller still, tr taller again.
 * `heightFactor` scales a stitch's loop height off the base (sc) row height; the
 * relaxer resolves the actual shape from there.
 */

export type StitchId = 'ch' | 'sc' | 'hdc' | 'dc' | 'tr'

export interface StitchDef {
  id: StitchId
  /** Post height as a multiple of the base (sc) row height. */
  heightFactor: number
  /** How many top loops the stitch leaves (its "head"). Always 2 for these. */
  topLoops: number
}

export const STITCHES: Record<StitchId, StitchDef> = {
  ch: { id: 'ch', heightFactor: 0.5, topLoops: 2 },
  sc: { id: 'sc', heightFactor: 1.0, topLoops: 2 },
  hdc: { id: 'hdc', heightFactor: 1.45, topLoops: 2 },
  dc: { id: 'dc', heightFactor: 2.0, topLoops: 2 },
  tr: { id: 'tr', heightFactor: 2.7, topLoops: 2 },
}
