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
  const rows = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'crochet' },
      subCategory: { slug: 'motifs' },
    },
    select: { slug: true, title: true, type: true, status: true, publishedAt: true, heroMediaId: true },
    orderBy: { publishedAt: 'desc' },
  })
  console.log(`\nTotal crochet/motifs tutorials in DB: ${rows.length}\n`)
  const byStatus = rows.reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})
  console.log('By status:', byStatus)
  console.log('heroMediaId null:', rows.filter(r => !r.heroMediaId).length)
  console.log(`\nAll rows:`)
  for (const r of rows) {
    console.log(`  - ${r.slug.padEnd(52)} ${r.type.padEnd(8)} ${r.status}  hero=${r.heroMediaId ?? 'null'}`)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
