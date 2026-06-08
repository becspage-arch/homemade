import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { mediaUrl } from '@/lib/media'

/**
 * Resolve a Media row id to its delivery URL and redirect.
 *
 * Used by client components that have a media id but don't want to
 * import the server-side mediaUrl helper. The redirect target is the
 * same URL the server would build (Cloudflare Image Transformations
 * over R2, or imagedelivery.net for legacy Cloudflare Images rows).
 *
 *   GET /api/media/[id]?variant=hero|thumbnail|card
 *
 * Variant defaults to `card`. Unknown variants fall back to thumbnail.
 *
 * Returns 404 when:
 *   - The Media row doesn't exist
 *   - The row has no r2Key and no cloudflareId
 *   - The row is in UPLOADING or FAILED state
 */

interface Context {
  params: Promise<{ id: string }>
}

type Variant = 'hero' | 'card' | 'thumbnail' | 'public'

const VALID_VARIANTS = new Set<Variant>(['hero', 'card', 'thumbnail', 'public'])

export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  if (!/^[a-z0-9]{20,40}$/.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const url = new URL(request.url)
  const rawVariant = url.searchParams.get('variant') ?? 'card'
  const variant: Variant = VALID_VARIANTS.has(rawVariant as Variant)
    ? (rawVariant as Variant)
    : 'card'

  const media = await prisma.media.findUnique({
    where: { id },
    select: { r2Key: true, cloudflareId: true, status: true },
  })

  if (!media || media.status !== 'READY') {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const resolved = mediaUrl(
    { r2Key: media.r2Key ?? null, cloudflareId: media.cloudflareId ?? null },
    variant,
  )
  if (!resolved) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.redirect(resolved, { status: 302 })
}
