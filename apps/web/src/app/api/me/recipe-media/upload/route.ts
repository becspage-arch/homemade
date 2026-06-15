import { NextResponse } from 'next/server'
import { prisma, MediaStatus, MediaType } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'
import { r2Upload } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])

/**
 * Creator recipe photo upload. Any signed-in Maker can upload their own recipe
 * photos here; the admin `/api/media/upload` endpoint stays admin-only.
 *
 * A Maker's photo is their own content. It is stored exactly as uploaded: no
 * resizing, no retouching, no AI generation, never replaced without the Maker's
 * action. (Delivery-time variants from Cloudflare are layout-only and do not
 * change the stored original.)
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not read upload.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field.' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'That file looks empty.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That photo is over the 25 MB limit.' }, { status: 413 })
  }
  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: 'Upload a JPEG, PNG, WebP, AVIF, or GIF photo.' }, { status: 415 })
  }

  const alt = (formData.get('alt') as string | null)?.trim() || null
  const widthRaw = formData.get('width')
  const heightRaw = formData.get('height')
  const width = typeof widthRaw === 'string' && widthRaw ? parseInt(widthRaw, 10) : null
  const height = typeof heightRaw === 'string' && heightRaw ? parseInt(heightRaw, 10) : null

  const bytes = Buffer.from(await file.arrayBuffer())

  let key: string
  try {
    const result = await r2Upload(bytes, contentType, {
      filename: file.name,
      prefix: 'recipe-photos',
    })
    key = result.key
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const media = await prisma.media.create({
    data: {
      r2Key: key,
      type: MediaType.PHOTO,
      status: MediaStatus.READY,
      filename: file.name,
      mimeType: contentType,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
      bytes: file.size,
      alt,
    },
  })

  return NextResponse.json({ id: media.id, r2Key: media.r2Key })
}
