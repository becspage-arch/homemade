import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  prisma,
  ReviewStatus,
  UGCPhotoStatus,
  UGCStatus,
  ErrataStatus,
  ReportStatus,
  CreatorApplicationStatus,
  DmcaStatus,
  TutorialStatus,
  UserProjectStatus,
  HeroStrategy,
} from '@homemade/db'

export interface AttentionInboxItem {
  key: string
  label: string
  count: number
  href: string
}

export interface KpiCard {
  key: string
  label: string
  value: number
  delta7d: number | null
  sparkline: number[]
  href: string
}

export interface CategoryPipelineRow {
  slug: string
  name: string
  description: string | null
  published: number
  draft: number
  total: number
  target: number | null
  fillPercent: number | null
  isPublicVisible: boolean
  lastPublishedAt: string | null
}

export interface DashboardData {
  inbox: AttentionInboxItem[]
  kpis: KpiCard[]
  pipeline: CategoryPipelineRow[]
  generatedAt: number
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setUTCHours(0, 0, 0, 0)
  return out
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + n)
  return out
}

function startOfWeek(d: Date): Date {
  const out = startOfDay(d)
  const day = out.getUTCDay() // 0 Sunday … 6 Saturday
  const diff = (day + 6) % 7 // back to Monday
  out.setUTCDate(out.getUTCDate() - diff)
  return out
}

