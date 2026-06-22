/**
 * Cross-stitch materials provider — the first planner adapter.
 *
 * Materials maths reuses the canonical floss-list logic: per-colour stitch
 * counts from the parsed pattern grid, skeins via `estimateSkeinCount`
 * (the same 25% safety margin the pattern page and the floss-list route use).
 * The maker's chosen fabric count overrides the pattern's suggestion when set,
 * since a finer count needs more skeins.
 */

import {
  prisma,
  parsePatternData,
  estimateSkeinCount,
  Visibility,
  type PatternData,
} from '@homemade/db'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { materialKey } from '../key'
import type {
  MaterialsBreakdown,
  MaterialsProvider,
  MaterialLine,
  PlannerPatternMeta,
  PlannerPatternRef,
} from '../types'

/** Per-project planner settings for a cross-stitch project. */
export interface CrossStitchPlannerSettings {
  /** Override the pattern's suggested Aida count. Null = use the pattern's. */
  fabricCount?: number | null
}

function parseSettings(raw: unknown): CrossStitchPlannerSettings {
  if (!raw || typeof raw !== 'object') return {}
  const obj = raw as Record<string, unknown>
  return {
    fabricCount:
      typeof obj.fabricCount === 'number' && obj.fabricCount > 0 ? obj.fabricCount : null,
  }
}

async function loadPattern(ref: PlannerPatternRef) {
  const row = await prisma.pattern.findUnique({
    where: { id: ref.patternId },
    select: {
      id: true,
      name: true,
      slug: true,
      data: true,
      ownerUserId: true,
      visibility: true,
      widthCells: true,
      heightCells: true,
      colourCount: true,
      fabricCountSuggested: true,
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!row) return null
  // Library patterns are public; private patterns only resolve for their owner.
  const isLibrary = row.ownerUserId === null && row.visibility !== Visibility.PRIVATE
  if (!isLibrary && row.ownerUserId !== ref.viewerUserId) return null
  return row
}

/**
 * Re-scale a skein estimate for a fabric count the maker picked that differs
 * from the pattern's suggested count. `estimateSkeinCount` bakes in the
 * pattern's own fabric count, so we divide it back out and re-apply the chosen
 * one — coverage scales with the square of the count (stitches per inch²).
 */
function scaleSkeins(base: number, fromCount: number, toCount: number): number {
  if (!toCount || toCount === fromCount) return base
  const scaled = base * (toCount / fromCount) ** 2
  // Match estimateSkeinCount's rounding: nearest 0.5, minimum 1.
  return Math.max(1, Math.round(scaled * 2) / 2)
}

function buildLines(data: PatternData, chosenCount: number): MaterialLine[] {
  const patternCount = data.fabric.count
  return data.palette.map((entry) => {
    let stitches = 0
    for (const cell of data.grid.cells) if (cell.s === entry.symbol) stitches++
    const baseSkeins = estimateSkeinCount(data, entry.symbol)
    const skeins = scaleSkeins(baseSkeins, patternCount, chosenCount)
    return {
      key: materialKey(entry.brand, entry.code),
      brand: entry.brand,
      code: entry.code,
      name: entry.name,
      colourRgb: entry.rgb,
      quantityNeeded: skeins,
      unit: 'skein',
      detail: `${stitches.toLocaleString()} stitches`,
    }
  })
}

export const crossStitchProvider: MaterialsProvider = {
  craft: 'CROSS_STITCH',
  unit: 'skein',

  async getPatternMeta(ref: PlannerPatternRef): Promise<PlannerPatternMeta | null> {
    const row = await loadPattern(ref)
    if (!row) return null
    return {
      patternId: row.id,
      name: row.name,
      imageUrl: patternHeroUrl(
        { id: row.id, hero: row.hero, thumbnail: row.thumbnail },
        'card',
      ),
      spec: `${row.widthCells} × ${row.heightCells} · ${row.colourCount} colours`,
      href: row.slug
        ? `/cross-stitch/patterns/${row.slug}`
        : `/studio/cross-stitch?patternId=${row.id}`,
    }
  },

  async getMaterials(
    ref: PlannerPatternRef,
    settings: unknown,
  ): Promise<MaterialsBreakdown> {
    const row = await loadPattern(ref)
    if (!row) {
      return { craft: 'CROSS_STITCH', lines: [], summary: null, unavailable: true }
    }
    let data: PatternData
    try {
      data = parsePatternData(row.data)
    } catch {
      return { craft: 'CROSS_STITCH', lines: [], summary: null, unavailable: true }
    }
    const chosenCount = parseSettings(settings).fabricCount ?? row.fabricCountSuggested
    const lines = buildLines(data, chosenCount)
    return {
      craft: 'CROSS_STITCH',
      lines,
      summary: `${chosenCount}-count ${data.fabric.type}. Skein counts include a 25% safety margin.`,
      unavailable: false,
    }
  },
}
