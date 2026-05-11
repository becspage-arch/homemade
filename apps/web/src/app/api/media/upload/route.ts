import { NextResponse } from 'next/server'
import { prisma, MediaStatus, MediaType } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { r2Upload } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

/**
 * Admin image upload endpoint. The browser POSTs the file as multipart form
 * data; this handler streams the bytes into R2 and creates a Media row.
 *
 * Replaces the older Cloudflare Images direct-upload flow. Now that storage
 * + delivery live on R2 + Image Transformations, a one-hop server upload is
 * simpler than the two-step direct-upload pattern.
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentDbUser()
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
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
    return NextResponse.json({ error: 'File is empty.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES} bytes).` }, { status: 413 })
  }

  const alt = (formData.get('alt') as string | null)?.trim() || null
  const widthRaw = formData.get('width')
  const heightRaw = formData.get('height')
  const width = typeof widthRaw === 'string' && widthRaw ? parseInt(widthRaw, 10) : null
  const height = typeof heightRaw === 'string' && heightRaw ? parseInt(heightRaw, 10) : null

  const arrayBuffer = await file.arrayBuffer()
  const bytes = Buffer.from(arrayBuffer)
  const contentType = file.type || 'application/octet-stream'

  let key: string
  try {
    const result = await r2Upload(bytes, contentType, {
      filename: file.name,
      prefix: 'media',
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

  await audit({
    actorId: user.id,
    action: 'media.create',
    resource: `Media:${media.id}`,
    metadata: {
      r2Key: media.r2Key,
      filename: media.filename,
      status: media.status,
    },
  })

  return NextResponse.json({ id: media.id, r2Key: media.r2Key })
}
