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

import { prisma } from '../src/index.js'

async function main() {
  // --- Ingredients ---
  const ingredients = [
    {
      slug: 'elderflower',
      name: 'Fresh Elderflower',
      category: 'herb',
      defaultUnit: 'each',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: [],
      aliases: ['elderflower heads', 'elder blossom'],
      seasonality: ['may', 'june'],
    },
    {
      slug: 'mooli',
      name: 'Mooli',
      category: 'vegetable',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: [],
      aliases: ['daikon', 'white radish', 'Japanese radish', 'Korean radish'],
      seasonality: [],
    },
  ]

  for (const ing of ingredients) {
    const existing = await prisma.ingredient.findUnique({ where: { slug: ing.slug } })
    if (existing) {
      console.log(`SKIP ingredient: ${ing.slug} (already exists)`)
    } else {
      await prisma.ingredient.create({ data: ing })
      console.log(`CREATED ingredient: ${ing.slug}`)
    }
  }

  // --- Tools ---
  const tools = [
    { slug: 'glass-bottle', name: 'Glass Bottle', category: 'jar', aliases: ['cordial bottle', 'swing-top bottle'] },
    { slug: 'glass-jar-500ml', name: 'Glass Jar, 500 ml', category: 'jar', aliases: ['500 ml preserving jar', '500ml jar'] },
    { slug: 'glass-jar-750ml', name: 'Glass Jar, 750 ml', category: 'jar', aliases: ['750 ml preserving jar', '750ml jar'] },
    { slug: 'glass-jar-1l', name: 'Glass Jar, 1 Litre', category: 'jar', aliases: ['1 litre jar', '1l jar', 'large preserving jar'] },
  ]

  for (const tool of tools) {
    const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } })
    if (existing) {
      console.log(`SKIP tool: ${tool.slug} (already exists)`)
    } else {
      await prisma.tool.create({ data: tool })
      console.log(`CREATED tool: ${tool.slug}`)
    }
  }

  await prisma.$disconnect()
  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
