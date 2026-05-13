/**
 * Programmatic tutorial upload.
 *
 * Run:
 *   pnpm --filter "@homemade/db" run tutorial:upload <path-to-input.json>
 *   pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts <path-to-input.json>
 *
 * Or from the package directory:
 *   pnpm exec tsx scripts/upload-tutorial.ts scripts/anchor-tutorials/bechamel.json
 *
 * Reads DATABASE_URL + CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID +
 * R2_SECRET_ACCESS_KEY from the environment, falling back to
 * `.env.credentials` at the repo root.
 *
 * Companion scripts:
 *   - seed-cooking-taxonomy.ts  (creates Cooking + Sauces + Preserves once)
 *   - verify-tutorial-bodies.ts (walks bodies and checks node + mark types)
 *
 * The input file is a JSON document of shape `TutorialUploadInput` (see
 * `./upload-tutorial-types.ts`). The script will:
 *
 *   1. Resolve the author (rebecca@homemade.education) — fail if absent.
 *   2. Resolve the Category by slug — fail if absent. NEVER creates a Category.
 *   3. Resolve the SubCategory by slug (within the chosen Category) — fail
 *      if a slug is given that doesn't exist. SubCategory is optional.
 *   4. For every glossary `slug` referenced in `glossaryTerms`, look it up by
 *      slug. Create any that are missing using the definition supplied
 *      alongside (so the upload is self-describing and idempotent).
 *   5. If `hero.localPath` is set and the input has no `hero.mediaId`, push the
 *      file to Cloudflare R2 and create a Media row in READY state, then use
 *      the new media as hero.
 *   6. Insert the Tutorial as DRAFT (or update an existing row with the same
 *      slug — idempotent re-run).
 *   7. Snapshot a TutorialVersion to match the admin's lifecycle pattern.
 *
 * Mirrors `apps/web/src/app/admin/tutorials/actions.ts` (createTutorial /
 * updateTutorial) and `apps/web/src/app/admin/media/actions.ts` (registerUpload)
 * so the resulting rows look identical to admin-authored ones.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Walk up from this file looking for .env.credentials. Covers both the
// main-repo layout (packages/db/scripts → 3 levels to repo root) and the
// worktree layout (.claude/worktrees/<name>/packages/db/scripts → 6 levels
// up to the main repo root, since the file lives there, not in the worktree).
// `override: true` because some shells (e.g. Claude Code's sandbox) pre-set
// keys to empty values and dotenv won't replace existing env vars otherwise.
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

// Imports that touch process.env (Prisma client) are loaded lazily inside main()
// after env is loaded.
import type { Prisma } from '@prisma/client'

import type { TutorialUploadInput, UploadResult } from './upload-tutorial-types.js'
import { validateInput } from './upload-tutorial-types.js'
import { exitCodeFor, formatReport, runVoiceCheck } from './voice-check-lib.js'

type PrismaModule = typeof import('../src/index.js')
let prismaMod: PrismaModule | null = null
async function getPrisma(): Promise<PrismaModule> {
  if (!prismaMod) prismaMod = await import('../src/index.js')
  return prismaMod
}

// PNG dimensions from the 16-byte IHDR header. Avoids pulling in sharp / image-size.
function readPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null
  // PNG signature is bytes 0..7, IHDR starts at byte 8 with length(4) + 'IHDR'(4)
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return { width, height }
}

// ─── Main upload flow ────────────────────────────────────────────────────────

async function uploadTutorial(input: TutorialUploadInput, inputFilePath: string): Promise<UploadResult> {
  validateInput(input)

  const { prisma, MediaStatus, MediaType, TutorialStatus, SourceType, Difficulty, Season } =
    await getPrisma()

  // 1. Author.
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
  })
  if (!author) {
    throw new Error(
      "Author user 'rebecca@homemade.education' not found. Sign in once at /admin to provision the row, then re-run.",
    )
  }

  // 2. Category by slug.
  const category = await prisma.category.findUnique({ where: { slug: input.categorySlug } })
  if (!category) {
    throw new Error(
      `Category with slug "${input.categorySlug}" not found. Create it in /admin/categories first.`,
    )
  }

  // 3. Optional sub-category by slug (within this category's id).
  let subCategoryId: string | null = null
  if (input.subCategorySlug) {
    const sub = await prisma.subCategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: category.id,
          slug: input.subCategorySlug,
        },
      },
    })
    if (!sub) {
      throw new Error(
        `Sub-category "${input.subCategorySlug}" not found under category "${input.categorySlug}". Create it in /admin/sub-categories first, or omit the field.`,
      )
    }
    subCategoryId = sub.id
  }

  // 4. Glossary terms — create any that are missing.
  const createdGlossary: { slug: string; term: string; id: string }[] = []
  const glossaryIdBySlug = new Map<string, string>()
  for (const g of input.glossaryTerms ?? []) {
    const existing = await prisma.glossaryTerm.findUnique({ where: { slug: g.slug } })
    if (existing) {
      glossaryIdBySlug.set(g.slug, existing.id)
      continue
    }
    const created = await prisma.glossaryTerm.create({
      data: {
        slug: g.slug,
        term: g.term,
        definition: g.definition,
        categoryId: category.id,
      },
    })
    glossaryIdBySlug.set(g.slug, created.id)
    createdGlossary.push({ slug: created.slug, term: created.term, id: created.id })
  }

  // 5. Hero image — upload if a localPath is given.
  let heroMediaId: string | null = input.hero?.mediaId ?? null
  let heroR2Key: string | null = null

  if (!heroMediaId && input.hero?.localPath) {
    const heroPath = isAbsolute(input.hero.localPath)
      ? input.hero.localPath
      : resolve(dirname(inputFilePath), input.hero.localPath)

    if (!existsSync(heroPath)) {
      throw new Error(`Hero image not found at ${heroPath}. Check the localPath field in the input JSON.`)
    }

    const fileBytes = readFileSync(heroPath)
    const filename = basename(heroPath)
    const lowered = filename.toLowerCase()
    const mimeType = lowered.endsWith('.png')
      ? 'image/png'
      : lowered.endsWith('.jpg') || lowered.endsWith('.jpeg')
        ? 'image/jpeg'
        : lowered.endsWith('.webp')
          ? 'image/webp'
          : 'application/octet-stream'

    const probe = mimeType === 'image/png' ? readPngDimensions(fileBytes) : null

    // Idempotency: re-running on an existing Tutorial slug + same hero filename
    // would re-upload the image every time. Cheap dedup: if a READY Media row
    // already exists for this exact filename + bytes, reuse it.
    const existingByFilename = await prisma.media.findFirst({
      where: {
        filename,
        bytes: fileBytes.length,
        status: { in: [MediaStatus.READY, MediaStatus.UPLOADING] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingByFilename) {
      heroMediaId = existingByFilename.id
      heroR2Key = existingByFilename.r2Key
      console.log(`  [hero] reusing existing Media ${existingByFilename.id} (filename match)`)
    } else {
      console.log('  [hero] pushing to Cloudflare R2')
      const { r2Upload } = await import('../src/r2.js')
      const { key } = await r2Upload(fileBytes, mimeType, {
        filename,
        prefix: 'tutorials',
      })

      const media = await prisma.media.create({
        data: {
          r2Key: key,
          type: MediaType.ILLUSTRATION,
          status: MediaStatus.READY,
          filename,
          mimeType,
          width: probe?.width ?? null,
          height: probe?.height ?? null,
          bytes: fileBytes.length,
          alt: input.hero?.alt ?? null,
          caption: input.hero?.caption ?? null,
          attribution: input.hero?.attribution ?? null,
        },
      })
      heroMediaId = media.id
      heroR2Key = key
      console.log(`  [hero] created Media ${media.id} (r2Key=${key}, status=READY)`)
    }
  }

  // Resolve glossary IDs inside the body's glossaryTooltip marks. Authors
  // reference terms by slug for portability; we swap in IDs here.
  const body = resolveGlossarySlugs(input.body, glossaryIdBySlug) as Prisma.InputJsonValue

  // 6. Upsert the Tutorial.
  const existingTutorial = await prisma.tutorial.findUnique({ where: { slug: input.slug } })

  const sharedData = {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle ?? null,
    excerpt: input.excerpt ?? null,
    categoryId: category.id,
    subCategoryId,
    difficulty: input.difficulty ?? Difficulty.BEGINNER,
    season: input.season ?? null,
    timeMinutes: input.timeMinutes ?? null,
    sourceType: input.sourceType ?? SourceType.PUBLIC_DOMAIN,
    sourceNotes: input.sourceNotes ?? null,
    heroMediaId,
    body,
  }

  let tutorialId: string
  let mode: 'created' | 'updated'

  if (existingTutorial) {
    // Snapshot the existing state before overwriting (matches admin updateTutorial).
    await prisma.tutorialVersion.create({
      data: {
        tutorialId: existingTutorial.id,
        title: existingTutorial.title,
        subtitle: existingTutorial.subtitle,
        excerpt: existingTutorial.excerpt,
        body: existingTutorial.body as Prisma.InputJsonValue,
        status: existingTutorial.status,
        authorId: author.id,
        changeNote: 'Script re-upload',
      },
    })

    const updated = await prisma.tutorial.update({
      where: { id: existingTutorial.id },
      data: sharedData,
    })
    tutorialId = updated.id
    mode = 'updated'
  } else {
    const created = await prisma.tutorial.create({
      data: {
        ...sharedData,
        status: TutorialStatus.DRAFT,
        authorId: author.id,
      },
    })

    // 7. First-save snapshot.
    await prisma.tutorialVersion.create({
      data: {
        tutorialId: created.id,
        title: created.title,
        subtitle: created.subtitle,
        excerpt: created.excerpt,
        body: created.body as Prisma.InputJsonValue,
        status: created.status,
        authorId: author.id,
        changeNote: 'Created via script',
      },
    })

    tutorialId = created.id
    mode = 'created'
  }

  return {
    mode,
    tutorialId,
    slug: input.slug,
    categorySlug: category.slug,
    subCategorySlug: input.subCategorySlug ?? null,
    heroMediaId,
    heroR2Key,
    createdGlossary,
  }
}

interface NodeShape {
  type: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: NodeShape[]
  text?: string
}

/**
 * Walk the TipTap document and swap `glossaryTooltip` mark `termSlug` attrs
 * for `termId` attrs (the renderer + Prisma side both speak in IDs).
 *
 * Accepts both shapes — if the author writes `termId` directly that's fine too.
 */
