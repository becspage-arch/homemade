/**
 * Shared read-layer for the admin Members pages (list + detail): what a free
 * or premium Maker's account actually shows for activity, and how that rolls
 * up into the Plan / Signal columns. Both `page.tsx` and `[userId]/page.tsx`
 * import from here so the two views can never quietly disagree on what
 * "Active" or "Likely spam" means.
 */

import { prisma, type Prisma } from '@homemade/db'
import { isDisposableEmailDomain } from '@/lib/disposable-email-domains'

/** Every relation whose presence counts as "this Maker has done something". */
export const ACTIVITY_RELATIONS = [
  'projects',
  'crochetProjectProgress',
  'needleworkProjectProgress',
  'knittingProjectProgress',
  'sewingPatternProjects',
  'patternProgress',
  'plannerProjects',
  'chartProgress',
  'bookmarks',
  'savedPatterns',
  'savedRecipes',
  'patterns',
  'crochetPatterns',
  'needleworkPatterns',
  'knittingPatterns',
  'reviews',
  'ugcPhotos',
  'questions',
  'answers',
  'errata',
  'userRecipes',
  'mealPlans',
] as const

/** _count.select shape shared by the list and detail queries — one findMany,
 *  no N+1. Values that need a status/completedAt filter (finished projects)
 *  are resolved separately with a couple of grouped counts, not here. */
export const MEMBER_COUNT_SELECT = Object.fromEntries(
  ACTIVITY_RELATIONS.map((r) => [r, true as const]),
) as Record<(typeof ACTIVITY_RELATIONS)[number], true>

export type MemberCounts = Record<(typeof ACTIVITY_RELATIONS)[number], number>

/** The six tables a "project" lives in: the tutorial project tracker, the
 *  four craft-progress tables, and the cross-stitch Studio's pattern
 *  progress. Planner queue items are excluded — QUEUED isn't "started". */
export const PROJECT_RELATIONS = [
  'projects',
  'crochetProjectProgress',
  'needleworkProjectProgress',
  'knittingProjectProgress',
  'sewingPatternProjects',
  'patternProgress',
] as const

export function startedCount(counts: MemberCounts): number {
  return PROJECT_RELATIONS.reduce((sum, r) => sum + counts[r], 0)
}

export function savedCount(counts: MemberCounts): number {
  return counts.bookmarks + counts.savedPatterns + counts.savedRecipes
}

export function studioDesignCount(counts: MemberCounts): number {
  return counts.patterns + counts.crochetPatterns + counts.needleworkPatterns + counts.knittingPatterns
}

export function contributionCount(counts: MemberCounts): number {
  return counts.reviews + counts.ugcPhotos + counts.questions + counts.answers + counts.errata
}

export function totalActivityCount(counts: MemberCounts): number {
  return ACTIVITY_RELATIONS.reduce((sum, r) => sum + counts[r], 0)
}

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export type Signal = 'ACTIVE' | 'QUIET' | 'SPAM'

export const SIGNAL_LABEL: Record<Signal, string> = {
  ACTIVE: 'Active',
  QUIET: 'Quiet',
  SPAM: 'Likely spam',
}

/** Maps onto the existing admin-pill status classes (admin-moderation.css). */
export const SIGNAL_PILL_CLASS: Record<Signal, string> = {
  ACTIVE: 'approved',
  QUIET: 'hidden',
  SPAM: 'flagged',
}

export function computeSignal(input: {
  counts: MemberCounts
  lastSeenAt: Date | null
  createdAt: Date
  signupRiskScore: number
  emailDomain: string | null
  now?: Date
}): Signal {
  const now = input.now ?? new Date()
  const seenRecently = Boolean(
    input.lastSeenAt && now.getTime() - input.lastSeenAt.getTime() <= THIRTY_DAYS_MS,
  )
  const hasActivity = totalActivityCount(input.counts) > 0
  const isActive = hasActivity || seenRecently
  const isQuiet = !isActive

  const isLikelySpam =
    input.signupRiskScore >= 2 || (isQuiet && isDisposableEmailDomain(input.emailDomain))

  if (isLikelySpam) return 'SPAM'
  return isActive ? 'ACTIVE' : 'QUIET'
}

