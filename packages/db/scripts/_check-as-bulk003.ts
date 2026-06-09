import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs = [
    'queen-marking-and-clipping',
    'reading-the-brood-frame',
    'winter-hive-checks-and-hefting',
    'culling-a-chicken-humanely',
    'castrating-and-tailing-lambs',
    'weaning-piglets',
    'post-and-rail-fencing-for-stock',
    'electric-fence-troubleshooting',
    'goat-hoof-trimming',
    'preparing-a-lambing-kit',
  ]
  const found = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, categoryId: true },
  })
  for (const s of slugs) {
    const t = found.find(x => x.slug === s)
    console.log(`${s}: ${t ? t.status : 'NOT_FOUND'}`)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
