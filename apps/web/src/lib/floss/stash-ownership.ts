/**
 * Floss ownership — how much of a chart's palette the maker already has.
 *
 * One calculation, three surfaces: the pattern page ("You already own 22 of
 * the 28 colours" plus the ticks and the colours-to-buy list), the library
 * card badge, and the Studio floss key. The stash rows are PlannerStashItem
 * rows for craft CROSS_STITCH, which is where every floss stash entry lives
 * whether it was added from /me/floss-stash or from inside the planner.
 *
 * Matching is deliberately conservative. An exact brand + code match counts
 * first. Failing that, the published cross-reference tables convert the
 * chart's code into the brand the maker keeps their stash in (DMC 310 →
 * Anchor 403), and only a published equivalent counts: the perceptual
 * nearest-match fallback the Studio uses for brand swaps is NOT a colour you
 * own, so it never ticks a row here.
 *
 * Quantities follow the planner's rule so the two never disagree: a colour
 * counts as owned when any quantity of it is in the stash, and what is left
 * to buy rounds up to the next half skein, since no shop sells less.
 */

import { brandEquivalent } from './equivalence-table'
import { DMC_TABLE, type FlossEntry } from './dmc-table'
import { ANCHOR_TABLE } from './anchor-table'
import { MADEIRA_TABLE } from './madeira-table'
import { materialKey } from '@/lib/planner/key'

export type FlossBrandName = 'DMC' | 'ANCHOR' | 'MADEIRA'

export const FLOSS_BRANDS: FlossBrandName[] = ['DMC', 'ANCHOR', 'MADEIRA']

/** Human label for a brand, for copy that names it. */
export const FLOSS_BRAND_LABEL: Record<FlossBrandName, string> = {
  DMC: 'DMC',
  ANCHOR: 'Anchor',
  MADEIRA: 'Madeira',
}

/** One stash row, as stored on PlannerStashItem. */
export interface StashFlossItem {
  brand: string | null
  code: string | null
  quantityOwned: number
}

/** One colour a chart asks for. */
export interface PaletteColour {
  symbol: string
  brand: string
  code: string
  name: string
  rgb: string
  /** Skeins the chart needs, from `estimateSkeinCount`. */
  skeinsNeeded: number
}

export interface OwnedColourLine extends PaletteColour {
  /** True when the stash has any quantity of this colour. */
  owned: boolean
  quantityOwned: number
  /** Still to buy, rounded up to the next half skein. */
  skeinsToBuy: number
  /** The stash brand the match came from, when it was not the chart's brand. */
  matchedBrand: FlossBrandName | null
  matchedCode: string | null
  /** True when the match went through the brand cross-reference tables. */
  converted: boolean
}

export interface FlossOwnership {
  lines: OwnedColourLine[]
  totalColours: number
  ownedColours: number
  /** Colours with anything left to buy, in palette order. */
  toBuy: OwnedColourLine[]
  skeinsToBuy: number
  /** Stash brands a conversion had to go through, for the "converted" note. */
  convertedFromBrands: FlossBrandName[]
}

export function normaliseBrand(raw: string | null | undefined): FlossBrandName | null {
  if (typeof raw !== 'string') return null
  const t = raw.trim().toUpperCase()
  return t === 'DMC' || t === 'ANCHOR' || t === 'MADEIRA' ? t : null
}

const BRAND_TABLES: Record<FlossBrandName, readonly FlossEntry[]> = {
  DMC: DMC_TABLE,
  ANCHOR: ANCHOR_TABLE,
  MADEIRA: MADEIRA_TABLE,
}

/**
 * The shade name and colour for a brand + code, when the embedded tables know
 * it. Used when a stash entry is saved so the list can show the colour rather
 * than a bare code. An unknown code is fine: the maker still owns the skein.
 */
export function flossDetails(
  brand: string | null | undefined,
  code: string | null | undefined,
): { name: string; rgb: string } | null {
  const b = normaliseBrand(brand)
  const c = (code ?? '').trim()
  if (!b || !c) return null
  const table = BRAND_TABLES[b]
  const wanted = c.toUpperCase()
  const entry = table.find((e) => e.code.toUpperCase() === wanted)
  return entry ? { name: entry.name, rgb: entry.rgb } : null
}

/** Round a shortfall up to the next half skein. Matches the planner roll-up. */
export function roundSkeinsToBuy(shortfall: number): number {
  if (!(shortfall > 0)) return 0
  return Math.ceil(shortfall * 2) / 2
}

/**
 * Stash rows keyed by brand + code, quantities summed. Rows with neither a
 * brand nor a code are skipped: there is nothing to match them against.
 */
export function buildStashIndex(items: StashFlossItem[]): Map<string, number> {
  const index = new Map<string, number>()
  for (const item of items) {
    const brand = (item.brand ?? '').trim()
    const code = (item.code ?? '').trim()
    if (!brand && !code) continue
    const qty = Number.isFinite(item.quantityOwned) ? Math.max(0, item.quantityOwned) : 0
    const key = materialKey(brand, code)
    index.set(key, (index.get(key) ?? 0) + qty)
  }
  return index
}

