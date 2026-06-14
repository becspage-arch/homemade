/**
 * Stitch shape registry. Each entry is keyed by the chartSymbol string that
 * the Stitch master table + ChartStitch references use. Lookups go through
 * `getStitchShape(key)`.
 *
 * Adding a new stitch shape:
 *   1. Create a new file under `stitch-shapes/` (one or more `StitchShape`
 *      exports).
 *   2. Import + add the key here.
 *   3. The renderer picks it up automatically.
 *
 * Every Stitch master-table row whose `chartSymbol` string lives in this
 * registry can be drawn; rows referencing a key not here trigger a verifier
 * warning and the renderer falls back to a generic "unknown" mark so the
 * output still renders without a black hole.
 */

import type { StitchShape } from '../types'
import { CHAIN } from './chain'
import { SLIP_STITCH } from './slip-stitch'
import { DOUBLE_CROCHET_UK } from './double-crochet-uk'
import { HALF_TREBLE } from './half-treble'
import { TREBLE } from './treble'
import { DOUBLE_TREBLE } from './double-treble'
import { TRIPLE_TREBLE, QUADRUPLE_TREBLE } from './triple-treble'
import { MAGIC_RING } from './magic-ring'
import { FOUNDATION_TREBLE } from './foundation-treble'
import { FRONT_LOOP_ONLY, BACK_LOOP_ONLY, THIRD_LOOP_HTR } from './loop-variants'
import { BOBBLE } from './bobble'
import { POPCORN } from './popcorn'
import { PUFF } from './puff'
import { SHELL, FAN } from './shell'
import { TREBLE_CLUSTER, GRANNY_CLUSTER } from './clusters'
import {
  PICOT,
  PICOT_CHAIN,
  V_STITCH,
  CROSSED_TREBLE,
  CROSSED_DOUBLE_TREBLE,
} from './decoratives'
import {
  FRONT_POST,
  BACK_POST,
  LINKED_DC,
  HERRINGBONE_HTR,
  WAISTCOAT,
  CROSS_STITCH_CROCHET,
  STAR_STITCH,
  SURFACE_SLIP_STITCH,
} from './post-stitches'
import { DC2TOG, INVISIBLE_DECREASE } from './decreases'
import {
  TUNISIAN_SIMPLE,
  TUNISIAN_KNIT,
  TUNISIAN_PURL,
  TUNISIAN_FULL,
  TUNISIAN_HONEYCOMB,
  TUNISIAN_EXTENDED,
  BROOMSTICK_LOOP,
  BROOMSTICK_CLUSTER,
  HAIRPIN_BASIC,
  HAIRPIN_JOIN,
  CROCODILE,
  SOLOMONS_KNOT,
  IRISH_MOTIF,
  SPIDER,
} from './specialty'
import { JOIN_AS_YOU_GO, SLIP_STITCH_SEAM, WHIPSTITCH_JOIN } from './joins'
import { KNIT, PURL, YARN_OVER, K2TOG, SSK, SPIKE, BULLION } from './knit-and-misc'

const SHAPES: StitchShape[] = [
  // Foundation + basics
  CHAIN,
  SLIP_STITCH,
  MAGIC_RING,
  FOUNDATION_TREBLE,
  DOUBLE_CROCHET_UK,
  HALF_TREBLE,
  TREBLE,
  DOUBLE_TREBLE,
  TRIPLE_TREBLE,
  QUADRUPLE_TREBLE,
  // Loop variants
  FRONT_LOOP_ONLY,
  BACK_LOOP_ONLY,
  THIRD_LOOP_HTR,
  // Textured
  BOBBLE,
  POPCORN,
  PUFF,
  SHELL,
  FAN,
  TREBLE_CLUSTER,
  GRANNY_CLUSTER,
  // Decorative
  PICOT,
  PICOT_CHAIN,
  V_STITCH,
  CROSSED_TREBLE,
  CROSSED_DOUBLE_TREBLE,
  // Post + special
  FRONT_POST,
  BACK_POST,
  LINKED_DC,
  HERRINGBONE_HTR,
  WAISTCOAT,
  CROSS_STITCH_CROCHET,
  STAR_STITCH,
  SURFACE_SLIP_STITCH,
  // Decreases
  DC2TOG,
  INVISIBLE_DECREASE,
  // Tunisian
  TUNISIAN_SIMPLE,
  TUNISIAN_KNIT,
  TUNISIAN_PURL,
  TUNISIAN_FULL,
  TUNISIAN_HONEYCOMB,
  TUNISIAN_EXTENDED,
  // Specialty
  BROOMSTICK_LOOP,
  BROOMSTICK_CLUSTER,
  HAIRPIN_BASIC,
  HAIRPIN_JOIN,
  CROCODILE,
  SOLOMONS_KNOT,
  IRISH_MOTIF,
  SPIDER,
  // Joining methods (swatches only)
  JOIN_AS_YOU_GO,
  SLIP_STITCH_SEAM,
  WHIPSTITCH_JOIN,
  // Knitting faces + extra crochet stitches
  KNIT,
  PURL,
  YARN_OVER,
  K2TOG,
  SSK,
  SPIKE,
  BULLION,
]

const REGISTRY = new Map<string, StitchShape>(SHAPES.map((s) => [s.key, s]))

/**
 * Alias map — alternate chartSymbol spellings that resolve to an existing
 * shape. Charts authored across the catalogue use both UK-canonical keys
 * and common variants (e.g. `double-crochet` for `double-crochet-uk`,
 * `front-post-treble` for `front-post`). Mapping them here avoids the
 * "unknown stitch" fallback without duplicating shapes. UK terminology is
 * canonical — these are spelling variants, not US/UK conversions.
 */
const ALIASES: Record<string, string> = {
  'double-crochet': 'double-crochet-uk',
  'front-post-treble': 'front-post',
  'back-post-treble': 'back-post',
  'tunisian-simple-stitch': 'tunisian-simple',
  'tunisian-knit-stitch': 'tunisian-knit',
  'tunisian-purl-stitch': 'tunisian-purl',
  'yo': 'yarn-over',
}

/** Stitch used when a chart references an unknown key. The renderer logs a
 *  warning via the verifier; the unknown stitch shows as a small neutral
 *  square so the surrounding stitches still place correctly. */
export const UNKNOWN_STITCH: StitchShape = {
  key: '__unknown__',
  label: 'unknown stitch',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.18 -0.10 L -0.18 -0.92 L 0.18 -0.92 L 0.18 -0.10 Z',
  flavour: 'stroke',
}

export function getStitchShape(key: string): StitchShape | null {
  const direct = REGISTRY.get(key)
  if (direct) return direct
  const alias = ALIASES[key]
  return alias ? (REGISTRY.get(alias) ?? null) : null
}

export function listStitchShapes(): StitchShape[] {
  return SHAPES.slice()
}

export function hasStitchShape(key: string): boolean {
  return REGISTRY.has(key) || (key in ALIASES && REGISTRY.has(ALIASES[key]!))
}
