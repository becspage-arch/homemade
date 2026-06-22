import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'

/**
 * Typesense collection schemas. Five collections power public search:
 *   - tutorials       → recipes / techniques / practices / growing-guides
 *   - patterns        → cross-stitch + knitting-chart + crochet-chart Patterns
 *   - crochet_patterns → row-by-row crochet patterns (sibling family)
 *   - categories      → category landing pages
 *   - glossary        → glossary terms, useful for direct term lookups
 *
 * Document shapes (the `*Doc` types) drive both indexing on the admin side
 * and result rendering on the public side, so they're exported alongside
 * the schemas.
 */

export const TUTORIALS_COLLECTION = 'tutorials'
export const PATTERNS_COLLECTION = 'patterns'
export const CROCHET_PATTERNS_COLLECTION = 'crochet_patterns'
export const CATEGORIES_COLLECTION = 'categories'
export const GLOSSARY_COLLECTION = 'glossary'

export interface TutorialDoc {
  id: string
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  bodyText: string
  categoryId: string
  categorySlug: string
  categoryName: string
  subCategorySlug: string | null
  subCategoryName: string | null
  difficulty: string
  season: string | null
  timeMinutes: number | null
  totalMinutes: number | null
  tagSlugs: string[]
  heroCloudflareId: string | null
  heroR2Key: string | null
  publishedAt: number | null
  // Extended facets (Worker 1, category-landing-rethink) — every field that
  // the archetype-aware landings filter on. All optional; null on rows that
  // never set them.
  type: string | null
  mealType: string | null
  cuisine: string | null
  dietaryFlags: string[]
  mood: string[]
  practiceType: string | null
  practiceTargets: string[]
  timeBand: string | null
  bestTime: string | null
  practiceDepth: string | null
  plantingMonths: string[]
  harvestMonths: string[]
  containerFriendly: boolean | null
  indoorFriendly: boolean | null
  regionsApplicable: string[]
  foundational: boolean
  // Cross-craft collection tags (phase_collection_taxonomy_001) — the shared
  // theme/style facets that span every category.
  occasionSlugs: string[]
  seasonSlugs: string[]
  styleSlugs: string[]
  subjectSlugs: string[]
  collectionText: string
}

export interface PatternDoc {
  id: string
  slug: string | null
  name: string
  description: string | null
  type: string
  categorySlug: string
  subCategorySlug: string | null
  subCategoryName: string | null
  designerSlug: string | null
  designerName: string | null
  difficulty: string | null
  widthCells: number
  heightCells: number
  colourCount: number
  totalStitches: number
  estimatedHours: number | null
  hasBackstitch: boolean
  hasFrenchKnots: boolean
  hasBeads: boolean
  hasQuarterStitches: boolean
  fabricCountSuggested: number
  premium: boolean
  heroCloudflareId: string | null
  heroR2Key: string | null
  thumbnailCloudflareId: string | null
  thumbnailR2Key: string | null
  publishedAt: number | null
  // Cross-craft collection tags (phase_collection_taxonomy_001).
  occasionSlugs: string[]
  seasonSlugs: string[]
  styleSlugs: string[]
  subjectSlugs: string[]
  collectionText: string
}

export interface CrochetPatternDoc {
  id: string
  slug: string | null
  name: string
  description: string | null
  categorySlug: string
  subCategorySlug: string | null
  subCategoryName: string | null
  designerSlug: string | null
  designerName: string | null
  difficulty: string | null
  estimatedHours: number | null
  shape: string | null
  construction: string | null
  primaryStitches: string[]
  yarnWeight: string | null
  hookSizeMm: number | null
  hasMultipleSizes: boolean
  terminology: string | null
  premium: boolean
  heroCloudflareId: string | null
  heroR2Key: string | null
  publishedAt: number | null
  // Cross-craft collection tags (phase_collection_taxonomy_001).
  occasionSlugs: string[]
  seasonSlugs: string[]
  styleSlugs: string[]
  subjectSlugs: string[]
  collectionText: string
}

export interface CategoryDoc {
  id: string
  slug: string
  name: string
  description: string | null
  archetype: string
}

export interface GlossaryDoc {
  id: string
  slug: string
  term: string
  definition: string
  categoryId: string | null
}

