/**
 * Image verification — apply verdicts.
 *
 * Companion to `verify-media-batch.ts`. Reads the worker-filled verdict file
 * and commits the results to the database:
 *
 *   - verified  → Media.verificationStatus = VERIFIED, verifiedAt = now()
 *   - rejected  → Media.verificationStatus = REJECTED, verificationReason set.
 *                 Then attempt to source a replacement hero image (excluding
 *                 the rejected source) and attach it. The new Media row is
 *                 created UNVERIFIED — the next sweep picks it up.
 *   - rejected with no replacement → original Media stays REJECTED but the
 *                 Tutorial keeps it as hero (caller decides whether to flip
 *                 to PROCEDURAL_CARD manually). The script logs which slugs
 *                 hit this state.
 *
 * Verdict file shape (worker writes this after viewing each image inline):
 *
 *   {
 *     "verdicts": [
 *       { "mediaId": "...", "verdict": "verified", "reason": "..." },
 *       { "mediaId": "...", "verdict": "rejected", "reason": "wrong cuisine" }
 *     ]
 *   }
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/apply-media-verdicts.ts \
 *     [--verdicts PATH] [--skip-regen] [--dry-run] [--no-ai-fallback]
 *
 * Flags:
 *   --verdicts PATH    Path to the verdict file. Default
 *                      docs/image-verification-verdicts.json.
 *   --skip-regen       Apply verdicts but don't re-source replacement images
 *                      for rejected entries. Useful for partial passes.
 *   --dry-run          Print what would change without writing to the DB.
 *   --no-ai-fallback   When the 3-rejection cap fires, skip the Flux attempt
 *                      entirely. Excludes 'flux-schnell' from sourceHeroImage
 *                      so it returns 'failed' immediately and the existing
 *                      failed branch stamps Media.verificationStatus =
 *                      REJECTED_USED_PROCEDURAL + Tutorial.heroImageStrategy
 *                      = PROCEDURAL_CARD. Used by the retroactive sweep so
 *                      long-tail-miss recipes land as procedural cards rather
 *                      than AI-generated heroes. New tutorials authored via
 *                      the autopilot pipeline still get the Flux-as-fallback
 *                      flow (this flag is opt-in).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
import { sourceHeroImage } from '../../../apps/web/src/lib/image-sourcing/orchestrator'
import type { ImageSource } from '../../../apps/web/src/lib/image-sourcing/types'

interface VerdictRow {
  mediaId: string
  verdict: 'verified' | 'rejected'
  reason: string
}

interface VerdictFile {
  verdicts: VerdictRow[]
}

interface CliFlags {
  verdictsPath: string
  skipRegen: boolean
  dryRun: boolean
  noAiFallback: boolean
}

function parseCliFlags(argv: string[]): CliFlags {
  let verdictsPath = ''
  let skipRegen = false
  let dryRun = false
  let noAiFallback = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--verdicts') verdictsPath = argv[++i]!
    else if (a.startsWith('--verdicts=')) verdictsPath = a.slice('--verdicts='.length)
    else if (a === '--skip-regen') skipRegen = true
    else if (a === '--dry-run') dryRun = true
    else if (a === '--no-ai-fallback') noAiFallback = true
  }
  if (!verdictsPath) {
    verdictsPath = resolve(__dirname, '..', '..', '..', 'docs', 'image-verification-verdicts.json')
  }
  return { verdictsPath, skipRegen, dryRun, noAiFallback }
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  if (c === 'image/jpeg' || c === 'image/jpg') return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function topIngredients(tutorialId: string): Promise<string[]> {
  const rows = await prisma.recipeIngredient.findMany({
    where: { tutorialId },
    select: {
      position: true,
      ingredient: { select: { name: true } },
    },
    orderBy: { position: 'asc' },
    take: 5,
  })
  return rows
    .map((r) => r.ingredient.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 3)
    .map((n) => n.toLowerCase())
}

interface ApplySummary {
  total: number
  verified: number
  rejectedNoRegen: number
  rejectedRegenerated: number
  rejectedRegenFailed: number
  rejectedForcedToFlux: number
  /** Cap fired with --no-ai-fallback set: Flux skipped, slug stamped
   *  REJECTED_USED_PROCEDURAL + PROCEDURAL_CARD by design (not a failure). */
  cappedToProcedural: number
  notFound: number
  errors: string[]
}

