import 'server-only'
import { prisma } from '@homemade/db'
import type { Craft } from './run'

/**
 * DB-backed autopilot switch per craft. The bulk cron reads this to decide
 * whether to auto-fill; the admin bulk page toggles it. DB (not env) so it
 * survives deploys and an admin can flip it without a redeploy.
 */

export async function isAutopilotEnabled(craft: Craft): Promise<boolean> {
  const row = await prisma.bulkAutopilotState.findUnique({ where: { craft }, select: { enabled: true } })
  return row?.enabled ?? false
}

export async function setAutopilotEnabled(craft: Craft, enabled: boolean, userId?: string): Promise<void> {
  await prisma.bulkAutopilotState.upsert({
    where: { craft },
    create: { craft, enabled, updatedById: userId ?? null },
    update: { enabled, updatedById: userId ?? null },
  })
}

export async function autopilotStates(): Promise<Record<Craft, boolean>> {
  const rows = await prisma.bulkAutopilotState.findMany({ select: { craft: true, enabled: true } })
  const m = new Map(rows.map((r) => [r.craft, r.enabled]))
  return { 'cross-stitch': m.get('cross-stitch') ?? false, needlework: m.get('needlework') ?? false }
}
