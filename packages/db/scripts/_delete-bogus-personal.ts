// Throwaway helper: delete the 6 bogus DB rows created from parser noise
// (Makes: 12 / 24 / 48-style headers and "Pinch salt" fragments). Delete this
// script after the session ships.
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

const BOGUS_SLUGS = [
  'makes-12-24-48',
  'makes-12-or-48',
  'makes-6-12-24',
  'makes-6-12-48',
  'makes-8-16-32',
  'pinch-salt',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: BOGUS_SLUGS } },
    select: { id: true, slug: true, title: true },
  })
  console.log(`Found ${rows.length} bogus rows:`)
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
  console.log('Deleted.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
