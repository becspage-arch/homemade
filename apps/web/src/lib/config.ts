/**
 * Feature flags and site-wide configuration.
 *
 * This file is imported both server-side and client-side (for flags that
 * need to reach the browser). Keep constants only -- no server-only imports.
 */

/**
 * USER_SUBMISSION_ENABLED — when false the UserPhotoSubmissionPanel renders
 * null and the /api/user-pattern-photos route returns 503. Flip to true once
 * legal terms are live and the admin moderation queue is staffed.
 */
export const USER_SUBMISSION_ENABLED = false
