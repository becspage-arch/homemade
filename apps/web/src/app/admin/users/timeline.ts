/**
 * Builds the merged activity timeline for one Maker's admin detail page.
 * Every table listed in the worker prompt's activity inventory gets its own
 * small, userId-indexed query (fine at N=1 user); results are normalised to
 * one shape and sorted by date, newest first.
 */

import 'server-only'
import { prisma } from '@homemade/db'
import { getMaterialsProvider } from '@/lib/planner/registry'

/** How many rows to pull per source table for the itemised timeline. The
 *  "grouped by craft/type with counts" summary above it uses the real
 *  totals from `_count`, so a heavy user's list is capped without lying
 *  about how much they've actually done. */
const PER_SOURCE_LIMIT = 30

export interface TimelineEntry {
  date: Date
  kind: string
  title: string
  href: string | null
  status: string
}

const tutorialSelect = {
  title: true,
  slug: true,
  category: { select: { slug: true } },
} as const

function tutorialHref(t: { slug: string; category: { slug: string } | null }): string | null {
  return t.category ? `/${t.category.slug}/${t.slug}` : null
}

function statusLabel(s: string): string {
  return s.toLowerCase().replace(/_/g, ' ')
}

const STALLED_AFTER_MS = 30 * 24 * 60 * 60 * 1000

/** In-progress craft work with no recent touch reads as "stalled" rather than
 *  just "in progress" — derived at render time, no schema change. */
function progressStatus(completedAt: Date | null, lastTouchedAt: Date): string {
  if (completedAt) return 'completed'
  const stalled = Date.now() - lastTouchedAt.getTime() > STALLED_AFTER_MS
  return stalled ? 'stalled' : 'in progress'
}