/**
 * Cross-craft collection-tag facet fields (phase_collection_taxonomy_001),
 * shared by every content collection so a theme/style query works the same way
 * across tutorials and all pattern families. `collectionText` is searchable
 * (so alias queries like "xmas" hit) but not a facet. Exported so the
 * field-add migration can apply the same fields to existing collections.
 */
export const COLLECTION_TAG_FIELDS: CollectionCreateSchema['fields'] = [
  { name: 'occasionSlugs', type: 'string[]', facet: true, optional: true },
  { name: 'seasonSlugs', type: 'string[]', facet: true, optional: true },
  { name: 'styleSlugs', type: 'string[]', facet: true, optional: true },
  { name: 'subjectSlugs', type: 'string[]', facet: true, optional: true },
  { name: 'collectionText', type: 'string', optional: true },
]

export const tutorialSchema: CollectionCreateSchema = {
  name: TUTORIALS_COLLECTION,
  default_sorting_field: 'publishedAt',
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string' },
    { name: 'title', type: 'string', sort: true },
    { name: 'subtitle', type: 'string', optional: true },
    { name: 'excerpt', type: 'string', optional: true },
    { name: 'bodyText', type: 'string' },
    { name: 'categoryId', type: 'string', facet: true },
    { name: 'categorySlug', type: 'string', facet: true },
    { name: 'categoryName', type: 'string', facet: true },
    { name: 'subCategorySlug', type: 'string', optional: true, facet: true },
    { name: 'subCategoryName', type: 'string', optional: true, facet: true },
    { name: 'difficulty', type: 'string', facet: true },
    { name: 'season', type: 'string', optional: true, facet: true },
    { name: 'timeMinutes', type: 'int32', optional: true },
    { name: 'totalMinutes', type: 'int32', optional: true },
    { name: 'tagSlugs', type: 'string[]', facet: true, optional: true },
    { name: 'heroCloudflareId', type: 'string', optional: true, index: false },
    { name: 'heroR2Key', type: 'string', optional: true, index: false },
    { name: 'publishedAt', type: 'int64' },
    { name: 'type', type: 'string', optional: true, facet: true },
    { name: 'mealType', type: 'string', optional: true, facet: true },
    { name: 'cuisine', type: 'string', optional: true, facet: true },
    { name: 'dietaryFlags', type: 'string[]', facet: true, optional: true },
    { name: 'mood', type: 'string[]', facet: true, optional: true },
    { name: 'practiceType', type: 'string', optional: true, facet: true },
    { name: 'practiceTargets', type: 'string[]', facet: true, optional: true },
    { name: 'timeBand', type: 'string', optional: true, facet: true },
    { name: 'bestTime', type: 'string', optional: true, facet: true },
    { name: 'practiceDepth', type: 'string', optional: true, facet: true },
    { name: 'plantingMonths', type: 'string[]', facet: true, optional: true },
    { name: 'harvestMonths', type: 'string[]', facet: true, optional: true },
    { name: 'containerFriendly', type: 'bool', optional: true, facet: true },
    { name: 'indoorFriendly', type: 'bool', optional: true, facet: true },
    { name: 'regionsApplicable', type: 'string[]', facet: true, optional: true },
    { name: 'foundational', type: 'bool', facet: true, optional: true },
    ...COLLECTION_TAG_FIELDS,
  ],
}

export const patternSchema: CollectionCreateSchema = {
  name: PATTERNS_COLLECTION,
  default_sorting_field: 'publishedAt',
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string', optional: true },
    { name: 'name', type: 'string', sort: true },
    { name: 'description', type: 'string', optional: true },
    { name: 'type', type: 'string', facet: true },
    { name: 'categorySlug', type: 'string', facet: true },
    { name: 'subCategorySlug', type: 'string', optional: true, facet: true },
    { name: 'subCategoryName', type: 'string', optional: true, facet: true },
    { name: 'designerSlug', type: 'string', optional: true, facet: true },
    { name: 'designerName', type: 'string', optional: true, facet: true },
    { name: 'difficulty', type: 'string', optional: true, facet: true },
    { name: 'widthCells', type: 'int32', sort: true },
    { name: 'heightCells', type: 'int32', sort: true },
    { name: 'colourCount', type: 'int32', sort: true },
    { name: 'totalStitches', type: 'int32', sort: true },
    { name: 'estimatedHours', type: 'int32', optional: true, sort: true },
    { name: 'hasBackstitch', type: 'bool', facet: true },
    { name: 'hasFrenchKnots', type: 'bool', facet: true },
    { name: 'hasBeads', type: 'bool', facet: true },
    { name: 'hasQuarterStitches', type: 'bool', facet: true },
    { name: 'fabricCountSuggested', type: 'int32' },
    { name: 'premium', type: 'bool', facet: true },
    { name: 'heroCloudflareId', type: 'string', optional: true, index: false },
    { name: 'heroR2Key', type: 'string', optional: true, index: false },
    { name: 'thumbnailCloudflareId', type: 'string', optional: true, index: false },
    { name: 'thumbnailR2Key', type: 'string', optional: true, index: false },
    { name: 'publishedAt', type: 'int64' },
    ...COLLECTION_TAG_FIELDS,
  ],
}

