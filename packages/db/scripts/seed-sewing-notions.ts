/**
 * Idempotent upsert of the master SewingNotion list from
 * `packages/db/scripts/data/sewing-notions.ts` into the SewingNotion table.
 *
 * Re-runs cleanly: created / updated / unchanged counts at the end.
 * Run once before uploading PATTERN tutorials that reference notions via
 * `sewing.requiredNotionSlugs`.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-notions.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-notions.ts --dry-run
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

import { SEWING_NOTIONS } from './data/sewing-notions.js'

const DRY_RUN = process.argv.includes('--dry-run')

const VALID_CATEGORIES = new Set([
  'closure', 'interfacing', 'thread', 'binding', 'elastic',
  'stuffing', 'trim', 'fastener', 'cord', 'lining',
])

async function main(): Promise<void> {
  const seenSlugs = new Set<string>()
  for (const n of SEWING_NOTIONS) {
    if (seenSlugs.has(n.slug)) {
      throw new Error(`[seed-sewing-notions] duplicate slug: ${n.slug}`)
    }
    seenSlugs.add(n.slug)

    if (!/^[a-z0-9-]+$/.test(n.slug)) {
      throw new Error(`[seed-sewing-notions] invalid slug shape (must be lower-kebab): ${n.slug}`)
    }
    if (!VALID_CATEGORIES.has(n.category)) {
      throw new Error(`[seed-sewing-notions] ${n.slug}: invalid category "${n.category}"`)
    }
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of SEWING_NOTIONS) {
    const existing = await prisma.sewingNotion.findUnique({ where: { slug: seed.slug } })

    const data = {
      slug: seed.slug,
      name: seed.name,
      category: seed.category,
      notes: seed.notes ?? null,
    }

    if (!existing) {
      if (!DRY_RUN) {
        await prisma.sewingNotion.create({ data })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.name})`)
      continue
    }

    const hasChanged =
      existing.name !== data.name ||
      existing.category !== data.category ||
      (existing.notes ?? null) !== data.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.sewingNotion.update({ where: { slug: seed.slug }, data })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] sewing-notions: created=${created} updated=${updated} unchanged=${unchanged} total=${SEWING_NOTIONS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-sewing-notions] failed:', err)
  process.exit(1)
})
