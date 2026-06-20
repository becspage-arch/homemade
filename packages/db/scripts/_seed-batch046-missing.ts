/**
 * Seed missing ingredients and tools for bulk-046 French cuisine batch.
 * Run once: pnpm --filter "@homemade/db" exec tsx scripts/_seed-batch046-missing.ts
 */
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
      slug: 'veal-shoulder',
      name: 'Veal shoulder',
      category: 'meat',
      defaultUnit: 'g',
      dietaryFlags: [] as string[],
      commonSubstitutes: ['pork-shoulder', 'chicken-thigh'],
      aliases: ['épaule de veau', 'boneless veal shoulder'],
      seasonality: [] as string[],
    },
    {
      slug: 'pearl-onions',
      name: 'Pearl onions',
      category: 'vegetable',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: ['shallot'],
      aliases: ['button onions', 'silverskin onions', 'cocktail onions', 'petits oignons'],
      seasonality: [] as string[],
    },
    {
      slug: 'monkfish',
      name: 'Monkfish',
      category: 'seafood',
      defaultUnit: 'g',
      dietaryFlags: ['glutenFree', 'dairyFree'],
      commonSubstitutes: ['cod-fillet', 'haddock'],
      aliases: ['monkfish tail', 'lotte', 'baudroie', 'angler fish'],
      seasonality: [] as string[],
    },
    {
      slug: 'stock-fish',
      name: 'Fish stock',
      category: 'stock',
      defaultUnit: 'ml',
      dietaryFlags: ['glutenFree', 'dairyFree'],
      commonSubstitutes: ['stock-vegetable'],
      aliases: ['fish broth', 'fumet de poisson', 'court-bouillon'],
      seasonality: [] as string[],
    },
    {
      slug: 'potatoes-floury',
      name: 'Floury potatoes',
      category: 'vegetable',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: ['potato'],
      aliases: ['Maris Piper', 'King Edward', 'Desiree', 'starchy potatoes', 'baking potatoes'],
      seasonality: [] as string[],
    },
    {
      slug: 'new-potatoes',
      name: 'New potatoes',
      category: 'vegetable',
      defaultUnit: 'g',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: ['potato'],
      aliases: ['Charlotte potatoes', 'baby potatoes', 'salad potatoes', 'Jersey Royals', 'waxy potatoes'],
      seasonality: ['may', 'june', 'july', 'august'],
    },
    {
      slug: 'grand-marnier',
      name: 'Grand Marnier',
      category: 'alcohol',
      defaultUnit: 'ml',
      dietaryFlags: ['vegan', 'glutenFree', 'dairyFree'],
      commonSubstitutes: ['cointreau', 'triple-sec'],
      aliases: ['orange liqueur', 'Cordon Rouge'],
      seasonality: [] as string[],
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
    {
      slug: 'gratin-dish',
      name: 'Gratin dish',
      category: 'bakeware',
      aliases: ['gratin tin', 'baking dish', 'oven dish', 'shallow oven dish', 'plat à gratin'],
    },
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
