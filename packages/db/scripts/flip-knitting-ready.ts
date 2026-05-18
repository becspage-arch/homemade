/**
 * One-off pipeline-status flip for Knitting.
 *
 * Sets `Category.pipelineStatus = 'READY'` on the `knitting` row so the
 * single-queue autopilot picks Knitting up on its next round-robin fire.
 * Also resets `lastAutopilotRunAt = null` so the round-robin priority
 * sort places the newly-ready row at the head of the queue (no stale
 * fire-time biasing it down the list).
 *
 * Run only after the rest of the knitting pipeline-setup work has
 * shipped and the two DRAFT test tutorials are reviewed and approved:
 *   - `docs/knitting-author.md`
 *   - `packages/db/scripts/seed-knitting-taxonomy.ts` (sub-categories
 *     + starter glossary)
 *   - master `KnittingNeedle` entries in `data/knitting-needles.ts`,
 *     seeded via `seed-knitting-needles.ts`
 *   - master `Stitch` rows with `craft = 'knitting'` in
 *     `data/stitches.ts`, seeded via `seed-stitches.ts`
 *
 * Idempotent: re-running on an already-READY row is a no-op. Safe to
 * run against prod; the script reports the before / after state and
 * does nothing else. Dry-run prints what it would do without writing.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-knitting-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-knitting-ready.ts --dry-run
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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'knitting' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      lastAutopilotRunAt: true,
    },
  })

  if (!before) {
    console.error('[flip] knitting category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  console.log(
    `[flip] knitting: pipelineStatus = ${before.pipelineStatus},` +
      ` lastAutopilotRunAt = ${before.lastAutopilotRunAt?.toISOString() ?? 'null'}`,
  )

  if (before.pipelineStatus === 'READY' && before.lastAutopilotRunAt === null) {
    console.log('[flip] already READY with null lastAutopilotRunAt — nothing to do.')
    await prisma.$disconnect()
    return
  }

  if (DRY_RUN) {
    console.log(
      `[flip] would set pipelineStatus = READY, lastAutopilotRunAt = null (dry-run)`,
    )
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { id: before.id },
    data: {
      pipelineStatus: 'READY',
      lastAutopilotRunAt: null,
    },
    select: { pipelineStatus: true, lastAutopilotRunAt: true },
  })

  console.log(
    `[flip] knitting: pipelineStatus = ${after.pipelineStatus},` +
      ` lastAutopilotRunAt = ${after.lastAutopilotRunAt?.toISOString() ?? 'null'} ✔`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip] failed:', err)
  process.exit(1)
})
