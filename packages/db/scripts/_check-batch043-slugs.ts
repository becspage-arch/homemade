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

const ingreds = [
  'orange-juice','blood-orange','grapefruit','elderflower','blackcurrant',
  'passion-fruit','chinese-cabbage','mooli','fish-sauce','star-anise',
  'caraway-seeds','horseradish-sauce','citric-acid','dark-brown-sugar',
  'fresh-thyme','fresh-dill','cabbage-white','malt-vinegar','balsamic-vinegar',
  'red-wine-vinegar','white-wine-vinegar','cider-vinegar','spring-onion',
  'courgette','smoked-paprika','english-mustard-powder','seville-orange',
]
const tools = [
  'glass-bottle','glass-jar-1l','glass-jar-200ml','glass-jar-500ml',
  'glass-jar-750ml','muslin-cloth','fine-sieve','large-saucepan','medium-saucepan',
]

async function main() {
  const foundIngreds = await prisma.ingredient.findMany({ where: { slug: { in: ingreds } }, select: { slug: true } })
  const foundTools = await prisma.tool.findMany({ where: { slug: { in: tools } }, select: { slug: true } })
  const fi = new Set(foundIngreds.map(i => i.slug))
  const ft = new Set(foundTools.map(t => t.slug))
  console.log('=INGREDIENTS=')
  for (const s of ingreds) console.log((fi.has(s) ? '✓' : '✗') + ' ' + s)
  console.log('=TOOLS=')
  for (const s of tools) console.log((ft.has(s) ? '✓' : '✗') + ' ' + s)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
