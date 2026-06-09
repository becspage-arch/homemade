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
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'home-repair' } },
    select: { slug: true, status: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  for (const t of tutorials) {
    console.log(`${t.status}\t${t.subCategory?.slug ?? 'no-sub'}\t${t.slug}`)
  }
  console.log(`---TOTAL: ${tutorials.length}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
