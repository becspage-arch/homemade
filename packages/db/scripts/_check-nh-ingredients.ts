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
  
  // Check for specific natural-home ingredients
  const slugsToCheck = [
    'sodium-hydroxide', 'distilled-water', 'coconut-oil', 'olive-oil', 'castor-oil', 
    'shea-butter', 'beeswax-pellets', 'soy-wax-container', 'candle-wick-pretabbed',
    'essential-oil-lavender', 'essential-oil-eucalyptus', 'essential-oil-bergamot',
    'essential-oil-lemongrass', 'essential-oil-peppermint', 'essential-oil-tea-tree',
    'essential-oil-frankincense', 'essential-oil-rose', 'essential-oil-ylang-ylang',
    'fragrance-oil-magnolia-peony', 'fragrance-oil-tobacco-vanilla', 'fragrance-oil-coffee-vanilla',
    'fragrance-oil-fig-cassis', 'fragrance-oil-oud-rose', 'fragrance-oil-cardamom-bergamot',
    'fragrance-oil-lemongrass-ginger', 'fragrance-oil-autumn-harvest',
    'jojoba-oil', 'rosehip-oil', 'sweet-almond-oil', 'argan-oil', 'hemp-seed-oil',
    'sea-buckthorn-oil', 'vitamin-e-oil', 'vitamin-c-powder', 'ascorbyl-tetraisopalmitate',
    'white-beeswax-pellets', 'carnauba-wax', 'cetyl-alcohol', 'emulsifying-wax',
    'rose-water', 'witch-hazel', 'vegetable-glycerine', 'aloe-vera-gel',
    'citric-acid', 'bicarbonate-of-soda', 'washing-soda', 'castile-soap',
    'white-wine-vinegar', 'white-vinegar', 'liquid-castile-soap',
    'beeswax-yellow', 'beeswax-white', 'carnauba-wax-flakes',
    'dipropylene-glycol', 'fragrance-oil-jasmine-sandalwood', 'fragrance-oil-amber-patchouli',
    'fragrance-oil-bergamot-vetiver', 'fragrance-oil-christmas-spice',
    'coconut-wax-container', 'paraffin-wax', 'pre-tabbed-wick-cotton'
  ]
  
  const found: Record<string, string> = {}
  for (const s of slugsToCheck) {
    const ingredient = await prisma.ingredient.findUnique({ where: { slug: s }, select: { name: true } })
    found[s] = ingredient ? ingredient.name : 'NOT FOUND'
  }
  console.log('INGREDIENT_CHECK:', JSON.stringify(found, null, 2))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
