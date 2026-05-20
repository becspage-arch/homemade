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
      where: {
        category: { slug: 'fibre-arts' },
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        title: true,
        type: true,
        subCategory: { select: { slug: true } },
        difficulty: true,
      },
      orderBy: [
        { subCategory: { slug: 'asc' } },
        { slug: 'asc' },
      ],
    })
    console.log(`Total: ${tutorials.length}`)
    const byCat: Record<string, typeof tutorials> = {}
    for (const t of tutorials) {
      const sc = t.subCategory?.slug ?? 'none'
      if (!byCat[sc]) byCat[sc] = []
      byCat[sc].push(t)
    }
    for (const [sc, items] of Object.entries(byCat)) {
      console.log(`\n--- ${sc} (${items.length}) ---`)
      for (const t of items) {
        console.log(`  [${t.type}] ${t.slug}`)
      }
    }
  } catch (e: any) {
    console.error('ERR:', e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}
main()
