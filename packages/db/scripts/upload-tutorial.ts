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
 *   - seed-ingredients.ts       (master Ingredient table)
 *   - seed-tools.ts             (master Tool table)
 *   - voice-check.ts            (CLI gate)
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
 *   5. Resolve every `ingredientSlug` inside the body's `ingredientsList`
 *      blocks against the master Ingredient table. Fail loudly if any slug
 *      is missing — the master tables are the source of truth, and a
 *      typo there would silently strip the row from the join table sync.
 *   6. Resolve every `recipeTools[].slug` against the master Tool table.
 *      Fail loudly on a missing slug.
 *   7. If `hero.localPath` is set and the input has no `hero.mediaId`, push
 *      the file to Cloudflare R2 and create a Media row in READY state,
 *      then use the new media as hero.
 *   8. Insert the Tutorial as DRAFT (or update an existing row with the same
 *      slug — idempotent re-run). Sets `type` from the input (default RECIPE)
 *      and copies the recipe metadata fields over when present. Computes
 *      `totalMinutes` from prep + cook + resting + chilling if not given.
 *      Pass `--status PUBLISHED` to land the row live (also stamps
 *      `publishedAt = now()`); this is the bulk auto-publish path used by
 *      Phase 8 Step 12 workers. Default `--status DRAFT` is the editorial
 *      pilot path (preserves existing behaviour).
 *   9. Sync RecipeIngredient join rows from the body's ingredientsList blocks
 *      (delete-then-insert in a transaction). Sync RecipeTool join rows from
 *      the top-level recipeTools array the same way.
 *  10. Snapshot a TutorialVersion to match the admin's lifecycle pattern.
 *
 * Mirrors `apps/web/src/app/admin/tutorials/actions.ts` (createTutorial /
 * updateTutorial) so the resulting rows look identical to admin-authored
 * ones — including the same `RecipeIngredient` rebuild logic from
 * `apps/web/src/lib/recipe-ingredients-sync.ts`.
 */

import { config as loadEnv } from 'dotenv'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
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

import type {
  ProjectScheduleStep,
  RecipeToolRef,
  TutorialType,
  TutorialUploadInput,
  UploadResult,
} from './upload-tutorial-types.js'
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

interface IngredientResolution {
  id: string
  slug: string
  name: string
  defaultUnit: string
}

interface ToolResolution {
  id: string
  slug: string
  name: string
}

type DesiredStatus = 'DRAFT' | 'PUBLISHED'

