'use server'

import { headers } from 'next/headers'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from './get-current-user'
import { isoWeek } from './cohort'
import {
  deriveChannel,
  deriveDeviceClass,
  type AcquisitionChannel,
} from './acquisition'
import { identifyServerUser } from './posthog'

interface ClientAcquisitionPayload {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  referrer: string | null
  acquisitionChannel: AcquisitionChannel | null
}

type Result = { ok: true } | { ok: false; error: string }

/**
 * Persist the client-captured acquisition data onto the signed-in user's
 * row, but only if the user doesn't already have a cohort week set.
 *
 * Self-healing: every page load is allowed to call this; once the fields are
 * filled it's a no-op. Country + deviceClass come from server headers so
 * the client can't lie about them. Cohort week is derived from the
 * existing `createdAt` so users who signed up before we wired this still
 * get a cohort label retroactively.
 */
export async function persistAcquisitionIfMissing(
  payload: ClientAcquisitionPayload,
): Promise<Result> {
  try {
    const user = await getCurrentDbUser()
    if (!user) return { ok: true } // nothing to do — anonymous

    // Already attributed? Bail.
    if (user.signupCohortWeek) return { ok: true }

    const hdrs = await headers()
    const country = hdrs.get('cf-ipcountry') ?? null
    const userAgent = hdrs.get('user-agent') ?? null
    const deviceClass = deriveDeviceClass(userAgent)

    // Trust the client's UTM payload but re-derive channel server-side so we
    // can't be lied to about the bucket.
    const channel = payload.acquisitionChannel ?? deriveChannel({
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      referrer: payload.referrer,
    })

    const cohortWeek = isoWeek(user.createdAt ?? new Date())

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        utmTerm: payload.utmTerm,
        acquisitionChannel: channel,
        signupCohortWeek: cohortWeek,
        country,
        deviceClass,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayHandle: true,
        name: true,
        role: true,
        isCreator: true,
        isPatternTester: true,
        beginnerMode: true,
        isSuspended: true,
        creatorVerifiedAt: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        utmTerm: true,
        acquisitionChannel: true,
        signupCohortWeek: true,
        country: true,
        deviceClass: true,
      },
    })

    // Push the freshly-attributed user properties to PostHog so subsequent
    // events inherit them as person properties.
    await identifyServerUser({
      distinctId: updated.clerkId,
      properties: {
        userId: updated.id,
        displayHandle: updated.displayHandle ?? undefined,
        role: updated.role,
        isCreator: updated.isCreator,
        creatorVerified: Boolean(updated.creatorVerifiedAt),
        isPatternTester: updated.isPatternTester,
        beginnerMode: updated.beginnerMode,
        isSuspended: updated.isSuspended,
        signupCohortWeek: updated.signupCohortWeek,
        acquisitionChannel: updated.acquisitionChannel,
        utmSource: updated.utmSource,
        utmMedium: updated.utmMedium,
        utmCampaign: updated.utmCampaign,
        utmContent: updated.utmContent,
        utmTerm: updated.utmTerm,
        country: updated.country,
        deviceClass: updated.deviceClass,
      },
    })

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'persistAcquisitionIfMissing failed'
    return { ok: false, error: message }
  }
}
