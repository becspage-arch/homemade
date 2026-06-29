/**
 * Seed / reconcile the dish-type SubCategory shelves for the food categories
 * (phase_dish_type_001). Idempotent — safe to run on every deploy, like
 * seed-collection-vocabulary.ts. Upserts cooking + baking home shelves from
 * prisma/dish-type-vocabulary.ts via ensureDishShelves; never deletes shelves,
 * so the eight pre-existing baking shelves are adopted (updated in place), not
 * recreated. Run locally with .env.credentials; in CI DATABASE_URL is in env.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma, ensureDishShelves, type DishCategory } from '../src'

async function main() {
  const foodCategories: DishCategory[] = ['cooking', 'baking']
  for (const slug of foodCategories) {
    const category = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
    if (!category) {
      console.log(`[dish-type-shelves] category "${slug}" not found — skipping`)
      continue
    }
    const { created, updated } = await ensureDishShelves(category.id, slug)
    console.log(
      `[dish-type-shelves] ${slug}: ${created.length} created, ${updated.length} updated` +
        (created.length ? ` (new: ${created.join(', ')})` : ''),
    )
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('[dish-type-shelves] failed:', e)
  process.exit(1)
})
