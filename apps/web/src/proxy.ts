import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
]

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAccountRoute = createRouteMatcher(['/me(.*)'])

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
    return NextResponse.next()
  }

  // Splash gate — global until launch. Flip SPLASH_GATE=open in the ECS
  // task definition env vars (or unset SPLASH_PASSWORD entirely) to take
  // the gate down without a code deploy. Anything other than `open` keeps
  // the cookie check in place. Default behaviour stays closed so a missing
  // env var never accidentally exposes the site.
  if (process.env.SPLASH_GATE !== 'open') {
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

  return NextResponse.next()
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
