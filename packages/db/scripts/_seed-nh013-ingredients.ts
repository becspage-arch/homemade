import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadCredentials() {
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); return }
    const parent = resolve(dir, '..')
    if (parent === dir) return
    dir = parent
  }
}
loadCredentials()

async function main() {
  const { prisma } = await import('../src/index.js')
  const newIngredients = [
    {
      slug: 'arnica-flowers-dried',
      name: 'Dried arnica flowers',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: [],
      aliases: ['dried Arnica montana', 'arnica (dried flowers)', 'arnica montana (dried)'],
      notes: 'Dried Arnica montana flower heads for infused oils and topical balms. For external use only — not for open skin or internal use. Cosmetic or herbal grade, pesticide-free. Commission E and EMA HMPC both recognise traditional topical use for bruises and sprains. Toxic if taken internally.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 365,
      storage: 'cool-dark',
    },
    {
      slug: 'vanilla-absolute',
      name: 'Vanilla absolute',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['vanilla-fragrance-oil'],
      aliases: ['vanilla CO2 extract', 'vanilla oleoresin', 'vanilla absolute perfumery'],
      notes: 'Solvent-extracted or CO2-extracted vanilla (Vanilla planifolia). Rich, warm, true vanilla scent used in solid perfumes and cosmetic formulations. Not the same as vanilla extract (which is water-soluble). Used at 0.5–2% of formula weight. Very viscous; warm gently before weighing.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cool-dark',
    },
    {
      slug: 'rapeseed-wax',
      name: 'Rapeseed wax',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['soy-wax-container'],
      aliases: ['canola wax', 'rapeseed container wax', 'UK rapeseed wax'],
      notes: 'Refined wax derived from rapeseed (Brassica napus) oil. British and European grown. Melt point 55–60°C; pour at 60–65°C for container candles. Slower cure than soy wax — allow 48 hours before test burning. Good fragrance load capacity (8–10%). Fully vegan and sustainably grown in the UK.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cupboard',
    },
    {
      slug: 'sea-buckthorn-oil',
      name: 'Sea buckthorn berry oil',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['rosehip-oil'],
      aliases: ['sea buckthorn oil', 'Hippophae rhamnoides berry oil', 'sea buckthorn CO2 extract'],
      notes: 'Bright orange oil extracted from sea buckthorn berries (Hippophae rhamnoides). Very high in beta-carotene, vitamin E, and omega-7 fatty acids. Stains skin and textiles orange at high concentrations — use at 1–3% max in face oils. CO2 extraction preserves carotenoids better than cold-press. Dilute in a carrier oil before use.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 365,
      storage: 'cool-dark',
    },
    {
      slug: 'perfumers-alcohol',
      name: "Perfumers' alcohol",
      category: 'other',
      defaultUnit: 'ml',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['vodka-unflavoured'],
      aliases: ['perfumers ethanol', '96% ethanol (perfumery)', 'SD40 ethanol', 'anhydrous ethanol (cosmetic)'],
      notes: "High-purity denatured ethanol (typically 96% ethyl alcohol with a small amount of denatonium benzoate as denaturant) for making room sprays, solid perfumes, and linen sprays. Dries quickly and leaves no residue on fabric. UK: available from cosmetic suppliers as 'Perfumers' Alcohol' or 'SD40'. Not suitable for consumption — the denaturant is bitter and mildly toxic.",
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cool-dark',
    },
    {
      slug: 'jasmine-absolute',
      name: 'Jasmine absolute',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['jasmine-flowers-dried', 'fragrance-oil-jasmine'],
      aliases: ['jasmine absolute (Jasminum sambac)', 'jasmine absolute (Jasminum grandiflorum)', 'jasmine concrete', 'jasmine essence'],
      notes: 'Solvent-extracted jasmine absolute from Jasminum grandiflorum or J. sambac. One of the most complex naturals in perfumery — indolic, heady, and deeply floral. Use at 0.5–1% in room sprays; at higher concentrations it can dominate. Extremely expensive compared to synthetic jasmine fragrance; reserve for products where botanical authenticity matters.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cool-dark',
    },
    {
      slug: 'fragrance-oil-jasmine',
      name: 'Jasmine fragrance oil',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['jasmine-absolute'],
      aliases: ['jasmine candle fragrance oil', 'jasmine FO', 'jasmine scent oil'],
      notes: 'Synthetic jasmine fragrance oil for candle making and cosmetic applications. Rich, heady floral. Flash point typically 65°C+ — check supplier spec. Candle usage rate 6–8% of wax weight. Not for direct skin application unless formulated and tested.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cool-dark',
    },
    {
      slug: 'fragrance-oil-pine-cedarwood',
      name: 'Pine and cedarwood fragrance oil',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['essential-oil-pine', 'essential-oil-cedarwood'],
      aliases: ['pine cedarwood FO', 'forest fragrance oil', 'woodland fragrance oil'],
      notes: 'Blended fragrance oil combining pine and cedarwood notes. Green, resinous, woody scent for container candles. Candle usage rate 6–8% of wax weight. Flash point typically 65°C+ — check supplier spec.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 1825,
      storage: 'cool-dark',
    },
    {
      slug: 'essential-oil-grapefruit',
      name: 'Grapefruit essential oil',
      category: 'other',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['essential-oil-sweet-orange', 'essential-oil-lemon'],
      aliases: ['grapefruit EO', 'Citrus paradisi peel oil', 'pink grapefruit essential oil'],
      notes: 'Cold-pressed grapefruit peel oil (Citrus paradisi). Bright, fresh citrus top note. Phototoxic — do not apply to skin before sun exposure. Good for candle top notes at 2–4% of wax weight. Evaporates faster than base notes; best used in combination with fixatives. Toxic to cats.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 365,
      storage: 'cool-dark',
    },
    {
      slug: 'eucalyptus-leaves-dried',
      name: 'Dried eucalyptus leaves',
      category: 'other',
      defaultUnit: 'unit',
      dietaryFlags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree', 'nutFree'],
      commonSubstitutes: ['essential-oil-eucalyptus'],
      aliases: ['dried eucalyptus', 'eucalyptus branches (dried)', 'eucalyptus sprigs (dried)', 'Eucalyptus globulus leaves (dried)'],
      notes: 'Whole dried eucalyptus leaves or sprigs for simmer pots, potpourri, and decorative use. Fresh eucalyptus leaves from a florist also work. The essential oil is more concentrated than whole leaves — if substituting EO, use 3–4 drops per 6 leaves.',
      isStaple: false,
      isAllergen: false,
      shelfLifeDays: 365,
      storage: 'cupboard',
    },
  ]
  for (const ing of newIngredients) {
    const result = await prisma.ingredient.upsert({ where: { slug: ing.slug }, update: {}, create: ing as any })
    console.log(`[upsert] ${result.slug} — id: ${result.id}`)
  }
  await prisma.$disconnect()
}
main().then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1) })
