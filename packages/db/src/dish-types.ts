/**
 * Dish-type SubCategory shelf service (phase_dish_type_001).
 *
 * The food-category counterpart of `item-types.ts`: a food category's
 * SubCategory "home shelves" draw their slugs FROM the controlled dish-type
 * vocabulary (prisma/dish-type-vocabulary.ts), so a recipe browses under one
 * dish-type shelf (pasta, curries, cakes…) and that slug rides on the search
 * doc as `subCategorySlug` (a cross-craft facet). Mirrors `ensureCraftShelves`.
 *
 * `ensureDishShelves(categoryId, dishCategory)` upserts one SubCategory per
 * dish type in that food category, keyed by (categoryId, slug). Idempotent —
 * re-run after editing the vocabulary to reconcile. It never invents a slug;
 * the vocabulary is the single source of truth. It never deletes shelves it
 * doesn't own (so the existing baking shelves are reconciled, not churned).
 */

import { prisma } from './index'
import {
  DISH_TYPE_GROUPS,
  DISH_TYPE_VOCABULARY,
  DISH_COLLECTIONS,
  dishTypesForCategory,
  resolveDishTypeSlug,
  type DishType,
  type DishCategory,
  type DishCollection,
} from '../prisma/dish-type-vocabulary'

export {
  DISH_TYPE_GROUPS,
  DISH_TYPE_VOCABULARY,
  DISH_COLLECTIONS,
  dishTypesForCategory,
  resolveDishTypeSlug,
  type DishType,
  type DishCategory,
  type DishCollection,
}

export interface EnsureDishShelvesResult {
  created: string[]
  updated: string[]
}

/**
 * Lay down (or reconcile) a food category's dish-type home shelves.
 *
 * `order` packs the group order into the thousands and the dish order into the
 * units, so shelves sort group-by-group on the category page. Existing rows
 * keep their id (and their attached recipes) and are updated in place — this is
 * how the eight pre-existing baking shelves are adopted rather than recreated.
 */
export async function ensureDishShelves(
  categoryId: string,
  dishCategory: DishCategory,
): Promise<EnsureDishShelvesResult> {
  const created: string[] = []
  const updated: string[] = []
  for (const d of dishTypesForCategory(dishCategory)) {
    const order = DISH_TYPE_GROUPS[d.group].order * 1000 + d.order
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId, slug: d.slug } },
      select: { id: true },
    })
    if (existing) {
      await prisma.subCategory.update({
        where: { id: existing.id },
        data: { name: d.name, description: d.description, order },
      })
      updated.push(d.slug)
    } else {
      await prisma.subCategory.create({
        data: { categoryId, slug: d.slug, name: d.name, description: d.description, order },
      })
      created.push(d.slug)
    }
  }
  return { created, updated }
}
