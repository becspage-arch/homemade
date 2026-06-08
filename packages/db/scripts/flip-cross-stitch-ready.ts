/**
 * Flip cross-stitch into the autopilot rotation.
 *
 * Sets:
 *   targetTutorialCount = 230 (50 fundamental technique + 80 project +
 *     50 troubleshooting/finishing/care + 50 inspiration/themed).
 *     Pattern-led category — the Stitching Mama library is the primary
 *     draw, so we don't over-anchor on a high tutorial count.
 *   pipelineStatus      = READY
 *   isPublicVisible     = true (already set by Phase C; re-asserted here)
 *
 * Idempotent — safe to re-run; values are set absolutely, not toggled.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-cross-stitch-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-cross-stitch-ready.ts --dry-run
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

const TARGET_TUTORIAL_COUNT = 230

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'cross-stitch' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      isPublicVisible: true,
    },
  })
  if (!before) {
    throw new Error('cross-stitch Category row not present')
  }
  console.log('[flip] before:', before)

  if (DRY_RUN) {
    console.log('[flip] would set pipelineStatus=READY, targetTutorialCount=' + TARGET_TUTORIAL_COUNT)
    console.log('  (dry-run)')
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { slug: 'cross-stitch' },
    data: {
      pipelineStatus: 'READY',
      targetTutorialCount: TARGET_TUTORIAL_COUNT,
      isPublicVisible: true,
    },
    select: {
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      isPublicVisible: true,
    },
  })
  console.log('[flip] after :', after)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip] failed:', err)
  process.exit(1)
})
