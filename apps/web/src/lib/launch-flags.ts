/**
 * Launch-sequence flags.
 *
 * These drive the Stripe go-live sequence (see project_pre_launch_checklist):
 * the public site is made real enough for Stripe to verify the business while
 * premium can't leak and no one can create an account.
 *
 * Pure constants only — this module is imported by the edge middleware
 * (`proxy.ts`), `robots.ts`, and the SEO metadata helper, so it must stay free
 * of server-only / Node imports.
 *
 * TODO(launch): on real launch day —
 *   1. set SITE_NOINDEX = false (lets Google index the site)
 *   2. flip SIGNUP_ALLOWLIST_ENABLED = false in lib/signup-allowlist.ts and
 *      restore the live <SignUp /> form in app/sign-up/[[...sign-up]]/page.tsx
 *   3. leave SPLASH_GATE_OPEN = true (it already is)
 * Tracked in project_pre_launch_checklist.md.
 */

/**
 * When true the splash gate is DOWN: the proxy stops rewriting visitors to
 * /coming-soon and the real public site is reachable. Set in code (not just the
 * SPLASH_GATE env var) so verification doesn't depend on an ECS env flip.
 * To re-close the gate pre-launch, set this to false.
 */
export const SPLASH_GATE_OPEN = true

/**
 * When true the whole site is held out of search indexes (X-Robots-Tag header
 * on every response, noindex in page metadata, and a blanket robots.txt
 * disallow). Keeps a half-built pre-launch site from being crawled.
 *
 * FLIPPED to false at go-live (2026-06-23): the public site (the signed-off
 * categories that are isPublicVisible) is now crawlable. robots.txt switches
 * to its allow/deny list and the noindex header + page meta drop. Hidden
 * categories 404 to the public, so they stay out of the index regardless.
 */
export const SITE_NOINDEX = false
