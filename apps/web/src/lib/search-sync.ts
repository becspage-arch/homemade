import 'server-only'

import { prisma, TutorialStatus, Visibility } from '@homemade/db'
import {
  buildCategoryDoc,
  buildCrochetPatternDoc,
  buildGlossaryDoc,
  buildPatternDoc,
  buildTutorialDoc,
} from '@homemade/db/search-docs'
import {
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
} from '@homemade/search'

/**
 * Per-row search sync — called from admin server actions after a Prisma write.
 * The row→doc mapping lives once in `@homemade/db/search-docs`; this file owns
 * the publish gating (what is eligible to be indexed) + remove-on-unpublish.
 * Fire-and-forget: a Typesense outage must never fail an admin save, so each
 * path swallows + logs.
 */

// ────────────────────────────────────────────────────────────────────────────
// Tutorials
// ────────────────────────────────────────────────────────────────────────────

export async function syncTutorialById(id: string): Promise<void> {
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      select: { id: true, status: true },
    })
    if (!tutorial || tutorial.status !== TutorialStatus.PUBLISHED) {
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
// Patterns (cross-stitch / knitting-chart / crochet-chart)
// ────────────────────────────────────────────────────────────────────────────

export async function syncPatternById(id: string): Promise<void> {
  try {
    const pattern = await prisma.pattern.findUnique({
      where: { id },
      select: { id: true, visibility: true, publishedAt: true, ownerUserId: true },
    })
    // Only catalogue patterns (ownerUserId null) that are PUBLIC and published.
    if (
      !pattern ||
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
// Crochet patterns (row-by-row written / charted crochet)
// ────────────────────────────────────────────────────────────────────────────

export async function syncCrochetPatternById(id: string): Promise<void> {
  try {
    const pattern = await prisma.crochetPattern.findUnique({
      where: { id },
      select: { id: true, visibility: true, publishedAt: true, ownerUserId: true },
    })
    if (
      !pattern ||
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
    const doc = await buildCategoryDoc(id)
    if (!doc) {
      await removeCategoryFromSearch(id)
      return
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
    const doc = await buildGlossaryDoc(id)
    if (!doc) {
      await removeGlossaryFromSearch(id)
      return
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
