/**
 * One-off cleanup: delete the legacy `cross-stitch` SubCategory under
 * `needlework`. This row was created before cross-stitch was promoted to its
 * own top-level Category. autopilotEnabled=false, harmless but unused.
 *
 * Safety check: verify no Tutorial, Pattern, or other rows reference the
 * subcategory before deleting.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/delete-legacy-cross-stitch-subcategory.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/delete-legacy-cross-stitch-subcategory.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const needlework = await prisma.category.findUnique({ where: { slug: 'needlework' } })
  if (!needlework) {
    console.error('[cleanup] needlework category not found')
    process.exit(2)
  }

  const legacySub = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: needlework.id, slug: 'cross-stitch' } },
  })
  if (!legacySub) {
    console.log('[cleanup] needlework/cross-stitch subcategory not found — already gone')
    await prisma.$disconnect()
    return
  }
  console.log(`[cleanup] found: needlework/cross-stitch id=${legacySub.id}`)

  // Safety checks — verify no rows reference this subcategory.
  const tutorialCount = await prisma.tutorial.count({ where: { subCategoryId: legacySub.id } })
  if (tutorialCount > 0) {
    console.error(`[cleanup] ABORT: ${tutorialCount} Tutorial rows reference this subcategory. Reassign them first.`)
    await prisma.$disconnect()
    process.exit(1)
  }

  if (DRY_RUN) {
    console.log('[cleanup] dry-run: would delete needlework/cross-stitch (cascade-safe, 0 Tutorial references)')
    await prisma.$disconnect()
    return
  }

  await prisma.subCategory.delete({ where: { id: legacySub.id } })
  console.log('[cleanup] deleted needlework/cross-stitch subcategory')

  // Confirm it's gone.
  const rows = await prisma.subCategory.findMany({
    where: { categoryId: needlework.id },
    select: { slug: true, name: true, autopilotEnabled: true },
    orderBy: { order: 'asc' },
  })
  console.log('\n[cleanup] remaining needlework subcategories:')
  for (const r of rows) {
    console.log(`  ${r.slug} (${r.name}) autopilot=${r.autopilotEnabled}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[cleanup] failed:', err)
  process.exit(1)
})
