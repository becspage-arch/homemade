/**
 * Shared nav-group config. The single source of truth for how the six
 * top-line nav groups map to categories. Used by:
 *   - apps/web/src/components/public/category-menu.tsx — the header menu
 *   - apps/web/src/app/(public)/{food,make,skills,home}/page.tsx —
 *     the per-group landing pages
 *
 * The four group landings (Food / Make / Skills / Home) are aggregated
 * pages that span multiple categories. Mindset and Grow are not listed
 * because their group landings are the category pages themselves
 * (/mindset, /garden).
 */

export type GroupKey = 'food' | 'make' | 'skills' | 'home'

export interface GroupConfig {
  key: GroupKey
  /** Top-line nav label (Food / Make / Skills / Home). */
  navLabel: string
  /** Larger landing-page H1 / OG title. */
  title: string
  /** One-line lede used in the hero scrim and as the meta description seed. */
  lede: string
  /** Slugs of categories that belong to this group, in display order. */
  categorySlugs: string[]
}

export const GROUP_CONFIGS: Record<GroupKey, GroupConfig> = {
  food: {
    key: 'food',
    navLabel: 'Food',
    title: 'Food, made at home.',
    lede:
      'Tested recipes from everyday cooking, considered baking, and the herbal medicine cabinet.',
    categorySlugs: ['cooking', 'baking', 'herbal-medicine'],
  },
  make: {
    key: 'make',
    navLabel: 'Make',
    title: 'Make something with your hands.',
    lede:
      'Designed patterns from independent makers. Stitch, knit, sew, felt, weave, spin.',
    categorySlugs: [
      'cross-stitch',
      'knitting',
      'crochet',
      'needlework',
      'sewing',
      'fibre-arts',
    ],
  },
  skills: {
    key: 'skills',
    navLabel: 'Skills',
    title: 'Build a craft from the ground up.',
    lede:
      'Wood and willow, clay and glaze, paper and ink. Slow skills worth keeping.',
    categorySlugs: ['wood-natural-craft', 'paper-word', 'pottery-ceramics'],
  },
  home: {
    key: 'home',
    navLabel: 'Home',
    title: 'A homemade home.',
    lede:
      'Fix what is broken, formulate what you bring inside, grow what you can, raise what you keep.',
    categorySlugs: [
      'home-repair',
      'animals-smallholding',
      'sustainability',
      'natural-home',
    ],
  },
}

export function isGroupKey(value: string): value is GroupKey {
  return value === 'food' || value === 'make' || value === 'skills' || value === 'home'
}
