import 'server-only'
import type { User } from '@homemade/db'
import { identifyServerUser } from './posthog'

/**
 * Push the canonical user-property bundle to PostHog. Called from the
 * `/me` and `/admin` layouts so an authenticated session always has fresh
 * person properties on PostHog — important for cohort retention queries
 * which slice on `signupCohortWeek` / `acquisitionChannel` / `role` etc.
 *
 * Fire-and-forget. Failures are swallowed by `identifyServerUser`.
 */
export async function identifyCurrentUser(user: User | null): Promise<void> {
  if (!user) return
  await identifyServerUser({
    distinctId: user.clerkId,
    properties: {
      userId: user.id,
      displayHandle: user.displayHandle ?? undefined,
      role: user.role,
      isCreator: user.isCreator,
      creatorVerified: Boolean(user.creatorVerifiedAt),
      isPatternTester: user.isPatternTester,
      isSuspended: user.isSuspended,
      beginnerMode: user.beginnerMode,
      signupCohortWeek: user.signupCohortWeek ?? undefined,
      acquisitionChannel: user.acquisitionChannel ?? undefined,
      utmSource: user.utmSource ?? undefined,
      utmMedium: user.utmMedium ?? undefined,
      utmCampaign: user.utmCampaign ?? undefined,
      utmContent: user.utmContent ?? undefined,
      utmTerm: user.utmTerm ?? undefined,
      country: user.country ?? undefined,
      deviceClass: user.deviceClass ?? undefined,
    },
  })
}
