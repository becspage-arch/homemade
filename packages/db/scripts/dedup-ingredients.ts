/**
 * Merge duplicate Ingredient rows (slug word-reorders + plurals/spellings,
 * e.g. salt-table/table-salt, shallot/shallots, turmeric/turmeric-ground).
 *
 * For each duplicate group the highest-used row is canonical; the others are
 * merged into it: recipe bodies are repointed (ingredientId + ingredientSlug +
 * name), then RecipeIngredient, IngredientSubstitution, UserRecipeIngredient,
 * and every ingredient's commonSubstitutes slug list. The loser's nutrition /
 * density / aliases backfill the canonical, the loser's slug + name become
 * aliases (so old links / searches still resolve), then the loser is deleted.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/dedup-ingredients.ts            # dry run
 *   pnpm --filter "@homemade/db" exec tsx scripts/dedup-ingredients.ts --apply    # execute
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p }
}
import { prisma, type Prisma } from '../src'

// Slugs that look like duplicates but are genuinely distinct products — never
// merge a group that contains any of these.
const KEEP_DISTINCT = new Set<string>([
  'soy-wax-container', 'soy-wax-pillar',          // container vs pillar blend
  'rice-cakes-cylindrical', 'rice-cake',           // Korean tteok vs rice-cake snack
  'calendula-flowers-dried', 'dried-calendula-flowers', 'calendula-dried', // cosmetic vs herb grade — leave alone
])

function slugKey(slug: string): string {
  return slug.split('-').filter(Boolean).sort().join(' ')
}
function nameKey(name: string): string {
  return name.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter(Boolean).map((w) => (w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : w))
    .sort().join(' ')
}

type Node = { type?: string; attrs?: Record<string, unknown>; content?: Node[] }

/** Repoint every ingredientsList item that references oldId to the canonical
 *  id/slug/name. Returns the number of items changed. */
function rewriteBody(body: Node, oldId: string, c: { id: string; slug: string; name: string }): number {
  let changed = 0
  const walk = (n: Node): void => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ingredientsList' && n.attrs && Array.isArray(n.attrs.items)) {
      for (const raw of n.attrs.items as Array<Record<string, unknown>>) {
        if (raw && raw.ingredientId === oldId) {
          raw.ingredientId = c.id
          raw.ingredientSlug = c.slug
          raw.name = c.name
          changed += 1
        }
      }
    }
    if (Array.isArray(n.content)) for (const ch of n.content) walk(ch)
  }
  walk(body)
  return changed
}

