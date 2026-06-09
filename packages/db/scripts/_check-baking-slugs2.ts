import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

const slugsToCheck = [
  'malted-bloomer', 'caraway-rye-bread', 'olive-focaccia', 'coffee-walnut-layer-cake',
  'sticky-ginger-cake', 'clementine-polenta-cake', 'jam-drops', 'chocolate-digestives',
  'apple-turnover', 'almond-croissants', 'custard-slice-mille-feuille', 'brandy-snaps',
  'chelsea-buns', 'hot-cross-buns', 'lardy-cake', 'bara-brith',
  'malt-loaf', 'teacakes-yorkshire', 'crumpets', 'blinis-russian',
  'frangipane-raspberry-tart', 'buttermilk-cake', 'yoghurt-cake',
  'almond-cake-spanish'
]

async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck }, categoryId: 'cmp6k8pfp0000rgv4kpfgse4e' },
    select: { slug: true }
  })
  const existingSlugs = new Set(existing.map(t => t.slug))
  const available = slugsToCheck.filter(s => !existingSlugs.has(s))
  console.log('EXISTING:', JSON.stringify(existing.map(t => t.slug)))
  console.log('AVAILABLE:', JSON.stringify(available))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
