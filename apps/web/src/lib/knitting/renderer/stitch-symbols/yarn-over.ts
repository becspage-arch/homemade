import type { KnittingSymbol } from '../types'

/**
 * Yarn-over.
 *
 * Universal convention is an open circle, transparent fill. The circle
 * must read clearly against any background colour — that's why fill is
 * left null and the renderer only draws the stroke. Centred in the
 * cell, radius ~0.28 of cell width.
 *
 * Source: CYC A.4 ("o" — yarn over), Walker treasury vol. 1.
 */
export const YARN_OVER: KnittingSymbol = {
  key: 'yarn-over',
  label: 'Yarn over',
  abbreviation: 'yo',
  // Approximation of a circle via four cubic-bezier arcs.
  path:
    'M 0.78 0.50 ' +
    'C 0.78 0.346 0.654 0.22 0.50 0.22 ' +
    'C 0.346 0.22 0.22 0.346 0.22 0.50 ' +
    'C 0.22 0.654 0.346 0.78 0.50 0.78 ' +
    'C 0.654 0.78 0.78 0.654 0.78 0.50 Z',
  strokeWidth: 0.07,
  source: 'CYC A.4, Walker',
}
