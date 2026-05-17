/**
 * One-off pipeline-status flip for Wood & natural craft.
 *
 * Sets `Category.pipelineStatus = 'READY'` on the `wood-natural-craft`
 * row so the single-queue autopilot picks Wood & natural craft up on
 * its next round-robin fire. Run after the rest of the wood-craft
 * pipeline-setup work has shipped:
 *   - `docs/wood-natural-craft-author.md`
 *   - `packages/db/scripts/seed-wood-natural-craft-taxonomy.ts`
 *   - master Tool entries for woodcraft (knives, gouges, chisels,
 *     axes, drawknives, spokeshaves, green-wood gear, measuring,
 *     sharpening, pyrography, basketry, finishes, abrasives)
 *
 * Idempotent: re-running on an already-READY row is a no-op. Safe to
 * run against prod; the script reports the before / after state and
 * does nothing else. Dry-run prints what it would do without writing.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-wood-natural-craft-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-wood-natural-craft-ready.ts --dry-run
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
    where: { slug: 'wood-natural-craft' },
    select: { id: true, slug: true, pipelineStatus: true },
  })

  if (!before) {
    console.error('[flip] wood-natural-craft category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  console.log(`[flip] wood-natural-craft: pipelineStatus = ${before.pipelineStatus}`)

  if (before.pipelineStatus === 'READY') {
    console.log('[flip] already READY — nothing to do.')
    await prisma.$disconnect()
    return
  }

  if (DRY_RUN) {
    console.log(`[flip] would set pipelineStatus = READY (dry-run)`)
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { id: before.id },
    data: { pipelineStatus: 'READY' },
    select: { pipelineStatus: true },
  })

  console.log(`[flip] wood-natural-craft: pipelineStatus = ${after.pipelineStatus} ✔`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip] failed:', err)
  process.exit(1)
})
