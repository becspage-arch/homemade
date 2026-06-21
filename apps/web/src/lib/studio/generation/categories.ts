import type { PatternType } from '@homemade/db'
import type { Spec } from './spec'

/**
 * Registry of pattern-led categories the generation pipeline can fill.
 *
 * Adding a new pattern-led category (knitting, crochet, needlework, ...) is a
 * config entry here + its own sign-off pass — NOT a rebuild. The engines
 * (`convert` / `sources` / `quote-engine` / `spec`) are category-agnostic; this
 * config carries the category-specific bits: which Pattern type the charts are,
 * the house designer to attribute to, the published-pattern target, the
 * sub-categories the library is organised into, and which generation tiers feed
 * each sub-category (guidance for batch authoring + the vision gate).
 */
export interface PatternCategoryConfig {
  slug: string
  patternType: PatternType
  /** Homemade house designer id to attribute generated patterns to. */
  designerId: string
  /** Published-pattern goal for the category (drives the dashboard + stop point). */
  patternTarget: number
  /** Sub-categories every published pattern must be assigned to (NULL sub-cat
   *  patterns never show in the public grid — always assign on publish). */
  subCategories: string[]
  /** Which generation tiers suit each sub-category. */
  tierGuide: Record<string, Spec['tier'][]>
}

const HOMEMADE_DESIGNER = 'cmqkjybwo0000ncv4bcjgwgtm'

export const PATTERN_CATEGORIES: Record<string, PatternCategoryConfig> = {
  'cross-stitch': {
    slug: 'cross-stitch',
    patternType: 'CROSS_STITCH',
    designerId: HOMEMADE_DESIGNER,
    patternTarget: 1500,
    subCategories: [
      'animals', 'florals', 'quotes-and-sayings', 'pride-and-inclusive', 'seasonal',
      'cocktails', 'landscapes', 'art-reproductions', 'monochrome', 'home-cosy',
    ],
    tierGuide: {
      animals: ['scene', 'illustration'],
      florals: ['scene', 'botanical'],
      'quotes-and-sayings': ['illustration', 'botanical', 'retro', 'celestial', 'sampler', 'typo', 'mixed', 'minimal'],
      'pride-and-inclusive': ['scene', 'illustration', 'typo'],
      seasonal: ['scene', 'illustration'],
      cocktails: ['scene'],
      landscapes: ['scene'],
      'art-reproductions': ['scene'],
      monochrome: ['scene'],
      'home-cosy': ['scene', 'illustration'],
    },
  },
  // Future pattern-led categories (knitting, crochet, needlework) get their own
  // entry here after their sign-off pass agrees the look + sub-categories.
}

export function getPatternCategory(slug: string): PatternCategoryConfig | null {
  return PATTERN_CATEGORIES[slug] ?? null
}
