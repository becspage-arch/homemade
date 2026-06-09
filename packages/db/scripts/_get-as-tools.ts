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
  const tools = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'bee' } },
      { slug: { contains: 'hive' } },
      { slug: { contains: 'sheep' } },
      { slug: { contains: 'pig' } },
      { slug: { contains: 'rabbit' } },
      { slug: { contains: 'chicken' } },
      { slug: { contains: 'poultry' } },
      { slug: { contains: 'livestock' } },
      { slug: { contains: 'fence' } },
      { slug: { contains: 'smoker' } },
      { slug: { contains: 'coop' } },
    ]},
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  tools.forEach(t => console.log(`${t.slug}: ${t.name}`))
  console.log('Count:', tools.length)
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
