/**
 * Add the cross-craft collection-tag facet fields to the EXISTING Typesense
 * collections (phase_collection_taxonomy_001).
 *
 * `ensureCollections` deliberately never mutates a live collection's schema, so
 * a fresh deploy gets the new fields (they're in the schema definitions) but the
 * already-created prod collections need this one-off field-add. Idempotent:
 * only adds fields that aren't already present.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/typesense-add-collection-tag-fields.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main(): Promise<void> {
  const {
    getAdminClient,
    COLLECTION_TAG_FIELDS,
    TUTORIALS_COLLECTION,
    PATTERNS_COLLECTION,
    CROCHET_PATTERNS_COLLECTION,
  } = await import('@homemade/search')

  const client = getAdminClient()
  if (!client) {
    console.error('[add-tag-fields] TYPESENSE_HOST / TYPESENSE_ADMIN_API_KEY not set.')
    process.exit(1)
  }

  for (const name of [TUTORIALS_COLLECTION, PATTERNS_COLLECTION, CROCHET_PATTERNS_COLLECTION]) {
    let existing
    try {
      existing = await client.collections(name).retrieve()
    } catch (err) {
      const status = (err as { httpStatus?: number }).httpStatus
      if (status === 404) {
        console.log(`  ${name}: does not exist yet (fresh deploy will create it with fields) — skip`)
        continue
      }
      throw err
    }
    const have = new Set((existing.fields ?? []).map((f) => f.name))
    const toAdd = COLLECTION_TAG_FIELDS.filter((f) => !have.has(f.name))
    if (toAdd.length === 0) {
      console.log(`  ${name}: already has all collection-tag fields`)
      continue
    }
    await client.collections(name).update({ fields: toAdd })
    console.log(`  ${name}: added ${toAdd.map((f) => f.name).join(', ')}`)
  }

  console.log('[add-tag-fields] done')
}

main().catch((err) => {
  console.error('[add-tag-fields] failed', err)
  process.exit(1)
})
