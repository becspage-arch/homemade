import type { StitchShape } from '../types'

/**
 * Shell — `shell`. Five trebles worked into one stitch, fanning outward.
 * Reads as a fan / scallop. The renderer draws five splayed trebles all
 * meeting at the base anchor.
 */
export const SHELL: StitchShape = {
  key: 'shell',
  label: 'shell',
  heightUnits: 1.8,
  widthUnits: 1.4,
  // Five fan strokes meeting at (0, 0). The renderer thickens these via
  // its stroke layer; no fill.
  path:
    'M 0 0 L -0.55 -1.65 ' +
    'M 0 0 L -0.27 -1.78 ' +
    'M 0 0 L 0 -1.82 ' +
    'M 0 0 L 0.27 -1.78 ' +
    'M 0 0 L 0.55 -1.65',
  flavour: 'stroke',
}

/**
 * Fan stitch — `fan`. Similar to shell but with a slightly different
 * grouping; renders the same fan silhouette.
 */
export const FAN: StitchShape = {
  key: 'fan',
  label: 'fan stitch',
  heightUnits: 1.8,
  widthUnits: 1.4,
  path:
    'M 0 0 L -0.55 -1.65 ' +
    'M 0 0 L -0.27 -1.78 ' +
    'M 0 0 L 0 -1.82 ' +
    'M 0 0 L 0.27 -1.78 ' +
    'M 0 0 L 0.55 -1.65',
  flavour: 'stroke',
}