export const crochetPatternSchema: CollectionCreateSchema = {
  name: CROCHET_PATTERNS_COLLECTION,
  default_sorting_field: 'publishedAt',
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string', optional: true },
    { name: 'name', type: 'string', sort: true },
    { name: 'description', type: 'string', optional: true },
    { name: 'categorySlug', type: 'string', facet: true },
    { name: 'subCategorySlug', type: 'string', optional: true, facet: true },
    { name: 'subCategoryName', type: 'string', optional: true, facet: true },
    { name: 'designerSlug', type: 'string', optional: true, facet: true },
    { name: 'designerName', type: 'string', optional: true, facet: true },
    { name: 'difficulty', type: 'string', optional: true, facet: true },
    { name: 'estimatedHours', type: 'int32', optional: true, sort: true },
    { name: 'shape', type: 'string', optional: true, facet: true },
    { name: 'construction', type: 'string', optional: true, facet: true },
    { name: 'primaryStitches', type: 'string[]', facet: true, optional: true },
    { name: 'yarnWeight', type: 'string', optional: true, facet: true },
    { name: 'hookSizeMm', type: 'float', optional: true, facet: true },
    { name: 'hasMultipleSizes', type: 'bool', facet: true },
    { name: 'terminology', type: 'string', optional: true, facet: true },
    { name: 'premium', type: 'bool', facet: true },
    { name: 'heroCloudflareId', type: 'string', optional: true, index: false },
    { name: 'heroR2Key', type: 'string', optional: true, index: false },
    { name: 'publishedAt', type: 'int64' },
    ...COLLECTION_TAG_FIELDS,
  ],
}

export const categorySchema: CollectionCreateSchema = {
  name: CATEGORIES_COLLECTION,
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string', sort: true },
    { name: 'description', type: 'string', optional: true },
    { name: 'archetype', type: 'string', facet: true },
  ],
}

export const glossarySchema: CollectionCreateSchema = {
  name: GLOSSARY_COLLECTION,
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string' },
    { name: 'term', type: 'string', sort: true },
    { name: 'definition', type: 'string' },
    { name: 'categoryId', type: 'string', optional: true, facet: true },
  ],
}

export const ALL_SCHEMAS: CollectionCreateSchema[] = [
  tutorialSchema,
  patternSchema,
  crochetPatternSchema,
  categorySchema,
  glossarySchema,
]

/**
 * Flatten a TipTap document to a single plain-text string for full-text search.
 * Walks recursively and emits text nodes plus the inline text we keep on
 * custom-block attrs (e.g. info-panel title/body, supplies-card items).
 */
export function extractBodyText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return ''
  const out: string[] = []
  walk(doc as TipTapNodeLike, out)
  return out.join(' ').replace(/\s+/g, ' ').trim()
}

interface TipTapNodeLike {
  type?: string
  text?: string
  attrs?: Record<string, unknown> | null
  content?: TipTapNodeLike[]
}

function walk(node: TipTapNodeLike, out: string[]): void {
  if (!node || typeof node !== 'object') return
  if (typeof node.text === 'string') out.push(node.text)

  const attrs = node.attrs
  if (attrs && typeof attrs === 'object') {
    for (const key of ['title', 'body', 'heading', 'quote', 'attribution', 'description'] as const) {
      const value = (attrs as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim()) out.push(value)
    }
    const items = (attrs as Record<string, unknown>).items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && typeof item === 'object') {
          for (const v of Object.values(item as Record<string, unknown>)) {
            if (typeof v === 'string' && v.trim()) out.push(v)
          }
        }
      }
    }
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) walk(child, out)
  }
}
