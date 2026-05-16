/**
 * Tricolon manual fix-up pass 2 — 9 genuine voice-tell rewrites.
 *
 * After tightening containsTricolon() in voice-check-lib.ts and applying
 * the 15 rewrites in fixup-tricolons-manual.ts, 38 warnings remained.
 * Of those, the majority are recipe instruction steps, ingredient/topic
 * lists, or multi-dimensional state descriptions that are not stylistic.
 *
 * This script fixes the 9 genuine adjective-descriptor tricolons that
 * survived the filter, mostly in excerpts.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-tricolons-manual-2.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-tricolons-manual-2.ts --dry-run
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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'
import type { Prisma } from '@prisma/client'

interface Fix {
  slug: string
  field: 'excerpt' | 'body'
  find: string
  replace: string
}

const FIXES: Fix[] = [
  // "glossy" adds nothing to a chutney excerpt — "thick and dark" captures the texture and colour
  {
    slug: 'apple-chutney',
    field: 'excerpt',
    find: 'thick, glossy, and dark',
    replace: 'thick and dark',
  },
  // "deeply coloured" is redundant in a beetroot soup excerpt
  {
    slug: 'borscht',
    field: 'excerpt',
    find: 'earthy, substantial, and deeply coloured',
    replace: 'earthy and substantial',
  },
  // "sharp" is already implied by the spice mix — "fruity and creamy" carries the contrast
  {
    slug: 'coronation-chicken',
    field: 'body',
    find: 'fruity, sharp, and creamy',
    replace: 'fruity and creamy',
  },
  // "fresh" is secondary — "hot and drained" is the preparation state
  {
    slug: 'eggs-benedict',
    field: 'body',
    find: 'hot, fresh, and drained',
    replace: 'hot and drained',
  },
  // "very good" is the weakest closer — "filling and warming" carries the meaning
  {
    slug: 'harira-soup',
    field: 'excerpt',
    find: 'filling, warming, and very good',
    replace: 'filling and warming',
  },
  // "sweet" is carried by the tamarind context — "hot and sour" is the distinctive contrast
  {
    slug: 'lamb-dhansak',
    field: 'excerpt',
    find: 'hot, sweet, and sour at once',
    replace: 'hot and sour at once',
  },
  // "white" is an expected marshmallow property — "thick and airy" captures the texture
  {
    slug: 'marshmallows-vanilla',
    field: 'excerpt',
    find: 'thick, white, and airy',
    replace: 'thick and airy',
  },
  // "bright pink" is obvious for pickled red onions — "sharp and crunchy" is the useful descriptor
  {
    slug: 'quick-pickled-red-onions',
    field: 'excerpt',
    find: 'bright pink, sharp, and crunchy',
    replace: 'sharp and crunchy',
  },
  // "warm" is the weakest — "Earthy and substantial" names the soup's character
  {
    slug: 'sweet-potato-soup',
    field: 'excerpt',
    find: 'Earthy, warm, and substantial',
    replace: 'Earthy and substantial',
  },
]

const dryRun = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  console.log(`fixup-tricolons-manual-2: dryRun=${dryRun}, fixes=${FIXES.length}`)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const bySlugs = new Map<string, Fix[]>()
  for (const f of FIXES) {
    const existing = bySlugs.get(f.slug) ?? []
    existing.push(f)
    bySlugs.set(f.slug, existing)
  }

  let totalRewritten = 0
  let notFound = 0
  let noMatch = 0

  for (const [slug, fixes] of bySlugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, subtitle: true, excerpt: true, body: true, status: true },
    })
    if (!t) {
      console.log(`  SKIP ${slug} — tutorial not found`)
      notFound += 1
      continue
    }

    let bodyJson = JSON.stringify(t.body)
    let excerpt = t.excerpt ?? ''
    let changed = false

    for (const fix of fixes) {
      if (fix.field === 'excerpt') {
        if (!excerpt.includes(fix.find)) {
          console.log(`  NO MATCH  ${slug} [excerpt]  "${fix.find.slice(0, 60)}"`)
          noMatch += 1
          continue
        }
        excerpt = excerpt.replace(fix.find, fix.replace)
        totalRewritten += 1
        console.log(`  REWRITE   ${slug} [excerpt]  "${fix.find.slice(0, 55)}" → "${fix.replace.slice(0, 55)}"`)
        changed = true
      } else {
        if (!bodyJson.includes(fix.find)) {
          console.log(`  NO MATCH  ${slug} [body]  "${fix.find.slice(0, 60)}"`)
          noMatch += 1
          continue
        }
        bodyJson = bodyJson.replace(fix.find, fix.replace)
        totalRewritten += 1
        console.log(`  REWRITE   ${slug} [body]  "${fix.find.slice(0, 55)}" → "${fix.replace.slice(0, 55)}"`)
        changed = true
      }
    }

    if (!changed) continue
    if (dryRun) {
      console.log(`  DRY-RUN   ${slug} — would update`)
      continue
    }

    const newBody = JSON.parse(bodyJson) as Prisma.InputJsonValue

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          excerpt: t.excerpt,
          body: t.body as Prisma.InputJsonValue,
          status: t.status,
          authorId: author.id,
          changeNote: `fixup-tricolons-manual-2: ${fixes.length} voice-tell tricolon(s) softened`,
        },
      })

      const updateData: Prisma.TutorialUpdateInput = { body: newBody }
      const excerptChanged = fixes.some((f) => f.field === 'excerpt')
      if (excerptChanged) updateData.excerpt = excerpt

      await tx.tutorial.update({
        where: { id: t.id },
        data: updateData,
      })
    })

    console.log(`  SAVED     ${slug}`)
  }

  if (!dryRun && totalRewritten > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.fixup-tricolons-manual-2',
        resource: 'tutorials',
        metadata: {
          runDate: new Date().toISOString().slice(0, 10),
          totalRewritten,
          notFound,
          noMatch,
        } as Prisma.InputJsonValue,
      },
    })
  }

  console.log(`\nDONE`)
  console.log(`  fixes attempted: ${FIXES.length}`)
  console.log(`  rewrites applied: ${totalRewritten}`)
  console.log(`  not-found slugs: ${notFound}`)
  console.log(`  no-match strings: ${noMatch}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
