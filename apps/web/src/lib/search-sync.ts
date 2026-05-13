import 'server-only'

import { prisma, TutorialStatus } from '@homemade/db'
import {
  extractBodyText,
  removeCategoryFromSearch,
  removeGlossaryFromSearch,
  removeTutorialFromSearch,
  syncCategoryDoc,
  syncGlossaryDoc,
  syncTutorialDoc,
  type CategoryDoc,
  type GlossaryDoc,
  type TutorialDoc,
} from '@homemade/search'

/**
 * Build a Typesense tutorial doc from a freshly-read Prisma row.
 *
 * The Prisma include shape is intentionally narrow — we ask for only the
 * fields the doc needs, so callers can pre-fetch this in one query rather
 * than re-hydrating from a partial.
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
    tagSlugs: tutorial.tags.map((t) => t.slug),
    heroCloudflareId: tutorial.hero?.cloudflareId ?? null,
    heroR2Key: tutorial.hero?.r2Key ?? null,
    publishedAt: tutorial.publishedAt ? tutorial.publishedAt.getTime() : null,
  }
}

/**
 * Sync a tutorial to Typesense if it's published; remove it otherwise.
 * Idempotent. Logs but does not throw.
 *
 * Use after any mutation to a tutorial row. The caller does not need to
 * know whether the row was published — pass the id and we read the row.
 */
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
