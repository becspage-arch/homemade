import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { renderProceduralCardSvg } from '@/lib/procedural-card'

/**
 * Serves the procedural card SVG for a tutorial that lacks a real hero. The
 * URL is stable per tutorial (the title + category are looked up at request
 * time) so Cloudflare can cache the response. We set a long s-maxage so the
 * edge handles 99% of traffic. The Cache-Control surface revalidates daily,
 * which lets a rename flow through even without a cache-bust query param.
 */
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tutorialId: string }> },
) {
  const { tutorialId } = await params

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: {
      id: true,
      title: true,
      category: { select: { slug: true } },
    },
  })

  if (!tutorial) {
    return new NextResponse('Not found', { status: 404 })
  }

  const svg = renderProceduralCardSvg({
    title: tutorial.title,
    categorySlug: tutorial.category?.slug ?? null,
  })

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      // 1-day browser cache, 7-day shared edge cache, stale-while-revalidate
      // so an in-flight refresh doesn't penalise the user.
      'cache-control':
        'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  })
}
