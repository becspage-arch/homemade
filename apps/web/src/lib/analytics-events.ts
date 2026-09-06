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
  | 'pattern_saved'
  | 'pattern_unsaved'
  | 'recipe_saved'
  | 'recipe_unsaved'
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
  // Maker photos — one photo model across tutorials, recipes and every
  // pattern craft. `maker_photo_approved` / `_rejected` carry `decidedBy`
  // ('gate' | 'appeal') so the AI gate and the appeal override separate in
  // the funnel.
  | 'maker_photo_uploaded'
  | 'maker_photo_approved'
  | 'maker_photo_rejected'
  | 'maker_photo_appealed'
  | 'maker_photo_removed'
  | 'photo_promotion_opted_in'
  | 'photo_promotion_opted_out'
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
  | 'did_you_make_this_shown'
  | 'did_you_make_this_confirmed'
  | 'did_you_make_this_dismissed'
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
  // Feature adoption (cross-product reach)
  | 'feature_used'
  | 'studio_opened'
  | 'studio_pattern_rendered'
  | 'studio_exported'
  // Revenue / subscription (Stripe — live)
  | 'premium_page_viewed'
  | 'premium_plan_selected'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'subscription_started'
  | 'subscription_renewed'
  | 'subscription_payment_failed'
  | 'subscription_dunning_recovered'
  | 'subscription_cancellation_scheduled'
  | 'subscription_cancelled'
  | 'subscription_reactivated'
  | 'subscription_plan_changed'
  | 'subscription_refunded'
  | 'billing_portal_opened'
  | 'guarantee_refund_claimed'
  // Conversion gates (every premium gate, any product area)
  | 'premium_gate_viewed'
  | 'premium_gate_cta_clicked'
  | 'upgrade_cta_clicked'
  // Creator economy — money (mostly catalogued ahead of the surface)
  | 'gift_sent'
  | 'gift_received'
  | 'creator_earning_accrued'
  | 'affiliate_link_clicked'
  | 'affiliate_commission_earned'
  | 'credit_earned'
  | 'credit_redeemed'
  | 'payout_requested'
  | 'payout_completed'
  | 'creator_fund_allocated'
  // Referral / virality (catalogued ahead of the surface)
  | 'invite_sent'
  | 'invite_accepted'
  | 'creator_earnings_shared'
  // Recipe authoring + scaling
  | 'ingredients_scaled'
  | 'ingredient_created_inline'
  // Recipe creator economy (UserRecipe)
  | 'user_recipe_draft_saved'
  | 'user_recipe_submitted'
  | 'user_recipe_approved'
  | 'user_recipe_rejected'
  | 'user_recipe_deleted'
  | 'user_recipe_visibility_changed'
  | 'recipe_added_to_meal_plan'
  | 'recipe_added_to_shopping_list'
  // Acquisition
  | 'acquisition_captured'
  // Sewing personalisation funnel (S-5e)
  | 'sewing_design_picked'
  | 'sewing_measurements_edited'
  | 'sewing_options_changed'
  | 'sewing_personalisation_started'
  | 'sewing_personalisation_completed'
  | 'sewing_personalisation_failed'
  | 'sewing_personalisation_saved_to_project'
  | 'sewing_download_print'
  | 'sewing_download_projector'
  | 'sewing_download_browse'
  | 'sewing_signin_cta_shown'
  | 'sewing_signin_cta_clicked'
  | 'sewing_premium_gate_encountered'
  | 'sewing_premium_gate_cta_shown'
  // Sewing visual hack composer (S-6)
  | 'sewing_hack_composer_opened'
  | 'sewing_hack_operation_applied'
  | 'sewing_hack_saved'
  | 'sewing_hack_loaded_from_saved'
  | 'sewing_hack_premium_gate_encountered'

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
  pattern_saved: 'engagement',
  pattern_unsaved: 'engagement',
  recipe_saved: 'engagement',
  recipe_unsaved: 'engagement',
  tutorial_scroll_depth: 'engagement',
  tutorial_shared: 'engagement',
  ingredients_scaled: 'engagement',
  ingredient_created_inline: 'engagement',
  feature_used: 'engagement',
  studio_opened: 'engagement',
  studio_pattern_rendered: 'engagement',
  studio_exported: 'engagement',
  premium_page_viewed: 'revenue',
  premium_plan_selected: 'revenue',
  checkout_started: 'revenue',
  checkout_completed: 'revenue',
  checkout_abandoned: 'revenue',
  subscription_started: 'revenue',
  subscription_renewed: 'revenue',
  subscription_payment_failed: 'revenue',
  subscription_dunning_recovered: 'revenue',
  subscription_cancellation_scheduled: 'revenue',
  subscription_cancelled: 'revenue',
  subscription_reactivated: 'revenue',
  subscription_plan_changed: 'revenue',
  subscription_refunded: 'revenue',
  billing_portal_opened: 'revenue',
  guarantee_refund_claimed: 'revenue',
  premium_gate_viewed: 'conversion',
  premium_gate_cta_clicked: 'conversion',
  upgrade_cta_clicked: 'conversion',
  gift_sent: 'creator_economy',
  gift_received: 'creator_economy',
  creator_earning_accrued: 'creator_economy',
  affiliate_link_clicked: 'creator_economy',
  affiliate_commission_earned: 'creator_economy',
  credit_earned: 'creator_economy',
  credit_redeemed: 'creator_economy',
  payout_requested: 'creator_economy',
  payout_completed: 'creator_economy',
  creator_fund_allocated: 'creator_economy',
  invite_sent: 'referral',
  invite_accepted: 'referral',
  creator_earnings_shared: 'referral',
  user_recipe_draft_saved: 'content',
  user_recipe_submitted: 'content',
  user_recipe_approved: 'content',
  user_recipe_rejected: 'content',
  user_recipe_deleted: 'content',
  user_recipe_visibility_changed: 'content',
  recipe_added_to_meal_plan: 'engagement',
  recipe_added_to_shopping_list: 'engagement',
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
  did_you_make_this_shown: 'maker',
  did_you_make_this_confirmed: 'maker',
  did_you_make_this_dismissed: 'maker',
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
  maker_photo_uploaded: 'engagement',
  maker_photo_approved: 'engagement',
  maker_photo_rejected: 'engagement',
  maker_photo_appealed: 'engagement',
  maker_photo_removed: 'engagement',
  photo_promotion_opted_in: 'account',
  photo_promotion_opted_out: 'account',
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
  sewing_design_picked: 'engagement',
  sewing_measurements_edited: 'engagement',
  sewing_options_changed: 'engagement',
  sewing_personalisation_started: 'engagement',
  sewing_personalisation_completed: 'engagement',
  sewing_personalisation_failed: 'friction',
  sewing_personalisation_saved_to_project: 'engagement',
  sewing_download_print: 'engagement',
  sewing_download_projector: 'engagement',
  sewing_download_browse: 'engagement',
  sewing_signin_cta_shown: 'activation',
  sewing_signin_cta_clicked: 'activation',
  sewing_premium_gate_encountered: 'engagement',
  sewing_premium_gate_cta_shown: 'engagement',
  sewing_hack_composer_opened: 'engagement',
  sewing_hack_operation_applied: 'engagement',
  sewing_hack_saved: 'engagement',
  sewing_hack_loaded_from_saved: 'engagement',
  sewing_hack_premium_gate_encountered: 'engagement',
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
