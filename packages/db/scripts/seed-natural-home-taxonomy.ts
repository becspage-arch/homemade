/**
 * One-off seed for the Natural-home taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   natural-home               "Natural home"
 *   SubCat     soap                        "Soap"
 *   SubCat     candles                     "Candles"
 *   SubCat     beauty                      "Beauty"
 *   SubCat     cleaning                    "Cleaning"
 *   SubCat     fragrance                   "Fragrance"
 *
 *   ~40 GlossaryTerm rows scoped to the natural-home Category id, covering
 *   the soap-chemistry vocabulary (SAP value, superfat, trace, lye, NaOH,
 *   KOH, INCI, emulsifier, surfactant, anhydrous, cure, gel phase, DOS,
 *   etc.) and the cosmetic-formulation vocabulary (phase-blend, cool-down
 *   phase, broad-spectrum preservative, INCI, melt point, flash point,
 *   memory burn, wick tunnelling, etc.). The full list is below.
 *
 * The Category itself is already seeded by `seed-categories.ts`. This
 * script only owns the sub-category list + the natural-home glossary
 * vocabulary so the upload-tutorial script has somewhere to land
 * RECIPE rows and the inline `glossaryTooltip` mark can resolve.
 *
 * Master `Tool` and `Ingredient` rows for the natural-home pipeline are
 * appended to `data/tools.ts` and `data/ingredients.ts` and land via
 * the existing `seed-tools.ts` + `seed-ingredients.ts` runs — the
 * pattern the herbal pipeline used. Re-running this script is safe;
 * the SubCategory upsert and the GlossaryTerm upsert both no-op on
 * conflict.
 *
 * Idempotent. Never touches `pipelineStatus`. The READY flip lives in
 * `flip-natural-home-ready.ts` and is run as a separate auditable step
 * after Rebecca has reviewed the test tutorials.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-natural-home-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-natural-home-taxonomy.ts --dry-run
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
    slug: 'soap',
    name: 'Soap',
    description:
      'Cold-process, hot-process, and melt-and-pour bar soap. Castile, Marseille, oatmeal, salt bars, and the variations that follow once the basic chemistry lands.',
    order: 10,
  },
  {
    slug: 'candles',
    name: 'Candles',
    description:
      'Container, pillar, and taper candles in beeswax, soy wax, and rapeseed wax. Wick-sizing, fragrance loads, pour temperatures, and cure rules.',
    order: 20,
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    description:
      'Balms, lip balms, body butters, oil serums, sugar and salt scrubs, hand creams, body lotions, deodorants, and bath products.',
    order: 30,
  },
  {
    slug: 'cleaning',
    name: 'Cleaning',
    description:
      'Surface sprays, scouring pastes, laundry products, dishwasher products, and the surface-compatibility guidance that decides where each one goes.',
    order: 40,
  },
  {
    slug: 'fragrance',
    name: 'Fragrance',
    description:
      'Reed diffusers, room sprays, simmer-pot blends, sachets, and solid-perfume balms.',
    order: 50,
  },
]

interface GlossarySpec {
  slug: string
  term: string
  definition: string
}

const GLOSSARY_TERMS: GlossarySpec[] = [
  // ── Soap chemistry ────────────────────────────────────────────────────
  {
    slug: 'saponification',
    term: 'Saponification',
    definition:
      'The reaction between fat and lye that produces soap and glycerine. Each oil has a SAP value — the grams of lye needed to fully saponify a gram of that oil.',
  },
  {
    slug: 'sap-value',
    term: 'SAP value',
    definition:
      'Saponification value. The grams of NaOH (or KOH) needed to fully saponify one gram of a given oil. Olive oil sits at ~0.135; coconut oil ~0.190; castor oil ~0.128. Soap calculators do the per-recipe arithmetic.',
  },
  {
    slug: 'superfat',
    term: 'Superfat',
    definition:
      'The percentage of oil left unsaponified — extra oil for skin feel. Typically 5-7% in a household bar. Higher superfat makes a softer, more conditioning bar; lower makes a harder, more cleansing one.',
  },
  {
    slug: 'lye-discount',
    term: 'Lye discount',
    definition:
      'The water percentage in cold-process soap, expressed as a percentage of total oil weight. 33% is the household default. Lower percentages (28-30%) give a harder, faster-curing bar; higher percentages give a softer batter that traces more slowly.',
  },
  {
    slug: 'trace',
    term: 'Trace',
    definition:
      'The point where soap batter thickens to the consistency of warm custard and a drizzle from the stick blender leaves a brief trail on the surface. Light trace is pourable; medium trace holds a swirl; thick trace stiffens like pudding.',
  },
  {
    slug: 'gel-phase',
    term: 'Gel phase',
    definition:
      'The exothermic stage of cold-process soap where the batter heats internally to 80-90°C as saponification proceeds, turning translucent and gel-like before cooling and hardening. Insulated moulds gel; uninsulated moulds skip gel and stay opaque.',
  },
  {
    slug: 'lye',
    term: 'Lye',
    definition:
      'The household name for sodium hydroxide (NaOH) when used for bar soap, and potassium hydroxide (KOH) when used for liquid soap. Caustic; demands gloves, goggles, ventilation, and HDPE-only containers.',
  },
  {
    slug: 'sodium-hydroxide',
    term: 'Sodium hydroxide (NaOH)',
    definition:
      'The lye used to make bar soap. Solid pellets or beads at 99% purity. Heats to ~90°C in seconds when added to water and gives off caustic fumes. Always add lye to water, never water to lye, in a ventilated space, wearing gloves and goggles.',
  },
  {
    slug: 'potassium-hydroxide',
    term: 'Potassium hydroxide (KOH)',
    definition:
      'The lye used to make liquid soap paste. 90% pure as supplied; calculations account for the 10% inert mass. Same handling rules as NaOH.',
  },
  {
    slug: 'cold-process',
    term: 'Cold-process',
    definition:
      'The bar-soap method where lye-water and warmed oils are blended at low temperature (38-42°C) and poured into the mould while still a liquid batter. The mould insulates while the batter saponifies and cures over 4-6 weeks.',
  },
  {
    slug: 'hot-process',
    term: 'Hot-process',
    definition:
      'The bar-soap method where the soap batter is cooked over heat (or in a slow-cooker) until saponification is complete, then moulded. Cures in 1-2 weeks rather than 4-6. Rustic finish — surface is less smooth than cold-process.',
  },
  {
    slug: 'melt-and-pour',
    term: 'Melt-and-pour',
    definition:
      'Pre-saponified soap base (sold in blocks) that the maker melts, scents, colours, and pours into a mould. No lye handling required. Sets in hours and is usable the same day.',
  },
  {
    slug: 'cure',
    term: 'Cure',
    definition:
      'The 4-6 weeks of resting time after cold-process soap is unmoulded and cut. Excess water evaporates and any residual saponification completes. A cured bar is harder, milder, and longer-lasting than a freshly cut one.',
  },
  {
    slug: 'dos',
    term: 'DOS (dreaded orange spots)',
    definition:
      'Orange flecks that appear on a soap bar when the superfat oil has gone rancid. Smells sharp and paint-like rather than herbal. The bar is finished — discard, don\'t recut.',
  },

  // ── Cosmetic formulation ─────────────────────────────────────────────
  {
    slug: 'inci',
    term: 'INCI',
    definition:
      'International Nomenclature of Cosmetic Ingredients. The standard chemical-name list that goes on a cosmetic product label. Olive oil = "Olea Europaea (Olive) Fruit Oil"; lavender essential oil = "Lavandula Angustifolia (Lavender) Oil".',
  },
  {
    slug: 'emulsifier',
    term: 'Emulsifier',
    definition:
      'An ingredient that holds oil and water phases together in a stable emulsion. Cosmetic emulsifiers include emulsifying wax NF, polysorbate 60, and sucragel. Without one, oil and water separate.',
  },
  {
    slug: 'surfactant',
    term: 'Surfactant',
    definition:
      'A surface-active agent that lifts dirt and oil off skin or surfaces. Soap is the original surfactant. Cosmetic surfactants include coco-glucoside, sodium cocoyl isethionate (SCI), and decyl glucoside.',
  },
  {
    slug: 'anhydrous',
    term: 'Anhydrous',
    definition:
      'A preparation that contains no water phase. Anhydrous balms, body butters, and oil serums keep 12 months or more without a preservative because water-loving microbes have nothing to grow on. Water-containing lotions need a broad-spectrum preservative.',
  },
  {
    slug: 'phase-blend',
    term: 'Phase blend',
    definition:
      'The lotion-making method where the oil phase and water phase are heated separately to 70-75°C, then poured together and blended until emulsified. Heat-sensitive actives go in during a separate cool-down phase below 40°C.',
  },
  {
    slug: 'cool-down-phase',
    term: 'Cool-down phase',
    definition:
      'The stage of lotion-making after the emulsion has cooled below 40°C, where heat-sensitive ingredients (preservatives, essential oils, vitamin C, hyaluronic acid) are added without degrading.',
  },
  {
    slug: 'broad-spectrum-preservative',
    term: 'Broad-spectrum preservative',
    definition:
      'A cosmetic preservative active against bacteria, yeast, and mould. Required in any water-containing product. Beginner-safe options include Optiphen (phenoxyethanol + caprylyl glycol), Geogard ECT (benzyl alcohol + salicylic + sorbic acid), and Liquid Germall Plus.',
  },
  {
    slug: 'patch-test',
    term: 'Patch test',
    definition:
      'Dab a small amount on the inside of the forearm and wait 24-48 hours before wider use. Catches allergic reactions before they spread. Standard practice for any new cosmetic active.',
  },
  {
    slug: 'essential-oil',
    term: 'Essential oil',
    definition:
      'A concentrated plant volatile oil extracted by steam distillation or cold-pressing. Cosmetic dosing 0.5-2% of finished-product weight. Patch-test on first use. Many essential oils are toxic to cats — tea tree, peppermint, eucalyptus, citrus oils, ylang-ylang, pennyroyal, wintergreen, pine, sweet birch.',
  },
  {
    slug: 'fragrance-oil',
    term: 'Fragrance oil',
    definition:
      'A synthetic or synthetic-blended scent compound formulated for cosmetic, candle, or soap use. Stronger and more stable than essential oils; usually cheaper. Cosmetic dosing follows the supplier-stated maximum (IFRA-rated by category).',
  },

  // ── Candle making ─────────────────────────────────────────────────────
  {
    slug: 'wick-tunnelling',
    term: 'Wick tunnelling',
    definition:
      'When a candle burns down the centre without melting to the jar edge, leaving a tunnel of solid wax around the rim. Usually a too-small wick for the jar diameter, or the first burn cut short before the "memory burn" was set.',
  },
  {
    slug: 'memory-burn',
    term: 'Memory burn',
    definition:
      'A candle\'s first burn sets its memory — the surface needs to melt all the way to the jar edge (3-4 hours for a 7 cm jar) before extinguishing. Subsequent burns follow the same edge-melt pattern.',
  },
  {
    slug: 'pour-temperature',
    term: 'Pour temperature',
    definition:
      'The wax temperature at which the candle-maker pours into the jar. 60-65°C for container soy wax, 70°C for beeswax, 80°C for paraffin. Too hot and the wax pulls away from the jar as it cools; too cool and the surface dimples and cracks.',
  },
  {
    slug: 'flash-point',
    term: 'Flash point',
    definition:
      'The temperature at which a fragrance oil\'s vapour catches fire on a spark. Fragrance is added at or below the flash-point + 5°C window so the volatile top-notes don\'t flash off into the room before they bind into the wax.',
  },
  {
    slug: 'melt-point',
    term: 'Melt point',
    definition:
      'The temperature at which a wax transitions from solid to liquid. Container soy wax ~50°C; pillar soy wax ~55°C; beeswax ~62-65°C; paraffin ~50-70°C depending on grade. Higher melt-point waxes hold up better in warm rooms.',
  },
  {
    slug: 'fragrance-load',
    term: 'Fragrance load',
    definition:
      'The percentage of fragrance oil (or essential oil) by weight of wax. Soy wax holds 6-8% comfortably; beeswax is fragrance-shy and tops out at 3-5%; paraffin will hold 10-12% on the strong end.',
  },
  {
    slug: 'wick-priming',
    term: 'Wick priming',
    definition:
      'Pre-dipping a cotton wick in melted wax and letting it set before threading into the jar. A primed wick lights faster and burns more evenly than an un-primed one.',
  },

  // ── Cleaning ─────────────────────────────────────────────────────────
  {
    slug: 'castile-soap',
    term: 'Castile soap',
    definition:
      'A bar or liquid soap made from olive oil (traditionally 100%; modern household Castile often blends 70% olive with 30% coconut for lather). Mild, slow-curing, long-keeping. The base for many household cleaning sprays.',
  },
  {
    slug: 'surface-compatibility',
    term: 'Surface compatibility',
    definition:
      'Which surfaces a cleaning product is safe on. Vinegar etches natural stone (marble, limestone) and degrades unsealed wood; bicarbonate scratches glossy painted finishes; bleach must never combine with vinegar or hydrogen peroxide. Plain prose; no hand-waves.',
  },
  {
    slug: 'sealed-vs-unsealed',
    term: 'Sealed vs unsealed surface',
    definition:
      'A sealed surface (sealed wood, sealed stone) has a non-porous finish protecting the underlying material; an unsealed surface absorbs liquid directly into the substrate. Most home cleaning products are formulated for sealed surfaces; unsealed wood and stone need their own product list.',
  },

  // ── Fragrance ────────────────────────────────────────────────────────
  {
    slug: 'reed-diffuser',
    term: 'Reed diffuser',
    definition:
      'A scent-releasing arrangement of rattan reeds in a fragrance oil + carrier (alcohol or dipropylene glycol). The reeds wick the fragrance up through capillary action and release it into the room. Lasts 3-4 months before the reeds clog and stop wicking.',
  },
  {
    slug: 'simmer-pot',
    term: 'Simmer pot',
    definition:
      'A small pan of water with botanicals, fruit peel, and spices simmered on the lowest hob heat to release scent into the room. A single-session prep — never left unattended or boiled dry.',
  },
  {
    slug: 'fixative',
    term: 'Fixative',
    definition:
      'A slow-evaporating ingredient that anchors faster-evaporating fragrance notes and extends a scent\'s life. Common cosmetic fixatives are benzoin resinoid, orris root, ambrette seed, and synthetic musks.',
  },

  // ── Cross-pollination with herbal-medicine ────────────────────────────
  {
    slug: 'infused-oil',
    term: 'Infused oil',
    definition:
      'A carrier oil that has been macerated with dried herb material so the oil-soluble constituents leach into the oil. The base for salves, balms, and soap superfat. Cross-references the herbal-medicine glossary.',
  },
  {
    slug: 'double-boiler-method',
    term: 'Double-boiler method',
    definition:
      'A heatproof bowl set over a saucepan of simmering water so the contents heat gently and never reach the boiling point of water (~100°C). Essential for oil maceration (60-65°C hold), wax melt (60-75°C), and any low-temperature cosmetic chemistry.',
  },

  // ── Compliance + label ────────────────────────────────────────────────
  {
    slug: 'cpsr',
    term: 'CPSR',
    definition:
      'Cosmetic Product Safety Report. The legal document required under UK / EU cosmetics regulation for any product sold to the public (including market stalls and online). Home-batch products for personal or gifted use are not subject to CPSR. Selling a home cosmetic in the UK without a CPSR is illegal.',
  },
  {
    slug: 'lot-number',
    term: 'Lot number',
    definition:
      'A short code (date + batch sequence) marked on a finished product so the maker can trace ingredients and dates if a problem comes back. Even for personal batches, a date-stamped lot number on every tin or bottle is the bare minimum for tracing rancidity or contamination.',
  },
  {
    slug: 'pao',
    term: 'PAO (period after opening)',
    definition:
      'The number of months a cosmetic product stays safe and effective once the seal is broken. Displayed as the open-jar symbol with a number ("6M", "12M"). The PAO is shorter than the unopened shelf life because microbial exposure starts at opening.',
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  console.log(
    `[seed-natural-home-taxonomy] starting${DRY_RUN ? ' (dry-run)' : ''}`,
  )

  const { prisma } = await import('../src/index.js')

  const naturalHome = await prisma.category.findUnique({
    where: { slug: 'natural-home' },
  })
  if (!naturalHome) {
    console.error(
      '[seed] natural-home category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] natural-home → ${naturalHome.id}`)

  let subCreated = 0
  let subUnchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: naturalHome.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create sub] natural-home/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: naturalHome.id,
          },
        })
        console.log(`[seed] natural-home/${spec.slug} → ${sub.id}`)
      }
      subCreated += 1
      continue
    }

    subUnchanged += 1
  }

  let glossaryCreated = 0
  let glossaryUnchanged = 0

  for (const spec of GLOSSARY_TERMS) {
    const existing = await prisma.glossaryTerm.findUnique({
      where: { slug: spec.slug },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create glossary] ${spec.slug}`)
      } else {
        const row = await prisma.glossaryTerm.create({
          data: {
            slug: spec.slug,
            term: spec.term,
            definition: spec.definition,
            categoryId: naturalHome.id,
          },
        })
        console.log(`[seed] glossary/${spec.slug} → ${row.id}`)
      }
      glossaryCreated += 1
      continue
    }

    glossaryUnchanged += 1
  }

  console.log(
    `\n[seed] natural-home-taxonomy: subcategories created=${subCreated} unchanged=${subUnchanged}; glossary created=${glossaryCreated} unchanged=${glossaryUnchanged}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
