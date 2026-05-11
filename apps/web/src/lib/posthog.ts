import 'server-only'
import { PostHog } from 'posthog-node'

let client: PostHog | null = null

function getPostHog(): PostHog | null {
  if (client) return client
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
  if (!key) return null
  client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
  return client
}

export type PosthogEvent =
  | 'tutorial_viewed'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'tutorial_bookmarked'
  | 'tutorial_unbookmarked'
  | 'tutorial_published_scheduled'
  | 'search_query'
  | 'signup_completed'
  | 'signin_completed'
  | 'review_submitted'
  | 'review_published'
  | 'photo_uploaded'
  | 'photo_approved'
  | 'photo_rejected'
  | 'question_asked'
  | 'question_answered'
  | 'errata_submitted'

/**
 * Capture a server-side analytics event. Fire-and-forget: failures must
 * never break the user's action. `distinctId` should be the Prisma User id
 * when known, otherwise a stable anonymous id (e.g. Clerk id or hashed ip).
 */
export async function captureServerEvent(args: {
  event: PosthogEvent
  distinctId: string
  properties?: Record<string, unknown>
}): Promise<void> {
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
 * Flush pending events. Next's serverless model can tear down the process
 * between requests, so we flush after every fire-and-forget call rather
 * than relying on the background interval.
 */
export async function flushPostHog(): Promise<void> {
  if (!client) return
  try {
    await client.flush()
  } catch {
    // swallow
  }
}