async function uploadTutorial(
  input: TutorialUploadInput,
  inputFilePath: string,
  desiredStatus: DesiredStatus = 'DRAFT',
): Promise<UploadResult> {
  validateInput(input)

  const {
    prisma,
    MediaStatus,
    MediaType,
    TutorialStatus,
    SourceType,
    Difficulty,
    maybeFlipCategoryVisibility,
  } = await getPrisma()

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

  // 5. Resolve ingredient slugs in the body's ingredientsList blocks.
  const ingredientSlugs = collectIngredientSlugs(input.body)
  const ingredientBySlug = new Map<string, IngredientResolution>()
  if (ingredientSlugs.size > 0) {
    const rows = await prisma.ingredient.findMany({
      where: { slug: { in: Array.from(ingredientSlugs) } },
      select: { id: true, slug: true, name: true, defaultUnit: true },
    })
    for (const row of rows) {
      ingredientBySlug.set(row.slug, row)
    }
    const missing = Array.from(ingredientSlugs).filter((s) => !ingredientBySlug.has(s))
    if (missing.length > 0) {
      throw new Error(
        `Body references ingredient slugs not in the master table: ${missing.join(', ')}. ` +
          `Add them to packages/db/scripts/data/ingredients.ts and re-seed, or fix the body.`,
      )
    }
  }

  // 6. Resolve tool slugs from the top-level recipeTools array.
  const toolSlugs = new Set((input.recipeTools ?? []).map((t) => t.slug))
  const toolBySlug = new Map<string, ToolResolution>()
  if (toolSlugs.size > 0) {
    const rows = await prisma.tool.findMany({
      where: { slug: { in: Array.from(toolSlugs) } },
      select: { id: true, slug: true, name: true },
    })
    for (const row of rows) toolBySlug.set(row.slug, row)
    const missing = Array.from(toolSlugs).filter((s) => !toolBySlug.has(s))
    if (missing.length > 0) {
      throw new Error(
        `recipeTools references slugs not in the master table: ${missing.join(', ')}. ` +
          `Add them to packages/db/scripts/data/tools.ts and re-seed, or fix the input.`,
      )
    }
  }

  // 7. Optional leftover-bridge target.
  let leftoverTutorialId: string | null = null
  if (input.recipe?.leftoverTutorialSlug) {
    const target = await prisma.tutorial.findUnique({
      where: { slug: input.recipe.leftoverTutorialSlug },
      select: { id: true },
    })
    if (!target) {
      throw new Error(
        `recipe.leftoverTutorialSlug "${input.recipe.leftoverTutorialSlug}" not found. ` +
          `Either upload that recipe first or clear the field.`,
      )
    }
    leftoverTutorialId = target.id
  }

  // 8. Hero image — upload if a localPath is given.
  let heroMediaId: string | null = input.hero?.mediaId ?? null
  let heroR2Key: string | null = null

  if (!heroMediaId && (input.hero?.localPath || input.hero?.remoteUrl)) {
    let fileBytes: Buffer
    let filename: string
    let mimeType: string

    if (input.hero?.localPath) {
      const heroPath = isAbsolute(input.hero.localPath)
        ? input.hero.localPath
        : resolve(dirname(inputFilePath), input.hero.localPath)
      if (!existsSync(heroPath)) {
        throw new Error(`Hero image not found at ${heroPath}. Check the localPath field in the input JSON.`)
      }
      fileBytes = readFileSync(heroPath)
      filename = basename(heroPath)
      const lowered = filename.toLowerCase()
      mimeType = lowered.endsWith('.png')
        ? 'image/png'
        : lowered.endsWith('.jpg') || lowered.endsWith('.jpeg')
          ? 'image/jpeg'
          : lowered.endsWith('.webp')
            ? 'image/webp'
            : 'application/octet-stream'
    } else {
      // Remote URL pathway — fetch the bytes from the upstream image source.
      const remoteUrl = input.hero!.remoteUrl!
      console.log(`  [hero] fetching remote image: ${remoteUrl}`)
      const res = await fetch(remoteUrl)
      if (!res.ok) {
        throw new Error(`Hero remote fetch failed (${res.status}) for ${remoteUrl}`)
      }
      const buf = await res.arrayBuffer()
      fileBytes = Buffer.from(buf)
      mimeType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
      const extFromMime =
        mimeType === 'image/png' ? '.png' :
        mimeType === 'image/webp' ? '.webp' :
        mimeType === 'image/jpeg' ? '.jpg' : '.bin'
      filename = `${input.slug}-hero${extFromMime}`
    }

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
          source: input.hero?.source ?? null,
          sourceUrl: input.hero?.sourceUrl ?? null,
          creatorName: input.hero?.creatorName ?? null,
          licenceCode: input.hero?.licenceCode ?? null,
          licenceUrl: input.hero?.licenceUrl ?? null,
          requiresAttribution: input.hero?.requiresAttribution ?? false,
        },
      })
      heroMediaId = media.id
      heroR2Key = key
      console.log(`  [hero] created Media ${media.id} (r2Key=${key}, status=READY)`)
    }
  }

  // 9. Resolve glossary IDs and ingredient IDs inside the body.
  // Resolve subTutorialCard `tutorialSlug` attrs to `tutorialId` against the
  // published Tutorial table. Slugs that don't resolve get logged to
  // docs/missing-techniques.md and stripped from the block (the public
  // renderer handles absent ids gracefully).
  const subTutorialSlugs = collectSubTutorialSlugs(input.body)
  const subTutorialBySlug = new Map<string, string>()
  if (subTutorialSlugs.size > 0) {
    const rows = await prisma.tutorial.findMany({
      where: { slug: { in: [...subTutorialSlugs] }, status: 'PUBLISHED' },
      select: { id: true, slug: true },
    })
    for (const row of rows) subTutorialBySlug.set(row.slug, row.id)
    const missing = [...subTutorialSlugs].filter((s) => !subTutorialBySlug.has(s))
    if (missing.length > 0) {
      logMissingTechniques(missing, input.slug)
      console.log(
        `  [refs] ${missing.length} subTutorial slug${missing.length === 1 ? '' : 's'} unresolved — logged to docs/missing-techniques.md`,
      )
    }
  }

  const body = resolveBodyReferences(
    input.body,
    glossaryIdBySlug,
    ingredientBySlug,
    subTutorialBySlug,
  ) as Prisma.InputJsonValue

  // 10. Tutorial type + recipe metadata.
  const tutorialType: TutorialType = input.type ?? 'RECIPE'
  const recipe = input.recipe ?? {}
  const practice = input.practice ?? null

  // Compute totalMinutes if not given. Falls back to the explicit
  // `timeMinutes` if a recipe author already set that.
  const computedTotal =
    (recipe.prepMinutes ?? 0) +
    (recipe.cookMinutes ?? 0) +
    (recipe.restingMinutes ?? 0) +
    (recipe.chillingMinutes ?? 0)
  const totalMinutes =
    recipe.totalMinutes ??
    (computedTotal > 0 ? computedTotal : null)
  const timeMinutes = input.timeMinutes ?? totalMinutes

  // 11. Upsert the Tutorial.
  const existingTutorial = await prisma.tutorial.findUnique({ where: { slug: input.slug } })

  // Baking metadata. Null block on cooking recipes / mindset / techniques;
  // populated for baking recipes per `docs/baking-author.md`.
  const baking = recipe.baking ?? null

  const sharedData = {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle ?? null,
    excerpt: input.excerpt ?? null,
    type: tutorialType,
    categoryId: category.id,
    subCategoryId,
    difficulty: input.difficulty ?? Difficulty.BEGINNER,
    season: input.season ?? null,
    timeMinutes,
    sourceType: input.sourceType ?? SourceType.PUBLIC_DOMAIN,
    sourceNotes: input.sourceNotes ?? null,
    heroMediaId,
    body,
    // Recipe metadata. Null on TECHNIQUE rows except for `foundational`.
    servings: recipe.servings ?? null,
    yieldDescription: recipe.yieldDescription ?? null,
    prepMinutes: recipe.prepMinutes ?? null,
    cookMinutes: recipe.cookMinutes ?? null,
    restingMinutes: recipe.restingMinutes ?? null,
    chillingMinutes: recipe.chillingMinutes ?? null,
    totalMinutes,
    scalable: recipe.scalable ?? true,
    freezable: recipe.freezable ?? false,
    freezeNotes: recipe.freezeNotes ?? null,
    batchable: recipe.batchable ?? false,
    batchNotes: recipe.batchNotes ?? null,
    makeAheadNotes: recipe.makeAheadNotes ?? null,
    dietaryFlags: recipe.dietaryFlags ?? [],
    cuisine: recipe.cuisine ?? null,
    mealType: recipe.mealType ?? null,
    mood: recipe.mood ?? [],
    temperatureCelsius: recipe.temperatureCelsius ?? null,
    temperatureNote: recipe.temperatureNote ?? null,
    nutritionalInfoPerServing:
      (recipe.nutritionalInfoPerServing as Prisma.InputJsonValue | undefined) ?? undefined,
    foundational: recipe.foundational ?? false,
    leftoverTutorialId,
    // Mindset practice metadata (Phase 8 Step 13). Null on RECIPE / TECHNIQUE rows.
    practiceType: practice?.practiceType ?? null,
    practiceTargets: practice?.practiceTargets ?? [],
    timeBand: practice?.timeBand ?? null,
    bestTime: practice?.bestTime ?? null,
    practiceDepth: practice?.practiceDepth ?? null,
    whenToUse: practice?.whenToUse ?? null,
    whenNotToUse: practice?.whenNotToUse ?? null,
    alternativePracticeIds: practice?.alternativePracticeIds ?? [],
    // Baking metadata (Phase 8 Baking pipeline scaffold). Null on rows that
    // aren't baking recipes; populated per sub-category for the ones that are.
    flourWeightGrams: baking?.flourWeightGrams ?? null,
    hydrationPercent: baking?.hydrationPercent ?? null,
    saltPercent: baking?.saltPercent ?? null,
    yeastPercent: baking?.yeastPercent ?? null,
    levainPercent: baking?.levainPercent ?? null,
    bulkFermentMinutes: baking?.bulkFermentMinutes ?? null,
    proofMinutes: baking?.proofMinutes ?? null,
    retardingMinutes: baking?.retardingMinutes ?? null,
    levainBuildMinutes: baking?.levainBuildMinutes ?? null,
    laminationFolds: baking?.laminationFolds ?? null,
    laminationRests: baking?.laminationRests ?? null,
    bakeTemperatureCelsius: baking?.bakeTemperatureCelsius ?? null,
    bakeTemperatureNote: baking?.bakeTemperatureNote ?? null,
    steamMethod: baking?.steamMethod ?? null,
    decoratingTechnique: baking?.decoratingTechnique ?? null,
    preFermentType: baking?.preFermentType ?? null,
  }

  // Publish intent. --status PUBLISHED stamps publishedAt now and flips the
  // row to PUBLISHED on both create and update (bulk auto-publish path from
  // Phase 8 Step 12). --status DRAFT keeps the existing behaviour: new rows
  // land as DRAFT with publishedAt=null; existing rows keep their current
  // status / publishedAt untouched.
  const publishUpdate =
    desiredStatus === 'PUBLISHED'
      ? { status: TutorialStatus.PUBLISHED, publishedAt: new Date() }
      : null

  let tutorialId: string
  let mode: 'created' | 'updated'
  let finalStatus: UploadResult['status']
  let finalPublishedAt: Date | null

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
      data: {
        ...sharedData,
        ...(publishUpdate ?? {}),
      },
    })
    tutorialId = updated.id
    mode = 'updated'
    finalStatus = updated.status as UploadResult['status']
    finalPublishedAt = updated.publishedAt
  } else {
    const created = await prisma.tutorial.create({
      data: {
        ...sharedData,
        status: publishUpdate?.status ?? TutorialStatus.DRAFT,
        publishedAt: publishUpdate?.publishedAt ?? null,
        authorId: author.id,
      },
    })
    finalStatus = created.status as UploadResult['status']
    finalPublishedAt = created.publishedAt

    // First-save snapshot.
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

  // 12. Sync RecipeIngredient join rows from the body's ingredientsList blocks.
  const recipeIngredientRows = await syncRecipeIngredients(
    tutorialId,
    body,
    ingredientBySlug,
    prisma,
  )

  // 13. Sync RecipeTool join rows from the top-level recipeTools array.
  const recipeToolRows = await syncRecipeTools(
    tutorialId,
    input.recipeTools ?? [],
    toolBySlug,
    prisma,
  )

  // 14. Sync ProjectSchedule rows. Idempotent — delete-then-insert in a
  // transaction. Authors omit this on single-day recipes / techniques; only
  // long-arc tutorials carry one.
  const projectScheduleRows = await syncProjectSchedule(
    tutorialId,
    input.projectSchedule ?? [],
    prisma,
  )

  // 15. Category public-visibility auto-flip. Cheap idempotent check — only
  // fires on PUBLISHED rows, no-op once the category is already visible.
  if (finalStatus === 'PUBLISHED') {
    await maybeFlipCategoryVisibility(prisma, category.id)
  }

  return {
    mode,
    tutorialId,
    slug: input.slug,
    type: tutorialType,
    status: finalStatus,
    publishedAt: finalPublishedAt ? finalPublishedAt.toISOString() : null,
    categorySlug: category.slug,
    subCategorySlug: input.subCategorySlug ?? null,
    heroMediaId,
    heroR2Key,
    createdGlossary,
    recipeIngredientRows,
    recipeToolRows,
    projectScheduleRows,
  }
}

