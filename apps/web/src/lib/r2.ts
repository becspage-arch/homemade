import 'server-only'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

/**
 * Cloudflare R2 helper.
 *
 * R2 speaks S3 protocol. The production path uses the S3 SDK against the
 * R2 S3 endpoint (https://<account-id>.r2.cloudflarestorage.com) using R2
 * API tokens (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY) created in the
 * Cloudflare dashboard.
 *
 * The class also supports a CF REST API fallback for environments where
 * the S3 tokens haven't been provisioned yet — uses the existing
 * CLOUDFLARE_API_TOKEN against
 * /accounts/<id>/r2/buckets/<bucket>/objects/<key>. The REST path is
 * capped at 300 MB per object, which is fine for hero images.
 *
 * Public delivery goes through a custom domain attached to the bucket
 * (media.homemade.education by default), proxied by Cloudflare. URLs that
 * need resizing run through Cloudflare's Image Transformations:
 *   https://homemade.education/cdn-cgi/image/<params>/<r2-public-url>
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID  — always
 *   R2_ACCESS_KEY_ID       — for S3 path (preferred)
 *   R2_SECRET_ACCESS_KEY   — for S3 path (preferred)
 *   CLOUDFLARE_API_TOKEN   — for REST fallback
 *
 * Optional:
 *   R2_BUCKET                  — bucket name (default: homemade-media)
 *   R2_PUBLIC_BASE_URL         — public custom domain (default: https://media.homemade.education)
 *   CDN_IMAGE_TRANSFORM_ORIGIN — host that fronts /cdn-cgi/image. Defaults to
 *                                https://homemade.education. The host must
 *                                be a Cloudflare zone you own and the bucket
 *                                public origin must be on the same account
 *                                for Image Transformations to fetch it.
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
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID is not set; R2 uploads cannot proceed.',
    )
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

function getS3Client(cfg: R2BaseConfig): S3Client {
  if (!cfg.s3AccessKeyId || !cfg.s3SecretAccessKey) {
    throw new Error(
      'R2 S3 credentials are not configured. Set R2_ACCESS_KEY_ID and ' +
        'R2_SECRET_ACCESS_KEY (Cloudflare dashboard → R2 → Manage R2 API ' +
        'Tokens → Create API Token, with Object Read & Write on the ' +
        'homemade-media bucket).',
    )
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
  return cachedClient
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
        'or CLOUDFLARE_API_TOKEN (REST) must be set.',
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

async function restDelete(cfg: R2BaseConfig, key: string): Promise<void> {
  if (!cfg.apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN not set; cannot delete via REST.')
  }
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}` +
    `/r2/buckets/${cfg.bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cfg.apiToken}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 REST DELETE failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

/**
 * Upload a buffer to R2. Returns the object key and its public URL on the
 * custom domain (no resize). For a resized URL, pass the key through
 * `mediaUrl` in apps/web/src/lib/media.ts.
 */
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
    const client = getS3Client(cfg)
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    )
  } else {
    await restPut(cfg, bytes, contentType, key)
  }

  return {
    key,
    publicUrl: `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`,
  }
}

export async function r2Delete(key: string): Promise<void> {
  const cfg = r2Config()
  if (cfg.s3AccessKeyId && cfg.s3SecretAccessKey) {
    const client = getS3Client(cfg)
    await client.send(
      new DeleteObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
      }),
    )
    return
  }
  await restDelete(cfg, key)
}

/** Build the public URL for a stored R2 key, without any resize. */
export function r2PublicUrl(key: string): string {
  const base = readEnv('R2_PUBLIC_BASE_URL') ?? 'https://media.homemade.education'
  return `${base.replace(/\/$/, '')}/${key}`
}
