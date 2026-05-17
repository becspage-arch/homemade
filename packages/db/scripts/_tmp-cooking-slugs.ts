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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'cooking' } },
    select: { slug: true, status: true, cuisine: true, mealType: true },
    orderBy: { slug: 'asc' },
  })
  // Print cuisine breakdown
  const cuisineCounts: Record<string, number> = {}
  for (const t of tutorials) {
    const c = t.cuisine ?? 'unknown'
    cuisineCounts[c] = (cuisineCounts[c] ?? 0) + 1
  }
  console.log('CUISINE BREAKDOWN:')
  for (const [c, n] of Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c}: ${n}`)
  }
  console.log(`\nTOTAL: ${tutorials.length}`)
  console.log('\nSLUGS:')
  for (const t of tutorials) {
    console.log(t.slug)
  }
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})
