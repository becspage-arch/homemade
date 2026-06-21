import 'server-only'

import { buildContentTagFacets, prisma, TutorialStatus, Visibility } from '@homemade/db'
import {
  extractBodyText,
  removeCategoryFromSearch,
  removeCrochetPatternFromSearch,
  removeGlossaryFromSearch,
  removePatternFromSearch,
  removeTutorialFromSearch,
  syncCategoryDoc,
  syncCrochetPatternDoc,
  syncGlossaryDoc,
  syncPatternDoc,
  syncTutorialDoc,
  type CategoryDoc,
  type CrochetPatternDoc,
  type GlossaryDoc,
  type PatternDoc,
  type TutorialDoc,
} from '@homemade/search'

/**
 * Build a Typesense tutorial doc from a freshly-read Prisma row.
 */
async function buildTutorialDoc(id: string): Promise<TutorialDoc | null> {
  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    include: {
      category: { select: { slug: true, name: true } },
      subCategory: { select: { slug: true, name: true } },
      tags: { select: { slug: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!tutorial) return null

  const tags = await buildContentTagFacets({ type: 'TUTORIAL', id })

  return {
    id: tutorial.id,
    slug: tutorial.slug,
    title: tutorial.title,
    subtitle: tutorial.subtitle,
    excerpt: tutorial.excerpt,
    bodyText: extractBodyText(tutorial.body),
    categoryId: tutorial.categoryId,
    categorySlug: tutorial.category.slug,
    categoryName: tutorial.category.name,
    subCategorySlug: tutorial.subCategory?.slug ?? null,
    subCategoryName: tutorial.subCategory?.name ?? null,
    difficulty: tutorial.difficulty,
    season: tutorial.season,
    timeMinutes: tutorial.timeMinutes,
    totalMinutes: tutorial.totalMinutes,
    tagSlugs: tutorial.tags.map((t) => t.slug),
    heroCloudflareId: tutorial.hero?.cloudflareId ?? null,
    heroR2Key: tutorial.hero?.r2Key ?? null,
    publishedAt: tutorial.publishedAt ? tutorial.publishedAt.getTime() : null,
    type: tutorial.type,
    mealType: tutorial.mealType,
    cuisine: tutorial.cuisine,
    dietaryFlags: tutorial.dietaryFlags,
    mood: tutorial.mood,
    practiceType: tutorial.practiceType,
    practiceTargets: tutorial.practiceTargets,
    timeBand: tutorial.timeBand,
    bestTime: tutorial.bestTime,
    practiceDepth: tutorial.practiceDepth,
    plantingMonths: tutorial.plantingMonths,
    harvestMonths: tutorial.harvestMonths,
    containerFriendly: tutorial.containerFriendly,
    indoorFriendly: tutorial.indoorFriendly,
    regionsApplicable: tutorial.regionsApplicable,
    foundational: tutorial.foundational,
    occasionSlugs: tags.occasionSlugs,
    seasonSlugs: tags.seasonSlugs,
    styleSlugs: tags.styleSlugs,
    subjectSlugs: tags.subjectSlugs,
    collectionText: tags.collectionText,
  }
}

export async function syncTutorialById(id: string): Promise<void> {
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      select: { id: true, status: true },
    })
    if (!tutorial) {
      await removeTutorialFromSearch(id)
      return
    }
    if (tutorial.status !== TutorialStatus.PUBLISHED) {
      await removeTutorialFromSearch(id)
      return
    }
    const doc = await buildTutorialDoc(id)
    if (!doc) return
    await syncTutorialDoc(doc)
  } catch (err) {
    console.warn(`[search] syncTutorialById(${id}) failed`, err)
  }
}

