/**
 * Crochet pattern photo seed — generates hero + per-round reference
 * photos for every CrochetPattern in the seed list using Flux Schnell
 * via fal.ai.
 *
 * Documented exception to the no-API-spend rule per
 * `apps/web/src/lib/image-sourcing/flux-schnell.ts` — one-shot pre-launch
 * image fill. Each Flux generation costs about £0.002; the granny square
 * needs 4 images (1 hero + 3 rounds) = ~£0.008. The whole 1000-pattern
 * library at full coverage projects to ~£20.
 *
 * Run:
 *   # Preview every prompt without firing fal.ai
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pattern-photos.ts --dry-run
 *
 *   # Actually generate, upload to R2, attach Media + patch rowsStructured
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pattern-photos.ts --confirm
 *
 *   # Only one pattern, skip the rest
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pattern-photos.ts --confirm --slug granny-square-basic-three-round
 *
 * Idempotent — skips rows that already have a photo attached unless
 * `--force` is passed.
 *
 * Env: FAL_KEY (required), CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID +
 *      R2_SECRET_ACCESS_KEY (required, same as upload-tutorial.ts).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import {
  generateWithFluxSchnell,
  FluxBillingError,
} from '../../../apps/web/src/lib/image-sourcing/flux-schnell.js'
import { r2Upload } from '../src/r2.js'

const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const FORCE = process.argv.includes('--force')
const SLUG_ARG_INDEX = process.argv.indexOf('--slug')
const ONLY_SLUG = SLUG_ARG_INDEX >= 0 ? process.argv[SLUG_ARG_INDEX + 1] : null

if (!DRY_RUN && !CONFIRM) {
  console.error(
    '[photos] This script generates real images via fal.ai and costs real money.\n' +
      'Pass --dry-run to preview prompts, or --confirm to actually generate.\n',
  )
  process.exit(2)
}

interface PatternRow {
  section: string
  rowNumber: number
  rowLabel?: string
  isRoundNotRow?: boolean
  instruction: string
  stitchCount?: number
  stitchCountAsCluster?: number
  colourLabel?: string
  colourHex?: string | null
  referencePhotoMediaId?: string | null
  helpNote?: string
  helpTroubleshooterTutorialSlug?: string
}

interface PatternSpec {
  slug: string
  /** Brief, descriptive subject for the hero prompt. */
  heroSubject: string
  /** Default palette description if the user hasn't named one yet. */
  paletteDescription: string
  /** Per-row subject hints. Keyed by `${section}:${rowNumber}`. The
   *  hint describes the WORK so far — what the maker has just finished
   *  when this row's reference photo is taken. */
  rowSubjects: Record<string, string>
}

