/**
 * One-off — show the actual tricolon strings still flagged by the updated
 * voice-check-lib containsTricolon() after the manual fix pass.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/_check-remaining-tricolons.ts
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src/index.js'
import { runVoiceCheck } from './voice-check-lib.js'

async function main(): Promise<void> {
  const rows = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, title: true, subtitle: true, excerpt: true, sourceNotes: true, body: true },
    orderBy: { slug: 'asc' },
  })

  let totalTricolons = 0
  for (const t of rows) {
    const report = runVoiceCheck({ subtitle: t.subtitle, excerpt: t.excerpt, sourceNotes: t.sourceNotes, body: t.body })
    const tricolons = report.warnings.filter((w) => w.kind === 'tricolon')
    if (tricolons.length === 0) continue
    totalTricolons += tricolons.length
    console.log(`\n=== ${t.slug} (${tricolons.length})`)
    for (const w of tricolons) {
      console.log(`  ${w.path} — ${w.message}`)
    }
  }
  console.log(`\nTotal remaining tricolon warnings: ${totalTricolons}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => { console.error(err); return prisma.$disconnect().then(() => process.exit(1)) })
