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
  const { prisma, TutorialStatus } = await import('../src/index.js')
  const slugs = ['garden', 'needlework', 'sewing', 'knitting', 'crochet']
  for (const cs of slugs) {
    const cat = await prisma.category.findUnique({ where: { slug: cs }, select: { id: true } })
    if (!cat) { console.log(`${cs}: not found`); continue }
    const drafts = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: TutorialStatus.DRAFT },
      select: { slug: true, title: true, type: true, heroMediaId: true, subCategory: { select: { slug: true, name: true } } },
      orderBy: { slug: 'asc' },
    })
    console.log(`\n=== ${cs.toUpperCase()} (${drafts.length} DRAFTs) ===`)
    for (const d of drafts) {
      console.log(`  ${d.slug}  [${d.type}]  sub=${d.subCategory?.slug ?? 'none'}  hero=${d.heroMediaId ?? 'null'}`)
      console.log(`    title: ${d.title}`)
    }
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
