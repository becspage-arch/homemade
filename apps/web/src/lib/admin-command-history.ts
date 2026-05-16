'use server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from './get-current-user'
import { UserRole } from '@homemade/db'

/**
 * Record a cmd-K invocation. Best-effort; never throws. Caller passes the
 * command string the palette assigned (e.g. `goto:/admin/tutorials`,
 * `tutorial:open:<id>`) and an optional context blob (current route, etc.).
 */
export async function recordAdminCommand(
  command: string,
  context: Record<string, unknown> | null = null,
): Promise<void> {
  try {
    const user = await getCurrentDbUser()
    if (!user) return
    if (!hasRoleAtLeast(user, UserRole.CREATOR)) return
    await prisma.adminCommandHistory.create({
      data: {
        userId: user.id,
        command,
        context: (context ?? undefined) as never,
      },
    })
  } catch (err) {
    // Telemetry must never break the palette
    console.warn('recordAdminCommand failed', err)
  }
}
