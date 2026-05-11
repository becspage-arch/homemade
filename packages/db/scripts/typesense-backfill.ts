/**
 * Wipe + rebuild all Typesense collections from Prisma.
 *
 * Run with:  pnpm --filter "@homemade/db" run search:backfill
 *
 * Reads DATABASE_URL + Typesense env vars from .env.credentials at the repo
 * root (via dotenv). Drops each of the three collections, recreates the
 * schemas, then bulk-imports the current Prisma rows.
 */

import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  CategoryDoc,
  GlossaryDoc,
  TutorialDoc,
} from '@homemade/search'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Repo root is three levels up from packages/db/scripts
loadEnv({ path: resolve(__dirname, '../../..', '.env.credentials') })

// Imports that touch process.env must run *after* loadEnv.
const { prisma, TutorialStatus } = await import('../src/index.js')
const {
  ALL_SCHEMAS,
  CATEGORIES_COLLECTION,
  GLOSSARY_COLLECTION,
  TUTORIALS_COLLECTION,
  bulkImport,
  dropCollection,
  ensureCollections,
  extractBodyText,
  getAdminClient,
} = await import('@homemade/search')

async function main(): Promise<void> {
  if (!getAdminClient()) {
    console.error(
      '[backfill] TYPESENSE_HOST or TYPESENSE_ADMIN_API_KEY not set. ' +
        'Put them in .env.credentials at the repo root and re-run.',
    )
    process.exit(1)
  }

  console.log('[backfill] dropping existing collections')
  for (const name of [TUTORIALS_COLLECTION, CATEGORIES_COLLECTION, GLOSSARY_COLLECTION]) {
    await dropCollection(name)
  }

  console.log('[backfill] recreating collections')
  await ensureCollections(ALL_SCHEMAS)

  // Tutorials — only PUBLISHED.
  const tutorials = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    include: {
      category: { select: { slug: true, name: true } },
      subCategory: { select: { slug: true, name: true } },
      tags: { select: { slug: true } },
      hero: { select: { cloudflareId: true } },
    },
  })
  const tutorialDocs: TutorialDoc[] = tutorials.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    excerpt: t.excerpt,
    bodyText: extractBodyText(t.body),
    categoryId: t.categoryId,
    categorySlug: t.category.slug,
    categoryName: t.category.name,
    subCategorySlug: t.subCategory?.slug ?? null,
    subCategoryName: t.subCategory?.name ?? null,
    difficulty: t.difficulty,
    season: t.season,
    timeMinutes: t.timeMinutes,
    tagSlugs: t.tags.map((tag) => tag.slug),
    heroCloudflareId: t.hero?.cloudflareId ?? null,
    publishedAt: t.publishedAt ? t.publishedAt.getTime() : null,
  }))
  await bulkImport(TUTORIALS_COLLECTION, tutorialDocs)
  console.log(`[backfill] tutorials: ${tutorialDocs.length}`)

  // Categories.
  const categories = await prisma.category.findMany()
  const categoryDocs: CategoryDoc[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
  }))
  await bulkImport(CATEGORIES_COLLECTION, categoryDocs)
  console.log(`[backfill] categories: ${categoryDocs.length}`)

  // Glossary.
  const glossary = await prisma.glossaryTerm.findMany()
  const glossaryDocs: GlossaryDoc[] = glossary.map((g) => ({
    id: g.id,
    slug: g.slug,
    term: g.term,
    definition: g.definition,
    categoryId: g.categoryId,
  }))
  await bulkImport(GLOSSARY_COLLECTION, glossaryDocs)
  console.log(`[backfill] glossary: ${glossaryDocs.length}`)

  console.log('[backfill] done')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[backfill] failed', err)
  process.exit(1)
})
