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

import { prisma } from '../src/index.js'

const slugs = [
  'strawberry-jam','raspberry-jam','blackberry-jam','gooseberry-jam','plum-jam',
  'rhubarb-and-ginger-jam','apricot-jam','damson-jam','fig-jam','blueberry-jam',
  'seville-orange-marmalade','blood-orange-marmalade','three-fruit-marmalade',
  'lemon-marmalade','ginger-marmalade',
  'lemon-curd','raspberry-curd','passion-fruit-curd','rhubarb-curd','orange-curd',
  'mango-chutney','apple-chutney','tomato-chutney','red-onion-chutney',
  'caramelised-onion-chutney','plum-chutney','beetroot-chutney','piccalilli',
  'pickled-red-onions','pickled-red-cabbage','pickled-beetroot','pickled-cucumbers-quick',
  'sauerkraut','kimchi','lacto-fermented-carrots',
  'elderflower-cordial','lemon-cordial','blackcurrant-cordial','raspberry-cordial',
  'rhubarb-cordial',
]

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true },
  })
  const bySlug = new Map(rows.map(r => [r.slug, r.status]))
  let published = 0, draft = 0, missing = 0
  for (const s of slugs) {
    const st = bySlug.get(s)
    if (!st) { console.log(`MISSING: ${s}`); missing++ }
    else if (st !== 'PUBLISHED') { console.log(`${st}: ${s}`); draft++ }
    else published++
  }
  console.log(`\nPUBLISHED: ${published} / ${slugs.length}  DRAFT/OTHER: ${draft}  MISSING: ${missing}`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
