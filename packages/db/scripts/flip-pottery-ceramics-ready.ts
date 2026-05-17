/**
 * One-shot flip: Category.pipelineStatus on `pottery-ceramics` →
 * READY, so the round-robin autopilot queue picks up Pottery on its
 * next fire.
 *
 * The taxonomy seed (`seed-pottery-ceramics-taxonomy.ts`) also flips
 * the same flag — this script exists for the case where the
 * taxonomy has already landed and only the status flip is needed,
 * or when a worker session needs an audit-trail commit of the flip
 * alone.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/flip-pottery-ceramics-ready.ts
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
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findUnique({
    where: { slug: 'pottery-ceramics' },
    select: { id: true, slug: true, pipelineStatus: true },
  })

  if (!before) {
    console.error(
      '[flip-pottery-ceramics-ready] no Category row for slug "pottery-ceramics" — run seed-categories.ts first.',
    )
    process.exit(2)
  }

  if (before.pipelineStatus === 'READY') {
    console.log(
      `[flip-pottery-ceramics-ready] already READY — no change (id=${before.id})`,
    )
    await prisma.$disconnect()
    return
  }

  const after = await prisma.category.update({
    where: { slug: 'pottery-ceramics' },
    data: { pipelineStatus: 'READY' },
    select: { id: true, slug: true, pipelineStatus: true },
  })

  console.log(
    `[flip-pottery-ceramics-ready] ${before.slug}: ${before.pipelineStatus} → ${after.pipelineStatus}`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[flip-pottery-ceramics-ready] failed:', err)
  process.exit(1)
})
