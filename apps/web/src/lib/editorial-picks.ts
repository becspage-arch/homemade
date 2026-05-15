import 'server-only'
import {
  prisma,
  EditorialPickStatus,
  TutorialStatus,
  type Tutorial,
  type Category,
} from '@homemade/db'
import { seasonalityScore } from './seasonality'

const PICKS_PER_WEEK = 5
const WEEKS_AHEAD = 4

/**
 * Normalise any date to the Monday 00:00 UTC of the week that contains it.
 * Used as the canonical anchor for `WeeklyEditorialPick.weekStarting`.
 */
export function isoWeekStartUtc(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  // getUTCDay: Sun = 0, Mon = 1, ... Sat = 6. Roll back to Monday.
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // 0 if Monday, 6 if Sunday
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + weeks * 7)
  return d
}

type Candidate = Tutorial & {
  category: Pick<Category, 'id' | 'name' | 'slug'>
  _count?: { bookmarks: number; projects: number }
}

interface ScoreContext {
  weekStart: Date
  recentlyFeaturedTutorialIds: Map<string, Date> // tutorialId -> last featured date
  lastWeekTopPickCategoryId: string | null
}

/**
 * Score a tutorial for the given week. Higher = better. Negative values are
 * possible (recently featured off-season tutorials sink).
 */
export function scoreCandidate(
  tutorial: Candidate,
  context: ScoreContext,
  countryCode: string | null = null,
): number {
  let score = 0

  // 1. Recency bonus.
  if (tutorial.publishedAt) {
    const ageDays =
      (context.weekStart.getTime() - tutorial.publishedAt.getTime()) /
      (1000 * 60 * 60 * 24)
    if (ageDays <= 14) score += 5
    else if (ageDays <= 30) score += 2
  }

  // 2. Seasonality.
  const seasonal = seasonalityScore(tutorial, {
    date: context.weekStart,
    countryCode,
  })
  if (seasonal >= 0.5) score += 10
  else if (seasonal >= 0.2) score += 3
  else if (seasonal === 0) score += 0
  // We don't have a clean off-season signal yet (tutorials aren't tagged
  // anti-season). Keep the structure for the future.

  // 3. Engagement. Aggregated bookmark + project counts over the lifetime
  // of the tutorial as a low-cost proxy until per-30-day rollups exist.
  const bookmarks = tutorial._count?.bookmarks ?? 0
  const projects = tutorial._count?.projects ?? 0
  const engagement = bookmarks + projects
  if (engagement > 0) {
    score += Math.log10(engagement + 1) * 2
  }

  // 4. Recently-featured penalty.
  const lastFeatured = context.recentlyFeaturedTutorialIds.get(tutorial.id)
  if (lastFeatured) {
    const daysSince =
      (context.weekStart.getTime() - lastFeatured.getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysSince <= 60) score -= 8
    else if (daysSince <= 120) score -= 3
  }

  // 5. Same-as-last-week's-#1 penalty (category-level).
  if (
    context.lastWeekTopPickCategoryId &&
    tutorial.categoryId === context.lastWeekTopPickCategoryId
  ) {
    score -= 4
  }

  return score
}

interface RegenerateOptions {
  /** Defaults to "now". The cron passes the cron-trigger time. */
  now?: Date
  /** Defaults to admin@homemade.education via the system actor lookup. */
  systemActorId?: string | null
  /** Defaults to 4 weeks ahead from the current week. */
  weeksAhead?: number
}

/**
 * Regenerate AUTO_SELECTED picks for the next four weeks. Pinned (and
 * manually-replaced) rows are left alone. Existing AUTO_SELECTED rows for
 * still-future weeks are recomputed and overwritten — the typical case is
 * the cron firing weekly so most picks haven't been touched.
 */
