'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Visibility, UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

type ActionResult = { ok: true } | { ok: false; error: string }

/** Publish a pattern out of the cross-stitch REVIEW queue. */
export async function publishReviewPattern(id: string): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.EDITOR)) return { ok: false, error: 'Not authorised.' }
  const row = await prisma.pattern.findUnique({ where: { id }, select: { id: true, ownerUserId: true, type: true, visibility: true } })
  if (!row || row.ownerUserId !== null || row.type !== 'CROSS_STITCH' || row.visibility !== Visibility.UNLISTED) {
    return { ok: false, error: 'Not a cross-stitch review-queue pattern.' }
  }
  await prisma.pattern.update({ where: { id }, data: { visibility: Visibility.PUBLIC, publishedAt: new Date() } })
  revalidatePath('/admin/cross-stitch/review')
  return { ok: true }
}

/** Discard a pattern from the REVIEW queue (back to PRIVATE — hidden everywhere). */
export async function discardReviewPattern(id: string): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.EDITOR)) return { ok: false, error: 'Not authorised.' }
  const row = await prisma.pattern.findUnique({ where: { id }, select: { id: true, ownerUserId: true, type: true } })
  if (!row || row.ownerUserId !== null || row.type !== 'CROSS_STITCH') {
    return { ok: false, error: 'Not a cross-stitch library pattern.' }
  }
  await prisma.pattern.update({ where: { id }, data: { visibility: Visibility.PRIVATE, publishedAt: null } })
  revalidatePath('/admin/cross-stitch/review')
  return { ok: true }
}
