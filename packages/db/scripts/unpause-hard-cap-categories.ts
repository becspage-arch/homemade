/**
 * One-off recovery for categories that were auto-PAUSED by the historical
 * autopilot-queue SKILL "hard chain cap" rule (now removed). The SKILL used
 * to flip `Category.pipelineStatus` to `PAUSED` after 10 consecutive
 * autopilot batches without human intervention, but had no automated
 * recovery, so any category that tripped the cap stayed stuck until an
 * admin manually flipped it back. This script does that flip for the known-
 * stuck categories (baking; cooking if still stuck).
 *
 * Safe to re-run: bails on a `--dry-run` flag, and prints what it would
 * change before mutating. After the SKILL.md change in May 2026, no new
 * runs should land in PAUSED via this path, so this script becomes a
 * one-off artefact rather than something to schedule.
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const KNOWN_STUCK = ['baking', 'cooking']

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const dryRun = process.argv.includes('--dry-run')

  const rows = await prisma.category.findMany({
    where: { slug: { in: KNOWN_STUCK }, pipelineStatus: 'PAUSED' },
    select: { id: true, slug: true, pipelineStatus: true, lastAutopilotRunAt: true },
  })

  if (rows.length === 0) {
    console.log('[unpause-hard-cap] no PAUSED categories in the known-stuck list — nothing to do.')
    await prisma.$disconnect()
    return
  }

  for (const r of rows) {
    const fire = r.lastAutopilotRunAt?.toISOString() ?? 'never'
    console.log(`[unpause-hard-cap] ${dryRun ? 'would flip' : 'flipping'} ${r.slug}: PAUSED → READY (lastAutopilotRunAt=${fire})`)
  }

  if (dryRun) {
    console.log('[unpause-hard-cap] dry-run — no writes performed.')
    await prisma.$disconnect()
    return
  }

  await prisma.category.updateMany({
    where: { id: { in: rows.map((r) => r.id) } },
    data: { pipelineStatus: 'READY' },
  })
  console.log(`[unpause-hard-cap] flipped ${rows.length} categor${rows.length === 1 ? 'y' : 'ies'} back to READY.`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
