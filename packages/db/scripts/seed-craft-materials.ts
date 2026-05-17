/**
 * Idempotent upsert of the master craft-materials list from
 * `packages/db/scripts/data/craft-materials.ts` into the CraftMaterial
 * table. Pottery seeded this table first; the fibre-arts pipeline
 * widens the `craft` vocabulary to include `fibre-arts` and appends
 * wool roving / dye plant / mordant / macramé cord / rug-yarn rows.
 * Future jewellery / paper / wood-finishing pipelines will append more.
 *
 * Re-runs cleanly. Validates each entry up-front before any DB writes.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-craft-materials.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-craft-materials.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import { CRAFT_MATERIALS } from './data/craft-materials.js'
import type { CraftMaterialSeed } from './data/types.js'

const VALID_CRAFTS = new Set([
  'pottery',
  'jewellery',
  'paper',
  'wood-finishing',
  'fibre-arts',
])

const VALID_POTTERY_CATEGORIES = new Set([
  'clay-tool-attached',
  'glaze-raw',
  'glaze-colourant',
  'glaze-premixed',
  'underglaze',
  'kiln-furniture',
])

const VALID_FIBRE_ARTS_CATEGORIES = new Set([
  'fibre-roving',
  'fibre-prepared',
  'warp-thread',
  'dye-plant',
  'mordant',
  'felting-aid',
  'macrame-cord',
  'rug-yarn',
])

function validate(rows: CraftMaterialSeed[]): void {
  const seen = new Set<string>()
  const errors: string[] = []

  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    seen.add(row.slug)

    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`invalid slug shape (must be lower-kebab): ${row.slug}`)
    }

    if (!VALID_CRAFTS.has(row.craft)) {
      errors.push(`${row.slug}: invalid craft "${row.craft}"`)
    }

    if (row.craft === 'pottery' && !VALID_POTTERY_CATEGORIES.has(row.category)) {
      errors.push(`${row.slug}: invalid pottery category "${row.category}"`)
    }

    if (
      row.craft === 'fibre-arts' &&
      !VALID_FIBRE_ARTS_CATEGORIES.has(row.category)
    ) {
      errors.push(`${row.slug}: invalid fibre-arts category "${row.category}"`)
    }

    if (row.trainedEnvironmentOnly && !row.hazardNotes) {
      errors.push(
        `${row.slug}: trainedEnvironmentOnly=true requires hazardNotes`,
      )
    }
  }

  if (errors.length > 0) {
    console.error('[seed-craft-materials] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validate(CRAFT_MATERIALS)
  console.log(
    `[seed-craft-materials] ${CRAFT_MATERIALS.length} entries validated${dryRun ? ' (dry-run)' : ''}`,
  )

  if (dryRun) {
    const byCategory = new Map<string, number>()
    for (const row of CRAFT_MATERIALS) {
      const key = `${row.craft}/${row.category}`
      byCategory.set(key, (byCategory.get(key) ?? 0) + 1)
    }
    for (const [key, n] of [...byCategory.entries()].sort()) {
      console.log(`  ${key.padEnd(28)} ${n}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of CRAFT_MATERIALS) {
    const existing = await prisma.craftMaterial.findUnique({
      where: { slug: row.slug },
    })

    const data = {
      slug: row.slug,
      name: row.name,
      craft: row.craft,
      category: row.category,
      trainedEnvironmentOnly: row.trainedEnvironmentOnly,
      hazardNotes: row.hazardNotes ?? null,
      notes: row.notes ?? null,
    }

    if (!existing) {
      await prisma.craftMaterial.create({ data })
      created++
      continue
    }

    const fieldsEqual =
      existing.name === data.name &&
      existing.craft === data.craft &&
      existing.category === data.category &&
      existing.trainedEnvironmentOnly === data.trainedEnvironmentOnly &&
      existing.hazardNotes === data.hazardNotes &&
      existing.notes === data.notes

    if (fieldsEqual) {
      unchanged++
      continue
    }

    await prisma.craftMaterial.update({ where: { slug: row.slug }, data })
    updated++
  }

  console.log(
    `[seed-craft-materials] done: ${created} created, ${updated} updated, ${unchanged} unchanged`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-craft-materials] failed:', err)
  process.exit(1)
})
