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

async function search(term: string) {
  const r = await prisma.ingredient.findMany({ where: { slug: { contains: term } }, select: { slug: true, name: true }, take: 10 })
  if (r.length) console.log(`~${term}: ${r.map(i => `${i.slug} (${i.name})`).join(', ')}`)
  else console.log(`~${term}: (none)`)
}

async function main() {
  for (const t of ['cinnamon','allspice','tomato','plum','ginger','carrot']) {
    await search(t)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
