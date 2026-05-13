// Allow-list constants for ingredient + recipe metadata fields. These are
// referenced from both the admin editor (client) and the server actions; they
// live in a plain module rather than the `'use server'` actions file because
// Next.js disallows non-async exports from server-action files.

export const INGREDIENT_CATEGORIES = [
  'flour',
  'dairy',
  'meat',
  'fish',
  'vegetable',
  'fruit',
  'herb',
  'spice',
  'condiment',
  'baking',
  'pulse',
  'grain',
  'nut',
  'seed',
  'oil',
  'vinegar',
  'sweetener',
  'alcohol',
  'other',
] as const

export const INGREDIENT_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'each',
  'tbsp',
  'tsp',
  'cup',
  'pinch',
  'clove',
  'sprig',
  'bunch',
  'handful',
] as const

export const DIETARY_FLAGS = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'dairyFree',
  'halal',
  'kosher',
  'nutFree',
  'pescatarian',
] as const

export interface IngredientSearchResult {
  id: string
  slug: string
  name: string
  pluralName: string | null
  defaultUnit: string
  dietaryFlags: string[]
  category: string
}
