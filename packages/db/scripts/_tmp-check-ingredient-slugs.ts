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

  const ingredientSlugs = [
    'aubergine', 'prunes', 'almonds', 'honey', 'lamb-shoulder',
    'olives-green', 'coriander-fresh', 'ginger-ground', 'couscous',
    'chickpeas-tinned', 'cottage-cheese', 'sour-cream', 'mushrooms',
    'breadcrumbs', 'vegetable-oil', 'chicken-breast', 'turmeric',
    'coriander-ground', 'plain-flour', 'milk', 'butter', 'parmesan',
    'stock-chicken', 'tinned-tomatoes', 'plain-yoghurt',
  ]

  const ingredients = await prisma.ingredient.findMany({
    where: { slug: { in: ingredientSlugs } },
    select: { slug: true }
  })

  const foundSlugs = new Set(ingredients.map((i: { slug: string }) => i.slug))
  const missing = ingredientSlugs.filter(s => !foundSlugs.has(s))

  console.log('INGREDIENTS found:', [...foundSlugs].sort().join(', '))
  console.log('\nINGREDIENTS missing:', missing.length === 0 ? 'none' : missing.join(', '))

  const toolSlugs = ['rolling-pin', 'saucepan-large', 'baking-dish', 'saucepan-medium', 'whisk']
  const tools = await prisma.tool.findMany({
    where: { slug: { in: toolSlugs } },
    select: { slug: true }
  })
  const foundTools = new Set(tools.map((t: { slug: string }) => t.slug))
  const missingTools = toolSlugs.filter(s => !foundTools.has(s))

  console.log('\nTOOLS found:', [...foundTools].sort().join(', '))
  console.log('TOOLS missing:', missingTools.length === 0 ? 'none' : missingTools.join(', '))

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})
