import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  prisma,
  parsePatternData,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

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

  // Beauty mode — strand-shaded X stitches on subtle / visible weave
  // depending on palette complexity. The thumbnail crops tight to the
  // stitched bounding box (with a small margin) so the subject fills
  // the frame instead of floating in a sea of cream — biggest impact
  // for simple craft-style patterns where the stitched area only
  // occupies the centre of the grid.
  const bbox = stitchedBoundingBox(data)
  const margin = 2
  const region = bbox
    ? {
        x: Math.max(0, bbox.minX - margin),
        y: Math.max(0, bbox.minY - margin),
        width:
          Math.min(data.grid.width, bbox.maxX + 1 + margin) -
          Math.max(0, bbox.minX - margin),
        height:
          Math.min(data.grid.height, bbox.maxY + 1 + margin) -
          Math.max(0, bbox.minY - margin),
      }
    : undefined
  const regionW = region?.width ?? data.grid.width
  // cellPx scales with the rendered region size, not the full grid —
  // a tight-cropped small subject gets the denser per-cell render.
  const cellPx = regionW <= 60 ? 30 : regionW <= 120 ? 18 : 12
  const svg = renderPatternSvgString(data, {
    mode: 'beauty',
    cellPx,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
    padding: Math.round(cellPx * 0.8),
    region,
  })

  // 2× density (960×720) — fits 480-css-px cards crisply on Retina without
  // needing srcSet plumbing on every consumer. PNG output stays small
  // because most patterns have a tiny palette and sharp's quality:88
  // keeps the file under ~60KB.
  const targetW = 960
  const targetH = 720
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
