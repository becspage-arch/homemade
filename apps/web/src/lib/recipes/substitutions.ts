import 'server-only'
import { prisma } from '@homemade/db'

/**
 * Recipe ingredient substitutions.
 *
 * Reads the `IngredientSubstitution` graph (ratio + context + flavour delta)
 * seeded from the legacy `Ingredient.commonSubstitutes` arrays and enriched by
 * a later worker. This is a FREE-tier surface per the locked
 * translation-is-free principle: a swap suggestion is content-derived, not
 * per-user personalisation, so it never sits behind a premium gate.
 *
 * The render surface (a small "Substitute?" affordance on each ingredient row)
 * calls `getSubstitutions(ingredientId, { context })` and shows the
 * alternatives, mirroring the crochet/knitting yarn-substitution shape.
 */

export interface Substitution {
  /** The alternative ingredient. */
  ingredientId: string
  slug: string
  name: string
  /** Multiply the original quantity by this for the swap (null = 1:1). */
  ratio: number | null
  /** "baking" | "frying" | "any" - null treated as "any". */
  appropriateFor: string | null
  /** One-line note on how the result changes. */
  flavourDelta: string | null
  notes: string | null
}

export type SubstitutionContext = 'baking' | 'frying' | 'any'

/**
 * Return the substitutions registered for an ingredient, most relevant first.
 *
 * When `context` is passed (e.g. the recipe is a bake), substitutions tagged
 * for a different context are filtered out; rows tagged "any" or untagged
 * always qualify. Without a context, everything is returned.
 */
export async function getSubstitutions(
  ingredientId: string,
  opts: { context?: SubstitutionContext } = {},
): Promise<Substitution[]> {
  const rows = await prisma.ingredientSubstitution.findMany({
    where: { mainIngredientId: ingredientId },
    select: {
      ratio: true,
      appropriateFor: true,
      flavourDelta: true,
      notes: true,
      altIngredient: { select: { id: true, slug: true, name: true } },
    },
    orderBy: { altIngredient: { name: 'asc' } },
  })

  const context = opts.context
  return rows
    .filter((row) => {
      if (!context || context === 'any') return true
      const tag = (row.appropriateFor ?? 'any').toLowerCase()
      return tag === 'any' || tag === context
    })
    .map((row) => ({
      ingredientId: row.altIngredient.id,
      slug: row.altIngredient.slug,
      name: row.altIngredient.name,
      ratio: row.ratio ? Number(row.ratio) : null,
      appropriateFor: row.appropriateFor,
      flavourDelta: row.flavourDelta,
      notes: row.notes,
    }))
}

/**
 * Batch variant for a whole recipe: returns a map of ingredientId →
 * substitutions for every ingredient the recipe uses, in one query. The
 * recipe renderer uses this to decide which rows get a "Substitute?"
 * affordance without N round-trips.
 */
export async function getSubstitutionsForIngredients(
  ingredientIds: string[],
  opts: { context?: SubstitutionContext } = {},
): Promise<Map<string, Substitution[]>> {
  const out = new Map<string, Substitution[]>()
  if (ingredientIds.length === 0) return out

  const rows = await prisma.ingredientSubstitution.findMany({
    where: { mainIngredientId: { in: ingredientIds } },
    select: {
      mainIngredientId: true,
      ratio: true,
      appropriateFor: true,
      flavourDelta: true,
      notes: true,
      altIngredient: { select: { id: true, slug: true, name: true } },
    },
    orderBy: { altIngredient: { name: 'asc' } },
  })

  const context = opts.context
  for (const row of rows) {
    if (context && context !== 'any') {
      const tag = (row.appropriateFor ?? 'any').toLowerCase()
      if (tag !== 'any' && tag !== context) continue
    }
    const list = out.get(row.mainIngredientId) ?? []
    list.push({
      ingredientId: row.altIngredient.id,
      slug: row.altIngredient.slug,
      name: row.altIngredient.name,
      ratio: row.ratio ? Number(row.ratio) : null,
      appropriateFor: row.appropriateFor,
      flavourDelta: row.flavourDelta,
      notes: row.notes,
    })
    out.set(row.mainIngredientId, list)
  }
  return out
}
