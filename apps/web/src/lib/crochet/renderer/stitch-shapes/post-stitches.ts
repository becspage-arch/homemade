import type { StitchShape } from '../types'

/**
 * Front-post / back-post stitches — `fpdc`, `fptr`, `bpdc`, `bptr`. Worked
 * around the post of a stitch in the row below instead of the top loops.
 * Reads as a normal post stitch with a faint side-indicator at the base.
 *
 * Front-post: indicator on the front (renderer-near) side.
 * Back-post: indicator on the back (renderer-far) side.
 */
export const FRONT_POST: StitchShape = {
  key: 'front-post',
  label: 'front-post',
  heightUnits: 2,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -1.92 Q -0.16 -2 0 -2 Q 0.16 -2 0.16 -1.92 L 0.16 -0.05 Z ' +
    'M -0.30 -0.85 L 0.30 -1.15 ' +
    'M -0.30 -0.05 L 0 0.10 L 0.30 -0.05',
  flavour: 'stroke',
}

export const BACK_POST: StitchShape = {
  key: 'back-post',
  label: 'back-post',
  heightUnits: 2,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -1.92 Q -0.16 -2 0 -2 Q 0.16 -2 0.16 -1.92 L 0.16 -0.05 Z ' +
    'M -0.30 -0.85 L 0.30 -1.15 ' +
    'M -0.30 -0.05 L 0 -0.20 L 0.30 -0.05',
  flavour: 'stroke',
}

/** Linked dc — `linked-dc`. Reads as a slightly wider double crochet. */
export const LINKED_DC: StitchShape = {
  key: 'linked-dc',
  label: 'linked dc',
  heightUnits: 1,
  widthUnits: 1.05,
  path:
    'M -0.18 -0.05 L -0.18 -0.92 Q -0.18 -1 0 -1 Q 0.18 -1 0.18 -0.92 L 0.18 -0.05 Z',
  flavour: 'stroke',
}

/** Herringbone htr — `herringbone-htr`. Reads as an htr with a tilt. */
export const HERRINGBONE_HTR: StitchShape = {
  key: 'herringbone-htr',
  label: 'herringbone htr',
  heightUnits: 1.4,
  widthUnits: 1,
  path:
    'M -0.12 -0.05 L -0.20 -1.32 Q -0.20 -1.40 -0.04 -1.40 ' +
    'Q 0.12 -1.40 0.20 -1.32 L 0.12 -0.05 Z ' +
    'M -0.32 -1.1 L 0.32 -1.1',
  flavour: 'stroke',
}

/** Waistcoat stitch — `waistcoat`. Reads as a vertical bar at front. */
export const WAISTCOAT: StitchShape = {
  key: 'waistcoat',
  label: 'waistcoat stitch',
  heightUnits: 1,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -0.92 Q -0.16 -1 0 -1 Q 0.16 -1 0.16 -0.92 L 0.16 -0.05 Z ' +
    'M 0 -0.10 L 0 -0.90',
  flavour: 'stroke',
}

/** Cross-stitch in crochet — same X silhouette. */
export const CROSS_STITCH_CROCHET: StitchShape = {
  key: 'cross-stitch-crochet',
  label: 'crochet cross-stitch',
  heightUnits: 2,
  widthUnits: 1.1,
  path: 'M -0.40 -1.92 L 0.40 0 M 0.40 -1.92 L -0.40 0',
  flavour: 'stroke',
}

/** Star stitch — `star-stitch`. Five-point star silhouette. */
export const STAR_STITCH: StitchShape = {
  key: 'star-stitch',
  label: 'star stitch',
  heightUnits: 1.6,
  widthUnits: 1.2,
  path:
    'M 0 -1.6 L 0.18 -1.0 L 0.55 -0.95 L 0.27 -0.55 L 0.36 0 ' +
    'L 0 -0.30 L -0.36 0 L -0.27 -0.55 L -0.55 -0.95 L -0.18 -1.0 Z',
  fillPath:
    'M 0 -1.6 L 0.18 -1.0 L 0.55 -0.95 L 0.27 -0.55 L 0.36 0 ' +
    'L 0 -0.30 L -0.36 0 L -0.27 -0.55 L -0.55 -0.95 L -0.18 -1.0 Z',
  flavour: 'fill',
}

/** Surface slip stitch — `surface-slip-stitch`. Reads as a low ridge. */
export const SURFACE_SLIP_STITCH: StitchShape = {
  key: 'surface-slip-stitch',
  label: 'surface slip stitch',
  heightUnits: 0.32,
  widthUnits: 1.1,
  path: 'M -0.50 -0.15 Q 0 -0.30 0.50 -0.15 Q 0 -0.05 -0.50 -0.15 Z',
  flavour: 'flat',
}
