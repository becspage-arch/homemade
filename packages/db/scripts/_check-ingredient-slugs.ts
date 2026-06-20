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

const slugsToCheck = [
  'stem-ginger', 'stem-ginger-syrup', 'preserved-ginger', 'crystallised-ginger',
  'mixed-peel', 'peel-mixed', 'candied-orange-peel', 'dark-muscovado',
  'muscovado-dark', 'hazelnut-praline', 'praline', 'candied-peel-mixed',
  'maple-extract', 'rose-water', 'orange-blossom-water', 'flaked-almonds',
  'almonds-flaked', 'almond-flakes', 'pistachio-nuts', 'pistachios',
  'strong-bread-flour', 'dark-chocolate-chips', 'chocolate-chips-dark',
  'milk-powder', 'dried-milk-powder', 'whipping-cream',
]

async function main() {
  const { prisma } = await import('../src/index.js')
  for (const slug of slugsToCheck) {
    const found = await prisma.ingredient.findFirst({ where: { slug } })
    console.log(found ? `✓ ${slug}` : `✗ ${slug}`)
  }
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
