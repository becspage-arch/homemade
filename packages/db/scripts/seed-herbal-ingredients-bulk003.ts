/**
 * Seed new dried herbal ingredients for herbal-medicine bulk-003 batch.
 * Run once before uploading the bulk-003 briefs.
 *
 * These 23 slugs are used in the bulk-003 brief bodies but do not yet exist
 * in the Ingredient table. They use the {herb}-{part}-dried naming convention
 * established for this batch.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const NEW_INGREDIENTS = [
  {
    slug: 'ashwagandha-root-dried',
    name: 'Dried ashwagandha root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Withania somnifera dried root (cut-and-sifted). For tinctures, warm-milk decoctions, and capsule preparations.',
  },
  {
    slug: 'chamomile-dried',
    name: 'Dried chamomile flowers',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Matricaria recutita flowers (apothecary-grade, whole or coarsely broken). For infusions, tinctures, and oil infusions.',
  },
  {
    slug: 'chickweed-dried',
    name: 'Dried chickweed',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Stellaria media aerial parts. For salves and compresses.',
  },
  {
    slug: 'comfrey-leaf-dried',
    name: 'Dried comfrey leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Symphytum officinale leaf. External use only. For oil infusions and poultices. Do not ingest.',
  },
  {
    slug: 'dandelion-leaf-dried',
    name: 'Dried dandelion leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Taraxacum officinale leaf. For infusions. Distinct from dried dandelion root (more bitter, used as a decoction).',
  },
  {
    slug: 'echinacea-dried',
    name: 'Dried echinacea (aerial parts)',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Echinacea purpurea aerial parts (leaf, stem, flower). Used for infusions. For tincture, dried root is preferred.',
  },
  {
    slug: 'elderberry-dried',
    name: 'Dried elderberries',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Sambucus nigra berries. Must be cooked before use — raw elderberries cause digestive upset.',
  },
  {
    slug: 'elderflower-dried',
    name: 'Dried elderflowers',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Sambucus nigra flower heads. For infusions and steam preparations.',
  },
  {
    slug: 'ginger-dried-ground',
    name: 'Dried ground ginger (medicinal)',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Dried Zingiber officinale root, ground. For decoctions and warm-milk preparations. More concentrated than fresh ginger in therapeutic preparations.',
  },
  {
    slug: 'gotu-kola-dried',
    name: 'Dried gotu kola leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Centella asiatica leaf. For infusions and tinctures.',
  },
  {
    slug: 'hawthorn-berries-dried',
    name: 'Dried hawthorn berries',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Crataegus monogyna berries. For decoctions. Do not use alongside cardiac medication without medical guidance.',
  },
  {
    slug: 'holy-basil-dried',
    name: 'Dried holy basil leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Ocimum sanctum (tulsi) leaf. For infusions and tinctures.',
  },
  {
    slug: 'lavender-dried',
    name: 'Dried lavender flowers',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Lavandula angustifolia flowers. For tinctures, baths, and infusions. Culinary-grade for internal preparations.',
  },
  {
    slug: 'lemon-balm-dried',
    name: 'Dried lemon balm leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Melissa officinalis leaf. For infusions, tinctures, and glycerites. Buy in small quantities — loses aromatic oils quickly.',
  },
  {
    slug: 'nettle-seed-fresh',
    name: 'Fresh nettle seed',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 14,
    storage: 'fridge',
    notes: 'Fresh Urtica dioica seeds, harvested green. Distinct from dried nettle leaf. For tinctures as a kidney and adrenal tonic. Harvest late summer.',
  },
  {
    slug: 'passionflower-dried',
    name: 'Dried passionflower aerial parts',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Passiflora incarnata aerial parts (leaf, stem, tendril, unripe fruit). For infusions. Not passionflower essential oil.',
  },
  {
    slug: 'plantain-leaf-dried',
    name: 'Dried plantain leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Plantago major or P. lanceolata leaf. For syrups, salves, and poultices. Not the cooking banana plantain.',
  },
  {
    slug: 'rosemary-dried',
    name: 'Dried rosemary',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Rosmarinus officinalis leaf (cut-and-sifted). For infusions, oil infusions, and baths.',
  },
  {
    slug: 'sage-fresh',
    name: 'Fresh sage leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 7,
    storage: 'fridge',
    notes: 'Fresh Salvia officinalis leaf. For hot infusions and gargles. Avoid in pregnancy and at high doses (contains thujone). Do not use alongside anti-seizure medication.',
  },
  {
    slug: 'st-johns-wort-dried',
    name: 'Dried St John\'s wort aerial parts',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Hypericum perforatum aerial parts, ideally harvested at flowering. For infusions and oil infusions. Strong herb-drug interactions — see herbal profile before use.',
  },
  {
    slug: 'valerian-root-dried',
    name: 'Dried valerian root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Valeriana officinalis root (cut-and-sifted). Distinctive earthy, musky smell. For tinctures, baths, and decoctions.',
  },
  {
    slug: 'vervain-dried',
    name: 'Dried vervain aerial parts',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Verbena officinalis aerial parts. For infusions. Bitter nervine. Avoid in pregnancy.',
  },
  {
    slug: 'yarrow-dried',
    name: 'Dried yarrow aerial parts',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Dried Achillea millefolium aerial parts (leaf, flower, stem). For infusions, compresses, and toners. Asteraceae allergen — patch-test if ragweed-sensitive.',
  },
] as const

async function main() {
  let seeded = 0
  let skipped = 0

  for (const ing of NEW_INGREDIENTS) {
    const existing = await prisma.ingredient.findUnique({ where: { slug: ing.slug } })
    if (existing) {
      console.log(`  skip (exists): ${ing.slug}`)
      skipped++
      continue
    }

    await prisma.ingredient.create({
      data: {
        slug: ing.slug,
        name: ing.name,
        category: ing.category,
        defaultUnit: ing.defaultUnit,
        dietaryFlags: [...ing.dietaryFlags],
        commonSubstitutes: [],
        aliases: [],
        isStaple: ing.isStaple,
        isAllergen: ing.isAllergen,
        shelfLifeDays: ing.shelfLifeDays ?? null,
        storage: ing.storage ?? null,
        notes: ing.notes ?? null,
      },
    })
    console.log(`  seeded: ${ing.slug}`)
    seeded++
  }

  console.log(`\nDone: ${seeded} seeded, ${skipped} skipped.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
