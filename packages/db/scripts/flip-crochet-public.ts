/**
 * Crochet category public visibility + foundations flip (step 5).
 *
 * Idempotent maintenance script that:
 *   1. Sets Category.isPublicVisible = true on the crochet row.
 *   2. Marks the four foundation tutorials with foundational = true so
 *      they appear in the FoundationsPath "Start here" ladder on the
 *      /crochet category landing page.
 *
 * Safe to re-run; reports before / after state.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-crochet-public.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-crochet-public.ts --dry-run
 *
 * Wired into deploy.yml after the seed-crochet-pattern-rows step.
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

const DRY_RUN = process.argv.includes('--dry-run')

const FOUNDATION_SLUGS = [
  'how-to-hold-a-crochet-hook',
  'how-to-work-a-treble',
  'crochet-magic-ring',
  'granny-square-basic-three-round',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  console.log('[flip-public] Crochet category visibility + foundations.')

  const category = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: { id: true, slug: true, isPublicVisible: true },
  })
  if (!category) {
    console.error('[flip-public] crochet category not found')
    process.exit(2)
  }

  if (category.isPublicVisible) {
    console.log('[flip-public] Category already public, no change.')
  } else {
    if (DRY_RUN) {
      console.log('[flip-public] DRY RUN: would set crochet.isPublicVisible = true')
    } else {
      await prisma.category.update({
        where: { id: category.id },
        data: { isPublicVisible: true },
      })
      console.log('[flip-public] crochet.isPublicVisible -> true')
    }
  }

  const tutorials = await prisma.tutorial.findMany({
    where: { slug: { in: FOUNDATION_SLUGS } },
    select: { id: true, slug: true, foundational: true, status: true },
  })

  let toFlag = 0
  for (const t of tutorials) {
    if (t.status !== 'PUBLISHED') {
      console.warn(`[flip-public] ${t.slug} is not PUBLISHED (status=${t.status}), skipping`)
      continue
    }
    if (t.foundational) {
      console.log(`[flip-public] ${t.slug} already foundational, no change`)
      continue
    }
    toFlag += 1
    if (DRY_RUN) {
      console.log(`[flip-public] DRY RUN: would mark ${t.slug} as foundational`)
    } else {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { foundational: true },
      })
      console.log(`[flip-public] ${t.slug} -> foundational = true`)
    }
  }

  console.log(`[flip-public] Done. Flagged ${toFlag} tutorials this run.`)
}

main()
  .catch((err) => {
    console.error('[flip-public] Unhandled error:', err)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/index.js')
    await prisma.$disconnect()
  })
