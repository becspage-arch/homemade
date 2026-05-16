'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/auth'

export type StreamName = 'cooking' | 'baking' | 'mindset'

const STREAMS: ReadonlySet<StreamName> = new Set(['cooking', 'baking', 'mindset'])

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
