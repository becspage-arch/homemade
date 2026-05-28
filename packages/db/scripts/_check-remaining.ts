import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, type: true, category: { select: { slug: true } } },
  })
  const byCat: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const c of candidates) {
    const cat = c.category?.slug ?? 'unknown'
    byCat[cat] = (byCat[cat] ?? 0) + 1
    byType[c.type] = (byType[c.type] ?? 0) + 1
  }
  console.log('Remaining by category:', byCat)
  console.log('Remaining by type:', byType)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
