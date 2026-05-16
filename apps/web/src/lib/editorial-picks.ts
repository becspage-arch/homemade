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
  /** Map of tutorialId -> most-recent featured date. Includes picks chosen
   *  earlier in the same regenerate-run so cross-week diversity holds. */
  recentlyFeaturedTutorialIds: Map<string, Date>
  /** Category id -> number of picks already chosen for this week. Drives the
   *  within-week diversity penalty. */
  categoryCountsThisWeek: Map<string, number>
  /** Category id -> number of times this category has taken position 1 across
   *  the most recent two weeks. Avoids the same spine category leading two
   *  weeks in a row. */
  recentLeadCategoryCounts: Map<string, number>
}

const WITHIN_WEEK_CATEGORY_CAP = 2 // hard cap — never 3+ of the same category
const WITHIN_WEEK_FIRST_REPEAT_PENALTY = 5
const WITHIN_WEEK_SECOND_REPEAT_PENALTY = 12
const RECENT_FEATURE_VERY_HOT_PENALTY = 15 // featured within 14 days
const RECENT_FEATURE_HOT_PENALTY = 8 // featured 14-60 days
const RECENT_FEATURE_WARM_PENALTY = 3 // featured 60-120 days
const RECENT_LEAD_CATEGORY_PENALTY = 4 // category already led a recent week

/**
 * Score a tutorial for the given week. Higher = better. Negative values are
 * possible (recently featured off-season tutorials sink). The scoring is
 * deliberately greedy + position-aware: callers re-score for each of the
 * five positions as the within-week category counts evolve.
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

  // 3. Engagement. Aggregated bookmark + project counts over the lifetime
  // of the tutorial as a low-cost proxy until per-30-day rollups exist.
  const bookmarks = tutorial._count?.bookmarks ?? 0
  const projects = tutorial._count?.projects ?? 0
  const engagement = bookmarks + projects
  if (engagement > 0) {
    score += Math.log10(engagement + 1) * 2
  }

  // 4. Recently-featured penalty. Tighter than the original brief — at
  // weekly cadence we want a featured tutorial to disappear from picks for
  // at least 8 weeks (60 days) and stay lightly suppressed for another
  // 8 weeks (60-120 days).
  const lastFeatured = context.recentlyFeaturedTutorialIds.get(tutorial.id)
  if (lastFeatured) {
    const daysSince =
      (context.weekStart.getTime() - lastFeatured.getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysSince <= 14) score -= RECENT_FEATURE_VERY_HOT_PENALTY
    else if (daysSince <= 60) score -= RECENT_FEATURE_HOT_PENALTY
    else if (daysSince <= 120) score -= RECENT_FEATURE_WARM_PENALTY
  }

  // 5. Within-week category diversity. Hard-cap at 2 per category; first
  // repeat costs WITHIN_WEEK_FIRST_REPEAT_PENALTY, second the larger one.
  const categoryCount =
    context.categoryCountsThisWeek.get(tutorial.categoryId) ?? 0
  if (categoryCount >= WITHIN_WEEK_CATEGORY_CAP) {
    score -= 9999 // effectively unselectable; safety net
  } else if (categoryCount === 1) {
    score -= WITHIN_WEEK_FIRST_REPEAT_PENALTY
  } else if (categoryCount >= 2) {
    score -= WITHIN_WEEK_SECOND_REPEAT_PENALTY
  }

  // 6. Cross-week lead-category diversity. Penalise tutorials whose
  // category took position 1 in either of the last two weeks. Stacks
  // when both weeks led with the same category.
  const recentLead =
    context.recentLeadCategoryCounts.get(tutorial.categoryId) ?? 0
  if (recentLead > 0) {
    score -= RECENT_LEAD_CATEGORY_PENALTY * recentLead
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

  // Seed recent-lead-category counts from the two weeks just past. Stacks
  // when both weeks led with the same category.
  const currentWeek = isoWeekStartUtc(now)
  const recentLeadCategoryCounts = new Map<string, number>()
  for (const offset of [-1, -2]) {
    const w = addWeeks(currentWeek, offset)
    const top = await prisma.weeklyEditorialPick.findFirst({
      where: { weekStarting: w, position: 1 },
      include: { tutorial: { select: { categoryId: true } } },
    })
    const id = top?.tutorial?.categoryId
    if (id) {
      recentLeadCategoryCounts.set(id, (recentLeadCategoryCounts.get(id) ?? 0) + 1)
    }
  }

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
    const lockedRows = existing.filter(
      (r) =>
        r.status === EditorialPickStatus.MANUALLY_PINNED ||
        r.status === EditorialPickStatus.MANUALLY_REPLACED,
    )
    const lockedTutorialIds = new Set(lockedRows.map((r) => r.tutorialId))

    // Seed the within-week category counts from any locked rows — pinned
    // / replaced picks count toward the diversity cap.
    const categoryCountsThisWeek = new Map<string, number>()
    for (const row of lockedRows) {
      const cand = candidates.find((c) => c.id === row.tutorialId)
      if (cand) {
        categoryCountsThisWeek.set(
          cand.categoryId,
          (categoryCountsThisWeek.get(cand.categoryId) ?? 0) + 1,
        )
      }
    }

    const usedThisWeek = new Set<string>(lockedTutorialIds)

    // Greedy per-position pick. Re-score remaining candidates each turn so
    // the within-week category diversity penalty applies as the picks roll
    // in. Tutorials picked earlier in this same regenerate-run are filtered
    // out via recentlyFeaturedTutorialIds (stamped below).
    const inserts: {
      weekStarting: Date
      position: number
      tutorialId: string
      categoryId: string
    }[] = []

    for (let pos = 1; pos <= PICKS_PER_WEEK; pos += 1) {
      if (lockedPositions.has(pos)) continue

      const pool = candidates.filter(
        (c) =>
          !usedThisWeek.has(c.id) &&
          (categoryCountsThisWeek.get(c.categoryId) ?? 0) <
            WITHIN_WEEK_CATEGORY_CAP,
      )
      if (pool.length === 0) break

      let best: { candidate: Candidate; score: number } | null = null
      for (const candidate of pool) {
        const score = scoreCandidate(
          candidate,
          {
            weekStart,
            recentlyFeaturedTutorialIds,
            categoryCountsThisWeek,
            recentLeadCategoryCounts,
          },
          null,
        )
        if (!best || score > best.score) best = { candidate, score }
      }
      if (!best) break

      const chosen = best.candidate
      usedThisWeek.add(chosen.id)
      categoryCountsThisWeek.set(
        chosen.categoryId,
        (categoryCountsThisWeek.get(chosen.categoryId) ?? 0) + 1,
      )
      // Stamp the in-run picked tutorial as "featured at this week's start"
      // so subsequent weeks treat it as very-recently-featured.
      recentlyFeaturedTutorialIds.set(chosen.id, weekStart)
      inserts.push({
        weekStarting: weekStart,
        position: pos,
        tutorialId: chosen.id,
        categoryId: chosen.categoryId,
      })
    }

    // The position-1 pick (or the first slot we filled if pos-1 was locked)
    // counts toward the lead-category history that future weeks within this
    // run will see.
    const leadId =
      lockedRows.find((r) => r.position === 1)?.tutorialId ??
      inserts.find((i) => i.position === 1)?.tutorialId
    if (leadId) {
      const leadCand = candidates.find((c) => c.id === leadId)
      if (leadCand) {
        recentLeadCategoryCounts.set(
          leadCand.categoryId,
          (recentLeadCategoryCounts.get(leadCand.categoryId) ?? 0) + 1,
        )
      }
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
