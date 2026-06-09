import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  
  const slugsToCheck = [
    // Essential oils likely in master
    'essential-oil-geranium', 'essential-oil-rosemary', 'essential-oil-cedarwood',
    'essential-oil-orange', 'essential-oil-lemon', 'essential-oil-clary-sage',
    'essential-oil-sandalwood', 'essential-oil-jasmine', 'essential-oil-chamomile',
    'essential-oil-vetiver', 'essential-oil-patchouli', 'essential-oil-grapefruit',
    'essential-oil-clove', 'essential-oil-cardamom', 'essential-oil-ginger',
    'essential-oil-cinnamon', 'essential-oil-anise', 'essential-oil-pine',
    // Soaping oils
    'avocado-oil', 'sunflower-oil', 'palm-oil', 'lard',
    'cocoa-butter', 'mango-butter', 'avocado-butter',
    // Clays and additives
    'red-clay', 'green-clay', 'kaolin-clay', 'bentonite-clay', 'french-green-clay',
    'activated-charcoal', 'spirulina-powder', 'indigo-powder', 'turmeric-powder',
    'coffee-grounds', 'cocoa-powder', 'carrot-puree',
    // Candle and beauty
    'coconut-wax', 'soy-wax', 'fragrance-oil-vetiver-smoke',
    'isopropyl-alcohol', 'polysorbate-80', 'niacinamide',
    // Cleaning
    'sodium-carbonate', 'borax', 'castile-soap-bar',
    'olive-oil-soap', 'potassium-hydroxide',
    // Fragrance
    'essential-oil-neroli', 'essential-oil-lime',
    // Beeswax candle
    'beeswax-sheets', 'beeswax-pastilles',
  ]
  
  const found: Record<string, string> = {}
  for (const s of slugsToCheck) {
    const ingredient = await prisma.ingredient.findUnique({ where: { slug: s }, select: { name: true } })
    found[s] = ingredient ? ingredient.name : 'NOT FOUND'
  }
  console.log('INGREDIENT_CHECK2:', JSON.stringify(found, null, 2))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
