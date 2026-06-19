'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/auth'

export type StreamName = 'queue' | 'global'

const STREAMS: ReadonlySet<StreamName> = new Set(['queue', 'global'])

type Result = { ok: true } | { ok: false; error: string }

function assertStream(value: string): asserts value is StreamName {
  if (!STREAMS.has(value as StreamName)) {
    throw new Error(`Unknown autopilot stream: ${value}`)
  }
}

export async function pauseStream(
  streamName: string,
  reason: string,
): Promise<Result> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  try {
    assertStream(streamName)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid stream.' }
  }
  const trimmed = reason.trim().slice(0, 500) || null

  await prisma.autopilotPauseState.upsert({
    where: { streamName },
    create: {
      streamName,
      pausedAt: new Date(),
      pausedById: actor.id,
      reason: trimmed,
    },
    update: {
      pausedAt: new Date(),
      pausedById: actor.id,
      reason: trimmed,
    },
  })
  await audit({
    actorId: actor.id,
    action: 'autopilot.paused',
    resource: `AutopilotPauseState:${streamName}`,
    metadata: { streamName, reason: trimmed },
  })
  revalidatePath('/admin/system/autopilot')
  return { ok: true }
}

export async function resumeStream(streamName: string): Promise<Result> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  try {
    assertStream(streamName)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid stream.' }
  }

  await prisma.autopilotPauseState.upsert({
    where: { streamName },
    create: {
      streamName,
      pausedAt: null,
      pausedById: null,
      reason: null,
    },
    update: {
      pausedAt: null,
      pausedById: null,
      reason: null,
    },
  })
  await audit({
    actorId: actor.id,
    action: 'autopilot.resumed',
    resource: `AutopilotPauseState:${streamName}`,
    metadata: { streamName },
  })
  revalidatePath('/admin/system/autopilot')
  return { ok: true }
}

/**
 * Toggle a single category's autopilot gate between READY and PAUSED.
 *
 * Only these two states are toggleable from the admin UI — NOT_READY and
 * COMPLETE are owned by the pipeline (sign-off / target-reached) and are not
 * exposed as a switch. Rejects any attempt to set a non-toggle state, or to
 * toggle a category that is currently NOT_READY / COMPLETE.
 */
export async function setCategoryPipelineStatus(
  categoryId: string,
  next: 'READY' | 'PAUSED',
): Promise<Result> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  if (!categoryId) return { ok: false, error: 'Missing category id.' }
  if (next !== 'READY' && next !== 'PAUSED') {
    return { ok: false, error: 'Status can only be toggled between Ready and Paused.' }
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true, pipelineStatus: true },
  })
  if (!category) return { ok: false, error: 'Category not found.' }
  if (category.pipelineStatus !== 'READY' && category.pipelineStatus !== 'PAUSED') {
    return {
      ok: false,
      error: `${category.slug} is ${category.pipelineStatus} — only Ready/Paused categories can be toggled.`,
    }
  }

  if (category.pipelineStatus === next) {
    revalidatePath('/admin/system/autopilot')
    return { ok: true }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { pipelineStatus: next },
  })
  await audit({
    actorId: actor.id,
    action: next === 'READY' ? 'autopilot.category_readied' : 'autopilot.category_paused',
    resource: `Category:${category.slug}`,
    metadata: { categoryId, from: category.pipelineStatus, to: next },
  })
  revalidatePath('/admin/system/autopilot')
  return { ok: true }
}

export async function acknowledgeHaltSignal(signalId: string): Promise<Result> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  if (!signalId) return { ok: false, error: 'Missing signal id.' }
  await prisma.autopilotHaltSignal.update({
    where: { id: signalId },
    data: { acknowledgedAt: new Date(), acknowledgedById: actor.id },
  })
  await audit({
    actorId: actor.id,
    action: 'autopilot.halt_signal_acknowledged',
    resource: `AutopilotHaltSignal:${signalId}`,
  })
  revalidatePath('/admin/system/autopilot')
  return { ok: true }
}
