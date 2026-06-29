/**
 * Prisma-backed recipe consistency gate.
 *
 * Wraps the pure `findMethodIngredientGaps` with a master-vocab resolver loaded
 * from the Ingredient table, so coverage is checked by ingredient id (synonyms
 * like "levain" ↔ a listed "Sourdough starter" count as covered). This is the
 * function the publish paths call to BLOCK a recipe whose method uses a measured
 * ingredient the list omits — the permanent guard against the ingredient ↔
 * method drift the bulk-authoring sweep had to clean up. Binary, no warning
 * tier: a non-empty result means "hold at DRAFT".
 */
import { prisma } from './index'
import {
  buildIngredientResolver,
  findMethodIngredientGaps,
  type ConsistencyFinding,
} from './recipe-consistency'

let resolverPromise: Promise<(phrase: string) => string | null> | null = null

/** The resolver is built once from the Ingredient table and reused. A new
 *  ingredient added after first build is simply unresolved until restart, which
 *  only makes the gate MORE lenient (it never blocks on an unknown phrase). */
async function getResolver(): Promise<(phrase: string) => string | null> {
  if (!resolverPromise) {
    resolverPromise = prisma.ingredient
      .findMany({ select: { id: true, name: true, pluralName: true, aliases: true } })
      .then((rows) => buildIngredientResolver(rows))
  }
  return resolverPromise
}

/** Reset the cached resolver (tests / scripts that mutate the Ingredient table). */
export function resetIngredientResolver(): void {
  resolverPromise = null
}

/**
 * The measured ingredients a recipe's steps use that no listed line covers.
 * Empty = consistent (passes the gate).
 */
export async function findRecipeMethodGaps(body: unknown): Promise<ConsistencyFinding[]> {
  const resolveIngredientId = await getResolver()
  return findMethodIngredientGaps(body, { resolveIngredientId })
}

/** One-line, human-readable reason a recipe fails the consistency gate, or null
 *  when it passes. Mirrors the message shape of the other publish-gate checks. */
export async function recipeMethodConsistencyFailure(body: unknown): Promise<string | null> {
  const gaps = await findRecipeMethodGaps(body)
  if (gaps.length === 0) return null
  const list = gaps.map((g) => g.text).join('; ')
  return (
    `the method uses ${gaps.length} measured ingredient${gaps.length === 1 ? '' : 's'} ` +
    `the list omits (${list}). Add ${gaps.length === 1 ? 'it' : 'them'} to the structured ` +
    `ingredients block, or correct the method`
  )
}
