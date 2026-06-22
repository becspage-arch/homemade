/**
 * Crochet materials provider — the second planner adapter.
 *
 * Crochet materials are yarn. A crochet pattern carries its total yardage on
 * `yardageBySize` (metres — the canonical unit, like everywhere else) and its
 * weight via the `YarnWeight` master row. We turn that into a ball count using
 * a typical 100 g ball metreage per Craft Yarn Council weight, with a 15 %
 * safety margin. The maker picks a size (for graded patterns) through the
 * project settings; the stash matches on yarn weight.
 *
 * v1 reports one line for the pattern's primary yarn. Per-colour breakdown
 * (amigurumi, colourwork) waits on the structured per-piece stitch data the
 * loom engine contract introduces; the shape below extends to multiple lines
 * without touching the planner core.
 */

import { prisma, Visibility } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import type {
  MaterialsBreakdown,
  MaterialsProvider,
  MaterialLine,
  PlannerPatternMeta,
  PlannerPatternRef,
} from '../types'

/** Per-project planner settings for a crochet project. */
export interface CrochetPlannerSettings {
  /** Which graded size to buy for. Null / unknown = the pattern's default. */
  size?: string | null
}

/**
 * Typical metres in a 100 g ball by Craft Yarn Council standard weight (0–7).
 * An estimate for the buy-list, not a spec — real ball metreage varies by
 * brand and fibre. Documented so the summary can say so.
 */
const BALL_METRES_BY_CYC: Record<number, number> = {
  0: 600, // Lace
  1: 400, // Fingering / 4-ply
  2: 300, // Sport
  3: 280, // DK
  4: 200, // Worsted / Aran
  5: 120, // Bulky / Chunky
  6: 80, // Super bulky
  7: 40, // Jumbo
}
const DEFAULT_BALL_METRES = 200
const SAFETY_MARGIN = 1.15

function parseSettings(raw: unknown): CrochetPlannerSettings {
  if (!raw || typeof raw !== 'object') return {}
  const obj = raw as Record<string, unknown>
  return { size: typeof obj.size === 'string' && obj.size.length > 0 ? obj.size : null }
}

/** Resolve total metres of yarn from `yardageBySize` for the chosen size. */
function resolveYardage(yardageBySize: unknown, size: string | null): number | null {
  if (!yardageBySize || typeof yardageBySize !== 'object') return null
  const map = yardageBySize as Record<string, unknown>
  const pick = (v: unknown): number | null =>
    typeof v === 'number' && v > 0 ? v : null
  if (size && pick(map[size]) !== null) return pick(map[size])
  if (pick(map.default) !== null) return pick(map.default)
  const firstNumeric = Object.values(map).map(pick).find((v) => v !== null)
  return firstNumeric ?? null
}

async function loadPattern(ref: PlannerPatternRef) {
  const row = await prisma.crochetPattern.findUnique({
    where: { id: ref.patternId },
    select: {
      id: true,
      name: true,
      slug: true,
      yardageBySize: true,
      ownerUserId: true,
      visibility: true,
      primaryYarnWeight: { select: { slug: true, canonicalName: true, standardCategory: true } },
      primaryHook: { select: { mmSize: true } },
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

export const crochetProvider: MaterialsProvider = {
  craft: 'CROCHET',
  unit: 'ball',

  async getPatternMeta(ref: PlannerPatternRef): Promise<PlannerPatternMeta | null> {
    const row = await loadPattern(ref)
    if (!row) return null
    const metres = resolveYardage(row.yardageBySize, null)
    const specParts = [
      row.primaryYarnWeight?.canonicalName ?? null,
      row.primaryHook ? `${row.primaryHook.mmSize} mm hook` : null,
      metres ? `~${metres.toLocaleString()} m` : null,
    ].filter(Boolean)
    return {
      patternId: row.id,
      name: row.name,
      imageUrl: mediaUrl(row.thumbnail ?? row.hero, 'card'),
      spec: specParts.length > 0 ? specParts.join(' · ') : null,
      href: `/studio/crochet?crochetPatternId=${row.id}`,
    }
  },

  async getMaterials(ref: PlannerPatternRef, settings: unknown): Promise<MaterialsBreakdown> {
    const row = await loadPattern(ref)
    if (!row) {
      return { craft: 'CROCHET', lines: [], summary: null, unavailable: true }
    }
    const size = parseSettings(settings).size
    const metres = resolveYardage(row.yardageBySize, size)
    const weightName = row.primaryYarnWeight?.canonicalName ?? null
    const hookNote = row.primaryHook ? `${row.primaryHook.mmSize} mm hook` : null

    if (metres === null) {
      return {
        craft: 'CROCHET',
        lines: [],
        summary: 'Yarn amounts are not yet listed for this pattern.',
        unavailable: false,
      }
    }

    const ballMetres =
      row.primaryYarnWeight?.standardCategory != null
        ? BALL_METRES_BY_CYC[row.primaryYarnWeight.standardCategory] ?? DEFAULT_BALL_METRES
        : DEFAULT_BALL_METRES
    const balls = Math.max(1, Math.ceil((metres * SAFETY_MARGIN) / ballMetres))

    const lines: MaterialLine[] = [
      {
        key: `yarn:${row.primaryYarnWeight?.slug ?? 'unspecified'}`,
        brand: null,
        code: null,
        name: weightName ? `${weightName} weight yarn` : 'Yarn',
        colourRgb: null,
        quantityNeeded: balls,
        unit: 'ball',
        detail: `~${metres.toLocaleString()} m`,
      },
    ]

    const summaryParts = [
      weightName ? `${weightName} weight` : 'Yarn',
      hookNote,
    ].filter(Boolean)
    return {
      craft: 'CROCHET',
      lines,
      summary: `${summaryParts.join(', ')}. Ball counts assume a typical 100 g ball and include a 15% margin.`,
      unavailable: false,
    }
  },
}
