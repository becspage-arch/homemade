import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
  const { prisma: db } = await import('../src/index.js')
  const cats = await db.subCategory.findMany({
    where: { category: { slug: 'wood-natural-craft' } },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  console.log(JSON.stringify(cats, null, 2))
  await db.$disconnect()
}

main().catch(console.error)
