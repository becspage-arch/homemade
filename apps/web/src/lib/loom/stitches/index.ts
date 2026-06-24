/**
 * The embroidery stitch library — public surface.
 *
 * Every primitive takes placement parameters + a thread context and returns the
 * REAL thread strokes that build that stitch. The placement engine (which turns
 * a parsed pattern into a render) and the Studio (live design) both consume this
 * one surface. Adding a stitch = adding a primitive here; nothing else changes.
 */

export type { StitchContext, StitchPrimitive } from './types'
export { stroke } from './types'

export { straightStitch, runningStitch, backStitch, stemStitch, splitStitch, couching } from './line'
export { satinBlock, satinBand } from './satin'
export { longAndShort, fishbone } from './fill'
export { frenchKnot, lazyDaisy, seed, wovenWheel } from './detached'
export { chainStitch, flyStitch, featherStitch, fernStitch } from './chain'

/**
 * Stable string ids for every stitch in the library. The pattern contract
 * references stitches by these ids, so a pattern document is portable and the
 * placement engine can dispatch by name.
 */
export const STITCH_IDS = [
  'straight',
  'running',
  'back',
  'stem',
  'split',
  'couching',
  'satin',
  'satin-band',
  'long-and-short',
  'fishbone',
  'french-knot',
  'lazy-daisy',
  'seed',
  'chain',
  'fly',
  'feather',
  'fern',
  'woven-wheel',
] as const

export type StitchId = (typeof STITCH_IDS)[number]
