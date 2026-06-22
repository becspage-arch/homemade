/**
 * Item-type SubCategory shelf service (phase_cross_craft_item_type_001).
 *
 * The mechanism by which a craft's SubCategory "home shelves" draw their slugs
 * FROM the controlled item-type vocabulary (prisma/item-type-vocabulary.ts), so
 * the SAME "cardigan" slug is used by crochet, knitting and sewing and a single
 * search returns the item across every craft.
 *
 * `ensureCraftShelves(categoryId, craft)` upserts one SubCategory per item type
 * that the craft can produce, keyed by (categoryId, slug). It is idempotent —
 * re-run after editing the vocabulary to reconcile a category's shelves to the
 * file. It never invents a slug; the vocabulary is the single source of truth.
 *
 * Each category's sign-off pass calls this to lay down its shelves, then maps
 * its existing content onto them (the content move is that pass's job, not
 * this service's). One home shelf per pattern stays the rule.
 */

import { prisma } from './index'
import {
  ITEM_TYPE_GROUPS,
  ITEM_TYPE_VOCABULARY,
  itemTypesForCraft,
  type ItemType,
  type ItemTypeCraft,
} from '../prisma/item-type-vocabulary'

export {
  ITEM_TYPE_GROUPS,
  ITEM_TYPE_VOCABULARY,
  itemTypesForCraft,
  type ItemType,
  type ItemTypeCraft,
}

/** Resolve a free item-type input (slug or alias, any case) to its slug. */
export function resolveItemTypeSlug(input: string): string | null {
  const norm = input.trim().toLowerCase()
  if (!norm) return null
  for (const t of ITEM_TYPE_VOCABULARY) {
    if (t.slug === norm) return t.slug
    if ((t.aliases ?? []).some((a) => a.toLowerCase() === norm)) return t.slug
  }
  return null
}

export interface EnsureShelvesResult {
  created: string[]
  updated: string[]
}

/**
 * Lay down (or reconcile) a craft's item-type home shelves under one category.
 *
 * `order` packs the group order into the thousands and the item order into the
 * units, so shelves sort group-by-group on the category page. Names + ordering
 * track the vocabulary; existing rows keep their id (and their attached
 * content) and are updated in place.
 */
export async function ensureCraftShelves(
  categoryId: string,
  craft: ItemTypeCraft,
): Promise<EnsureShelvesResult> {
  const created: string[] = []
  const updated: string[] = []
  for (const t of itemTypesForCraft(craft)) {
    const order = ITEM_TYPE_GROUPS[t.group].order * 1000 + t.order
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId, slug: t.slug } },
      select: { id: true },
    })
    if (existing) {
      await prisma.subCategory.update({
        where: { id: existing.id },
        data: { name: t.name, description: t.description, order },
      })
      updated.push(t.slug)
    } else {
      await prisma.subCategory.create({
        data: { categoryId, slug: t.slug, name: t.name, description: t.description, order },
      })
      created.push(t.slug)
    }
  }
  return { created, updated }
}
