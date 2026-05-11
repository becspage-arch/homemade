import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'

/**
 * Typesense collection schemas. Three collections power public search:
 *   - tutorials  → the bulk of search; only PUBLISHED tutorials are indexed
 *   - categories → category landing pages
 *   - glossary   → glossary terms, useful for direct term lookups
 *
 * Document shapes (the `*Doc` types) drive both indexing on the admin side
 * and result rendering on the public side, so they're exported alongside
 * the schemas.
 */

export const TUTORIALS_COLLECTION = 'tutorials'
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
  tagSlugs: string[]
  heroCloudflareId: string | null
  publishedAt: number | null
}

export interface CategoryDoc {
  id: string
  slug: string
  name: string
  description: string | null
}

export interface GlossaryDoc {
  id: string
  slug: string
  term: string
  definition: string
  categoryId: string | null
}

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
    { name: 'tagSlugs', type: 'string[]', facet: true, optional: true },
    { name: 'heroCloudflareId', type: 'string', optional: true, index: false },
    { name: 'publishedAt', type: 'int64', optional: true },
  ],
}

export const categorySchema: CollectionCreateSchema = {
  name: CATEGORIES_COLLECTION,
  enable_nested_fields: false,
  fields: [
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string', sort: true },
    { name: 'description', type: 'string', optional: true },
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
    // Pull inline text out of the custom blocks so info-panel titles etc. are searchable.
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
