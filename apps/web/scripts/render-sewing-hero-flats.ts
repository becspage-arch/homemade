/**
 * Batch-render every SewingPattern row's hero flat SVG.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/render-sewing-hero-flats.ts
 *
 * For each pattern:
 *   1. Resolve archetype from the slug map. If no archetype is mapped,
 *      set heroNeedsFlatHand = true and skip.
 *   2. Render via apps/web/src/lib/sewing/hero-flat/render-flat. The
 *      renderer is deterministic; SVG bytes hash to the cacheKey.
 *   3. If the row already has heroMediaId pointing to a Media row whose
 *      r2Key encodes the same cacheKey, skip (idempotent).
 *   4. Otherwise upload the SVG to R2 under sewing-hero-flats/<cacheKey>.svg,
 *      create the Media row, attach to SewingPattern.heroMediaId, bump
 *      heroRendererVersion, clear heroNeedsFlatHand.
 *
 * The deploy workflow runs this after the freesewing showcase seed so
 * the live site has hero flats for every pattern without manual touch.
 */

import { prisma, MediaStatus, MediaType } from '@homemade/db'

import {
  RENDERER_VERSION,
  renderFlatForSlug,
} from '../src/lib/sewing/hero-flat/render-flat'

interface RenderSummary {
  rendered: string[]
  skippedAlreadyCurrent: string[]
  flaggedHandWork: string[]
  failed: { slug: string; error: string }[]
}

async function main(): Promise<void> {
  const patterns = await prisma.sewingPattern.findMany({
    select: {
      id: true,
      slug: true,
      heroMediaId: true,
      heroRendererVersion: true,
      heroNeedsFlatHand: true,
      hero: { select: { r2Key: true } },
    },
  })
  console.log(`Loaded ${patterns.length} SewingPattern rows.`)

  const summary: RenderSummary = {
    rendered: [],
    skippedAlreadyCurrent: [],
    flaggedHandWork: [],
    failed: [],
  }

  for (const pattern of patterns) {
    try {
      const rendered = renderFlatForSlug(pattern.slug)
      if (!rendered) {
        // No archetype mapped — flag for a hand-drawn illustrator. Idempotent.
        if (!pattern.heroNeedsFlatHand) {
          await prisma.sewingPattern.update({
            where: { id: pattern.id },
            data: { heroNeedsFlatHand: true },
          })
        }
        summary.flaggedHandWork.push(pattern.slug)
        continue
      }

      // Idempotency check: the Media row's r2Key embeds the cacheKey. If
      // the version matches AND the existing hero's cache is still the
      // current cacheKey, skip the upload.
      const currentR2Suffix = `${rendered.cacheKey}.svg`
      const alreadyCurrent =
        pattern.heroMediaId !== null &&
        pattern.heroRendererVersion >= rendered.rendererVersion &&
        pattern.hero?.r2Key?.endsWith(currentR2Suffix)

      if (alreadyCurrent) {
        summary.skippedAlreadyCurrent.push(pattern.slug)
        continue
      }

      const bytes = Buffer.from(rendered.svg, 'utf8')
      const r2Key = `sewing-hero-flats/${rendered.cacheKey}.svg`
      const { key } = await r2UploadWithKey(bytes, 'image/svg+xml', r2Key)

      const media = await prisma.media.create({
        data: {
          type: MediaType.ILLUSTRATION,
          mimeType: 'image/svg+xml',
          filename: `${pattern.slug}.svg`,
          r2Key: key,
          status: MediaStatus.READY,
          source: 'sewing-hero-flat-renderer',
          alt: `Finished garment flat of ${pattern.slug}`,
        },
      })

      await prisma.sewingPattern.update({
        where: { id: pattern.id },
        data: {
          heroMediaId: media.id,
          heroRendererVersion: rendered.rendererVersion,
          heroNeedsFlatHand: false,
        },
      })

      summary.rendered.push(pattern.slug)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      summary.failed.push({ slug: pattern.slug, error: msg })
      console.error(`FAIL ${pattern.slug}: ${msg}`)
    }
  }

  console.log('')
  console.log(`Renderer version: ${RENDERER_VERSION}`)
  console.log(`Rendered: ${summary.rendered.length}`)
  console.log(`Skipped (already current): ${summary.skippedAlreadyCurrent.length}`)
  console.log(`Flagged for hand-drawn (heroNeedsFlatHand=true): ${summary.flaggedHandWork.length}`)
  if (summary.flaggedHandWork.length > 0) {
    console.log('  ' + summary.flaggedHandWork.join('\n  '))
  }
  if (summary.failed.length > 0) {
    console.log(`Failed: ${summary.failed.length}`)
    for (const f of summary.failed) console.log(`  ${f.slug} — ${f.error}`)
    process.exitCode = 1
  }
}

/**
 * Variant of r2Upload that lets the caller specify the key directly,
 * so the renderer's cache key controls the R2 path. Falls back to the
 * default UUID-based key path only when the caller does not supply one.
 */
async function r2UploadWithKey(
  bytes: Buffer,
  contentType: string,
  key: string,
): Promise<{ key: string }> {
  // r2Upload bakes the key from randomUUID(). For deterministic caching
  // we need to PUT directly with our chosen key. We use the same env
  // configuration the wrapper does — REST fallback if S3 creds absent.
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
        ContentType: contentType,
      }),
    )
    return { key }
  }

  if (!apiToken) throw new Error('No R2 credentials (S3 or REST) available')
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
  return { key }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
