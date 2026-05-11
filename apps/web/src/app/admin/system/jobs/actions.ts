'use server'

import { inngest } from '@/inngest/client'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/get-current-user'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function triggerTypesenseReindex(): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  try {
    await inngest.send({
      name: 'tutorials/reindex.requested',
      data: { triggeredBy: actor.id },
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not reach Inngest.',
    }
  }
  await audit({
    actorId: actor.id,
    action: 'system.typesense_reindex_requested',
    resource: 'Inngest:typesense-reindex',
  })
  return { ok: true }
}
