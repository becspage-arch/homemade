/**
 * Shared seed types for the master ingredient and tool lists.
 *
 * The Prisma schema stores `category`, `defaultUnit`, `allergenType`, `storage`
 * and `dietaryFlags` as free-form strings so authors can add new values without
 * a follow-up migration. These TypeScript literal unions document the values
 * we currently honour and give the seed scripts compile-time spelling checks.
 *
 * Source of truth at runtime is the strings themselves — adding a new category
 * is a matter of widening the union here and updating the seed data, no DB
 * change required.
 */

export type IngredientCategory =
  | 'flour'
  | 'dairy'
  | 'meat'
  | 'fish'
  | 'vegetable'
  | 'fruit'
  | 'herb'
  | 'spice'
  | 'condiment'
  | 'baking'
  | 'pulse'
  | 'grain'
  | 'nut'
  | 'seed'
  | 'oil'
  | 'sweetener'
  | 'alcohol'
  | 'other'

export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'each'
  | 'tbsp'
  | 'tsp'
  | 'cup'
  | 'pinch'
  | 'clove'
  | 'sprig'
  | 'leaf'
  | 'sheet'
  | 'slice'
  | 'bunch'
  | 'handful'

export type DietaryFlag =
  | 'vegetarian'
  | 'vegan'
  | 'glutenFree'
  | 'dairyFree'
  | 'nutFree'
  | 'halal'
  | 'kosher'

/**
 * UK 14 listed allergens. Kept as a literal union for spelling safety; the DB
 * column is a free-form string so future additions don't need a migration.
 */
export type AllergenType =
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'peanuts'
  | 'soybeans'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs'

export type StorageLocation = 'fridge' | 'freezer' | 'cupboard' | 'cool-dark'

export interface IngredientSeed {
  /** lower-kebab, unique across the master list */
  slug: string
  name: string
  /** Optional explicit plural; falls back to `name + s` at render time when null. */
  pluralName?: string
  category: IngredientCategory
  defaultUnit: IngredientUnit
  /** Per-ingredient flags; recipes AND-derive their own list at index time. */
  dietaryFlags: DietaryFlag[]
  /** Slugs of other entries in this list that work as a 1:1 substitute. */
  commonSubstitutes: string[]
  /** Other names — US/UK swaps, regional, brand-shorthand. */
  aliases: string[]
  /** UK/US naming notes, prep tips, sourcing hints. Null when nothing useful. */
  notes?: string
  /** Cupboard-mode flag — true for items a typical UK kitchen already has. */
  isStaple: boolean
  /** UK 14-allergen list membership. */
  isAllergen: boolean
  /** Which of the 14 — only set when `isAllergen` is true. */
  allergenType?: AllergenType
  /** Months when fresh-and-in-season, e.g. `['june', 'july', 'august']`. */
  seasonality?: string[]
  /** Typical shelf life in days under the recommended storage. */
  shelfLifeDays?: number
  storage?: StorageLocation
}

export type ToolCategory =
  | 'knife'
  | 'pan'
  | 'pot'
  | 'oven'
  | 'mixer'
  | 'processor'
  | 'measuring'
  | 'bowl'
  | 'tray'
  | 'tin'
  | 'board'
  | 'utensil'
  | 'appliance'
  | 'electrical'
  | 'thermometer'
  | 'scale'
  | 'other'

