import { createRequire } from 'node:module'
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

/**
 * The crochet pattern completeness gate — the binary check between a generated
 * candidate and the live catalogue. Pure, so a Studio save path can reuse it.
 */
export {
  checkCrochetPatternCompleteness,
  abbreviationsIn,
  CROCHET_TOY_SHELVES,
  CROCHET_UK_ABBREVIATIONS,
  type CrochetCompletenessInput,
  type CrochetCompletenessResult,
  type CrochetPieceRow,
  type CrochetStructuredRow,
} from './crochet-completeness'

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
  FractionalStitchSchema,
  CellQuadrantSchema,
  BeadSchema,
  FabricSchema,
  PatternMetadataSchema,
  PatternTypeSchema,
  FlossBrandSchema,
  HexColourSchema,
  parsePatternData,
  computePatternMetrics,
  computeStitchabilityMetrics,
  stitchabilityIndex,
  stitchabilityBand,
  stitchabilityLabel,
  STITCHABILITY_BANDS,
  estimateSkeinCount,
  cellKey,
  parseCellKey,
  type PatternData,
  type PatternGrid,
  type PatternCell,
  type PaletteEntry,
  type BackstitchSegment,
  type FrenchKnot,
  type FractionalStitch,
  type CellQuadrant,
  type Bead,
  type Fabric,
  type PatternMetadata,
  type PatternTypeName,
  type FlossBrand as FlossBrandName,
  type PatternMetrics,
  type StitchabilityMetrics,
} from './pattern'

declare global {
  // eslint-disable-next-line no-var
  var __homemade_prisma: PrismaClient | undefined
}

let cached: PrismaClient | undefined

/**
 * Pick the driver adapter for this environment.
 *
 * Everywhere that can open a plain TCP socket to Postgres — local development,
 * the ECS task, GitHub Actions — this is the `pg` adapter, unchanged. A cloud
 * session can only leave its VM through an HTTP CONNECT proxy, which port 5432
 * cannot traverse, so it opts in with PG_VIA_HTTPS_PROXY=1 and talks to the same
 * database over Neon's WebSocket driver instead. See ./neon-proxy-client.ts.
 *
 * The Neon branch is `require`d rather than imported so its packages stay out of
 * the Next.js server bundle and off the production import graph entirely.
 */
function createAdapter(connectionString: string): PrismaPg {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy
  if (process.env.PG_VIA_HTTPS_PROXY === '1' && proxyUrl) {
    const requireFromHere = createRequire(import.meta.url)
    const { createNeonProxyAdapter } = requireFromHere(
      './neon-proxy-client',
    ) as typeof import('./neon-proxy-client')
    // Both are Prisma SqlDriverAdapterFactory implementations; PrismaClient
    // only ever sees the interface.
    return createNeonProxyAdapter(connectionString, proxyUrl) as unknown as PrismaPg
  }
  return new PrismaPg({ connectionString })
}

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

  const adapter = createAdapter(connectionString)
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
