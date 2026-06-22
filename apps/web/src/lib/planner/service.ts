/**
 * Planner service — the shared read layer behind both the /me/planner page and
 * the planner API routes. Craft-agnostic: it leans entirely on the registry of
 * materials providers, so a new craft needs no change here.
 */

import 'server-only'
import {
  prisma,
  type PlannerCraft,
  type PlannerProjectStatus,
} from '@homemade/db'
import { getMaterialsProvider } from './registry'
import { rollUpMaterials, totalsFor, type StashEntry, type MaterialsTotals } from './rollup'
import { materialKey } from './key'
import type { MaterialLine, PlannerPatternMeta, RolledUpMaterial } from './types'

export interface PlannerProjectView {
  id: string
  craft: PlannerCraft
  patternId: string
  status: PlannerProjectStatus
  position: number
  notes: string | null
  settings: Record<string, unknown>
  meta: PlannerPatternMeta | null
  createdAt: string
  updatedAt: string
}

export interface PlannerStashView {
  id: string
  craft: PlannerCraft
  brand: string | null
  code: string | null
  name: string | null
  colourRgb: string | null
  quantityOwned: number
  unit: string
  notes: string | null
}

export interface PlannerMaterials {
  rows: RolledUpMaterial[]
  totals: MaterialsTotals
  /** Provider summaries for the projects that fed the roll-up. */
  notes: string[]
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

/** Every planner project for a maker, newest queue position first, with the
 *  source pattern's display metadata resolved through its provider. */
export async function listPlannerProjects(userId: string): Promise<PlannerProjectView[]> {
  const rows = await prisma.plannerProject.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
  })

  return Promise.all(
    rows.map(async (row): Promise<PlannerProjectView> => {
      const provider = getMaterialsProvider(row.craft)
      const meta = provider
        ? await provider.getPatternMeta({
            craft: row.craft,
            patternId: row.patternId,
            viewerUserId: userId,
          })
        : null
      return {
        id: row.id,
        craft: row.craft,
        patternId: row.patternId,
        status: row.status,
        position: row.position,
        notes: row.notes,
        settings: asRecord(row.settings),
        meta,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }
    }),
  )
}

export async function listPlannerStash(
  userId: string,
  craft: PlannerCraft,
): Promise<PlannerStashView[]> {
  const rows = await prisma.plannerStashItem.findMany({
    where: { userId, craft, archivedAt: null },
    orderBy: [{ brand: 'asc' }, { code: 'asc' }],
  })
  return rows.map((row) => ({
    id: row.id,
    craft: row.craft,
    brand: row.brand,
    code: row.code,
    name: row.name,
    colourRgb: row.colourRgb,
    quantityOwned: row.quantityOwned,
    unit: row.unit,
    notes: row.notes,
  }))
}

const ACTIVE_STATUSES: PlannerProjectStatus[] = ['QUEUED', 'IN_PROGRESS']

/**
 * The premium roll-up: every material needed across the maker's active
 * projects in one craft, combined by colour, with the stash subtracted to give
 * the shopping list. `projectId` narrows it to a single project.
 */
export async function getPlannerMaterials(
  userId: string,
  craft: PlannerCraft,
  opts: { projectId?: string } = {},
): Promise<PlannerMaterials> {
  const provider = getMaterialsProvider(craft)
  if (!provider) {
    return { rows: [], totals: totalsFor([]), notes: [] }
  }

  const projects = await prisma.plannerProject.findMany({
    where: {
      userId,
      craft,
      ...(opts.projectId
        ? { id: opts.projectId }
        : { status: { in: ACTIVE_STATUSES } }),
    },
  })

  const allLines: MaterialLine[] = []
  const notes: string[] = []
  const seenNotes = new Set<string>()
  for (const project of projects) {
    const breakdown = await provider.getMaterials(
      { craft, patternId: project.patternId, viewerUserId: userId },
      project.settings,
    )
    if (breakdown.unavailable) continue
    allLines.push(...breakdown.lines)
    if (breakdown.summary && !seenNotes.has(breakdown.summary)) {
      seenNotes.add(breakdown.summary)
      notes.push(breakdown.summary)
    }
  }

  const stashRows = await prisma.plannerStashItem.findMany({
    where: { userId, craft, archivedAt: null },
  })
  const stash: StashEntry[] = stashRows.map((s) => ({
    key: materialKey(s.brand, s.code, s.name),
    quantityOwned: s.quantityOwned,
  }))

  const rows = rollUpMaterials(allLines, stash)
  return { rows, totals: totalsFor(rows), notes }
}
