/**
 * Cross-craft tag facets for a pattern category page.
 *
 * The category filters surface the shared collection-tag axes — Occasion,
 * Season, Style, Subject, Audience — that the cross-craft taxonomy
 * (collection-vocabulary.ts) already tags every published pattern with. Facets
 * are DERIVED from the live CollectionTagAssignment rows, so an axis only shows
 * the terms that actually appear in this category, with real counts, and the
 * sidebar auto-fills as content is tagged. An axis with no assignments (e.g.
 * Audience on cross-stitch, which isn't sized for a wearer) simply doesn't
 * render.
 *
 * Two pattern surfaces feed the shared layout: cross-stitch lives on the
 * `Pattern` table (tagged CROSS_STITCH_PATTERN); crochet lives on
 * `CrochetPattern` (tagged CROCHET_PATTERN). Other crafts are added here as
 * their libraries come online.
 */

import { prisma } from '@homemade/db'
import {
  TAG_AXES,
  emptyTagFacets,
  type PatternTagAxis,
  type TagFacets,
} from './pattern-tag-axes'

export type { PatternTagAxis, TagFacets, TagFacetTerm } from './pattern-tag-axes'
export { TAG_AXES, TAG_AXIS_LABEL, TAG_AXIS_PARAM } from './pattern-tag-axes'

type TaggableType = 'CROSS_STITCH_PATTERN' | 'CROCHET_PATTERN'

interface FacetSource {
  taggableType: TaggableType
  table: 'Pattern' | 'CrochetPattern'
}

/** Which taggable type + base table a category's published patterns live on. */
const SOURCE_BY_SLUG: Record<string, FacetSource> = {
  'cross-stitch': { taggableType: 'CROSS_STITCH_PATTERN', table: 'Pattern' },
  crochet: { taggableType: 'CROCHET_PATTERN', table: 'CrochetPattern' },
}

export function tagSourceForCategory(slug: string): FacetSource | null {
  return SOURCE_BY_SLUG[slug] ?? null
}

/** Published, library-owned pattern ids in this category, for the given source. */
async function publishedPatternIds(
  source: FacetSource,
  categoryId: string,
): Promise<string[]> {
  const where = {
    ownerUserId: null,
    visibility: 'PUBLIC' as const,
    publishedAt: { not: null },
    subCategory: { categoryId },
  }
  const rows =
    source.table === 'Pattern'
      ? await prisma.pattern.findMany({ where, select: { id: true } })
      : await prisma.crochetPattern.findMany({ where, select: { id: true } })
  return rows.map((r) => r.id)
}

/**
 * Build the tag facets (axis → terms with counts) for a category, derived from
 * the assignments on its published patterns. Returns empty facets for crafts
 * whose library isn't on a tagged surface yet.
 */
export async function getPatternTagFacets(
  categorySlug: string,
  categoryId: string,
): Promise<TagFacets> {
  const source = tagSourceForCategory(categorySlug)
  if (!source) return emptyTagFacets()

  const ids = await publishedPatternIds(source, categoryId)
  if (ids.length === 0) return emptyTagFacets()

  const grouped = await prisma.collectionTagAssignment.groupBy({
    by: ['tagId'],
    where: { contentType: source.taggableType, contentId: { in: ids } },
    _count: { tagId: true },
  })
  if (grouped.length === 0) return emptyTagFacets()

  const countByTag = new Map(grouped.map((g) => [g.tagId, g._count.tagId]))
  const tags = await prisma.collectionTag.findMany({
    where: { id: { in: grouped.map((g) => g.tagId) } },
    select: { id: true, axis: true, slug: true, name: true, order: true },
  })

  const facets = emptyTagFacets()
  for (const t of tags) {
    const axis = t.axis as PatternTagAxis
    if (!facets[axis]) continue
    facets[axis].push({ slug: t.slug, name: t.name, count: countByTag.get(t.id) ?? 0 })
  }
  // Stable order: by vocabulary `order` already implied; sort by count desc then
  // name so the most-populated terms lead each axis.
  for (const axis of TAG_AXES) {
    facets[axis].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }
  return facets
}

/**
 * The set of pattern ids carrying ALL of the given tag slugs (AND across axes),
 * for use as an `id: { in: [...] }` constraint on the pattern query. Returns
 * null when no tags are selected (no constraint), or an empty array when a
 * selected tag matches nothing.
 */
export async function patternIdsForTags(
  categorySlug: string,
  slugs: string[],
): Promise<string[] | null> {
  const wanted = [...new Set(slugs.filter(Boolean))]
  if (wanted.length === 0) return null

  const source = tagSourceForCategory(categorySlug)
  if (!source) return []

  const tags = await prisma.collectionTag.findMany({
    where: { slug: { in: wanted } },
    select: { id: true },
  })
  if (tags.length < wanted.length) return [] // an unknown slug → no matches
  const tagIds = tags.map((t) => t.id)

  const rows = await prisma.collectionTagAssignment.findMany({
    where: { contentType: source.taggableType, tagId: { in: tagIds } },
    select: { contentId: true, tagId: true },
  })

  const seen = new Map<string, Set<string>>()
  for (const r of rows) {
    const set = seen.get(r.contentId) ?? new Set<string>()
    set.add(r.tagId)
    seen.set(r.contentId, set)
  }
  const out: string[] = []
  for (const [contentId, set] of seen) {
    if (set.size === tagIds.length) out.push(contentId)
  }
  return out
}