const PATTERN_SPECS: PatternSpec[] = [
  {
    slug: 'granny-square-basic-three-round',
    heroSubject:
      'Three-round granny square crocheted in cream and sage DK cotton, blocked flat, viewed from directly overhead. The square measures about 10 by 10 cm. Twelve clusters of three trebles around the outside, four open chain-2 corner spaces, eight chain-1 side spaces. Centre is closed sage; outer two rounds are cream.',
    paletteDescription: 'sage centre with cream outer rounds',
    rowSubjects: {
      'Pattern:1':
        'Crochet motif in progress after the first round of a granny square. Sage cotton DK yarn, 4 mm hook resting alongside. The work shows a closed magic ring centre with twelve trebles arranged in four corner clusters of three, separated by chain-2 corner spaces. The piece is small, only about 4 cm across. A tail of sage yarn hangs from the magic-ring centre.',
      'Pattern:2':
        'Crochet motif in progress after the second round of a granny square. Sage centre with one round of cream cotton DK yarn around it. The piece is about 6 cm across. Two clusters of three trebles in each of the four corner spaces, single clusters along each side, chain-2 corners and chain-1 sides visible. 4 mm hook resting alongside on a linen surface.',
      'Pattern:3':
        'Crochet motif finished after the third and final round of a granny square. Sage centre with two rounds of cream cotton DK yarn around it. The piece is about 10 by 10 cm. Twelve clusters of three trebles around the perimeter, two at each corner, one on each side. The square sits blocked flat on a linen surface, a 4 mm hook and a small ball of cream yarn nearby. Natural window light. Magazine-quality slow-living tableau.',
    },
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  if (!DRY_RUN && !process.env.FAL_KEY) {
    console.error('[photos] FAL_KEY missing — set it in .env.credentials and re-run with --confirm.')
    process.exit(2)
  }

  const specs = ONLY_SLUG ? PATTERN_SPECS.filter((p) => p.slug === ONLY_SLUG) : PATTERN_SPECS
  if (specs.length === 0) {
    console.error(`[photos] No pattern specs matched (slug=${ONLY_SLUG ?? '<all>'}).`)
    process.exit(2)
  }

  for (const spec of specs) {
    console.log(`\n[photos] === ${spec.slug} ===`)
    const pattern = await prisma.crochetPattern.findUnique({
      where: { slug: spec.slug },
      select: {
        id: true,
        slug: true,
        name: true,
        thumbnailMediaId: true,
        rowsStructured: true,
      },
    })
    if (!pattern) {
      console.warn(`[photos] SKIP ${spec.slug} — CrochetPattern row not found`)
      continue
    }

    const rows = (pattern.rowsStructured ?? []) as unknown as PatternRow[]
    const work: Array<{ kind: 'hero' | 'row'; rowKey?: string; subject: string }> = []

    // Hero photo.
    if (!pattern.thumbnailMediaId || FORCE) {
      work.push({ kind: 'hero', subject: spec.heroSubject })
    } else {
      console.log(`[photos] HERO already attached (media=${pattern.thumbnailMediaId}). Pass --force to regenerate.`)
    }

    // Per-row reference photos.
    for (const row of rows) {
      const key = `${row.section}:${row.rowNumber}`
      const subject = spec.rowSubjects[key]
      if (!subject) {
        console.log(`[photos] NO PROMPT for row ${key} — skip`)
        continue
      }
      if (row.referencePhotoMediaId && !FORCE) {
        console.log(`[photos] ROW ${key} already has reference photo. Pass --force to regenerate.`)
        continue
      }
      work.push({ kind: 'row', rowKey: key, subject })
    }

    if (work.length === 0) {
      console.log(`[photos] Nothing to do for ${spec.slug}.`)
      continue
    }

    // ── DRY RUN ──
    if (DRY_RUN) {
      console.log(`[photos] DRY RUN — ${work.length} prompts that would fire:`)
      for (const w of work) {
        console.log(`\n  --- ${w.kind === 'hero' ? 'HERO' : `ROW ${w.rowKey}`} ---`)
        console.log(`  Prompt input:\n    ${w.subject}`)
      }
      continue
    }

    // ── REAL GEN ──
    const updates: Array<{ rowKey: string; mediaId: string }> = []
    let newThumbnailMediaId: string | null = null

    for (const w of work) {
      console.log(`\n[photos] Generating ${w.kind === 'hero' ? 'hero' : `row ${w.rowKey}`}…`)
      try {
        const img = await generateWithFluxSchnell({
          title: pattern.name,
          category: 'crochet',
          subCategory: null,
          ingredients: [],
          pattern: {
            kind: 'crochet',
            paletteNames: [spec.paletteDescription],
            subjectHint: w.subject,
          },
        })
        if (!img) {
          console.error(`[photos] FAIL ${w.kind}/${w.rowKey ?? 'hero'} — Flux returned null`)
          continue
        }

        const dl = await fetch(img.url, {
          headers: {
            'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
            Accept: 'image/*,*/*;q=0.8',
          },
        })
        if (!dl.ok) {
          console.error(`[photos] DOWNLOAD FAIL ${dl.status}`)
          continue
        }
        const buf = Buffer.from(await dl.arrayBuffer())
        const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
        const filename = `${pattern.slug}-${w.kind === 'hero' ? 'hero' : `row-${w.rowKey?.replace(/[^a-z0-9]+/gi, '-')}`}.${ext}`
        const { key } = await r2Upload(buf, mime, {
          filename,
          prefix: 'crochet-patterns',
        })

        const media = await prisma.media.create({
          data: {
            r2Key: key,
            type: 'ILLUSTRATION',
            status: 'READY',
            filename,
            mimeType: mime,
            width: img.width,
            height: img.height,
            bytes: buf.length,
            source: 'flux-schnell',
            sourceUrl: img.pageUrl,
            licenceCode: 'PROPRIETARY',
            requiresAttribution: false,
            verificationStatus: 'UNVERIFIED',
          },
        })

        if (w.kind === 'hero') {
          newThumbnailMediaId = media.id
          console.log(`[photos] HERO uploaded (media=${media.id})`)
        } else if (w.rowKey) {
          updates.push({ rowKey: w.rowKey, mediaId: media.id })
          console.log(`[photos] ROW ${w.rowKey} uploaded (media=${media.id})`)
        }
      } catch (err) {
        if (err instanceof FluxBillingError) {
          console.error('[photos] Fal billing exhausted — top up and re-run')
          process.exit(2)
        }
        console.error(`[photos] FAIL ${w.kind}/${w.rowKey ?? 'hero'}:`, err)
      }
    }

    // Patch rowsStructured with the new referencePhotoMediaIds.
    if (updates.length > 0) {
      const patched = rows.map((row) => {
        const key = `${row.section}:${row.rowNumber}`
        const match = updates.find((u) => u.rowKey === key)
        if (match) return { ...row, referencePhotoMediaId: match.mediaId }
        return row
      })
      await prisma.crochetPattern.update({
        where: { id: pattern.id },
        data: {
          rowsStructured: patched as unknown as object,
          ...(newThumbnailMediaId ? { thumbnailMediaId: newThumbnailMediaId } : {}),
        },
      })
      console.log(`[photos] Patched ${updates.length} row reference(s) on ${spec.slug}`)
    } else if (newThumbnailMediaId) {
      await prisma.crochetPattern.update({
        where: { id: pattern.id },
        data: { thumbnailMediaId: newThumbnailMediaId },
      })
      console.log(`[photos] Patched hero thumbnail on ${spec.slug}`)
    }
  }

  console.log('\n[photos] Done.')
}

function extFromContentType(contentType: string | null): { ext: string; mime: string } {
  if (!contentType) return { ext: 'jpg', mime: 'image/jpeg' }
  if (contentType.includes('webp')) return { ext: 'webp', mime: 'image/webp' }
  if (contentType.includes('png')) return { ext: 'png', mime: 'image/png' }
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return { ext: 'jpg', mime: 'image/jpeg' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

main()
  .catch((err) => {
    console.error('[photos] Unhandled error:', err)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/index.js')
    await prisma.$disconnect()
  })
