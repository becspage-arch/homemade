'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Visibility, UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { keepCandidates, rejectCandidates } from '@/lib/studio/generation/bulk/candidates'

type ActionResult = { ok: true } | { ok: false; error: string }

/** Publish a pattern out of the cross-stitch REVIEW queue. */
export async function publishReviewPattern(id: string): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.EDITOR)) return { ok: false, error: 'Not authorised.' }
  const row = await prisma.pattern.findUnique({
    where: { id },
    select: { id: true, slug: true, ownerUserId: true, type: true, visibility: true, candidateStatus: true },
  })
  if (!row || row.ownerUserId !== null || row.type !== 'CROSS_STITCH' || row.visibility !== Visibility.UNLISTED) {
    return { ok: false, error: 'Not a cross-stitch review-queue pattern.' }
  }
  // An autopilot CANDIDATE goes through the candidates path, not a bare
  // visibility flip: that is what records who decided and syncs the search
  // index. Two ways to publish the same row would mean two different rows.
  if (row.candidateStatus && row.slug) {
    await keepCandidates([row.slug], `admin:${user.id}`)
    revalidatePath('/admin/cross-stitch/review')
    return { ok: true }
  }
  await prisma.pattern.update({ where: { id }, data: { visibility: Visibility.PUBLIC, publishedAt: new Date() } })
  revalidatePath('/admin/cross-stitch/review')
  return { ok: true }
}

/** Discard a pattern from the REVIEW queue (back to PRIVATE — hidden everywhere). */
export async function discardReviewPattern(id: string): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.EDITOR)) return { ok: false, error: 'Not authorised.' }
  const row = await prisma.pattern.findUnique({
    where: { id },
    select: { id: true, slug: true, ownerUserId: true, type: true, candidateStatus: true },
  })
  if (!row || row.ownerUserId !== null || row.type !== 'CROSS_STITCH') {
    return { ok: false, error: 'Not a cross-stitch library pattern.' }
  }
  if (row.candidateStatus && row.slug) {
    await rejectCandidates([{ slug: row.slug, reason: 'discarded in the admin review queue' }], `admin:${user.id}`, {
      source: 'admin-review',
    })
    revalidatePath('/admin/cross-stitch/review')
    return { ok: true }
  }
  await prisma.pattern.update({ where: { id }, data: { visibility: Visibility.PRIVATE, publishedAt: null } })
  revalidatePath('/admin/cross-stitch/review')
  return { ok: true }
}
