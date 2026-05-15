'use server'

import { revalidatePath } from 'next/cache'
import { prisma, EditorialPickStatus, TutorialStatus } from '@homemade/db'
import { audit } from './audit'
import { requireAdminRole } from './get-current-user'
import {
  isoWeekStartUtc,
  regenerateUpcomingEditorialPicks,
} from './editorial-picks'

/**
 * Regenerate AUTO_SELECTED rows for the upcoming weeks. Used by the admin
 * "Regenerate all auto-picks for this week" button and as a first-visit
 * seed when no rows exist yet.
 */
export async function regenerateEditorialPicksAction(): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })
  const result = await regenerateUpcomingEditorialPicks({
    systemActorId: admin.id,
  })
  await audit({
    actorId: admin.id,
    action: 'editorial_picks.regenerate',
    resource: 'WeeklyEditorialPick',
    metadata: {
      weeksProcessed: result.weeksProcessed.map((w) => ({
        weekStarting: w.weekStarting.toISOString(),
        auto: w.auto,
        preserved: w.preserved,
      })),
    },
  })
  revalidatePath('/admin/editorial-picks')
  revalidatePath('/')
}

/**
 * Pin an existing pick so future cron runs leave it in place. Idempotent —
 * pinning an already-pinned row is a no-op apart from the audit-log entry.
 */
export async function pinEditorialPickAction(pickId: string): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })

  const updated = await prisma.weeklyEditorialPick.update({
    where: { id: pickId },
    data: {
      status: EditorialPickStatus.MANUALLY_PINNED,
      selectedBy: admin.id,
      selectedAt: new Date(),
    },
  })

  await audit({
    actorId: admin.id,
    action: 'editorial_picks.pin',
    resource: `WeeklyEditorialPick:${pickId}`,
    metadata: {
      weekStarting: updated.weekStarting.toISOString(),
      position: updated.position,
      tutorialId: updated.tutorialId,
    },
  })
  revalidatePath('/admin/editorial-picks')
  revalidatePath('/')
}

/**
 * Unpin (back to AUTO_SELECTED). The row stays in place until the next cron
 * run, at which point it competes with all other candidates again.
 */
export async function unpinEditorialPickAction(pickId: string): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })

  const updated = await prisma.weeklyEditorialPick.update({
    where: { id: pickId },
    data: {
      status: EditorialPickStatus.AUTO_SELECTED,
      selectedBy: null,
      selectedAt: null,
    },
  })

  await audit({
    actorId: admin.id,
    action: 'editorial_picks.unpin',
    resource: `WeeklyEditorialPick:${pickId}`,
    metadata: {
      weekStarting: updated.weekStarting.toISOString(),
      position: updated.position,
    },
  })
  revalidatePath('/admin/editorial-picks')
  revalidatePath('/')
}

/**
 * Replace the pick at `(weekStarting, position)` with `newTutorialId`. The
 * previous row's id is preserved on `replacedAutoPickId` so the audit-log
 * entry can reconstruct what was overridden.
 */
export async function replaceEditorialPickAction(
  pickId: string,
  newTutorialId: string,
  reason: string | null,
): Promise<void> {
  const admin = await requireAdminRole({ minimum: 'EDITOR' })

  const existing = await prisma.weeklyEditorialPick.findUnique({
    where: { id: pickId },
  })
  if (!existing) throw new Error('Pick not found.')

  // Verify the replacement tutorial exists and is published.
  const newTutorial = await prisma.tutorial.findUnique({
    where: { id: newTutorialId },
    select: { id: true, status: true, slug: true, title: true },
  })
  if (!newTutorial || newTutorial.status !== TutorialStatus.PUBLISHED) {
    throw new Error('Replacement tutorial must be PUBLISHED.')
  }

  // Guard against picking a tutorial already present in this week's lineup.
  const collision = await prisma.weeklyEditorialPick.findFirst({
    where: {
      weekStarting: existing.weekStarting,
      tutorialId: newTutorialId,
      NOT: { id: pickId },
    },
  })
  if (collision) {
    throw new Error(
      'This tutorial is already in this week\'s lineup at another position.',
    )
  }

  const updated = await prisma.weeklyEditorialPick.update({
    where: { id: pickId },
    data: {
      tutorialId: newTutorialId,
      status: EditorialPickStatus.MANUALLY_REPLACED,
      selectedBy: admin.id,
      selectedAt: new Date(),
      replacedAutoPickId: existing.tutorialId,
      reason: reason ?? null,
    },
  })

  await audit({
    actorId: admin.id,
    action: 'editorial_picks.replace',
    resource: `WeeklyEditorialPick:${pickId}`,
    metadata: {
      weekStarting: updated.weekStarting.toISOString(),
      position: updated.position,
      from: existing.tutorialId,
      to: newTutorialId,
      reason: reason ?? null,
    },
  })
  revalidatePath('/admin/editorial-picks')
  revalidatePath('/')
}

/**
 * Helper used by the admin page to determine when the picks list is empty
 * and a one-click seed makes sense.
 */
export async function pickCountForCurrentWeek(): Promise<number> {
  await requireAdminRole({ minimum: 'EDITOR' })
  return prisma.weeklyEditorialPick.count({
    where: { weekStarting: isoWeekStartUtc(new Date()) },
  })
}
