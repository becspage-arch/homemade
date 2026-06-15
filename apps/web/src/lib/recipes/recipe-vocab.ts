/**
 * Controlled vocabularies for the creator recipe form (UserRecipe).
 *
 * Plain (non-server) module so both the client form and the server actions can
 * import it. Dietary flags reuse the master list from the admin ingredient
 * constants so a user recipe and a library recipe speak the same dietary
 * language; cuisine tags, meal types, categories, originality, and visibility
 * are recipe-level choices specific to this surface.
 */

import { DIETARY_FLAGS, DIETARY_LABEL } from '@/app/admin/tutorials/ingredient-constants'

export { DIETARY_FLAGS, DIETARY_LABEL }

/** The four library categories a Maker can file a recipe alongside. */
export const RECIPE_CATEGORIES = [
  { slug: 'cooking', label: 'Cooking' },
  { slug: 'baking', label: 'Baking' },
  { slug: 'herbal-medicine', label: 'Herbal medicine' },
  { slug: 'natural-home', label: 'Natural home' },
] as const

export const RECIPE_CATEGORY_SLUGS: readonly string[] = RECIPE_CATEGORIES.map((c) => c.slug)

/** Matches the Prisma `MealType` enum. */
export const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'DRINK', label: 'Drink' },
  { value: 'SIDE', label: 'Side' },
  { value: 'OTHER', label: 'Other' },
] as const

export const MEAL_TYPE_VALUES: readonly string[] = MEAL_TYPES.map((m) => m.value)

/** A working set of cuisine tags. Free strings in the schema; this list keeps
 *  the chip picker consistent. Authors can still surface a recipe with none. */
export const CUISINE_TAGS = [
  'british',
  'italian',
  'french',
  'spanish',
  'greek',
  'mexican',
  'american',
  'indian',
  'thai',
  'chinese',
  'japanese',
  'korean',
  'vietnamese',
  'middle-eastern',
  'north-african',
  'caribbean',
  'mediterranean',
  'scandinavian',
  'eastern-european',
] as const

export const ORIGINALITY_TYPES = [
  { value: 'own', label: 'My own recipe' },
  { value: 'family-recipe', label: 'A family recipe' },
  { value: 'adapted-from', label: 'Adapted from another source' },
  { value: 'inspired-by', label: 'Inspired by another source' },
] as const

export const ORIGINALITY_VALUES: readonly string[] = ORIGINALITY_TYPES.map((o) => o.value)

/** Originality choices that need a free-text attribution to make sense. */
export const ORIGINALITY_NEEDS_ATTRIBUTION = new Set(['adapted-from', 'inspired-by'])

export const VISIBILITY_OPTIONS = [
  {
    value: 'PRIVATE',
    label: 'Private',
    hint: 'Only you can see it. Stays in your space.',
  },
  {
    value: 'UNLISTED',
    label: 'Unlisted',
    hint: 'Anyone with the link can see it. It will not show in the community.',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    hint: 'Shown in the community once it passes review.',
  },
] as const

export const VISIBILITY_VALUES: readonly string[] = VISIBILITY_OPTIONS.map((v) => v.value)

export function cuisineLabel(tag: string): string {
  return tag.replace(/-/g, ' ')
}