// ─── Body walking helpers ────────────────────────────────────────────────────

interface NodeShape {
  type: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: NodeShape[]
  text?: string
}

/**
 * Walk the body, gathering every `ingredientSlug` referenced in
 * `ingredientsList` blocks. The author writes slugs (portable); the upload
 * script resolves them to IDs once.
 */
function collectIngredientSlugs(doc: unknown): Set<string> {
  const out = new Set<string>()
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const n = node as NodeShape
    if (n.type === 'ingredientsList' && n.attrs && typeof n.attrs === 'object') {
      const items = Array.isArray((n.attrs as Record<string, unknown>).items)
        ? ((n.attrs as Record<string, unknown>).items as unknown[])
        : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const row = raw as Record<string, unknown>
        const slug = typeof row.ingredientSlug === 'string' ? row.ingredientSlug.trim() : ''
        if (slug) out.add(slug)
      }
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
    }
  }
  walk(doc)
  return out
}

/**
 * Walk the TipTap document and:
 *   - Swap `glossaryTooltip` mark `termSlug` attrs for `termId`.
 *   - Replace each `ingredientsList` item's `ingredientSlug` with
 *     `ingredientId` and back-fill `name` + `unit` from the master row
 *     so the public renderer has everything it needs without an extra join.
 *
 * Accepts pre-resolved shapes too — if the author writes `termId` or
 * `ingredientId` directly, that's fine.
 */
