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
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'cooking' },
      status: 'PUBLISHED',
      recipe: { mealType: 'dessert' }
    },
    select: { slug: true, title: true },
    orderBy: { slug: 'asc' }
  })
  console.log(`Published cooking desserts: ${tutorials.length}`)
  for (const t of tutorials) {
    console.log(`  ${t.slug}`)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
