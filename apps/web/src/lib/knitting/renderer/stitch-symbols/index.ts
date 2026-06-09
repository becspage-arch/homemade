/**
 * Knitting stitch symbol registry. Looked up by the slug stored in
 * `KnittingChartData.grid.cells[].s`. Adding a new symbol:
 *
 *   1. Create a file under `stitch-symbols/` exporting a `KnittingSymbol`.
 *   2. Import + add it to `SYMBOLS` below.
 *   3. The renderer picks it up automatically.
 *
 * Unknown symbol slugs fall back to `UNKNOWN_SYMBOL` and surface as a
 * verifier warning so the chart still renders without a black hole.
 */

import type { KnittingSymbol } from '../types'
import { KNIT } from './knit'
import { PURL } from './purl'
import { YARN_OVER } from './yarn-over'
import { K2TOG, SSK, CDD, K3TOG, SSSK } from './decreases'
import { SL1, SL1_WYIF } from './slip'
import { NO_STITCH } from './no-stitch'
import { C4F, C4B, C6F, C6B, T2L, T2R, T3L, T3R } from './cables'
import { BRK, BRP, BRK_YO_BRK, BR_K2TOG, BR_SSK, SL1_YO } from './brioche'
import { M1L, M1R, KFB, KTBL, PTBL, BO, PATTERN_REPEAT } from './specials'

const SYMBOLS: KnittingSymbol[] = [
  // Foundation stitches
  KNIT,
  PURL,
  // Increases
  YARN_OVER,
  M1L,
  M1R,
  KFB,
  // Decreases
  K2TOG,
  SSK,
  CDD,
  K3TOG,
  SSSK,
  // Slip
  SL1,
  SL1_WYIF,
  // Twisted variants
  KTBL,
  PTBL,
  // Cables (inline cells — full crossings handled via CableCrossing)
  C4F,
  C4B,
  C6F,
  C6B,
  T2L,
  T2R,
  T3L,
  T3R,
  // Brioche
  BRK,
  BRP,
  BRK_YO_BRK,
  BR_K2TOG,
  BR_SSK,
  SL1_YO,
  // Structural
  NO_STITCH,
  BO,
  PATTERN_REPEAT,
]

const REGISTRY = new Map<string, KnittingSymbol>(
  SYMBOLS.map((s) => [s.key, s]),
)

/** Fallback used when a chart references a slug not in the registry.
 *  Renders as a small "?" so the surrounding grid still places. */
export const UNKNOWN_SYMBOL: KnittingSymbol = {
  key: '__unknown__',
  label: 'Unknown symbol',
  abbreviation: '?',
  path:
    'M 0.34 0.34 ' +
    'C 0.34 0.245 0.418 0.20 0.50 0.20 ' +
    'C 0.582 0.20 0.66 0.245 0.66 0.34 ' +
    'C 0.66 0.42 0.50 0.46 0.50 0.58 ' +
    'M 0.50 0.74 L 0.50 0.74',
  strokeWidth: 0.08,
  fillOverride: 'none',
}

export function getSymbol(slug: string): KnittingSymbol | null {
  return REGISTRY.get(slug) ?? null
}

export function getSymbolOrUnknown(slug: string): KnittingSymbol {
  return REGISTRY.get(slug) ?? UNKNOWN_SYMBOL
}

export function listSymbols(): KnittingSymbol[] {
  return SYMBOLS.slice()
}

export function hasSymbol(slug: string): boolean {
  return REGISTRY.has(slug)
}
