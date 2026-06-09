import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const cat = await prisma.category.findUnique({
    where: { slug: 'paper-word' },
    select: { id: true, slug: true, pipelineStatus: true, targetTutorialCount: true }
  })
  if (!cat) { console.log('CATEGORY NOT FOUND'); return }
  console.log('Category:', JSON.stringify(cat))

  const count = await prisma.tutorial.count({
    where: { categoryId: cat.id, status: 'PUBLISHED' }
  })
  console.log('Published count:', count)

  const slugs = ['ethiopian-binding', 'coptic-chain-variation', 'origami-fox-face']
  const found = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, slug: { in: slugs } },
    select: { slug: true, status: true }
  })
  console.log('Bulk-005 check:', JSON.stringify(found))

  await prisma.$disconnect()
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })
