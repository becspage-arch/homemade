/**
 * The single canonical Homemade SYSTEM actor.
 *
 * Unattended jobs (cron bulk generation, future scheduled tasks) still need an
 * `actorId` for the AuditLog FK, but there's no admin user behind them. Rather
 * than leave those runs unauditable, they attribute to ONE sentinel User row,
 * keyed on a fixed clerkId so `ensureSystemActor()` is idempotent and can never
 * drift into duplicate system rows.
 *
 * This user never signs in (clerkId is a sentinel, not a real Clerk id) and is a
 * plain MEMBER — it exists purely to own machine-generated audit entries.
 */
import { prisma } from './index'

export const SYSTEM_ACTOR_CLERK_ID = 'system:homemade'
const SYSTEM_ACTOR_EMAIL = 'system@homemade.internal'
const SYSTEM_ACTOR_NAME = 'Homemade System'

/** Upsert and return the one canonical Homemade system actor. Idempotent. */
export async function ensureSystemActor(): Promise<{ id: string }> {
  return prisma.user.upsert({
    where: { clerkId: SYSTEM_ACTOR_CLERK_ID },
    update: {},
    create: {
      clerkId: SYSTEM_ACTOR_CLERK_ID,
      email: SYSTEM_ACTOR_EMAIL,
      name: SYSTEM_ACTOR_NAME,
    },
    select: { id: true },
  })
}
