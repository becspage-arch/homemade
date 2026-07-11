import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Re-export Prisma's generated types so consumers only import from @homemade/db
export * from '@prisma/client'

// R2 uploader for scripts that work this package directly.
export { r2Upload } from './r2'

// Cross-craft collection tagging service (phase_collection_taxonomy_001).
// The one place content is tagged against the controlled vocabulary; used by
// every publish path + the search-doc builders + the back-catalogue backfill.
export {
  resolveTags,
  setContentTags,
  addContentTags,
  removeAllContentTags,
  getContentTags,
  buildContentTagFacets,
  getTagFacetsForContents,
  deriveShelfTagSlug,
  type ContentRef,
  type ContentTagFacets,
  type ResolvedTags,
  type TagWriteResult,
} from './collection-tags'

// Cross-craft item-type vocabulary (phase_cross_craft_item_type_001). The
// controlled "what the object IS" dimension (cardigan / blanket / amigurumi);
// a craft's SubCategory home shelves draw their slugs from here so one search
// returns an item across every craft. Distinct from the Subject tag axis.
export {
  ITEM_TYPE_GROUPS,
  ITEM_TYPE_VOCABULARY,
  itemTypesForCraft,
  resolveItemTypeSlug,
  ensureCraftShelves,
  type ItemType,
  type ItemTypeCraft,
  type EnsureShelvesResult,
} from './item-types'

// Dish-type shelf service (phase_dish_type_001) — the food-category sibling of
// item-types: cooking/baking SubCategory home shelves draw their slugs from
// prisma/dish-type-vocabulary.ts. Cross-cutting collections reuse Tutorial.mood[]
// (DISH_COLLECTIONS); world cuisine reuses Tutorial.cuisine. No parallel taxonomy.
export {
  DISH_TYPE_GROUPS,
  DISH_TYPE_VOCABULARY,
  DISH_COLLECTIONS,
  dishTypesForCategory,
  resolveDishTypeSlug,
  ensureDishShelves,
  type DishType,
  type DishCategory,
  type DishCollection,
  type EnsureDishShelvesResult,
} from './dish-types'

// Category visibility helper — used by every publish path so a category
// flips to publicly visible the moment it crosses the threshold.
export {
  maybeFlipCategoryVisibility,
  PUBLIC_VISIBILITY_THRESHOLD,
} from './category-visibility'

// Category pipeline-status helper — flips a category's pipelineStatus to
// COMPLETE once its PUBLISHED count reaches targetTutorialCount. Paired
// with maybeFlipCategoryVisibility on every publish path.
export { maybeFlipCategoryPipelineComplete } from './category-pipeline-status'

// The single canonical Homemade house designer. Every publish path attaches
// house-original patterns through ensureHouseDesigner() so duplicate "Homemade"
// rows can't drift back into existence.
export { ensureHouseDesigner, HOUSE_DESIGNER_SLUG } from './house-designer'

// The single canonical Homemade system actor — owns audit entries for unattended
// jobs (cron bulk generation) that have no admin user behind them.
export { ensureSystemActor, SYSTEM_ACTOR_CLERK_ID } from './system-actor'

// Reverse-sweep helpers (phase_technique_linking_002). The Inngest function
// and the backfill script both call into `sweepForTechnique`; the pure
// matcher helpers ship alongside for unit-testing without a database.
export {
  buildSearchTerms,
  extractTextForSweep,
  bodyMentionsAnyTerm,
  sweepForTechnique,
  type TechniqueForSweep,
  type SweepResult,
} from './technique-sweep'

// Pattern Studio (phase_pattern_studio_001). Canonical pattern JSON
// schema, validator, metrics, skein estimator, cell-key encoding.
// Imported by the Studio app + photo-to-chart save path + tutorial
// chart migration script + library card grid.
export {
  SCHEMA_VERSION as PATTERN_SCHEMA_VERSION,
  PatternDataSchema,
  PatternGridSchema,
  PatternCellSchema,
  PaletteEntrySchema,
  BackstitchSegmentSchema,
  FrenchKnotSchema,
  BeadSchema,
  FabricSchema,
  PatternMetadataSchema,
  PatternTypeSchema,
  FlossBrandSchema,
  HexColourSchema,
  parsePatternData,
  computePatternMetrics,
  estimateSkeinCount,
  cellKey,
  parseCellKey,
  type PatternData,
  type PatternGrid,
  type PatternCell,
  type PaletteEntry,
  type BackstitchSegment,
  type FrenchKnot,
  type Bead,
  type Fabric,
  type PatternMetadata,
  type PatternTypeName,
  type FlossBrand as FlossBrandName,
  type PatternMetrics,
} from './pattern'

declare global {
  // eslint-disable-next-line no-var
  var __homemade_prisma: PrismaClient | undefined
}

let cached: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (cached) return cached
  if (globalThis.__homemade_prisma) {
    cached = globalThis.__homemade_prisma
    return cached
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Make sure the env var is configured before any Prisma operation.',
    )
  }

  const adapter = new PrismaPg({ connectionString })
  cached = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__homemade_prisma = cached
  }

  return cached
}

/**
 * Lazy-proxied Prisma client.
 *
 * The actual `PrismaClient` is only constructed on first property access. This
 * lets `apps/web` import `prisma` from `@homemade/db` during the build pass
 * (when Next.js collects page configs) without DATABASE_URL having to be set.
 * It also keeps the dev-mode singleton behaviour: in non-prod, the client is
 * cached on `globalThis` so HMR reloads don't exhaust the pool.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
