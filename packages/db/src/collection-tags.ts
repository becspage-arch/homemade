/**
 * Cross-craft collection tagging service (phase_collection_taxonomy_001).
 *
 * The one place content gets tagged against the controlled vocabulary
 * (CollectionTag). Every publish path — tutorial transition, pattern publish,
 * generation born-tagging, the back-catalogue backfill — goes through here so
 * the rules hold everywhere:
 *
 *  - inputs are resolved against the vocabulary (slug OR alias); UNKNOWN inputs
 *    are returned to the caller, never silently created (controlled vocab).
 *  - assignments are polymorphic: (contentType, contentId) addresses a row in
 *    any of the taggable models without those models needing a relation.
 *
 * Used by both the web app and packages/db scripts via the shared `prisma`.
 */

import type {
  CollectionAxis,
  CollectionTag,
  CollectionTagSource,
  TaggableType,
} from '@prisma/client'
import { prisma } from './index'

export interface ContentRef {
  type: TaggableType
  id: string
}

export interface ContentTagFacets {
  occasionSlugs: string[]
  seasonSlugs: string[]
  styleSlugs: string[]
  subjectSlugs: string[]
  audienceSlugs: string[]
  /** every assigned slug, any axis — for an "any theme" match. */
  allSlugs: string[]
  /** names + slugs + aliases joined, so a search for "xmas"/"fall" hits. */
  collectionText: string
}

export interface ResolvedTags {
  matched: Array<Pick<CollectionTag, 'id' | 'slug' | 'axis'>>
  /** normalised inputs that matched no slug or alias — flag, do not create. */
  unknown: string[]
}

export interface TagWriteResult {
  applied: string[]
  unknown: string[]
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

/**
 * Resolve free inputs (slugs or aliases, any case) to canonical vocabulary
 * terms. Unmatched inputs come back in `unknown` so callers can flag them.
 */
export async function resolveTags(inputs: string[]): Promise<ResolvedTags> {
  const wanted = [...new Set(inputs.map(norm).filter(Boolean))]
  if (wanted.length === 0) return { matched: [], unknown: [] }

  const rows = await prisma.collectionTag.findMany({
    where: { OR: [{ slug: { in: wanted } }, { aliases: { hasSome: wanted } }] },
    select: { id: true, slug: true, axis: true, aliases: true },
  })

  const matched: Array<Pick<CollectionTag, 'id' | 'slug' | 'axis'>> = []
  const unknown: string[] = []
  for (const w of wanted) {
    const row = rows.find((r) => r.slug === w || r.aliases.map(norm).includes(w))
    if (row) {
      if (!matched.some((m) => m.id === row.id)) {
        matched.push({ id: row.id, slug: row.slug, axis: row.axis })
      }
    } else {
      unknown.push(w)
    }
  }
  return { matched, unknown }
}

/**
 * Replace ALL of a content item's tags with the resolved set. Idempotent.
 * Returns the applied canonical slugs + any unknown inputs (for QC).
 */
export async function setContentTags(
  ref: ContentRef,
  inputs: string[],
  source: CollectionTagSource = 'AUTHORED',
): Promise<TagWriteResult> {
  const { matched, unknown } = await resolveTags(inputs)
  await prisma.$transaction([
    prisma.collectionTagAssignment.deleteMany({
      where: { contentType: ref.type, contentId: ref.id },
    }),
    prisma.collectionTagAssignment.createMany({
      data: matched.map((m) => ({
        tagId: m.id,
        contentType: ref.type,
        contentId: ref.id,
        source,
      })),
      skipDuplicates: true,
    }),
  ])
  return { applied: matched.map((m) => m.slug), unknown }
}

/** Add tags without removing existing ones (e.g. shelf-derived on top of authored). */
export async function addContentTags(
  ref: ContentRef,
  inputs: string[],
  source: CollectionTagSource = 'AUTHORED',
): Promise<TagWriteResult> {
  const { matched, unknown } = await resolveTags(inputs)
  if (matched.length) {
    await prisma.collectionTagAssignment.createMany({
      data: matched.map((m) => ({
        tagId: m.id,
        contentType: ref.type,
        contentId: ref.id,
        source,
      })),
      skipDuplicates: true,
    })
  }
  return { applied: matched.map((m) => m.slug), unknown }
}

/** Remove every tag from a content item (e.g. on unpublish/delete sweep). */
export async function removeAllContentTags(ref: ContentRef): Promise<number> {
  const r = await prisma.collectionTagAssignment.deleteMany({
    where: { contentType: ref.type, contentId: ref.id },
  })
  return r.count
}

/** Full CollectionTag rows assigned to a content item. */
export async function getContentTags(ref: ContentRef): Promise<CollectionTag[]> {
  const rows = await prisma.collectionTagAssignment.findMany({
    where: { contentType: ref.type, contentId: ref.id },
    include: { tag: true },
    orderBy: { tag: { order: 'asc' } },
  })
  return rows.map((r) => r.tag)
}

function facetsFromTags(tags: CollectionTag[]): ContentTagFacets {
  const byAxis = (ax: CollectionAxis) => tags.filter((t) => t.axis === ax).map((t) => t.slug)
  const collectionText = [
    ...new Set(tags.flatMap((t) => [t.name, t.slug, ...t.aliases])),
  ].join(' ')
  return {
    occasionSlugs: byAxis('OCCASION'),
    seasonSlugs: byAxis('SEASON'),
    styleSlugs: byAxis('STYLE'),
    subjectSlugs: byAxis('SUBJECT'),
    audienceSlugs: byAxis('AUDIENCE'),
    allSlugs: tags.map((t) => t.slug),
    collectionText,
  }
}

/** Search-doc facets for one content item. */
export async function buildContentTagFacets(ref: ContentRef): Promise<ContentTagFacets> {
  return facetsFromTags(await getContentTags(ref))
}

/**
 * Batched facets for many items of one type — avoids N+1 when (re)building the
 * search index or running the backfill.
 */
export async function getTagFacetsForContents(
  type: TaggableType,
  ids: string[],
): Promise<Map<string, ContentTagFacets>> {
  const out = new Map<string, ContentTagFacets>()
  if (ids.length === 0) return out
  const assignments = await prisma.collectionTagAssignment.findMany({
    where: { contentType: type, contentId: { in: ids } },
    include: { tag: true },
  })
  const byContent = new Map<string, CollectionTag[]>()
  for (const a of assignments) {
    const arr = byContent.get(a.contentId) ?? []
    arr.push(a.tag)
    byContent.set(a.contentId, arr)
  }
  for (const id of ids) out.set(id, facetsFromTags(byContent.get(id) ?? []))
  return out
}

/**
 * Derive the cross-craft tag a themed "home shelf" (sub-category) implies, so
 * shelf and tag can't drift. Returns the canonical slug if the sub-category
 * slug maps onto a vocabulary term (by slug or alias), else null.
 */
export async function deriveShelfTagSlug(subCategorySlug: string): Promise<string | null> {
  const { matched } = await resolveTags([subCategorySlug])
  return matched[0]?.slug ?? null
}
