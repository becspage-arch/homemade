import type { StitchShape } from '../types'

/**
 * Treble cluster — `3tr-cl`. Three trebles worked together at the top.
 * Reads as three trebles narrowing to a single peak.
 */
export const TREBLE_CLUSTER: StitchShape = {
  key: 'treble-cluster',
  label: 'treble cluster',
  heightUnits: 2,
  widthUnits: 1.1,
  // Three lines converging at the top, splaying to a wider base.
  path:
    'M -0.42 0 L 0 -2 ' +
    'M 0 0 L 0 -2 ' +
    'M 0.42 0 L 0 -2 ' +
    'M -0.42 0 L 0.42 0',
  flavour: 'stroke',
}

/**
 * Granny cluster — three trebles worked into the same chain-space, as in
 * granny squares. Same silhouette as treble-cluster.
 */
export const GRANNY_CLUSTER: StitchShape = {
  key: 'granny-cluster',
  label: 'granny cluster',
  heightUnits: 2,
  widthUnits: 1.1,
  path:
    'M -0.42 0 L 0 -2 ' +
    'M 0 0 L 0 -2 ' +
    'M 0.42 0 L 0 -2',
  flavour: 'stroke',
}
