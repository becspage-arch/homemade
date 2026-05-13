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

// ──────────────────────────────────────────────────────────────────────────
// Recipe-level controlled vocabularies. Locked with Rebecca on 2026-05-13.
// ──────────────────────────────────────────────────────────────────────────

// `milkFree` and `dairyFree` are deliberately distinct: UK food-labelling
// regs treat "milk" as cow's milk specifically, so a recipe can be
// milk-free without being dairy-free (goat / sheep milk products still
// allowed). Common with cow's-milk allergy (CMPA).
export const DIETARY_FLAGS = [
  // Identity diets
  'vegetarian',
  'vegan',
  'pescatarian',
  // Religion
  'halal',
  'kosher',
  // Allergen-free
  'glutenFree',
  'dairyFree',
  'milkFree',
  'eggFree',
  'nutFree',
  'soyFree',
  'alcoholFree',
  // Medical / lifestyle
  'lowFodmap',
  'lowCarb',
  'sugarFree',
  'keto',
  'paleo',
  'whole30',
] as const

export const DIETARY_LABEL: Record<(typeof DIETARY_FLAGS)[number], string> = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  pescatarian: 'pescatarian',
  halal: 'halal',
  kosher: 'kosher',
  glutenFree: 'gluten-free',
  dairyFree: 'dairy-free',
  milkFree: 'milk-free',
  eggFree: 'egg-free',
  nutFree: 'nut-free',
  soyFree: 'soy-free',
  alcoholFree: 'alcohol-free',
  lowFodmap: 'low-FODMAP',
  lowCarb: 'low-carb',
  sugarFree: 'sugar-free',
  keto: 'keto',
  paleo: 'paleo',
  whole30: 'Whole30',
}

export const MOOD_FLAGS = [
  // Time / energy
  'weeknight',
  'slowSunday',
  'mealPrep',
  'brunchy',
  // Vibe
  'comfortFood',
  'cosy',
  'hearty',
  'summery',
  'lightAndFresh',
  'healthy',
  // Context / audience
  'party',
  'dateNight',
  'picnic',
  'bbq',
  'specialOccasion',
  'kidFriendly',
  'showstopper',
] as const

export const MOOD_LABEL: Record<(typeof MOOD_FLAGS)[number], string> = {
  weeknight: 'weeknight',
  slowSunday: 'slow sunday',
  mealPrep: 'meal prep',
  brunchy: 'brunchy',
  comfortFood: 'comfort food',
  cosy: 'cosy',
  hearty: 'hearty',
  summery: 'summery',
  lightAndFresh: 'light and fresh',
  healthy: 'healthy',
  party: 'party',
  dateNight: 'date night',
  picnic: 'picnic',
  bbq: 'bbq',
  specialOccasion: 'special occasion',
  kidFriendly: 'kid-friendly',
  showstopper: 'showstopper',
}

export const MEAL_TYPES = [
  'breakfast',
  'brunch',
  'lunch',
  'dinner',
  'snack',
  'starter',
  'dessert',
  'drink',
  'side',
] as const

export const MEAL_TYPE_LABEL: Record<(typeof MEAL_TYPES)[number], string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  starter: 'Starter',
  dessert: 'Dessert',
  drink: 'Drink',
  side: 'Side',
}

// Cuisine mirrors the top-level sections of docs/recipe-backlog.md, with
// greek / spanish / jewish pulled out as first-class slugs so the search
// dimension matches what users actually type ("Greek recipes" rather than
// "Mediterranean"). Deferred-until-v2 cuisines (Thai, Vietnamese, Korean,
// modern Japanese / Indian / Mexican / Latin American) stay off the list —
// adding later is cheap; consolidating after authoring would not be.
export const CUISINES = [
  'british',
  'italian',
  'italianAmerican',
  'french',
  'american',
  'mediterranean',
  'greek',
  'spanish',
  'middleEastern',
  'northAfrican',
  'caribbean',
  'easternEuropean',
  'jewish',
  'angloIndian',
] as const

export const CUISINE_LABEL: Record<(typeof CUISINES)[number], string> = {
  british: 'British',
  italian: 'Italian',
  italianAmerican: 'Italian-American',
  french: 'French',
  american: 'American',
  mediterranean: 'Mediterranean',
  greek: 'Greek',
  spanish: 'Spanish',
  middleEastern: 'Middle Eastern',
  northAfrican: 'North African',
  caribbean: 'Caribbean',
  easternEuropean: 'Eastern European',
  jewish: 'Jewish',
  angloIndian: 'Anglo-Indian',
}

export interface IngredientSearchResult {
  id: string
  slug: string
  name: string
  pluralName: string | null
  defaultUnit: string
  dietaryFlags: string[]
  category: string
}