export async function buildMemberTimeline(userId: string): Promise<TimelineEntry[]> {
  const [
    userProjects,
    chartProgress,
    patternProgress,
    crochetProgress,
    needleworkProgress,
    knittingProgress,
    sewingProjects,
    plannerProjects,
    bookmarks,
    savedPatterns,
    savedRecipes,
    ownedPatterns,
    ownedCrochetPatterns,
    ownedNeedleworkPatterns,
    ownedKnittingPatterns,
    reviews,
    photos,
    questions,
    answers,
    errata,
    userRecipes,
    mealPlans,
  ] = await Promise.all([
    prisma.userProject.findMany({
      where: { userId },
      orderBy: { lastViewedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { status: true, startedAt: true, completedAt: true, lastViewedAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.chartProgress.findMany({
      where: { userId },
      orderBy: { lastTouchedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { markedCount: true, lastTouchedAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.userPatternProgress.findMany({
      where: { userId },
      orderBy: { lastStitchedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        startedAt: true,
        lastStitchedAt: true,
        completedAt: true,
        pattern: { select: { name: true, slug: true, id: true } },
      },
    }),
    prisma.crochetProjectProgress.findMany({
      where: { userId },
      orderBy: { lastWorkedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        startedAt: true,
        lastWorkedAt: true,
        completedAt: true,
        crochetPattern: { select: { name: true, slug: true, id: true } },
      },
    }),
    prisma.needleworkProjectProgress.findMany({
      where: { userId },
      orderBy: { lastWorkedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        startedAt: true,
        lastWorkedAt: true,
        completedAt: true,
        needleworkPattern: { select: { name: true, slug: true, id: true } },
      },
    }),
    prisma.knittingProjectProgress.findMany({
      where: { userId },
      orderBy: { lastWorkedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        startedAt: true,
        lastWorkedAt: true,
        completedAt: true,
        knittingPattern: { select: { name: true, slug: true, id: true } },
      },
    }),
    prisma.sewingPatternProject.findMany({
      where: { userId },
      orderBy: { lastWorkedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: {
        status: true,
        startedAt: true,
        lastWorkedAt: true,
        completedAt: true,
        pattern: { select: { name: true, slug: true } },
      },
    }),
    prisma.plannerProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { craft: true, patternId: true, status: true, startedAt: true, finishedAt: true, createdAt: true },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { createdAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.savedPattern.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { createdAt: true, pattern: { select: { name: true, slug: true, id: true } } },
    }),
    prisma.savedRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { createdAt: true, userRecipe: { select: { title: true, slug: true } } },
    }),
    prisma.pattern.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { name: true, slug: true, id: true, visibility: true, updatedAt: true },
    }),
    prisma.crochetPattern.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { name: true, slug: true, id: true, visibility: true, updatedAt: true },
    }),
    prisma.needleworkPattern.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { name: true, slug: true, id: true, visibility: true, updatedAt: true },
    }),
    prisma.knittingPattern.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { name: true, slug: true, id: true, updatedAt: true },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { rating: true, status: true, createdAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.uGCPhoto.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { status: true, createdAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { status: true, createdAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.answer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { status: true, createdAt: true, question: { select: { tutorial: { select: tutorialSelect } } } },
    }),
    prisma.errata.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { status: true, createdAt: true, tutorial: { select: tutorialSelect } },
    }),
    prisma.userRecipe.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { title: true, slug: true, status: true, visibility: true, createdAt: true },
    }),
    prisma.mealPlan.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: PER_SOURCE_LIMIT,
      select: { title: true, weekStartDate: true, createdAt: true },
    }),
  ])

  const entries: TimelineEntry[] = []

  for (const p of userProjects) {
    entries.push({
      date: p.lastViewedAt,
      kind: 'Tutorial project',
      title: p.tutorial.title,
      href: tutorialHref(p.tutorial),
      status: statusLabel(p.status),
    })
  }
  for (const c of chartProgress) {
    entries.push({
      date: c.lastTouchedAt,
      kind: 'Chart progress',
      title: c.tutorial.title,
      href: tutorialHref(c.tutorial),
      status: `${c.markedCount} marked`,
    })
  }
  for (const p of patternProgress) {
    entries.push({
      date: p.lastStitchedAt,
      kind: 'Cross-stitch Studio',
      title: p.pattern.name,
      href: p.pattern.slug
        ? `/cross-stitch/patterns/${p.pattern.slug}`
        : `/studio/cross-stitch?patternId=${p.pattern.id}`,
      status: progressStatus(p.completedAt, p.lastStitchedAt),
    })
  }
  for (const p of crochetProgress) {
    entries.push({
      date: p.lastWorkedAt,
      kind: 'Crochet Studio',
      title: p.crochetPattern.name,
      href: p.crochetPattern.slug
        ? `/studio/crochet?crochetPatternSlug=${p.crochetPattern.slug}`
        : `/studio/crochet?crochetPatternId=${p.crochetPattern.id}`,
      status: progressStatus(p.completedAt, p.lastWorkedAt),
    })
  }
  for (const p of needleworkProgress) {
    entries.push({
      date: p.lastWorkedAt,
      kind: 'Needlework Studio',
      title: p.needleworkPattern.name,
      href: p.needleworkPattern.slug
        ? `/needlework/patterns/${p.needleworkPattern.slug}`
        : `/studio/needlework?needleworkPatternId=${p.needleworkPattern.id}`,
      status: progressStatus(p.completedAt, p.lastWorkedAt),
    })
  }
  for (const p of knittingProgress) {
    entries.push({
      date: p.lastWorkedAt,
      kind: 'Knitting Studio',
      title: p.knittingPattern.name,
      href: p.knittingPattern.slug
        ? `/studio/knitting?knittingPatternSlug=${p.knittingPattern.slug}`
        : `/studio/knitting?knittingPatternId=${p.knittingPattern.id}`,
      status: progressStatus(p.completedAt, p.lastWorkedAt),
    })
  }
  for (const p of sewingProjects) {
    entries.push({
      date: p.lastWorkedAt,
      kind: 'Sewing Studio',
      title: p.pattern.name,
      href: `/studio/sewing/${p.pattern.slug}`,
      status:
        p.status === 'COMPLETED' || p.status === 'ARCHIVED'
          ? statusLabel(p.status)
          : progressStatus(p.completedAt, p.lastWorkedAt),
    })
  }
  for (const p of plannerProjects) {
    const provider = getMaterialsProvider(p.craft)
    const meta = provider
      ? await provider.getPatternMeta({ craft: p.craft, patternId: p.patternId, viewerUserId: userId })
      : null
    entries.push({
      date: p.finishedAt ?? p.startedAt ?? p.createdAt,
      kind: 'Planner queue',
      title: meta?.name ?? `${p.craft.toLowerCase()} pattern`,
      href: meta?.href ?? null,
      status: statusLabel(p.status),
    })
  }
  for (const b of bookmarks) {
    entries.push({
      date: b.createdAt,
      kind: 'Bookmark',
      title: b.tutorial.title,
      href: tutorialHref(b.tutorial),
      status: 'saved',
    })
  }
  for (const s of savedPatterns) {
    entries.push({
      date: s.createdAt,
      kind: 'Saved pattern',
      title: s.pattern.name,
      href: s.pattern.slug ? `/cross-stitch/patterns/${s.pattern.slug}` : null,
      status: 'saved',
    })
  }
  for (const s of savedRecipes) {
    entries.push({
      date: s.createdAt,
      kind: 'Saved recipe',
      title: s.userRecipe.title,
      href: `/recipes/${s.userRecipe.slug}`,
      status: 'saved',
    })
  }
  for (const p of ownedPatterns) {
    entries.push({
      date: p.updatedAt,
      kind: 'Cross-stitch design',
      title: p.name,
      href: p.slug ? `/cross-stitch/patterns/${p.slug}` : `/studio/cross-stitch?patternId=${p.id}`,
      status: p.visibility.toLowerCase(),
    })
  }
  for (const p of ownedCrochetPatterns) {
    entries.push({
      date: p.updatedAt,
      kind: 'Crochet design',
      title: p.name,
      href: p.slug
        ? `/studio/crochet?crochetPatternSlug=${p.slug}`
        : `/studio/crochet?crochetPatternId=${p.id}`,
      status: p.visibility.toLowerCase(),
    })
  }
  for (const p of ownedNeedleworkPatterns) {
    entries.push({
      date: p.updatedAt,
      kind: 'Needlework design',
      title: p.name,
      href: p.slug
        ? `/needlework/patterns/${p.slug}`
        : `/studio/needlework?needleworkPatternId=${p.id}`,
      status: p.visibility.toLowerCase(),
    })
  }
  for (const p of ownedKnittingPatterns) {
    entries.push({
      date: p.updatedAt,
      kind: 'Knitting design',
      title: p.name,
      href: p.slug
        ? `/studio/knitting?knittingPatternSlug=${p.slug}`
        : `/studio/knitting?knittingPatternId=${p.id}`,
      status: 'saved',
    })
  }
  for (const r of reviews) {
    entries.push({
      date: r.createdAt,
      kind: 'Review',
      title: r.tutorial.title,
      href: tutorialHref(r.tutorial),
      status: `${r.status.toLowerCase()} · ${r.rating}★`,
    })
  }
  for (const p of photos) {
    entries.push({
      date: p.createdAt,
      kind: 'Photo',
      title: p.tutorial.title,
      href: tutorialHref(p.tutorial),
      status: statusLabel(p.status),
    })
  }
  for (const q of questions) {
    entries.push({
      date: q.createdAt,
      kind: 'Question',
      title: q.tutorial.title,
      href: tutorialHref(q.tutorial),
      status: statusLabel(q.status),
    })
  }
  for (const a of answers) {
    entries.push({
      date: a.createdAt,
      kind: 'Answer',
      title: a.question.tutorial.title,
      href: tutorialHref(a.question.tutorial),
      status: statusLabel(a.status),
    })
  }
  for (const e of errata) {
    entries.push({
      date: e.createdAt,
      kind: 'Errata report',
      title: e.tutorial.title,
      href: tutorialHref(e.tutorial),
      status: statusLabel(e.status),
    })
  }
  for (const r of userRecipes) {
    entries.push({
      date: r.createdAt,
      kind: 'Recipe authored',
      title: r.title,
      href: `/recipes/${r.slug}`,
      status: statusLabel(r.status),
    })
  }
  for (const m of mealPlans) {
    entries.push({
      date: m.createdAt,
      kind: 'Meal plan',
      title: m.title ?? `Week of ${m.weekStartDate.toLocaleDateString('en-GB')}`,
      href: null,
      status: 'planned',
    })
  }

  entries.sort((a, b) => b.date.getTime() - a.date.getTime())
  return entries
}
