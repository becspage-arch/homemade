/**
 * Seasonality engine.
 *
 * Returns the active "seasonal themes" for a given date and home country.
 * Themes carry weights and match-tags; the "In season right now" homepage
 * rail scores tutorials by overlap with the active themes and picks the
 * highest scorers.
 *
 * Calendar is hardcoded against UK seasons. Southern-hemisphere countries
 * (AU, NZ, ZA, AR, CL) shift the calendar by six months. Everything else
 * falls back to the UK calendar for now — granular per-country calendars
 * can land in a follow-up.
 */

export interface SeasonalTheme {
  /** Stable slug used in analytics + URL filters. */
  slug: string
  /** Human-readable rail label fragment. */
  label: string
  /**
   * 0..1. Drives the "In season right now" rail order and how heavily the
   * editorial-picks engine boosts matching tutorials.
   */
  weight: number
  /**
   * Tags / ingredients / moods that mark a tutorial as in-season under this
   * theme. Match is case-insensitive substring.
   */
  matchTags: string[]
}

interface MonthSchedule {
  themes: SeasonalTheme[]
}

/**
 * UK calendar. Tags use the same vocabulary the recipe pipeline writes —
 * ingredient slugs, mood values, broad-stroke garden / mindset triggers.
 */
const UK_CALENDAR: Record<number, MonthSchedule> = {
  // 1: January
  1: {
    themes: [
      {
        slug: 'january-reset',
        label: 'January reset',
        weight: 0.85,
        matchTags: [
          'soup',
          'stew',
          'broth',
          'pulse',
          'lentil',
          'porridge',
          'oats',
          'healthy',
          'reset',
          'new-year',
          'meditation',
          'journal',
          'reflection',
        ],
      },
      {
        slug: 'british-winter-roots',
        label: 'winter roots & brassicas',
        weight: 0.75,
        matchTags: [
          'parsnip',
          'swede',
          'turnip',
          'leek',
          'kale',
          'cabbage',
          'sprouts',
          'celeriac',
          'beetroot',
          'jerusalem-artichoke',
          'cavolo-nero',
        ],
      },
      {
        slug: 'preserves-marmalade',
        label: 'seville marmalade season',
        weight: 0.65,
        matchTags: ['seville', 'marmalade', 'orange', 'preserve', 'jam'],
      },
      {
        slug: 'garden-planning',
        label: 'garden planning',
        weight: 0.45,
        matchTags: ['seed', 'planning', 'seed-catalogue', 'sowing-plan'],
      },
    ],
  },
  // 2: February
  2: {
    themes: [
      {
        slug: 'late-winter-comfort',
        label: 'late-winter comfort',
        weight: 0.7,
        matchTags: [
          'soup',
          'stew',
          'casserole',
          'comfort-food',
          'pulse',
          'lentil',
          'pie',
          'crumble',
        ],
      },
      {
        slug: 'forced-rhubarb',
        label: 'forced rhubarb',
        weight: 0.55,
        matchTags: ['rhubarb', 'forced-rhubarb', 'crumble', 'fool'],
      },
      {
        slug: 'pancake-day',
        label: 'pancake day',
        weight: 0.4,
        matchTags: ['pancake', 'crepe', 'shrove', 'maple'],
      },
      {
        slug: 'seed-starting',
        label: 'seed starting',
        weight: 0.5,
        matchTags: ['seed-sowing', 'propagator', 'chitting', 'potato'],
      },
    ],
  },
  // 3: March
  3: {
    themes: [
      {
        slug: 'early-spring-greens',
        label: 'early spring greens',
        weight: 0.8,
        matchTags: ['purple-sprouting-broccoli', 'wild-garlic', 'nettle', 'spring-greens'],
      },
      {
        slug: 'mothering-sunday',
        label: 'mothering sunday',
        weight: 0.5,
        matchTags: ['simnel', 'cake', 'mother', 'flowers', 'biscuit'],
      },
      {
        slug: 'spring-equinox',
        label: 'spring equinox',
        weight: 0.45,
        matchTags: ['equinox', 'ritual', 'fresh-start', 'spring'],
      },
      {
        slug: 'sowing-tender-crops',
        label: 'sowing tender crops',
        weight: 0.6,
        matchTags: ['tomato', 'chilli', 'pepper', 'aubergine', 'sowing', 'seedling'],
      },
    ],
  },
  // 4: April
  4: {
    themes: [
      {
        slug: 'british-spring-vegetables',
        label: 'british spring vegetables',
        weight: 0.85,
        matchTags: [
          'asparagus',
          'jersey-royal',
          'jersey-royal-potato',
          'spring-greens',
          'rocket',
          'spring-onion',
          'radish',
        ],
      },
      {
        slug: 'easter-baking',
        label: 'easter baking',
        weight: 0.65,
        matchTags: [
          'hot-cross-bun',
          'simnel',
          'easter',
          'lamb',
          'roast',
          'chocolate-egg',
        ],
      },
      {
        slug: 'hedgerow-wild-garlic',
        label: 'wild garlic in the hedgerow',
        weight: 0.55,
        matchTags: ['wild-garlic', 'ramson', 'foraging', 'pesto'],
      },
    ],
  },
  // 5: May
  5: {
    themes: [
      {
        slug: 'british-spring-vegetables',
        label: 'british spring vegetables',
        weight: 0.8,
        matchTags: [
          'asparagus',
          'jersey-royal',
          'jersey-royal-potato',
          'spring-greens',
          'broad-bean',
          'pea',
          'rhubarb',
          'spring-onion',
          'radish',
        ],
      },
      {
        slug: 'early-summer-fruit-prep',
        label: 'early summer fruit',
        weight: 0.5,
        matchTags: ['strawberry', 'gooseberry', 'rhubarb', 'elderflower'],
      },
      {
        slug: 'garden-spring-planting',
        label: 'spring planting',
        weight: 0.6,
        matchTags: [
          'tomato',
          'courgette',
          'planting',
          'bean',
          'salad-leaves',
          'companion-planting',
        ],
      },
      {
        slug: 'may-day-rituals',
        label: 'may rituals',
        weight: 0.3,
        matchTags: ['may-day', 'ritual', 'spring', 'meditation'],
      },
    ],
  },
  // 6: June
  6: {
    themes: [
      {
        slug: 'british-summer-fruits',
        label: 'british summer fruits',
        weight: 0.85,
        matchTags: [
          'strawberry',
          'raspberry',
          'gooseberry',
          'redcurrant',
          'blackcurrant',
          'elderflower',
          'cherry',
        ],
      },
      {
        slug: 'elderflower',
        label: 'elderflower',
        weight: 0.7,
        matchTags: ['elderflower', 'cordial', 'foraging', 'syrup'],
      },
      {
        slug: 'midsummer-rituals',
        label: 'midsummer',
        weight: 0.45,
        matchTags: ['midsummer', 'solstice', 'ritual', 'litha'],
      },
      {
        slug: 'salad-summer',
        label: 'garden salads',
        weight: 0.6,
        matchTags: ['salad', 'lettuce', 'cucumber', 'tomato', 'broad-bean', 'pea'],
      },
    ],
  },
  // 7: July
  7: {
    themes: [
      {
        slug: 'british-summer-fruits',
        label: 'british summer fruits',
        weight: 0.85,
        matchTags: [
          'strawberry',
          'raspberry',
          'blackcurrant',
          'cherry',
          'tayberry',
          'blueberry',
          'apricot',
        ],
      },
      {
        slug: 'jam-and-preserves',
        label: 'jam & preserves',
        weight: 0.7,
        matchTags: ['jam', 'jelly', 'preserve', 'cordial', 'fruit-leather'],
      },
      {
        slug: 'high-summer-veg',
        label: 'high summer veg',
        weight: 0.7,
        matchTags: ['courgette', 'tomato', 'french-bean', 'runner-bean', 'cucumber', 'fennel'],
      },
      {
        slug: 'no-cook-summer',
        label: 'no-cook summer',
        weight: 0.5,
        matchTags: ['salad', 'ice-cream', 'sorbet', 'gazpacho', 'no-cook', 'cold'],
      },
    ],
  },
  // 8: August
  8: {
    themes: [
      {
        slug: 'late-summer-stone-fruit',
        label: 'late summer stone fruit',
        weight: 0.85,
        matchTags: ['plum', 'damson', 'greengage', 'peach', 'nectarine', 'apricot'],
      },
      {
        slug: 'tomato-glut',
        label: 'the tomato glut',
        weight: 0.8,
        matchTags: ['tomato', 'passata', 'sauce', 'pickle', 'ketchup', 'gazpacho'],
      },
      {
        slug: 'courgette-glut',
        label: 'the courgette glut',
        weight: 0.7,
        matchTags: ['courgette', 'marrow', 'fritter', 'soup'],
      },
      {
        slug: 'lammas',
        label: 'lammas',
        weight: 0.35,
        matchTags: ['lammas', 'bread', 'harvest', 'grain', 'ritual'],
      },
    ],
  },
  // 9: September
  9: {
    themes: [
      {
        slug: 'orchard-harvest',
        label: 'orchard harvest',
        weight: 0.85,
        matchTags: ['apple', 'pear', 'quince', 'blackberry', 'crab-apple'],
      },
      {
        slug: 'blackberry-hedgerow',
        label: 'blackberry hedgerow',
        weight: 0.7,
        matchTags: ['blackberry', 'bramble', 'foraging', 'hedgerow', 'cordial', 'jam'],
      },
      {
        slug: 'preserving-season',
        label: 'preserving season',
        weight: 0.75,
        matchTags: [
          'preserve',
          'chutney',
          'pickle',
          'jam',
          'jelly',
          'ferment',
          'fermentation',
        ],
      },
      {
        slug: 'autumn-equinox',
        label: 'autumn equinox',
        weight: 0.4,
        matchTags: ['equinox', 'mabon', 'ritual', 'reflection', 'gratitude'],
      },
    ],
  },
  // 10: October
  10: {
    themes: [
      {
        slug: 'squash-and-pumpkin',
        label: 'squash & pumpkin',
        weight: 0.85,
        matchTags: ['pumpkin', 'squash', 'butternut', 'crown-prince', 'soup', 'roast'],
      },
      {
        slug: 'wild-mushroom',
        label: 'wild mushroom',
        weight: 0.7,
        matchTags: ['mushroom', 'foraging', 'chanterelle', 'porcini', 'wild-mushroom'],
      },
      {
        slug: 'samhain-rituals',
        label: 'samhain',
        weight: 0.55,
        matchTags: ['samhain', 'halloween', 'ancestor', 'ritual', 'apple'],
      },
      {
        slug: 'apple-everything',
        label: 'apples everywhere',
        weight: 0.65,
        matchTags: ['apple', 'cider', 'pie', 'crumble', 'sauce', 'chutney'],
      },
    ],
  },
  // 11: November
  11: {
    themes: [
      {
        slug: 'bonfire-night',
        label: 'bonfire night',
        weight: 0.65,
        matchTags: [
          'parkin',
          'toffee-apple',
          'baked-potato',
          'soup',
          'gingerbread',
          'bonfire',
        ],
      },
      {
        slug: 'november-roots',
        label: 'november roots',
        weight: 0.7,
        matchTags: [
          'parsnip',
          'swede',
          'celeriac',
          'beetroot',
          'leek',
          'kale',
          'roast',
          'soup',
          'mash',
        ],
      },
      {
        slug: 'christmas-cake-and-mincemeat',
        label: 'christmas cake & mincemeat',
        weight: 0.65,
        matchTags: [
          'christmas-cake',
          'mincemeat',
          'fruitcake',
          'puddings',
          'stir-up-sunday',
          'spice',
        ],
      },
      {
        slug: 'slow-down',
        label: 'slow down',
        weight: 0.45,
        matchTags: ['meditation', 'rest', 'slow', 'candle', 'evening-ritual'],
      },
    ],
  },
  // 12: December
  12: {
    themes: [
      {
        slug: 'christmas-baking',
        label: 'christmas baking',
        weight: 0.9,
        matchTags: [
          'christmas',
          'mince-pie',
          'christmas-cake',
          'fruitcake',
          'pudding',
          'stollen',
          'gingerbread',
          'shortbread',
          'biscuit',
        ],
      },
      {
        slug: 'midwinter-roots',
        label: 'midwinter roots',
        weight: 0.7,
        matchTags: [
          'parsnip',
          'swede',
          'celeriac',
          'beetroot',
          'sprouts',
          'red-cabbage',
          'roast',
          'goose',
          'turkey',
          'ham',
        ],
      },
      {
        slug: 'edible-gifts',
        label: 'edible gifts',
        weight: 0.6,
        matchTags: [
          'gift',
          'truffle',
          'biscuit',
          'chutney',
          'preserve',
          'edible-gift',
          'fudge',
        ],
      },
      {
        slug: 'yule-and-solstice',
        label: 'yule & winter solstice',
        weight: 0.5,
        matchTags: ['yule', 'solstice', 'candle', 'ritual', 'evergreens', 'wreath'],
      },
    ],
  },
}