async function dayBuckets(
  table: 'tutorial' | 'user' | 'userProject',
  field: 'createdAt' | 'publishedAt' | 'startedAt',
  baseWhere: Record<string, unknown>,
): Promise<number[]> {
  const today = startOfDay(new Date())
  const start = addDays(today, -6)
  const where = { ...baseWhere, [field]: { gte: start } }
  let rows: { [k: string]: Date | null }[] = []
  if (table === 'tutorial') {
    const select = field === 'publishedAt' ? { publishedAt: true } : { createdAt: true }
    rows = (await prisma.tutorial.findMany({
      where: where as never,
      select: select as never,
    })) as never
  } else if (table === 'user') {
    rows = (await prisma.user.findMany({
      where: where as never,
      select: { createdAt: true },
    })) as never
  } else {
    rows = (await prisma.userProject.findMany({
      where: where as never,
      select: { startedAt: true },
    })) as never
  }
  const buckets = Array(7).fill(0) as number[]
  for (const r of rows) {
    const at = r[field] as Date | null
    if (!at) continue
    const idx = Math.floor((at.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    if (idx >= 0 && idx < 7) buckets[idx] = (buckets[idx] ?? 0) + 1
  }
  return buckets
}

async function loadDashboard(): Promise<DashboardData> {
  const now = new Date()
  const today = startOfDay(now)
  const sevenDaysAgo = addDays(today, -7)
  const fourteenDaysAgo = addDays(today, -14)
  const weekStart = startOfWeek(now)

  const [
    pendingReviews,
    pendingPhotos,
    pendingQuestions,
    openErrata,
    openReports,
    creatorApplications,
    openDmca,
    publishedCount,
    publishedLastWeekCount,
    publishedPriorWeekCount,
    totalUsers,
    newUsersThisWeek,
    newUsersPriorWeek,
    activeProjectsThisWeek,
    moderationQueueDepth,
    heroCounts,
    publishedTodayCount,
    editorialPicksAheadCount,
    publishedSpark,
    newUserSpark,
    activeProjectSpark,
    categoryRows,
    publishedByCategory,
    draftByCategory,
  ] = await Promise.all([
    prisma.review.count({ where: { status: ReviewStatus.PENDING_MODERATION } }),
    prisma.uGCPhoto.count({ where: { status: UGCPhotoStatus.PENDING_MODERATION } }),
    prisma.question.count({ where: { status: UGCStatus.PENDING_MODERATION } }),
    prisma.errata.count({ where: { status: ErrataStatus.OPEN } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.creatorProfile.count({
      where: { applicationStatus: CreatorApplicationStatus.APPLIED },
    }),
    prisma.dmcaTakedownRequest.count({
      where: { status: { in: [DmcaStatus.RECEIVED, DmcaStatus.UNDER_REVIEW] } },
    }),
    prisma.tutorial.count({ where: { status: TutorialStatus.PUBLISHED } }),
    prisma.tutorial.count({
      where: {
        status: TutorialStatus.PUBLISHED,
        publishedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.tutorial.count({
      where: {
        status: TutorialStatus.PUBLISHED,
        publishedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({
      where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.userProject.count({
      where: { status: UserProjectStatus.IN_PROGRESS, updatedAt: { gte: weekStart } },
    }),
    Promise.all([
      prisma.review.count({ where: { status: ReviewStatus.PENDING_MODERATION } }),
      prisma.uGCPhoto.count({ where: { status: UGCPhotoStatus.PENDING_MODERATION } }),
      prisma.question.count({ where: { status: UGCStatus.PENDING_MODERATION } }),
      prisma.errata.count({ where: { status: ErrataStatus.OPEN } }),
      prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    ]).then((arr) => arr.reduce((a, b) => a + b, 0)),
    prisma.tutorial.groupBy({
      by: ['heroImageStrategy'],
      where: { status: TutorialStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.tutorial.count({
      where: {
        status: TutorialStatus.PUBLISHED,
        publishedAt: { gte: today },
      },
    }),
    prisma.weeklyEditorialPick.findMany({
      where: { weekStarting: { gte: weekStart } },
      select: { weekStarting: true },
    }),
    dayBuckets('tutorial', 'publishedAt', { status: TutorialStatus.PUBLISHED }),
    dayBuckets('user', 'createdAt', {}),
    dayBuckets('userProject', 'startedAt', {}),
    prisma.category.findMany({
      // Admin sees the full picture, including isPublicVisible:false rows that
      // public-side queries filter out. Launch order keeps the spine at the
      // top with the future-categories grouping below it.
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        targetTutorialCount: true,
        isPublicVisible: true,
      },
    }),
    prisma.tutorial.groupBy({
      by: ['categoryId'],
      where: { status: TutorialStatus.PUBLISHED },
      _count: { _all: true },
      _max: { publishedAt: true },
    }),
    prisma.tutorial.groupBy({
      by: ['categoryId'],
      where: { status: TutorialStatus.DRAFT },
      _count: { _all: true },
    }),
  ])

  const realHeroStrategies: HeroStrategy[] = [
    HeroStrategy.REAL_PHOTO,
    HeroStrategy.PUBLIC_DOMAIN_PLATE,
  ]
  const realHero = heroCounts
    .filter((r) => realHeroStrategies.includes(r.heroImageStrategy))
    .reduce((sum, r) => sum + r._count._all, 0)
  const heroCoveragePercent =
    publishedCount > 0 ? Math.round((realHero / publishedCount) * 100) : 0

  const weeksSeen = new Set<string>()
  for (const p of editorialPicksAheadCount) weeksSeen.add(p.weekStarting.toISOString())
  const editorialWeeksAhead = weeksSeen.size

  const publishedDelta = publishedLastWeekCount - publishedPriorWeekCount
  const usersDelta = newUsersThisWeek - newUsersPriorWeek

  const inbox: AttentionInboxItem[] = [
    { key: 'reviews', label: 'Reviews awaiting moderation', count: pendingReviews, href: '/admin/reviews' },
    { key: 'photos', label: 'UGC photos awaiting moderation', count: pendingPhotos, href: '/admin/ugc-photos' },
    { key: 'questions', label: 'Q&A awaiting moderation', count: pendingQuestions, href: '/admin/questions' },
    { key: 'errata', label: 'Open errata reports', count: openErrata, href: '/admin/errata' },
    { key: 'reports', label: 'Open user reports', count: openReports, href: '/admin/reports' },
    { key: 'dmca', label: 'DMCA requests open', count: openDmca, href: '/admin/community/dmca' },
    { key: 'creators', label: 'Creator applications pending', count: creatorApplications, href: '/admin/creators' },
  ].filter((i) => i.count > 0)

  const kpis: KpiCard[] = [
    {
      key: 'published',
      label: 'Total published',
      value: publishedCount,
      delta7d: publishedDelta,
      sparkline: publishedSpark,
      href: '/admin/tutorials?status=PUBLISHED',
    },
    {
      key: 'users',
      label: 'Total users',
      value: totalUsers,
      delta7d: usersDelta,
      sparkline: newUserSpark,
      href: '/admin/users',
    },
    {
      key: 'active-projects',
      label: 'Active projects this week',
      value: activeProjectsThisWeek,
      delta7d: null,
      sparkline: activeProjectSpark,
      href: '/admin/users',
    },
    {
      key: 'new-signups',
      label: 'New signups this week',
      value: newUsersThisWeek,
      delta7d: usersDelta,
      sparkline: newUserSpark,
      href: '/admin/users',
    },
    {
      key: 'moderation',
      label: 'Moderation queue depth',
      value: moderationQueueDepth,
      delta7d: null,
      sparkline: [],
      href: '/admin/reviews',
    },
    {
      key: 'hero-coverage',
      label: 'Hero coverage',
      value: heroCoveragePercent,
      delta7d: null,
      sparkline: [],
      href: '/admin/media',
    },
    {
      key: 'today-published',
      label: 'Today’s auto-published',
      value: publishedTodayCount,
      delta7d: null,
      sparkline: [],
      href: '/admin/tutorials?status=PUBLISHED',
    },
    {
      key: 'editorial-picks',
      label: 'Editorial weeks queued',
      value: editorialWeeksAhead,
      delta7d: null,
      sparkline: [],
      href: '/admin/editorial-picks',
    },
  ]

  const publishedMap = new Map(publishedByCategory.map((p) => [p.categoryId, p._count._all]))
  const draftMap = new Map(draftByCategory.map((p) => [p.categoryId, p._count._all]))
  const lastPublishedMap = new Map(
    publishedByCategory.map((p) => [p.categoryId, p._max.publishedAt ?? null]),
  )
  const pipeline: CategoryPipelineRow[] = categoryRows.map((c) => {
    const pub = publishedMap.get(c.id) ?? 0
    const drf = draftMap.get(c.id) ?? 0
    const target = c.targetTutorialCount
    const fillPercent =
      target != null && target > 0 ? Math.min(100, Math.round((pub / target) * 100)) : null
    const lastPublishedAt = lastPublishedMap.get(c.id) ?? null
    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      published: pub,
      draft: drf,
      total: pub + drf,
      target,
      fillPercent,
      isPublicVisible: c.isPublicVisible,
      lastPublishedAt: lastPublishedAt ? lastPublishedAt.toISOString() : null,
    }
  })

  return { inbox, kpis, pipeline, generatedAt: Date.now() }
}

/**
 * Cached for 60s — refreshes often enough that the dashboard feels live but
 * not so often that we hammer the DB on tab refresh storms. Wraps the loader
 * with Next's request-tag cache so future invalidation can target it.
 */
export const getDashboardData = unstable_cache(loadDashboard, ['admin-dashboard'], {
  revalidate: 60,
  tags: ['admin-dashboard'],
})
