import 'server-only'
import { headers } from 'next/headers'
import {
  prisma,
  TutorialStatus,
  TutorialType,
  UserProjectStatus,
  Visibility,
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

// Tutorial types that count as "make something this week" on the discovery
// wall + the inspiring hero. Learn-type tutorials (TECHNIQUE, STITCH, READING,
// HERB_PROFILE) teach a skill rather than produce a finished make, so they're
// kept out of these inspire-to-make surfaces (they still appear on category
// pages + search). PRACTICE (mindset) is excluded pending owner sign-off on
// whether a mindset practice counts as "making something".
export const MAKE_SOMETHING_TUTORIAL_TYPES: TutorialType[] = [
  TutorialType.RECIPE,
  TutorialType.REMEDY,
  TutorialType.GROWING_GUIDE,
  TutorialType.PATTERN,
]

// How many real patterns to surface in the discovery feed / hero rotation.
const DISCOVERY_PATTERN_LIMIT = 24

interface TutorialCardSelect {
  id: string
  slug: string
  title: string
  type: TutorialType
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
  heroQuality: 'EDITORIAL' | 'STANDARD' | 'FALLBACK'
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  type: true,
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
  heroQuality: true,
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

interface HomepageMedia {
  cloudflareId: string | null
  r2Key: string | null
  alt: string | null
}

// A real, published pattern from the catalogue, shaped for the discovery wall
// and the inspiring hero. Spans the generic Pattern model (cross-stitch /
// knitting / crochet) and the NeedleworkPattern model. `craftSlug` is the
// public category the detail page lives under; `detailHref` is pre-resolved by
// the loader so the render layer doesn't need to know the routing rules.
export interface DiscoveryPatternCard {
  id: string
  slug: string | null
  name: string
  craftSlug: string
  detailHref: string
  hero: HomepageMedia | null
  thumbnail: HomepageMedia | null
}

// In-progress pattern (from UserPatternProgress) shaped for the resume rail.
// Patterns live in a separate progress system from tutorials, so they carry
// their own minimal card shape and route to the right Studio by type.
export interface ContinueMakingPattern {
  id: string
  slug: string | null
  name: string
  type: string
  hero: { cloudflareId: string | null; r2Key: string | null } | null
}

export interface HomepageData {
  currentUser: User | null
  isOnboardingPending: boolean
  countryCode: string | null
  themes: SeasonalTheme[]
  // Rails (each may be empty — caller skips empty rails).
  todaysScheduledActions: HomepageScheduledAction[]
  continueMaking: TutorialCardSelect[]
  continueMakingPatterns: ContinueMakingPattern[]
  inSeasonNow: TutorialCardSelect[]
  thisWeeksEditorialPicks: TutorialCardSelect[]
  savedNotStarted: TutorialCardSelect[]
  whereYouLeftOff: TutorialCardSelect[]
  newSinceLastVisit: TutorialCardSelect[]
  mostLovedBySpine: { categorySlug: string; categoryName: string; tutorials: TutorialCardSelect[] }[]
  // Real published patterns (Pattern + NeedleworkPattern) for the discovery
  // wall — interleaved with the tutorials so the wall mixes recipes, makes and
  // patterns rather than food alone.
  discoveryPatterns: DiscoveryPatternCard[]
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
  | { kind: 'PATTERN_PICK'; pattern: DiscoveryPatternCard }
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
    featuredPatternRows,
    featuredNeedleworkRows,
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
      where: { slug: { in: SPINE_CATEGORY_SLUGS }, isPublicVisible: true },
      select: { id: true, slug: true, name: true },
    }),
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, description: true },
    }),
    // Real published patterns for the discovery wall + hero rotation. Only
    // rows with a persisted image (chart render thumbnail or finished-piece
    // hero) so every tile resolves to a picture, ranked by popularity then
    // recency. Limited to publicly-visible craft categories so links resolve.
    prisma.pattern.findMany({
      where: {
        visibility: Visibility.PUBLIC,
        publishedAt: { not: null },
        OR: [
          { thumbnailMediaId: { not: null } },
          { heroMediaId: { not: null } },
        ],
        subCategory: { category: { isPublicVisible: true } },
      },
      orderBy: [{ popularityScore: 'desc' }, { publishedAt: 'desc' }],
      take: DISCOVERY_PATTERN_LIMIT,
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
        thumbnail: { select: { cloudflareId: true, r2Key: true, alt: true } },
        subCategory: { select: { category: { select: { slug: true } } } },
      },
    }),
    prisma.needleworkPattern.findMany({
      where: {
        visibility: Visibility.PUBLIC,
        publishedAt: { not: null },
        OR: [
          { thumbnailMediaId: { not: null } },
          { heroMediaId: { not: null } },
        ],
      },
      orderBy: [{ publishedAt: 'desc' }],
      take: DISCOVERY_PATTERN_LIMIT,
      select: {
        id: true,
        slug: true,
        name: true,
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
        thumbnail: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
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

  // Map the two pattern models into one discovery shape, pre-resolving the
  // detail href so the render layer stays routing-agnostic. Cross-stitch +
  // needlework have public detail pages; a knitting / crochet row without a
  // detail route falls back to opening its Studio.
  const genericPatternCards: DiscoveryPatternCard[] = featuredPatternRows.map((p) => {
    const craftSlug = patternCraftSlug(p.type, p.subCategory?.category.slug)
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      craftSlug,
      detailHref: patternDetailHref({
        source: 'pattern',
        slug: p.slug,
        id: p.id,
        craftSlug,
        patternType: p.type,
      }),
      hero: p.hero,
      thumbnail: p.thumbnail,
    }
  })
  const needleworkPatternCards: DiscoveryPatternCard[] = featuredNeedleworkRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    craftSlug: 'needlework',
    detailHref: patternDetailHref({
      source: 'needlework',
      slug: p.slug,
      id: p.id,
      craftSlug: 'needlework',
      patternType: null,
    }),
    hero: p.hero,
    thumbnail: p.thumbnail,
  }))
  // Interleave the two pattern models (Pattern + NeedleworkPattern) rather than
  // concatenating, so needlework actually surfaces in the discovery wall's
  // visible window instead of being crowded out behind a full block of
  // cross-stitch rows.
  const discoveryPatterns: DiscoveryPatternCard[] = []
  for (let i = 0, n = Math.max(genericPatternCards.length, needleworkPatternCards.length); i < n; i++) {
    const g = genericPatternCards[i]
    if (g) discoveryPatterns.push(g)
    const nw = needleworkPatternCards[i]
    if (nw) discoveryPatterns.push(nw)
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

  // Hero selection. The big hero is always an inspiring make — never a
  // previously-viewed project. "Continue where you left off" has its own rail
  // below; the hero's job is to inspire, not to resume (Rebecca, 2026-06-19).
  //
  // Rotates on a DAILY bucket and deliberately STEPS THROUGH THE CATEGORIES in
  // turn — cooking → baking → cross-stitch → … one category per day — instead
  // of leaning on whichever category has the most content. Candidates are
  // grouped by category (each category's editorial / seasonal tutorials +
  // real patterns) then round-robined across categories, so consecutive days
  // feature different categories and every live category gets the spotlight.
  // Tutorial pool preference: EDITORIAL-graded picks → the full weekly pick
  // list → in-season content; only "make something" types ever lead the hero.
  // Lands on the wordmark only when there is genuinely nothing to show.
  let hero: HomepageHero
  if (isOnboardingPending) {
    hero = { kind: 'ONBOARDING' }
  } else {
    const editorialGraded = thisWeeksEditorialPicks.filter(
      (t) => t.heroQuality === 'EDITORIAL',
    )
    const tutorialPoolRaw =
      editorialGraded.length > 0
        ? editorialGraded
        : thisWeeksEditorialPicks.length > 0
          ? thisWeeksEditorialPicks
          : inSeasonNow
    const tutorialPool = tutorialPoolRaw.filter((t) =>
      MAKE_SOMETHING_TUTORIAL_TYPES.includes(t.type),
    )

    // Group hero candidates by their category.
    const byCategory = new Map<string, HomepageHero[]>()
    const pushCandidate = (slug: string, item: HomepageHero) => {
      const list = byCategory.get(slug) ?? []
      list.push(item)
      byCategory.set(slug, list)
    }
    for (const t of tutorialPool) {
      pushCandidate(t.category.slug, { kind: 'EDITORIAL_PICK', tutorial: t })
    }
    for (const p of discoveryPatterns) {
      pushCandidate(p.craftSlug, { kind: 'PATTERN_PICK', pattern: p })
    }

    // Cap the pool to ONE best candidate per publicly-visible category, in
    // public launch order. This is deliberately NOT round-robin: cross-stitch
    // and needlework each carry up to DISCOVERY_PATTERN_LIMIT (24) patterns
    // while cooking / baking contribute only a handful of editorial picks, so a
    // round-robin pool is ~48 pattern entries vs a few food ones and the daily
    // bucket lands on a pattern craft nearly every day. Taking a single entry
    // per category makes each launch-ordered slug an equal-weight slot, so
    // stepping the day bucket forward cycles evenly through every live category
    // (cooking → baking → needlework → cross-stitch → …).
    //
    // Within a category the candidates are ordered editorial tutorials first,
    // then real patterns. A tutorial only qualifies if it actually has a hero
    // image; if its best one has none we skip to the next candidate (patterns
    // always carry a thumbnail). A category with no image-bearing candidate is
    // simply skipped this cycle.
    const orderedSlugs = allCategoryRows
      .map((c) => c.slug)
      .filter((s) => byCategory.has(s))
    const heroPool: HomepageHero[] = []
    for (const slug of orderedSlugs) {
      const best = byCategory.get(slug)?.find(heroHasUsableImage)
      if (best) heroPool.push(best)
    }
    hero = pickByDayBucket(heroPool, now, 1) ?? { kind: 'WORDMARK_FALLBACK' }
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

  // In-progress patterns (separate progress system) join the resume rail.
  const patternProgressRows = currentUser
    ? await prisma.userPatternProgress.findMany({
        where: { userId: currentUser.id, completedAt: null },
        orderBy: { lastStitchedAt: 'desc' },
        take: 6,
        select: {
          pattern: {
            select: {
              id: true,
              slug: true,
              name: true,
              type: true,
              hero: { select: { cloudflareId: true, r2Key: true } },
            },
          },
        },
      })
    : []
  const continueMakingPatterns: ContinueMakingPattern[] = patternProgressRows.map(
    (r) => ({
      id: r.pattern.id,
      slug: r.pattern.slug,
      name: r.pattern.name,
      type: r.pattern.type,
      hero: r.pattern.hero,
    }),
  )

  return {
    currentUser,
    isOnboardingPending,
    countryCode: cc,
    themes,
    todaysScheduledActions,
    continueMaking: continueRows.map((p) => p.tutorial as TutorialCardSelect),
    continueMakingPatterns,
    inSeasonNow,
    thisWeeksEditorialPicks,
    savedNotStarted,
    whereYouLeftOff,
    newSinceLastVisit,
    mostLovedBySpine,
    discoveryPatterns,
    allCategories: allCategoryRows,
    readerState,
    hero,
  }
}

/**
 * Re-export for use by the page renderer.
 */
export { isoWeekStartUtc }

/**
 * Deterministic round-robin pick from `pool`, advancing every `windowDays`.
 * Uses the UTC epoch so every server instance picks the same item on a
 * given day without coordination. Returns null on empty input.
 */
/** Whether a hero candidate resolves to a real picture. An EDITORIAL_PICK
 *  tutorial needs a hero image (cloudflareId or r2Key); a PATTERN_PICK always
 *  carries a thumbnail, so it always qualifies. Other kinds never enter the
 *  rotation pool. */
function heroHasUsableImage(item: HomepageHero): boolean {
  if (item.kind === 'PATTERN_PICK') return true
  if (item.kind === 'EDITORIAL_PICK') {
    const h = item.tutorial.hero
    return Boolean(h && (h.cloudflareId || h.r2Key))
  }
  return false
}

function pickByDayBucket<T>(pool: T[], now: Date, windowDays: number): T | null {
  if (pool.length === 0) return null
  const msPerWindow = windowDays * 24 * 60 * 60 * 1000
  const bucket = Math.floor(now.getTime() / msPerWindow)
  const index = ((bucket % pool.length) + pool.length) % pool.length
  return pool[index] ?? null
}

/** Public craft category a Pattern row lives under. Prefers the row's
 *  sub-category's category; falls back to the pattern type when unset. */
function patternCraftSlug(type: string, categorySlug?: string): string {
  if (categorySlug) return categorySlug
  switch (type) {
    case 'KNITTING_CHART':
      return 'knitting'
    case 'CROCHET_CHART':
      return 'crochet'
    default:
      return 'cross-stitch'
  }
}

/** Resolve the public detail href for a pattern. Cross-stitch + needlework
 *  have detail pages; a slug-less (or route-less) row opens its Studio. */
function patternDetailHref(p: {
  source: 'pattern' | 'needlework'
  slug: string | null
  id: string
  craftSlug: string
  patternType: string | null
}): string {
  if (p.source === 'needlework') {
    return p.slug ? `/needlework/patterns/${p.slug}` : '/needlework'
  }
  if (p.craftSlug === 'cross-stitch' && p.slug) {
    return `/cross-stitch/patterns/${p.slug}`
  }
  // Knitting / crochet have no public detail route yet — open the Studio.
  const studio =
    p.patternType === 'KNITTING_CHART'
      ? 'knitting'
      : p.patternType === 'CROCHET_CHART'
        ? 'crochet'
        : 'cross-stitch'
  return `/studio/${studio}?patternId=${p.id}`
}
