/**
 * Roll-up: combine the materials of several projects so a colour shared across
 * patterns is bought once, then subtract what the maker already owns to get the
 * shopping list. Craft-agnostic — it works on normalised MaterialLines, so the
 * same roll-up serves every craft's provider.
 */

import type { MaterialLine, RolledUpMaterial } from './types'

export interface StashEntry {
  /** Same identity scheme the provider uses, e.g. "DMC:310". */
  key: string
  quantityOwned: number
}

/**
 * Combine lines by `key`, summing what's needed and rounding the buy figure up
 * to the craft's half-unit step (you can't buy a third of a skein). Stash is
 * applied per key. Output is sorted by brand then code for a stable list.
 */
export function rollUpMaterials(
  lines: MaterialLine[],
  stash: StashEntry[],
): RolledUpMaterial[] {
  const owned = new Map<string, number>()
  for (const s of stash) {
    owned.set(s.key, (owned.get(s.key) ?? 0) + s.quantityOwned)
  }

  const merged = new Map<string, MaterialLine>()
  for (const line of lines) {
    const existing = merged.get(line.key)
    if (existing) {
      existing.quantityNeeded += line.quantityNeeded
    } else {
      merged.set(line.key, { ...line })
    }
  }

  const out: RolledUpMaterial[] = []
  for (const line of merged.values()) {
    const quantityOwned = owned.get(line.key) ?? 0
    const rawToBuy = Math.max(0, line.quantityNeeded - quantityOwned)
    // Round purchase up to the next half unit; a colour that's even slightly
    // short still needs a whole next skein in practice.
    const quantityToBuy = Math.ceil(rawToBuy * 2) / 2
    out.push({ ...line, quantityOwned, quantityToBuy })
  }

  out.sort((a, b) => {
    const brandCmp = (a.brand ?? '').localeCompare(b.brand ?? '')
    if (brandCmp !== 0) return brandCmp
    return (a.code ?? '').localeCompare(b.code ?? '', undefined, { numeric: true })
  })
  return out
}

export interface MaterialsTotals {
  colours: number
  skeinsNeeded: number
  skeinsOwned: number
  skeinsToBuy: number
}

export function totalsFor(rows: RolledUpMaterial[]): MaterialsTotals {
  let skeinsNeeded = 0
  let skeinsOwned = 0
  let skeinsToBuy = 0
  for (const r of rows) {
    skeinsNeeded += r.quantityNeeded
    skeinsOwned += Math.min(r.quantityOwned, r.quantityNeeded)
    skeinsToBuy += r.quantityToBuy
  }
  return {
    colours: rows.length,
    skeinsNeeded: Math.round(skeinsNeeded * 2) / 2,
    skeinsOwned: Math.round(skeinsOwned * 2) / 2,
    skeinsToBuy: Math.round(skeinsToBuy * 2) / 2,
  }
}