function resolveBodyReferences(
  doc: unknown,
  slugToGlossaryId: Map<string, string>,
  ingredientBySlug: Map<string, IngredientResolution>,
  subTutorialBySlug?: Map<string, string>,
): unknown {
  if (!doc || typeof doc !== 'object') return doc
  const node = doc as NodeShape

  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark.type === 'glossaryTooltip' && mark.attrs) {
        const attrs = mark.attrs
        const slug = typeof attrs.termSlug === 'string' ? attrs.termSlug : null
        if (slug) {
          const id = slugToGlossaryId.get(slug)
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

  if (
    node.type === 'subTutorialCard' &&
    node.attrs &&
    typeof node.attrs === 'object' &&
    subTutorialBySlug
  ) {
    const attrs = node.attrs as Record<string, unknown>
    const slug = typeof attrs.tutorialSlug === 'string' ? attrs.tutorialSlug : null
    if (slug) {
      const id = subTutorialBySlug.get(slug)
      if (id) {
        attrs.tutorialId = id
      } else {
        // Unresolved — strip the slug so the renderer treats it as missing.
        delete attrs.tutorialId
      }
      delete attrs.tutorialSlug
    }
  }

  if (node.type === 'ingredientsList' && node.attrs && typeof node.attrs === 'object') {
    const attrs = node.attrs as Record<string, unknown>
    const items = Array.isArray(attrs.items) ? (attrs.items as unknown[]) : []
    attrs.items = items.map((raw) => {
      if (!raw || typeof raw !== 'object') return raw
      const row = { ...(raw as Record<string, unknown>) }
      const slug = typeof row.ingredientSlug === 'string' ? row.ingredientSlug.trim() : ''
      if (slug) {
        const resolved = ingredientBySlug.get(slug)
        if (!resolved) {
          throw new Error(
            `ingredientsList item references slug "${slug}" but no matching Ingredient row was found.`,
          )
        }
        row.ingredientId = resolved.id
        row.ingredientSlug = resolved.slug
        if (!row.name || typeof row.name !== 'string') row.name = resolved.name
        if (row.unit === undefined || row.unit === null || row.unit === '') {
          row.unit = resolved.defaultUnit
        }
      }
      return row
    })
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      resolveBodyReferences(child, slugToGlossaryId, ingredientBySlug, subTutorialBySlug)
    }
  }
  return doc
}

