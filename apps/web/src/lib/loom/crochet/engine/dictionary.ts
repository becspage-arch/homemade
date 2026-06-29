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

export type StitchId = 'ch' | 'slst' | 'sc' | 'hdc' | 'dc' | 'tr' | 'dtr' | 'scblo' | 'scflo'

export interface StitchDef {
  id: StitchId
  /** Post height as a multiple of the base (sc) row height. */
  heightFactor: number
  /** How many top loops the stitch leaves (its "head"). Always 2 for these. */
  topLoops: number
}

export const STITCHES: Record<StitchId, StitchDef> = {
  ch: { id: 'ch', heightFactor: 0.5, topLoops: 2 },
  slst: { id: 'slst', heightFactor: 0.8, topLoops: 2 }, // shortest worked stitch — flat + tight, but a row is still ≈1 yarn thick (can't pack thinner)
  sc: { id: 'sc', heightFactor: 1.0, topLoops: 2 },
  hdc: { id: 'hdc', heightFactor: 1.45, topLoops: 2 },
  dc: { id: 'dc', heightFactor: 3.2, topLoops: 2 },
  tr: { id: 'tr', heightFactor: 4.2, topLoops: 2 },
  dtr: { id: 'dtr', heightFactor: 5.4, topLoops: 2 }, // double treble — taller again
  // sc worked into back-loop-only / front-loop-only: same height as sc; the loop
  // left unworked floats as a horizontal ridge (handled in yarnPath by loopMode).
  scblo: { id: 'scblo', heightFactor: 1.0, topLoops: 2 },
  scflo: { id: 'scflo', heightFactor: 1.0, topLoops: 2 },
}
