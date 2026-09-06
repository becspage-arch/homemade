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
 * siblings were merged away. `nursery` did not exist until the publisher made
 * it on its first nursery gem; the same route creates any other row on this
 * list that is not live yet, and no row that is not on it.
 *
 * FOUR SHELVES ADDED 6 September 2026, against what the best catalogues carry:
 * `small-makes` (ornaments, bookmarks, cards, keyrings, coasters — sold as
 * sets), `christmas` (its own shelf, not a corner of seasonal), `coastal` and
 * `folk-geometric`. `seasonal` drops 90 → 40 because Christmas moved out of it;
 * Easter and spring, autumn and Valentine's stay.
 */
export const CROSS_STITCH_SHELVES: ShelfTarget[] = [
  { slug: 'animals', name: 'Animals', target: 240 },
  { slug: 'floral', name: 'Floral & Botanical', target: 140 },
  { slug: 'whimsical', name: 'Whimsical', target: 160 },
  { slug: 'landscapes', name: 'Landscapes', target: 167, hold: true },
  { slug: 'scenes', name: 'Scenes', target: 120 },
  { slug: 'portraits', name: 'Pop Art & Portraits', target: 127, hold: true },
  { slug: 'monochrome', name: 'Monochrome', target: 122, hold: true },
  { slug: 'fantasy', name: 'Fantasy & Fairytale', target: 100 },
  { slug: 'christmas', name: 'Christmas', target: 80 },
  { slug: 'small-makes', name: 'Small makes', target: 60 },
  { slug: 'coastal', name: 'Coastal & seaside', target: 60 },
  { slug: 'folk-geometric', name: 'Folk art & geometric', target: 60 },
  { slug: 'seasonal', name: 'Seasonal', target: 40 },
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

/**
 * The canonical CROCHET shelves — the crochet subset of the shared item-type
 * vocabulary (`packages/db/prisma/item-type-vocabulary.ts`), each with the
 * published-pattern target the catalogue is aiming for.
 *
 * DEMAND-WEIGHTED, not even. Toys and blankets are what people crochet most, so
 * amigurumi and blankets carry the biggest numbers; a crocheted pair of trousers
 * is a real item type and almost nobody makes one, so it carries three. The sum
 * is the category target (1,200 — a FLOOR, per the sign-off: originals-dominant,
 * expected to grow well past it the way cross-stitch went 500 → thousands).
 *
 * A shelf's target is what the CATALOGUE wants, which is a separate question
 * from what the loom can build today. What the engine can build lives in
 * `bulk/crochet-forms.ts`; only the shelves listed there get a generation lane,
 * and the rest sit here at their target waiting for the engine to reach them.
 */
export const CROCHET_SHELVES: ShelfTarget[] = [
  // ── Toys — the biggest seam ──
  { slug: 'amigurumi', name: 'Amigurumi', target: 155 },
  { slug: 'animal-toy', name: 'Animal Toys', target: 55 },
  { slug: 'doll', name: 'Dolls', target: 35 },
  { slug: 'baby-toy-lovey', name: 'Baby Toys & Loveys', target: 25 },
  // ── Home & living ──
  { slug: 'blanket', name: 'Blankets & Afghans', target: 125 },
  { slug: 'cushion', name: 'Cushions & Pillows', target: 35 },
  { slug: 'basket', name: 'Baskets & Storage', target: 22 },
  { slug: 'ornament', name: 'Ornaments & Decorations', target: 20 },
  { slug: 'wall-hanging', name: 'Wall Hangings & Art', target: 18 },
  { slug: 'rug', name: 'Rugs & Mats', target: 12 },
  { slug: 'plant-hanger', name: 'Plant Hangers & Pot Covers', target: 10 },
  { slug: 'bunting', name: 'Bunting & Garlands', target: 10 },
  { slug: 'pet-bed', name: 'Pet Beds & Accessories', target: 8 },
  { slug: 'pouffe', name: 'Pouffes & Floor Cushions', target: 6 },
  // ── Hats, headwear, scarves, wraps ──
  { slug: 'hat', name: 'Hats & Beanies', target: 65 },
  { slug: 'scarf', name: 'Scarves', target: 50 },
  { slug: 'headband', name: 'Headbands & Ear Warmers', target: 30 },
  { slug: 'cowl', name: 'Cowls & Snoods', target: 30 },
  { slug: 'shawl', name: 'Shawls', target: 26 },
  { slug: 'beret', name: 'Berets & Tams', target: 12 },
  { slug: 'wrap', name: 'Wraps & Stoles', target: 12 },
  { slug: 'poncho', name: 'Ponchos & Capes', target: 8 },
  // ── Gloves, legwear, socks, slippers ──
  { slug: 'slippers', name: 'Slippers', target: 18 },
  { slug: 'fingerless-mitts', name: 'Fingerless Mitts & Wrist Warmers', target: 15 },
  { slug: 'socks', name: 'Socks', target: 12 },
  { slug: 'booties', name: 'Baby Booties', target: 12 },
  { slug: 'mittens', name: 'Mittens', target: 10 },
  { slug: 'gloves', name: 'Gloves', target: 6 },
  { slug: 'legwarmers', name: 'Leg Warmers', target: 6 },
  // ── Bags & small accessories ──
  { slug: 'bag', name: 'Bags & Totes', target: 30 },
  { slug: 'purse', name: 'Purses & Pouches', target: 16 },
  { slug: 'hair-accessory', name: 'Hair Accessories', target: 10 },
  { slug: 'jewellery', name: 'Jewellery', target: 8 },
  { slug: 'backpack', name: 'Backpacks', target: 5 },
  { slug: 'belt', name: 'Belts', target: 3 },
  // ── Kitchen & bath ──
  { slug: 'dishcloth', name: 'Dishcloths & Washcloths', target: 26 },
  { slug: 'potholder', name: 'Potholders & Trivets', target: 15 },
  { slug: 'tea-cosy', name: 'Tea & Egg Cosies', target: 10 },
  { slug: 'towel', name: 'Towels & Toppers', target: 6 },
  // ── Garments ──
  { slug: 'cardigan', name: 'Cardigans', target: 20 },
  { slug: 'jumper-pullover', name: 'Jumpers & Pullovers', target: 16 },
  { slug: 'tee-top', name: 'Tees & Tops', target: 14 },
  { slug: 'vest', name: 'Vests & Tank Tops', target: 10 },
  { slug: 'dress', name: 'Dresses', target: 8 },
  { slug: 'tunic', name: 'Tunics', target: 5 },
  { slug: 'skirt', name: 'Skirts', target: 4 },
  { slug: 'jacket-coat', name: 'Jackets & Coats', target: 4 },
  { slug: 'trousers', name: 'Trousers & Leggings', target: 3 },
  { slug: 'shorts', name: 'Shorts', target: 3 },
  { slug: 'jumpsuit-romper', name: 'Jumpsuits & Rompers', target: 3 },
  // ── Doilies, motifs, components ──
  { slug: 'motif-granny-square', name: 'Motifs & Granny Squares', target: 35 },
  { slug: 'coaster', name: 'Coasters & Placemats', target: 28 },
  { slug: 'doily', name: 'Doilies & Lace', target: 22 },
  { slug: 'edging', name: 'Edgings & Trims', target: 18 },
  { slug: 'applique-flower', name: 'Appliqués & Flowers', target: 18 },
  { slug: 'bookmark', name: 'Bookmarks', target: 8 },
  { slug: 'pincushion', name: 'Pincushions', target: 4 },
]

/**
 * The canonical KNITTING shelves — the K-4 project-shape sub-categories
 * (`packages/db/scripts/seed-knitting-taxonomy.ts`), each with the
 * published-pattern target the catalogue is aiming for. Unlike crochet's
 * shelves, these are NOT the shared item-type vocabulary 1:1 — a knitting
 * shelf is a coarser grouping (`hat` covers beanies, slouchy hats, fitted
 * hats, bucket hats, berets, watchcaps and earflap hats together), so the
 * slugs here are the live SubCategory slugs, not item-type slugs.
 *
 * DEMAND-WEIGHTED, not even. Sweaters/cardigans and socks are what knitters
 * knit most (and what a hand-knit is prized for over a crocheted or sewn
 * equivalent), so they carry the biggest numbers; vests are a niche shape in
 * knitting, so they carry the smallest. `dishcloths-homewares` carries a real
 * target rather than sitting out with the other legacy catch-alls: flat
 * pieces are what the loom renders first, so it is knitting's launch shelf.
 * The sum is the category target (800 — a FLOOR for now, per the same
 * originals-dominant logic as cross-stitch and crochet).
 *
 * `stitches` and `foundations` (content-type, not project-shape) and the
 * still-open legacy catch-alls `baby` and `garments` are deliberately
 * excluded — Rebecca decides those.
 */
export const KNITTING_SHELVES: ShelfTarget[] = [
  { slug: 'sweater-cardigan', name: 'Sweaters & Cardigans', target: 160 },
  { slug: 'sock', name: 'Socks', target: 150 },
  { slug: 'blanket', name: 'Blankets', target: 120 },
  { slug: 'hat', name: 'Hats', target: 90 },
  { slug: 'dishcloths-homewares', name: 'Dishcloths & Homewares', target: 70 },
  { slug: 'shawl-wrap', name: 'Shawls & Wraps', target: 80 },
  { slug: 'scarf-cowl', name: 'Scarves & Cowls', target: 65 },
  { slug: 'mitt-glove', name: 'Mitts & Gloves', target: 35 },
  { slug: 'accessory-other', name: 'Accessories (other)', target: 20 },
  { slug: 'vest', name: 'Vests', target: 10 },
]

/** slug -> crochet shelf, for the publisher's allowed-shelf check. */
export const CROCHET_SHELF_BY_SLUG: Record<string, ShelfTarget> = Object.fromEntries(
  CROCHET_SHELVES.map((s) => [s.slug, s]),
)

/** slug -> knitting shelf, for the publisher's allowed-shelf check. */
export const KNITTING_SHELF_BY_SLUG: Record<string, ShelfTarget> = Object.fromEntries(
  KNITTING_SHELVES.map((s) => [s.slug, s]),
)

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
      christmas: ['scene', 'illustration'],
      coastal: ['scene', 'illustration', 'botanical'],
      'small-makes': ['illustration', 'botanical'],
      'folk-geometric': ['illustration', 'botanical', 'scene'],
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
    // DERIVED from the shelf targets above, exactly as cross-stitch is, so the
    // cron's stop point, the admin dashboard and the planner's shelf weighting
    // can never disagree about what "full" means. It is a FLOOR: crochet is
    // originals-dominant and expected to grow well past it (cross-stitch went
    // 500 → thousands). BULK_CROCHET_TARGET overrides it at runtime.
    patternTarget: sumTargets(CROCHET_SHELVES),
    shelfTargets: CROCHET_SHELVES,
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
  knitting: {
    slug: 'knitting',
    patternType: 'KNITTING_CHART',
    designerId: HOMEMADE_DESIGNER,
    // DERIVED from the shelf targets above, exactly as cross-stitch and crochet
    // are, so the cron's stop point, the admin dashboard and the planner's
    // shelf weighting can never disagree about what "full" means. 800 is a
    // FLOOR for now. BULK_KNITTING_TARGET overrides it at runtime.
    patternTarget: sumTargets(KNITTING_SHELVES),
    shelfTargets: KNITTING_SHELVES,
    subCategories: KNITTING_SHELVES.map((s) => s.slug),
    // Knitting does NOT use the cross-stitch Spec tiers. Left empty by design,
    // same as crochet, pending its own generation-tier decision.
    tierGuide: {},
  },
  // Future pattern-led categories (needlework, sewing) get their own entry
  // here after their sign-off pass agrees the look + sub-categories.
}

export function getPatternCategory(slug: string): PatternCategoryConfig | null {
  return PATTERN_CATEGORIES[slug] ?? null
}
