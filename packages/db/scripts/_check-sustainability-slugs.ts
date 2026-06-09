import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slugsToCheck = [
  'external-wall-insulation-ewi-installation',
  'cavity-wall-insulation-installation-process',
  'mvhr-decision-guide',
  'internal-wall-insulation-one-room-pattern',
  'dormer-warm-roof-insulation',
  'air-sealing-tape-and-mastic-junctions',
  'pitched-roof-ventilation-baffle-installation',
  'floor-insulation-concrete-slab-overlay',
  'listed-building-insulation-options',
  'spray-applied-airtightness-membrane',
  'ev-smart-charging-solar-pv-sync',
  'solar-pv-export-limit-g98-g99',
  'dc-coupled-vs-ac-coupled-solar-battery',
  'heat-battery-for-solar-storage',
  'air-source-heat-pump-installation-overview',
  'immersion-heater-element-replacement',
  'radiator-sizing-for-heat-pump-compatibility',
  'ground-mounted-solar-pv-array',
  'biochar-application-rates-and-soil-amendment',
  'hot-compost-vs-warm-compost-comparison',
  'mushroom-spent-substrate-compost-reuse',
  'composting-in-a-community-garden',
  'in-vessel-composting-unit-guide',
  'compost-thermometer-use-and-hot-heap-management',
  'sheet-mulching-lasagne-garden',
]

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck } },
    select: { slug: true, status: true },
  })
  console.log('FOUND IN DB:' + JSON.stringify(rows.map(r => ({ slug: r.slug, status: r.status }))))
  const found = new Set(rows.map(r => r.slug))
  const missing = slugsToCheck.filter(s => !found.has(s))
  console.log('NOT IN DB:' + JSON.stringify(missing))
}

main().catch(err => { console.error(err); process.exit(1) }).finally(() => prisma.$disconnect())
