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

async function main() {
  const missing = [
    'dried-haricot-beans','bacon-lardons','breadcrumbs','veal-shoulder',
    'pearl-onions','new-potatoes','frozen-peas','flat-leaf-parsley',
    'sole-fillets','monkfish','raw-prawns','fish-stock','fennel-bulb',
    'beef-stock','leeks','potatoes-floury','small-pasta','tinned-tuna',
    'sirloin-steak','dark-chocolate-70','grand-marnier','eating-apples',
    // also check what dark-chocolate looks like
    'dark-chocolate','apple','steak','tuna','parsley',
  ]

  const found = await prisma.ingredient.findMany({
    where: { slug: { in: missing } },
    select: { slug: true, name: true }
  })
  const foundMap = new Map(found.map(i => [i.slug, i.name]))
  for (const s of missing) {
    if (foundMap.has(s)) process.stdout.write(`FOUND: ${s} → "${foundMap.get(s)}"\n`)
    else process.stdout.write(`MISS:  ${s}\n`)
  }

  // Also search by name patterns for likely existing alternatives
  const searches = ['haricot','lardon','breadcrumb','veal','pearl onion','new potato','frozen pea','parsley','sole','monkfish','prawn','stock','fennel','beef','leek','potato','pasta','tuna','sirloin','chocolate','grand marnier','apple']
  process.stdout.write('\n--- Name searches ---\n')
  for (const term of searches) {
    const r = await prisma.ingredient.findMany({
      where: { OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term.replace(/\s/g, '-'), mode: 'insensitive' } },
      ]},
      select: { slug: true, name: true },
      take: 3,
    })
    if (r.length) process.stdout.write(`"${term}": ${r.map(i => i.slug + ' ("' + i.name + '")').join(', ')}\n`)
    else process.stdout.write(`"${term}": (none)\n`)
  }

  // Also check tool master
  process.stdout.write('\n--- Tool searches ---\n')
  const toolSearches = ['gratin','electric','mixer','dish','baking']
  for (const term of toolSearches) {
    const r = await prisma.recipeToolMaster.findMany({
      where: { OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ]},
      select: { slug: true, name: true },
      take: 5,
    }).catch(() => [] as {slug:string,name:string}[])
    if (r.length) process.stdout.write(`tool "${term}": ${r.map(t => t.slug + ' ("' + t.name + '")').join(', ')}\n`)
    else process.stdout.write(`tool "${term}": (none from recipeToolMaster)\n`)
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
