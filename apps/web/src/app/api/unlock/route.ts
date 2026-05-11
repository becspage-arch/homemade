import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const password = formData.get('password')
  const expected = process.env.SPLASH_PASSWORD

  if (!expected) {
    // If no password is configured, fail closed.
    return NextResponse.redirect(new URL('/unlock?error=1', req.url))
  }

  if (typeof password === 'string' && password === expected) {
    const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.set('homemade-access', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(new URL('/unlock?error=1', req.url))
}
