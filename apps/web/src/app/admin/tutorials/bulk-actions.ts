'use server'

import { revalidatePath } from 'next/cache'
import {
  prisma,
  TutorialStatus,
  TutorialType,
  UserRole,
  maybeFlipCategoryVisibility,
  maybeFlipCategoryPipelineComplete,
  type Prisma,
} from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { syncTutorialById, removeTutorialById } from '@/lib/search-sync'
import { notifyTechniquePublished } from '@/lib/technique-sweep-events'
import { buildWhere, parseFilters } from './filters'

export type BulkAction = 'publish' | 'unpublish' | 'archive' | 'delete'

const VALID_ACTIONS: BulkAction[] = ['publish', 'unpublish', 'archive', 'delete']

/**
 * Bulk action on a set of tutorials. Two selection modes:
 *
 *  - `mode=ids`  — `ids` is a comma-separated list.
 *  - `mode=filter` — `filterQuery` is a URL search string captured from the
 *    list page; we re-parse it server-side and re-derive the same WHERE
 *    clause, so the admin can't smuggle an over-broad selector.
 *
 * Delete and bulk-publish (PUBLISHED transition) require ADMIN. EDITOR can
 * unpublish/archive/publish. CREATOR can't bulk anything — they submit via
 * the moderation flow.
 */
export async function bulkTutorialAction(formData: FormData): Promise<void> {
  const actor = await getCurrentDbUser()
  if (!actor) throw new Error('Not authorised.')

  const action = String(formData.get('action') ?? '') as BulkAction
  if (!VALID_ACTIONS.includes(action)) throw new Error('Unknown bulk action.')

  if (action === 'delete' && !hasRoleAtLeast(actor, UserRole.ADMIN)) {
    throw new Error('Only admins can bulk-delete.')
  }
  if (!hasRoleAtLeast(actor, UserRole.EDITOR)) {
    throw new Error('Bulk actions require editor role.')
  }

  const mode = String(formData.get('mode') ?? 'ids')

  let where: Prisma.TutorialWhereInput
  if (mode === 'filter') {
    const raw = String(formData.get('filterQuery') ?? '')
    const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw)
    const filters = parseFilters(params)
    where = buildWhere(filters, { id: actor.id, role: actor.role })
  } else {
    const idsRaw = String(formData.get('ids') ?? '')
    const ids = idsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length === 0) throw new Error('No rows selected.')
    where = { id: { in: ids } }
  }

  // For PUBLISHED transitions, pull the candidate set so we can audit-log per
  // row and trigger the search index sync afterwards. For the bulkier delete
  // path we still need the ids for the search-index removal sweep.
  const candidates = await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      slug: true,
      status: true,
      publishedAt: true,
      categoryId: true,
      type: true,
    },
  })

  if (candidates.length === 0) return

  if (action === 'delete') {
    const ids = candidates.map((c) => c.id)
    await prisma.tutorial.deleteMany({ where: { id: { in: ids } } })
    for (const id of ids) await removeTutorialById(id)
    await audit({
      actorId: actor.id,
      action: 'tutorial.bulk_delete',
      resource: 'Tutorial:bulk',
      metadata: { count: ids.length, ids },
    })
  } else if (action === 'publish') {
    const now = new Date()
    const toUpdate = candidates.filter(
      (c) => c.status !== TutorialStatus.PUBLISHED && c.status !== TutorialStatus.ARCHIVED,
    )
    for (const t of toUpdate) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: {
          status: TutorialStatus.PUBLISHED,
          publishedAt: t.publishedAt ?? now,
          scheduledFor: null,
        },
      })
      await syncTutorialById(t.id)
      // Reverse-sweep (phase_technique_linking_002). A TECHNIQUE that
      // just went live should re-annotate every same-Category recipe
      // whose body already mentions it.
      if (t.type === TutorialType.TECHNIQUE) {
        await notifyTechniquePublished(t.id)
      }
    }
    // Re-check visibility + pipeline-status once per touched category —
    // cheaper than per row.
    const touchedCategoryIds = new Set(toUpdate.map((t) => t.categoryId))
    for (const categoryId of touchedCategoryIds) {
      await maybeFlipCategoryVisibility(prisma, categoryId)
      await maybeFlipCategoryPipelineComplete(prisma, categoryId)
    }
    await audit({
      actorId: actor.id,
      action: 'tutorial.bulk_publish',
      resource: 'Tutorial:bulk',
      metadata: { count: toUpdate.length, ids: toUpdate.map((t) => t.id) },
    })
  } else if (action === 'unpublish') {
    const toUpdate = candidates.filter((c) => c.status === TutorialStatus.PUBLISHED)
    for (const t of toUpdate) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { status: TutorialStatus.DRAFT, scheduledFor: null },
      })
      await syncTutorialById(t.id)
    }
    await audit({
      actorId: actor.id,
      action: 'tutorial.bulk_unpublish',
      resource: 'Tutorial:bulk',
      metadata: { count: toUpdate.length, ids: toUpdate.map((t) => t.id) },
    })
  } else if (action === 'archive') {
    const toUpdate = candidates.filter((c) => c.status === TutorialStatus.PUBLISHED)
    for (const t of toUpdate) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { status: TutorialStatus.ARCHIVED },
      })
      await syncTutorialById(t.id)
    }
    await audit({
      actorId: actor.id,
      action: 'tutorial.bulk_archive',
      resource: 'Tutorial:bulk',
      metadata: { count: toUpdate.length, ids: toUpdate.map((t) => t.id) },
    })
  }

  revalidatePath('/admin/tutorials')
}
