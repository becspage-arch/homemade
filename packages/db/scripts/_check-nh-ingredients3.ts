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
    // More essential oils
    'essential-oil-sweet-orange', 'essential-oil-wild-orange',
    'essential-oil-roman-chamomile', 'essential-oil-german-chamomile',
    'essential-oil-clary-sage', 'essential-oil-juniper-berry', 'essential-oil-juniper',
    // Fragrance oils that might exist
    'fragrance-oil-sea-salt-driftwood', 'fragrance-oil-apple-cinnamon', 'fragrance-oil-neroli-ylang',
    'fragrance-oil-lemon-verbena', 'fragrance-oil-black-pepper-amber', 'fragrance-oil-bergamot-neroli',
    'fragrance-oil-pine-forest',
    // More cleaning
    'white-spirit', 'methylated-spirit', 'washing-soda-crystals', 
    'cream-of-tartar', 'hydrogen-peroxide', 'borax-substitute',
    // Waxes
    'carnauba-wax-powder', 'lanolin',
    // Cleaning ingredients
    'salt-flakes', 'fine-salt', 'table-salt', 'sea-salt',
    // Soapmaking
    'goats-milk-powder', 'oat-milk-powder', 'coconut-milk-powder', 'sodium-lactate',
    'silk-fibres', 'tussah-silk',
    // Candles
    'coconut-wax-pillar', 'palm-wax', 'paraffin-wax-container',
  ]
  
  const found: Record<string, string> = {}
  for (const s of slugsToCheck) {
    const ingredient = await prisma.ingredient.findUnique({ where: { slug: s }, select: { name: true } })
    found[s] = ingredient ? ingredient.name : 'NOT FOUND'
  }
  console.log('INGREDIENT_CHECK3:', JSON.stringify(found, null, 2))
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
