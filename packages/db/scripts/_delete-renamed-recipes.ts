// Throwaway helper: delete the 9 old DB rows for personal recipes that were
// renamed (8) or deleted (1) in the brand-rename pass. Delete after the
// session ships.
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

const OLD_SLUGS = [
  'jennifer-aniston-salad',
  'andy-the-gasman-s-stew',
  'carols-soft-and-chewy-chocolate-chippies',
  'winnie-s-chocolate-chip-cookies',
  'wagamamas-chicken-katsu-curry',
  'nutella-stuffed-cookies',
  'oreo-truffles',
  'biscoff-truffles',
  'boozy-bailey-s-cheesecake',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: OLD_SLUGS } },
    select: { id: true, slug: true, title: true },
  })
  console.log(`Found ${rows.length} old slug rows:`)
  for (const r of rows) console.log(`  ${r.slug}: ${r.title}`)
  if (rows.length === 0) {
    await prisma.$disconnect()
    return
  }
  const ids = rows.map((r) => r.id)
  await prisma.tutorialVersion.deleteMany({ where: { tutorialId: { in: ids } } })
  await prisma.recipeIngredient.deleteMany({ where: { tutorialId: { in: ids } } })
  await prisma.recipeTool.deleteMany({ where: { tutorialId: { in: ids } } })
  await prisma.tutorial.deleteMany({ where: { id: { in: ids } } })
  console.log(`Deleted ${rows.length} old slug rows + their join rows.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
