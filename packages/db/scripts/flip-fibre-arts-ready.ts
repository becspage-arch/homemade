/**
 * Flip the `fibre-arts` Category from NOT_READY → READY so the
 * round-robin autopilot picks it up on its next fire.
 *
 * Idempotent. Re-runs cleanly: if the row is already READY, no-op; if
 * it's COMPLETE or PAUSED the script bails with a clear message rather
 * than overwriting admin / autopilot state.
 *
 * Run after the rest of the fibre-arts scaffold is in place:
 *   - docs/fibre-arts-author.md present
 *   - apps/web/src/lib/chart-renderers/{weaving-draft,macrame-knot}.tsx present
 *   - seed-fibre-arts-taxonomy.ts has been run (the 6 sub-categories live in the DB)
 *   - seed-craft-materials.ts has been re-run (fibre-arts rows seeded)
 *   - seed-tools.ts has been re-run (fibre-arts tools seeded)
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-fibre-arts-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-fibre-arts-ready.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  const { prisma } = await import('../src/index.js')

  const category = await prisma.category.findUnique({
    where: { slug: 'fibre-arts' },
    select: { id: true, slug: true, pipelineStatus: true },
  })

  if (!category) {
    console.error('[flip-fibre-arts-ready] Category "fibre-arts" not found — run seed-categories.ts first')
    process.exit(2)
  }

  if (category.pipelineStatus === 'READY') {
    console.log('[flip-fibre-arts-ready] already READY — no-op')
    await prisma.$disconnect()
    return
  }

  if (category.pipelineStatus === 'COMPLETE') {
    console.error('[flip-fibre-arts-ready] refusing to flip: pipelineStatus is COMPLETE (the category has hit its target tutorial count). Flip back manually if this is intentional.')
    await prisma.$disconnect()
    process.exit(3)
  }

  if (category.pipelineStatus === 'PAUSED') {
    console.error('[flip-fibre-arts-ready] refusing to flip: pipelineStatus is PAUSED (admin intent). Resolve the pause before re-flipping.')
    await prisma.$disconnect()
    process.exit(4)
  }

  // NOT_READY (or anything else that arrives unexpectedly) → READY.
  console.log(
    `[flip-fibre-arts-ready] flipping pipelineStatus ${category.pipelineStatus} → READY${dryRun ? ' (dry-run — no write)' : ''}`,
  )

  if (dryRun) {
    await prisma.$disconnect()
    return
  }

  await prisma.category.update({
    where: { id: category.id },
    data: { pipelineStatus: 'READY' },
  })

  console.log('[flip-fibre-arts-ready] done — autopilot queue will pick fibre-arts up on next fire')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip-fibre-arts-ready] failed:', err)
  process.exit(1)
})
