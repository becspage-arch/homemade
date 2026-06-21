/**
 * Wipe + rebuild all Typesense collections from Prisma.
 *
 * Run with:  pnpm --filter "@homemade/db" run search:backfill
 *
 * Reads DATABASE_URL + Typesense env vars from .env.credentials at the repo
 * root (via dotenv). Drops each collection, recreates the schemas, then
 * bulk-imports the current Prisma rows.
 */

import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  CategoryDoc,
  CrochetPatternDoc,
  GlossaryDoc,
  PatternDoc,
  TutorialDoc,
} from '@homemade/search'
import type { ContentTagFacets } from '../src/collection-tags.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../../..', '.env.credentials') })

const { prisma, TutorialStatus, Visibility, getTagFacetsForContents } = await import('../src/index.js')

/** Pull just the five search-doc tag fields from a facets entry (defaults empty). */
function tagDocFields(f: ContentTagFacets | undefined): {
  occasionSlugs: string[]
  seasonSlugs: string[]
  styleSlugs: string[]
  subjectSlugs: string[]
  collectionText: string
} {
  return {
    occasionSlugs: f?.occasionSlugs ?? [],
    seasonSlugs: f?.seasonSlugs ?? [],
    styleSlugs: f?.styleSlugs ?? [],
    subjectSlugs: f?.subjectSlugs ?? [],
    collectionText: f?.collectionText ?? '',
  }
}
const {
  ALL_SCHEMAS,
  CATEGORIES_COLLECTION,
  CROCHET_PATTERNS_COLLECTION,
  GLOSSARY_COLLECTION,
  PATTERNS_COLLECTION,
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
  for (const name of [
    TUTORIALS_COLLECTION,
    PATTERNS_COLLECTION,
    CROCHET_PATTERNS_COLLECTION,
    CATEGORIES_COLLECTION,
    GLOSSARY_COLLECTION,
  ]) {
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
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  const tutorialFacets = await getTagFacetsForContents('TUTORIAL', tutorials.map((t) => t.id))
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
    totalMinutes: t.totalMinutes,
    tagSlugs: t.tags.map((tag) => tag.slug),
    heroCloudflareId: t.hero?.cloudflareId ?? null,
    heroR2Key: t.hero?.r2Key ?? null,
    publishedAt: t.publishedAt ? t.publishedAt.getTime() : null,
    type: t.type,
    mealType: t.mealType,
    cuisine: t.cuisine,
    dietaryFlags: t.dietaryFlags,
    mood: t.mood,
    practiceType: t.practiceType,
    practiceTargets: t.practiceTargets,
    timeBand: t.timeBand,
    bestTime: t.bestTime,
    practiceDepth: t.practiceDepth,
    plantingMonths: t.plantingMonths,
    harvestMonths: t.harvestMonths,
    containerFriendly: t.containerFriendly,
    indoorFriendly: t.indoorFriendly,
    regionsApplicable: t.regionsApplicable,
    foundational: t.foundational,
    ...tagDocFields(tutorialFacets.get(t.id)),
  }))
  await bulkImport(TUTORIALS_COLLECTION, tutorialDocs)
  console.log(`[backfill] tutorials: ${tutorialDocs.length}`)

  // Patterns — public-catalogue (owner-null) + published.
  const patterns = await prisma.pattern.findMany({
    where: {
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      publishedAt: { not: null },
      subCategoryId: { not: null },
    },
    include: {
      designer: { select: { slug: true, displayName: true } },
      subCategory: {
        select: {
          slug: true,
          name: true,
          category: { select: { slug: true } },
        },
      },
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  const patternFacets = await getTagFacetsForContents('CROSS_STITCH_PATTERN', patterns.map((p) => p.id))
  const patternDocs: PatternDoc[] = patterns
    .filter((p) => p.subCategory !== null)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      type: p.type,
      categorySlug: p.subCategory!.category.slug,
      subCategorySlug: p.subCategory!.slug,
      subCategoryName: p.subCategory!.name,
      designerSlug: p.designer?.slug ?? null,
      designerName: p.designer?.displayName ?? null,
      difficulty: p.difficulty,
      widthCells: p.widthCells,
      heightCells: p.heightCells,
      colourCount: p.colourCount,
      totalStitches: p.totalStitches,
      estimatedHours: p.estimatedHours,
      hasBackstitch: p.hasBackstitch,
      hasFrenchKnots: p.hasFrenchKnots,
      hasBeads: p.hasBeads,
      hasQuarterStitches: p.hasQuarterStitches,
      fabricCountSuggested: p.fabricCountSuggested,
      premium: p.premium,
      heroCloudflareId: p.hero?.cloudflareId ?? null,
      heroR2Key: p.hero?.r2Key ?? null,
      thumbnailCloudflareId: p.thumbnail?.cloudflareId ?? null,
      thumbnailR2Key: p.thumbnail?.r2Key ?? null,
      publishedAt: p.publishedAt ? p.publishedAt.getTime() : null,
      ...tagDocFields(patternFacets.get(p.id)),
    }))
  await bulkImport(PATTERNS_COLLECTION, patternDocs)
  console.log(`[backfill] patterns: ${patternDocs.length}`)

  // Crochet patterns.
  const crochetPatterns = await prisma.crochetPattern.findMany({
    where: {
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      publishedAt: { not: null },
      subCategoryId: { not: null },
    },
    include: {
      designer: { select: { slug: true, displayName: true } },
      subCategory: {
        select: {
          slug: true,
          name: true,
          category: { select: { slug: true } },
        },
      },
      primaryYarnWeight: { select: { canonicalName: true } },
      primaryHook: { select: { mmSize: true } },
    },
  })
  const crochetFacets = await getTagFacetsForContents('CROCHET_PATTERN', crochetPatterns.map((p) => p.id))
  const crochetPatternDocs: CrochetPatternDoc[] = crochetPatterns
    .filter((p) => p.subCategory !== null)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      categorySlug: p.subCategory!.category.slug,
      subCategorySlug: p.subCategory!.slug,
      subCategoryName: p.subCategory!.name,
      designerSlug: p.designer?.slug ?? null,
      designerName: p.designer?.displayName ?? null,
      difficulty: p.difficulty,
      estimatedHours: p.estimatedHours,
      shape: p.shapeCategory,
      construction: p.construction,
      primaryStitches: p.specialStitchesUsed,
      yarnWeight: p.primaryYarnWeight?.canonicalName ?? null,
      hookSizeMm: p.primaryHook?.mmSize ?? null,
      hasMultipleSizes: p.sizesGraded !== null,
      terminology: p.terminologyConvention,
      premium: p.premium,
      heroCloudflareId: null,
      heroR2Key: null,
      publishedAt: p.publishedAt ? p.publishedAt.getTime() : null,
      ...tagDocFields(crochetFacets.get(p.id)),
    }))
  await bulkImport(CROCHET_PATTERNS_COLLECTION, crochetPatternDocs)
  console.log(`[backfill] crochet patterns: ${crochetPatternDocs.length}`)

  // Categories.
  const categories = await prisma.category.findMany()
  const categoryDocs: CategoryDoc[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    archetype: c.archetype,
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