export async function removeTutorialById(id: string): Promise<void> {
  try {
    await removeTutorialFromSearch(id)
  } catch (err) {
    console.warn(`[search] removeTutorialById(${id}) failed`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Patterns
// ────────────────────────────────────────────────────────────────────────────

async function buildPatternDoc(id: string): Promise<PatternDoc | null> {
  const pattern = await prisma.pattern.findUnique({
    where: { id },
    include: {
      designer: { select: { slug: true, displayName: true } },
      subCategory: {
        select: {
          slug: true,
          name: true,
          category: { select: { slug: true } },
        },
      },
      hero: { select: { cloudflareId: true, r2Key: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!pattern) return null
  if (!pattern.subCategory) return null

  const tags = await buildContentTagFacets({ type: 'CROSS_STITCH_PATTERN', id })

  return {
    id: pattern.id,
    slug: pattern.slug,
    name: pattern.name,
    description: pattern.description,
    type: pattern.type,
    categorySlug: pattern.subCategory.category.slug,
    subCategorySlug: pattern.subCategory.slug,
    subCategoryName: pattern.subCategory.name,
    designerSlug: pattern.designer?.slug ?? null,
    designerName: pattern.designer?.displayName ?? null,
    difficulty: pattern.difficulty,
    widthCells: pattern.widthCells,
    heightCells: pattern.heightCells,
    colourCount: pattern.colourCount,
    totalStitches: pattern.totalStitches,
    estimatedHours: pattern.estimatedHours,
    hasBackstitch: pattern.hasBackstitch,
    hasFrenchKnots: pattern.hasFrenchKnots,
    hasBeads: pattern.hasBeads,
    hasQuarterStitches: pattern.hasQuarterStitches,
    fabricCountSuggested: pattern.fabricCountSuggested,
    premium: pattern.premium,
    heroCloudflareId: pattern.hero?.cloudflareId ?? null,
    heroR2Key: pattern.hero?.r2Key ?? null,
    thumbnailCloudflareId: pattern.thumbnail?.cloudflareId ?? null,
    thumbnailR2Key: pattern.thumbnail?.r2Key ?? null,
    publishedAt: pattern.publishedAt ? pattern.publishedAt.getTime() : null,
    occasionSlugs: tags.occasionSlugs,
    seasonSlugs: tags.seasonSlugs,
    styleSlugs: tags.styleSlugs,
    subjectSlugs: tags.subjectSlugs,
    collectionText: tags.collectionText,
  }
}

export async function syncPatternById(id: string): Promise<void> {
  try {
    const pattern = await prisma.pattern.findUnique({
      where: { id },
      select: {
        id: true,
        visibility: true,
        publishedAt: true,
        ownerUserId: true,
      },
    })
    if (!pattern) {
      await removePatternFromSearch(id)
      return
    }
    // Only catalogue patterns (ownerUserId null) that are PUBLIC and published.
    if (
      pattern.ownerUserId !== null ||
      pattern.visibility !== Visibility.PUBLIC ||
      pattern.publishedAt === null
    ) {
      await removePatternFromSearch(id)
      return
    }
    const doc = await buildPatternDoc(id)
    if (!doc) return
    await syncPatternDoc(doc)
  } catch (err) {
    console.warn(`[search] syncPatternById(${id}) failed`, err)
  }
}

export async function removePatternById(id: string): Promise<void> {
  try {
    await removePatternFromSearch(id)
  } catch (err) {
    console.warn(`[search] removePatternById(${id}) failed`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Crochet patterns
// ────────────────────────────────────────────────────────────────────────────

async function buildCrochetPatternDoc(id: string): Promise<CrochetPatternDoc | null> {
  const pattern = await prisma.crochetPattern.findUnique({
    where: { id },
    include: {
      designer: { select: { slug: true, displayName: true } },
      subCategory: {
        select: {
          slug: true,
          name: true,
          category: { select: { slug: true } },
        },
      },
      primaryYarnWeight: { select: { canonicalName: true } },
      primaryHook: { select: { mmSize: true } },
    },
  })
  if (!pattern) return null
  if (!pattern.subCategory) return null

  const tags = await buildContentTagFacets({ type: 'CROCHET_PATTERN', id })

  return {
    id: pattern.id,
    slug: pattern.slug,
    name: pattern.name,
    description: pattern.description,
    categorySlug: pattern.subCategory.category.slug,
    subCategorySlug: pattern.subCategory.slug,
    subCategoryName: pattern.subCategory.name,
    designerSlug: pattern.designer?.slug ?? null,
    designerName: pattern.designer?.displayName ?? null,
    difficulty: pattern.difficulty,
    estimatedHours: pattern.estimatedHours,
    shape: pattern.shapeCategory,
    construction: pattern.construction,
    primaryStitches: pattern.specialStitchesUsed,
    yarnWeight: pattern.primaryYarnWeight?.canonicalName ?? null,
    hookSizeMm: pattern.primaryHook?.mmSize ?? null,
    hasMultipleSizes: pattern.sizesGraded !== null,
    terminology: pattern.terminologyConvention,
    premium: pattern.premium,
    heroCloudflareId: null,
    heroR2Key: null,
    publishedAt: pattern.publishedAt ? pattern.publishedAt.getTime() : null,
    occasionSlugs: tags.occasionSlugs,
    seasonSlugs: tags.seasonSlugs,
    styleSlugs: tags.styleSlugs,
    subjectSlugs: tags.subjectSlugs,
    collectionText: tags.collectionText,
  }
}

export async function syncCrochetPatternById(id: string): Promise<void> {
  try {
    const pattern = await prisma.crochetPattern.findUnique({
      where: { id },
      select: {
        id: true,
        visibility: true,
        publishedAt: true,
        ownerUserId: true,
      },
    })
    if (!pattern) {
      await removeCrochetPatternFromSearch(id)
      return
    }
    if (
      pattern.ownerUserId !== null ||
      pattern.visibility !== Visibility.PUBLIC ||
      pattern.publishedAt === null
    ) {
      await removeCrochetPatternFromSearch(id)
      return
    }
    const doc = await buildCrochetPatternDoc(id)
    if (!doc) return
    await syncCrochetPatternDoc(doc)
  } catch (err) {
    console.warn(`[search] syncCrochetPatternById(${id}) failed`, err)
  }
}

export async function removeCrochetPatternById(id: string): Promise<void> {
  try {
    await removeCrochetPatternFromSearch(id)
  } catch (err) {
    console.warn(`[search] removeCrochetPatternById(${id}) failed`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Categories
// ────────────────────────────────────────────────────────────────────────────

export async function syncCategoryById(id: string): Promise<void> {
  try {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      await removeCategoryFromSearch(id)
      return
    }
    const doc: CategoryDoc = {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      archetype: category.archetype,
    }
    await syncCategoryDoc(doc)
  } catch (err) {
    console.warn(`[search] syncCategoryById(${id}) failed`, err)
  }
}

export async function removeCategoryById(id: string): Promise<void> {
  try {
    await removeCategoryFromSearch(id)
  } catch (err) {
    console.warn(`[search] removeCategoryById(${id}) failed`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Glossary
// ────────────────────────────────────────────────────────────────────────────

export async function syncGlossaryById(id: string): Promise<void> {
  try {
    const term = await prisma.glossaryTerm.findUnique({ where: { id } })
    if (!term) {
      await removeGlossaryFromSearch(id)
      return
    }
    const doc: GlossaryDoc = {
      id: term.id,
      slug: term.slug,
      term: term.term,
      definition: term.definition,
      categoryId: term.categoryId,
    }
    await syncGlossaryDoc(doc)
  } catch (err) {
    console.warn(`[search] syncGlossaryById(${id}) failed`, err)
  }
}

export async function removeGlossaryById(id: string): Promise<void> {
  try {
    await removeGlossaryFromSearch(id)
  } catch (err) {
    console.warn(`[search] removeGlossaryById(${id}) failed`, err)
  }
}
