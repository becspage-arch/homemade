/**
 * Idempotent upsert of the master Condition list from
 * `packages/db/scripts/data/conditions.ts` into the Condition table.
 *
 * Re-runs cleanly: created / updated / unchanged counts at the end. Run
 * once before uploading any REMEDY tutorials that reference conditions
 * via `herbal.relatedConditionSlugs`.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-conditions.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-conditions.ts --dry-run
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

import { CONDITIONS } from './data/conditions.js'

const DRY_RUN = process.argv.includes('--dry-run')

const VALID_BODY_SYSTEMS = new Set([
  'digestive', 'respiratory', 'nervous', 'musculoskeletal', 'skin',
  'womens-health', 'mental-emotional', 'immune', 'circulatory', 'urinary',
  'endocrine',
])

async function main(): Promise<void> {
  for (const c of CONDITIONS) {
    if (!VALID_BODY_SYSTEMS.has(c.bodySystem)) {
      throw new Error(
        `[seed] condition "${c.slug}": invalid bodySystem "${c.bodySystem}" — must be one of ${[...VALID_BODY_SYSTEMS].join(' | ')}.`,
      )
    }
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of CONDITIONS) {
    const existing = await prisma.condition.findUnique({ where: { slug: seed.slug } })
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.condition.create({
          data: {
            slug: seed.slug,
            name: seed.name,
            bodySystem: seed.bodySystem,
            commonSymptoms: seed.commonSymptoms,
            redFlagsRequireDoctor: seed.redFlagsRequireDoctor ?? null,
            notes: seed.notes ?? null,
          },
        })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.name})`)
      continue
    }

    const hasChanged =
      existing.name !== seed.name ||
      existing.bodySystem !== seed.bodySystem ||
      !arraysEqual(existing.commonSymptoms, seed.commonSymptoms) ||
      (existing.redFlagsRequireDoctor ?? null) !== (seed.redFlagsRequireDoctor ?? null) ||
      (existing.notes ?? null) !== (seed.notes ?? null)

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.condition.update({
          where: { slug: seed.slug },
          data: {
            name: seed.name,
            bodySystem: seed.bodySystem,
            commonSymptoms: seed.commonSymptoms,
            redFlagsRequireDoctor: seed.redFlagsRequireDoctor ?? null,
            notes: seed.notes ?? null,
          },
        })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] conditions: created=${created} updated=${updated} unchanged=${unchanged} total=${CONDITIONS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
