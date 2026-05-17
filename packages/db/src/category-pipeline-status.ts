/**
 * Auto-flip the `Category.pipelineStatus` field to `COMPLETE` once a
 * category's PUBLISHED count reaches `targetTutorialCount`. Idempotent and
 * safe to call from any publish-transition path; paired with
 * `maybeFlipCategoryVisibility`.
 *
 * Single-queue autopilot context (phase_autopilot_single_queue_001):
 * the round-robin queue cron only picks categories whose `pipelineStatus`
 * is `READY`. Flipping a category to `COMPLETE` removes it from the
 * queue's candidate pool.
 *
 * Behaviour:
 *   - Only flips `READY` → `COMPLETE`. Never touches `NOT_READY`, `PAUSED`,
 *     or `COMPLETE` rows. (NOT_READY would never be in the queue anyway;
 *     PAUSED is admin intent and shouldn't auto-resolve; COMPLETE is
 *     terminal.)
 *   - No-op if `targetTutorialCount` is null.
 *   - No-op if the live PUBLISHED count is below target.
 */

import type { PrismaClient } from '@prisma/client'

export async function maybeFlipCategoryPipelineComplete(
  prisma: PrismaClient,
  categoryId: string,
): Promise<{ flipped: boolean; publishedCount: number; pipelineStatus: string }> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, slug: true, pipelineStatus: true, targetTutorialCount: true },
  })

  if (!category) {
    return { flipped: false, publishedCount: 0, pipelineStatus: 'NOT_READY' }
  }

  if (category.pipelineStatus !== 'READY' || category.targetTutorialCount == null) {
    return {
      flipped: false,
      publishedCount: 0,
      pipelineStatus: category.pipelineStatus,
    }
  }

  const publishedCount = await prisma.tutorial.count({
    where: { categoryId, status: 'PUBLISHED' },
  })

  if (publishedCount < category.targetTutorialCount) {
    return {
      flipped: false,
      publishedCount,
      pipelineStatus: category.pipelineStatus,
    }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { pipelineStatus: 'COMPLETE' },
  })
  return { flipped: true, publishedCount, pipelineStatus: 'COMPLETE' }
}