/**
 * Walk a body and collect every `tutorialSlug` referenced by a subTutorialCard
 * block. Slugs are pulled before resolution so the upload script can look up
 * all of them in a single Prisma query.
 */
function collectSubTutorialSlugs(doc: unknown): Set<string> {
  const slugs = new Set<string>()
  function walk(n: unknown): void {
    if (!n || typeof n !== 'object') return
    const node = n as NodeShape
    if (
      node.type === 'subTutorialCard' &&
      node.attrs &&
      typeof node.attrs === 'object'
    ) {
      const attrs = node.attrs as Record<string, unknown>
      const slug = typeof attrs.tutorialSlug === 'string' ? attrs.tutorialSlug : null
      if (slug) slugs.add(slug)
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child)
    }
  }
  walk(doc)
  return slugs
}

/**
 * Append one line per missing technique slug to `docs/missing-techniques.md`.
 * A future technique-authoring session reads the file.
 */
function logMissingTechniques(slugs: string[], recipeSlug: string): void {
  const file = resolve(__dirname, '..', '..', '..', 'docs', 'missing-techniques.md')
  if (!existsSync(file)) return
  const today = new Date().toISOString().slice(0, 10)
  const lines = slugs
    .map((s) => {
      const readable = s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return `- **${s}** — referenced by recipe \`${recipeSlug}\` on ${today}. Suggested technique title: "${readable}".`
    })
    .join('\n')
  appendFileSync(file, `\n${lines}`, 'utf8')
}

