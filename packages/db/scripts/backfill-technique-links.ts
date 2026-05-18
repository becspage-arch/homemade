/**
 * backfill-technique-links — one-time reverse-sweep across the entire
 * published catalogue.
 *
 * Phase technique-linking ships in two pieces. Worker C added the
 * `Tutorial.techniqueSlugs` + `criticalTechniques` columns and updated
 * the author prompts so newly-authored recipes populate them. This
 * script closes the historical gap — it runs the same sweep logic the
 * Inngest function uses against every already-PUBLISHED technique, so
 * recipes that landed before the inline-link infrastructure existed
 * pick up their slugs in one pass.
 *
 * After the splash-gate launch, the Inngest function carries the load:
 * every newly-published technique sweeps the catalogue on its way out.
 * This script is the bridge from "nothing annotated yet" to "the
 * Inngest function only sees forward-going work".
 *
 * Idempotent. Re-running over a partially-annotated database is fine —
 * `sweepForTechnique` only appends a slug to rows that don't already
 * carry it.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-technique-links.ts
 */

import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Repo root is three levels up from packages/db/scripts
loadEnv({ path: resolve(__dirname, '../../..', '.env.credentials') })

// Imports that touch process.env (via the Prisma adapter) must run *after*
// loadEnv. Same pattern as `typesense-backfill.ts`.
const { prisma, TutorialStatus, TutorialType, sweepForTechnique } = await import(
  '../src/index.js'
)

interface PerTechnique {
  slug: string
  title: string
  categorySlug: string
  recipesAnnotated: number
  candidatesConsidered: number
  sampleTitles: string[]
}

async function main(): Promise<void> {
  const techniques = await prisma.tutorial.findMany({
    where: {
      type: TutorialType.TECHNIQUE,
      status: TutorialStatus.PUBLISHED,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      aliases: true,
      categoryId: true,
      category: { select: { slug: true } },
    },
    orderBy: [{ category: { slug: 'asc' } }, { slug: 'asc' }],
  })

  console.log(
    `[backfill-technique-links] sweeping ${techniques.length} published techniques`,
  )

  const summaries: PerTechnique[] = []
  let totalRecipesAnnotated = 0

  for (const technique of techniques) {
    const result = await sweepForTechnique(prisma, {
      id: technique.id,
      slug: technique.slug,
      title: technique.title,
      aliases: technique.aliases,
      categoryId: technique.categoryId,
    })
    totalRecipesAnnotated += result.recipesAnnotated
    summaries.push({
      slug: technique.slug,
      title: technique.title,
      categorySlug: technique.category.slug,
      recipesAnnotated: result.recipesAnnotated,
      candidatesConsidered: result.candidatesConsidered,
      sampleTitles: result.sampleTitles,
    })

    // Stream per-technique progress so an operator watching the long
    // catalogue sweep can see it advancing.
    const status =
      result.recipesAnnotated > 0
        ? `+${result.recipesAnnotated}`
        : '  0'
    console.log(
      `  [${status}] ${technique.category.slug}/${technique.slug}  (${result.candidatesConsidered} candidates)`,
    )
  }

  // Final summary, sorted highest-impact first so the operator can
  // eyeball the techniques that did the most work.
  summaries.sort((a, b) => b.recipesAnnotated - a.recipesAnnotated)
  console.log('')
  console.log('============================================================')
  console.log(`techniques processed       : ${summaries.length}`)
  console.log(`recipes annotated (total)  : ${totalRecipesAnnotated}`)
  console.log('============================================================')
  console.log('')
  console.log('Top sweeps (techniques that annotated the most recipes):')
  for (const s of summaries.slice(0, 20)) {
    if (s.recipesAnnotated === 0) break
    console.log(
      `  +${s.recipesAnnotated.toString().padStart(3)}  ${s.categorySlug}/${s.slug}`,
    )
    for (const title of s.sampleTitles.slice(0, 3)) {
      console.log(`           · ${title}`)
    }
  }
  console.log('')
  console.log('Done.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
