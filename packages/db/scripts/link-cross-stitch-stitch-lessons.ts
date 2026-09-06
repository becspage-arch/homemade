/**
 * Points each cross-stitch Stitch row at the published lesson that teaches it.
 *
 * The public stitch reference (`/stitches/[craft]`) resolves a stitch to its
 * lesson through `Tutorial.craftStitchSlugs`. Crochet and knitting lessons are
 * uploaded with that column populated; the cross-stitch lessons pre-date the
 * master Stitch rows for the craft, so their column is empty and every stitch
 * would render without a lesson link. This backfills it.
 *
 * Idempotent: it only writes a tutorial whose column does not already carry the
 * slug, and it merges rather than replaces, so a later upload that sets its own
 * slugs is never clobbered. Fails loudly if a stitch slug or a tutorial slug in
 * the map has gone missing, which is the signal that a rename needs following
 * through here.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/link-cross-stitch-stitch-lessons.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/link-cross-stitch-stitch-lessons.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

/**
 * Stitch slug -> the published cross-stitch lesson that teaches it.
 *
 * Long stitch and running stitch have no lesson of their own yet. They are
 * deliberately absent rather than pointed at an approximate neighbour: the
 * reference renders those rows with their steps and no lesson link, which is
 * honest, and adding the lesson later is a one-line change here.
 */
const LESSON_BY_STITCH: Record<string, string> = {
  'cross-stitch-full-cross': 'how-to-work-a-full-cross-stitch',
  'cross-stitch-half-stitch': 'how-to-work-a-half-cross-stitch',
  'cross-stitch-quarter-stitch': 'how-to-work-a-quarter-cross-stitch',
  'cross-stitch-three-quarter-stitch': 'how-to-work-a-three-quarter-cross-stitch',
  'cross-stitch-back-stitch': 'how-to-work-a-back-stitch-in-cross-stitch',
  'cross-stitch-french-knot': 'how-to-work-a-french-knot-in-cross-stitch',
  'cross-stitch-lazy-daisy': 'how-to-work-a-lazy-daisy-in-cross-stitch',
  'cross-stitch-satin-stitch': 'how-to-work-satin-stitch-in-cross-stitch',
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let written = 0
  let alreadyLinked = 0

  for (const [stitchSlug, tutorialSlug] of Object.entries(LESSON_BY_STITCH)) {
    const stitch = await prisma.stitch.findUnique({
      where: { slug: stitchSlug },
      select: { id: true },
    })
    if (!stitch) {
      throw new Error(
        `Stitch "${stitchSlug}" is not seeded. Run seed-stitches.ts --craft=cross-stitch first.`,
      )
    }

    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: tutorialSlug },
      select: { id: true, slug: true, craftStitchSlugs: true },
    })
    if (!tutorial) {
      throw new Error(`Tutorial "${tutorialSlug}" not found; the map needs updating.`)
    }

    if (tutorial.craftStitchSlugs.includes(stitchSlug)) {
      alreadyLinked++
      console.log(`[link] = ${tutorialSlug} already teaches ${stitchSlug}`)
      continue
    }

    const next = [...tutorial.craftStitchSlugs, stitchSlug]
    if (!DRY_RUN) {
      await prisma.tutorial.update({
        where: { id: tutorial.id },
        data: { craftStitchSlugs: next },
      })
    }
    written++
    console.log(`[link] + ${tutorialSlug} -> ${stitchSlug}`)
  }

  console.log(
    `\n[link] cross-stitch lessons: linked=${written} already=${alreadyLinked}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
