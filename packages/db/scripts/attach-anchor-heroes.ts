/**
 * One-off: re-attach the two anchor tutorial heroes (béchamel + strawberry jam)
 * to Cloudflare R2.
 *
 * Background: Phase 2e shipped Cloudflare Images for storage. The account's
 * Images subscription went away (HTTP 5403), so the original upload-tutorial
 * script created Media rows with status=UPLOADING and cloudflareId=null. This
 * script reads the local PNGs at docs/anchor-tutorial-heroes/, uploads them
 * to R2, and updates the Media rows to status=READY with the new r2Key.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/attach-anchor-heroes.ts
 *
 * Reads DATABASE_URL + CLOUDFLARE_ACCOUNT_ID + (R2_ACCESS_KEY_ID +
 * R2_SECRET_ACCESS_KEY) OR CLOUDFLARE_API_TOKEN from env or .env.credentials.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(process.cwd(), '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

const REPO_ROOT = resolve(__dirname, '../../..')

interface Target {
  tutorialSlug: string
  localPath: string
}

const TARGETS: Target[] = [
  {
    tutorialSlug: 'bechamel-the-basic-white-sauce',
    localPath: resolve(REPO_ROOT, 'docs/anchor-tutorial-heroes/bechamel-hero.png'),
  },
  {
    tutorialSlug: 'strawberry-jam-open-pan-method',
    localPath: resolve(REPO_ROOT, 'docs/anchor-tutorial-heroes/strawberry-jam-hero.png'),
  },
]

function readPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return { width, height }
}

async function main(): Promise<void> {
  const { prisma, MediaStatus, r2Upload } = await import('../src/index.js')

  for (const target of TARGETS) {
    console.log(`\n[attach] ${target.tutorialSlug}`)

    if (!existsSync(target.localPath)) {
      console.error(`  ! local file missing: ${target.localPath}`)
      continue
    }

    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: target.tutorialSlug },
      include: { hero: true },
    })
    if (!tutorial) {
      console.error(`  ! Tutorial row not found for slug "${target.tutorialSlug}"`)
      continue
    }

    const bytes = readFileSync(target.localPath)
    const probe = readPngDimensions(bytes)
    const filename = target.localPath.split(/[\\/]/).pop() ?? 'hero.png'

    let mediaId = tutorial.heroMediaId
    if (!mediaId) {
      console.log('  no hero attached yet; creating Media row')
      const created = await prisma.media.create({
        data: {
          type: 'ILLUSTRATION',
          status: MediaStatus.UPLOADING,
          filename,
          mimeType: 'image/png',
          width: probe?.width ?? null,
          height: probe?.height ?? null,
          bytes: bytes.length,
        },
      })
      mediaId = created.id
      await prisma.tutorial.update({
        where: { id: tutorial.id },
        data: { heroMediaId: created.id },
      })
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } })
    if (!media) {
      console.error(`  ! Media row vanished mid-flight; aborting`)
      continue
    }

    console.log('  uploading to R2')
    const { key } = await r2Upload(bytes, 'image/png', {
      filename,
      prefix: 'tutorials',
    })

    await prisma.media.update({
      where: { id: media.id },
      data: {
        r2Key: key,
        status: MediaStatus.READY,
        cloudflareId: null, // clear the stale legacy column
        width: probe?.width ?? media.width,
        height: probe?.height ?? media.height,
        bytes: bytes.length,
      },
    })

    const publicUrl =
      (process.env.R2_PUBLIC_BASE_URL ?? 'https://media.homemade.education').replace(/\/$/, '') +
      `/${key}`
    const transformOrigin =
      (process.env.CDN_IMAGE_TRANSFORM_ORIGIN ?? 'https://homemade.education').replace(/\/$/, '')
    const heroTransformUrl = `${transformOrigin}/cdn-cgi/image/width=1600,format=auto/${publicUrl}`
    console.log(`  Media ${media.id}`)
    console.log(`    r2Key      = ${key}`)
    console.log(`    public URL = ${publicUrl}`)
    console.log(`    hero URL   = ${heroTransformUrl}`)
  }

  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('\n[attach-anchor-heroes] failed:', err)
  process.exit(1)
})