const SOUTHERN_HEMISPHERE = new Set([
  'AU',
  'NZ',
  'ZA',
  'AR',
  'CL',
  'UY',
  'PY',
  'BO',
  'PE',
  'EC',
  'CO',
])

/**
 * Get the active themes for the given date + country code. Sorted by weight
 * (highest first). When `countryCode` is one of the southern-hemisphere
 * countries we map to the calendar entry six months out so December reads
 * as midsummer rather than midwinter.
 */
export function getCurrentSeasonalThemes(input: {
  date?: Date
  countryCode?: string | null
}): SeasonalTheme[] {
  const date = input.date ?? new Date()
  const month = date.getUTCMonth() + 1 // 1..12

  const cc = (input.countryCode ?? '').toUpperCase()
  const effectiveMonth = SOUTHERN_HEMISPHERE.has(cc) ? ((month + 5) % 12) + 1 : month

  const schedule = UK_CALENDAR[effectiveMonth]
  if (!schedule) return []
  return [...schedule.themes].sort((a, b) => b.weight - a.weight)
}

/**
 * Combined match-tag set across active themes — a fast lookup for tutorial
 * scoring. The returned map is `tag -> max weight` so a tutorial matching
 * a stronger theme outranks one matching a weaker one.
 */
export function activeThemeTagWeights(input: {
  date?: Date
  countryCode?: string | null
}): Map<string, number> {
  const themes = getCurrentSeasonalThemes(input)
  const map = new Map<string, number>()
  for (const theme of themes) {
    for (const raw of theme.matchTags) {
      const tag = raw.toLowerCase()
      const existing = map.get(tag) ?? 0
      if (theme.weight > existing) map.set(tag, theme.weight)
    }
  }
  return map
}

