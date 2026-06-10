/**
 * Sewing taxonomy seed (S-3 pipeline-setup, 2026-06-10).
 *
 * Replaces the legacy 15-sub-cat rectangles-only taxonomy from
 * phase_sewing_pipeline_001 (2026-05-17) with the 16-sub-cat shape that
 * maps one-to-one onto the `SewingGarmentCategory` enum introduced by
 * phase_sewing_schema_001 (commit 4b3e689e). The S-2 schema migration
 * carved the room for fitted-garment patterns + freesewing-derived
 * drafts; this seed brings the taxonomy in line.
 *
 * Sub-categories created (slug, name, SewingGarmentCategory enum value):
 *   womens-tops          Women's tops              WOMENS_TOPS
 *   womens-dresses       Women's dresses           WOMENS_DRESSES
 *   womens-bottoms       Women's bottoms           WOMENS_BOTTOMS
 *   womens-outerwear     Women's outerwear         WOMENS_OUTERWEAR
 *   womens-intimates     Women's intimates         WOMENS_INTIMATES
 *   mens-tops            Men's tops                MENS_TOPS
 *   mens-bottoms         Men's bottoms             MENS_BOTTOMS
 *   mens-outerwear       Men's outerwear           MENS_OUTERWEAR
 *   kids                 Kids                      KIDS
 *   babies               Babies                    BABIES
 *   unisex               Unisex                    UNISEX
 *   accessories          Accessories               ACCESSORIES
 *   bags                 Bags                      BAGS
 *   home                 Home + soft furnishings   HOME
 *   costume              Costume + cosplay         COSTUME
 *   specialty            Specialty + technical     SPECIALTY
 *
 * `autopilotEnabled = false` on every row per the no-phased-rollout lock
 * in `project_sewing_locked_decisions.md`. The flag flips when S-1
 * Studio + S-4 content + S-5 grading library all land together.
 *
 * Idempotent + safe:
 *   - Creates any missing new sub-cat.
 *   - Updates any existing new sub-cat's name + description + order to
 *     the canonical values (so re-running converges).
 *   - Deletes the 15 legacy sub-cats IF AND ONLY IF no Tutorial / Pattern
 *     / SewingPattern / CrochetPattern / NeedleworkPattern /
 *     KnittingPattern references them. If a row has references the seed
 *     logs a warning and skips the delete; manual reassignment happens
 *     separately.
 *
 * Never touches `Category.sewing.pipelineStatus` or `isPublicVisible`.
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
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 12; depth++) {
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
    slug: 'womens-tops',
    name: "Women's tops",
    description:
      "T-shirts, blouses, shirts, tunics, camisoles, sleeveless tops, jumpers, sweatshirts in woven + knit fabrics. Set-in, raglan, dolman, and drop-shoulder sleeve constructions.",
    order: 10,
  },
  {
    slug: 'womens-dresses',
    name: "Women's dresses",
    description:
      "Day dresses, shift dresses, wrap dresses, fit-and-flare, bodice-and-skirt constructions, gathered + pleated + a-line skirts on a bodice. Sleeve and neckline variations.",
    order: 20,
  },
  {
    slug: 'womens-bottoms',
    name: "Women's bottoms",
    description:
      "Trousers, skirts, shorts, culottes. Flat / elasticated / drawstring / tailored waistbands. Fly construction. Pocket types.",
    order: 30,
  },
  {
    slug: 'womens-outerwear',
    name: "Women's outerwear",
    description:
      "Jackets, coats, blazers, vests, gilets, kimonos, capes. Lining + interfacing. Closure variants (button, zip, snap). Welt + patch pockets.",
    order: 40,
  },
  {
    slug: 'womens-intimates',
    name: "Women's intimates",
    description:
      "Bras, knickers, briefs, lingerie, slips, camisoles. Stretch fabrics, underwire channelling, hook-and-eye placement, foam padding. Specialist construction.",
    order: 50,
  },
  {
    slug: 'mens-tops',
    name: "Men's tops",
    description:
      "T-shirts, shirts, polos, jumpers, sweatshirts. Woven + knit. Set-in and raglan sleeve constructions. Yokes, plackets, collars + stands.",
    order: 60,
  },
  {
    slug: 'mens-bottoms',
    name: "Men's bottoms",
    description:
      "Trousers, shorts, chinos, jeans. Fly construction (button + zip). Waistband + belt-loop construction. Pockets (welt, patch, slash).",
    order: 70,
  },
  {
    slug: 'mens-outerwear',
    name: "Men's outerwear",
    description:
      "Jackets, coats, blazers, vests, gilets. Lining + interfacing. Tailored construction. Welt pockets, button stand, lapels.",
    order: 80,
  },
  {
    slug: 'kids',
    name: 'Kids',
    description:
      "Children's clothing across tops, dresses, bottoms, and outerwear. Size grading by age and height. Easy-on closures (elastic waists, drawstrings, large buttons).",
    order: 90,
  },
  {
    slug: 'babies',
    name: 'Babies',
    description:
      "Sleepsuits, rompers, bibs, baby gowns, bonnets, booties, bloomers, simple baby tops + trousers. Snap-fastener access. Soft seam finishes.",
    order: 100,
  },
  {
    slug: 'unisex',
    name: 'Unisex',
    description:
      "Patterns designed for any body, sized by chest + hip + height rather than gendered fit. Tees, jumpers, trousers, loungewear, wraps. Generous ease.",
    order: 110,
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description:
      "Scarves, belts, ties, headbands, hats, gloves, mittens, hair accessories. Small projects, broad appeal.",
    order: 120,
  },
  {
    slug: 'bags',
    name: 'Bags',
    description:
      "Tote bags, backpacks, clutches, makeup pouches, project bags, drawstring bags, market bags. Interfacing-critical. Strap + handle construction. Hardware (zips, clasps, rings).",
    order: 130,
  },
  {
    slug: 'home',
    name: 'Home + soft furnishings',
    description:
      "Cushions, curtains, table linens, tea towels, bedspreads, lampshades, draught excluders, hot-water-bottle covers. Rectangle-heavy geometry with finishing techniques.",
    order: 140,
  },
  {
    slug: 'costume',
    name: 'Costume + cosplay',
    description:
      "Theatrical, fancy-dress, and cosplay construction. Creative finishing. Foam + worbla armour notes where relevant. Often built for one wear rather than the long term.",
    order: 150,
  },
  {
    slug: 'specialty',
    name: 'Specialty + technical',
    description:
      "Technical sewing: waterproof outdoor gear, leather work, upholstery, sailmaking, tents, harnesses. Specialist construction. Industrial techniques.",
    order: 160,
  },
]

// Legacy sub-cats from phase_sewing_pipeline_001 (2026-05-17) that the
// new garment-category taxonomy supersedes. The seed only deletes a
// legacy row when no Tutorial / SewingPattern / Pattern / etc references
// it (zero-reference check), and otherwise warns + skips.
const LEGACY_SUB_CAT_SLUGS = [
  'techniques',
  'aprons-pinafores',
  'bags-storage',
  'homewares-soft-furnishing',
  'curtains-blinds',
  'baby-children',
  'soft-toys',
  'kitchen-table-linens',
  'mending-visible-mending',
  'quilting',
  'reusable-household',
  'christmas-seasonal',
  'simple-clothing-rectangles',
  'accessories-small-projects',
  'pet-items',
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const sewing = await prisma.category.findUnique({ where: { slug: 'sewing' } })
  if (!sewing) {
    console.error('[seed] sewing category not found. Run seed-categories.ts first.')
    process.exit(2)
  }
  console.log(`[seed] sewing → ${sewing.id}`)

  const NEW_SLUGS = new Set(SUB_CATEGORIES.map((s) => s.slug))

  let created = 0
  let updated = 0
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
            autopilotEnabled: false,
          },
        })
        console.log(`[seed] created sewing/${spec.slug} → ${sub.id}  (autopilotEnabled=false)`)
      }
      created += 1
      continue
    }

    const fieldsMatch =
      existing.name === spec.name &&
      existing.description === spec.description &&
      existing.order === spec.order &&
      existing.autopilotEnabled === false

    if (fieldsMatch) {
      unchanged += 1
      continue
    }

    if (DRY_RUN) {
      console.log(`  [would update] sewing/${spec.slug}  (name/desc/order/autopilotEnabled → canonical)`)
    } else {
      await prisma.subCategory.update({
        where: { id: existing.id },
        data: {
          name: spec.name,
          description: spec.description,
          order: spec.order,
          autopilotEnabled: false,
        },
      })
      console.log(`[seed] updated sewing/${spec.slug}`)
    }
    updated += 1
  }

  console.log('\n[seed] legacy sub-cat cleanup:')
  let legacyDeleted = 0
  let legacyKept = 0
  let legacyAbsent = 0

  for (const slug of LEGACY_SUB_CAT_SLUGS) {
    if (NEW_SLUGS.has(slug)) {
      continue
    }
    const legacy = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: sewing.id, slug } },
    })
    if (!legacy) {
      legacyAbsent += 1
      continue
    }

    const refCounts = await Promise.all([
      prisma.tutorial.count({ where: { subCategoryId: legacy.id } }),
      prisma.pattern.count({ where: { subCategoryId: legacy.id } }),
      prisma.crochetPattern.count({ where: { subCategoryId: legacy.id } }),
      prisma.needleworkPattern.count({ where: { subCategoryId: legacy.id } }),
      prisma.knittingPattern.count({ where: { subCategoryId: legacy.id } }),
      prisma.sewingPattern.count({ where: { subCategoryId: legacy.id } }),
    ])
    const total = refCounts.reduce((a, b) => a + b, 0)

    if (total > 0) {
      console.log(
        `  KEEP   sewing/${slug.padEnd(28)}  tutorials=${refCounts[0]} pattern=${refCounts[1]} crochet=${refCounts[2]} needlework=${refCounts[3]} knitting=${refCounts[4]} sewing=${refCounts[5]}  (reassign first)`,
      )
      legacyKept += 1
      continue
    }

    if (DRY_RUN) {
      console.log(`  [would delete] sewing/${slug}  (0 references)`)
    } else {
      await prisma.subCategory.delete({ where: { id: legacy.id } })
      console.log(`  DELETE sewing/${slug.padEnd(28)}  (0 references)`)
    }
    legacyDeleted += 1
  }

  const finalRows = await prisma.subCategory.findMany({
    where: { categoryId: sewing.id },
    orderBy: { order: 'asc' },
    select: { slug: true, name: true, autopilotEnabled: true, order: true },
  })

  console.log('\n[seed] final sewing sub-categories:')
  console.log(`  ${'slug'.padEnd(22)} ${'order'.padStart(5)}  autopilotEnabled  name`)
  console.log(`  ${'-'.repeat(22)} ${'-'.repeat(5)}  ${'-'.repeat(16)}  ${'-'.repeat(30)}`)
  for (const r of finalRows) {
    console.log(`  ${r.slug.padEnd(22)} ${String(r.order).padStart(5)}  ${String(r.autopilotEnabled).padEnd(16)}  ${r.name}`)
  }

  console.log(
    `\n[seed] sewing-taxonomy: created=${created} updated=${updated} unchanged=${unchanged} legacy-deleted=${legacyDeleted} legacy-kept=${legacyKept} legacy-absent=${legacyAbsent} final-rows=${finalRows.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
