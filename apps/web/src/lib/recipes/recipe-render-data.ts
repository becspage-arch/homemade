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
