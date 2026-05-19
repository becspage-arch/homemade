/**
 * One-off verification script: runs the updated voice-check against the three
 * tutorials Rebecca flagged on 2026-05-19.
 *
 * Usage:
 *   pnpm --filter @homemade/db exec tsx scripts/voice-check-3-flagged.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

import { formatReport, runVoiceCheck } from './voice-check-lib.js'

const SLUGS = [
  'lavender-beeswax-balm',
  'building-a-three-bin-hot-compost-system',
  'reupholstering-a-drop-in-dining-chair-seat',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  for (const slug of SLUGS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
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
    })

    if (!t) {
      console.log(`\n=== ${slug} ===`)
      console.log('NOT FOUND in database (may be under a different slug)')
      continue
    }

    // glossaryTerms live in a separate GlossaryTerm table joined through
    // TutorialGlossaryTerm — fetch them to pass to the coverage check.
    const glossaryTerms = await prisma.glossaryTerm
      .findMany({
        where: { tutorials: { some: { id: t.id } } },
        select: { slug: true, term: true, definition: true },
      })
      .catch(() => []) // table may not exist in this env; fall back gracefully

    const report = runVoiceCheck({
      title: t.title,
      subtitle: t.subtitle ?? undefined,
      excerpt: t.excerpt ?? undefined,
      sourceNotes: t.sourceNotes ?? undefined,
      glossaryTerms,
      body: t.body,
    })

    console.log(`\n=== ${t.title} (${t.slug}) [${t.status}] ===`)
    console.log(formatReport(report))
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
