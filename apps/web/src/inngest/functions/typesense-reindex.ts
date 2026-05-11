import 'server-only'
import { prisma, TutorialStatus } from '@homemade/db'
import {
  ALL_SCHEMAS,
  CATEGORIES_COLLECTION,
  GLOSSARY_COLLECTION,
  TUTORIALS_COLLECTION,
  bulkImport,
  dropCollection,
  ensureCollections,
  extractBodyText,
  getAdminClient,
  type CategoryDoc,
  type GlossaryDoc,
  type TutorialDoc,
} from '@homemade/search'
import { inngest } from '../client'

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
      for (const name of [TUTORIALS_COLLECTION, CATEGORIES_COLLECTION, GLOSSARY_COLLECTION]) {
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
        tagSlugs: t.tags.map((tag) => tag.slug),
        heroCloudflareId: t.hero?.cloudflareId ?? null,
        heroR2Key: t.hero?.r2Key ?? null,
        publishedAt: t.publishedAt ? t.publishedAt.getTime() : null,
      }))
      await bulkImport(TUTORIALS_COLLECTION, docs)
      return docs.length
    })

    const categoryCount = await step.run('bulk-import-categories', async () => {
      const categories = await prisma.category.findMany()
      const docs: CategoryDoc[] = categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
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
      categories: categoryCount,
      glossary: glossaryCount,
    }
  },
)
