'use server'

import { prisma } from '@homemade/db'
import { getCurrentDbUser } from './get-current-user'

type ActionResult = { ok: true } | { ok: false; error: string }

interface ConsentInput {
  analytics: boolean
  errorMonitoring: boolean
  version: string
  decidedAt: string
}

/**
 * Persist the cookie banner's decision to the signed-in user's row.
 * Anonymous visitors only ever have localStorage consent; this action is a
 * no-op for them. Failures don't propagate — the banner's localStorage
 * write is the source of truth on the device.
 */
export async function persistConsent(prefs: ConsentInput): Promise<ActionResult> {
  try {
    const user = await getCurrentDbUser()
    if (!user) return { ok: true } // anonymous — localStorage only
    await prisma.user.update({
      where: { id: user.id },
      data: {
        cookieConsent: {
          analytics: !!prefs.analytics,
          errorMonitoring: !!prefs.errorMonitoring,
          version: String(prefs.version ?? ''),
          decidedAt: String(prefs.decidedAt ?? ''),
        },
      },
    })
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save preferences.'
    return { ok: false, error: message }
  }
}
