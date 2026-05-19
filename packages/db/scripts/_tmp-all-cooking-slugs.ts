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
    const tutorials = await prisma.tutorial.findMany({
      where: { categoryId: 'cmp1gjrmd0000xkv4ac12gorm' },
      select: { slug: true, status: true },
      orderBy: { slug: 'asc' },
    })
    console.log('COUNT:' + tutorials.length)
    // Write slugs as newline-separated list
    const slugs = tutorials.map(t => t.slug).join('\n')
    process.stdout.write('SLUGS_START\n' + slugs + '\nSLUGS_END\n')
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.log('ERROR:' + e); process.exit(1) })
