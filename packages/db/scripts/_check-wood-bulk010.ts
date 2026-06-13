import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const SLUGS = [
  'carved-sycamore-serving-spoon-long',
  'carved-ash-jam-spoon-short',
  'carved-birch-egg-ladle',
  'carved-maple-salt-spoon',
  'stop-cut-technique',
  'reading-the-grain-for-spoon-carvers',
  'whittled-pine-butter-spreader',
  'whittled-oak-peg-hook',
  'whittled-ash-letter-opener',
  'whittled-walnut-pendant-blank',
  'thumb-push-cut-technique',
  'choosing-wood-for-whittling',
  'riven-ash-stool-leg',
  'shaved-hazel-walking-stick',
  'green-ash-bowl-on-pole-lathe',
  'drawknife-shaved-rake-handle',
  'using-the-froe-for-riving',
  'shaving-horse-setup-technique',
  'why-green-wood-works',
  'british-species-for-green-woodwork',
  'round-willow-bread-basket',
  'oval-willow-shopping-basket',
  'willow-garden-trug',
  'willow-fruit-bowl',
  'pairing-weave-technique',
  'waling-technique',
  'selecting-and-soaking-willow',
  'the-parts-of-a-basket',
  'oak-end-grain-serving-board',
  'cherry-butter-dish',
  'walnut-cheese-board',
  'card-scraper-technique',
  'danish-oil-finishing-technique',
]

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: SLUGS } },
    select: { slug: true, status: true },
  })
  console.log('FOUND_COUNT:', rows.length)
  console.log('FOUND:', JSON.stringify(rows.map(r => `${r.slug}:${r.status}`)))
  const missing = SLUGS.filter(s => !rows.find(r => r.slug === s))
  console.log('MISSING_COUNT:', missing.length)
  if (missing.length > 0) console.log('MISSING:', JSON.stringify(missing))
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
