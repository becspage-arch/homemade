import 'server-only'
import { prisma } from '@homemade/db'
import {
  formatIngredientQuantity,
  type UnitPreferences,
} from './units'

/**
 * Shopping-list aggregation.
 *
 * Takes a set of recipe slugs, combines their ingredient quantities per
 * canonical ingredient, and groups the result by supermarket aisle. Quantities
 * in compatible units are summed (all masses to grams, all volumes to ml);
 * incompatible forms of the same ingredient (e.g. "2 cloves" plus "1 tbsp
 * paste") are kept as separate segments on one line rather than forced
 * together. Display uses the reader's unit preferences, same as the recipe
 * page, so the list reads in the units they chose.
 *
 * Free-tier surface per the translation-is-free lock; the SHOPPING_LIST gate
 * stays off until a later premium-setup worker flips it.
 */

export interface ShoppingListItem {
  ingredientId: string
  name: string
  slug: string
  /** Combined amount(s), already formatted for the reader, e.g. "300 g" or
   *  "2 cloves + 1 tbsp". Empty string means the recipes only said "to taste". */
  display: string
  /** Whether any contributing row was "to taste" / "as needed". */
  toTaste: boolean
  /** Slugs of the recipes this ingredient came from. */
  fromRecipes: string[]
}

export interface ShoppingListGroup {
  aisle: string
  label: string
  items: ShoppingListItem[]
}

export interface ShoppingList {
  groups: ShoppingListGroup[]
  /** Recipe slugs that resolved to a published recipe, in input order. */
  recipes: Array<{ slug: string; title: string }>
  /** Slugs asked for that did not resolve to a published recipe. */
  unknownSlugs: string[]
  itemCount: number
}

// Aisle display order: a sensible walk round a shop, with friendly labels.
const AISLE_ORDER: Array<{ key: string; label: string }> = [
  { key: 'PRODUCE', label: 'Fruit and veg' },
  { key: 'MEAT_FISH', label: 'Meat and fish' },
  { key: 'DAIRY', label: 'Dairy' },
  { key: 'BAKERY', label: 'Bakery' },
  { key: 'DELI', label: 'Deli' },
  { key: 'FROZEN', label: 'Frozen' },
  { key: 'HERBS_SPICES', label: 'Herbs and spices' },
  { key: 'PANTRY_DRY', label: 'Pantry: dry goods' },
  { key: 'PANTRY_BAKING', label: 'Pantry: baking' },
  { key: 'PANTRY_OIL', label: 'Pantry: oils' },
  { key: 'PANTRY_CONDIMENT', label: 'Pantry: condiments' },
  { key: 'DRINK', label: 'Drinks' },
  { key: 'HOUSEHOLD', label: 'Household' },
  { key: 'OTHER', label: 'Other' },
]
const LABEL_BY_AISLE = new Map(AISLE_ORDER.map((a) => [a.key, a.label]))

const MASS_UNITS = new Set(['g', 'gram', 'grams', 'kg', 'kilo', 'kilos'])
const VOLUME_UNITS = new Set(['ml', 'millilitre', 'millilitres', 'l', 'litre', 'litres'])

/** Normalise a (amount, unit) pair into a base-unit class for summing. */
function classify(amount: number, unit: string): { cls: string; base: number } {
  const u = unit.toLowerCase().trim()
  if (MASS_UNITS.has(u)) {
    const g = u === 'kg' || u === 'kilo' || u === 'kilos' ? amount * 1000 : amount
    return { cls: 'mass', base: g }
  }
  if (VOLUME_UNITS.has(u)) {
    const ml = u === 'l' || u === 'litre' || u === 'litres' ? amount * 1000 : amount
    return { cls: 'volume', base: ml }
  }
  // Spoons, counts and anything else combine only with the exact same unit.
  return { cls: `unit:${u}`, base: amount }
}

interface Acc {
  ingredientId: string
  name: string
  slug: string
  aisle: string
  densityGPerMl: number | null
  /** class -> summed base amount */
  totals: Map<string, number>
  toTaste: boolean
  fromRecipes: Set<string>
}