export interface ToolSeed {
  slug: string
  name: string
  /** Optional explicit plural for nouns that don't form a clean `name + s`. */
  pluralName?: string
  category: ToolCategory
  aliases: string[]
  /** False for fixtures that come with the kitchen (oven, sink, hob). */
  isPurchasable: boolean
  /** Typical price in pennies (GBP). Skip when uncertain. */
  typicalPriceGbp?: number
  /** Notes — sizing, what to look for, when nothing useful skip. */
  notes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// PlantVariety — Garden master entity. Free-form strings for category /
// sunRequirement / waterRequirement / soilType so authors can add values
// without a schema migration, with the literal unions below as a spelling
// gate at seed time.
// ─────────────────────────────────────────────────────────────────────────────

export type PlantCategory =
  | 'vegetable'
  | 'fruit'
  | 'herb'
  | 'flower'
  | 'shrub'
  | 'tree'
  | 'other'

export type SunRequirement = 'full-sun' | 'partial-shade' | 'shade'

export type WaterRequirement = 'low' | 'moderate' | 'high'

export type SoilType =
  | 'clay'
  | 'sandy'
  | 'loamy'
  | 'chalky'
  | 'well-drained'
  | 'boggy'

export type EdiblePart = 'fruit' | 'leaf' | 'root' | 'stem' | 'flower' | 'seed'

export interface PlantSeed {
  /** lower-kebab, unique across the master list. */
  slug: string
  /** Plain-English common name ("Tomato", "Rosemary"). */
  commonName: string
  /** Botanical binomial ("Solanum lycopersicum"). Optional. */
  latinBinomial?: string
  /**
   * Slug of the parent species when this row is a named variety
   * ("brandywine" → parent "tomato"). Must resolve against another entry in
   * this list. Null on species-level rows.
   */
  parentSpeciesSlug?: string
  category: PlantCategory
  /** RHS zones — H1a..H7. Array because plants tolerate a range. */
  rhsHardinessZone?: string[]
  /** USDA zones — '1'..'13' as strings. */
  usdaHardinessZone?: string[]
  sunRequirement?: SunRequirement
  waterRequirement?: WaterRequirement
  soilType?: SoilType[]
  daysToMaturity?: number
  seedingDepthCm?: number
  spacingCm?: number
  heightCm?: number
  edibleParts?: EdiblePart[]
  notes?: string
  /** Starter-plot flag — true for the most-grown UK garden subjects. */
  isStaple: boolean
  /** Perennial vs annual. */
  isPerennial: boolean
  /** Lower-case month names — when in season (sown / harvested / blooming). */
  seasonality?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Fabric — Sewing master entity. Same free-form-string-with-literal-union
// spelling-gate pattern as Ingredient + PlantVariety.
// ─────────────────────────────────────────────────────────────────────────────

export type FabricWeightCategory = 'light' | 'medium' | 'heavy' | 'upholstery'

export type FabricFibre =
  | 'cotton'
  | 'linen'
  | 'wool'
  | 'silk'
  | 'polyester'
  | 'nylon'
  | 'viscose'
  | 'acrylic'
  | 'hemp'
  | 'bamboo'
  | 'rayon'
  | 'jute'

export type FabricDrape = 'crisp' | 'flowing' | 'structured'

export type FabricCategory =
  | 'woven-natural'
  | 'woven-synthetic'
  | 'knit'
  | 'non-woven'
  | 'interfacing'
  | 'lining'
  | 'batting'
  | 'specialty'

/**
 * Project-shape tags a fabric is suitable for. Drive the "what could I make
 * from this fabric?" surface and the "what fabric should I buy?" sidebar on
 * PATTERN tutorials. Free-form, with the documented vocabulary below.
 */
export type FabricSuitability =
  | 'apron'
  | 'bag'
  | 'cushion'
  | 'curtain-light'
  | 'curtain-blackout'
  | 'curtain-lined'
  | 'quilt-top'
  | 'quilt-back'
  | 'quilt-batting'
  | 'clothing-light'
  | 'clothing-medium'
  | 'clothing-heavy'
  | 'soft-toy'
  | 'tablecloth'
  | 'tea-towel'
  | 'napkin'
  | 'pillowcase'
  | 'baby-light'
  | 'baby-medium'
  | 'mending-patch'
  | 'oven-mitt'
  | 'pot-holder'
  | 'reusable-kitchen'
  | 'eye-mask'
  | 'lining'
  | 'interfacing-fusible'
  | 'interfacing-sew-in'
  | 'upholstery'
  | 'rainwear'
  | 'cross-stitch'
  | 'needlepoint-canvas'
  | 'lace-ground'

export interface FabricSeed {
  /** lower-kebab slug, unique across the fabric master list. */
  slug: string
  /** Display name. UK terminology where the UK + US terms differ. */
  name: string
  weightCategory: FabricWeightCategory
  fibreContent: FabricFibre[]
  drape?: FabricDrape
  /** Grams per square metre. Optional. */
  gsm?: number
  /** Project shapes the fabric suits. */
  suitableFor: FabricSuitability[]
  /** High-level browse category. Optional. */
  category?: FabricCategory
  /** UK sourcing + handling notes. Null when nothing useful. */
  notes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SewingNotion — Sewing master haberdashery reference. Slug-keyed; same
// free-form-string-with-literal-union pattern.
// ─────────────────────────────────────────────────────────────────────────────

export type SewingNotionCategory =
  | 'closure'
  | 'interfacing'
  | 'thread'
  | 'binding'
  | 'elastic'
  | 'stuffing'
  | 'trim'
  | 'fastener'
  | 'cord'
  | 'lining'

export interface SewingNotionSeed {
  slug: string
  name: string
  category: SewingNotionCategory
  notes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ClayBody — Pottery & ceramics master clay-body registry.
// CraftMaterial — Pottery & ceramics master raw-materials registry (also
// reusable across future jewellery / paper / wood-finishing pipelines).
// Same free-form-string-with-literal-union spelling-gate pattern as the
// Sewing tables.
// ─────────────────────────────────────────────────────────────────────────────

export type ClayBodyType =
  | 'earthenware'
  | 'stoneware'
  | 'porcelain'
  | 'paper-clay'
  | 'polymer'
  | 'air-dry'
  | 'raku'
  | 'terracotta'

export interface ClayBodySeed {
  /** lower-kebab slug, unique across the clay-body master list. */
  slug: string
  /** Display name. UK terminology. */
  name: string
  bodyType: ClayBodyType
  /** Cone range ("06-04", "6", "9-10"). Null on no-fire bodies. */
  firingRangeCones?: string
  /** True when a kiln is required to vitrify the body. */
  requiresKiln: boolean
  /** Shrinkage range ("12-14%"). Null on no-fire bodies. */
  shrinkagePercent?: string
  /** Plasticity / hand-building / wheel notes. */
  notes?: string
}

export type CraftMaterialCraft =
  | 'pottery'
  | 'jewellery'
  | 'paper'
  | 'wood-finishing'

export type PotteryMaterialCategory =
  | 'clay-tool-attached'
  | 'glaze-raw'
  | 'glaze-colourant'
  | 'glaze-premixed'
  | 'underglaze'
  | 'kiln-furniture'

export interface CraftMaterialSeed {
  /** lower-kebab slug, unique across the craft-material master list. */
  slug: string
  /** Display name. UK terminology. */
  name: string
  craft: CraftMaterialCraft
  /** Sub-category within the craft. */
  category: string
  /**
   * True for raw silica, heavy-metal oxides at studio quantity, and any
   * material requiring respirator + dedicated mixing space. The upload
   * script refuses no-equipment-track tutorials referencing rows where
   * this is true.
   */
  trainedEnvironmentOnly: boolean
  /** Hazard summary surfaced verbatim by the renderer. Null when none. */
  hazardNotes?: string
  /** Sourcing / handling / typical-use notes. */
  notes?: string
}
