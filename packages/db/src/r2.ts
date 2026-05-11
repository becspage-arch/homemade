import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

/**
 * Cloudflare R2 helper for Node-side scripts in this package.
 *
 * Mirrors `apps/web/src/lib/r2.ts` but lives here so scripts that don't
 * import the web app can still push images to R2. Bumping both side by
 * side keeps things in sync; if you change the URL scheme, change it in
 * both places.
 *
 * Two upload paths:
 *   1. S3-compatible API — preferred for production traffic. Needs
 *      R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (R2 API tokens, created
 *      in the Cloudflare dashboard).
 *   2. Cloudflare REST API — fallback. Uses the existing
 *      CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID and so works without
 *      separate R2 tokens. Capped at 300 MB per object, which is fine for
 *      hero images. Used by one-off scripts when the S3 token isn't set up
 *      yet.
 */

function readEnv(name: string): string | null {
  const v = process.env[name]
  if (!v || v.length === 0) return null
  return v
}

interface R2BaseConfig {
  accountId: string
  bucket: string
  publicBaseUrl: string
  apiToken: string | null
  s3AccessKeyId: string | null
  s3SecretAccessKey: string | null
}

function r2Config(): R2BaseConfig {
  const accountId = readEnv('CLOUDFLARE_ACCOUNT_ID')
  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is not set; R2 uploads cannot proceed.')
  }
  return {
    accountId,
    bucket: readEnv('R2_BUCKET') ?? 'homemade-media',
    publicBaseUrl: readEnv('R2_PUBLIC_BASE_URL') ?? 'https://media.homemade.education',
    apiToken: readEnv('CLOUDFLARE_API_TOKEN'),
    s3AccessKeyId: readEnv('R2_ACCESS_KEY_ID'),
    s3SecretAccessKey: readEnv('R2_SECRET_ACCESS_KEY'),
  }
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

function extensionFor(filename: string | null, contentType: string): string {
  if (filename) {
    const dot = filename.lastIndexOf('.')
    if (dot >= 0 && dot < filename.length - 1) {
      return filename.slice(dot + 1).toLowerCase()
    }
  }
  return EXT_BY_MIME[contentType] ?? 'bin'
}

let cachedClient: S3Client | null = null
let cachedAccountId: string | null = null

async function s3Put(
  cfg: R2BaseConfig,
  bytes: Buffer,
  contentType: string,
  key: string,
): Promise<void> {
  if (!cfg.s3AccessKeyId || !cfg.s3SecretAccessKey) {
    throw new Error('S3 credentials missing')
  }
  if (!cachedClient || cachedAccountId !== cfg.accountId) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.s3AccessKeyId,
        secretAccessKey: cfg.s3SecretAccessKey,
      },
    })
    cachedAccountId = cfg.accountId
  }
  await cachedClient.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  )
}

async function restPut(
  cfg: R2BaseConfig,
  bytes: Buffer,
  contentType: string,
  key: string,
): Promise<void> {
  if (!cfg.apiToken) {
    throw new Error(
      'No R2 credentials available. Either R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (S3) ' +
        'or CLOUDFLARE_API_TOKEN (REST) must be set. Create R2 API tokens in the ' +
        'Cloudflare dashboard: R2 → Manage R2 API Tokens → Create API Token, scope ' +
        'to the homemade-media bucket with Object Read & Write.',
    )
  }
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}` +
    `/r2/buckets/${cfg.bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cfg.apiToken}`,
      'Content-Type': contentType,
    },
    body: new Uint8Array(bytes),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 REST PUT failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

export async function r2Upload(
  bytes: Buffer,
  contentType: string,
  options?: { filename?: string | null; prefix?: string },
): Promise<{ key: string; publicUrl: string }> {
  const cfg = r2Config()
  const prefix = options?.prefix ?? 'media'
  const ext = extensionFor(options?.filename ?? null, contentType)
  const key = `${prefix}/${randomUUID()}.${ext}`

  if (cfg.s3AccessKeyId && cfg.s3SecretAccessKey) {
    await s3Put(cfg, bytes, contentType, key)
  } else {
    await restPut(cfg, bytes, contentType, key)
  }

  return {
    key,
    publicUrl: `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`,
  }
}
