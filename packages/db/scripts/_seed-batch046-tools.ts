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
  const tools = [
    { slug: 'flat-spatula', name: 'Flat spatula', category: 'utensil', aliases: ['fish slice', 'fish turner', 'slotted spatula', 'turner'] },
    { slug: 'oven-safe-soup-bowls', name: 'Oven-safe soup bowls', category: 'bakeware', aliases: ['French onion soup bowls', 'crocks', 'oven-proof bowls'] },
    { slug: 'blender', name: 'Blender', category: 'electrical', aliases: ['jug blender', 'liquidiser', 'blender jug'] },
  ]
  for (const tool of tools) {
    const ex = await prisma.tool.findUnique({ where: { slug: tool.slug } })
    if (ex) { console.log('SKIP: ' + tool.slug); continue }
    await prisma.tool.create({ data: tool })
    console.log('CREATED: ' + tool.slug)
  }
  await prisma.$disconnect()
  console.log('Done.')
}
main().catch(e => { console.error(e); process.exit(1) })
