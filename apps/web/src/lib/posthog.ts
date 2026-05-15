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
  // Engagement
  | 'tutorial_viewed'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'tutorial_bookmarked'
  | 'tutorial_unbookmarked'
  | 'tutorial_published_scheduled'
  | 'search_query'
  // Account lifecycle
  | 'signup_completed'
  | 'signin_completed'
  // First-* milestones
  | 'first_bookmark'
  | 'first_project_started'
  | 'first_project_completed'
  | 'first_review_submitted'
  | 'first_photo_uploaded'
  // Moderation outcomes
  | 'review_submitted'
  | 'review_published'
  | 'photo_uploaded'
  | 'photo_approved'
  | 'photo_rejected'
  | 'question_asked'
  | 'question_answered'
  | 'errata_submitted'
  // Project lifecycle (server side)
  | 'project_abandoned'
  | 'project_progress_updated'
  | 'project_notes_updated'
  | 'project_supplies_checked'
  | 'beginner_mode_toggled'
  // Creator program
  | 'creator_application_submitted'
  | 'creator_application_approved'
  | 'creator_application_rejected'
  | 'creator_status_revoked'
  | 'creator_tutorial_drafted'
  | 'creator_tutorial_submitted_for_review'
  | 'creator_tutorial_approved'
  | 'creator_tutorial_returned_for_edits'
  | 'creator_first_publish'
  | 'creator_profile_viewed'
  // Pattern testing
  | 'pattern_test_created'
  | 'pattern_test_recruiting_opened'
  | 'pattern_test_completed'
  | 'pattern_test_application_submitted'
  | 'pattern_test_application_accepted'
  | 'pattern_test_application_rejected'
  | 'pattern_test_started'
  | 'pattern_test_withdrawn'
  | 'pattern_test_feedback_submitted'
  // Account-rights lifecycle
  | 'account_data_export_requested'
  | 'account_deletion_scheduled'
  | 'account_deletion_cancelled'
  | 'account_deletion_completed'
  // Friction / errors
  | 'rate_limit_hit'
  | 'nsfw_auto_rejected'
  // Pre-launch signup allowlist
  | 'signup_rejected_not_allowlisted'
  | 'signup_allowlist_email_added'
  | 'signup_allowlist_email_removed'
  // Recipe authoring + scaling
  | 'ingredients_scaled'
  | 'ingredient_created_inline'
  // Phase 8 Homepage rebuild — onboarding
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'

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
