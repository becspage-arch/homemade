/**
 * Single source of truth for turning a Prisma row into a Typesense search
 * document (phase_collection_taxonomy_001 cleanup).
 *
 * Before this module the row→doc mapping was copy-pasted in THREE places — the
 * runtime sync (apps/web search-sync), the backfill script, and the inngest
 * reindex function — and adding a field to a Doc broke whichever copy was
 * missed (it broke the build once). Everything now builds docs here, so a
 * field addition is a one-place change.
 *
 * Exposed as the `@homemade/db/search-docs` subpath (not the main barrel) so the
 * Typesense client this pulls in via `@homemade/search` never leaks into the
 * general `@homemade/db` import graph.
 *
 * Each content type offers:
 *   - buildXDoc(id)      → one doc (or null), for the runtime per-row sync.
 *   - loadAllXDocs()     → every indexable doc, for a full (re)build.
 */

import { TutorialStatus, Visibility } from '@prisma/client'
import { extractBodyText } from '@homemade/search'
import type {
  CategoryDoc,
  CrochetPatternDoc,
  GlossaryDoc,
  PatternDoc,
  TutorialDoc,
} from '@homemade/search'
import { prisma } from './index'
import {
  buildContentTagFacets,
  getTagFacetsForContents,
  type ContentTagFacets,
} from './collection-tags'

/** The collection-tag facet fields every content doc carries (defaults empty). */
function docTagFields(f: ContentTagFacets | undefined): Pick<
  TutorialDoc,
  'occasionSlugs' | 'seasonSlugs' | 'styleSlugs' | 'subjectSlugs' | 'audienceSlugs' | 'collectionText'
> {
  return {
    occasionSlugs: f?.occasionSlugs ?? [],
    seasonSlugs: f?.seasonSlugs ?? [],
    styleSlugs: f?.styleSlugs ?? [],
    subjectSlugs: f?.subjectSlugs ?? [],
    audienceSlugs: f?.audienceSlugs ?? [],
    collectionText: f?.collectionText ?? '',
  }
}

// ── Tutorials ─────────────────────────────────────────────────────────────────

