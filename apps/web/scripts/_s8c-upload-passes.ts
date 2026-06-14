/**
 * S-8c — upload PASSed Flux garment flats to R2 and attach to
 * SewingPattern.heroMediaId. Run after the visual-judging loop has
 * landed *.PASS.json files in scripts/s8c-test-output/<slug>/.
 *
 *   tsx scripts/_s8c-upload-passes.ts
 *
 * For each slug with a PASS marker:
 *   1. Read the chosen PNG (named in the PASS.json's `chosenAttempt`).
 *   2. Upload to R2 at sewing-hero-flats/flux/<slug>.png. Deterministic
 *      key so a re-run overwrites; Cloudflare CDN cache busts on next
 *      page load.
 *   3. Upsert the Media row (source=sewing-hero-flat-flux). Use the slug
 *      to dedupe so the script is idempotent across re-runs.
 *   4. Set SewingPattern.heroMediaId, clear heroNeedsFlatHand, leave
 *      heroRendererVersion at 0 so the procedural batch never overrides
 *      a Flux hero (the procedural batch's idempotency check is updated
 *      to skip rows where Media.source = sewing-hero-flat-flux).
 *
 * Idempotent: a second run with no new PASS files is a no-op.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
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

import { prisma, MediaStatus, MediaType } from '@homemade/db'

const OUTPUT_DIR = resolve(__dirname, 's8c-test-output')

interface PassFile {
  chosenAttempt: number
  prompt: string
  notes?: string
}

async function r2PutPng(bytes: Buffer, key: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
  const bucket = process.env.R2_BUCKET ?? 'homemade-media'
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const s3Key = process.env.R2_ACCESS_KEY_ID
  const s3Secret = process.env.R2_SECRET_ACCESS_KEY

  if (s3Key && s3Secret) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: s3Key, secretAccessKey: s3Secret },
    })
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: 'image/png',
      }),
    )
    return
  }

  if (!apiToken) throw new Error('No R2 credentials (S3 or REST) available')
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
    `/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'image/png' },
    body: new Uint8Array(bytes),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 REST PUT failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

async function main(): Promise<void> {
  if (!existsSync(OUTPUT_DIR)) {
    console.log('[s8c-upload] no s8c-test-output/ directory; nothing to do')
    return
  }
  const slugs = readdirSync(OUTPUT_DIR).filter((name) =>
    statSync(resolve(OUTPUT_DIR, name)).isDirectory(),
  )
  console.log(`[s8c-upload] scanning ${slugs.length} slug dirs`)

  let uploaded = 0
  let alreadyCurrent = 0
  let noPass = 0
  let failed = 0

  for (const slug of slugs) {
    const slugDir = resolve(OUTPUT_DIR, slug)
    const passPath = resolve(slugDir, `${slug}.PASS.json`)
    if (!existsSync(passPath)) {
      noPass++
      continue
    }
    let pass: PassFile
    try {
      pass = JSON.parse(readFileSync(passPath, 'utf8')) as PassFile
    } catch (err) {
      console.error(`[s8c-upload] ${slug}: invalid PASS.json — ${err}`)
      failed++
      continue
    }
    const pngPath = resolve(slugDir, `${slug}-attempt-${pass.chosenAttempt}.png`)
    if (!existsSync(pngPath)) {
      console.error(`[s8c-upload] ${slug}: chosen PNG ${pngPath} missing`)
      failed++
      continue
    }

    try {
      const pattern = await prisma.sewingPattern.findUnique({
        where: { slug },
        select: {
          id: true,
          heroMediaId: true,
          hero: { select: { id: true, r2Key: true, source: true } },
        },
      })
      if (!pattern) {
        console.error(`[s8c-upload] ${slug}: no SewingPattern row`)
        failed++
        continue
      }

      const r2Key = `sewing-hero-flats/flux/${slug}.png`
      // If the existing Media already points at this key + source, skip
      // re-upload + DB write — fully idempotent.
      if (
        pattern.hero?.r2Key === r2Key &&
        pattern.hero?.source === 'sewing-hero-flat-flux'
      ) {
        alreadyCurrent++
        continue
      }

      const bytes = readFileSync(pngPath)
      await r2PutPng(bytes, r2Key)

      // Upsert Media row. If the pattern already has a Media row from a
      // previous run, reuse its id. Otherwise create a fresh one.
      const mediaData = {
        type: MediaType.ILLUSTRATION,
        mimeType: 'image/png',
        filename: `${slug}.png`,
        r2Key,
        status: MediaStatus.READY,
        source: 'sewing-hero-flat-flux',
        alt: `Technical fashion flat of ${slug}`,
      }
      const media = pattern.hero
        ? await prisma.media.update({
            where: { id: pattern.hero.id },
            data: mediaData,
          })
        : await prisma.media.create({ data: mediaData })

      await prisma.sewingPattern.update({
        where: { id: pattern.id },
        data: {
          heroMediaId: media.id,
          heroNeedsFlatHand: false,
        },
      })

      uploaded++
      console.log(`[s8c-upload] OK ${slug}  attempt=${pass.chosenAttempt}  r2Key=${r2Key}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[s8c-upload] FAIL ${slug}: ${msg}`)
      failed++
    }
  }

  console.log('')
  console.log(`Uploaded: ${uploaded}`)
  console.log(`Already current: ${alreadyCurrent}`)
  console.log(`No PASS marker yet: ${noPass}`)
  console.log(`Failed: ${failed}`)
  if (failed > 0) process.exitCode = 1
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