const REAL_PHOTO_SOURCES: ImageSource[] = ['unsplash', 'pexels', 'wikimedia', 'pixabay']

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(
    `apply-media-verdicts: verdicts=${flags.verdictsPath}, ` +
      `skipRegen=${flags.skipRegen}, dryRun=${flags.dryRun}, ` +
      `noAiFallback=${flags.noAiFallback}`,
  )

  if (!existsSync(flags.verdictsPath)) {
    console.error(`Verdict file not found: ${flags.verdictsPath}`)
    process.exit(1)
  }

  const file = JSON.parse(readFileSync(flags.verdictsPath, 'utf8')) as VerdictFile
  if (!Array.isArray(file.verdicts)) {
    console.error('Verdict file is malformed — expected { verdicts: [...] }')
    process.exit(1)
  }

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const summary: ApplySummary = {
    total: file.verdicts.length,
    verified: 0,
    rejectedNoRegen: 0,
    rejectedRegenerated: 0,
    rejectedRegenFailed: 0,
    rejectedForcedToFlux: 0,
    cappedToProcedural: 0,
    notFound: 0,
    errors: [],
  }

  for (let i = 0; i < file.verdicts.length; i++) {
    const v = file.verdicts[i]!
    const tag = `[${i + 1}/${file.verdicts.length}] ${v.mediaId}`

    const media = await prisma.media.findUnique({
      where: { id: v.mediaId },
      select: {
        id: true,
        source: true,
        verificationStatus: true,
        tutorialsHero: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            excerpt: true,
            body: true,
            status: true,
            excludedImageSources: true,
            category: { select: { slug: true } },
            subCategory: { select: { slug: true } },
          },
          take: 1,
        },
      },
    })
    if (!media) {
      summary.notFound += 1
      console.warn(`${tag} NOT FOUND`)
      continue
    }

    if (v.verdict === 'verified') {
      if (!flags.dryRun) {
        await prisma.media.update({
          where: { id: media.id },
          data: {
            verificationStatus: 'VERIFIED',
            verificationReason: v.reason || null,
            verifiedAt: new Date(),
          },
        })
      }
      summary.verified += 1
      console.log(`${tag} VERIFIED`)
      continue
    }

    // Rejected
    if (!flags.dryRun) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          verificationStatus: 'REJECTED',
          verificationReason: v.reason || null,
        },
      })
    }

    if (flags.skipRegen) {
      summary.rejectedNoRegen += 1
      console.log(`${tag} REJECTED (no regen): ${v.reason}`)
      continue
    }

    const tutorial = media.tutorialsHero[0]
    if (!tutorial) {
      summary.rejectedNoRegen += 1
      console.log(`${tag} REJECTED: not attached as any tutorial hero, skipping regen`)
      continue
    }

    try {
      const ingredients = await topIngredients(tutorial.id)

      // Accumulate the set of sources already rejected for this tutorial,
      // both from prior sweep runs (stored on Tutorial.excludedImageSources)
      // and the verdict we just stamped. Persist the new rejection before
      // calling the orchestrator so a mid-run crash still records progress.
      const priorExcluded = (tutorial.excludedImageSources ?? []) as ImageSource[]
      const thisRejected: ImageSource | null = (media.source as ImageSource | null) ?? null
      const accumulated = new Set<ImageSource>([
        ...priorExcluded,
        ...(thisRejected ? [thisRejected] : []),
      ])
      if (!flags.dryRun && thisRejected && !priorExcluded.includes(thisRejected)) {
        await prisma.tutorial.update({
          where: { id: tutorial.id },
          data: { excludedImageSources: { push: thisRejected } },
        })
      }

      // Cap: after 3 distinct real-photo rejections, the next attempt skips
      // free sources by excluding every real-photo source. Normally it then
      // falls through to Flux; with --no-ai-fallback set we also exclude
      // flux-schnell so the orchestrator returns outcome='failed' and the
      // existing failed branch stamps PROCEDURAL_CARD by design.
      const realPhotoRejected = REAL_PHOTO_SOURCES.filter((s) => accumulated.has(s))
      const forcedToFlux = realPhotoRejected.length >= 3
      if (forcedToFlux) summary.rejectedForcedToFlux += 1
      const capSkipFlux = forcedToFlux && flags.noAiFallback
      const excludeSources: ImageSource[] = forcedToFlux
        ? Array.from(
            new Set<ImageSource>([
              ...accumulated,
              ...REAL_PHOTO_SOURCES,
              ...(capSkipFlux ? (['flux-schnell'] as ImageSource[]) : []),
            ]),
          )
        : Array.from(accumulated)

      const result = await sourceHeroImage(
        {
          title: tutorial.title,
          category: tutorial.category.slug,
          subCategory: tutorial.subCategory?.slug ?? null,
          ingredients,
        },
        { excludeSources },
      )

      if (result.outcome === 'failed' || !result.image) {
        if (!flags.dryRun) {
          await prisma.media.update({
            where: { id: media.id },
            data: { verificationStatus: 'REJECTED_USED_PROCEDURAL' },
          })
          await prisma.tutorial.update({
            where: { id: tutorial.id },
            data: { heroImageStrategy: 'PROCEDURAL_CARD' },
          })
        }
        if (capSkipFlux) {
          summary.cappedToProcedural += 1
          console.log(`${tag} REJECTED + cap-fired → PROCEDURAL_CARD (no-ai-fallback)`)
        } else {
          summary.rejectedRegenFailed += 1
          console.log(`${tag} REJECTED + regen FAILED → PROCEDURAL_CARD`)
        }
        continue
      }

      const img = result.image

      if (flags.dryRun) {
        summary.rejectedRegenerated += 1
        console.log(`${tag} REJECTED + regen DRY via ${img.source}`)
        continue
      }

      const dl = await fetch(img.url, {
        headers: {
          'User-Agent':
            'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
          Accept: 'image/*,*/*;q=0.8',
        },
      })
      if (!dl.ok) {
        summary.rejectedRegenFailed += 1
        summary.errors.push(`${tutorial.slug}: regen download ${dl.status}`)
        console.warn(`${tag} regen download ${dl.status}`)
        continue
      }
      const buf = Buffer.from(await dl.arrayBuffer())
      const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
      const filename = `${tutorial.slug}-hero-regen.${ext}`
      const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/verification-regen' })

      const newMedia = await prisma.media.create({
        data: {
          r2Key: key,
          type: 'ILLUSTRATION',
          status: 'READY',
          filename,
          mimeType: mime,
          width: img.width,
          height: img.height,
          bytes: buf.length,
          source: img.source,
          sourceUrl: img.pageUrl,
          creatorName: img.creatorName,
          licenceCode: img.licenceCode,
          licenceUrl: img.licenceUrl,
          requiresAttribution: img.requiresAttribution,
          verificationStatus: 'UNVERIFIED',
        },
      })

      await prisma.$transaction(async (tx) => {
        await tx.tutorialVersion.create({
          data: {
            tutorialId: tutorial.id,
            title: tutorial.title,
            subtitle: tutorial.subtitle,
            excerpt: tutorial.excerpt,
            body: tutorial.body as Prisma.InputJsonValue,
            status: tutorial.status,
            authorId: author.id,
            changeNote:
              `image-verification regen: ${media.source ?? 'unknown'} → ${img.source} ` +
              `(rejection reason: ${v.reason || 'unspecified'})`,
          },
        })
        await tx.tutorial.update({
          where: { id: tutorial.id },
          data: {
            heroMediaId: newMedia.id,
            heroImageStrategy: img.source === 'flux-schnell' ? 'AI_GENERATED' : 'REAL_PHOTO',
          },
        })
      })

      summary.rejectedRegenerated += 1
      console.log(`${tag} REJECTED + regen OK via ${img.source}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      summary.errors.push(`${tutorial.slug}: ${message}`)
      summary.rejectedRegenFailed += 1
      console.error(`${tag} regen ERROR ${message}`)
    }
  }

  if (!flags.dryRun) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.image-verification-apply',
        resource: 'tutorials',
        metadata: summary as unknown as Prisma.InputJsonValue,
      },
    })
  }

  const reportPath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    'docs',
    `image-verification-apply-${new Date().toISOString().slice(0, 10)}.json`,
  )
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8')

  console.log('\nDONE')
  console.log(`  total:               ${summary.total}`)
  console.log(`  verified:            ${summary.verified}`)
  console.log(`  rejected (regen):    ${summary.rejectedRegenerated}`)
  console.log(`  rejected (failed):   ${summary.rejectedRegenFailed}`)
  console.log(`  rejected (skip):     ${summary.rejectedNoRegen}`)
  console.log(`  forced→Flux (cap):   ${summary.rejectedForcedToFlux}`)
  console.log(`  capped→procedural:   ${summary.cappedToProcedural}`)
  console.log(`  not found:           ${summary.notFound}`)
  if (summary.errors.length) {
    console.log(`  errors (${summary.errors.length}):`)
    for (const e of summary.errors) console.log(`    - ${e}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
