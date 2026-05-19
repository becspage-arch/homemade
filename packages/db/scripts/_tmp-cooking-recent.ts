import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const total = await prisma.tutorial.count({
      where: { categoryId: 'cmp1gjrmd0000xkv4ac12gorm', status: 'PUBLISHED' },
    })
    console.log('TOTAL_PUBLISHED:' + total)
    const recent = await prisma.tutorial.findMany({
      where: { categoryId: 'cmp1gjrmd0000xkv4ac12gorm', status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: { slug: true, title: true, publishedAt: true },
    })
    console.log('RECENT:' + JSON.stringify(recent))
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.log('ERROR:' + e); process.exit(1) })
