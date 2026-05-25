/**
 * Subject-relevance — apply verdicts.
 *
 * Companion to score-relevance-batch.ts. Reads the worker-filled verdict
 * file and commits each verdict to the database. Verdict file shape:
 *
 *   {
 *     "verdicts": [
 *       { "mediaId": "...", "tier": "EXACT",   "reason": "...", "confidence": 0.95 },
 *       { "mediaId": "...", "tier": "PARTIAL", "reason": "...", "confidence": 0.7  },
 *       { "mediaId": "...", "tier": "WRONG",   "reason": "...", "confidence": 0.9  }
 *     ]
 *   }
 *
 * Apply rules:
 *   - EXACT   → Media.verificationStatus = VERIFIED, verifiedAt = now(),
 *               verificationReason stamped with relevance=EXACT + reason.
 *   - PARTIAL → leave verificationStatus alone, stamp verifiedAt + reason
 *               with relevance=PARTIAL annotation. Logged for Rebecca review.
 *   - WRONG   → mirror the existing media-rejection regen flow:
 *               Media.verificationStatus = REJECTED, verificationReason set,
 *               Tutorial.excludedImageSources appended with the rejected
 *               source, then sourceHeroImage() is called excluding the
 *               accumulated set. The replacement Media row is created with
 *               relevance=UNVERIFIED (next pass picks it up). If every free
 *               source has been rejected for this tutorial (3+ real-photo
 *               rejections), the orchestrator's existing cap path forces
 *               Flux or procedural, mirroring apply-media-verdicts.ts.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/apply-relevance-verdicts.ts \
 *     [--verdicts PATH] [--skip-regen] [--dry-run] [--no-ai-fallback]
 *
 * Flags mirror apply-media-verdicts.ts. The `--skip-regen` flag is the safe
 * default for an audit-only pass.
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
import type { RelevanceTier } from '../../../apps/web/src/lib/image-sourcing/relevance'
import { FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-schnell'
import { writeFluxBillingHalt } from '../../../apps/web/src/lib/image-sourcing/flux-billing-halt'

interface VerdictRow {
  mediaId: string
  tier: RelevanceTier
  reason: string
  confidence: number
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
    verdictsPath = resolve(__dirname, '..', '..', '..', 'docs', 'image-relevance-verdicts.json')
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
  exact: number
  partial: number
  wrongRegenerated: number
  wrongRegenFailed: number
  wrongNoRegen: number
  cappedToProcedural: number
  notFound: number
  errors: string[]
}

const REAL_PHOTO_SOURCES: ImageSource[] = ['unsplash', 'pexels', 'wikimedia', 'pixabay']

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(
    `apply-relevance-verdicts: verdicts=${flags.verdictsPath}, ` +
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
    exact: 0,
    partial: 0,
    wrongRegenerated: 0,
    wrongRegenFailed: 0,
    wrongNoRegen: 0,
    cappedToProcedural: 0,
    notFound: 0,
    errors: [],
  }

  for (let i = 0; i < file.verdicts.length; i++) {
    const v = file.verdicts[i]!
    const tag = `[${i + 1}/${file.verdicts.length}] ${v.mediaId} (${v.tier})`

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

    if (v.tier === 'EXACT') {
      if (!flags.dryRun) {
        await prisma.media.update({
          where: { id: media.id },
          data: {
            verificationStatus: 'VERIFIED',
            verificationReason: `relevance=EXACT (${v.confidence.toFixed(2)}): ${v.reason}`,
            verifiedAt: new Date(),
          },
        })
      }
      summary.exact += 1
      console.log(`${tag} EXACT`)
      continue
    }

    // PARTIAL and WRONG both trigger the re-source flow. Rebecca's rule:
    // 100% correct means EXACT. "Right class, not the specific subject" is
    // not good enough. Treat PARTIAL exactly like WRONG below.
    if (v.tier === 'PARTIAL') summary.partial += 1

    // WRONG/PARTIAL — mirror the rejection-with-regen flow.
    const reasonPrefix = v.tier === 'PARTIAL' ? 'relevance=PARTIAL' : 'relevance=WRONG'
    if (!flags.dryRun) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          verificationStatus: 'REJECTED',
          verificationReason: `${reasonPrefix} (${v.confidence.toFixed(2)}): ${v.reason}`,
        },
      })
    }

    if (flags.skipRegen) {
      summary.wrongNoRegen += 1
      console.log(`${tag} WRONG (no regen): ${v.reason}`)
      continue
    }

    const tutorial = media.tutorialsHero[0]
    if (!tutorial) {
      summary.wrongNoRegen += 1
      console.log(`${tag} WRONG: not attached as any tutorial hero, skipping regen`)
      continue
    }

    try {
      const ingredients = await topIngredients(tutorial.id)
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

      const realPhotoRejected = REAL_PHOTO_SOURCES.filter((s) => accumulated.has(s))
      const forcedToFlux = realPhotoRejected.length >= 3
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
          console.log(`${tag} WRONG + cap-fired → PROCEDURAL_CARD (no-ai-fallback)`)
        } else {
          summary.wrongRegenFailed += 1
          console.log(`${tag} WRONG + regen FAILED → PROCEDURAL_CARD`)
        }
        continue
      }

      const img = result.image

      if (flags.dryRun) {
        summary.wrongRegenerated += 1
        console.log(`${tag} WRONG + regen DRY via ${img.source}`)
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
        summary.wrongRegenFailed += 1
        summary.errors.push(`${tutorial.slug}: regen download ${dl.status}`)
        console.warn(`${tag} regen download ${dl.status}`)
        continue
      }
      const buf = Buffer.from(await dl.arrayBuffer())
      const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
      const filename = `${tutorial.slug}-hero-relregen.${ext}`
      const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/relevance-regen' })

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
              `relevance-regen: ${media.source ?? 'unknown'} → ${img.source} ` +
              `(WRONG: ${v.reason || 'unspecified'})`,
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

      summary.wrongRegenerated += 1
      console.log(`${tag} WRONG + regen OK via ${img.source}`)
    } catch (err) {
      if (err instanceof FluxBillingError) {
        writeFluxBillingHalt(err, {
          script: 'apply-relevance-verdicts',
          processed: i,
          total: file.verdicts.length,
          extra: {
            exactSoFar: summary.exact,
            partialSoFar: summary.partial,
            wrongRegenerated: summary.wrongRegenerated,
            wrongRegenFailed: summary.wrongRegenFailed,
          },
        })
        process.exit(2)
      }
      const message = err instanceof Error ? err.message : String(err)
      summary.errors.push(`${tutorial.slug}: ${message}`)
      summary.wrongRegenFailed += 1
      console.error(`${tag} regen ERROR ${message}`)
    }
  }

  if (!flags.dryRun) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.image-relevance-apply',
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
    `image-relevance-apply-${new Date().toISOString().slice(0, 10)}.json`,
  )
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8')

  console.log('\nDONE')
  console.log(`  total:               ${summary.total}`)
  console.log(`  exact:               ${summary.exact}`)
  console.log(`  partial:             ${summary.partial}`)
  console.log(`  wrong (regen):       ${summary.wrongRegenerated}`)
  console.log(`  wrong (failed):      ${summary.wrongRegenFailed}`)
  console.log(`  wrong (skip):        ${summary.wrongNoRegen}`)
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