interface ParsedIngredientRow {
  ingredientId: string
  amount: number | null
  unit: string | null
  prepNote: string | null
  isOptional: boolean
  groupLabel: string | null
  position: number
  substitutionAllowed: boolean
}

/**
 * Walk the (already-resolved) body and pull every ingredientsList row
 * into the shape RecipeIngredient expects. Mirrors
 * `apps/web/src/lib/recipe-ingredients-sync.ts` so script-uploaded and
 * admin-uploaded recipes produce identical join rows.
 */
function extractRecipeIngredientsFromBody(doc: unknown): ParsedIngredientRow[] {
  const out: ParsedIngredientRow[] = []
  let position = 0
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const n = node as NodeShape
    if (n.type === 'ingredientsList' && n.attrs && typeof n.attrs === 'object') {
      const items = Array.isArray((n.attrs as Record<string, unknown>).items)
        ? ((n.attrs as Record<string, unknown>).items as unknown[])
        : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const row = raw as Record<string, unknown>
        const ingredientId =
          typeof row.ingredientId === 'string' ? row.ingredientId.trim() : ''
        if (!ingredientId) continue
        const amount = typeof row.amount === 'number' ? row.amount : null
        const unit =
          typeof row.unit === 'string' && row.unit.trim() ? row.unit.trim() : null
        const prepNote =
          typeof row.prepNote === 'string' && row.prepNote.trim()
            ? row.prepNote.trim()
            : null
        const isOptional = row.isOptional === true
        const groupLabel =
          typeof row.groupLabel === 'string' && row.groupLabel.trim()
            ? row.groupLabel.trim()
            : null
        const substitutionAllowed = row.substitutionAllowed !== false
        out.push({
          ingredientId,
          amount,
          unit,
          prepNote,
          isOptional,
          groupLabel,
          position,
          substitutionAllowed,
        })
        position += 1
      }
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
    }
  }
  walk(doc)
  return out
}

async function syncRecipeIngredients(
  tutorialId: string,
  body: Prisma.InputJsonValue,
  ingredientBySlug: Map<string, IngredientResolution>,
  prisma: PrismaModule['prisma'],
): Promise<number> {
  const parsed = extractRecipeIngredientsFromBody(body)

  // Cross-check: every parsed ingredientId should match one of the master
  // rows we resolved earlier. Catches the case where a body has a
  // pre-resolved ingredientId that doesn't actually exist.
  const knownIds = new Set(Array.from(ingredientBySlug.values()).map((r) => r.id))
  const filtered = parsed.filter((p) => knownIds.has(p.ingredientId))

  await prisma.$transaction(async (tx) => {
    await tx.recipeIngredient.deleteMany({ where: { tutorialId } })
    if (filtered.length > 0) {
      await tx.recipeIngredient.createMany({
        data: filtered.map((p) => ({
          tutorialId,
          ingredientId: p.ingredientId,
          amount: p.amount,
          unit: p.unit,
          prepNote: p.prepNote,
          isOptional: p.isOptional,
          groupLabel: p.groupLabel,
          position: p.position,
          substitutionAllowed: p.substitutionAllowed,
        })),
      })
    }
  })

  return filtered.length
}

async function syncProjectSchedule(
  tutorialId: string,
  steps: ProjectScheduleStep[],
  prisma: PrismaModule['prisma'],
): Promise<number> {
  await prisma.$transaction(async (tx) => {
    await tx.projectSchedule.deleteMany({ where: { tutorialId } })
    if (steps.length > 0) {
      await tx.projectSchedule.createMany({
        data: steps.map((s) => ({
          tutorialId,
          stepNumber: s.stepNumber,
          offsetDays: s.offsetDays,
          title: s.title.trim(),
          body: s.body.trim(),
          surfaceAs: s.surfaceAs ?? 'RAIL_CARD',
          requiresUserAction: s.requiresUserAction !== false,
        })),
      })
    }
  })
  return steps.length
}

