import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs = [
    'compost-thermometer','compost-aerator','thermal-imaging-camera','foam-strip-gun',
    'draught-excluder-strip','letterbox-brush-strip','silicone-sealant-gun','rainwater-diverter-kit',
    'tap-flow-restrictor','energy-monitor','tape-measure-5m','tape-measure-8m',
    'spirit-level-1200mm','spirit-level-200mm','drill-driver','cordless-drill-18v',
    'saw-hand','utility-knife','screwdriver-set-phillips-slot','screwdriver-set-pozidriv',
    'adjustable-spanner','adjustable-spanner-200mm','garden-fork','spade',
    'compost-sieve','bucket-10l','aquarium-pump','scraper-50mm','scraper-filling',
    'vacuum-cleaner','heat-gun','multimeter-digital','sds-drill',
  ]
  const found = await prisma.tool.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  const foundSet = new Set(found.map(t => t.slug))
  console.log('=== FOUND ===')
  for (const f of found) console.log(`  ${f.slug} | ${f.name}`)
  console.log('\n=== MISSING ===')
  for (const s of slugs) if (!foundSet.has(s)) console.log(`  ${s}`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
