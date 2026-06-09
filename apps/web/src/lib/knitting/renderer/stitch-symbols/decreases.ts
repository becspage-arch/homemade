import type { KnittingSymbol } from '../types'

/**
 * Decrease symbols. Direction-aware — the slash matches the stitch lean:
 *   - k2tog (right-leaning decrease): forward slash "/"
 *   - ssk   (left-leaning decrease):  back slash "\"
 *   - cdd   (centred double decrease): inverted triangle
 *
 * CYC convention. The slash sits at the bottom of the cell so the
 * decrease reads as compressing two stitches into one — the slash
 * "swallows" the stitch beneath it.
 */

export const K2TOG: KnittingSymbol = {
  key: 'k2tog',
  label: 'Knit 2 together (right-leaning decrease)',
  abbreviation: 'k2tog',
  // Forward slash bottom-left to top-right.
  path: 'M 0.18 0.82 L 0.82 0.18',
  strokeWidth: 0.10,
  source: 'CYC A.6, Vogue',
}

export const SSK: KnittingSymbol = {
  key: 'ssk',
  label: 'Slip slip knit (left-leaning decrease)',
  abbreviation: 'ssk',
  // Back slash top-left to bottom-right.
  path: 'M 0.18 0.18 L 0.82 0.82',
  strokeWidth: 0.10,
  source: 'CYC A.7, Vogue',
}

export const CDD: KnittingSymbol = {
  key: 'cdd',
  label: 'Centred double decrease (slip 1, k2tog, psso)',
  abbreviation: 'sl1-k2tog-psso',
  // Inverted triangle — both stitches symmetrically converge into one.
  path: 'M 0.16 0.20 L 0.84 0.20 L 0.50 0.82 Z',
  strokeWidth: 0.08,
  fillOverride: 'currentColor',
  source: 'CYC A.8',
}

export const K3TOG: KnittingSymbol = {
  key: 'k3tog',
  label: 'Knit 3 together (right-leaning double decrease)',
  abbreviation: 'k3tog',
  // Two stacked forward slashes — implies two layers compressing.
  path: 'M 0.18 0.82 L 0.82 0.18 M 0.18 0.62 L 0.62 0.18',
  strokeWidth: 0.09,
  source: 'CYC',
}

export const SSSK: KnittingSymbol = {
  key: 'sssk',
  label: 'Slip slip slip knit (left-leaning double decrease)',
  abbreviation: 'sssk',
  path: 'M 0.18 0.18 L 0.82 0.82 M 0.38 0.18 L 0.82 0.62',
  strokeWidth: 0.09,
  source: 'CYC',
}
