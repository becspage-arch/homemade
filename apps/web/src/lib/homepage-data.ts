import 'server-only'
import { headers } from 'next/headers'
import {
  prisma,
  TutorialStatus,
  UserProjectStatus,
  type User,
} from '@homemade/db'
import {
  emptyReaderState,
  loadReaderState,
  type ReaderStateMap,
} from './user-state'
import {
  getCurrentSeasonalThemes,
  seasonalityScore,
  type SeasonalTheme,
} from './seasonality'
import { getCurrentWeekPicks, isoWeekStartUtc } from './editorial-picks'

const SPINE_CATEGORY_SLUGS = ['cooking', 'baking', 'garden', 'mindset', 'herbal']

interface TutorialCardSelect {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes: number | null
  timeMinutes: number | null
  dietaryFlags: string[]
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null; alt: string | null } | null
  publishedAt: Date | null
  categoryId: string
  mood: string[]
  season: string | null
  cuisine: string | null
  mealType: string | null
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  difficulty: true,
  totalMinutes: true,
  timeMinutes: true,
  dietaryFlags: true,
  category: { select: { slug: true, name: true } },
  hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
  publishedAt: true,
  categoryId: true,
  mood: true,
  season: true,
  cuisine: true,
  mealType: true,
} as const

export interface HomepageScheduledAction {
  userProjectId: string
  tutorial: TutorialCardSelect
  step: {
    title: string
    body: string
    surfaceAs: 'HERO' | 'RAIL_CARD' | 'NOTIFICATION_ONLY'
    stepNumber: number
  }
  nextScheduledAt: Date
}

export interface HomepageData {
  currentUser: User | null
  isOnboardingPending: boolean
  countryCode: string | null
  themes: SeasonalTheme[]
  // Rails (each may be empty — caller skips empty rails).
  todaysScheduledActions: HomepageScheduledAction[]
  continueMaking: TutorialCardSelect[]
  inSeasonNow: TutorialCardSelect[]
  thisWeeksEditorialPicks: TutorialCardSelect[]
  savedNotStarted: TutorialCardSelect[]
  whereYouLeftOff: TutorialCardSelect[]
  newSinceLastVisit: TutorialCardSelect[]
  mostLovedBySpine: { categorySlug: string; categoryName: string; tutorials: TutorialCardSelect[] }[]
  allCategories: { slug: string; name: string; description: string | null }[]
  // Reader state (bookmarks + project status) for every tutorial across every
  // rail. Lookups in the render layer pull from this map.
  readerState: ReaderStateMap
  // For the state-aware hero. Mutually exclusive options, evaluated in order.
  hero: HomepageHero
}

export type HomepageHero =
  | { kind: 'ONBOARDING' }
  | { kind: 'SCHEDULED_STEP'; action: HomepageScheduledAction }
  | { kind: 'CONTINUE_MAKING'; project: TutorialCardSelect }
  | { kind: 'EDITORIAL_PICK'; tutorial: TutorialCardSelect }
  | { kind: 'WORDMARK_FALLBACK' }

async function readCountryCode(): Promise<string | null> {
  try {
    const h = await headers()
    const cf = h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country')
    if (cf && cf.length === 2) return cf.toUpperCase()
  } catch {
    // headers() throws outside a request scope — fine in test contexts.
  }
  return null
}

/**
 * Single-pass loader for the homepage. Returns every rail's data plus the
 * reader-state map and the hero selection. Caller decides which rails to
 * render based on which arrays are non-empty.
 */
