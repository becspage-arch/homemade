import type { StitchShape } from '../types'

/**
 * Picot — `p`. A small triangular bump used along edges. Reads as a
 * small upward triangle.
 */
export const PICOT: StitchShape = {
  key: 'picot',
  label: 'picot',
  heightUnits: 0.8,
  widthUnits: 0.6,
  path: 'M -0.20 0 L 0 -0.75 L 0.20 0 Z',
  flavour: 'flat',
}

/** Picot variant attached to a chain anchor. */
export const PICOT_CHAIN: StitchShape = {
  key: 'picot-chain',
  label: 'picot on chain',
  heightUnits: 0.8,
  widthUnits: 0.7,
  path: 'M -0.22 0 L 0 -0.75 L 0.22 0 Z M -0.34 -0.02 Q 0 0.10 0.34 -0.02',
  flavour: 'flat',
}

/**
 * V-stitch — `V-st`. Two trebles flanking a chain, forming a V shape.
 * Reads as a V silhouette.
 */
export const V_STITCH: StitchShape = {
  key: 'v-stitch',
  label: 'V-stitch',
  heightUnits: 2,
  widthUnits: 1.1,
  path:
    'M -0.42 -2 L 0 0 ' +
    'M 0.42 -2 L 0 0 ' +
    'M -0.10 -0.20 Q 0 -0.05 0.10 -0.20',
  flavour: 'stroke',
}

/**
 * Crossed treble — `cr-tr`. Two trebles worked across each other forming
 * an X.
 */
export const CROSSED_TREBLE: StitchShape = {
  key: 'crossed-treble',
  label: 'crossed treble',
  heightUnits: 2,
  widthUnits: 1.2,
  path: 'M -0.45 -1.92 L 0.45 0 M 0.45 -1.92 L -0.45 0',
  flavour: 'stroke',
}

/** Two crossed double trebles — same X silhouette but taller. */
export const CROSSED_DOUBLE_TREBLE: StitchShape = {
  key: 'crossed-double-treble',
  label: 'crossed double treble',
  heightUnits: 2.8,
  widthUnits: 1.3,
  path: 'M -0.50 -2.72 L 0.50 0 M 0.50 -2.72 L -0.50 0',
  flavour: 'stroke',
}
