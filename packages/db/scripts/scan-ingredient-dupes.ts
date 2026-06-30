/**
 * READ-ONLY: find duplicate / colliding Ingredient rows.
 *  - exact-name duplicates (same normalised name on 2+ rows)
 *  - name↔alias collisions (a string that is one row's NAME and another's name
 *    or alias) — the ambiguous ones a resolver can't tell apart
 * Reports each group with usage counts so we can pick a canonical row.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { norm } from '../src/recipe-consistency.js'

async function main() {
  const ings = await prisma.ingredient.findMany({
    select: { id: true, slug: true, name: true, pluralName: true, aliases: true, category: true, defaultUnit: true, aisle: true },
  })
  const byId = new Map(ings.map((i) => [i.id, i]))

  // usage counts
  const riCounts = await prisma.recipeIngredient.groupBy({ by: ['ingredientId'], _count: { _all: true } })
  const riMap = new Map(riCounts.map((r) => [r.ingredientId, r._count._all]))
  const uriCounts = await prisma.userRecipeIngredient.groupBy({ by: ['ingredientId'], _count: { _all: true } }).catch(() => [])
  const uriMap = new Map((uriCounts as Array<{ ingredientId: string; _count: { _all: number } }>).map((r) => [r.ingredientId, r._count._all]))
  const use = (id: string) => (riMap.get(id) ?? 0) + (uriMap.get(id) ?? 0)

  // name -> ids (exact name dupes)
  const nameToIds = new Map<string, string[]>()
  for (const i of ings) { const n = norm(i.name); if (!nameToIds.has(n)) nameToIds.set(n, []); nameToIds.get(n)!.push(i.id) }

  // every string (name/plural/alias) -> set of ids that claim it
  const strToIds = new Map<string, Set<string>>()
  for (const i of ings) {
    for (const s of [i.name, i.pluralName ?? '', ...i.aliases]) {
      const n = norm(s); if (!n) continue
      if (!strToIds.has(n)) strToIds.set(n, new Set())
      strToIds.get(n)!.add(i.id)
    }
  }

  const fmt = (id: string) => { const i = byId.get(id)!; return `${i.name} [${i.slug}] use=${use(id)} aliases=${JSON.stringify(i.aliases)}` }

  console.log('=== EXACT-NAME DUPLICATES ===')
  let exact = 0
  for (const [n, ids] of nameToIds) if (ids.length > 1) {
    exact++
    console.log(`\n"${n}":`)
    for (const id of ids.sort((a, b) => use(b) - use(a))) console.log('   ', fmt(id))
  }
  console.log(`\n(${exact} exact-name groups)`)

  console.log('\n=== NAME↔ALIAS / ALIAS↔ALIAS COLLISIONS (string claimed by 2+ rows) ===')
  let coll = 0
  for (const [n, idset] of strToIds) {
    if (idset.size < 2) continue
    if ((nameToIds.get(n)?.length ?? 0) > 1) continue // already shown as exact dupe
    coll++
    console.log(`\n"${n}" claimed by ${idset.size}:`)
    for (const id of [...idset].sort((a, b) => use(b) - use(a))) console.log('   ', fmt(id))
  }
  console.log(`\n(${coll} collision strings)`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
