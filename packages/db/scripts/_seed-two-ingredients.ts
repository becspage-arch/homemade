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
    { slug: 'chestnut-flour', name: 'Chestnut flour', category: 'flour', defaultUnit: 'g', dietaryFlags: ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree'], commonSubstitutes: [], aliases: ['farina di castagne'], notes: 'Stone-ground dried chestnuts. Naturally sweet and gluten-free. Used in Tuscan castagnaccio. Not interchangeable with wheat flour.', isStaple: false, isAllergen: false, shelfLifeDays: 180, storage: 'cupboard' },
    { slug: 'vanilla-ice-cream', name: 'Vanilla ice cream', category: 'dairy', defaultUnit: 'g', dietaryFlags: ['vegetarian', 'glutenFree', 'nutFree'], commonSubstitutes: [], aliases: [], notes: 'Good-quality full-fat vanilla ice cream. Used in baked Alaska and as a serving accompaniment for tarts and crumbles.', isStaple: false, isAllergen: true, allergenType: 'dairy', shelfLifeDays: 90, storage: 'freezer' },
  ]
  for (const ing of newIngredients) {
    const result = await prisma.ingredient.upsert({ where: { slug: ing.slug }, update: {}, create: ing as any })
    console.log(`[upsert] ${result.slug} — id: ${result.id}`)
  }
  await prisma.$disconnect()
}
main().then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1) })
