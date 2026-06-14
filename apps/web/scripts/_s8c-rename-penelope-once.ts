/**
 * One-off — rename the SewingPattern row + Media row + R2 object for the
 * freesewing-penelope-pencil-skirt slug, after Rebecca's legal request
 * to drop the "Penelope" name (her former business held it).
 *
 *   tsx scripts/_s8c-rename-penelope-once.ts
 *
 * Idempotent: a second run with no old row finds nothing and exits clean.
 * Delete this script after the rename has landed in production.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let envDir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(envDir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(envDir); if (p === envDir) break; envDir = p
}

import { prisma } from '@homemade/db'

const OLD_SLUG = 'freesewing-penelope-pencil-skirt'
const NEW_SLUG = 'freesewing-slim-pencil-skirt'
const NEW_NAME = 'Slim pencil skirt'
const NEW_ALIASES = ['pencil skirt', 'straight skirt', 'fitted skirt', 'slim skirt']

const OLD_R2_KEY = `sewing-hero-flats/flux/${OLD_SLUG}.png`
const NEW_R2_KEY = `sewing-hero-flats/flux/${NEW_SLUG}.png`

async function r2Get(key: string): Promise<Buffer | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
  const bucket = process.env.R2_BUCKET ?? 'homemade-media'
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!apiToken) throw new Error('CLOUDFLARE_API_TOKEN is not set')
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
    `/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiToken}` },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 REST GET failed (${res.status}): ${text.slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function r2Put(key: string, bytes: Buffer, contentType: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const bucket = process.env.R2_BUCKET ?? 'homemade-media'
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
    `/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': contentType },
    body: new Uint8Array(bytes),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 REST PUT failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

async function r2Delete(key: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const bucket = process.env.R2_BUCKET ?? 'homemade-media'
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
    `/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiToken}` },
  })
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`R2 REST DELETE failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

async function main(): Promise<void> {
  const old = await prisma.sewingPattern.findUnique({
    where: { slug: OLD_SLUG },
    select: { id: true, name: true, heroMediaId: true, hero: { select: { id: true, r2Key: true } } },
  })
  if (!old) {
    console.log(`[rename] no row with slug=${OLD_SLUG} — already renamed or never existed`)
    return
  }
  console.log(`[rename] found row: id=${old.id} name="${old.name}" heroMediaId=${old.heroMediaId}`)

  // 1. Copy the R2 object to the new key (if it exists).
  const oldBytes = await r2Get(OLD_R2_KEY)
  if (oldBytes) {
    await r2Put(NEW_R2_KEY, oldBytes, 'image/png')
    console.log(`[rename] R2 copied  ${OLD_R2_KEY} -> ${NEW_R2_KEY}  (${oldBytes.length} bytes)`)
  } else {
    console.log(`[rename] R2 object ${OLD_R2_KEY} not present; skipping copy`)
  }

  // 2. Update the Media row to point at the new key + filename.
  if (old.hero) {
    await prisma.media.update({
      where: { id: old.hero.id },
      data: { r2Key: NEW_R2_KEY, filename: `${NEW_SLUG}.png`, alt: `Technical fashion flat of ${NEW_SLUG}` },
    })
    console.log(`[rename] Media row updated  ${old.hero.id}`)
  }

  // 3. Update the SewingPattern row.
  await prisma.sewingPattern.update({
    where: { id: old.id },
    data: { slug: NEW_SLUG, name: NEW_NAME, aliases: NEW_ALIASES },
  })
  console.log(`[rename] SewingPattern updated  slug=${NEW_SLUG} name="${NEW_NAME}"`)

  // 4. Delete the old R2 object (cleanup).
  if (oldBytes) {
    await r2Delete(OLD_R2_KEY)
    console.log(`[rename] R2 deleted  ${OLD_R2_KEY}`)
  }

  console.log('[rename] done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
