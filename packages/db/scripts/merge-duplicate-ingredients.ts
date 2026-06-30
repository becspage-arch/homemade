/**
 * Merge true-duplicate Ingredient rows (pure synonyms) into a canonical row and
 * repoint every reference: recipe body ingredientsList items, RecipeIngredient
 * (via re-sync), IngredientSubstitution (main/alt, honouring the unique
 * constraint), and Ingredient.commonSubstitutes slug arrays. The canonical row
 * absorbs the merged row's name + aliases, then the duplicate is deleted.
 *
 * Only PURE-SYNONYM duplicates are listed here (same ingredient, different
 * name/spelling/form-word). Legitimately-distinct ingredients with overlapping
 * aliases are NOT merged — those are surfaced for a human decision.
 *
 * Dry-run by default; pass --apply to write.
 *   pnpm --filter @homemade/db exec tsx scripts/merge-duplicate-ingredients.ts
 *   pnpm --filter @homemade/db exec tsx scripts/merge-duplicate-ingredients.ts --apply
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { resyncRecipeIngredients } from './lib/resync-recipe-ingredients.js'

const APPLY = process.argv.includes('--apply')

// from-slug → to-slug (canonical, kept). Each pair is the SAME ingredient.
const MERGES: Array<[string, string]> = [
  ['dried-calendula-flowers', 'calendula-dried'],   // exact-name duplicate
  ['rosewater', 'rose-water'],
  ['turmeric-powder', 'turmeric'],                  // → Ground turmeric
  ['cayenne-powder', 'cayenne-pepper'],
  ['tapioca-starch', 'tapioca-flour'],
  ['vanilla-paste', 'vanilla-bean-paste'],
  ['cardamom-pods', 'cardamom-green'],              // → Green cardamom
  ['ginger-root', 'ginger-fresh'],                  // both = Fresh ginger
  ['mooli', 'radish-korean'],                       // → Korean radish
  ['salt-flakes', 'sea-salt-flakes'],               // both = flaky Maldon sea salt
]

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[] }
function repointBody(body: N, fromId: string, to: { id: string; slug: string; name: string }): boolean {
  let changed = false
  const walk = (n?: N) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ingredientsList' && Array.isArray(n.attrs?.items)) {
      for (const raw of n.attrs!.items as Array<Record<string, unknown>>) {
        if (raw && raw.ingredientId === fromId) {
          raw.ingredientId = to.id; raw.ingredientSlug = to.slug; raw.name = to.name; changed = true
        }
      }
    }
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(body)
  return changed
}

async function main() {
  // Resolve all slugs to rows up front.
  const slugs = [...new Set(MERGES.flat())]
  const rows = await prisma.ingredient.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, name: true, pluralName: true, aliases: true },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  for (const [f, t] of MERGES) { if (!bySlug.get(f)) console.log(`! missing from-slug ${f}`); if (!bySlug.get(t)) console.log(`! missing to-slug ${t}`) }

  // All RECIPE tutorials (any status) for body repointing.
  const tutorials = await prisma.tutorial.findMany({ where: { type: 'RECIPE' }, select: { id: true, slug: true, body: true } })

  for (const [fromSlug, toSlug] of MERGES) {
    const from = bySlug.get(fromSlug), to = bySlug.get(toSlug)
    if (!from || !to) continue
    console.log(`\n=== ${from.name} [${fromSlug}] → ${to.name} [${toSlug}] ===`)

    // 1. recipe bodies
    const affected: Array<{ id: string; slug: string; body: N }> = []
    for (const tut of tutorials) {
      const body = tut.body as unknown as N
      if (repointBody(body, from.id, to)) affected.push({ id: tut.id, slug: tut.slug, body })
    }
    console.log(`  bodies referencing it: ${affected.length}${affected.length ? ' (' + affected.slice(0, 6).map((a) => a.slug).join(', ') + (affected.length > 6 ? ', …' : '') + ')' : ''}`)

    // 2. substitutions
    const subsFrom = await prisma.ingredientSubstitution.findMany({ where: { OR: [{ mainIngredientId: from.id }, { altIngredientId: from.id }] }, select: { id: true, mainIngredientId: true, altIngredientId: true } })
    // 3. commonSubstitutes slug arrays
    const subsSlugRows = await prisma.ingredient.findMany({ where: { commonSubstitutes: { has: from.slug } }, select: { id: true, commonSubstitutes: true } })
    console.log(`  substitution rows: ${subsFrom.length}, commonSubstitutes arrays: ${subsSlugRows.length}`)

    if (!APPLY) continue

    // Apply body updates + resync.
    for (const a of affected) {
      await prisma.tutorial.update({ where: { id: a.id }, data: { body: a.body as unknown as object } })
      await resyncRecipeIngredients(prisma, a.id, a.body)
    }
    // Repoint any stray RecipeIngredient rows (defensive) then there should be none.
    await prisma.recipeIngredient.deleteMany({ where: { ingredientId: from.id } })

    // Substitutions: repoint honouring @@unique([main, alt]); drop self/dupes.
    const existing = new Set((await prisma.ingredientSubstitution.findMany({ select: { mainIngredientId: true, altIngredientId: true } })).map((s) => `${s.mainIngredientId}|${s.altIngredientId}`))
    for (const s of subsFrom) {
      const newMain = s.mainIngredientId === from.id ? to.id : s.mainIngredientId
      const newAlt = s.altIngredientId === from.id ? to.id : s.altIngredientId
      const key = `${newMain}|${newAlt}`
      if (newMain === newAlt || existing.has(key)) {
        await prisma.ingredientSubstitution.delete({ where: { id: s.id } })
      } else {
        await prisma.ingredientSubstitution.update({ where: { id: s.id }, data: { mainIngredientId: newMain, altIngredientId: newAlt } })
        existing.add(key)
      }
    }

    // commonSubstitutes slug arrays: replace from-slug with to-slug, dedupe.
    for (const r of subsSlugRows) {
      const next = [...new Set(r.commonSubstitutes.map((s) => (s === from.slug ? to.slug : s)))]
      await prisma.ingredient.update({ where: { id: r.id }, data: { commonSubstitutes: next } })
    }

    // Canonical absorbs the merged row's name + aliases.
    const mergedAliases = [...new Set([...to.aliases, from.name, from.pluralName ?? '', ...from.aliases].map((s) => s.trim()).filter(Boolean).filter((s) => s.toLowerCase() !== to.name.toLowerCase()))]
    await prisma.ingredient.update({ where: { id: to.id }, data: { aliases: mergedAliases } })

    // Delete the duplicate.
    await prisma.ingredient.delete({ where: { id: from.id } })
    console.log(`  ✓ merged + deleted ${fromSlug}`)
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'} — ${MERGES.length} merges`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
