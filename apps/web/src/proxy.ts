import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/coming-soon', '/unlock', '/api/unlock', '/favicon.ico', '/healthz']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths and Next internals
  if (
    pathname.startsWith('/_next') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next()
  }

  // Check the access cookie
  const cookie = req.cookies.get('homemade-access')
  if (cookie?.value === '1') {
    return NextResponse.next()
  }

  // Otherwise rewrite to coming soon (URL stays as-is, content is the splash)
  const url = req.nextUrl.clone()
  url.pathname = '/coming-soon'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
