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

  // Search for similar slugs for the missing ones
  const searches = ['coriander', 'sour', 'mushroom', 'breadcrumb', 'milk', 'butter', 'baking', 'whisk']

  for (const term of searches) {
    const ingredients = await prisma.ingredient.findMany({
      where: { slug: { contains: term } },
      select: { slug: true, name: true }
    })
    if (ingredients.length > 0) {
      console.log(`\nIngredient "${term}":`, ingredients.map((i: { slug: string; name: string }) => `${i.slug} (${i.name})`).join(', '))
    } else {
      console.log(`\nIngredient "${term}": NOT FOUND`)
    }

    const tools = await prisma.tool.findMany({
      where: { slug: { contains: term } },
      select: { slug: true, name: true }
    })
    if (tools.length > 0) {
      console.log(`Tool "${term}":`, tools.map((t: { slug: string; name: string }) => `${t.slug} (${t.name})`).join(', '))
    }
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})
