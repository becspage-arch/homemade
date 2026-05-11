import { NextResponse, type NextRequest } from 'next/server'

/**
 * Behind ALB + Cloudflare, req.url / req.nextUrl reflect the internal
 * container host (0.0.0.0:3000). Build the public origin from the
 * forwarded headers so redirects land on homemade.education.
 */
function getPublicOrigin(req: NextRequest): string {
  // In production we're always behind Cloudflare, which terminates HTTPS for the
  // user. ALB then forwards over HTTP and rewrites x-forwarded-proto to http,
  // so we can't trust that header here. Force https in production.
  const proto =
    process.env.NODE_ENV === 'production'
      ? 'https'
      : (req.headers.get('x-forwarded-proto') ?? 'http')
  const host =
    req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host
  return `${proto}://${host}`
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const password = formData.get('password')
  const expected = process.env.SPLASH_PASSWORD
  const origin = getPublicOrigin(req)

  if (expected && typeof password === 'string' && password === expected) {
    // 303 makes browsers do a GET on the redirect (correct for POST → page).
    const response = NextResponse.redirect(`${origin}/`, 303)
    response.cookies.set('homemade-access', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(`${origin}/unlock?error=1`, 303)
}
