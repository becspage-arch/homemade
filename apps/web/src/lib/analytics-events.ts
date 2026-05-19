/**
 * Pure data describing the analytics event taxonomy.
 *
 * Lives in its own leaf module so `lib/posthog.ts` (the PostHog client
 * wrapper) and `lib/server-analytics.ts` (the dual-fire entrypoint) can
 * both import without a cycle.
 */

export type PosthogEvent =
  // Engagement
  | 'tutorial_viewed'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'tutorial_bookmarked'
  | 'tutorial_unbookmarked'
  | 'tutorial_published_scheduled'
  | 'tutorial_shared'
  | 'tutorial_scroll_depth'
  | 'search_query'
  | 'search_result_clicked'
  // Account lifecycle
  | 'signup_completed'
  | 'signin_completed'
  | 'signout_completed'
  // Onboarding (Phase 8 homepage)
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
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
  // Maker profile (Session A)
  | 'maker_profile_viewed'
  | 'maker_profile_made_public'
  | 'maker_profile_made_private'
  | 'made_it_published'
  | 'made_it_unpublished'
  | 'make_it_made_public'
  | 'make_it_made_private'
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
  | 'account_data_export_downloaded'
  | 'account_deletion_scheduled'
  | 'account_deletion_cancelled'
  | 'account_deletion_completed'
  // Cookie consent
  | 'consent_banner_shown'
  | 'consent_accepted_all'
  | 'consent_necessary_only'
  | 'consent_customized'
  | 'consent_preferences_changed'
  // Friction / errors
  | 'rate_limit_hit'
  | 'nsfw_auto_rejected'
  | 'error_boundary_triggered'
  | 'form_abandoned'
  // Pre-launch signup allowlist
  | 'signup_rejected_not_allowlisted'
  | 'signup_allowlist_email_added'
  | 'signup_allowlist_email_removed'
  // Recipe authoring + scaling
  | 'ingredients_scaled'
  | 'ingredient_created_inline'
  // Acquisition
  | 'acquisition_captured'

const EVENT_CATEGORIES: Record<string, string> = {
  acquisition_captured: 'acquisition',
  pageview: 'acquisition',
  signup_completed: 'activation',
  signin_completed: 'activation',
  signout_completed: 'activation',
  onboarding_started: 'activation',
  onboarding_completed: 'activation',
  onboarding_skipped: 'activation',
  first_bookmark: 'activation',
  first_project_started: 'activation',
  first_project_completed: 'activation',
  first_review_submitted: 'activation',
  first_photo_uploaded: 'activation',
  tutorial_viewed: 'engagement',
  tutorial_started: 'engagement',
  tutorial_completed: 'engagement',
  tutorial_bookmarked: 'engagement',
  tutorial_unbookmarked: 'engagement',
  tutorial_scroll_depth: 'engagement',
  tutorial_shared: 'engagement',
  ingredients_scaled: 'engagement',
  ingredient_created_inline: 'engagement',
  search_query: 'search',
  search_result_clicked: 'search',
  tutorial_published_scheduled: 'content',
  creator_application_submitted: 'creator',
  creator_application_approved: 'creator',
  creator_application_rejected: 'creator',
  creator_status_revoked: 'creator',
  creator_tutorial_drafted: 'creator',
  creator_tutorial_submitted_for_review: 'creator',
  creator_tutorial_approved: 'creator',
  creator_tutorial_returned_for_edits: 'creator',
  creator_first_publish: 'creator',
  creator_profile_viewed: 'creator',
  maker_profile_viewed: 'maker',
  maker_profile_made_public: 'maker',
  maker_profile_made_private: 'maker',
  made_it_published: 'maker',
  made_it_unpublished: 'maker',
  make_it_made_public: 'maker',
  make_it_made_private: 'maker',
  pattern_test_created: 'creator',
  pattern_test_recruiting_opened: 'creator',
  pattern_test_completed: 'creator',
  pattern_test_application_submitted: 'creator',
  pattern_test_application_accepted: 'creator',
  pattern_test_application_rejected: 'creator',
  pattern_test_started: 'creator',
  pattern_test_withdrawn: 'creator',
  pattern_test_feedback_submitted: 'creator',
  review_submitted: 'engagement',
  review_published: 'engagement',
  photo_uploaded: 'engagement',
  photo_approved: 'engagement',
  photo_rejected: 'engagement',
  question_asked: 'engagement',
  question_answered: 'engagement',
  errata_submitted: 'engagement',
  project_abandoned: 'engagement',
  project_progress_updated: 'engagement',
  project_notes_updated: 'engagement',
  project_supplies_checked: 'engagement',
  beginner_mode_toggled: 'account',
  account_data_export_requested: 'account',
  account_data_export_downloaded: 'account',
  account_deletion_scheduled: 'account',
  account_deletion_cancelled: 'account',
  account_deletion_completed: 'account',
  consent_banner_shown: 'account',
  consent_accepted_all: 'account',
  consent_necessary_only: 'account',
  consent_customized: 'account',
  consent_preferences_changed: 'account',
  rate_limit_hit: 'friction',
  nsfw_auto_rejected: 'friction',
  error_boundary_triggered: 'friction',
  form_abandoned: 'friction',
  signup_rejected_not_allowlisted: 'friction',
  signup_allowlist_email_added: 'account',
  signup_allowlist_email_removed: 'account',
}

export function categoryFor(event: string): string {
  return EVENT_CATEGORIES[event] ?? 'other'
}

/**
 * Canonical sentinel used in `AnalyticsDailyRollup.dimension` for the
 * unsplit-total row. Postgres treats null as distinct in unique indexes
 * so using an explicit sentinel keeps `prisma.upsert` honest.
 */
export const ROLLUP_TOTAL_DIMENSION = '__total__'
