/**
 * One-off seed for the Sewing taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   sewing                          "Sewing"
 *   SubCat     techniques                      "Techniques"                    (under sewing)
 *   SubCat     aprons-pinafores                "Aprons & pinafores"            (under sewing)
 *   SubCat     bags-storage                    "Bags & storage"                (under sewing)
 *   SubCat     homewares-soft-furnishing       "Homewares & soft furnishing"   (under sewing)
 *   SubCat     curtains-blinds                 "Curtains & blinds"             (under sewing)
 *   SubCat     baby-children                   "Baby & children"               (under sewing)
 *   SubCat     soft-toys                       "Soft toys"                     (under sewing)
 *   SubCat     kitchen-table-linens            "Kitchen & table linens"        (under sewing)
 *   SubCat     mending-visible-mending         "Mending & visible mending"     (under sewing)
 *   SubCat     quilting                        "Quilting"                      (under sewing)
 *   SubCat     reusable-household              "Reusable household"            (under sewing)
 *   SubCat     christmas-seasonal              "Christmas & seasonal"          (under sewing)
 *   SubCat     simple-clothing-rectangles      "Simple clothing from rectangles" (under sewing)
 *   SubCat     accessories-small-projects      "Accessories & small projects"  (under sewing)
 *   SubCat     pet-items                       "Pet items"                     (under sewing)
 *
 * The Category itself was seeded earlier by `seed-categories.ts`. This script
 * is idempotent and slug-keyed; it never re-creates the category and
 * never touches `pipelineStatus`. The READY flip lives in
 * `flip-sewing-ready.ts` and is run as a separate auditable step after
 * the rest of the pipeline scaffolding is committed and deployed green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-taxonomy.ts --dry-run
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
  {
    slug: 'techniques',
    name: 'Techniques',
    description:
      'Hand-stitch types, machine-stitch fundamentals, seam + hem + edge finishes, closures, gathering and pleating, fabric prep and pattern marking. The foundational skills every PATTERN tutorial cross-links back to.',
    order: 10,
  },
  {
    slug: 'aprons-pinafores',
    name: 'Aprons & pinafores',
    description:
      'Full-bib aprons, half aprons, French-bistro aprons, gardener aprons with pockets, child aprons, smock-style pinafores. All built from rectangles plus straps.',
    order: 20,
  },
  {
    slug: 'bags-storage',
    name: 'Bags & storage',
    description:
      'Drawstring bags, tote bags, project bags, market and produce bags, pencil cases, makeup and wash bags, toiletry rolls, fabric storage baskets.',
    order: 30,
  },
  {
    slug: 'homewares-soft-furnishing',
    name: 'Homewares & soft furnishing',
    description:
      'Cushion covers (envelope, zip, button-back), bolster covers, hot-water-bottle covers, oven mitts, pot holders, draught excluders. Rectangle bodies with simple closures.',
    order: 40,
  },
  {
    slug: 'curtains-blinds',
    name: 'Curtains & blinds',
    description:
      'Rod-pocket, tab-top, eyelet-headed, and café-curtain styles. Lining and blackout-lining methods. All measurements-led; no curve pieces.',
    order: 50,
  },
  {
    slug: 'baby-children',
    name: 'Baby & children',
    description:
      'Bibs, simple swaddles, cot bumpers, baby blankets, simple baby trousers, kid aprons, child pinafores from gathered rectangles. Soft, washable, no small parts.',
    order: 60,
  },
  {
    slug: 'soft-toys',
    name: 'Soft toys',
    description:
      'Stuffed rabbits, simple bears, fabric dolls, fish-shaped pillows, snake draught-excluders, simple amigurumi-adjacent shapes. Rectangle and panel construction, machine or hand sewn.',
    order: 70,
  },
  {
    slug: 'kitchen-table-linens',
    name: 'Kitchen & table linens',
    description:
      'Tea towels, napkins, table runners, tablecloths, placemats, bread bags. The everyday rectangle work the home sewing tradition rests on.',
    order: 80,
  },
  {
    slug: 'mending-visible-mending',
    name: 'Mending & visible mending',
    description:
      'Patch mending, sashiko-style visible repair, darning (woven and Swiss), invisible mending, button replacement, tear repair, hem rescue. Hand-stitch first; the most life-extending sewing skills.',
    order: 90,
  },
  {
    slug: 'quilting',
    name: 'Quilting',
    description:
      'Patchwork basics, binding, basting, straight-line and free-motion quilting, hand quilting, simple block-and-strip designs. Wholecloth and patchwork starting points.',
    order: 100,
  },
  {
    slug: 'reusable-household',
    name: 'Reusable household',
    description:
      'Reusable kitchen roll, snack bags, beeswax-wrap replacements, breast pads, sanitary pads, makeup-removal pads, produce bags. The single-use replacement set.',
    order: 110,
  },
  {
    slug: 'christmas-seasonal',
    name: 'Christmas & seasonal',
    description:
      'Christmas stockings, advent calendars, fabric tree ornaments, bunting and flags, lavender bags, Easter chicks, Hallowe`en decorations. Small project surface, seasonal browse.',
    order: 120,
  },
  {
    slug: 'simple-clothing-rectangles',
    name: 'Simple clothing from rectangles',
    description:
      'Drawstring and elastic-waist trousers and shorts, gathered-rectangle peasant tops, simple A-line skirts (rectangle plus pleat), gathered sundresses and nightdresses. No fitted-pattern pieces.',
    order: 130,
  },
  {
    slug: 'accessories-small-projects',
    name: 'Accessories & small projects',
    description:
      'Eye masks, hair scrunchies, headbands, fabric flowers, brooches, lavender hearts, the small make-in-an-hour items.',
    order: 140,
  },
  {
    slug: 'pet-items',
    name: 'Pet items',
    description:
      'Dog beds (rectangle plus stuffed cushion), cat toys, simple pet blankets, fabric dog collars and bandannas.',
    order: 150,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const sewing = await prisma.category.findUnique({ where: { slug: 'sewing' } })
  if (!sewing) {
    console.error(
      '[seed] sewing category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] sewing → ${sewing.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: sewing.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] sewing/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: sewing.id,
          },
        })
        console.log(`[seed] sewing/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] sewing-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
