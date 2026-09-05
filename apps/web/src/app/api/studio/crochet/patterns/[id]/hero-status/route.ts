import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * GET /api/studio/crochet/patterns/[id]/hero-status — has the finished-piece
 * photo landed yet?
 *
 * The Studio polls this while the render runs so it can swap the waiting note
 * for the photo without the maker reloading. Owner only; a design is private.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  const row = await prisma.crochetPattern.findUnique({
    where: { id },
    select: {
      ownerUserId: true,
      loomRenderStatus: true,
      loomRenderedAt: true,
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (row.ownerUserId !== user.id) return NextResponse.json({ error: 'Not authorised' }, { status: 403 })

  return NextResponse.json({
    status: row.loomRenderStatus,
    renderedAt: row.loomRenderedAt,
    heroUrl: mediaUrl(row.hero, 'card'),
  })
}