function fetchTutorialRows(where: Record<string, unknown>) {
  return prisma.tutorial.findMany({
    where,
    include: {
      category: { select: { slug: true, name: true } },
      subCategory: { select: { slug: true, name: true } },
      tags: { select: { slug: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
}
type TutorialRow = Awaited<ReturnType<typeof fetchTutorialRows>>[number]

function tutorialRowToDoc(t: TutorialRow, facets: ContentTagFacets | undefined): TutorialDoc {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    excerpt: t.excerpt,
    bodyText: extractBodyText(t.body),
    categoryId: t.categoryId,
    categorySlug: t.category.slug,
    categoryName: t.category.name,
    subCategorySlug: t.subCategory?.slug ?? null,
    subCategoryName: t.subCategory?.name ?? null,
    difficulty: t.difficulty,
    season: t.season,
    timeMinutes: t.timeMinutes,
    totalMinutes: t.totalMinutes,
    tagSlugs: t.tags.map((tag) => tag.slug),
    heroCloudflareId: t.hero?.cloudflareId ?? null,
    heroR2Key: t.hero?.r2Key ?? null,
    publishedAt: t.publishedAt ? t.publishedAt.getTime() : null,
    type: t.type,
    mealType: t.mealType,
    cuisine: t.cuisine,
    dietaryFlags: t.dietaryFlags,
    mood: t.mood,
    practiceType: t.practiceType,
    practiceTargets: t.practiceTargets,
    timeBand: t.timeBand,
    bestTime: t.bestTime,
    practiceDepth: t.practiceDepth,
    plantingMonths: t.plantingMonths,
    harvestMonths: t.harvestMonths,
    containerFriendly: t.containerFriendly,
    indoorFriendly: t.indoorFriendly,
    regionsApplicable: t.regionsApplicable,
    foundational: t.foundational,
    ...docTagFields(facets),
  }
}

export async function buildTutorialDoc(id: string): Promise<TutorialDoc | null> {
  const [t] = await fetchTutorialRows({ id })
  if (!t) return null
  return tutorialRowToDoc(t, await buildContentTagFacets({ type: 'TUTORIAL', id }))
}

export async function loadAllTutorialDocs(): Promise<TutorialDoc[]> {
  const rows = await fetchTutorialRows({ status: TutorialStatus.PUBLISHED })
  const facets = await getTagFacetsForContents('TUTORIAL', rows.map((r) => r.id))
  return rows.map((r) => tutorialRowToDoc(r, facets.get(r.id)))
}

// ── Patterns (cross-stitch / chart) ───────────────────────────────────────────

/**
 * SELECT, never INCLUDE. `include` returns every scalar column of Pattern —
 * including `data`, the full stitch-by-stitch chart JSON, which runs to
 * hundreds of kilobytes a row. The full reindex loads every published pattern
 * at once, so an `include` here meant carrying the whole catalogue's chart data
 * through a memory-tight container to build documents that use none of it. It
 * OOM-killed the reindex (HTTP 502 on the pattern import step). This list is
 * exactly what `patternRowToDoc` reads and nothing else.
 */
function fetchPatternRows(where: Record<string, unknown>) {
  return prisma.pattern.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      type: true,
      difficulty: true,
      widthCells: true,
      heightCells: true,
      colourCount: true,
      totalStitches: true,
      estimatedHours: true,
      hasBackstitch: true,
      hasFrenchKnots: true,
      hasBeads: true,
      hasQuarterStitches: true,
      fabricCountSuggested: true,
      premium: true,
      publishedAt: true,
      designer: { select: { slug: true, displayName: true } },
      subCategory: { select: { slug: true, name: true, category: { select: { slug: true } } } },
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })
}
type PatternRow = Awaited<ReturnType<typeof fetchPatternRows>>[number]

function patternRowToDoc(p: PatternRow, facets: ContentTagFacets | undefined): PatternDoc | null {
  if (!p.subCategory) return null
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    type: p.type,
    categorySlug: p.subCategory.category.slug,
    subCategorySlug: p.subCategory.slug,
    subCategoryName: p.subCategory.name,
    designerSlug: p.designer?.slug ?? null,
    designerName: p.designer?.displayName ?? null,
    difficulty: p.difficulty,
    widthCells: p.widthCells,
    heightCells: p.heightCells,
    colourCount: p.colourCount,
    totalStitches: p.totalStitches,
    estimatedHours: p.estimatedHours,
    hasBackstitch: p.hasBackstitch,
    hasFrenchKnots: p.hasFrenchKnots,
    hasBeads: p.hasBeads,
    hasQuarterStitches: p.hasQuarterStitches,
    fabricCountSuggested: p.fabricCountSuggested,
    premium: p.premium,
    heroCloudflareId: p.hero?.cloudflareId ?? null,
    heroR2Key: p.hero?.r2Key ?? null,
    thumbnailCloudflareId: p.thumbnail?.cloudflareId ?? null,
    thumbnailR2Key: p.thumbnail?.r2Key ?? null,
    publishedAt: p.publishedAt ? p.publishedAt.getTime() : null,
    ...docTagFields(facets),
  }
}

export async function buildPatternDoc(id: string): Promise<PatternDoc | null> {
  const [p] = await fetchPatternRows({ id })
  if (!p) return null
  return patternRowToDoc(p, await buildContentTagFacets({ type: 'CROSS_STITCH_PATTERN', id }))
}

export async function loadAllPatternDocs(): Promise<PatternDoc[]> {
  const rows = await fetchPatternRows({
    ownerUserId: null,
    visibility: Visibility.PUBLIC,
    publishedAt: { not: null },
    subCategoryId: { not: null },
  })
  const facets = await getTagFacetsForContents('CROSS_STITCH_PATTERN', rows.map((r) => r.id))
  return rows
    .map((r) => patternRowToDoc(r, facets.get(r.id)))
    .filter((d): d is PatternDoc => d !== null)
}

// ── Crochet patterns ──────────────────────────────────────────────────────────

function fetchCrochetPatternRows(where: Record<string, unknown>) {
  return prisma.crochetPattern.findMany({
    where,
    include: {
      designer: { select: { slug: true, displayName: true } },
      subCategory: { select: { slug: true, name: true, category: { select: { slug: true } } } },
      primaryYarnWeight: { select: { canonicalName: true } },
      primaryHook: { select: { mmSize: true } },
    },
  })
}
type CrochetPatternRow = Awaited<ReturnType<typeof fetchCrochetPatternRows>>[number]

function crochetRowToDoc(
  p: CrochetPatternRow,
  facets: ContentTagFacets | undefined,
): CrochetPatternDoc | null {
  if (!p.subCategory) return null
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    categorySlug: p.subCategory.category.slug,
    subCategorySlug: p.subCategory.slug,
    subCategoryName: p.subCategory.name,
    designerSlug: p.designer?.slug ?? null,
    designerName: p.designer?.displayName ?? null,
    difficulty: p.difficulty,
    estimatedHours: p.estimatedHours,
    shape: p.shapeCategory,
    construction: p.construction,
    primaryStitches: p.specialStitchesUsed,
    yarnWeight: p.primaryYarnWeight?.canonicalName ?? null,
    hookSizeMm: p.primaryHook?.mmSize ?? null,
    hasMultipleSizes: p.sizesGraded !== null,
    terminology: p.terminologyConvention,
    premium: p.premium,
    heroCloudflareId: null,
    heroR2Key: null,
    publishedAt: p.publishedAt ? p.publishedAt.getTime() : null,
    ...docTagFields(facets),
  }
}

