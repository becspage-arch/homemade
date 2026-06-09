import type { KnittingSymbol } from '../types'

/**
 * Purl stitch on RS / knit on WS.
 *
 * CYC convention: a horizontal dash centred in the cell. Some publishers
 * (Vogue, Interweave) use a filled dot; we use the CYC dash because it
 * reads at the smallest cell sizes (16-20px) without becoming a smudge.
 *
 * Source: Craft Yarn Council, CYC chart symbols A.1.
 */
export const PURL: KnittingSymbol = {
  key: 'purl',
  label: 'Purl on RS, knit on WS',
  abbreviation: 'p',
  path: 'M 0.20 0.50 L 0.80 0.50',
  strokeWidth: 0.12,
  source: 'CYC A.1',
}