async function syncRecipeTools(
  tutorialId: string,
  refs: RecipeToolRef[],
  toolBySlug: Map<string, ToolResolution>,
  prisma: PrismaModule['prisma'],
): Promise<number> {
  const rows = refs.map((ref, i) => {
    const resolved = toolBySlug.get(ref.slug)
    if (!resolved) {
      throw new Error(`recipeTools slug "${ref.slug}" failed to resolve at sync time.`)
    }
    return {
      toolId: resolved.id,
      isOptional: ref.isOptional === true,
      notes: ref.notes ?? null,
      position: typeof ref.position === 'number' ? ref.position : i,
    }
  })

  await prisma.$transaction(async (tx) => {
    await tx.recipeTool.deleteMany({ where: { tutorialId } })
    if (rows.length > 0) {
      await tx.recipeTool.createMany({
        data: rows.map((r) => ({
          tutorialId,
          toolId: r.toolId,
          isOptional: r.isOptional,
          notes: r.notes,
          position: r.position,
        })),
      })
    }
  })

  return rows.length
}

// ─── Entrypoint ──────────────────────────────────────────────────────────────

interface UploadCliFlags {
  inputPath: string
  skipVoiceCheck: boolean
  status: DesiredStatus
}

const USAGE = [
  'Usage: pnpm exec tsx scripts/upload-tutorial.ts <path-to-input.json> [flags]',
  '',
  'Flags:',
  '  --status DRAFT|PUBLISHED  Lifecycle to land the row in. Default DRAFT.',
  '                            PUBLISHED also stamps publishedAt=now() and is',
  '                            the bulk-auto-publish path (Phase 8 Step 12).',
  '  --skip-voice-check        Admin escape hatch — bypass the deterministic',
  '                            voice gate. Do not use in bulk authoring.',
  '  --help                    Show this message.',
].join('\n')

function parseUploadArgs(argv: string[]): UploadCliFlags | null | 'help' {
  let inputPath: string | null = null
  let skipVoiceCheck = false
  let status: DesiredStatus = 'DRAFT'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--help' || arg === '-h') return 'help'
    if (arg === '--skip-voice-check') {
      skipVoiceCheck = true
      continue
    }
    if (arg === '--status') {
      const raw = argv[i + 1]
      if (!raw) {
        console.error('--status requires a value: DRAFT or PUBLISHED')
        return null
      }
      const upper = raw.toUpperCase()
      if (upper !== 'DRAFT' && upper !== 'PUBLISHED') {
        console.error(`--status must be DRAFT or PUBLISHED (got "${raw}")`)
        return null
      }
      status = upper as DesiredStatus
      i += 1
      continue
    }
    if (arg.startsWith('--status=')) {
      const raw = arg.slice('--status='.length)
      const upper = raw.toUpperCase()
      if (upper !== 'DRAFT' && upper !== 'PUBLISHED') {
        console.error(`--status must be DRAFT or PUBLISHED (got "${raw}")`)
        return null
      }
      status = upper as DesiredStatus
      continue
    }
    if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`)
      return null
    }
    if (!inputPath) {
      inputPath = arg
      continue
    }
    console.error(`Unexpected positional argument: ${arg}`)
    return null
  }
  if (!inputPath) return null
  return { inputPath, skipVoiceCheck, status }
}

async function main(): Promise<void> {
  const parsed = parseUploadArgs(process.argv.slice(2))
  if (parsed === 'help') {
    console.log(USAGE)
    process.exit(0)
  }
  const flags = parsed
  if (!flags) {
    console.error(USAGE)
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
  console.log(`  type: ${input.type ?? 'RECIPE'}`)
  console.log(`  target status: ${flags.status}`)

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

  const result = await uploadTutorial(input, inputPath, flags.status)

  console.log(`\n[upload-tutorial] ${result.mode.toUpperCase()}`)
  console.log(`  Tutorial id: ${result.tutorialId}`)
  console.log(`  slug: ${result.slug}`)
  console.log(`  type: ${result.type}`)
  console.log(`  status: ${result.status}${result.publishedAt ? ` (publishedAt=${result.publishedAt})` : ''}`)
  console.log(`  category: ${result.categorySlug}${result.subCategorySlug ? ` / ${result.subCategorySlug}` : ''}`)
  console.log(`  RecipeIngredient rows: ${result.recipeIngredientRows}`)
  console.log(`  RecipeTool rows: ${result.recipeToolRows}`)
  console.log(`  ProjectSchedule rows: ${result.projectScheduleRows}`)
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
