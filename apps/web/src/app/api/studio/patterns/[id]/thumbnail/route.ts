import { NextResponse, after } from 'next/server'
import {
  prisma,
  parsePatternData,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mediaUrl } from '@/lib/media'
import { renderPatternThumbnailPng, persistPatternThumbnail } from '@/lib/studio/pattern-thumbnail'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * GET /api/studio/patterns/[id]/thumbnail — the chart preview image.
 *
 * Render is expensive (SVG → PNG) and Cloudflare treats this route as
 * DYNAMIC, so we don't want to re-render on every request as the library
 * grows. Strategy:
 *
 *   - If the pattern already has a persisted thumbnail (Pattern.thumbnailMediaId),
 *     redirect to the static CDN asset — no render at all.
 *   - Otherwise render once, return the PNG, and persist it to R2 in the
 *     background (`after`). Subsequent hits take the redirect path above.
 *
 * Library cards resolve the image through `patternHeroUrl`, which prefers the
 * saved thumbnail directly; this route remains the fallback + the thing that
 * fills the cache for any pattern that hasn't been backfilled yet.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const row = await prisma.pattern.findUnique({
    where: { id },
    select: {
      id: true,
      data: true,
      ownerUserId: true,
      visibility: true,
      thumbnailMediaId: true,
      thumbnail: { select: { r2Key: true, cloudflareId: true } },
    },
  })
  if (!row) return new NextResponse('Not found', { status: 404 })

  const isLibrary = row.ownerUserId === null && row.visibility !== Visibility.PRIVATE
  if (!isLibrary) {
    const user = await getCurrentDbUser()
    if (!user || row.ownerUserId !== user.id) {
      return new NextResponse('Not authorised', { status: 403 })
    }
  }

  // Already persisted — hand off to the cached CDN asset.
  if (row.thumbnail && (row.thumbnail.r2Key || row.thumbnail.cloudflareId)) {
    const url = mediaUrl(row.thumbnail, 'card')
    if (url) return NextResponse.redirect(url, 307)
  }

  let data
  try {
    data = parsePatternData(row.data)
  } catch {
    return new NextResponse('Malformed pattern data', { status: 500 })
  }

  const png = await renderPatternThumbnailPng(data)

  // Persist after responding so the first viewer doesn't wait on the upload.
  // Only shared library patterns get a persisted asset; user drafts keep
  // rendering on demand. Best-effort: a failed upload just means the next
  // request renders again.
  if (isLibrary) {
    after(async () => {
      try {
        await persistPatternThumbnail(row.id, { png })
      } catch {
        // ignore — the image was already served; we'll retry on the next hit
      }
    })
  }

  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'cache-tag': `pattern:${row.id}`,
    },
  })
}
