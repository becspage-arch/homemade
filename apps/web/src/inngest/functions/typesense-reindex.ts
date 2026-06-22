import 'server-only'
import {
  loadAllCategoryDocs,
  loadAllCrochetPatternDocs,
  loadAllGlossaryDocs,
  loadAllPatternDocs,
  loadAllTutorialDocs,
} from '@homemade/db/search-docs'
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
  getAdminClient,
} from '@homemade/search'
import { inngest } from '../client'

/**
 * Wipe and rebuild all Typesense collections from Prisma. Triggered on
 * demand from /admin/system/jobs — not on a cron. The row→doc mapping lives
 * once in `@homemade/db/search-docs` (shared with the runtime sync + backfill).
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
      const docs = await loadAllTutorialDocs()
      await bulkImport(TUTORIALS_COLLECTION, docs)
      return docs.length
    })

    const patternCount = await step.run('bulk-import-patterns', async () => {
      const docs = await loadAllPatternDocs()
      await bulkImport(PATTERNS_COLLECTION, docs)
      return docs.length
    })

    const crochetPatternCount = await step.run('bulk-import-crochet-patterns', async () => {
      const docs = await loadAllCrochetPatternDocs()
      await bulkImport(CROCHET_PATTERNS_COLLECTION, docs)
      return docs.length
    })

    const categoryCount = await step.run('bulk-import-categories', async () => {
      const docs = await loadAllCategoryDocs()
      await bulkImport(CATEGORIES_COLLECTION, docs)
      return docs.length
    })

    const glossaryCount = await step.run('bulk-import-glossary', async () => {
      const docs = await loadAllGlossaryDocs()
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
