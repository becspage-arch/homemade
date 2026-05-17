/**
 * Flip `Category.pipelineStatus` for `paper-word` from NOT_READY → READY.
 *
 * Run after the taxonomy seed + master-table additions are applied so the
 * round-robin autopilot picks Paper & word up on its next fire.
 *
 * This script is also the safe-to-rerun "is paper-word ready?" probe — if
 * the row is already READY it reports the no-op and exits zero.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-paper-word-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-paper-word-ready.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const existing = await prisma.category.findUnique({
    where: { slug: 'paper-word' },
  })

  if (!existing) {
    console.error(
      "[flip] paper-word: Category row not found. Run `seed-categories.ts` first.",
    )
    await prisma.$disconnect()
    process.exit(1)
  }

  if (existing.pipelineStatus === 'READY') {
    console.log(`[flip] paper-word: already READY (id=${existing.id}). No-op.`)
    await prisma.$disconnect()
    return
  }

  console.log(
    `[flip] paper-word: ${existing.pipelineStatus} → READY${DRY_RUN ? ' (dry-run)' : ''}`,
  )

  if (!DRY_RUN) {
    await prisma.category.update({
      where: { slug: 'paper-word' },
      data: { pipelineStatus: 'READY' },
    })
    console.log('[flip] paper-word: pipelineStatus updated.')
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip] failed:', err)
  process.exit(1)
})
