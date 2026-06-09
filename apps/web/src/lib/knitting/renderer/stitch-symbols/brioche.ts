import type { KnittingSymbol } from '../types'

/**
 * Brioche-specific symbols.
 *
 * Brioche stitch pattern uses "brk" (brioche knit — knit the slipped
 * stitch together with its yarn-over) and "brp" (brioche purl — same
 * but on the purl side). Two-colour brioche adds "brkyobrk" (brk into
 * the same stitch + yarn-over + brk) for vertical column shaping.
 *
 * No universal CYC chart for brioche; we follow Nancy Marchant's
 * Knitting Brioche convention.
 *
 * Source: Marchant, Knitting Brioche (2009) chart key.
 */

export const BRK: KnittingSymbol = {
  key: 'brk',
  label: 'Brioche knit (knit stitch with its yarn-over)',
  abbreviation: 'brk',
  // Vertical bar like knit, but two parallel verticals to denote the
  // paired stitch + YO worked together.
  path: 'M 0.36 0.18 L 0.36 0.82 M 0.64 0.18 L 0.64 0.82',
  strokeWidth: 0.07,
  source: 'Marchant 2009',
}

export const BRP: KnittingSymbol = {
  key: 'brp',
  label: 'Brioche purl (purl stitch with its yarn-over)',
  abbreviation: 'brp',
  // Horizontal dash like purl, but doubled.
  path: 'M 0.20 0.38 L 0.80 0.38 M 0.20 0.62 L 0.80 0.62',
  strokeWidth: 0.10,
  source: 'Marchant 2009',
}

export const BRK_YO_BRK: KnittingSymbol = {
  key: 'brkyobrk',
  label: 'Brioche increase (brk, yo, brk into same stitch)',
  abbreviation: 'brkyobrk',
  // Two verticals + circle in the centre.
  path:
    'M 0.30 0.18 L 0.30 0.82 ' +
    'M 0.70 0.18 L 0.70 0.82 ' +
    'M 0.62 0.50 C 0.62 0.434 0.566 0.38 0.50 0.38 ' +
    'C 0.434 0.38 0.38 0.434 0.38 0.50 ' +
    'C 0.38 0.566 0.434 0.62 0.50 0.62 ' +
    'C 0.566 0.62 0.62 0.566 0.62 0.50 Z',
  strokeWidth: 0.06,
  source: 'Marchant 2009',
}

export const BR_K2TOG: KnittingSymbol = {
  key: 'br-k2tog',
  label: 'Brioche knit 2 together (right-leaning brioche decrease)',
  abbreviation: 'br-k2tog',
  path: 'M 0.18 0.82 L 0.82 0.18 M 0.36 0.18 L 0.36 0.62',
  strokeWidth: 0.08,
  source: 'Marchant 2009',
}

export const BR_SSK: KnittingSymbol = {
  key: 'br-ssk',
  label: 'Brioche slip slip knit (left-leaning brioche decrease)',
  abbreviation: 'br-ssk',
  path: 'M 0.18 0.18 L 0.82 0.82 M 0.64 0.18 L 0.64 0.62',
  strokeWidth: 0.08,
  source: 'Marchant 2009',
}

export const SL1_YO: KnittingSymbol = {
  key: 'sl1-yo',
  label: 'Slip 1 with yarn-over (brioche setup)',
  abbreviation: 'sl1yo',
  // Slip mark + small circle above.
  path:
    'M 0.50 0.46 L 0.50 0.86 ' +
    'M 0.30 0.66 L 0.70 0.66 ' +
    'M 0.66 0.26 C 0.66 0.197 0.604 0.14 0.50 0.14 ' +
    'C 0.396 0.14 0.34 0.197 0.34 0.26 ' +
    'C 0.34 0.323 0.396 0.38 0.50 0.38 ' +
    'C 0.604 0.38 0.66 0.323 0.66 0.26 Z',
  strokeWidth: 0.06,
  source: 'Marchant 2009',
}