export async function aggregateShoppingList(
  recipeSlugs: string[],
  preferences: UnitPreferences,
): Promise<ShoppingList> {
  const wanted = Array.from(new Set(recipeSlugs.map((s) => s.trim()).filter(Boolean)))
  if (wanted.length === 0) {
    return { groups: [], recipes: [], unknownSlugs: [], itemCount: 0 }
  }

  const ingredientSelect = {
    select: { id: true, name: true, slug: true, aisle: true, densityGPerMl: true },
  } as const

  // A recipe can be a library Tutorial or a Maker's UserRecipe. Resolve the
  // Tutorials first; any slug left over is tried as an approved UserRecipe, so
  // both kinds aggregate into the same list. (A slug that matches a published
  // Tutorial wins, so the rare Tutorial/UserRecipe slug collision is harmless.)
  const tutorials = await prisma.tutorial.findMany({
    where: { slug: { in: wanted }, status: 'PUBLISHED' },
    select: {
      slug: true,
      title: true,
      recipeIngredients: {
        select: { amount: true, unit: true, ingredient: ingredientSelect },
      },
    },
  })
  const tutorialSlugs = new Set(tutorials.map((t) => t.slug))
  const leftover = wanted.filter((s) => !tutorialSlugs.has(s))

  const userRecipes = leftover.length
    ? await prisma.userRecipe.findMany({
        where: { slug: { in: leftover }, status: 'APPROVED' },
        select: {
          slug: true,
          title: true,
          ingredients: {
            select: { quantity: true, unit: true, ingredient: ingredientSelect },
          },
        },
      })
    : []

  // Normalise both kinds into one { slug, title, rows: [{ amount, unit, ingredient }] } shape.
  interface NormRow {
    amount: number | null
    unit: string | null
    ingredient: { id: string; name: string; slug: string; aisle: string | null; densityGPerMl: unknown }
  }
  const bySlug = new Map<string, { slug: string; title: string; rows: NormRow[] }>()
  for (const t of tutorials) {
    bySlug.set(t.slug, {
      slug: t.slug,
      title: t.title,
      rows: t.recipeIngredients.map((r) => ({ amount: r.amount, unit: r.unit, ingredient: r.ingredient })),
    })
  }
  for (const u of userRecipes) {
    if (bySlug.has(u.slug)) continue
    bySlug.set(u.slug, {
      slug: u.slug,
      title: u.title,
      rows: u.ingredients.map((r) => ({
        amount: r.quantity !== null ? Number(r.quantity) : null,
        unit: r.unit,
        ingredient: r.ingredient,
      })),
    })
  }

  const recipes = wanted.filter((s) => bySlug.has(s)).map((s) => {
    const r = bySlug.get(s)!
    return { slug: r.slug, title: r.title }
  })
  const unknownSlugs = wanted.filter((s) => !bySlug.has(s))

  // Accumulate per ingredient across every resolved recipe.
  const acc = new Map<string, Acc>()
  for (const slug of wanted) {
    const t = bySlug.get(slug)
    if (!t) continue
    for (const row of t.rows) {
      const ing = row.ingredient
      let a = acc.get(ing.id)
      if (!a) {
        a = {
          ingredientId: ing.id,
          name: ing.name,
          slug: ing.slug,
          aisle: ing.aisle ?? 'OTHER',
          densityGPerMl: ing.densityGPerMl !== null ? Number(ing.densityGPerMl) : null,
          totals: new Map(),
          toTaste: false,
          fromRecipes: new Set(),
        }
        acc.set(ing.id, a)
      }
      a.fromRecipes.add(slug)
      if (row.amount === null) {
        a.toTaste = true
        continue
      }
      const { cls, base } = classify(row.amount, row.unit ?? '')
      a.totals.set(cls, (a.totals.get(cls) ?? 0) + base)
    }
  }

  // Format each accumulated ingredient into a display string.
  const itemsByAisle = new Map<string, ShoppingListItem[]>()
  let itemCount = 0
  for (const a of acc.values()) {
    const segments: string[] = []
    for (const [cls, total] of a.totals) {
      if (cls === 'mass') {
        segments.push(formatIngredientQuantity(total, 'g', preferences, a.densityGPerMl))
      } else if (cls === 'volume') {
        segments.push(formatIngredientQuantity(total, 'ml', preferences))
      } else {
        const unit = cls.slice('unit:'.length)
        segments.push(formatIngredientQuantity(total, unit || null, preferences))
      }
    }
    let display = segments.filter(Boolean).join(' + ')
    if (!display && a.toTaste) display = 'to taste'

    const item: ShoppingListItem = {
      ingredientId: a.ingredientId,
      name: a.name,
      slug: a.slug,
      display,
      toTaste: a.toTaste,
      fromRecipes: Array.from(a.fromRecipes),
    }
    const list = itemsByAisle.get(a.aisle) ?? []
    list.push(item)
    itemsByAisle.set(a.aisle, list)
    itemCount += 1
  }

  // Order groups by the shopping walk; alphabetise items within each.
  const groups: ShoppingListGroup[] = []
  for (const { key, label } of AISLE_ORDER) {
    const items = itemsByAisle.get(key)
    if (!items || items.length === 0) continue
    items.sort((x, y) => x.name.localeCompare(y.name))
    groups.push({ aisle: key, label, items })
  }
  // Any aisle value not in the canonical order (shouldn't happen) lands last.
  for (const [aisle, items] of itemsByAisle) {
    if (LABEL_BY_AISLE.has(aisle)) continue
    items.sort((x, y) => x.name.localeCompare(y.name))
    groups.push({ aisle, label: 'Other', items })
  }

  return { groups, recipes, unknownSlugs, itemCount }
}
