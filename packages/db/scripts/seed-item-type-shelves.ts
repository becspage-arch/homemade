/**
 * Lay down a craft's item-type home shelves under its category, drawn from the
 * controlled vocabulary (prisma/item-type-vocabulary.ts).
 *
 * This is the reusable MECHANISM each category's sign-off pass runs to create
 * its shelves with the shared cross-craft slugs ("cardigan" is the same slug in
 * crochet / knitting / sewing). It is idempotent — re-run to reconcile shelves
 * to the file. It only creates/updates SubCategory rows; moving existing
 * patterns onto the new shelves is the consuming pass's job.
 *
 * DEFAULTS TO DRY-RUN. Nothing is written unless you pass --apply, so this
 * never silently restructures a category's shelves.
 *
 * Run (dry-run):
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-item-type-shelves.ts <categorySlug> <craft>
 * Apply:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-item-type-shelves.ts <categorySlug> <craft> --apply
 *
 * craft ∈ crochet | knitting | sewing | cross-stitch | needlework
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

const CRAFTS = ['crochet', 'knitting', 'sewing', 'cross-stitch', 'needlework'] as const
type Craft = (typeof CRAFTS)[number]

async function main(): Promise<void> {
  const [categorySlug, craftArg] = process.argv.slice(2)
  const apply = process.argv.includes('--apply')

  if (!categorySlug || !craftArg || !CRAFTS.includes(craftArg as Craft)) {
    console.error('Usage: seed-item-type-shelves.ts <categorySlug> <craft> [--apply]')
    console.error(`  craft ∈ ${CRAFTS.join(' | ')}`)
    process.exit(1)
  }
  const craft = craftArg as Craft

  const { prisma } = await import('../src/index.js')
  const { itemTypesForCraft, validateItemTypes } = await import(
    '../prisma/item-type-vocabulary.js'
  )
  const { ensureCraftShelves } = await import('../src/item-types.js')

  const errors = validateItemTypes()
  if (errors.length) {
    console.error('Item-type vocabulary INVALID — aborting:\n  ' + errors.join('\n  '))
    process.exit(1)
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, name: true },
  })
  if (!category) {
    console.error(`No category with slug '${categorySlug}'.`)
    process.exit(1)
  }

  const wanted = itemTypesForCraft(craft)
  console.log(
    `${craft} → category '${categorySlug}' (${category.name}): ${wanted.length} item-type shelves`,
  )

  if (!apply) {
    for (const t of wanted) console.log(`  [${t.group}] ${t.slug.padEnd(22)} ${t.name}`)
    console.log('\nDRY-RUN — nothing written. Re-run with --apply to create/update these shelves.')
    await prisma.$disconnect()
    return
  }

  const { created, updated } = await ensureCraftShelves(category.id, craft)
  console.log(`Applied: ${created.length} created, ${updated.length} updated.`)
  if (created.length) console.log('  created: ' + created.join(', '))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-item-type-shelves] failed:', err)
  process.exit(1)
})
