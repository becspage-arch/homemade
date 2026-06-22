import 'server-only'
import {
  getTagFacetsForContents,
  prisma,
  TutorialStatus,
  Visibility,
  type ContentTagFacets,
} from '@homemade/db'
import {
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
  type CategoryDoc,
  type CrochetPatternDoc,
  type GlossaryDoc,
  type PatternDoc,
  type TutorialDoc,
} from '@homemade/search'
import { inngest } from '../client'

/** Pull just the five search-doc collection-tag fields (defaults empty). */
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

/**
 * Wipe and rebuild all Typesense collections from Prisma. Triggered on
 * demand from /admin/system/jobs — not on a cron.
 */
export const typesenseReindex = inngest.createFunction(
  {
    id: 'typesense-reindex',
    name: 'Typesense: reindex everything',
    triggers: [{ event: 'tutorials/reindex.requested' }],
  },
  async ({ step, logger }) => {
    if (!getAdminClient()) {
      logger.warn('typesense admin client not configured — skipping reindex')
      return { skipped: true }
    }

    await step.run('drop-collections', async () => {
      for (const name of [
        TUTORIALS_COLLECTION,
        PATTERNS_COLLECTION,
        CROCHET_PATTERNS_COLLECTION,
        CATEGORIES_COLLECTION,
        GLOSSARY_COLLECTION,
      ]) {
        await dropCollection(name)
      }
    })

    await step.run('recreate-schemas', async () => {
      await ensureCollections(ALL_SCHEMAS)
    })

    const tutorialCount = await step.run('bulk-import-tutorials', async () => {
      const tutorials = await prisma.tutorial.findMany({
        where: { status: TutorialStatus.PUBLISHED },
        include: {
          category: { select: { slug: true, name: true } },
          subCategory: { select: { slug: true, name: true } },
          tags: { select: { slug: true } },
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      })
      const facets = await getTagFacetsForContents('TUTORIAL', tutorials.map((t) => t.id))
      const docs: TutorialDoc[] = tutorials.map((t) => ({
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
        ...tagDocFields(facets.get(t.id)),
      }))
      await bulkImport(TUTORIALS_COLLECTION, docs)
      return docs.length
    })

    const patternCount = await step.run('bulk-import-patterns', async () => {
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
      const facets = await getTagFacetsForContents('CROSS_STITCH_PATTERN', patterns.map((p) => p.id))
      const docs: PatternDoc[] = patterns
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
          ...tagDocFields(facets.get(p.id)),
        }))
      await bulkImport(PATTERNS_COLLECTION, docs)
      return docs.length
    })

    const crochetPatternCount = await step.run('bulk-import-crochet-patterns', async () => {
      const patterns = await prisma.crochetPattern.findMany({
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
      const facets = await getTagFacetsForContents('CROCHET_PATTERN', patterns.map((p) => p.id))
      const docs: CrochetPatternDoc[] = patterns
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
          ...tagDocFields(facets.get(p.id)),
        }))
      await bulkImport(CROCHET_PATTERNS_COLLECTION, docs)
      return docs.length
    })

    const categoryCount = await step.run('bulk-import-categories', async () => {
      const categories = await prisma.category.findMany()
      const docs: CategoryDoc[] = categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        archetype: c.archetype,
      }))
      await bulkImport(CATEGORIES_COLLECTION, docs)
      return docs.length
    })

    const glossaryCount = await step.run('bulk-import-glossary', async () => {
      const glossary = await prisma.glossaryTerm.findMany()
      const docs: GlossaryDoc[] = glossary.map((g) => ({
        id: g.id,
        slug: g.slug,
        term: g.term,
        definition: g.definition,
        categoryId: g.categoryId,
      }))
      await bulkImport(GLOSSARY_COLLECTION, docs)
      return docs.length
    })

    return {
      tutorials: tutorialCount,
      patterns: patternCount,
      crochetPatterns: crochetPatternCount,
      categories: categoryCount,
      glossary: glossaryCount,
    }
  },
)
