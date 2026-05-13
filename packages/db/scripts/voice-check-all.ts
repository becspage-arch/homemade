/**
 * voice-check-all — periodic spot-check across every Published Tutorial.
 *
 * Walks the Tutorial table, pulls the body JSON for each PUBLISHED row, runs
 * the deterministic Section 6b rules over it, and reports tutorials with any
 * errors or warnings. Not run in CI by default — invoked on demand or by a
 * future Inngest job.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check-all.ts
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check-all.ts --include-drafts
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check-all.ts --json
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(process.cwd(), '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

interface CliFlags {
  includeDrafts: boolean
  json: boolean
}

function parseArgs(argv: string[]): CliFlags {
  let includeDrafts = false
  let json = false
  for (const arg of argv) {
    if (arg === '--include-drafts') includeDrafts = true
    else if (arg === '--json') json = true
  }
  return { includeDrafts, json }
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2))

  const { prisma, TutorialStatus } = await import('../src/index.js')

  const statuses = flags.includeDrafts
    ? [TutorialStatus.PUBLISHED, TutorialStatus.DRAFT, TutorialStatus.IN_REVIEW]
    : [TutorialStatus.PUBLISHED]

  const tutorials = await prisma.tutorial.findMany({
    where: { status: { in: statuses } },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      sourceNotes: true,
      body: true,
      status: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  let totalErrors = 0
  let totalWarnings = 0
  const rows: Array<{
    slug: string
    title: string
    status: string
    errors: number
    warnings: number
  }> = []

  for (const t of tutorials) {
    const report = runVoiceCheck({
      subtitle: t.subtitle,
      excerpt: t.excerpt,
      sourceNotes: t.sourceNotes,
      body: t.body,
    })
    totalErrors += report.errors.length
    totalWarnings += report.warnings.length
    if (report.errors.length === 0 && report.warnings.length === 0) continue
    rows.push({
      slug: t.slug,
      title: t.title,
      status: String(t.status),
      errors: report.errors.length,
      warnings: report.warnings.length,
    })
  }

  if (flags.json) {
    process.stdout.write(
      JSON.stringify(
        {
          scanned: tutorials.length,
          totalErrors,
          totalWarnings,
          tutorials: rows,
        },
        null,
        2,
      ) + '\n',
    )
  } else {
    console.log(`voice-check-all: scanned ${tutorials.length} tutorials`)
    console.log(`  total errors: ${totalErrors}`)
    console.log(`  total warnings: ${totalWarnings}`)
    if (rows.length === 0) {
      console.log('  no hits')
    } else {
      for (const r of rows) {
        console.log(`  ${r.status.padEnd(10)} ${r.slug} — ${r.errors} errors, ${r.warnings} warnings`)
      }
      console.log('')
      console.log('Re-run voice-check on a single draft to see the detail:')
      console.log('  pnpm --filter @homemade/db exec tsx scripts/voice-check.ts <draft.json>')
    }
  }

  await prisma.$disconnect()
  process.exit(totalErrors > 0 ? 1 : 0)
}

main().catch(async (err) => {
  console.error(`voice-check-all: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
