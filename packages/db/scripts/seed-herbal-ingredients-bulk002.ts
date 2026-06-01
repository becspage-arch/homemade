/**
 * Seed new dried herbal ingredients for herbal-medicine bulk-002 batch.
 * Run once before uploading the bulk-002 briefs.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const NEW_INGREDIENTS = [
  {
    slug: 'dried-ashwagandha-root',
    name: 'Dried ashwagandha root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Withania somnifera dried root. Cut-and-sifted for tinctures; powder for warm-milk preparations.',
  },
  {
    slug: 'dried-burdock-root',
    name: 'Dried burdock root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Arctium lappa dried root, cut and sifted. Alterative and hepatic herb.',
  },
  {
    slug: 'dried-cayenne-pepper',
    name: 'Dried cayenne pepper',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Capsicum annuum dried pepper for herbal oil infusion (rubefacient). Handle with care; wash hands thoroughly after use.',
  },
  {
    slug: 'dried-chickweed',
    name: 'Dried chickweed',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Stellaria media dried aerial parts. Emollient and cooling herb for external skin preparations.',
  },
  {
    slug: 'dried-cleavers',
    name: 'Dried cleavers',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Galium aparine dried aerial parts. Lymphatic and diuretic herb. Use as cold infusion (hot water degrades some constituents).',
  },
  {
    slug: 'dried-comfrey-leaf',
    name: 'Dried comfrey leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Symphytum officinale dried leaf. External use only. Not for internal preparations.',
  },
  {
    slug: 'dried-dandelion-root',
    name: 'Dried dandelion root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Taraxacum officinale dried root, cut and sifted. Hepatic and digestive bitter herb.',
  },
  {
    slug: 'dried-gotu-kola-leaf',
    name: 'Dried gotu kola leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Centella asiatica dried aerial parts. Nervine and adaptogen; medhya rasayana in Ayurvedic tradition.',
  },
  {
    slug: 'dried-holy-basil-leaf',
    name: 'Dried holy basil leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Ocimum tenuiflorum dried leaf (tulsi). Adaptogen and antimicrobial herb. Not the same as culinary sweet basil.',
  },
  {
    slug: 'dried-hops-flowers',
    name: 'Dried hops flowers',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Humulus lupulus dried strobiles (flower cones). Sedative nervine. Loses potency faster than most herbs; check the resinous smell before use.',
  },
  {
    slug: 'dried-licorice-root',
    name: 'Dried liquorice root',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Glycyrrhiza glabra dried root, cut and sifted. Demulcent and anti-inflammatory. Short course only (4 weeks max); avoid in hypertension.',
  },
  {
    slug: 'dried-milk-thistle-seeds',
    name: 'Dried milk thistle seeds',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Silybum marianum dried seeds (whole). Crush in pestle and mortar immediately before use; whole seeds pass through without extraction.',
  },
  {
    slug: 'dried-motherwort',
    name: 'Dried motherwort',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Leonurus cardiaca dried aerial parts. Cardiac nervine. Avoid in pregnancy (emmenagogue).',
  },
  {
    slug: 'dried-passionflower',
    name: 'Dried passionflower',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Passiflora incarnata dried aerial parts. Must be P. incarnata (the medicinal species); ornamental passionflowers are not a substitute.',
  },
  {
    slug: 'dried-plantain-leaf',
    name: 'Dried plantain leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Plantago major or P. lanceolata dried leaf. Demulcent and vulnerary herb for internal and external use.',
  },
  {
    slug: 'dried-raspberry-leaf',
    name: 'Dried raspberry leaf',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Rubus idaeus dried leaf. Uterine tonic. Third trimester use only (from approximately 32 weeks); not for first or second trimester.',
  },
  {
    slug: 'dried-vervain',
    name: 'Dried vervain',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Verbena officinalis dried aerial parts. Nervine for tension and over-busyness. Avoid in pregnancy (emmenagogue).',
  },
  {
    slug: 'dried-yarrow',
    name: 'Dried yarrow',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 365,
    storage: 'cupboard',
    notes: 'Achillea millefolium dried aerial parts. Styptic, diaphoretic, and anti-inflammatory herb. Avoid in pregnancy.',
  },
  {
    slug: 'slippery-elm-bark-powder',
    name: 'Slippery elm bark powder',
    category: 'herb',
    defaultUnit: 'g',
    dietaryFlags: ['vegan', 'glutenFree', 'dairyFree', 'nutFree'],
    isStaple: false,
    isAllergen: false,
    shelfLifeDays: 730,
    storage: 'cupboard',
    notes: 'Ulmus rubra inner bark powder. Buy from cultivated (not wild-harvested) sources only. Space 2 hours away from prescription drugs.',
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  let seeded = 0
  let skipped = 0

  for (const ing of NEW_INGREDIENTS) {
    const existing = await prisma.ingredient.findUnique({ where: { slug: ing.slug } })
    if (existing) {
      console.log(`[skip] ${ing.slug} (already exists)`)
      skipped++
      continue
    }
    await prisma.ingredient.create({
      data: {
        slug: ing.slug,
        name: ing.name,
        category: ing.category,
        defaultUnit: ing.defaultUnit,
        dietaryFlags: ing.dietaryFlags,
        isStaple: ing.isStaple,
        isAllergen: ing.isAllergen,
        shelfLifeDays: ing.shelfLifeDays,
        storage: ing.storage,
        notes: ing.notes ?? null,
      },
    })
    console.log(`[seed] ${ing.slug}`)
    seeded++
  }

  console.log(`\nDone. Seeded: ${seeded}, Skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
