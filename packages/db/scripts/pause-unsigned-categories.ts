/**
 * Make pipelineStatus the real autopilot gate.
 *
 * The autopilot round-robin picks any Category with pipelineStatus = 'READY'.
 * Per the locked per-category sign-off flow, only cooking + baking should be
 * authoring; every other category waits for its 7-step sign-off pass before it
 * flips back to READY. This script enforces that in data: it PAUSEs every
 * category currently at READY except the allow set.
 *
 * Behaviour:
 *   - ALLOW-READY set = { 'cooking', 'baking' } — left untouched.
 *   - Every other category at pipelineStatus = 'READY' is set to 'PAUSED'.
 *     Driven off the live READY set, not a hard-coded list.
 *   - NOT_READY / COMPLETE rows are never touched.
 *   - Idempotent — a second run flips zero rows.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/pause-unsigned-categories.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/pause-unsigned-categories.ts --dry-run
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

/** Only these two categories stay READY; every other READY row is paused. */
const ALLOW_READY = new Set(['cooking', 'baking'])

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.category.findMany({
    select: { slug: true, pipelineStatus: true },
    orderBy: { slug: 'asc' },
  })

  // Drive the flip off the live READY set, minus the allow set.
  const toPause = before
    .filter((c) => c.pipelineStatus === 'READY' && !ALLOW_READY.has(c.slug))
    .map((c) => c.slug)

  if (!DRY_RUN && toPause.length > 0) {
    await prisma.category.updateMany({
      where: { slug: { in: toPause }, pipelineStatus: 'READY' },
      data: { pipelineStatus: 'PAUSED' },
    })
  }

  const after = await prisma.category.findMany({
    select: { slug: true, pipelineStatus: true },
    orderBy: { slug: 'asc' },
  })
  const afterBySlug = new Map(after.map((c) => [c.slug, c.pipelineStatus]))

  // Before/after table.
  const pad = (s: string, n: number) => s.padEnd(n)
  console.log(DRY_RUN ? '[pause] DRY RUN — no writes\n' : '[pause] applied\n')
  console.log(pad('slug', 24), pad('old', 12), 'new')
  console.log('-'.repeat(48))
  for (const row of before) {
    const newStatus = afterBySlug.get(row.slug) ?? row.pipelineStatus
    const changed = newStatus !== row.pipelineStatus ? '  <- flipped' : ''
    console.log(pad(row.slug, 24), pad(row.pipelineStatus, 12), newStatus + changed)
  }

  console.log(
    `\n[pause] ${DRY_RUN ? 'would flip' : 'flipped'} ${toPause.length} READY category(ies) to PAUSED` +
      (toPause.length ? ': ' + toPause.join(', ') : '') +
      `\n[pause] kept READY (allow set present): ` +
      [...ALLOW_READY].filter((s) => afterBySlug.get(s) === 'READY').join(', '),
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[pause] failed:', err)
  process.exit(1)
})
