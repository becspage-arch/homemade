/**
 * Script-side mirror of `apps/web/src/lib/recipe-ingredients-sync.ts`
 * `syncRecipeIngredientsFromBody`. That module is `server-only` (it is bound to
 * the Next server runtime), so a tsx CLI script can't import it. The logic is
 * tiny and stable — walk every `ingredientsList` block, flatten its items to
 * RecipeIngredient rows, and delete-then-insert inside a transaction. Rows that
 * reference an unknown Ingredient id are dropped (FK-restrict would fail); the
 * body block stays the editorial source of truth either way.
 *
 * Keep this in step with the app-side function if its shape ever changes.
 */
import type { PrismaClient } from '../../src/index.js'

interface ParsedRow {
  ingredientId: string
  amount: number | null
  unit: string | null
  prepNote: string | null
  isOptional: boolean
  groupLabel: string | null
  position: number
}

export function extractRecipeIngredients(body: unknown): ParsedRow[] {
  const out: ParsedRow[] = []
  let position = 0
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (obj.type === 'ingredientsList' && obj.attrs && typeof obj.attrs === 'object') {
      const attrs = obj.attrs as Record<string, unknown>
      const items = Array.isArray(attrs.items) ? attrs.items : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const row = raw as Record<string, unknown>
        const ingredientId = typeof row.ingredientId === 'string' ? row.ingredientId.trim() : ''
        if (!ingredientId) continue
        const amount = typeof row.amount === 'number' ? row.amount : null
        const unit = typeof row.unit === 'string' && row.unit.trim() ? row.unit.trim() : null
        const prepNote =
          typeof row.prepNote === 'string' && row.prepNote.trim() ? row.prepNote.trim() : null
        const isOptional = row.isOptional === true
        const groupLabel =
          typeof row.groupLabel === 'string' && row.groupLabel.trim() ? row.groupLabel.trim() : null
        out.push({ ingredientId, amount, unit, prepNote, isOptional, groupLabel, position })
        position += 1
      }
    }
    if (Array.isArray(obj.content)) for (const child of obj.content) walk(child)
  }
  walk(body)
  return out
}

/** Returns the number of RecipeIngredient rows written. */
export async function resyncRecipeIngredients(
  prisma: PrismaClient,
  tutorialId: string,
  body: unknown,
): Promise<number> {
  const parsed = extractRecipeIngredients(body)
  if (parsed.length === 0) {
    await prisma.recipeIngredient.deleteMany({ where: { tutorialId } })
    return 0
  }
  const known = await prisma.ingredient.findMany({
    where: { id: { in: parsed.map((p) => p.ingredientId) } },
    select: { id: true },
  })
  const knownSet = new Set(known.map((row: { id: string }) => row.id))
  const filtered = parsed.filter((p) => knownSet.has(p.ingredientId))
  await prisma.$transaction(async (tx: PrismaClient) => {
    await tx.recipeIngredient.deleteMany({ where: { tutorialId } })
    if (filtered.length > 0) {
      await tx.recipeIngredient.createMany({
        data: filtered.map((p) => ({
          tutorialId,
          ingredientId: p.ingredientId,
          amount: p.amount,
          unit: p.unit,
          prepNote: p.prepNote,
          isOptional: p.isOptional,
          groupLabel: p.groupLabel,
          position: p.position,
        })),
      })
    }
  })
  return filtered.length
}
