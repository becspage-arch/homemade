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

const CANDIDATES = [
  // Greek available
  'moussaka', 'keftedes',
  // Spanish available
  'pollo-al-ajillo',
  // Turkish available
  'imam-bayildi', 'kofte-izmir', 'cacik',
  // Levantine available
  'hummus', 'shish-taouk',
  // Moroccan available
  'kefta-tagine', 'tagine-of-lamb-with-prunes-and-almonds',
  'tagine-of-chicken-with-preserved-lemon-and-olives',
  'couscous-with-chicken-and-chickpeas',
  // Eastern European
  'goulash', 'chicken-paprikash', 'pierogi-ruskie', 'borscht',
  'beef-stroganoff', 'bigos', 'pierogi-z-miesem',
  'chicken-kiev',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: CANDIDATES } },
    select: { slug: true, status: true },
  })
  const existingSlugs = new Set(existing.map(t => t.slug))
  console.log('EXISTING (skip):')
  for (const e of existing) console.log(`  ${e.slug} [${e.status}]`)
  console.log('\nAVAILABLE:')
  for (const c of CANDIDATES) {
    if (!existingSlugs.has(c)) console.log(`  ${c}`)
  }
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})
