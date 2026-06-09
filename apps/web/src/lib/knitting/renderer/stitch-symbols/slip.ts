import type { KnittingSymbol } from '../types'

/**
 * Slip stitch — `sl1`. Vertical line (V) with a horizontal strike-through
 * at the midpoint. The strike indicates the stitch was slipped, not
 * worked, on this row.
 *
 * Source: CYC A.9 ("v" with bar).
 */
export const SL1: KnittingSymbol = {
  key: 'sl1',
  label: 'Slip 1 stitch purlwise with yarn in back',
  abbreviation: 'sl1',
  path: 'M 0.50 0.18 L 0.50 0.82 M 0.28 0.50 L 0.72 0.50',
  strokeWidth: 0.08,
  source: 'CYC A.9',
}

export const SL1_WYIF: KnittingSymbol = {
  key: 'sl1-wyif',
  label: 'Slip 1 with yarn in front',
  abbreviation: 'sl1 wyif',
  path: 'M 0.50 0.18 L 0.50 0.82 M 0.20 0.50 L 0.80 0.50',
  strokeWidth: 0.08,
  source: 'CYC',
}
