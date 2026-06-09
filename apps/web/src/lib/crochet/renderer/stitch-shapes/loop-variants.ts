import type { StitchShape } from '../types'

/**
 * Front-loop-only / back-loop-only / third-loop variants.
 *
 * These are not standalone stitches — they're treble (or dc) stitches
 * worked through a specific loop. The chart symbol indicates the loop
 * convention; the rendered shape is a normal post stitch with a thin
 * crescent at the base to mark the loop convention.
 */
export const FRONT_LOOP_ONLY: StitchShape = {
  key: 'front-loop',
  label: 'front loop only',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -0.92 Q -0.16 -1 0 -1 Q 0.16 -1 0.16 -0.92 L 0.16 -0.05 Z ' +
    'M -0.32 -0.05 Q 0 -0.18 0.32 -0.05',
  flavour: 'stroke',
}

export const BACK_LOOP_ONLY: StitchShape = {
  key: 'back-loop',
  label: 'back loop only',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -0.92 Q -0.16 -1 0 -1 Q 0.16 -1 0.16 -0.92 L 0.16 -0.05 Z ' +
    'M -0.32 -0.05 Q 0 0.10 0.32 -0.05',
  flavour: 'stroke',
}

export const THIRD_LOOP_HTR: StitchShape = {
  key: 'third-loop-htr',
  label: 'third loop htr',
  heightUnits: 1.4,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -1.32 Q -0.16 -1.4 0 -1.4 Q 0.16 -1.4 0.16 -1.32 L 0.16 -0.05 Z ' +
    'M -0.32 -1.1 L 0.32 -1.1 ' +
    'M -0.30 -0.10 Q 0 0.05 0.30 -0.10',
  flavour: 'stroke',
}
