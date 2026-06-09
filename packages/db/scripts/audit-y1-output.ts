import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')

  // All TECHNIQUE tutorials authored recently
  const since = new Date()
  since.setHours(since.getHours() - 6)

  console.log('TECHNIQUE TUTORIALS created/updated in last 6 hours:')
  const techniques = await prisma.tutorial.findMany({
    where: {
      type: 'TECHNIQUE',
      OR: [
        { createdAt: { gte: since } },
        { updatedAt: { gte: since } },
      ],
    },
    select: { id: true, slug: true, title: true, status: true, heroMediaId: true, category: { select: { slug: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  techniques.forEach((t) => {
    console.log(`  [${t.status.padEnd(9)}] [${t.category.slug.padEnd(20)}] ${t.title}`)
    console.log(`     slug: ${t.slug}  hero: ${t.heroMediaId ? 'YES' : 'no'}  preview: /admin/tutorials/${t.id}`)
  })

  console.log('\nALL DRAFTS across all categories:')
  const drafts = await prisma.tutorial.findMany({
    where: { status: 'DRAFT' },
    select: { id: true, slug: true, title: true, type: true, heroMediaId: true, category: { select: { slug: true } } },
    orderBy: [{ category: { order: 'asc' } }, { updatedAt: 'desc' }],
  })
  let lastCat = ''
  drafts.forEach((d) => {
    if (d.category.slug !== lastCat) {
      console.log(`\n  === ${d.category.slug} ===`)
      lastCat = d.category.slug
    }
    console.log(`    [${d.type.padEnd(13)}] hero:${d.heroMediaId ? 'Y' : 'N'} ${d.title}`)
    console.log(`       /admin/tutorials/${d.id}`)
  })

  console.log(`\nDRAFT totals: ${drafts.length}`)
  console.log(`TECHNIQUE drafts: ${drafts.filter((d: any) => d.type === 'TECHNIQUE').length}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
