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
  const rows: any[] = await prisma.$queryRaw`
    SELECT t.slug, t."publishedAt", t."createdAt"
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    WHERE c.slug = 'baking'
      AND t.slug = ANY(${slugs})
    ORDER BY t.slug
  `
  const cutoff = new Date('2026-06-01T22:00:00Z') // session start
  let preExisting = 0
  let newToday = 0
  for (const r of rows) {
    const isNew = r.createdAt > cutoff
    if (!isNew) preExisting++
    else newToday++
    if (!isNew) console.log(`PRE-EXISTING: ${r.slug} (created: ${r.createdAt?.toISOString()?.slice(0,19)})`)
  }
  console.log(`\nFound: ${rows.length}/40 slugs in DB`)
  console.log(`New today (after 22:00 UTC): ${newToday}`)
  console.log(`Pre-existing: ${preExisting}`)
  const found = new Set(rows.map((r: any) => r.slug))
  const missing = slugs.filter(s => !found.has(s))
  if (missing.length) console.log('\nMISSING from DB:', missing.join(', '))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
