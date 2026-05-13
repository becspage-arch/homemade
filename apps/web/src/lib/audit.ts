import 'server-only'
import { prisma, type Prisma } from '@homemade/db'

interface AuditEntry {
  actorId: string
  action: string
  resource: string
  metadata?: Prisma.InputJsonValue
}

/**
 * Write an audit log entry. Designed to never throw — if logging fails, the
 * caller's operation should still succeed (we surface the error to the
 * console for visibility but don't propagate).
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        resource: entry.resource,
        metadata: entry.metadata,
      },
    })
  } catch (err) {
    console.error('audit log write failed', { entry, err })
  }
}
