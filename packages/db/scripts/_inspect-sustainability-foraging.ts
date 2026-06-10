import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const sus = await prisma.category.findUnique({
    where: { slug: 'sustainability' },
    select: { id: true },
  })
  if (!sus) {
    console.log('sustainability category missing')
    process.exit(2)
  }

  const subs = await prisma.subCategory.findMany({
    where: { categoryId: sus.id },
    orderBy: { order: 'asc' },
    select: { slug: true, autopilotEnabled: true, order: true, description: true },
  })

  console.log(`Sustainability sub-cats (${subs.length}):`)
  for (const s of subs) {
    console.log(`  ${s.slug.padEnd(36)} order=${String(s.order).padStart(3)} autopilot=${s.autopilotEnabled}`)
    if (s.slug === 'foraging') {
      console.log(`    description: ${s.description}`)
    }
  }

  // Also check garden/foraging is deprecated
  const garden = await prisma.category.findUnique({
    where: { slug: 'garden' },
    select: { id: true },
  })
  if (garden) {
    const gf = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: garden.id, slug: 'foraging' } },
      select: { autopilotEnabled: true, description: true },
    })
    if (gf) {
      console.log(`\ngarden/foraging autopilot=${gf.autopilotEnabled}`)
      console.log(`  description: ${gf.description}`)
    }
  }

  // Kingdom sanity
  const kingdomCounts = await prisma.species.groupBy({
    by: ['kingdom'],
    _count: { kingdom: true },
  })
  console.log(`\nSpecies row count by kingdom:`)
  for (const k of kingdomCounts) {
    console.log(`  ${k.kingdom}: ${k._count.kingdom}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
