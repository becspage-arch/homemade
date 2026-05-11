import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/auth'
import { r2Upload } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

/**
 * Public UGC photo upload. The browser POSTs a single image as multipart
 * form data; this handler streams it into R2 and returns the object key.
 * The caller then passes the key into the `submitUgcPhoto` server action
 * to create the Media + UGCPhoto rows.
 *
 * The Media row isn't created here so we don't end up with orphan rows
 * when a user gets cold feet mid-flow.
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (user.isSuspended) {
    return NextResponse.json({ error: 'Your account is suspended.' }, { status: 403 })
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

  const arrayBuffer = await file.arrayBuffer()
  const bytes = Buffer.from(arrayBuffer)
  const contentType = file.type || 'application/octet-stream'

  try {
    const { key, publicUrl } = await r2Upload(bytes, contentType, {
      filename: file.name,
      prefix: 'ugc',
    })
    return NextResponse.json({ key, publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
