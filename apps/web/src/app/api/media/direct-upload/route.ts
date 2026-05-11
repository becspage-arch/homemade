import { NextResponse } from 'next/server'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { createDirectUpload } from '@/lib/cloudflare-images'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
  }

  try {
    const { id, uploadURL } = await createDirectUpload()
    return NextResponse.json({ id, uploadURL })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
