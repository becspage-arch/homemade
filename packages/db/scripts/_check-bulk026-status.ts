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
async function main() {
  const { prisma } = await import('../src/index.js')

  const slugs = [
    'milk-roll','tiger-bread','rye-bread-german','potato-bread-irish',
    'bread-rolls-white','crusty-rolls','bap','ciabatta-rustic',
    'victoria-sandwich','steamed-chocolate-pudding','orange-drizzle-cake',
    'upside-down-cake-pineapple','apple-upside-down-cake','chestnut-cake',
    'walnut-cake','marmalade-cake','rough-puff-pastry',
    'pastry-cream-creme-patissiere','cream-puffs-small','danish-pastry-whirl',
    'mille-feuille','macarons-french','madeleines-french','tuile-biscuits',
    'langues-de-chat-biscuit','melting-moments','viennese-biscuits',
    'chicken-and-mushroom-pie','cornish-pasty-traditional','pork-and-apple-pie',
    'maple-pecan-tart','pork-pie-hot-water-crust','raisin-scones',
    'cranberry-and-orange-scones','wholemeal-cheese-scones',
    'scottish-treacle-scones','vanilla-fudge','praline-french',
    'sea-salt-caramels','clotted-cream-fudge'
  ]

  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, categorySlug: 'baking' },
    select: { slug: true, status: true, publishedAt: true },
    orderBy: { publishedAt: 'asc' }
  })

  console.log(`Found ${rows.length} of ${slugs.length} slugs in DB`)
  console.log('Published:', rows.filter(r => r.status === 'PUBLISHED').length)
  rows.forEach(r => console.log(`  ${r.slug}: ${r.status}`))

  // Check which slugs are missing
  const found = new Set(rows.map(r => r.slug))
  const missing = slugs.filter(s => !found.has(s))
  if (missing.length) console.log('\nMISSING:', missing)

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