/**
 * Score a tutorial's fitness for the current seasonal context. Looks at the
 * tutorial's `mood[]`, `dietaryFlags[]`, `cuisine`, `mealType`, and category
 * slug, comparing each token against the active theme tags. Off-season
 * candidates lose points; the score is unbounded.
 */
export interface ScoreableTutorial {
  mood?: string[] | null
  dietaryFlags?: string[] | null
  cuisine?: string | null
  mealType?: string | null
  season?: string | null
  practiceTargets?: string[] | null
  category?: { slug: string | null } | null
  title?: string | null
  excerpt?: string | null
}

export function seasonalityScore(
  tutorial: ScoreableTutorial,
  input: { date?: Date; countryCode?: string | null } = {},
): number {
  const tagWeights = activeThemeTagWeights(input)
  if (tagWeights.size === 0) return 0

  const haystack: string[] = []
  if (tutorial.mood) haystack.push(...tutorial.mood)
  if (tutorial.dietaryFlags) haystack.push(...tutorial.dietaryFlags)
  if (tutorial.cuisine) haystack.push(tutorial.cuisine)
  if (tutorial.mealType) haystack.push(tutorial.mealType)
  if (tutorial.season) haystack.push(tutorial.season)
  if (tutorial.practiceTargets) haystack.push(...tutorial.practiceTargets)
  if (tutorial.category?.slug) haystack.push(tutorial.category.slug)
  if (tutorial.title) haystack.push(tutorial.title)
  if (tutorial.excerpt) haystack.push(tutorial.excerpt)

  const normalised = haystack
    .filter(Boolean)
    .map((s) => (s ?? '').toString().toLowerCase())
    .join(' ')

  let score = 0
  for (const [tag, weight] of tagWeights) {
    if (normalised.includes(tag)) {
      score += weight
    }
  }
  return score
}
