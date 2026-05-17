/**
 * Idempotent upsert of the master Fabric list from
 * `packages/db/scripts/data/fabrics.ts` into the Fabric table.
 *
 * Re-runs cleanly: created / updated / unchanged counts at the end.
 * Run once before uploading any PATTERN or sewing-discipline TECHNIQUE
 * tutorials that reference fabrics via `sewing.requiredFabricSlugs`.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-fabrics.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-fabrics.ts --dry-run
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

import { FABRICS } from './data/fabrics.js'

const DRY_RUN = process.argv.includes('--dry-run')

const VALID_WEIGHT = new Set(['light', 'medium', 'heavy', 'upholstery'])
const VALID_DRAPE = new Set(['crisp', 'flowing', 'structured'])
const VALID_FIBRES = new Set([
  'cotton', 'linen', 'wool', 'silk', 'polyester', 'nylon',
  'viscose', 'acrylic', 'hemp', 'bamboo', 'rayon', 'jute',
])
const VALID_CATEGORIES = new Set([
  'woven-natural', 'woven-synthetic', 'knit', 'non-woven',
  'interfacing', 'lining', 'batting', 'specialty',
])

async function main(): Promise<void> {
  // Validation pass first — fail fast if any seed row is malformed.
  const seenSlugs = new Set<string>()
  for (const f of FABRICS) {
    if (seenSlugs.has(f.slug)) {
      throw new Error(`[seed-fabrics] duplicate slug: ${f.slug}`)
    }
    seenSlugs.add(f.slug)

    if (!/^[a-z0-9-]+$/.test(f.slug)) {
      throw new Error(`[seed-fabrics] invalid slug shape (must be lower-kebab): ${f.slug}`)
    }
    if (!VALID_WEIGHT.has(f.weightCategory)) {
      throw new Error(`[seed-fabrics] ${f.slug}: invalid weightCategory "${f.weightCategory}"`)
    }
    if (f.drape && !VALID_DRAPE.has(f.drape)) {
      throw new Error(`[seed-fabrics] ${f.slug}: invalid drape "${f.drape}"`)
    }
    for (const fibre of f.fibreContent) {
      if (!VALID_FIBRES.has(fibre)) {
        throw new Error(`[seed-fabrics] ${f.slug}: invalid fibre "${fibre}"`)
      }
    }
    if (f.category && !VALID_CATEGORIES.has(f.category)) {
      throw new Error(`[seed-fabrics] ${f.slug}: invalid category "${f.category}"`)
    }
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of FABRICS) {
    const existing = await prisma.fabric.findUnique({ where: { slug: seed.slug } })

    const data = {
      slug: seed.slug,
      name: seed.name,
      weightCategory: seed.weightCategory,
      fibreContent: seed.fibreContent,
      drape: seed.drape ?? null,
      gsm: seed.gsm ?? null,
      suitableFor: seed.suitableFor,
      category: seed.category ?? null,
      notes: seed.notes ?? null,
    }

    if (!existing) {
      if (!DRY_RUN) {
        await prisma.fabric.create({ data })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.name})`)
      continue
    }

    const hasChanged =
      existing.name !== data.name ||
      existing.weightCategory !== data.weightCategory ||
      !arraysEqual(existing.fibreContent, data.fibreContent) ||
      (existing.drape ?? null) !== data.drape ||
      (existing.gsm ?? null) !== data.gsm ||
      !arraysEqual(existing.suitableFor, data.suitableFor) ||
      (existing.category ?? null) !== data.category ||
      (existing.notes ?? null) !== data.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.fabric.update({ where: { slug: seed.slug }, data })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] fabrics: created=${created} updated=${updated} unchanged=${unchanged} total=${FABRICS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

main().catch((err) => {
  console.error('[seed-fabrics] failed:', err)
  process.exit(1)
})
