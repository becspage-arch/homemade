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
    'leg-band-numbered','ear-tag-applicator','ear-tags-sheep','syringe-livestock','vaccination-needles',
    'sheep-cradle','creep-feeder','milking-bucket','milking-platform','smoker-fuel',
    'mouse-guard','queen-cage','queen-marking-pen','frame-grip','uncapping-fork',
    'extractor-tangential','filter-strainer-honey','iron-injection-piglet','marker-paint-livestock',
    'wing-clipping-scissors','dust-bath-tray','plucking-table','scalding-tank','killing-cone',
    'rabbit-tattoo-set','rabbit-nest-box','feed-bin-galvanised','rodent-bait-station',
    'gumboots','overalls-livestock','torch-red-led','dipping-tank-sheep','foot-bath-livestock',
    'salt-block','mineral-bucket','straw-bale','heat-mat-poultry','brooder-heat-plate',
    'manure-fork','wheelbarrow','poultry-shears','axe-small','knife-skinning',
    'apha-record-book','holding-register','bucket-trug','soakaway-grid','land-drainage-pipe',
    'soil-ph-meter','soil-test-kit','rotational-grazer-fence-post',
  ]
  const found = await prisma.tool.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true },
  })
  const foundSet = new Set(found.map(t => t.slug))
  console.log('=== FOUND ===')
  for (const f of found) console.log(`${f.slug} | ${f.name}`)
  console.log('\n=== MISSING ===')
  for (const s of slugs) if (!foundSet.has(s)) console.log(s)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
