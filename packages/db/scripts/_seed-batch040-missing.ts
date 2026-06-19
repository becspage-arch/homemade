import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadCredentials() {
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); return }
    const parent = resolve(dir, '..')
    if (parent === dir) return
    dir = parent
  }
}
loadCredentials()

async function main() {
  const { prisma } = await import('../src/index.js')
  const newIngredients = [
    {
      slug: 'pizza-dough-ball',
      name: 'Pizza dough ball',
      pluralName: 'pizza dough balls',
      category: 'baking',
      defaultUnit: 'each',
      dietaryFlags: ['vegan', 'vegetarian', 'dairyFree', 'nutFree'],
      commonSubstitutes: [],
      aliases: ['pizza dough', 'dough ball'],
      notes: 'A single portion of leavened pizza dough, typically 250–280 g, ready to stretch and top. Use the 24h cold-fermented pizza dough recipe or a good-quality bought dough.',
      isStaple: false,
      isAllergen: true,
      allergenType: 'gluten',
      shelfLifeDays: 3,
      storage: 'fridge',
    },
  ]
  for (const ing of newIngredients) {
    const result = await prisma.ingredient.upsert({ where: { slug: ing.slug }, update: {}, create: ing as any })
    console.log(`[upsert] ${result.slug} — id: ${result.id}`)
  }
  await prisma.$disconnect()
}
main().then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1) })
