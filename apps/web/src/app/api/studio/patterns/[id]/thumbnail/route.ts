import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  prisma,
  parsePatternData,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

/**
 * GET /api/studio/patterns/[id]/thumbnail — server-rendered SVG → PNG.
 *
 * 4:3 thumbnail at 480×360. Library + My Patterns cards both pull this
 * URL; results are cached for 1 hour at the CDN edge and 5 minutes in
 * the browser. A pattern edit invalidates the cache via the Cache-Tag
 * header (Pattern.id) and a router invalidate from the autosave path.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const row = await prisma.pattern.findUnique({
    where: { id },
    select: { id: true, data: true, ownerUserId: true, visibility: true, updatedAt: true },
  })
  if (!row) return new NextResponse('Not found', { status: 404 })

  const isLibrary = row.ownerUserId === null && row.visibility !== Visibility.PRIVATE
  if (!isLibrary) {
    const user = await getCurrentDbUser()
    if (!user || row.ownerUserId !== user.id) {
      return new NextResponse('Not authorised', { status: 403 })
    }
  }

  let data
  try {
    data = parsePatternData(row.data)
  } catch {
    return new NextResponse('Malformed pattern data', { status: 500 })
  }

  const svg = renderPatternSvgString(data, {
    cellPx: 14,
    showSymbols: false,
    showGrid: data.grid.width <= 80,
    showCentreCrosshairs: false,
    padding: 16,
  })

  const targetW = 480
  const targetH = 360
  const png = await sharp(Buffer.from(svg))
    .resize(targetW, targetH, { fit: 'contain', background: { r: 245, g: 240, b: 232 } })
    .png({ quality: 88 })
    .toBuffer()

  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'cache-tag': `pattern:${row.id}`,
    },
  })
}
