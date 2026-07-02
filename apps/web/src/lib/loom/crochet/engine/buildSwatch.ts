/**
 * The ONE recipe for building + relaxing a stitch swatch. The render driver and
 * the verification audit both call this, so what gets audited is exactly what
 * gets rendered. (Step toward the dictionary being the single source of truth —
 * per-stitch recipe values will migrate into dictionary.ts.)
 */

import { buildContinuous, type BuiltContinuous } from './yarnPath'
import { relax } from './relax'
import type { StitchId } from './dictionary'

export interface SwatchFlags {
  /** A pattern of post stitches (fpdc/bpdc/postrib/basketweave). */
  postLike: boolean
  /** Tall standing posts — rendered from a slight 3/4 angle. */
  tall: boolean
  /** Bobbles dotted on an sc ground. */
  bobbles: boolean
  /** The foundation chain alone. */
  chain: boolean
}

export interface BuiltSwatch {
  built: BuiltContinuous
  /** The dictionary stitch driving gauge + row height. */
  stitch: StitchId
  flags: SwatchFlags
}

/**
 * `stitchArg` accepts every dictionary stitch plus the pattern aliases the
 * driver exposes: 'postrib' (alternating fpdc/bpdc columns), 'basketweave'
 * (fp/bp blocks), 'bobbles' (bobbles on an sc ground).
 */
export function buildRelaxedSwatch(stitchArg: string, W: number, yr: number): BuiltSwatch {
  const isBasket = stitchArg === 'basketweave'
  const isPostRib = stitchArg === 'postrib' // alternating fp/bp columns = ribbing
  const isPost = stitchArg === 'fpdc' || stitchArg === 'bpdc'
  const isBobbles = stitchArg === 'bobbles' // bobbles dotted on an sc background
  const stitch = (isBasket ? 'dc' : isPostRib ? 'fpdc' : isBobbles ? 'sc' : stitchArg) as StitchId // drives gauge + row height
  // ch is the starting chain itself — the foundation chain alone (no worked rows).
  const nRows = stitch === 'ch' ? 0 : 8
  const rows: StitchId[] = Array(nRows).fill(stitch) as StitchId[]
  let stitchAt: ((j: number, c: number) => StitchId) | undefined
  if (isBasket) {
    stitchAt = (j, c) => {
      if (j === 0) return 'dc' // establish posts to wrap
      const block = Math.floor(c / 3)
      const rb = Math.floor((j - 1) / 2)
      return (block + rb) % 2 === 0 ? 'fpdc' : 'bpdc' // 3-wide blocks, swap every 2 rows
    }
  } else if (isPostRib) {
    stitchAt = (j, c) => (j === 0 ? 'dc' : c % 2 === 0 ? 'fpdc' : 'bpdc') // raised rib / recessed valley
  } else if (isBobbles) {
    // bumps on a polka-dot grid over plain sc, offset row to row
    stitchAt = (j, c) => (j > 0 && j % 2 === 1 && (c + (Math.floor(j / 2) % 2) * 2) % 4 === 0 ? 'bobble' : 'sc')
  } else if (isPost) {
    stitchAt = (j, c) => (j === 0 ? 'dc' : (stitchArg as StitchId))
  }
  const built = buildContinuous(rows, W, yr, { stitchAt })

  // Collision is what HOLDS the interlock (yarn can't pass through yarn), so it
  // runs firm and long. No plane pull for worked fabric — the +z/−z relief at each
  // hook IS the interlock; flattening it would unlink the rows.
  if (stitch === 'ch') {
    // A chain's links are consecutive along the strand, so collision must act between
    // NEAR neighbours (low adjacency) to hold each loop threaded through the previous
    // and to snug each head around the next stitch's two pulled-through strands.
    relax(built.model, {
      collMinDist: yr * 1.0, // SOFT — a drawn-tight chain squashes its yarn; firmer than this and the loop can't contain the two strands pulled through it
      collK: 0.3,
      collAdjacency: 2,
      planeZ: 0,
      planeK: 0.01, // barely any symmetric pull — the TABLE does the flattening, one-sided, so the front/back layering survives
      layoutK: 0,
      floorZ: -yr * 1.6, // the table the chain lies on — deep enough for the bump layer, or the back overcrowds
      iterations: 400,
    })
  } else {
    relax(built.model, {
      collMinDist: yr * 1.25,
      collK: 0.28,
      collAdjacency: 9, // a post's own two legs (≤9 apart) stay a tight pair; cross-row interlock is ~a full row apart, so it still collides
      planeZ: 0,
      planeK: 0,
      layoutK: 0.06, // blocked flat — holds rows at their worked height so posts stand
      iterations: 320,
    })
  }

  return {
    built,
    stitch,
    flags: {
      postLike: isPost || isPostRib || isBasket,
      tall: stitch === 'dc' || stitch === 'tr' || stitch === 'dtr' || isPost || isBasket || isPostRib,
      bobbles: isBobbles,
      chain: stitch === 'ch',
    },
  }
}
