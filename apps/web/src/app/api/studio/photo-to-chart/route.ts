import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { computePatternMetrics } from '@homemade/db'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import {
  downscaleCacheKey,
  getDownscale,
  putDownscale,
} from '@/lib/studio/downscale-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/studio/photo-to-chart — image → pattern data.
 *
 * The heavy lifting (sharp + image-q + nearest-floss + confetti pass)
 * lives in `@/lib/studio/photo-to-pattern` so the photographic-seed
 * script can call the same pipeline server-side. This route adds the
 * per-(image, dimensions, bg-removal) LRU cache so a slider drag that
 * only changes the colour count or confetti pass skips the sharp
 * downscale step.
 */
export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('image')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 })
  }
  const arrBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrBuf)

  const width = Number(form.get('width') ?? 80)
  const height = Number(form.get('height') ?? 100)
  const colours = Number(form.get('colours') ?? 18)
  const fabricCount = Number(form.get('fabricCount') ?? 14)
  const brandStr = String(form.get('brand') ?? 'DMC')
  const confettiMin = String(form.get('confettiMin') ?? 'medium') as 'low' | 'medium' | 'high'
  const removeBackground = String(form.get('backgroundRemoval') ?? '0') === '1'

  const brand = brandStr === 'ANCHOR' || brandStr === 'MADEIRA' ? (brandStr as 'ANCHOR' | 'MADEIRA') : 'DMC'

  if (!Number.isInteger(width) || width < 6 || width > 400) {
    return NextResponse.json({ error: 'width must be 6-400 cells' }, { status: 400 })
  }
  if (!Number.isInteger(height) || height < 6 || height > 400) {
    return NextResponse.json({ error: 'height must be 6-400 cells' }, { status: 400 })
  }
  if (!Number.isInteger(colours) || colours < 4 || colours > 96) {
    return NextResponse.json({ error: 'colours must be 4-96' }, { status: 400 })
  }

  const imageHash = createHash('sha1').update(buf).digest('hex')
  const cacheKey = downscaleCacheKey({
    imageHash,
    width,
    height,
    backgroundRemoval: removeBackground,
  })
  const cached = getDownscale(cacheKey)
  const { data, rgba } = await photoToPatternData(
    buf,
    { width, height, colours, fabricCount, brand, confettiMin, backgroundRemoval: removeBackground },
    cached?.rgba ?? null,
  )
  if (!cached) putDownscale(cacheKey, rgba, width, height)

  return NextResponse.json({ pattern: data, metrics: computePatternMetrics(data) })
}
