/**
 * One-off: add the missing "Raisins" line to rum-and-raisin-ice-cream.
 *
 * The method soaks and folds in 120g raisins but the ingredientsList omits
 * them. Edit the body's ingredientsList block (the editorial source of truth),
 * then re-derive the RecipeIngredient join rows exactly as the admin editor's
 * save path does (syncRecipeIngredientsFromBody).
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}
import { prisma } from '../src'
import { resyncRecipeIngredients } from './lib/resync-recipe-ingredients.js'

const SLUG = 'rum-and-raisin-ice-cream'
const RAISINS_ID = 'cmp49f7350079rkv4b169am61'
const RAISINS_SLUG = 'raisins'

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[] }

async function main() {
  const t = await prisma.tutorial.findUnique({ where: { slug: SLUG } })
  if (!t) throw new Error('recipe not found')
  const body = t.body as unknown as N

  // Find the ingredientsList block.
  let block: N | null = null
  const walk = (n: N | undefined) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ingredientsList') block = n
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(body)
  if (!block) throw new Error('no ingredientsList block')
  const b = block as N
  const items = (Array.isArray(b.attrs?.items) ? b.attrs!.items : []) as Array<Record<string, unknown>>

  if (items.some((i) => i.ingredientId === RAISINS_ID)) {
    console.log('Raisins already present — nothing to do.')
    return
  }

  const raisins = {
    name: 'Raisins',
    unit: 'g',
    amount: 120,
    prepNote: 'soaked in the dark rum, then drained (see method)',
    groupLabel: 'Rum raisins',
    isOptional: false,
    ingredientId: RAISINS_ID,
    ingredientSlug: RAISINS_SLUG,
  }
  // Insert at the top of the "Rum raisins" group (before the dark rum).
  const idx = items.findIndex((i) => i.groupLabel === 'Rum raisins')
  if (idx >= 0) items.splice(idx, 0, raisins)
  else items.unshift(raisins)
  b.attrs!.items = items

  console.log('BEFORE: 6 listed ingredients, raisins absent.')
  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body: body as unknown as object },
  })
  const n = await resyncRecipeIngredients(prisma, t.id, body)
  console.log(`AFTER: raisins added (120 g, group "Rum raisins"). RecipeIngredient rows re-synced: ${n}.`)
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
