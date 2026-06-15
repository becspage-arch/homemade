import 'server-only'
import { prisma } from '@homemade/db'
import { extractRecipeIngredients } from '@/lib/recipe-ingredients-sync'
import {
  getSubstitutionsForIngredients,
  type Substitution,
  type SubstitutionContext,
} from './substitutions'

export interface IngredientRenderMeta {
  /** g/ml, used by the render helper to convert grams to cups. Null = no bridge. */
  densityGPerMl: number | null
  substitutions: Substitution[]
}

/**
 * Does this body carry a structured `ingredientsList` block at all?
 *
 * Used by the tutorial page to decide whether to render the recipe ingredients
 * chrome (units, substitutions, shopping) for a tutorial whose `type` is not
 * RECIPE / REMEDY. Most baking techniques are TECHNIQUE-typed but a handful
 * carry an ingredients block (a starter feed, a sugar syrup, an egg wash); this
 * lets those render their ingredients like a recipe instead of dropping them.
 */
export function bodyHasIngredientsList(body: unknown): boolean {
  let found = false
  function walk(node: unknown): void {
    if (found || !node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (obj.type === 'ingredientsList') {
      found = true
      return
    }
    if (Array.isArray(obj.content)) for (const child of obj.content) walk(child)
  }
  walk(body)
  return found
}

/**
 * Build the per-ingredient render data a recipe page needs: density (for
 * grams to cups conversion) and the free-tier substitution list, keyed by
 * ingredientId. Reads the ingredient ids straight off the body's
 * `ingredientsList` block so it covers exactly the rows the reader sees.
 *
 * Returns an empty map for a body with no linked ingredients (a technique
 * page, or a recipe whose rows were never linked to the master table).
 */
export async function getRecipeIngredientRenderMeta(
  body: unknown,
  opts: { context?: SubstitutionContext } = {},
): Promise<Map<string, IngredientRenderMeta>> {
  const out = new Map<string, IngredientRenderMeta>()

  const ids = Array.from(
    new Set(extractRecipeIngredients(body).map((r) => r.ingredientId)),
  ).filter(Boolean)
  if (ids.length === 0) return out

  const [rows, subs] = await Promise.all([
    prisma.ingredient.findMany({
      where: { id: { in: ids } },
      select: { id: true, densityGPerMl: true },
    }),
    getSubstitutionsForIngredients(ids, opts),
  ])

  const densityById = new Map(
    rows.map((r) => [r.id, r.densityGPerMl !== null ? Number(r.densityGPerMl) : null]),
  )

  for (const id of ids) {
    out.set(id, {
      densityGPerMl: densityById.get(id) ?? null,
      substitutions: subs.get(id) ?? [],
    })
  }
  return out
}
