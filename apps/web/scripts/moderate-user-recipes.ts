/**
 * AI moderation pipeline - manual / CLI runner.
 *
 * The moderation logic lives in `apps/web/src/lib/recipes/recipe-moderation.ts`
 * and is shared with the five-minute Inngest cron
 * (`inngest/functions/moderate-user-recipes-cron.ts`). This script is the
 * Claude Code worker session's hands on the same queue: run it to process the
 * PENDING_AI_MODERATION rows now and read the verdicts.
 *
 * ALL moderation is AI-only per the locked rule - there is no manual editorial
 * queue anywhere in this flow. The deterministic gates (fields, voice register,
 * originality, spam, duplicate) decide approve / reject without any paid AI
 * provider (no API spend). A Claude Code worker session running this script is
 * the model in the loop for the semantic calls; the script is its harness.
 *
 * Run:
 *   pnpm --filter web exec tsx scripts/moderate-user-recipes.ts            # process queue
 *   pnpm --filter web exec tsx scripts/moderate-user-recipes.ts --dry-run  # print verdicts, write nothing
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load DATABASE_URL from the nearest .env.credentials. Inline parser rather than
// dotenv because apps/web does not depend on dotenv (importing it breaks the
// production build's type check). Walks up from this file; tolerates CRLF and
// simple quoting; never overrides an existing var.
const __dirname = dirname(fileURLToPath(import.meta.url))
let envDir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(envDir, '.env.credentials')
  if (existsSync(candidate)) {
    for (const raw of readFileSync(candidate, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
    break
  }
  const parent = dirname(envDir)
  if (parent === envDir) break
  envDir = parent
}

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { runModerationBatch } = await import('../src/lib/recipes/recipe-moderation')
  const { prisma } = await import('@homemade/db')

  const summary = await runModerationBatch({ limit: 50, dryRun: DRY_RUN })

  console.log(
    `[moderate] ${summary.pending} pending → ${summary.approved} approved, ${summary.rejected} rejected${DRY_RUN ? ' (dry run, nothing written)' : ''}`,
  )
  for (const row of summary.rows) {
    const tail = row.approved
      ? `${row.autoDetected.length ? `auto: ${row.autoDetected.join('+')}` : ''}${row.allergens.length ? ` allergens: ${row.allergens.join(',')}` : ''}`.trim()
      : `failed: ${row.failedChecks.join(', ')}`
    console.log(`  ${row.approved ? '✓' : '✗'} ${row.slug.padEnd(42)} ${row.verdict.padEnd(18)} ${tail}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
