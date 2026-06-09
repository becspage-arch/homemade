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
  const sub = await prisma.subCategory.findFirst({ where: { slug: 'stitches', category: { slug: 'crochet' } } })
  if (!sub) { console.log('No stitches sub-category'); return }
  console.log(`Stitches sub-cat id: ${sub.id}`)
  
  const count = await prisma.tutorial.count({ where: { subCategoryId: sub.id } })
  const pubCount = await prisma.tutorial.count({ where: { subCategoryId: sub.id, status: 'PUBLISHED' } })
  console.log(`Stitches total: ${count}, published: ${pubCount}`)
  
  const samples = await prisma.tutorial.findMany({
    where: { subCategoryId: sub.id, status: 'PUBLISHED' },
    select: { slug: true, title: true, body: true, techniqueSlugs: true, aliases: true },
    take: 3, orderBy: { slug: 'asc' }
  })
  for (const t of samples) {
    const body = t.body as any
    const nodes = body?.content ?? []
    const firstPara = nodes.find((n: any) => n.type === 'paragraph')
    const text = firstPara?.content?.map((c: any) => c.text ?? '').join('') ?? ''
    console.log(`\n--- ${t.slug} ---`)
    console.log(`title: ${t.title}`)
    console.log(`body nodes: ${nodes.length}`)
    console.log(`techniqueSlugs: ${JSON.stringify(t.techniqueSlugs)}`)
    console.log(`aliases: ${JSON.stringify(t.aliases)}`)
    console.log(`first para: "${text.slice(0,280)}"`)
  }
  await prisma.$disconnect()
}
main().catch(console.error)
