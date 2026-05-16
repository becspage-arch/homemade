/**
 * Tricolon manual fix-up — 15 genuine voice-tell rewrites.
 *
 * The 2026-05-16 audit flagged 529 tricolon warnings. After reading the full
 * tricolon-defer-list.md (574 matches across 312 tutorials), the overwhelming
 * majority are content lists — ingredient listings, recipe instruction steps,
 * geographic place sequences — where the three items are genuinely distinct
 * and removing one deletes information.
 *
 * This script applies targeted minimum-change rewrites to the ~15 entries
 * that are genuine stylistic tells (descriptor adjective tricolons where
 * "X and Y" captures the meaning better than "X, Y, and Z").
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-tricolons-manual.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-tricolons-manual.ts --dry-run
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
  find: string
  replace: string
}

const FIXES: Fix[] = [
  // "quicker, less messy, and healthier" → drop "healthier" (implied by "less messy")
  {
    slug: 'air-fryer-fish-fillets',
    find: 'quicker, less messy, and healthier without sacrificing',
    replace: 'quicker and less messy without sacrificing',
  },
  // Three descriptor adjectives — "rich" is the weakest of the three
  {
    slug: 'avgolemono-soup',
    find: 'silky, rich, and sharp without any cream',
    replace: 'silky and sharp without any cream',
  },
  // Comparative adjectives — "denser" is covered by "richer"
  {
    slug: 'baked-vanilla-cheesecake',
    find: 'richer, denser, and significantly more satisfying',
    replace: 'richer and more satisfying',
  },
  // "glossy" adds little to "smooth and lump-free" in a batter context
  {
    slug: 'baked-vanilla-cheesecake',
    find: 'smooth, glossy, and completely lump-free',
    replace: 'smooth and lump-free',
  },
  // "quick" is weakest of the three for a smoothie context
  {
    slug: 'berry-smoothie',
    find: 'inexpensive, quick, and consistent across seasons',
    replace: 'inexpensive and consistent across seasons',
  },
  // "deeply satisfying" is the point — "fast" is secondary
  {
    slug: 'classic-brownies',
    find: 'simple, fast, and deeply satisfying',
    replace: 'simple and satisfying',
  },
  // "soft" is weaker than the tactile "smooth" and "faintly tacky"
  {
    slug: 'english-muffins-griddle',
    find: 'smooth, soft, and only faintly tacky',
    replace: 'smooth and only faintly tacky',
  },
  // "lumpy" is the distinctive batter property — "freshly mixed" is secondary
  {
    slug: 'fish-and-chips',
    find: 'cold, lumpy, and freshly mixed',
    replace: 'cold and freshly mixed',
  },
  // "richer" is captured by the contrast with sachets/cocoa — drop
  {
    slug: 'hot-chocolate',
    find: 'It is thicker, richer, and less sweet',
    replace: 'It is thicker and less sweet',
  },
  // "thick" is already implied by "dark" sauce at that reduction stage
  {
    slug: 'khoresh-fesenjan',
    find: 'dark, thick, and glossy',
    replace: 'dark and glossy',
  },
  // "warm" describes the spice note — captured by context; drop
  {
    slug: 'lamb-tagine-with-apricots',
    find: 'savoury, warm, and softly sweet',
    replace: 'savoury and softly sweet',
  },
  // "more aromatic" is the weakest differentiator for homemade lemonade
  {
    slug: 'lemonade',
    find: 'sharper, more aromatic, and less sweet',
    replace: 'sharper and less sweet',
  },
  // "individual" is implied by "small" mince pies
  {
    slug: 'mince-pies',
    find: 'small, individual, and entirely sweet',
    replace: 'small and entirely sweet',
  },
  // "flat" is a consequence of "tough" — implied
  {
    slug: 'plain-scones',
    find: 'tough, flat, and chewy',
    replace: 'tough and chewy',
  },
  // "unapologetically filling" is the AI-ish phrase — "thick and smoky" says it
  {
    slug: 'slow-cooker-pea-and-ham-soup',
    find: 'thick, smoky, and unapologetically filling',
    replace: 'thick and smoky',
  },
]

const dryRun = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  console.log(`fixup-tricolons-manual: dryRun=${dryRun}, fixes=${FIXES.length}`)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  // Group fixes by slug so we load each tutorial once.
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

    // Apply all fixes for this slug to the stringified body JSON.
    // String replacement on JSON is safe here: the needle strings are prose
    // substrings within JSON string values and contain no JSON metacharacters.
    let bodyJson = JSON.stringify(t.body)
    let changed = false
    for (const fix of fixes) {
      if (!bodyJson.includes(fix.find)) {
        console.log(`  NO MATCH  ${slug}  "${fix.find.slice(0, 60)}"`)
        noMatch += 1
        continue
      }
      bodyJson = bodyJson.replace(fix.find, fix.replace)
      totalRewritten += 1
      console.log(`  REWRITE   ${slug}  "${fix.find.slice(0, 55)}" → "${fix.replace.slice(0, 55)}"`)
      changed = true
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
          changeNote: `fixup-tricolons-manual: ${fixes.length} voice-tell tricolon(s) softened`,
        },
      })
      await tx.tutorial.update({
        where: { id: t.id },
        data: { body: newBody },
      })
    })

    console.log(`  SAVED     ${slug}`)
  }

  if (!dryRun && totalRewritten > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.fixup-tricolons-manual',
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
