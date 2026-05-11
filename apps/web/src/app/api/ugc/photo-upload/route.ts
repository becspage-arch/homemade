import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/auth'
import { createDirectUpload } from '@/lib/cloudflare-images'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * One-time Cloudflare direct-upload URL for a UGC photo. Mirrors the admin
 * `/api/media/direct-upload` endpoint but is open to any signed-in,
 * non-suspended member — admin gate dropped.
 */
export async function POST() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (user.isSuspended) {
    return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 })
  }

  try {
    const { id, uploadURL } = await createDirectUpload()
    return NextResponse.json({ id, uploadURL })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
