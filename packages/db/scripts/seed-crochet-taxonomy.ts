/**
 * One-off seed for the Crochet taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   crochet          "Crochet"
 *   SubCat     stitches         "Stitches"        (under crochet)
 *   SubCat     motifs           "Motifs"          (under crochet)
 *   SubCat     homewares        "Homewares"       (under crochet)
 *   SubCat     garments         "Garments"        (under crochet)
 *   SubCat     foundations      "Foundations"     (under crochet)
 *
 * Sub-categories per the locked Crochet breakdown in
 * `docs/crochet-author.md`. The upload-tutorial script requires both the
 * Category and any referenced SubCategory to exist before Crochet rows
 * can be inserted.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This script
 * is idempotent and slug-keyed; it never re-creates the category and
 * never touches `pipelineStatus`. The READY flip lives in
 * `flip-crochet-ready.ts` and is run as a separate auditable step after
 * the rest of the pipeline scaffolding is committed and deployed green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-taxonomy.ts --dry-run
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

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'stitches',
    name: 'Stitches',
    description:
      'Individual named stitch tutorials — chain, slip stitch, double crochet, half treble, treble, double treble, and textured stitches (bobble, shell, V-stitch, cluster, puff, popcorn).',
    order: 10,
  },
  {
    slug: 'motifs',
    name: 'Motifs',
    description:
      'In-the-round repeating shapes — granny squares, hexagons, circles, mandalas, flowers, and the joining techniques that turn individual motifs into finished pieces.',
    order: 20,
  },
  {
    slug: 'homewares',
    name: 'Homewares',
    description:
      'Finished-item patterns for the home — dishcloths, facecloths, pot holders, blankets, cushion covers, baskets, and storage vessels.',
    order: 30,
  },
  {
    slug: 'garments',
    name: 'Garments',
    description:
      'Wearable patterns — shawls, scarves, hats, mittens, socks, and simple top-down or granny-square-construction garments.',
    order: 40,
  },
  {
    slug: 'foundations',
    name: 'Foundations',
    description:
      'Long-form articles on the craft — gauge swatching, blocking, joining methods, reading a pattern chart, choosing yarn, understanding tension.',
    order: 50,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const crochet = await prisma.category.findUnique({ where: { slug: 'crochet' } })
  if (!crochet) {
    console.error(
      '[seed] crochet category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] crochet → ${crochet.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: crochet.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] crochet/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: crochet.id,
          },
        })
        console.log(`[seed] crochet/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] crochet-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
