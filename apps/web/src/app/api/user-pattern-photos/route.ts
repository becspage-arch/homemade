import { NextResponse } from 'next/server'
import { prisma, MediaType, MediaStatus, UserPhotoStatus, PatternType } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'
import { r2Upload } from '@/lib/r2'
import { USER_SUBMISSION_ENABLED } from '@/lib/config'
import { gateMakerPhoto } from '@/lib/maker-photo-gate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

/**
 * POST /api/user-pattern-photos
 *
 * Accepts: multipart/form-data with { patternId, patternType, caption?, file }
 *
 * When USER_SUBMISSION_ENABLED is false, returns 503.
 * Creates a Media row (UPLOADING -> READY) and a PENDING UserPatternPhoto row.
 */
export async function POST(request: Request): Promise<Response> {
  if (!USER_SUBMISSION_ENABLED) {
    return NextResponse.json(
      { error: 'Photo submissions are not yet open.' },
      { status: 503 },
    )
  }

  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (user.isSuspended) {
    return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Could not read upload.' }, { status: 400 })
  }

  const patternId = formData.get('patternId')
  const patternType = formData.get('patternType')
  const captionRaw = formData.get('caption')
  const file = formData.get('file')

  if (!patternId || typeof patternId !== 'string') {
    return NextResponse.json({ error: 'Missing patternId.' }, { status: 400 })
  }
  if (!patternType || typeof patternType !== 'string') {
    return NextResponse.json({ error: 'Missing patternType.' }, { status: 400 })
  }
  if (!Object.values(PatternType).includes(patternType as PatternType)) {
    return NextResponse.json({ error: 'Invalid patternType.' }, { status: 400 })
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field.' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 25 MB).' }, { status: 413 })
  }

  const caption = typeof captionRaw === 'string' ? captionRaw.trim().slice(0, 400) || null : null

  const arrayBuffer = await file.arrayBuffer()
  const bytes = Buffer.from(arrayBuffer)
  const contentType = file.type || 'application/octet-stream'

  let r2Key: string
  try {
    const result = await r2Upload(bytes, contentType, {
      filename: file.name,
      prefix: 'user-pattern-photos',
    })
    r2Key = result.key
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const media = await prisma.media.create({
    data: {
      r2Key,
      type: MediaType.PHOTO,
      mimeType: contentType,
      filename: file.name,
      bytes: file.size,
      status: MediaStatus.READY,
      source: 'user-upload',
    },
  })

  const photo = await prisma.userPatternPhoto.create({
    data: {
      userId: user.id,
      patternId,
      patternType: patternType as PatternType,
      mediaId: media.id,
      caption,
      status: UserPhotoStatus.PENDING,
    },
  })

  // The photo gate. In 'api' mode (the default) the member gets an answer here,
  // while they are still standing there; in 'routine' mode the photo stays
  // PENDING behind "Checking your photo" and a scheduled session judges it. The
  // gate never throws — a photo it could not judge simply stays PENDING.
  const gate = await gateMakerPhoto({
    photoId: photo.id,
    bytes,
    mimeType: contentType,
    caption,
  })

  return NextResponse.json({
    photoId: photo.id,
    status: gate.status,
    message: gate.message,
    ...(gate.status === UserPhotoStatus.REJECTED ? { reasons: gate.reasons } : {}),
  })
}