async function main() {
  const apply = process.argv.includes('--apply')
  const ings = await prisma.ingredient.findMany({
    select: { id: true, slug: true, name: true, aliases: true, commonSubstitutes: true,
      nutritionalInfoPer100g: true, densityGPerMl: true,
      _count: { select: { recipeIngredients: true } } },
  })
  const byId = new Map(ings.map((i) => [i.id, i]))

  // Union-find to merge groups that overlap across slugKey / nameKey.
  const parent = new Map<string, string>(ings.map((i) => [i.id, i.id]))
  const find = (x: string): string => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x)!)!); x = parent.get(x)! } return x }
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb) }
  const linkBy = (keyFn: (i: (typeof ings)[number]) => string) => {
    const m = new Map<string, string[]>()
    for (const i of ings) { const k = keyFn(i); (m.get(k) ?? m.set(k, []).get(k)!).push(i.id) }
    for (const ids of m.values()) for (let j = 1; j < ids.length; j++) union(ids[0]!, ids[j]!)
  }
  linkBy((i) => slugKey(i.slug))
  linkBy((i) => nameKey(i.name))

  const comps = new Map<string, string[]>()
  for (const i of ings) { const r = find(i.id); (comps.get(r) ?? comps.set(r, []).get(r)!).push(i.id) }

  const plan: { canonical: (typeof ings)[number]; losers: (typeof ings)[number][] }[] = []
  for (const ids of comps.values()) {
    if (ids.length < 2) continue
    const rows = ids.map((id) => byId.get(id)!)
    if (rows.some((r) => KEEP_DISTINCT.has(r.slug))) continue
    rows.sort((a, b) => b._count.recipeIngredients - a._count.recipeIngredients || a.slug.length - b.slug.length)
    plan.push({ canonical: rows[0]!, losers: rows.slice(1) })
  }

  console.log(`${apply ? 'APPLY' : 'DRY RUN'} — ${plan.length} merge groups, ${plan.reduce((n, g) => n + g.losers.length, 0)} rows to remove\n`)

  let bodiesTouched = 0, riMoved = 0, subsMoved = 0, subsDropped = 0, userMoved = 0, substListFixed = 0

  for (const g of plan) {
    const c = g.canonical
    console.log(`${c.slug}  ◀  ${g.losers.map((l) => l.slug).join(', ')}`)
    for (const l of g.losers) {
      // 1. Recipe bodies referencing the loser id (rewrite in memory now;
      //    persisted inside the transaction below so the merge is atomic).
      const affected = await prisma.$queryRaw<{ id: string; body: unknown }[]>`
        SELECT id, body FROM "Tutorial" WHERE body::text LIKE ${'%' + l.id + '%'}`
      const bodyUpdates: { id: string; body: Node }[] = []
      for (const t of affected) {
        const body = t.body as Node
        if (rewriteBody(body, l.id, c) > 0) { bodiesTouched += 1; bodyUpdates.push({ id: t.id, body }) }
      }

      // 2. RecipeIngredient + UserRecipeIngredient repoint (no unique key).
      const ri = await prisma.recipeIngredient.count({ where: { ingredientId: l.id } })
      riMoved += ri
      const uri = await prisma.userRecipeIngredient.count({ where: { ingredientId: l.id } })
      userMoved += uri

      // 3. Substitutions: repoint, dropping self-refs + collisions.
      const subs = await prisma.ingredientSubstitution.findMany({
        where: { OR: [{ mainIngredientId: l.id }, { altIngredientId: l.id }] },
      })

      // 4. commonSubstitutes slug arrays mentioning the loser slug.
      const substRefs = await prisma.ingredient.findMany({
        where: { commonSubstitutes: { has: l.slug } }, select: { id: true, commonSubstitutes: true },
      })
      substListFixed += substRefs.length

      if (apply) {
        await prisma.$transaction(async (tx) => {
          for (const u of bodyUpdates) await tx.tutorial.update({ where: { id: u.id }, data: { body: u.body as Prisma.InputJsonValue } })
          await tx.recipeIngredient.updateMany({ where: { ingredientId: l.id }, data: { ingredientId: c.id } })
          await tx.userRecipeIngredient.updateMany({ where: { ingredientId: l.id }, data: { ingredientId: c.id } })

          for (const s of subs) {
            const main = s.mainIngredientId === l.id ? c.id : s.mainIngredientId
            const alt = s.altIngredientId === l.id ? c.id : s.altIngredientId
            if (main === alt) { await tx.ingredientSubstitution.delete({ where: { id: s.id } }); subsDropped += 1; continue }
            const clash = await tx.ingredientSubstitution.findUnique({ where: { mainIngredientId_altIngredientId: { mainIngredientId: main, altIngredientId: alt } } })
            if (clash && clash.id !== s.id) { await tx.ingredientSubstitution.delete({ where: { id: s.id } }); subsDropped += 1 }
            else { await tx.ingredientSubstitution.update({ where: { id: s.id }, data: { mainIngredientId: main, altIngredientId: alt } }); subsMoved += 1 }
          }

          for (const r of substRefs) {
            const next = Array.from(new Set(r.commonSubstitutes.map((x) => (x === l.slug ? c.slug : x)))).filter((x) => x !== c.slug || r.id !== c.id)
            await tx.ingredient.update({ where: { id: r.id }, data: { commonSubstitutes: next } })
          }

          // 5. Backfill canonical from loser; loser slug + name become aliases.
          const data: Prisma.IngredientUpdateInput = {}
          if (c.nutritionalInfoPer100g == null && l.nutritionalInfoPer100g != null) data.nutritionalInfoPer100g = l.nutritionalInfoPer100g as Prisma.InputJsonValue
          if (c.densityGPerMl == null && l.densityGPerMl != null) data.densityGPerMl = l.densityGPerMl
          const aliases = Array.from(new Set([...c.aliases, l.slug, l.name, ...l.aliases]))
          data.aliases = aliases
          await tx.ingredient.update({ where: { id: c.id }, data })

          // 6. Delete the loser.
          await tx.ingredient.delete({ where: { id: l.id } })
        })
      } else {
        subsMoved += subs.filter((s) => (s.mainIngredientId === l.id ? c.id : s.mainIngredientId) !== (s.altIngredientId === l.id ? c.id : s.altIngredientId)).length
      }
    }
  }

  console.log(`\nbodies repointed: ${bodiesTouched}`)
  console.log(`RecipeIngredient rows repointed: ${riMoved}`)
  console.log(`UserRecipeIngredient rows repointed: ${userMoved}`)
  console.log(`substitutions repointed: ${subsMoved}, dropped (self/collision): ${subsDropped}`)
  console.log(`commonSubstitutes lists fixed: ${substListFixed}`)
  if (!apply) console.log('\n(dry run — nothing written. Re-run with --apply.)')
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
