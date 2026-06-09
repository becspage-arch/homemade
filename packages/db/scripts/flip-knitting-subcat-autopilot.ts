/**
 * Knitting sub-category autopilot enablement (K-4).
 *
 * Flips `SubCategory.autopilotEnabled` for each of the 14 knitting
 * sub-cats. 10 are enabled now; 4 wait for K-5's grading library.
 *
 * Enabled (10):
 *   - scarf-cowl, hat, mitt-glove, shawl-wrap, blanket,
 *     accessory-other          (project-shape sub-cats; safe to author
 *                                with single-axis sizing)
 *   - colourwork, lace, cable-aran, brioche-doubleknit, specialty
 *                                (technique-discipline sub-cats; author
 *                                applies the discipline across any
 *                                enabled project shape)
 *
 * Disabled (4 — wait for K-5):
 *   - sweater-cardigan          (needs garment grading)
 *   - vest                      (needs garment grading)
 *   - sock                      (needs sock-specific grading)
 *
 * Idempotent. Re-running on an already-correct row is a no-op.
 * Reports any sub-cats that the seed-knitting-taxonomy script hasn't
 * created yet so the operator can run that first.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-knitting-subcat-autopilot.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-knitting-subcat-autopilot.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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

const ENABLED_SLUGS = [
  'scarf-cowl',
  'hat',
  'mitt-glove',
  'shawl-wrap',
  'blanket',
  'accessory-other',
  'colourwork',
  'lace',
  'cable-aran',
  'brioche-doubleknit',
  'specialty',
]

const DISABLED_SLUGS = ['sweater-cardigan', 'vest', 'sock']

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({
    where: { slug: 'knitting' },
    select: { id: true },
  })
  if (!category) {
    console.error('[flip-subcat-autopilot] knitting category not found.')
    process.exit(2)
  }

  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: category.id },
    select: { id: true, slug: true, autopilotEnabled: true },
    orderBy: { slug: 'asc' },
  })

  const bySlug = new Map(subCats.map((s) => [s.slug, s]))

  console.log('[flip-subcat-autopilot] knitting sub-cats found:')
  for (const s of subCats) console.log(`  - ${s.slug.padEnd(25)} autopilotEnabled=${s.autopilotEnabled}`)

  const missing: string[] = []
  for (const slug of [...ENABLED_SLUGS, ...DISABLED_SLUGS]) {
    if (!bySlug.has(slug)) missing.push(slug)
  }
  if (missing.length > 0) {
    console.error(`\n[flip-subcat-autopilot] missing sub-cats: ${missing.join(', ')}`)
    console.error('  Run seed-knitting-taxonomy.ts first to create them.')
    process.exit(3)
  }

  const changes: { slug: string; from: boolean; to: boolean }[] = []
  for (const slug of ENABLED_SLUGS) {
    const row = bySlug.get(slug)!
    if (row.autopilotEnabled !== true) changes.push({ slug, from: row.autopilotEnabled, to: true })
  }
  for (const slug of DISABLED_SLUGS) {
    const row = bySlug.get(slug)!
    if (row.autopilotEnabled !== false)
      changes.push({ slug, from: row.autopilotEnabled, to: false })
  }

  console.log(`\n[flip-subcat-autopilot] ${changes.length} change(s):`)
  for (const c of changes) console.log(`  - ${c.slug.padEnd(25)} ${c.from} -> ${c.to}`)

  if (DRY_RUN || changes.length === 0) {
    console.log('\n[flip-subcat-autopilot] dry-run or no-op — no writes')
    await prisma.$disconnect()
    return
  }

  await prisma.$transaction(async (tx) => {
    for (const slug of ENABLED_SLUGS) {
      await tx.subCategory.update({
        where: { id: bySlug.get(slug)!.id },
        data: { autopilotEnabled: true },
      })
    }
    for (const slug of DISABLED_SLUGS) {
      await tx.subCategory.update({
        where: { id: bySlug.get(slug)!.id },
        data: { autopilotEnabled: false },
      })
    }
  })

  console.log('\n[flip-subcat-autopilot] done.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip-subcat-autopilot] failed:', err)
  process.exit(1)
})