export async function loadHomepageData(
  currentUser: User | null,
  now: Date = new Date(),
): Promise<HomepageData> {
  const isOnboardingPending = currentUser ? currentUser.onboardedAt === null : false

  const cc = currentUser?.homeCountryCode ?? (await readCountryCode())
  const themes = getCurrentSeasonalThemes({ date: now, countryCode: cc })

  // Parallelise every independent query.
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14)

  const [
    scheduledActionRows,
    continueRows,
    candidateForSeasonality,
    editorialPicks,
    savedBookmarks,
    leftOffRows,
    newSinceLastVisitRows,
    spineCategoryRows,
    allCategoryRows,
  ] = await Promise.all([
    // Today's scheduled project actions — any UserProject whose next step is
    // due within the last 7 days and not completed.
    currentUser
      ? prisma.userProject.findMany({
          where: {
            userId: currentUser.id,
            status: UserProjectStatus.IN_PROGRESS,
            nextScheduledAt: { lte: now, gte: sevenDaysAgo },
          },
          orderBy: { nextScheduledAt: 'asc' },
          include: {
            tutorial: { select: CARD_SELECT },
          },
        })
      : Promise.resolve([]),
    // Continue making.
    currentUser
      ? prisma.userProject.findMany({
          where: {
            userId: currentUser.id,
            status: UserProjectStatus.IN_PROGRESS,
          },
          orderBy: { lastViewedAt: 'desc' },
          take: 8,
          include: {
            tutorial: { select: CARD_SELECT },
          },
        })
      : Promise.resolve([]),
    // Candidate pool for the seasonality rail. Pull a generous slice and rank
    // in memory.
    prisma.tutorial.findMany({
      where: { status: TutorialStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 200,
      select: CARD_SELECT,
    }),
    // Editorial picks for the current week.
    getCurrentWeekPicks(now),
    // Saved bookmarks the user hasn't started yet.
    currentUser
      ? prisma.bookmark.findMany({
          where: {
            userId: currentUser.id,
            tutorial: {
              status: TutorialStatus.PUBLISHED,
              projects: { none: { userId: currentUser.id } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
          include: { tutorial: { select: CARD_SELECT } },
        })
      : Promise.resolve([]),
    // Where you left off — IN_PROGRESS with no recent activity.
    currentUser
      ? prisma.userProject.findMany({
          where: {
            userId: currentUser.id,
            status: UserProjectStatus.IN_PROGRESS,
            lastViewedAt: { lt: fourteenDaysAgo },
          },
          orderBy: { lastViewedAt: 'asc' },
          take: 8,
          include: { tutorial: { select: CARD_SELECT } },
        })
      : Promise.resolve([]),
    // New since last visit.
    currentUser?.lastSeenAt
      ? prisma.tutorial.findMany({
          where: {
            status: TutorialStatus.PUBLISHED,
            publishedAt: { gt: currentUser.lastSeenAt },
          },
          orderBy: { publishedAt: 'desc' },
          take: 12,
          select: CARD_SELECT,
        })
      : Promise.resolve([]),
    // Most-loved per spine category. Build per-category rows after — we fetch
    // category rows then per-category tutorials in parallel below.
    prisma.category.findMany({
      where: { slug: { in: SPINE_CATEGORY_SLUGS } },
      select: { id: true, slug: true, name: true },
    }),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, description: true },
    }),
  ])

  // Schedule resolution: pull the corresponding ProjectSchedule rows so we
  // can render title + body for the homepage hero / rail entries.
  const scheduleByProjectId = new Map<
    string,
    {
      title: string
      body: string
      surfaceAs: 'HERO' | 'RAIL_CARD' | 'NOTIFICATION_ONLY'
      stepNumber: number
    }
  >()
  if (scheduledActionRows.length > 0) {
    const tutorialIds = Array.from(
      new Set(scheduledActionRows.map((r) => r.tutorialId)),
    )
    const stepNumbers = scheduledActionRows.map((r) => ({
      tutorialId: r.tutorialId,
      stepNumber: r.nextScheduledStepNumber ?? 0,
    }))
    const steps = await prisma.projectSchedule.findMany({
      where: {
        OR: stepNumbers.map((s) => ({
          tutorialId: s.tutorialId,
          stepNumber: s.stepNumber,
        })),
      },
    })
    for (const row of scheduledActionRows) {
      const step = steps.find(
        (s) =>
          s.tutorialId === row.tutorialId &&
          s.stepNumber === (row.nextScheduledStepNumber ?? 0),
      )
      if (step) {
        scheduleByProjectId.set(row.id, {
          title: step.title,
          body: step.body,
          surfaceAs: step.surfaceAs,
          stepNumber: step.stepNumber,
        })
      }
    }
  }

  const todaysScheduledActions: HomepageScheduledAction[] = scheduledActionRows
    .map((row) => {
      const step = scheduleByProjectId.get(row.id)
      if (!step || !row.nextScheduledAt) return null
      // Filter NOTIFICATION_ONLY — those don't surface on the homepage.
      if (step.surfaceAs === 'NOTIFICATION_ONLY') return null
      return {
        userProjectId: row.id,
        tutorial: row.tutorial as TutorialCardSelect,
        step,
        nextScheduledAt: row.nextScheduledAt,
      }
    })
    .filter((x): x is HomepageScheduledAction => x !== null)

  // In-season rail — score the candidate pool, take top 12 with non-zero score.
  const inSeasonNow: TutorialCardSelect[] = candidateForSeasonality
    .map((t) => ({ t, score: seasonalityScore(t, { date: now, countryCode: cc }) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.t as TutorialCardSelect)

  const thisWeeksEditorialPicks: TutorialCardSelect[] = editorialPicks.map(
    (p) => p.tutorial as unknown as TutorialCardSelect,
  )

  const savedNotStarted: TutorialCardSelect[] = savedBookmarks.map(
    (b) => b.tutorial as TutorialCardSelect,
  )
  const whereYouLeftOff: TutorialCardSelect[] = leftOffRows.map(
    (p) => p.tutorial as TutorialCardSelect,
  )
  const newSinceLastVisit: TutorialCardSelect[] = newSinceLastVisitRows.map(
    (t) => t as TutorialCardSelect,
  )

  // Per-spine most-loved. One query per category to keep the ranking simple.
  const mostLovedBySpine: HomepageData['mostLovedBySpine'] = []
  for (const slug of SPINE_CATEGORY_SLUGS) {
    const cat = spineCategoryRows.find((c) => c.slug === slug)
    if (!cat) continue
    const tutorials = await prisma.tutorial.findMany({
      where: { status: TutorialStatus.PUBLISHED, categoryId: cat.id },
      take: 12,
      orderBy: [
        { bookmarks: { _count: 'desc' } },
        { projects: { _count: 'desc' } },
        { publishedAt: 'desc' },
      ],
      select: CARD_SELECT,
    })
    if (tutorials.length > 0) {
      mostLovedBySpine.push({
        categorySlug: cat.slug,
        categoryName: cat.name,
        tutorials: tutorials as TutorialCardSelect[],
      })
    }
  }

  // Build the consolidated tutorial-id set for reader state.
  const allTutorialIds = new Set<string>()
  for (const a of todaysScheduledActions) allTutorialIds.add(a.tutorial.id)
  for (const t of continueRows.map((r) => r.tutorial)) allTutorialIds.add(t.id)
  for (const t of inSeasonNow) allTutorialIds.add(t.id)
  for (const t of thisWeeksEditorialPicks) allTutorialIds.add(t.id)
  for (const t of savedNotStarted) allTutorialIds.add(t.id)
  for (const t of whereYouLeftOff) allTutorialIds.add(t.id)
  for (const t of newSinceLastVisit) allTutorialIds.add(t.id)
  for (const group of mostLovedBySpine)
    for (const t of group.tutorials) allTutorialIds.add(t.id)

  const readerState = currentUser
    ? await loadReaderState(currentUser.id, Array.from(allTutorialIds))
    : emptyReaderState()

  // State-aware hero selection.
  let hero: HomepageHero
  if (isOnboardingPending) {
    hero = { kind: 'ONBOARDING' }
  } else {
    const heroAction =
      todaysScheduledActions.find((a) => a.step.surfaceAs === 'HERO') ?? null
    if (heroAction) {
      hero = { kind: 'SCHEDULED_STEP', action: heroAction }
    } else if (continueRows.length > 0 && currentUser) {
      const recent = continueRows[0]
      const lastViewed = recent ? recent.lastViewedAt : null
      const recentEnough =
        lastViewed && lastViewed.getTime() > thirtyDaysAgo.getTime()
      hero = recentEnough && recent
        ? { kind: 'CONTINUE_MAKING', project: recent.tutorial as TutorialCardSelect }
        : thisWeeksEditorialPicks[0]
          ? { kind: 'EDITORIAL_PICK', tutorial: thisWeeksEditorialPicks[0] }
          : { kind: 'WORDMARK_FALLBACK' }
    } else if (thisWeeksEditorialPicks[0]) {
      hero = { kind: 'EDITORIAL_PICK', tutorial: thisWeeksEditorialPicks[0] }
    } else {
      hero = { kind: 'WORDMARK_FALLBACK' }
    }
  }

  // Update lastSeenAt so the "new since last visit" rail uses last-real-visit
  // semantics. Fire-and-forget; failures here must not break the homepage.
  if (currentUser) {
    void prisma.user
      .update({
        where: { id: currentUser.id },
        data: { lastSeenAt: now },
      })
      .catch(() => undefined)
  }

  return {
    currentUser,
    isOnboardingPending,
    countryCode: cc,
    themes,
    todaysScheduledActions,
    continueMaking: continueRows.map((p) => p.tutorial as TutorialCardSelect),
    inSeasonNow,
    thisWeeksEditorialPicks,
    savedNotStarted,
    whereYouLeftOff,
    newSinceLastVisit,
    mostLovedBySpine,
    allCategories: allCategoryRows,
    readerState,
    hero,
  }
}

/**
 * Re-export for use by the page renderer.
 */
export { isoWeekStartUtc }