export async function buildCrochetPatternDoc(id: string): Promise<CrochetPatternDoc | null> {
  const [p] = await fetchCrochetPatternRows({ id })
  if (!p) return null
  return crochetRowToDoc(p, await buildContentTagFacets({ type: 'CROCHET_PATTERN', id }))
}

export async function loadAllCrochetPatternDocs(): Promise<CrochetPatternDoc[]> {
  const rows = await fetchCrochetPatternRows({
    ownerUserId: null,
    visibility: Visibility.PUBLIC,
    publishedAt: { not: null },
    subCategoryId: { not: null },
  })
  const facets = await getTagFacetsForContents('CROCHET_PATTERN', rows.map((r) => r.id))
  return rows
    .map((r) => crochetRowToDoc(r, facets.get(r.id)))
    .filter((d): d is CrochetPatternDoc => d !== null)
}

// ── Categories + glossary (no tag facets; deduped for consistency) ────────────

export async function buildCategoryDoc(id: string): Promise<CategoryDoc | null> {
  const c = await prisma.category.findUnique({ where: { id } })
  if (!c) return null
  return { id: c.id, slug: c.slug, name: c.name, description: c.description, archetype: c.archetype }
}

export async function loadAllCategoryDocs(): Promise<CategoryDoc[]> {
  const rows = await prisma.category.findMany()
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    archetype: c.archetype,
  }))
}

export async function buildGlossaryDoc(id: string): Promise<GlossaryDoc | null> {
  const g = await prisma.glossaryTerm.findUnique({ where: { id } })
  if (!g) return null
  return { id: g.id, slug: g.slug, term: g.term, definition: g.definition, categoryId: g.categoryId }
}

export async function loadAllGlossaryDocs(): Promise<GlossaryDoc[]> {
  const rows = await prisma.glossaryTerm.findMany()
  return rows.map((g) => ({
    id: g.id,
    slug: g.slug,
    term: g.term,
    definition: g.definition,
    categoryId: g.categoryId,
  }))
}
