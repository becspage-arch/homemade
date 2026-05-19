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

  // List all mindset sub-categories
  const subs = await prisma.subCategory.findMany({
    where: { category: { slug: 'mindset' } },
    select: {
      slug: true,
      name: true,
      description: true,
      _count: { select: { tutorials: true } },
    },
    orderBy: { order: 'asc' },
  })

  console.log('MINDSET SUB-CATEGORIES:')
  subs.forEach((s) => {
    console.log(
      `  ${s.slug.padEnd(28)} | ${s.name.padEnd(30)} | ${s._count.tutorials} tutorials`,
    )
  })

  console.log('\nSearching mindset tutorials for "magic" keywords (title / description / body)...')
  const matches = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'mindset' },
      status: 'PUBLISHED',
      OR: [
        { title: { contains: 'magic', mode: 'insensitive' } },
        { title: { contains: 'spell', mode: 'insensitive' } },
        { title: { contains: 'manifest', mode: 'insensitive' } },
        { title: { contains: 'ritual', mode: 'insensitive' } },
        { title: { contains: 'witch', mode: 'insensitive' } },
        { title: { contains: 'altar', mode: 'insensitive' } },
        { title: { contains: 'moon', mode: 'insensitive' } },
        { title: { contains: 'intention', mode: 'insensitive' } },
        { title: { contains: 'visualis', mode: 'insensitive' } },
        { title: { contains: 'visualiz', mode: 'insensitive' } },
      ],
    },
    select: { slug: true, title: true, subCategory: { select: { slug: true } } },
    take: 30,
  })

  console.log(`\nFound ${matches.length} tutorials matching magic-adjacent keywords:`)
  matches.forEach((m) => {
    console.log(`  [${m.subCategory?.slug ?? '?'}] ${m.title}  (${m.slug})`)
  })
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
