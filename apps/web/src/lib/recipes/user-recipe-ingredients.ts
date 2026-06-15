import 'server-only'
import { prisma } from '@homemade/db'

/**
 * One structured ingredient row as the creator recipe form submits it. Mirrors
 * the shape of `UserRecipeIngredient` minus the bookkeeping columns. Rows
 * without a linked `ingredientId` are free-text the Maker has not matched to
 * the master table yet; they are dropped from the join rows (so shopping list /
 * meal plan aggregation stays clean) but the form keeps them in its own state.
 */
export interface UserRecipeIngredientInput {
  ingredientId: string
  quantity: number | null
  unit: string | null
  notes: string | null
  isOptional: boolean
}

/**
 * Resync the `UserRecipeIngredient` join rows for a user recipe from the
 * structured picker contents. Delete-then-insert in a transaction, the same
 * strategy `syncRecipeIngredientsFromBody` uses for library recipes: a recipe
 * is at most a few dozen rows, and a diff would have to handle re-ordering
 * anyway. Filters to ingredient ids that exist in the master table so the
 * Restrict foreign key never trips.
 */
export async function syncUserRecipeIngredients(
  recipeId: string,
  items: UserRecipeIngredientInput[],
): Promise<void> {
  const linked = items.filter((it) => it.ingredientId && it.ingredientId.trim())

  if (linked.length === 0) {
    await prisma.userRecipeIngredient.deleteMany({ where: { recipeId } })
    return
  }

  const known = await prisma.ingredient.findMany({
    where: { id: { in: linked.map((it) => it.ingredientId) } },
    select: { id: true },
  })
  const knownSet = new Set(known.map((row) => row.id))
  const filtered = linked.filter((it) => knownSet.has(it.ingredientId))

  await prisma.$transaction(async (tx) => {
    await tx.userRecipeIngredient.deleteMany({ where: { recipeId } })
    if (filtered.length > 0) {
      await tx.userRecipeIngredient.createMany({
        data: filtered.map((it, index) => ({
          recipeId,
          ingredientId: it.ingredientId,
          quantity: it.quantity,
          unit: it.unit && it.unit.trim() ? it.unit.trim() : null,
          notes: it.notes && it.notes.trim() ? it.notes.trim() : null,
          isOptional: it.isOptional === true,
          order: index,
        })),
      })
    }
  })
}
