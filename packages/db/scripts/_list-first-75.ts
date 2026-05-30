import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  const { prisma } = await import('../src/index.js')
  const rows = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
    orderBy: { slug: 'asc' },
    take: 80,
  })
  console.log(rows.map((r: { slug: string }) => r.slug).join('\n'))
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