/** Prisma where-fragment: "this account has touched at least one activity
 *  table". Each relation reads as a single indexed EXISTS subquery. */
function hasAnyActivityWhere(): Prisma.UserWhereInput {
  return {
    OR: ACTIVITY_RELATIONS.map((r) => ({ [r]: { some: {} } })) as Prisma.UserWhereInput[],
  }
}

export function signalWhere(signal: Signal, now: Date): Prisma.UserWhereInput {
  const thirtyDaysAgo = new Date(now.getTime() - THIRTY_DAYS_MS)
  const seenRecentlyWhere: Prisma.UserWhereInput = { lastSeenAt: { gte: thirtyDaysAgo } }
  const activeWhere: Prisma.UserWhereInput = { OR: [seenRecentlyWhere, hasAnyActivityWhere()] }
  const quietWhere: Prisma.UserWhereInput = { NOT: activeWhere }

  switch (signal) {
    case 'ACTIVE':
      // Excludes flagged spam so the Active filter doesn't fill up with
      // disposable-domain accounts that happen to have poked something.
      return { AND: [activeWhere, { signupRiskScore: { lt: 2 } }] }
    case 'QUIET':
      return { AND: [quietWhere, { signupRiskScore: { lt: 2 } }] }
    case 'SPAM':
      return { OR: [{ signupRiskScore: { gte: 2 } }, { AND: [quietWhere, { emailDomain: { not: null } }] }] }
  }
}

export type Plan = 'CREATOR' | 'TESTER' | 'PREMIUM' | 'FREE'

/** A Maker can carry more than one flag (a premium creator, say) — this is
 *  the single "headline" plan the list column sorts and filters on; the
 *  detail page's Account panel shows every flag individually. */
export function planOf(user: {
  isCreator: boolean
  isPatternTester: boolean
  premiumActive: boolean
}): Plan {
  if (user.isCreator) return 'CREATOR'
  if (user.isPatternTester) return 'TESTER'
  if (user.premiumActive) return 'PREMIUM'
  return 'FREE'
}

export const PLAN_LABEL: Record<Plan, string> = {
  CREATOR: 'Creator',
  TESTER: 'Tester',
  PREMIUM: 'Premium',
  FREE: 'Free',
}

/**
 * "Finished" is a completedAt/status subset of the six project relations —
 * Prisma can't carry two differently-filtered counts of the same relation in
 * one `_count.select`, so this runs six small grouped counts (one per table,
 * scoped to just this page's user ids) instead of a query per user.
 */
export async function finishedCountsByUser(userIds: string[]): Promise<Map<string, number>> {
  const finished = new Map<string, number>()
  if (userIds.length === 0) return finished
  const bump = (userId: string, n: number) => finished.set(userId, (finished.get(userId) ?? 0) + n)

  const [userProjects, patternProgress, crochet, needlework, knitting, sewing] =
    await Promise.all([
      prisma.userProject.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: 'COMPLETED' },
        _count: { _all: true },
      }),
      prisma.userPatternProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.crochetProjectProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.needleworkProjectProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.knittingProjectProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.sewingPatternProject.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
    ])

  for (const rows of [userProjects, patternProgress, crochet, needlework, knitting, sewing]) {
    for (const row of rows) bump(row.userId, row._count._all)
  }
  return finished
}

export function planWhere(plan: Plan): Prisma.UserWhereInput {
  switch (plan) {
    case 'CREATOR':
      return { isCreator: true }
    case 'TESTER':
      return { isPatternTester: true, isCreator: false }
    case 'PREMIUM':
      return { premiumActive: true, isCreator: false, isPatternTester: false }
    case 'FREE':
      return { isCreator: false, isPatternTester: false, premiumActive: false }
  }
}
