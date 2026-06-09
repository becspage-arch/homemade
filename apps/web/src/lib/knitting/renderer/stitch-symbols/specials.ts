import type { KnittingSymbol } from '../types'

/**
 * Special-purpose stitch symbols. Covers increases other than yarn-over,
 * twisted variants, and pattern-stitch shorthand seen in published lace
 * and colourwork charts.
 */

export const M1L: KnittingSymbol = {
  key: 'm1l',
  label: 'Make 1 left (lifted increase, left-leaning)',
  abbreviation: 'M1L',
  // Backslash arrow shape pointing up-left.
  path:
    'M 0.50 0.18 L 0.50 0.82 ' +
    'M 0.50 0.18 L 0.26 0.40 ' +
    'M 0.50 0.18 L 0.74 0.40',
  strokeWidth: 0.07,
  source: 'CYC',
}

export const M1R: KnittingSymbol = {
  key: 'm1r',
  label: 'Make 1 right (lifted increase, right-leaning)',
  abbreviation: 'M1R',
  path:
    'M 0.50 0.18 L 0.50 0.82 ' +
    'M 0.50 0.18 L 0.30 0.42 ' +
    'M 0.50 0.18 L 0.70 0.42',
  strokeWidth: 0.07,
  source: 'CYC',
}

export const KFB: KnittingSymbol = {
  key: 'kfb',
  label: 'Knit front and back (increase)',
  abbreviation: 'kfb',
  // V with a small bar in the middle — implies two stitches from one.
  path:
    'M 0.20 0.18 L 0.50 0.62 L 0.80 0.18 ' +
    'M 0.50 0.62 L 0.50 0.82',
  strokeWidth: 0.07,
  source: 'CYC',
}

export const KTBL: KnittingSymbol = {
  key: 'ktbl',
  label: 'Knit through back loop (twisted knit)',
  abbreviation: 'ktbl',
  // Vertical bar with a small twist mark at the top.
  path:
    'M 0.50 0.18 L 0.50 0.82 ' +
    'M 0.36 0.30 L 0.64 0.30',
  strokeWidth: 0.06,
  source: 'CYC',
}

export const PTBL: KnittingSymbol = {
  key: 'ptbl',
  label: 'Purl through back loop (twisted purl)',
  abbreviation: 'ptbl',
  path:
    'M 0.20 0.50 L 0.80 0.50 ' +
    'M 0.40 0.32 L 0.60 0.32',
  strokeWidth: 0.10,
  source: 'CYC',
}

export const BO: KnittingSymbol = {
  key: 'bo',
  label: 'Bind off',
  abbreviation: 'BO',
  // Strong horizontal cap that says "stitch removed".
  path: 'M 0.16 0.40 L 0.84 0.40 M 0.16 0.60 L 0.84 0.60',
  strokeWidth: 0.10,
  source: 'CYC',
}

export const PATTERN_REPEAT: KnittingSymbol = {
  key: 'pattern-repeat',
  label: 'Pattern repeat marker (informational only)',
  abbreviation: 'rep',
  // Small dot.
  path:
    'M 0.55 0.50 C 0.55 0.472 0.528 0.45 0.50 0.45 ' +
    'C 0.472 0.45 0.45 0.472 0.45 0.50 ' +
    'C 0.45 0.528 0.472 0.55 0.50 0.55 ' +
    'C 0.528 0.55 0.55 0.528 0.55 0.50 Z',
  strokeWidth: 0.04,
  fillOverride: 'currentColor',
  excludeFromCount: true,
  source: 'Convention',
}
