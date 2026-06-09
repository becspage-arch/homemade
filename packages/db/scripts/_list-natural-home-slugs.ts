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

async function main() {
  const { prisma } = await import('../src/index.js')
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'natural-home' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: [{ subCategory: { slug: 'asc' } }, { slug: 'asc' }],
  })
  const bySub = new Map<string, string[]>()
  for (const t of tutorials) {
    const sub = t.subCategory?.slug ?? 'none'
    if (!bySub.has(sub)) bySub.set(sub, [])
    bySub.get(sub)!.push(t.slug)
  }
  for (const [sub, slugs] of bySub) {
    console.log(`[${sub}] ${slugs.length}`)
    for (const s of slugs) console.log(`  ${s}`)
  }
  console.log(`TOTAL: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
