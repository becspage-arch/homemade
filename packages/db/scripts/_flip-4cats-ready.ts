/**
 * Flip pottery-ceramics, wood-natural-craft, paper-word, herbal-medicine →
 * pipelineStatus READY + lastAutopilotRunAt null.
 *
 * Run once after the DRAFTs for these 4 categories have been published.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/_flip-4cats-ready.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/_flip-4cats-ready.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

const SLUGS = [
  'pottery-ceramics',
  'wood-natural-craft',
  'paper-word',
  'herbal-medicine',
] as const

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  for (const slug of SLUGS) {
    const before = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, slug: true, pipelineStatus: true, lastAutopilotRunAt: true },
    })

    if (!before) {
      console.error(`[flip-4cats] category "${slug}" not found — run seed-categories.ts first.`)
      process.exit(2)
    }

    console.log(
      `[flip-4cats] ${slug}: pipelineStatus=${before.pipelineStatus} lastAutopilotRunAt=${before.lastAutopilotRunAt?.toISOString() ?? 'null'}`,
    )

    if (DRY_RUN) {
      console.log(`[flip-4cats] would set pipelineStatus=READY, lastAutopilotRunAt=null`)
      continue
    }

    const after = await prisma.category.update({
      where: { slug },
      data: { pipelineStatus: 'READY', lastAutopilotRunAt: null },
      select: { pipelineStatus: true, lastAutopilotRunAt: true },
    })

    console.log(
      `[flip-4cats] ${slug}: → pipelineStatus=${after.pipelineStatus} lastAutopilotRunAt=${after.lastAutopilotRunAt?.toISOString() ?? 'null'} ✔`,
    )
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip-4cats] failed:', err)
  process.exit(1)
})
