/**
 * Seed the cross-craft collection vocabulary into CollectionTag.
 *
 * Idempotent: upserts by slug, so re-running after editing
 * prisma/collection-vocabulary.ts reconciles the DB to the file. The file is
 * the single source of truth; this script never invents terms.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-collection-vocabulary.ts
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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const { COLLECTION_VOCABULARY, validateVocabulary } = await import('../prisma/collection-vocabulary.ts')

  const errors = validateVocabulary()
  if (errors.length) {
    console.error('Vocabulary INVALID — aborting:\n  ' + errors.join('\n  '))
    process.exit(1)
  }

  // Pass 1: upsert every term with parentId cleared (resolved in pass 2).
  for (const t of COLLECTION_VOCABULARY) {
    await prisma.collectionTag.upsert({
      where: { slug: t.slug },
      create: {
        axis: t.axis,
        slug: t.slug,
        name: t.name,
        description: t.description,
        taggerGuidance: t.taggerGuidance,
        aliases: t.aliases ?? [],
        order: t.order,
        isThemePage: t.themePage ?? false,
      },
      update: {
        axis: t.axis,
        name: t.name,
        description: t.description,
        taggerGuidance: t.taggerGuidance,
        aliases: t.aliases ?? [],
        order: t.order,
        isThemePage: t.themePage ?? false,
      },
    })
  }

  // Pass 2: resolve parents now that every slug exists.
  const idBySlug = new Map<string, string>()
  for (const row of await prisma.collectionTag.findMany({ select: { id: true, slug: true } })) {
    idBySlug.set(row.slug, row.id)
  }
  let parented = 0
  for (const t of COLLECTION_VOCABULARY) {
    const parentId = t.parent ? idBySlug.get(t.parent) ?? null : null
    await prisma.collectionTag.update({ where: { slug: t.slug }, data: { parentId } })
    if (parentId) parented++
  }

  // Report.
  const byAxis = await prisma.collectionTag.groupBy({ by: ['axis'], _count: true })
  const themePages = await prisma.collectionTag.count({ where: { isThemePage: true } })
  console.log('Seeded CollectionTag:')
  for (const a of byAxis) console.log(`  ${a.axis.padEnd(10)} ${a._count}`)
  console.log(`  parent links: ${parented}`)
  console.log(`  theme pages : ${themePages}`)
  console.log(`  TOTAL       : ${COLLECTION_VOCABULARY.length}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-collection-vocabulary] failed:', err)
  process.exit(1)
})
