/**
 * Upload the eight cross-stitch READING pieces, in order. Each piece runs
 * through the same voice-check + completeness + makeability gates as any
 * other tutorial upload (via `uploadTutorial`) — nothing here bypasses them.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-readings/upload-all.ts [--status DRAFT]
 *
 * Defaults to --status PUBLISHED (these are meant to go live once they pass
 * every gate). Pass --status DRAFT to check the gates without publishing.
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

import piece01 from './01-fabric-and-count.js'
import piece02 from './02-floss-and-strands.js'
import piece03 from './03-needles-hoops-frames.js'
import piece04 from './04-starting-finishing-thread.js'
import piece05 from './05-chart-key-explained.js'
import piece06 from './06-backstitch-knots-fractional.js'
import piece07 from './07-washing-pressing-framing.js'
import piece08 from './08-choosing-first-pattern.js'

const PIECES = [piece01, piece02, piece03, piece04, piece05, piece06, piece07, piece08]

async function main() {
  const statusFlagIndex = process.argv.indexOf('--status')
  const desiredStatus =
    statusFlagIndex !== -1 && process.argv[statusFlagIndex + 1] === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'

  const { uploadTutorial } = await import('../upload-tutorial.js')
  const { runVoiceCheck, exitCodeFor, formatReport } = await import('../voice-check-lib.js')

  let blocked = 0
  let published = 0
  let failed = 0

  for (const input of PIECES) {
    console.log(`\n=== ${input.slug} ===`)
    const report = runVoiceCheck(input as never)
    const code = exitCodeFor(report)
    for (const line of formatReport(report).split('\n')) console.log(`  ${line}`)
    if (code === 2) {
      console.error(`  BLOCKED by voice-check — not uploading ${input.slug}`)
      failed += 1
      continue
    }
    try {
      const result = await uploadTutorial(input as never, __filename, desiredStatus)
      console.log(
        `  [${result.mode}] status=${result.status} hero=${result.heroMediaId ?? 'none'}` +
          (result.createdGlossary.length
            ? ` glossary-created=${result.createdGlossary.map((g) => g.slug).join(',')}`
            : ''),
      )
      if (desiredStatus === 'PUBLISHED' && result.status !== 'PUBLISHED') {
        blocked += 1
      } else if (result.status === 'PUBLISHED') {
        published += 1
      }
    } catch (err) {
      failed += 1
      console.error(`  FAILED: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\n[xs-readings upload-all] published=${published} blocked=${blocked} failed=${failed} of ${PIECES.length}`)

  const { prisma } = await import('../../src/index.js')
  await prisma.$disconnect()

  if (failed > 0 || blocked > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error('[xs-readings upload-all] fatal:', err)
  process.exit(1)
})
