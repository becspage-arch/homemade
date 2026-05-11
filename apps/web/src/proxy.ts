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
  // Clerk's hosted flows + webhook receiver must work even before unlock,
  // otherwise admins can't sign in if they hit /admin first.
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
]

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Always allow Next internals + public splash paths
  if (
    pathname.startsWith('/_next') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    // Admin routes still need Clerk protection even if "public" from the splash view
    if (isAdminRoute(req)) {
      await auth.protect()
    }
    return NextResponse.next()
  }

  // Splash gate
  const accessCookie = req.cookies.get('homemade-access')
  if (accessCookie?.value !== '1') {
    const url = req.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.rewrite(url)
  }

  // Admin gate (Clerk)
  if (isAdminRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  // Run on every path except Next.js asset paths.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z]+$).*)',
    '/(api|trpc)(.*)',
  ],
}
