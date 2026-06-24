/**
 * The stitch library contract.
 *
 * Every embroidery stitch is a deterministic primitive: given placement
 * parameters + a thread context, it returns the real thread strokes that make
 * up that stitch — the right number of strokes, laid the way the real stitch is
 * worked. There is no "fill that looks like satin"; satin returns its actual
 * parallel stitches, a French knot returns its actual coil, chain returns its
 * actual interlocking loops. Accuracy is by construction: count and placement
 * come straight from the parameters a pattern supplies.
 *
 * This is the vocabulary the placement engine and the Studio both build on.
 */

import type { Vec2 } from '../core/vec'
import { material, strandRadiusMm, threadStructure, type ThreadKind, type ThreadStroke } from '../render/thread'

/** Thread settings in force for a run of stitches (one floss colour + weight). */
export interface StitchContext {
  kind: ThreadKind
  /** Floss colour as hex. */
  hex: string
  /** Strand count (drives thread thickness). */
  strands: number
  /** Stable base seed so a stitch renders identically every time. */
  seed: number
}

/** A stitch primitive: parameters + context -> the real strokes that build it. */
export type StitchPrimitive<P> = (params: P, ctx: StitchContext) => ThreadStroke[]

/**
 * Build a single thread stroke for `ctx`, with a sensible raised arch derived
 * from its length (longer stitches sit a touch higher). Stitch modules use this
 * so height/radius/material handling stays consistent across the library.
 */
export function stroke(
  path: Vec2[],
  ctx: StitchContext,
  opts: { z0?: number; archScale?: number; radiusScale?: number; seedJitter?: number } = {},
): ThreadStroke {
  const radiusMm = strandRadiusMm(ctx.strands) * (opts.radiusScale ?? 1)
  let len = 0
  for (let i = 1; i < path.length; i++) {
    len += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y)
  }
  // A laid thread bows up roughly with its span, capped so long stitches don't balloon.
  const arch = Math.min(0.5, len * 0.045) * (opts.archScale ?? 1)
  const { filaments, twistPerMm } = threadStructure(ctx.kind, ctx.strands)
  return {
    path,
    z0: opts.z0 ?? radiusMm * 0.6,
    arch,
    radiusMm,
    filaments,
    twistPerMm,
    material: material(ctx.kind, ctx.hex),
    seed: ctx.seed + (opts.seedJitter ?? 0),
  }
}
