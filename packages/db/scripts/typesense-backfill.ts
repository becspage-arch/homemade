/**
 * Wipe + rebuild all Typesense collections from Prisma.
 *
 * Run with:  pnpm --filter "@homemade/db" run search:backfill
 *
 * Reads DATABASE_URL + Typesense env vars from .env.credentials at the repo
 * root (via dotenv). Drops each collection, recreates the schemas, then
 * bulk-imports the current Prisma rows. The row→doc mapping lives once in
 * src/search-docs.ts (shared with the runtime sync + the inngest reindex).
 */

import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../../..', '.env.credentials') })

async function main(): Promise<void> {
  // Dynamic imports inside main() so loadEnv runs first and the file has no
  // top-level await (this package is transformed as CJS).
  const { prisma } = await import('../src/index.js')
  const {
    loadAllTutorialDocs,
    loadAllPatternDocs,
    loadAllCrochetPatternDocs,
    loadAllCategoryDocs,
    loadAllGlossaryDocs,
  } = await import('../src/search-docs.js')
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
    getAdminClient,
  } = await import('@homemade/search')

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

  const tutorials = await loadAllTutorialDocs()
  await bulkImport(TUTORIALS_COLLECTION, tutorials)
  console.log(`[backfill] tutorials: ${tutorials.length}`)

  const patterns = await loadAllPatternDocs()
  await bulkImport(PATTERNS_COLLECTION, patterns)
  console.log(`[backfill] patterns: ${patterns.length}`)

  const crochet = await loadAllCrochetPatternDocs()
  await bulkImport(CROCHET_PATTERNS_COLLECTION, crochet)
  console.log(`[backfill] crochet patterns: ${crochet.length}`)

  const categories = await loadAllCategoryDocs()
  await bulkImport(CATEGORIES_COLLECTION, categories)
  console.log(`[backfill] categories: ${categories.length}`)

  const glossary = await loadAllGlossaryDocs()
  await bulkImport(GLOSSARY_COLLECTION, glossary)
  console.log(`[backfill] glossary: ${glossary.length}`)

  console.log('[backfill] done')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[backfill] failed', err)
  process.exit(1)
})
