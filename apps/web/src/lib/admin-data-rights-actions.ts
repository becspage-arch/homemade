'use server'

import { revalidatePath } from 'next/cache'
import { prisma, DeletionStatus, DmcaStatus } from '@homemade/db'
import { audit } from './audit'
import { requireAdminRole } from './get-current-user'

type ActionResult = { ok: true } | { ok: false; error: string }

// ────────────────────────────────────────────────────────────────────────────
// Account deletion — admin overrides
// ────────────────────────────────────────────────────────────────────────────

interface AdminCancelDeletionInput {
  requestId: string
  userId: string
  note: string
}

export async function adminCancelAccountDeletion(
  input: AdminCancelDeletionInput,
): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })

  const note = input.note.trim()
  if (note.length === 0) {
    return { ok: false, error: 'A note is required.' }
  }

  const existing = await prisma.accountDeletionRequest.findUnique({
    where: { id: input.requestId },
  })
  if (!existing) return { ok: false, error: 'Request not found.' }
  if (existing.status !== DeletionStatus.SCHEDULED) {
    return { ok: false, error: 'Request is not in a cancellable state.' }
  }

  await prisma.accountDeletionRequest.update({
    where: { id: existing.id },
    data: { status: DeletionStatus.CANCELLED, cancelledAt: new Date() },
  })
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      deletionScheduledFor: null,
      isSuspended: false,
      suspendedUntil: null,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'account_deletion.cancelled_by_admin',
    resource: `AccountDeletionRequest:${existing.id}`,
    metadata: { note, userId: input.userId },
  })

  revalidatePath('/admin/users/deletion-queue')
  revalidatePath(`/admin/users/${input.userId}`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// DMCA — admin actions
// ────────────────────────────────────────────────────────────────────────────

type DmcaAction = 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'REJECTED' | 'COUNTER_NOTICED'

interface ResolveDmcaInput {
  requestId: string
  action: DmcaAction
  note: string
}

export async function resolveDmcaRequest(
  input: ResolveDmcaInput,
): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const note = input.note.trim()
  if (
    (input.action === 'ACTION_TAKEN' || input.action === 'REJECTED') &&
    note.length === 0
  ) {
    return { ok: false, error: 'A note is required.' }
  }

  const existing = await prisma.dmcaTakedownRequest.findUnique({
    where: { id: input.requestId },
  })
  if (!existing) return { ok: false, error: 'Request not found.' }

  const nextStatus: DmcaStatus =
    input.action === 'UNDER_REVIEW'
      ? DmcaStatus.UNDER_REVIEW
      : input.action === 'ACTION_TAKEN'
        ? DmcaStatus.ACTION_TAKEN
        : input.action === 'COUNTER_NOTICED'
          ? DmcaStatus.COUNTER_NOTICED
          : DmcaStatus.REJECTED

  const resolved =
    nextStatus === DmcaStatus.UNDER_REVIEW ? false : true

  await prisma.dmcaTakedownRequest.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      actionTakenNote: note || existing.actionTakenNote,
      resolvedAt: resolved ? new Date() : null,
      resolvedById: resolved ? actor.id : null,
    },
  })

  await audit({
    actorId: actor.id,
    action: `dmca.${input.action.toLowerCase()}`,
    resource: `DmcaTakedownRequest:${existing.id}`,
    metadata: { note },
  })

  revalidatePath('/admin/community/dmca')
  return { ok: true }
}

interface CreateDmcaInput {
  claimantName: string
  claimantEmail: string
  claimantAddress?: string
  contentUrl: string
  contentDescription: string
  swornStatementAccepted: boolean
}

/**
 * Admin-side intake for DMCA notices we receive by email (until the public
 * submission form exists). The admin transcribes the notice into the
 * queue. Logged so we can show provenance.
 */
export async function createDmcaRequest(
  input: CreateDmcaInput,
): Promise<ActionResult & { requestId?: string }> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  if (!input.swornStatementAccepted) {
    return {
      ok: false,
      error:
        'The claimant must have provided a sworn statement of good-faith belief and accuracy.',
    }
  }
  for (const f of ['claimantName', 'claimantEmail', 'contentUrl', 'contentDescription'] as const) {
    if (!input[f]?.toString().trim()) {
      return { ok: false, error: `Missing required field: ${f}.` }
    }
  }

  const row = await prisma.dmcaTakedownRequest.create({
    data: {
      claimantName: input.claimantName.trim(),
      claimantEmail: input.claimantEmail.trim().toLowerCase(),
      claimantAddress: input.claimantAddress?.trim() || null,
      contentUrl: input.contentUrl.trim(),
      contentDescription: input.contentDescription.trim(),
      swornStatementAccepted: true,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'dmca.received',
    resource: `DmcaTakedownRequest:${row.id}`,
    metadata: { claimantEmail: row.claimantEmail },
  })

  revalidatePath('/admin/community/dmca')
  return { ok: true, requestId: row.id }
}
