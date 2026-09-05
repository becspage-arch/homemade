import type { PatternType } from '@homemade/db'
import { itemTypesForCraft } from '@homemade/db'
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
  /**
   * Per-shelf published targets. The category's `patternTarget` is their SUM —
   * one number, derived, never hand-maintained alongside them. Shelves flagged
   * `hold` are already the size they should be and are never generated into.
   */
  shelfTargets?: ShelfTarget[]
  /** Which generation tiers suit each sub-category. */
  tierGuide: Record<string, Spec['tier'][]>
}

/**
 * One browse shelf of a pattern-led category, with the size the catalogue is
 * aiming for. Coarse-but-correct beats fragmented: this list IS the allowed set
 * — the planner may only plan into it and the publisher refuses anything else,
 * so a fragmented sibling shelf ('florals' next to 'floral') can never appear
 * again.
 */
export interface ShelfTarget {
  slug: string
  /** Display name, used when the publisher has to create the shelf row. */
  name: string
  /** Published-pattern goal for this shelf. */
  target: number
  /**
   * HOLD: this shelf is already the size it should be. It gets no generation
   * lane, is never planned into, and is excluded from the deficit weighting.
   * A decision, not a computed state — culls move the live count, and a held
   * shelf must not silently reopen because a row went private.
   */
  hold?: boolean
}

/**
 * The canonical cross-stitch shelves. Slugs are the LIVE sub-category slugs:
 * `floral` (not `florals`) and `scenes` (not `home-cosy`) — the fragmented
 * siblings were merged away. `nursery` does not exist yet; the publisher may
 * create that one row on first publish, and no other.
 */
export const CROSS_STITCH_SHELVES: ShelfTarget[] = [
  { slug: 'animals', name: 'Animals', target: 240 },
  { slug: 'floral', name: 'Floral & Botanical', target: 140 },
  { slug: 'whimsical', name: 'Whimsical', target: 160 },
  { slug: 'landscapes', name: 'Landscapes', target: 172, hold: true },
  { slug: 'scenes', name: 'Scenes', target: 120 },
  { slug: 'portraits', name: 'Pop Art & Portraits', target: 137, hold: true },
  { slug: 'monochrome', name: 'Monochrome', target: 131, hold: true },
  { slug: 'fantasy', name: 'Fantasy & Fairytale', target: 100 },
  { slug: 'seasonal', name: 'Seasonal', target: 90 },
  { slug: 'halloween', name: 'Halloween', target: 40 },
  { slug: 'celestial', name: 'Celestial', target: 40 },
  { slug: 'witchy-gothic', name: 'Witchy & gothic', target: 40 },
  { slug: 'food', name: 'Food & Drink', target: 40 },
  { slug: 'cocktails', name: 'Cocktails', target: 30 },
  { slug: 'nursery', name: 'Nursery & baby', target: 30 },
  { slug: 'transport', name: 'Transport', target: 25 },
  { slug: 'hobbies', name: 'Hobbies & makers', target: 25 },
  { slug: 'quotes-and-sayings', name: 'Quotes & sayings', target: 15, hold: true },
  { slug: 'pride-and-inclusive', name: 'Pride & inclusive', target: 8, hold: true },
  { slug: 'famous-faces', name: 'Famous Faces', target: 14, hold: true },
  { slug: 'retro', name: 'Retro', target: 1, hold: true },
  { slug: 'art-reproductions', name: 'Art reproductions', target: 0, hold: true },
]

/** slug → shelf, for the publisher's allowed-shelf check. */
export const CROSS_STITCH_SHELF_BY_SLUG: Record<string, ShelfTarget> = Object.fromEntries(
  CROSS_STITCH_SHELVES.map((s) => [s.slug, s]),
)

/** slug → target, the compact form the planner's deficit weighting reads. */
export const CROSS_STITCH_SHELF_TARGETS: Record<string, number> = Object.fromEntries(
  CROSS_STITCH_SHELVES.map((s) => [s.slug, s.target]),
)

/** The shelves that still have a generation lane (everything not on HOLD). */
export const CROSS_STITCH_ACTIVE_SHELVES: ShelfTarget[] = CROSS_STITCH_SHELVES.filter((s) => !s.hold)

const sumTargets = (shelves: ShelfTarget[]): number => shelves.reduce((n, s) => n + s.target, 0)

const HOMEMADE_DESIGNER = 'cmqkjybwo0000ncv4bcjgwgtm'

export const PATTERN_CATEGORIES: Record<string, PatternCategoryConfig> = {
  'cross-stitch': {
    slug: 'cross-stitch',
    patternType: 'CROSS_STITCH',
    designerId: HOMEMADE_DESIGNER,
    // DERIVED from the shelf targets below — the category target is the sum of
    // its shelves, so the two can never drift apart. BULK_XS_TARGET overrides it
    // at runtime (an ops escape hatch), nothing else.
    patternTarget: sumTargets(CROSS_STITCH_SHELVES),
    shelfTargets: CROSS_STITCH_SHELVES,
    subCategories: CROSS_STITCH_SHELVES.map((s) => s.slug),
    tierGuide: {
      animals: ['scene', 'illustration'],
      floral: ['scene', 'botanical'],
      'quotes-and-sayings': ['illustration', 'botanical', 'retro', 'celestial', 'sampler', 'typo', 'mixed', 'minimal'],
      'pride-and-inclusive': ['scene', 'illustration', 'typo'],
      seasonal: ['scene', 'illustration'],
      cocktails: ['scene'],
      landscapes: ['scene'],
      'art-reproductions': ['scene'],
      monochrome: ['scene'],
      scenes: ['scene', 'illustration'],
    },
  },
  crochet: {
    slug: 'crochet',
    patternType: 'CROCHET_CHART',
    designerId: HOMEMADE_DESIGNER,
    // Floor target — originals-dominant and expected to grow well past it
    // (like cross-stitch 500 → thousands). Drives the admin dashboard count.
    patternTarget: 1200,
    // Home shelves are the crochet subset of the controlled item-type
    // vocabulary (packages/db/prisma/item-type-vocabulary.ts) — derived, never
    // hand-listed, so they stay in lockstep with the shared cross-craft slugs.
    subCategories: itemTypesForCraft('crochet').map((t) => t.slug),
    // Crochet does NOT use the cross-stitch Spec tiers. Its generation is
    // driven by the shared design-direction system (looks × territories ×
    // item-type briefs) in packages/db/prisma/design-direction.ts, and its
    // heroes by the loom render engine. Left empty by design.
    tierGuide: {},
  },
  // Future pattern-led categories (knitting, needlework, sewing) get their own
  // entry here after their sign-off pass agrees the look + sub-categories.
}

export function getPatternCategory(slug: string): PatternCategoryConfig | null {
  return PATTERN_CATEGORIES[slug] ?? null
}
