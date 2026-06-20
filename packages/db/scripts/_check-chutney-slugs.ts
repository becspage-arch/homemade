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

const check = [
  'ground-cumin','ground-coriander','ground-turmeric','salt',
  'white-wine-vinegar','cider-vinegar','malt-vinegar','red-wine-vinegar','balsamic-vinegar',
  'brown-sugar','dark-brown-sugar','light-brown-sugar','granulated-sugar',
  'mustard-seeds','coriander-seeds','caraway-seeds','fennel-seeds',
  'peppercorns','bay-leaves','cloves','star-anise','citric-acid',
  'horseradish-sauce','english-mustard-powder','smoked-paprika',
  'courgette','cabbage-white','red-onion','red-cabbage','red-pepper',
  'spring-onion','beetroot','cucumber','carrot','green-beans','cauliflower',
  'onion','garlic','ginger-root','chilli-flakes','fish-sauce','napa-cabbage',
  'glass-jar-500ml','glass-jar-750ml','glass-jar-1l','glass-bottle',
]

async function main() {
  const r = await prisma.ingredient.findMany({ where: { slug: { in: check } }, select: { slug: true } })
  const rt = await prisma.tool.findMany({ where: { slug: { in: check } }, select: { slug: true } })
  const found = new Set([...r.map(i => i.slug), ...rt.map(t => t.slug)])
  const missing: string[] = []
  for (const s of check) {
    if (!found.has(s)) {
      console.log('MISSING: ' + s)
      missing.push(s)
    } else {
      console.log('OK: ' + s)
    }
  }
  console.log(`\nMissing: ${missing.length} / ${check.length}`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
