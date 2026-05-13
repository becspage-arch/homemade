/**
 * Idempotent upsert of the master tool list from
 * `packages/db/scripts/data/tools.ts` into the Tool table.
 *
 * Re-runs cleanly. Validates each entry up-front before any DB writes.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../..', '.env.credentials'),
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

import { TOOLS } from './data/tools.js'
import type { ToolSeed } from './data/types.js'

const VALID_CATEGORIES = new Set([
  'knife', 'pan', 'pot', 'oven', 'mixer', 'processor', 'measuring', 'bowl',
  'tray', 'tin', 'board', 'utensil', 'appliance', 'electrical', 'thermometer',
  'scale', 'other',
])

function validate(rows: ToolSeed[]): void {
  const seen = new Set<string>()
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

    if (row.typicalPriceGbp !== undefined) {
      if (!Number.isInteger(row.typicalPriceGbp) || row.typicalPriceGbp < 0) {
        errors.push(`${row.slug}: typicalPriceGbp must be a non-negative integer (pennies)`)
      }
    }
  }

  if (errors.length > 0) {
    console.error('[seed-tools] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validate(TOOLS)
  console.log(`[seed-tools] ${TOOLS.length} entries validated${dryRun ? ' (dry-run)' : ''}`)

  if (dryRun) {
    const byCategory = new Map<string, number>()
    for (const row of TOOLS) {
      byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1)
    }
    for (const [cat, n] of [...byCategory.entries()].sort()) {
      console.log(`  ${cat.padEnd(12)} ${n}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of TOOLS) {
    const existing = await prisma.tool.findUnique({ where: { slug: row.slug } })

    const data = {
      slug: row.slug,
      name: row.name,
      category: row.category,
      aliases: row.aliases,
      isPurchasable: row.isPurchasable,
      typicalPriceGbp: row.typicalPriceGbp ?? null,
      notes: row.notes ?? null,
    }

    if (!existing) {
      await prisma.tool.create({ data })
      created++
      continue
    }

    const fieldsEqual =
      existing.name === data.name &&
      existing.category === data.category &&
      JSON.stringify(existing.aliases) === JSON.stringify(data.aliases) &&
      existing.isPurchasable === data.isPurchasable &&
      existing.typicalPriceGbp === data.typicalPriceGbp &&
      existing.notes === data.notes

    if (fieldsEqual) {
      unchanged++
      continue
    }

    await prisma.tool.update({ where: { slug: row.slug }, data })
    updated++
  }

  console.log(`[seed-tools] done: ${created} created, ${updated} updated, ${unchanged} unchanged`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-tools] failed:', err)
  process.exit(1)
})
