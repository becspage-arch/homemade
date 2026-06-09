import type { KnittingSymbol } from '../types'

/**
 * Knit stitch.
 *
 * CYC convention for the knit stitch on the RS of work is a blank cell
 * (chart is read against an implicit knit ground). We render a faint
 * vertical bar at the cell midpoint so the cell visibly contains
 * something — at the small sizes knitting charts run at, an entirely
 * blank cell reads as "missing data" rather than "knit". The bar is
 * thin and low-contrast, exactly matching the convention used by Vogue
 * Knitting Stitchionary + the Walker treasuries.
 *
 * Source: Craft Yarn Council master knit & crochet chart symbols
 * (https://www.craftyarncouncil.com), Vogue Knitting Stitchionary.
 */
export const KNIT: KnittingSymbol = {
  key: 'knit',
  label: 'Knit on RS, purl on WS',
  abbreviation: 'k',
  path: 'M 0.50 0.18 L 0.50 0.82',
  strokeWidth: 0.05,
  source: 'CYC, Vogue Knitting',
}