interface StashMatch {
  quantityOwned: number
  matchedBrand: FlossBrandName | null
  matchedCode: string | null
  converted: boolean
}

/**
 * How much of one chart colour the stash holds. Exact brand + code first,
 * then the published cross-reference into each other brand.
 */
export function matchStashColour(
  brand: string,
  code: string,
  index: Map<string, number>,
): StashMatch {
  const trimmedCode = (code ?? '').trim()
  const exact = index.get(materialKey(brand, trimmedCode))
  if (exact !== undefined) {
    return {
      quantityOwned: exact,
      matchedBrand: normaliseBrand(brand),
      matchedCode: trimmedCode,
      converted: false,
    }
  }

  const from = normaliseBrand(brand)
  if (from) {
    for (const to of FLOSS_BRANDS) {
      if (to === from) continue
      const equivalent =
        brandEquivalent(from, trimmedCode, to) ??
        brandEquivalent(from, trimmedCode.toUpperCase(), to)
      // Only a published equivalent counts as the same colour. The perceptual
      // nearest match is a substitute, not a skein the maker already owns.
      if (!equivalent || !equivalent.exact) continue
      const qty = index.get(materialKey(to, equivalent.code))
      if (qty === undefined) continue
      return {
        quantityOwned: qty,
        matchedBrand: to,
        matchedCode: equivalent.code,
        converted: true,
      }
    }
  }

  return { quantityOwned: 0, matchedBrand: null, matchedCode: null, converted: false }
}

/** The whole calculation for one chart. */
export function computeFlossOwnership(
  palette: PaletteColour[],
  stash: StashFlossItem[],
): FlossOwnership {
  const index = buildStashIndex(stash)
  const convertedFrom = new Set<FlossBrandName>()

  const lines: OwnedColourLine[] = palette.map((colour) => {
    const match = matchStashColour(colour.brand, colour.code, index)
    if (match.converted && match.matchedBrand) convertedFrom.add(match.matchedBrand)
    const skeinsToBuy = roundSkeinsToBuy(colour.skeinsNeeded - match.quantityOwned)
    return {
      ...colour,
      owned: match.quantityOwned > 0,
      quantityOwned: match.quantityOwned,
      skeinsToBuy,
      matchedBrand: match.matchedBrand,
      matchedCode: match.matchedCode,
      converted: match.converted,
    }
  })

  const toBuy = lines.filter((line) => line.skeinsToBuy > 0)
  return {
    lines,
    totalColours: lines.length,
    ownedColours: lines.filter((line) => line.owned).length,
    toBuy,
    skeinsToBuy: Math.round(toBuy.reduce((sum, l) => sum + l.skeinsToBuy, 0) * 2) / 2,
    convertedFromBrands: FLOSS_BRANDS.filter((b) => convertedFrom.has(b)),
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Library grid
// ───────────────────────────────────────────────────────────────────────────

/** One row of the grid's palette query: the pattern id and its palette JSON. */
export interface PatternPaletteRow {
  id: string
  palette: unknown
}

export interface PatternOwnedCount {
  owned: number
  total: number
}

/**
 * Owned-colour counts for a whole grid of patterns in one pass, off the
 * palette JSON the grid query extracts. Only the brand and code are read, so
 * the chart's cells never have to be loaded. A pattern whose palette will not
 * parse is left out rather than shown as "0 of 0".
 */
export function ownedCountsForPatterns(
  rows: PatternPaletteRow[],
  stash: StashFlossItem[],
): Map<string, PatternOwnedCount> {
  const index = buildStashIndex(stash)
  const out = new Map<string, PatternOwnedCount>()
  if (index.size === 0) return out

  // One chart repeats the same brand + code across surfaces rarely, but a
  // repeat must not count twice, so each colour is resolved once per pattern.
  const resolved = new Map<string, boolean>()

  for (const row of rows) {
    if (!Array.isArray(row.palette)) continue
    const seen = new Set<string>()
    let owned = 0
    for (const raw of row.palette) {
      if (!raw || typeof raw !== 'object') continue
      const entry = raw as Record<string, unknown>
      const brand = typeof entry.brand === 'string' ? entry.brand.trim() : ''
      const code = typeof entry.code === 'string' ? entry.code.trim() : ''
      if (!brand && !code) continue
      const key = materialKey(brand, code)
      if (seen.has(key)) continue
      seen.add(key)
      let isOwned = resolved.get(key)
      if (isOwned === undefined) {
        isOwned = matchStashColour(brand, code, index).quantityOwned > 0
        resolved.set(key, isOwned)
      }
      if (isOwned) owned++
    }
    if (seen.size > 0) out.set(row.id, { owned, total: seen.size })
  }
  return out
}
