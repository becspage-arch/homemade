import 'server-only'
import { PostHog } from 'posthog-node'
import { headers } from 'next/headers'
import { prisma } from '@homemade/db'
import * as Sentry from '@sentry/nextjs'
import { categoryFor, type PosthogEvent } from './analytics-events'
import { getOrCreateSessionId } from './analytics-session'
import { deriveDeviceClass } from './acquisition'

export type { PosthogEvent }

let client: PostHog | null = null

function getPostHog(): PostHog | null {
  if (client) return client
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
  if (!key) return null
  client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
  return client
}

/**
 * Server-side dual-fire: writes the event to our `AnalyticsEvent` table
 * AND mirrors it to PostHog. Existing call sites get dual-fire for free
 * via the legacy `captureServerEvent` shape, which is preserved.
 *
 * Failures on either sink never block the caller — both writes are
 * wrapped in try/catch and surfaced to Sentry on failure.
 */
async function dualFireToDb(args: {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
}): Promise<void> {
  // Pull request-scoped context where available. Inngest steps / cron jobs
  // have no `headers()` — we tolerate the throw and write a minimal row.
  let url: string | null = null
  let referrer: string | null = null
  let userAgent: string | null = null
  let country: string | null = null
  let pathname: string | null = null
  let sessionId = 'server'

  try {
    const h = await headers()
    url = h.get('x-url') ?? h.get('referer') ?? null
    referrer = h.get('referer')
    userAgent = h.get('user-agent')
    country = h.get('cf-ipcountry')
  } catch {
    // No request scope — leave the request fields null.
  }
  if (url) {
    try {
      pathname = new URL(url).pathname
    } catch {
      pathname = url.startsWith('/') ? url : null
    }
  }
  try {
    sessionId = await getOrCreateSessionId()
  } catch {
    // No request scope — use the synthetic `server` session.
  }

  // Look up cohort / channel from the User row (the source of truth)
  // when distinctId looks like a Clerk id. Cheap — distinct on indexed col.
  let clerkUserId: string | null = null
  let cohortWeek: string | null = null
  let acquisitionChannel: string | null = null
  let utmSource: string | null = null
  let utmMedium: string | null = null
  let utmCampaign: string | null = null
  if (args.distinctId && args.distinctId.startsWith('user_')) {
    clerkUserId = args.distinctId
    try {
      const u = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          signupCohortWeek: true,
          acquisitionChannel: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
        },
      })
      if (u) {
        cohortWeek = u.signupCohortWeek
        acquisitionChannel = u.acquisitionChannel
        utmSource = u.utmSource
        utmMedium = u.utmMedium
        utmCampaign = u.utmCampaign
      }
    } catch {
      // Ignore — the row still lands, just without the denormalised fields.
    }
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        clerkUserId,
        sessionId,
        event: args.event,
        category: categoryFor(args.event),
        properties: (args.properties ?? null) as never,
        url,
        pathname,
        referrer,
        userAgent,
        country,
        deviceClass: deriveDeviceClass(userAgent),
        cohortWeek,
        acquisitionChannel,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    })
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'analytics', sink: 'db' } })
  }
}

/**
 * Capture a server-side analytics event. Dual-fires to both `AnalyticsEvent`
 * (our own admin dashboards) and PostHog (recordings + heatmaps + ad-hoc).
 * Fire-and-forget. Failures must never break the user's action.
 *
 * `distinctId` should be the Clerk id when known; otherwise a stable
 * anonymous id (e.g. session token / hashed ip). The DB sink derives
 * `clerkUserId` from `distinctId` when it has the Clerk shape.
 */
export async function captureServerEvent(args: {
  event: PosthogEvent
  distinctId: string
  properties?: Record<string, unknown>
}): Promise<void> {
  // DB sink first — it's the canonical store; we never want a PostHog
  // hiccup to silently drop the row from the admin dashboards.
  await dualFireToDb(args)
  const ph = getPostHog()
  if (!ph) return
  try {
    ph.capture({
      distinctId: args.distinctId,
      event: args.event,
      properties: args.properties,
    })
  } catch {
    // swallow — analytics must never break the request path
  }
}

/**
 * Capture a *premium-only* analytics event. Skips PostHog entirely and
 * writes only to `AnalyticsEvent` — used for premium-feature instrumentation
 * (mindset plan generator, personalised content) so paying-user behaviour
 * doesn't leak to third-party tools.
 */
export async function capturePremiumServerEvent(args: {
  event: PosthogEvent
  distinctId: string
  properties?: Record<string, unknown>
}): Promise<void> {
  await dualFireToDb({
    ...args,
    properties: { ...(args.properties ?? {}), premium: true },
  })
}

/**
 * Identify a user with PostHog. Call on signup + first signin so the
 * existing anonymous events get stitched into the identified profile.
 */
export async function identifyServerUser(args: {
  distinctId: string
  properties: Record<string, unknown>
}): Promise<void> {
  const ph = getPostHog()
  if (!ph) return
  try {
    ph.identify({ distinctId: args.distinctId, properties: args.properties })
  } catch {
    // swallow
  }
}

/**
 * Flush pending PostHog events. Next's serverless model can tear down the
 * process between requests, so we flush after every fire-and-forget call
 * rather than relying on the background interval.
 */
export async function flushPostHog(): Promise<void> {
  if (!client) return
  try {
    await client.flush()
  } catch {
    // swallow
  }
}
