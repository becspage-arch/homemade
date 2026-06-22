import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { SITE_NOINDEX, SPLASH_GATE_OPEN } from '@/lib/launch-flags'

/**
 * Two gates layered:
 *   1. Splash gate — anyone hitting the site needs the homemade-access cookie
 *      to see anything beyond /coming-soon. Cookie is set by /api/unlock.
 *   2. Clerk auth — /admin requires a signed-in Clerk user.
 *
 * The splash gate is intentionally simple and global so random visitors can't
 * see anything pre-launch. Clerk auth is layered on top, only for /admin.
 */

const PUBLIC_PATHS = [
  '/coming-soon',
  '/unlock',
  '/api/unlock',
  '/favicon.ico',
  '/healthz',
  // Legal pages must stay reachable without the splash cookie even if the gate
  // is re-closed — Stripe + regulators + journalists check terms / refund /
  // contact. (Launch-sequence requirement, project_pre_launch_checklist.)
  '/legal',
  // The /premium page is the public description of what we sell; Stripe checks
  // it during business verification. Informational only, no checkout.
  '/premium',
  // Sentry tunnels client error reports through /monitoring/sentry to dodge
  // ad-blockers — must bypass the splash gate or anonymous browsers can't report.
  '/monitoring/sentry',
  // Inngest serve endpoint — Inngest Cloud syncs functions + delivers job
  // runs by POST'ing here, so it can't be behind the splash cookie.
  '/api/inngest',
  // Clerk's hosted flows + webhook receiver must work even before unlock,
  // otherwise admins can't sign in if they hit /admin first.
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
  // Stripe posts subscription/payment events here; it can't carry the splash
  // cookie, so it must bypass the gate. Signature-verified in the handler.
  '/api/webhooks/stripe',
]

// Permanent (301) tutorial-path redirects for content that moved between
// categories. Seeded when the cross-stitch category was promoted out of
// needlework (2026-06-03). Keys must be lower-case, with no trailing slash,
// matching the path *after* the canonical-URL hygiene step below has run.
// Extend this map whenever a tutorial moves categoryId — old SEO juice
// stays attached to the canonical URL via the 301.
const TUTORIAL_REDIRECTS: Record<string, string> = {
  '/needlework/cross-stitch-alphabet-sampler-border':
    '/cross-stitch/cross-stitch-alphabet-sampler-border',
  '/needlework/start-and-end-a-thread-cleanly':
    '/cross-stitch/start-and-end-a-thread-cleanly',
  '/needlework/how-to-cross-stitch': '/cross-stitch/how-to-cross-stitch',
}

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAccountRoute = createRouteMatcher(['/me(.*)'])

/**
 * Build a pass-through response, stamping a site-wide noindex header while the
 * pre-launch site is held out of search (SITE_NOINDEX). This belt-and-braces
 * sits alongside the page-level robots metadata + the robots.txt disallow.
 * TODO(launch): flip SITE_NOINDEX = false in lib/launch-flags.ts to drop it.
 */
function pass(): NextResponse {
  const res = NextResponse.next()
  if (SITE_NOINDEX) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return res
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Canonical URL hygiene — applies to any GET that isn't a Next internal or
  // a known infra path. Strips trailing slashes and lower-cases the path so
  // /Cooking/Sourdough/ and /cooking/sourdough resolve to one canonical URL.
  // Skips POST / PUT / etc. so form posts aren't redirected away from their
  // handlers, and skips API + monitoring routes which need to retain casing.
  if (
    req.method === 'GET' &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/monitoring/')
  ) {
    const lowered = pathname.toLowerCase()
    const stripped = lowered.length > 1 ? lowered.replace(/\/+$/, '') : lowered
    if (stripped !== pathname) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = stripped
      return NextResponse.redirect(redirectUrl, 308)
    }

    // Permanent (301) path-level redirects for tutorials that moved between
    // categories. Runs *after* canonical-URL hygiene so the lookup key is
    // already lower-cased and trimmed.
    const newPath = TUTORIAL_REDIRECTS[stripped]
    if (newPath) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = newPath
      return NextResponse.redirect(redirectUrl, 301)
    }
  }

  // Always allow Next internals + public splash paths
  if (
    pathname.startsWith('/_next') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    // Admin / account routes still need Clerk protection even if "public" from the splash view
    if (isAdminRoute(req) || isAccountRoute(req)) {
      await auth.protect()
    }
    return pass()
  }

  // Splash gate. DOWN as of the Stripe go-live sequence (SPLASH_GATE_OPEN in
  // lib/launch-flags) so the real public site is reachable for verification.
  // Signups stay closed (SIGNUP_ALLOWLIST_ENABLED, server-enforced) and the
  // site is held out of search (SITE_NOINDEX) until real launch. When the flag
  // is false the gate falls back to the old cookie check, which the
  // SPLASH_GATE=open env var can still lift without a deploy. Default stays
  // closed so a missing env var never accidentally exposes the site.
  if (!SPLASH_GATE_OPEN && process.env.SPLASH_GATE !== 'open') {
    const accessCookie = req.cookies.get('homemade-access')
    if (accessCookie?.value !== '1') {
      const url = req.nextUrl.clone()
      url.pathname = '/coming-soon'
      return NextResponse.rewrite(url)
    }
  }

  // Auth gates (Clerk)
  if (isAdminRoute(req) || isAccountRoute(req)) {
    await auth.protect()
  }

  return pass()
})

export const config = {
  // Run on every path except Next.js internals and actual static assets.
  //
  // The previous regex `.*\.[a-zA-Z]+$` excluded ANY path ending in a dot-
  // extension, which also swallowed bot probes like `/wp-admin.php`, `/.env`,
  // and `/sitemap.xml.html`. Those still hit the dynamic `[categorySlug]`
  // route (which calls `getCurrentDbUser()`), but with no clerkMiddleware
  // context, so `auth()` throws. We now allowlist the real static-asset
  // extensions only — anything else, including bot-shaped URLs, runs
  // through clerkMiddleware and the splash gate as normal.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|otf|wasm|txt|xml|json)$).*)',
    '/(api|trpc)(.*)',
  ],
}