function resolveGlossarySlugs(
  doc: unknown,
  slugToId: Map<string, string>,
): unknown {
  if (!doc || typeof doc !== 'object') return doc
  const node = doc as NodeShape

  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark.type === 'glossaryTooltip' && mark.attrs) {
        const attrs = mark.attrs
        const slug = typeof attrs.termSlug === 'string' ? attrs.termSlug : null
        if (slug) {
          const id = slugToId.get(slug)
          if (!id) {
            throw new Error(
              `Body references glossary term slug "${slug}" but no matching term was declared in glossaryTerms[].`,
            )
          }
          attrs.termId = id
          delete attrs.termSlug
        }
      }
    }
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      resolveGlossarySlugs(child, slugToId)
    }
  }
  return doc
}

// ─── Entrypoint ──────────────────────────────────────────────────────────────

interface UploadCliFlags {
  inputPath: string
  skipVoiceCheck: boolean
}

function parseUploadArgs(argv: string[]): UploadCliFlags | null {
  let inputPath: string | null = null
  let skipVoiceCheck = false
  for (const arg of argv) {
    if (arg === '--skip-voice-check') skipVoiceCheck = true
    else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`)
      return null
    } else if (!inputPath) {
      inputPath = arg
    }
  }
  if (!inputPath) return null
  return { inputPath, skipVoiceCheck }
}

async function main(): Promise<void> {
  const flags = parseUploadArgs(process.argv.slice(2))
  if (!flags) {
    console.error(
      'Usage: pnpm exec tsx scripts/upload-tutorial.ts <path-to-input.json> [--skip-voice-check]',
    )
    process.exit(1)
  }

  const inputPath = isAbsolute(flags.inputPath)
    ? flags.inputPath
    : resolve(process.cwd(), flags.inputPath)
  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`)
    process.exit(1)
  }

  const raw = readFileSync(inputPath, 'utf8')
  let input: TutorialUploadInput
  try {
    input = JSON.parse(raw) as TutorialUploadInput
  } catch (err) {
    console.error(`Input file is not valid JSON: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }

  console.log(`[upload-tutorial] ${inputPath}`)
  console.log(`  slug: ${input.slug}`)
  console.log(`  title: ${input.title}`)

  // Voice-check pass — deterministic gate. Block on errors unless the admin
  // escape hatch is set. The bot-as-editor rewrite happens earlier in the
  // worker session that drafts the tutorial (see docs/voice-editor-prompt.md);
  // by the time we run, the draft is already past that pass.
  if (!flags.skipVoiceCheck) {
    const report = runVoiceCheck(input)
    const code = exitCodeFor(report)
    console.log('  [voice-check]')
    for (const line of formatReport(report).split('\n')) {
      console.log(`    ${line}`)
    }
    if (code === 2) {
      console.error('\n[upload-tutorial] BLOCKED — voice-check reported errors. Fix the draft or re-run with --skip-voice-check (admin escape hatch).')
      process.exit(2)
    }
  } else {
    console.warn(
      '  [voice-check] skipped (--skip-voice-check). Admin escape hatch only — voice rules are NOT enforced on this upload.',
    )
  }

  const result = await uploadTutorial(input, inputPath)

  console.log(`\n[upload-tutorial] ${result.mode.toUpperCase()}`)
  console.log(`  Tutorial id: ${result.tutorialId}`)
  console.log(`  slug: ${result.slug}`)
  console.log(`  category: ${result.categorySlug}${result.subCategorySlug ? ` / ${result.subCategorySlug}` : ''}`)
  if (result.heroMediaId) {
    console.log(`  hero Media id: ${result.heroMediaId}${result.heroR2Key ? ` (r2Key=${result.heroR2Key})` : ''}`)
  }
  if (result.createdGlossary.length > 0) {
    console.log(`  glossary created (${result.createdGlossary.length}):`)
    for (const g of result.createdGlossary) {
      console.log(`    - ${g.slug} (id=${g.id}) "${g.term}"`)
    }
  } else if ((input.glossaryTerms ?? []).length > 0) {
    console.log(`  glossary: all ${input.glossaryTerms!.length} terms already existed`)
  }

  const { prisma } = await getPrisma()
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error('[upload-tutorial] failed:', err)
  try {
    if (prismaMod) await prismaMod.prisma.$disconnect()
  } catch {
    // ignore
  }
  process.exit(1)
})
