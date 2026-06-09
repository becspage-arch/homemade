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
    'melt-and-pour-soap-base', 'clear-melt-pour-base', 'white-melt-pour-base', 'shea-melt-pour-base',
    'nigella-seed-oil', 'black-seed-oil', 'neem-oil',
    'essential-oil-black-pepper', 'essential-oil-cardamom',
    'red-wine', 'beer', 'buttermilk',
    'potassium-hydroxide', 'aloe-vera-juice', 'milk-full-fat',
    'optiphen-preservative', 'leucidal-liquid', 'broad-spectrum-preservative',
    'fragrance-oil-bergamot-neroli', 'fragrance-oil-fig-cassis',
    'fragrance-oil-sandalwood-vanilla', 'fragrance-oil-christmas-spice',
    'fragrance-oil-vetiver',
    'beeswax-cosmetic-grade',
    'candelilla-wax',
    'arrowroot-powder', 'cornstarch',
    'magnesium-sulphate', 'epsom-salts',
    'sodium-bicarbonate', 'citric-acid-fine',
    'essential-oil-spike-lavender',
    'glycerol', 'propylene-glycol',
  ]
  
  const found: Record<string, string> = {}
  for (const s of slugsToCheck) {
    const ingredient = await prisma.ingredient.findUnique({ where: { slug: s }, select: { name: true } })
    found[s] = ingredient ? ingredient.name : 'NOT FOUND'
  }
  console.log('INGREDIENT_CHECK4:', JSON.stringify(found, null, 2))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
