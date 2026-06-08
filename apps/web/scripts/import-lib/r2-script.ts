/**
 * R2 upload helper for standalone scripts.
 *
 * Mirrors apps/web/src/lib/r2.ts but without the `import 'server-only'`
 * guard so it can run under tsx outside a Next.js bundle. Wherever
 * possible, prefer the production r2.ts in app code — this module is
 * specifically for one-shot import scripts.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

function readEnv(name: string): string | null {
  const v = process.env[name]
  if (!v || v.length === 0) return null
  return v
}

interface R2Cfg {
  accountId: string
  bucket: string
  publicBaseUrl: string
  s3AccessKeyId: string | null
  s3SecretAccessKey: string | null
  apiToken: string | null
}

function cfg(): R2Cfg {
  const accountId = readEnv('CLOUDFLARE_ACCOUNT_ID')
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set; R2 uploads cannot proceed.')
  return {
    accountId,
    bucket: readEnv('R2_BUCKET') ?? 'homemade-media',
    publicBaseUrl: readEnv('R2_PUBLIC_BASE_URL') ?? 'https://media.homemade.education',
    s3AccessKeyId: readEnv('R2_ACCESS_KEY_ID'),
    s3SecretAccessKey: readEnv('R2_SECRET_ACCESS_KEY'),
    apiToken: readEnv('CLOUDFLARE_API_TOKEN'),
  }
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

function extensionFor(filename: string | null, contentType: string): string {
  if (filename) {
    const dot = filename.lastIndexOf('.')
    if (dot >= 0 && dot < filename.length - 1) return filename.slice(dot + 1).toLowerCase()
  }
  return EXT_BY_MIME[contentType] ?? 'bin'
}

let cachedClient: S3Client | null = null
function client(c: R2Cfg): S3Client {
  if (!c.s3AccessKeyId || !c.s3SecretAccessKey) {
    throw new Error('R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY must be set for script upload (REST fallback also available via CLOUDFLARE_API_TOKEN).')
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: c.s3AccessKeyId, secretAccessKey: c.s3SecretAccessKey },
    })
  }
  return cachedClient
}

export async function r2UploadScript(
  bytes: Buffer,
  contentType: string,
  options?: { filename?: string | null; prefix?: string },
): Promise<{ key: string; publicUrl: string }> {
  const c = cfg()
  const prefix = options?.prefix ?? 'media'
  const ext = extensionFor(options?.filename ?? null, contentType)
  const key = `${prefix}/${randomUUID()}.${ext}`

  if (c.s3AccessKeyId && c.s3SecretAccessKey) {
    await client(c).send(new PutObjectCommand({
      Bucket: c.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }))
  } else if (c.apiToken) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${c.accountId}/r2/buckets/${c.bucket}/objects/${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${c.apiToken}`, 'Content-Type': contentType },
      body: new Uint8Array(bytes),
    })
    if (!res.ok) throw new Error(`R2 REST PUT ${res.status}: ${(await res.text()).slice(0, 200)}`)
  } else {
    throw new Error('No R2 credentials. Set R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (S3) or CLOUDFLARE_API_TOKEN (REST).')
  }
  return {
    key,
    publicUrl: `${c.publicBaseUrl.replace(/\/$/, '')}/${key}`,
  }
}
