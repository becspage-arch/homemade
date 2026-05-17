/**
 * Idempotent upsert of the master plant list from
 * `packages/db/scripts/data/plants.ts` into the `PlantVariety` table.
 *
 * Re-runs cleanly: created / updated / unchanged counts reported at end.
 * Validates every entry against the literal unions before any DB writes
 * — a typo in a category / sun / water value fails up-front rather than
 * halfway through.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-plants.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-plants.ts --dry-run
 *
 * Reads DATABASE_URL from `.env.credentials` walking up from this file
 * (same pattern as `seed-ingredients.ts`).
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

import { PLANTS } from './data/plants.js'
import type { PlantSeed } from './data/types.js'

const VALID_CATEGORIES = new Set([
  'vegetable', 'fruit', 'herb', 'flower', 'shrub', 'tree', 'other',
])

const VALID_SUN = new Set(['full-sun', 'partial-shade', 'shade'])

const VALID_WATER = new Set(['low', 'moderate', 'high'])

const VALID_SOILS = new Set([
  'clay', 'sandy', 'loamy', 'chalky', 'well-drained', 'boggy',
])

const VALID_PARTS = new Set([
  'fruit', 'leaf', 'root', 'stem', 'flower', 'seed',
])

const VALID_MONTHS = new Set([
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
])

const VALID_RHS_ZONES = new Set([
  'H1a', 'H1b', 'H1c', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7',
])

function validate(rows: PlantSeed[]): void {
  const seen = new Set<string>()
  const knownSlugs = new Set(rows.map((r) => r.slug))
  const errors: string[] = []

  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    seen.add(row.slug)

    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`invalid slug shape (must be lower-kebab): ${row.slug}`)
    }
    if (!VALID_CATEGORIES.has(row.category)) {
      errors.push(`${row.slug}: invalid category "${row.category}"`)
    }
    if (row.sunRequirement && !VALID_SUN.has(row.sunRequirement)) {
      errors.push(`${row.slug}: invalid sunRequirement "${row.sunRequirement}"`)
    }
    if (row.waterRequirement && !VALID_WATER.has(row.waterRequirement)) {
      errors.push(`${row.slug}: invalid waterRequirement "${row.waterRequirement}"`)
    }
    for (const s of row.soilType ?? []) {
      if (!VALID_SOILS.has(s)) {
        errors.push(`${row.slug}: invalid soilType "${s}"`)
      }
    }
    for (const p of row.edibleParts ?? []) {
      if (!VALID_PARTS.has(p)) {
        errors.push(`${row.slug}: invalid edibleParts "${p}"`)
      }
    }
    for (const m of row.seasonality ?? []) {
      if (!VALID_MONTHS.has(m)) {
        errors.push(`${row.slug}: invalid seasonality "${m}"`)
      }
    }
    for (const z of row.rhsHardinessZone ?? []) {
      if (!VALID_RHS_ZONES.has(z)) {
        errors.push(`${row.slug}: invalid rhsHardinessZone "${z}"`)
      }
    }
    if (row.parentSpeciesSlug && !knownSlugs.has(row.parentSpeciesSlug)) {
      errors.push(
        `${row.slug}: parentSpeciesSlug "${row.parentSpeciesSlug}" not in master list`,
      )
    }
  }

  if (errors.length > 0) {
    console.error('[seed-plants] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validate(PLANTS)
  console.log(
    `[seed-plants] ${PLANTS.length} entries validated${dryRun ? ' (dry-run)' : ''}`,
  )

  if (dryRun) {
    const byCategory = new Map<string, number>()
    for (const row of PLANTS) {
      byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1)
    }
    for (const [cat, n] of [...byCategory.entries()].sort()) {
      console.log(`  ${cat.padEnd(10)} ${n}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  // Two passes — pass 1 inserts / updates all rows with parentSpeciesId left
  // null; pass 2 resolves parentSpeciesSlug → id and patches the row. Avoids
  // FK-order dependency in the seed data.
  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of PLANTS) {
    const existing = await prisma.plantVariety.findUnique({ where: { slug: row.slug } })

    const data = {
      slug: row.slug,
      commonName: row.commonName,
      latinBinomial: row.latinBinomial ?? null,
      category: row.category,
      rhsHardinessZone: row.rhsHardinessZone ?? [],
      usdaHardinessZone: row.usdaHardinessZone ?? [],
      sunRequirement: row.sunRequirement ?? null,
      waterRequirement: row.waterRequirement ?? null,
      soilType: row.soilType ?? [],
      daysToMaturity: row.daysToMaturity ?? null,
      seedingDepthCm: row.seedingDepthCm ?? null,
      spacingCm: row.spacingCm ?? null,
      heightCm: row.heightCm ?? null,
      edibleParts: row.edibleParts ?? [],
      notes: row.notes ?? null,
      isStaple: row.isStaple,
      isPerennial: row.isPerennial,
      seasonality: row.seasonality ?? [],
    }

    if (!existing) {
      await prisma.plantVariety.create({ data })
      created++
      continue
    }

    const fieldsEqual =
      existing.commonName === data.commonName &&
      existing.latinBinomial === data.latinBinomial &&
      existing.category === data.category &&
      JSON.stringify(existing.rhsHardinessZone) === JSON.stringify(data.rhsHardinessZone) &&
      JSON.stringify(existing.usdaHardinessZone) === JSON.stringify(data.usdaHardinessZone) &&
      existing.sunRequirement === data.sunRequirement &&
      existing.waterRequirement === data.waterRequirement &&
      JSON.stringify(existing.soilType) === JSON.stringify(data.soilType) &&
      existing.daysToMaturity === data.daysToMaturity &&
      existing.seedingDepthCm === data.seedingDepthCm &&
      existing.spacingCm === data.spacingCm &&
      existing.heightCm === data.heightCm &&
      JSON.stringify(existing.edibleParts) === JSON.stringify(data.edibleParts) &&
      existing.notes === data.notes &&
      existing.isStaple === data.isStaple &&
      existing.isPerennial === data.isPerennial &&
      JSON.stringify(existing.seasonality) === JSON.stringify(data.seasonality)

    if (fieldsEqual) {
      unchanged++
      continue
    }

    await prisma.plantVariety.update({ where: { slug: row.slug }, data })
    updated++
  }

  // Pass 2 — resolve parent-species links now every row is in the DB.
  const allSlugs = new Set(PLANTS.map((r) => r.slug))
  const idBySlug = new Map<string, string>()
  const dbRows = await prisma.plantVariety.findMany({
    where: { slug: { in: [...allSlugs] } },
    select: { id: true, slug: true, parentSpeciesId: true },
  })
  for (const r of dbRows) idBySlug.set(r.slug, r.id)

  let parentLinksUpdated = 0
  for (const row of PLANTS) {
    if (!row.parentSpeciesSlug) continue
    const desiredParentId = idBySlug.get(row.parentSpeciesSlug)
    if (!desiredParentId) continue
    const dbRow = dbRows.find((r) => r.slug === row.slug)
    if (!dbRow) continue
    if (dbRow.parentSpeciesId === desiredParentId) continue
    await prisma.plantVariety.update({
      where: { slug: row.slug },
      data: { parentSpeciesId: desiredParentId },
    })
    parentLinksUpdated++
  }

  console.log(
    `[seed-plants] done: ${created} created, ${updated} updated, ${unchanged} unchanged, ${parentLinksUpdated} parent links set`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-plants] failed:', err)
  process.exit(1)
})