export async function regenerateUpcomingEditorialPicks(
  opts: RegenerateOptions = {},
): Promise<{
  weeksProcessed: { weekStarting: Date; auto: number; preserved: number }[]
}> {
  const now = opts.now ?? new Date()
  const weeksAhead = opts.weeksAhead ?? WEEKS_AHEAD

  // Pull candidate tutorials once.
  const candidates: Candidate[] = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { bookmarks: true, projects: true } },
    },
  })

  if (candidates.length === 0) {
    return { weeksProcessed: [] }
  }

  // Build the recently-featured map. Look back 120 days so the penalty curve
  // is well-fed.
  const lookbackStart = new Date(now)
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - 120)
  const recentPicks = await prisma.weeklyEditorialPick.findMany({
    where: { weekStarting: { gte: lookbackStart, lte: now } },
    select: { tutorialId: true, weekStarting: true },
    orderBy: { weekStarting: 'desc' },
  })
  const recentlyFeaturedTutorialIds = new Map<string, Date>()
  for (const row of recentPicks) {
    const existing = recentlyFeaturedTutorialIds.get(row.tutorialId)
    if (!existing || row.weekStarting > existing) {
      recentlyFeaturedTutorialIds.set(row.tutorialId, row.weekStarting)
    }
  }

  // Find last week's top pick category (for the same-cat penalty).
  const currentWeek = isoWeekStartUtc(now)
  const lastWeek = addWeeks(currentWeek, -1)
  const lastWeekTop = await prisma.weeklyEditorialPick.findFirst({
    where: { weekStarting: lastWeek, position: 1 },
    include: { tutorial: { select: { categoryId: true } } },
  })
  const lastWeekTopPickCategoryId =
    lastWeekTop?.tutorial?.categoryId ?? null

  const weeksProcessed: {
    weekStarting: Date
    auto: number
    preserved: number
  }[] = []

  for (let w = 0; w < weeksAhead; w += 1) {
    const weekStart = addWeeks(currentWeek, w)

    // Existing rows for this week — pinned + replaced rows stay put.
    const existing = await prisma.weeklyEditorialPick.findMany({
      where: { weekStarting: weekStart },
      orderBy: { position: 'asc' },
    })
    const lockedPositions = new Set(
      existing
        .filter(
          (r) =>
            r.status === EditorialPickStatus.MANUALLY_PINNED ||
            r.status === EditorialPickStatus.MANUALLY_REPLACED,
        )
        .map((r) => r.position),
    )
    const lockedTutorialIds = new Set(
      existing
        .filter(
          (r) =>
            r.status === EditorialPickStatus.MANUALLY_PINNED ||
            r.status === EditorialPickStatus.MANUALLY_REPLACED,
        )
        .map((r) => r.tutorialId),
    )

    // Score every candidate against this week's seasonal calendar.
    const scored = candidates
      .filter((c) => !lockedTutorialIds.has(c.id))
      .map((c) => ({
        candidate: c,
        score: scoreCandidate(
          c,
          {
            weekStart,
            recentlyFeaturedTutorialIds,
            lastWeekTopPickCategoryId,
          },
          null,
        ),
      }))
      .sort((a, b) => b.score - a.score)

    // Walk positions 1..5; for each one not locked, take the next candidate
    // not already used in this week's auto-picks.
    const usedThisWeek = new Set<string>(
      existing
        .filter((r) => lockedPositions.has(r.position))
        .map((r) => r.tutorialId),
    )
    const inserts: {
      weekStarting: Date
      position: number
      tutorialId: string
    }[] = []
    let cursor = 0
    for (let pos = 1; pos <= PICKS_PER_WEEK; pos += 1) {
      if (lockedPositions.has(pos)) continue
      while (
        cursor < scored.length &&
        usedThisWeek.has(scored[cursor]!.candidate.id)
      ) {
        cursor += 1
      }
      if (cursor >= scored.length) break
      const chosen = scored[cursor]!.candidate
      cursor += 1
      usedThisWeek.add(chosen.id)
      inserts.push({
        weekStarting: weekStart,
        position: pos,
        tutorialId: chosen.id,
      })
    }

    // Drop previous auto-rows for unlocked positions before inserting fresh
    // ones. Locked positions stay.
    await prisma.weeklyEditorialPick.deleteMany({
      where: {
        weekStarting: weekStart,
        status: EditorialPickStatus.AUTO_SELECTED,
      },
    })

    // Re-insert.
    for (const ins of inserts) {
      await prisma.weeklyEditorialPick.create({
        data: {
          weekStarting: ins.weekStarting,
          position: ins.position,
          tutorialId: ins.tutorialId,
          status: EditorialPickStatus.AUTO_SELECTED,
        },
      })
    }

    weeksProcessed.push({
      weekStarting: weekStart,
      auto: inserts.length,
      preserved: lockedPositions.size,
    })
  }

  return { weeksProcessed }
}

/**
 * Fetch the current week's picks ordered 1..5. Used by the homepage rail and
 * by the state-aware hero zone.
 */
export async function getCurrentWeekPicks(now: Date = new Date()) {
  const weekStart = isoWeekStartUtc(now)
  return prisma.weeklyEditorialPick.findMany({
    where: { weekStarting: weekStart },
    orderBy: { position: 'asc' },
    include: {
      tutorial: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          difficulty: true,
          season: true,
          totalMinutes: true,
          timeMinutes: true,
          dietaryFlags: true,
          category: { select: { name: true, slug: true } },
          hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
        },
      },
    },
  })
}
