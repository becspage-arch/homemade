'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  DataExportStatus,
  DeletionStatus,
} from '@homemade/db'
import { audit } from './audit'
import { getCurrentDbUser } from './get-current-user'
import { uploadExportBundle } from './data-rights'

type ActionResult = { ok: true } | { ok: false; error: string }

const DELETION_GRACE_DAYS = 30
const EXPORT_THROTTLE_MS = 60 * 60 * 1000 // one export per hour per user

async function requireUser() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  return user
}

/**
 * Kick off a data export. Currently synchronous: builds the bundle, ships
 * it to R2, marks the request READY. If anything goes wrong the row is
 * marked FAILED with the error message so the user can retry.
 */
export async function requestDataExport(): Promise<
  ActionResult & { requestId?: string }
> {
  const user = await requireUser()

  // Throttle: don't let a user spam the export. Most recent request must
  // be older than EXPORT_THROTTLE_MS, OR be in a terminal state.
  const recent = await prisma.dataExportRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  if (
    recent &&
    Date.now() - recent.createdAt.getTime() < EXPORT_THROTTLE_MS &&
    (recent.status === DataExportStatus.REQUESTED ||
      recent.status === DataExportStatus.PROCESSING ||
      recent.status === DataExportStatus.READY)
  ) {
    return {
      ok: false,
      error:
        'There is already a recent export. Wait up to an hour or download the existing one.',
    }
  }

  const request = await prisma.dataExportRequest.create({
    data: { userId: user.id, status: DataExportStatus.PROCESSING },
  })

  try {
    const { fileUrl, fileKey, bytes, expiresAt } = await uploadExportBundle(
      user.id,
      request.id,
    )
    await prisma.dataExportRequest.update({
      where: { id: request.id },
      data: {
        status: DataExportStatus.READY,
        fileUrl,
        fileKey,
        bytes,
        expiresAt,
        completedAt: new Date(),
      },
    })
    await audit({
      actorId: user.id,
      action: 'data_export.created',
      resource: `DataExportRequest:${request.id}`,
      metadata: { bytes },
    })
    revalidatePath('/me/data-rights')
    return { ok: true, requestId: request.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    await prisma.dataExportRequest.update({
      where: { id: request.id },
      data: { status: DataExportStatus.FAILED, error: message },
    })
    await audit({
      actorId: user.id,
      action: 'data_export.failed',
      resource: `DataExportRequest:${request.id}`,
      metadata: { error: message },
    })
    return { ok: false, error: message }
  }
}

/**
 * Schedule the user's account deletion 30 days from now. While SCHEDULED,
 * the user is also suspended so the account is unusable; cancelling lifts
 * the suspension.
 */
export async function scheduleAccountDeletion(
  reason: string | null,
): Promise<ActionResult> {
  const user = await requireUser()

  const existing = await prisma.accountDeletionRequest.findUnique({
    where: { userId: user.id },
  })
  if (existing && existing.status === DeletionStatus.SCHEDULED) {
    return { ok: false, error: 'A deletion is already scheduled.' }
  }

  const scheduledFor = new Date(Date.now() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000)

  if (existing) {
    await prisma.accountDeletionRequest.update({
      where: { id: existing.id },
      data: {
        status: DeletionStatus.SCHEDULED,
        reason: reason?.trim() || null,
        scheduledFor,
        requestedAt: new Date(),
        cancelledAt: null,
        completedAt: null,
      },
    })
  } else {
    await prisma.accountDeletionRequest.create({
      data: {
        userId: user.id,
        reason: reason?.trim() || null,
        status: DeletionStatus.SCHEDULED,
        scheduledFor,
      },
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletionScheduledFor: scheduledFor,
      isSuspended: true,
      suspendedUntil: scheduledFor,
    },
  })

  await audit({
    actorId: user.id,
    action: 'account_deletion.scheduled',
    resource: `User:${user.id}`,
    metadata: { scheduledFor: scheduledFor.toISOString(), reason: reason ?? null },
  })

  revalidatePath('/me/data-rights')
  return { ok: true }
}

/**
 * Cancel a scheduled deletion. Lifts the related suspension.
 */
export async function cancelAccountDeletion(): Promise<ActionResult> {
  const user = await requireUser()

  const existing = await prisma.accountDeletionRequest.findUnique({
    where: { userId: user.id },
  })
  if (!existing || existing.status !== DeletionStatus.SCHEDULED) {
    return { ok: false, error: 'No active deletion to cancel.' }
  }

  await prisma.accountDeletionRequest.update({
    where: { id: existing.id },
    data: { status: DeletionStatus.CANCELLED, cancelledAt: new Date() },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletionScheduledFor: null,
      isSuspended: false,
      suspendedUntil: null,
    },
  })

  await audit({
    actorId: user.id,
    action: 'account_deletion.cancelled',
    resource: `User:${user.id}`,
  })

  revalidatePath('/me/data-rights')
  return { ok: true }
}

/**
 * Mark a stale export EXPIRED on read (cheap on-demand cleanup). Called
 * by the data-rights page when listing.
 */
export async function expireStaleExports(userId: string): Promise<void> {
  await prisma.dataExportRequest.updateMany({
    where: {
      userId,
      status: DataExportStatus.READY,
      expiresAt: { lt: new Date() },
    },
    data: { status: DataExportStatus.EXPIRED, fileUrl: null },
  })
}
