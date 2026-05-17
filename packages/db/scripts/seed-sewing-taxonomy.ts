/**
 * One-off seed for the Sewing taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   sewing  "Sewing"               (pipelineStatus flipped to READY)
 *   SubCat     techniques                      "Techniques"
 *   SubCat     aprons-pinafores                "Aprons & pinafores"
 *   SubCat     bags-storage                    "Bags & storage"
 *   SubCat     homewares-soft-furnishing       "Homewares & soft furnishing"
 *   SubCat     curtains-blinds                 "Curtains & blinds"
 *   SubCat     baby-children                   "Baby & children"
 *   SubCat     soft-toys                       "Soft toys"
 *   SubCat     kitchen-table-linens            "Kitchen & table linens"
 *   SubCat     mending-visible-mending         "Mending & visible mending"
 *   SubCat     quilting                        "Quilting"
 *   SubCat     reusable-household              "Reusable household"
 *   SubCat     christmas-seasonal              "Christmas & seasonal"
 *   SubCat     simple-clothing-rectangles      "Simple clothing from rectangles"
 *   SubCat     accessories-small-projects      "Accessories & small projects"
 *   SubCat     pet-items                       "Pet items"
 *
 * The Category itself was seeded earlier by `seed-categories.ts`. This
 * script:
 *   1. Flips `Category.pipelineStatus` for `sewing` from NOT_READY → READY,
 *      so the round-robin autopilot picks Sewing up on its next fire.
 *   2. Owns the sub-category list, so the upload-tutorial script has
 *      somewhere to land PATTERN + TECHNIQUE rows.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sewing-taxonomy.ts
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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const sewing = await prisma.category.upsert({
    where: { slug: 'sewing' },
    create: {
      slug: 'sewing',
      name: 'Sewing',
      description:
        'Dressmaking, quilting, mending, and visible mending. UK-first; rectangle and gathered-rectangle projects + foundational techniques.',
      order: 60,
      pipelineStatus: 'READY',
    },
    update: { pipelineStatus: 'READY' },
  })
  console.log(`[seed] sewing → ${sewing.id} (pipelineStatus=READY)`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: sewing.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: sewing.id,
      },
      update: {},
    })
    console.log(`[seed] sewing/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
