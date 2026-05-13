import 'server-only'
import { prisma, type Prisma } from '@homemade/db'

interface ParsedRow {
  ingredientId: string
  amount: number | null
  unit: string | null
  prepNote: string | null
  isOptional: boolean
  groupLabel: string | null
  position: number
}

/**
 * Walk a TipTap body looking for every `ingredientsList` block and flatten
 * its `items` into rows ready for the `RecipeIngredient` table. Rows
 * without a valid `ingredientId` are skipped — those are free-text rows
 * the author hasn't linked to the master table yet (saved in the body
 * JSON, but not eligible for filter / search).
 */
export function extractRecipeIngredients(body: unknown): ParsedRow[] {
  const out: ParsedRow[] = []
  let position = 0

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (obj.type === 'ingredientsList' && obj.attrs && typeof obj.attrs === 'object') {
      const attrs = obj.attrs as Record<string, unknown>
      const items = Array.isArray(attrs.items) ? attrs.items : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const row = raw as Record<string, unknown>
        const ingredientId =
          typeof row.ingredientId === 'string' ? row.ingredientId.trim() : ''
        if (!ingredientId) continue
        const amount = typeof row.amount === 'number' ? row.amount : null
        const unit = typeof row.unit === 'string' && row.unit.trim() ? row.unit.trim() : null
        const prepNote =
          typeof row.prepNote === 'string' && row.prepNote.trim()
            ? row.prepNote.trim()
            : null
        const isOptional = row.isOptional === true
        const groupLabel =
          typeof row.groupLabel === 'string' && row.groupLabel.trim()
            ? row.groupLabel.trim()
            : null
        out.push({
          ingredientId,
          amount,
          unit,
          prepNote,
          isOptional,
          groupLabel,
          position,
        })
        position += 1
      }
    }
    if (Array.isArray(obj.content)) {
      for (const child of obj.content) walk(child)
    }
  }

  walk(body)
  return out
}

/**
 * Resync the RecipeIngredient join rows for a tutorial from the latest
 * `ingredientsList` block content in its body JSON.
 *
 * Strategy: delete-then-insert inside a transaction. Catalogue scale is
 * such that even a 50-ingredient recipe is two cheap queries, and an
 * additive diff would have to handle out-of-order moves anyway.
 *
 * Silently no-ops if the body references ingredient IDs that don't exist
 * in the master table (foreign-key restrict would fail) — the offending
 * rows are filtered out beforehand. The block in the body JSON stays the
 * editorial source of truth either way.
 */
export async function syncRecipeIngredientsFromBody(
  tutorialId: string,
  body: Prisma.InputJsonValue,
): Promise<void> {
  const parsed = extractRecipeIngredients(body)

  if (parsed.length === 0) {
    await prisma.recipeIngredient.deleteMany({ where: { tutorialId } })
    return
  }

  const knownIds = await prisma.ingredient.findMany({
    where: { id: { in: parsed.map((p) => p.ingredientId) } },
    select: { id: true },
  })
  const knownSet = new Set(knownIds.map((row) => row.id))
  const filtered = parsed.filter((p) => knownSet.has(p.ingredientId))

  await prisma.$transaction(async (tx) => {
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
}
