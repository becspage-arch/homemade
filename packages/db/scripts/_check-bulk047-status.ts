import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
let dir = dirname(__filename)
for (let i = 0; i < 8; i++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p2 = dirname(dir); if (p2 === dir) break; dir = p2
}

import { prisma as p } from '../src/index.js'

const slugs = [
  'atholl-brose','bacon-sandwich','bangers-and-mash','beans-on-toast',
  'beef-and-guinness-stew','black-pudding-breakfast','boiled-bacon-and-cabbage',
  'boxty','chicken-goujons','chip-butty','chip-shop-curry-sauce',
  'coronation-chicken','coronation-chicken-sandwich','cottage-pie',
  'cucumber-sandwich','devilled-eggs','devilled-kidneys','devilled-mackerel',
  'egg-and-chips','eggy-bread','fish-finger-sandwich','ham-and-mustard-sandwich',
  'jacket-potato-cheese-and-beans','jacket-potato-tuna-mayo','liver-and-onions',
  'oxtail-soup','pie-and-mash','prawn-cocktail','sausage-sandwich','scampi',
  'scotch-woodcock','singin-hinnies','smoked-haddock-chowder','smoked-salmon-sandwich',
  'soda-farls','spaghetti-bolognese','stovies','treacle-tart','tuna-pasta-bake','welsh-cakes'
]

async function main() {
  const rows = await p.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, qcBlockReason: true }
  })
  const published = rows.filter(r => r.status === 'PUBLISHED')
  const draft = rows.filter(r => r.status === 'DRAFT')
  const notFound = slugs.filter(s => !rows.find(r => r.slug === s))
  console.log(`PUBLISHED: ${published.length}`)
  console.log(`DRAFT: ${draft.length}`)
  if (draft.length) {
    for (const d of draft) {
      const reason = d.qcBlockReason ? JSON.stringify(d.qcBlockReason).slice(0, 300) : 'none'
      console.log(`  DRAFT: ${d.slug} — ${reason}`)
    }
  }
  console.log(`NOT FOUND: ${notFound.length}`)
  if (notFound.length) console.log(`  Missing: ${notFound.join(', ')}`)
  await p.$disconnect()
}

main().catch(console.error)
