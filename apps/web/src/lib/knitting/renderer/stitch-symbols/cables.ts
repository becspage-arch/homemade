import type { KnittingSymbol } from '../types'

/**
 * Cable symbols. Per knitting convention, a "front" cable (C4F, C6F)
 * crosses the right-hand stitches in front, producing a left-leaning
 * twist; a "back" cable crosses them behind, producing a right-leaning
 * twist.
 *
 * These per-cell symbols are used when an author wants to use a cable
 * symbol inline (e.g. notating a small twist in a colourwork ground)
 * WITHOUT registering a CableCrossing in `grid.cables`. The cable
 * layout engine handles full crossings spanning multiple cells via
 * `cables/<n>-over-<n>-<direction>.ts`-style shapes selected by name.
 *
 * Source: CYC chart symbols A.20–A.27, Vogue Knitting cable charts.
 */

/** Cable 4 front — 2 over 2, left-leaning twist.
 *  Cell width spans 4 stitches in real charts; rendered here as a
 *  single inline marker that two crossing diagonals share. */
export const C4F: KnittingSymbol = {
  key: 'c4f',
  label: 'Cable 4 front (2 over 2, left-leaning)',
  abbreviation: 'C4F',
  // Two diagonals crossing — front pair angled up-and-to-the-left.
  path:
    'M 0.18 0.78 L 0.82 0.22 ' +
    'M 0.18 0.22 L 0.82 0.78',
  strokeWidth: 0.09,
  source: 'CYC A.22',
}

export const C4B: KnittingSymbol = {
  key: 'c4b',
  label: 'Cable 4 back (2 over 2, right-leaning)',
  abbreviation: 'C4B',
  path:
    'M 0.18 0.22 L 0.82 0.78 ' +
    'M 0.18 0.78 L 0.82 0.22',
  strokeWidth: 0.09,
  source: 'CYC A.21',
}

export const C6F: KnittingSymbol = {
  key: 'c6f',
  label: 'Cable 6 front (3 over 3, left-leaning)',
  abbreviation: 'C6F',
  path:
    'M 0.12 0.82 L 0.88 0.18 ' +
    'M 0.12 0.18 L 0.88 0.82',
  strokeWidth: 0.10,
  source: 'CYC A.24',
}

export const C6B: KnittingSymbol = {
  key: 'c6b',
  label: 'Cable 6 back (3 over 3, right-leaning)',
  abbreviation: 'C6B',
  path:
    'M 0.12 0.18 L 0.88 0.82 ' +
    'M 0.12 0.82 L 0.88 0.18',
  strokeWidth: 0.10,
  source: 'CYC A.23',
}

/** Twist 2 left — 1 purl over 1 knit, leans left. */
export const T2L: KnittingSymbol = {
  key: 't2l',
  label: 'Twist 2 left (1 purl over 1 knit)',
  abbreviation: 'T2L',
  path:
    'M 0.18 0.82 L 0.82 0.22 ' +
    'M 0.18 0.22 L 0.82 0.78 ' +
    // Small dot at the lower-right marks the purl stitch.
    'M 0.74 0.74 L 0.78 0.78',
  strokeWidth: 0.08,
  source: 'CYC A.26',
}

export const T2R: KnittingSymbol = {
  key: 't2r',
  label: 'Twist 2 right (1 knit over 1 purl)',
  abbreviation: 'T2R',
  path:
    'M 0.18 0.22 L 0.82 0.78 ' +
    'M 0.18 0.82 L 0.82 0.22 ' +
    'M 0.22 0.74 L 0.26 0.78',
  strokeWidth: 0.08,
  source: 'CYC A.25',
}

export const T3L: KnittingSymbol = {
  key: 't3l',
  label: 'Twist 3 left',
  abbreviation: 'T3L',
  path:
    'M 0.12 0.82 L 0.88 0.18 ' +
    'M 0.12 0.18 L 0.88 0.82 ' +
    'M 0.76 0.78 L 0.84 0.84',
  strokeWidth: 0.08,
  source: 'CYC',
}

export const T3R: KnittingSymbol = {
  key: 't3r',
  label: 'Twist 3 right',
  abbreviation: 'T3R',
  path:
    'M 0.12 0.18 L 0.88 0.82 ' +
    'M 0.12 0.82 L 0.88 0.18 ' +
    'M 0.16 0.78 L 0.24 0.84',
  strokeWidth: 0.08,
  source: 'CYC',
}
