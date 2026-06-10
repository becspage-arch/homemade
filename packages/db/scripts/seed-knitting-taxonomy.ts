/**
 * One-off seed for the Knitting sub-category taxonomy.
 *
 * The `knitting` Category itself is already seeded by `seed-categories.ts`
 * (launchOrder 7). This script owns the sub-category list so the upload-
 * tutorial script has somewhere to land STITCH and PATTERN rows.
 *
 * Two axes co-exist:
 *
 *   - Project-shape sub-cats (stitches, foundations, scarves-shawls, hats,
 *     dishcloths-homewares, baby, blankets, socks, garments) — primary
 *     navigation matching how knitters actually search ("a hat", "a
 *     blanket", "a sock").
 *   - Technique-discipline sub-cats (colourwork, lace, cable-aran,
 *     brioche-doubleknit, specialty) — secondary navigation for knitters
 *     who search by technique ("Fair Isle hat", "Estonian lace shawl",
 *     "brioche cowl").
 *
 * The two axes are not mutually exclusive — a colourwork hat sits under
 * `hats` for project-shape browse and under `colourwork` for technique
 * browse. `craftTechniqueTags` on the Tutorial row handles per-row
 * cross-tagging beyond the sub-category assignment.
 *
 * Garment grading is in scope from K-8 onward (custom grading library +
 * Patterns batch). The `garments` sub-category was seeded ahead of the
 * grading work to avoid a follow-up migration.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-taxonomy.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // Content-type sub-cats (kept from K-1). STITCH and TECHNIQUE / FOUNDATION
  // typed tutorials sit here, not under project-shape sub-cats. Both pre-
  // date K-4 and stay because they have authored content under them.
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'stitches',
    name: 'Stitches',
    description: 'Single-stitch tutorials — knit, purl, k2tog, cables, lace.',
    order: 10,
  },
  {
    slug: 'foundations',
    name: 'Foundations',
    description:
      'Casting on, casting off, reading a chart, choosing yarn and needles, gauge swatching, blocking.',
    order: 20,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Project-shape sub-cats (K-4 spec, K-5 lifted the sweater / vest / sock
  // gate). One sub-cat per finished-piece shape. Each maps to its own
  // author prompt under `docs/knitting-<slug>-author.md`. All nine
  // project-shape sub-cats are now fully-guided and autopilot-enabled.
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'scarf-cowl',
    name: 'Scarves & cowls',
    description: 'Scarves, infinity scarves, hooded cowls, classic cowls.',
    order: 30,
  },
  {
    slug: 'hat',
    name: 'Hats',
    description: 'Beanies, slouchy hats, fitted hats, bucket hats, berets, watchcaps, earflap hats.',
    order: 40,
  },
  {
    slug: 'mitt-glove',
    name: 'Mitts & gloves',
    description:
      'Fingerless mitts, full mittens, gloves with fingers, convertible mitts, wrist warmers.',
    order: 50,
  },
  {
    slug: 'shawl-wrap',
    name: 'Shawls & wraps',
    description:
      'Triangular, semicircular, asymmetric, Faroese, half-pi shawls, rectangular stoles.',
    order: 60,
  },
  {
    slug: 'blanket',
    name: 'Blankets',
    description:
      'Afghans, throws, baby blankets, modular mitred-square blankets, log-cabin blankets.',
    order: 70,
  },
  {
    slug: 'accessory-other',
    name: 'Accessories (other)',
    description: 'Bags, headbands, leg warmers, scrunchies, bookmarks, mug cosies, phone pouches.',
    order: 80,
  },
  {
    slug: 'sweater-cardigan',
    name: 'Sweaters & cardigans',
    description: 'Pullovers and cardigans across six construction shapes: top-down raglan, top-down circular yoke, bottom-up set-in, drop-shoulder, side-to-side, contiguous set-in.',
    order: 90,
  },
  {
    slug: 'vest',
    name: 'Vests',
    description: 'Sleeveless garments: yoke vests, set-in armhole vests, tabards.',
    order: 100,
  },
  {
    slug: 'sock',
    name: 'Socks',
    description:
      'Cuff-down and toe-up socks across five heel constructions: flap-and-gusset, German short-row, Japanese short-row, Dutch short-row, afterthought.',
    order: 110,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Technique-discipline sub-cats (K-1 added; K-4 makes autopilot-routable).
  // Cross-cut with project-shape sub-cats: a Fair Isle hat sits under `hat`
  // for project-shape browse and under `colourwork` for technique browse.
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'colourwork',
    name: 'Colourwork',
    description: 'Fair Isle, Bohus, Scandinavian, Latvian, intarsia, mosaic, stranded yokes.',
    order: 200,
  },
  {
    slug: 'lace',
    name: 'Lace',
    description: 'Shetland, Estonian, Russian, Faroese, Orenburg lace shawls and stoles.',
    order: 210,
  },
  {
    slug: 'cable-aran',
    name: 'Cables & Aran',
    description:
      'Cabled sweaters, Aran jumpers, Bavarian twisted-stitch, Saxon and Celtic cable panels.',
    order: 220,
  },
  {
    slug: 'brioche-doubleknit',
    name: 'Brioche & double-knit',
    description: 'One-colour and two-colour brioche, double-knitting, reversible fabrics.',
    order: 230,
  },
  {
    slug: 'specialty',
    name: 'Specialty',
    description: 'Entrelac, modular and mitred work, magic loop, short rows, i-cord, steeking.',
    order: 240,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // K-1 project-shape sub-cats kept for back-compat with already-authored
  // rows (currently 3 tutorials sit under `foundations` and
  // `dishcloths-homewares`). New autopilot fires route to the K-4 spec sub-
  // cats above. autopilotEnabled stays false on these.
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'scarves-shawls',
    name: 'Scarves & shawls (legacy)',
    description: 'Pre-K-4 catch-all for scarves and shawls. New rows route to scarf-cowl or shawl-wrap.',
    order: 300,
  },
  {
    slug: 'hats',
    name: 'Hats (legacy)',
    description: 'Pre-K-4 hats sub-cat. New rows route to hat.',
    order: 310,
  },
  {
    slug: 'dishcloths-homewares',
    name: 'Dishcloths & homewares (legacy)',
    description: 'Pre-K-4 catch-all. New rows route to accessory-other.',
    order: 320,
  },
  {
    slug: 'baby',
    name: 'Baby (legacy)',
    description: 'Pre-K-4 baby catch-all. New rows route to the appropriate project-shape sub-cat.',
    order: 330,
  },
  {
    slug: 'blankets',
    name: 'Blankets (legacy)',
    description: 'Pre-K-4 blankets sub-cat. New rows route to blanket.',
    order: 340,
  },
  {
    slug: 'socks',
    name: 'Socks (legacy)',
    description: 'Pre-K-4 socks sub-cat. New rows route to sock (autopilot off pending K-5).',
    order: 350,
  },
  {
    slug: 'garments',
    name: 'Garments (legacy)',
    description: 'Pre-K-4 garments catch-all. New rows route to sweater-cardigan or vest (autopilot off pending K-5).',
    order: 360,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const knitting = await prisma.category.upsert({
    where: { slug: 'knitting' },
    create: {
      slug: 'knitting',
      name: 'Knitting',
      description: 'Stitches, techniques, and patterns.',
      order: 70,
    },
    update: {},
  })
  console.log(`[seed] knitting → ${knitting.id}`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: knitting.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: knitting.id,
      },
      update: {},
    })
    console.log(`[seed] knitting/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
