/**
 * Idempotent upsert of the master clay-body list from
 * `packages/db/scripts/data/clay-bodies.ts` into the ClayBody table.
 *
 * Re-runs cleanly. Validates each entry up-front before any DB writes.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-clay-bodies.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-clay-bodies.ts --dry-run
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

import { CLAY_BODIES } from './data/clay-bodies.js'
import type { ClayBodySeed } from './data/types.js'

const VALID_BODY_TYPES = new Set([
  'earthenware',
  'stoneware',
  'porcelain',
  'paper-clay',
  'polymer',
  'air-dry',
  'raku',
  'terracotta',
])

function validate(rows: ClayBodySeed[]): void {
  const seen = new Set<string>()
  const errors: string[] = []

  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    seen.add(row.slug)

    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`invalid slug shape (must be lower-kebab): ${row.slug}`)
    }

    if (!VALID_BODY_TYPES.has(row.bodyType)) {
      errors.push(`${row.slug}: invalid bodyType "${row.bodyType}"`)
    }

    if (row.requiresKiln && !row.firingRangeCones) {
      errors.push(`${row.slug}: requiresKiln=true but no firingRangeCones`)
    }
  }

  if (errors.length > 0) {
    console.error('[seed-clay-bodies] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validate(CLAY_BODIES)
  console.log(
    `[seed-clay-bodies] ${CLAY_BODIES.length} entries validated${dryRun ? ' (dry-run)' : ''}`,
  )

  if (dryRun) {
    const byType = new Map<string, number>()
    for (const row of CLAY_BODIES) {
      byType.set(row.bodyType, (byType.get(row.bodyType) ?? 0) + 1)
    }
    for (const [type, n] of [...byType.entries()].sort()) {
      console.log(`  ${type.padEnd(14)} ${n}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of CLAY_BODIES) {
    const existing = await prisma.clayBody.findUnique({ where: { slug: row.slug } })

    const data = {
      slug: row.slug,
      name: row.name,
      bodyType: row.bodyType,
      firingRangeCones: row.firingRangeCones ?? null,
      requiresKiln: row.requiresKiln,
      shrinkagePercent: row.shrinkagePercent ?? null,
      notes: row.notes ?? null,
    }

    if (!existing) {
      await prisma.clayBody.create({ data })
      created++
      continue
    }

    const fieldsEqual =
      existing.name === data.name &&
      existing.bodyType === data.bodyType &&
      existing.firingRangeCones === data.firingRangeCones &&
      existing.requiresKiln === data.requiresKiln &&
      existing.shrinkagePercent === data.shrinkagePercent &&
      existing.notes === data.notes

    if (fieldsEqual) {
      unchanged++
      continue
    }

    await prisma.clayBody.update({ where: { slug: row.slug }, data })
    updated++
  }

  console.log(
    `[seed-clay-bodies] done: ${created} created, ${updated} updated, ${unchanged} unchanged`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-clay-bodies] failed:', err)
  process.exit(1)
})
