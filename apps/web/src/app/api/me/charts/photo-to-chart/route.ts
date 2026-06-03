import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * Photo-to-chart generator endpoint — currently a stub. The real
 * implementation (image upload → palette quantisation → DMC / Anchor
 * snap → CrossStitchChart definition) ships in a follow-up worker.
 *
 * Phase location_climate_paper_001 — Part 5 stub.
 *
 * Ships free when the real generator lands; gated later via config
 * flag only, no UI gating logic in the renderer or admin.
 *
 * Sign-in required: the photo upload + generation costs real compute,
 * and an unauthenticated path would be an obvious abuse surface.
 */
export async function POST(_req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  return NextResponse.json(
    {
      stub: true,
      message:
        'Photo-to-chart generator is not wired yet. The endpoint is reserved so the UI can be built against a real path.',
    },
    { status: 501 },
  )
}
