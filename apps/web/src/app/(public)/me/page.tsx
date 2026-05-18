import Link from 'next/link'
import { prisma, TutorialType, UserProjectStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { redirect } from 'next/navigation'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaSrcSet } from '@/lib/media'
import { getReaderCounts } from '@/lib/user-state'

export const dynamic = 'force-dynamic'

const IN_PROGRESS_LIMIT = 3
const BOOKMARK_LIMIT = 6
const COMPLETED_LIMIT = 3

interface CompletedRow {
  completedAt: Date | null
  tutorial: {
    type: TutorialType
    category: { slug: string; name: string }
  }
}

interface Stats {
  recipesCookedThisMonth: number
  longestStreak: number
  mostCookedCategory: { name: string; slug: string; count: number } | null
}

export default async function MeDashboard() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  // One COMPLETED query covers both the "Recently completed" rail and the
  // stats strip — sort by completedAt desc, slice for the rail, fold the
  // whole set for stats. Userid+status index covers it.
  const [counts, inProgress, bookmarks, allCompleted] = await Promise.all([
    getReaderCounts(user.id),
    prisma.userProject.findMany({
      where: { userId: user.id, status: UserProjectStatus.IN_PROGRESS },
      orderBy: { lastViewedAt: 'desc' },
      take: IN_PROGRESS_LIMIT,
      include: {
        tutorial: {
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            difficulty: true,
            season: true,
            category: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        },
      },
    }),
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: BOOKMARK_LIMIT,
      include: {
        tutorial: {
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            difficulty: true,
            season: true,
            category: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        },
      },
    }),
    prisma.userProject.findMany({
      where: { userId: user.id, status: UserProjectStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        completedAt: true,
        tutorial: {
          select: {
            slug: true,
            title: true,
            type: true,
            category: { select: { slug: true, name: true } },
          },
        },
      },
    }),
  ])

  const completed = allCompleted.slice(0, COMPLETED_LIMIT)
  const stats = computeStats(allCompleted)

  return (
    <>
      <section className="me-stats-strip" aria-label="Cooking stats">
        <div className="me-stat">
          <span className="me-stat-label">Recipes this month</span>
          <span className="me-stat-value">{stats.recipesCookedThisMonth}</span>
          <span className="me-stat-detail">
            {stats.recipesCookedThisMonth === 0
              ? 'Nothing finished yet this month'
              : stats.recipesCookedThisMonth === 1
                ? '1 recipe completed'
                : `${stats.recipesCookedThisMonth} recipes completed`}
          </span>
        </div>
        <div className="me-stat">
          <span className="me-stat-label">Longest streak</span>
          <span className="me-stat-value">
            {stats.longestStreak === 0
              ? '–'
              : `${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}`}
          </span>
          <span className="me-stat-detail">
            {stats.longestStreak === 0
              ? 'Start a project to begin one'
              : 'Consecutive days you finished something'}
          </span>
        </div>
        <div className="me-stat">
          <span className="me-stat-label">Most-cooked category</span>
          <span className="me-stat-value">
            {stats.mostCookedCategory ? stats.mostCookedCategory.name : '–'}
          </span>
          <span className="me-stat-detail">
            {stats.mostCookedCategory
              ? `${stats.mostCookedCategory.count} completed`
              : 'Complete a project to see this'}
          </span>
        </div>
      </section>

      <section>
        <span className="me-section-label">Continue making</span>
        <h2 className="me-section-title">In progress</h2>
        {inProgress.length === 0 ? (
          <p className="me-empty">
            Nothing in progress. When you start a tutorial it lands here so
            you can pick it back up later.
          </p>
        ) : (
          <div className="me-grid">
            {inProgress.map((p) => (
              <Link
                key={p.id}
                href={`/me/projects/${p.id}`}
                className="me-project-card"
              >
                <span className="me-project-eyebrow">
                  {p.tutorial.category.name}
                </span>
                <span className="me-project-title">{p.tutorial.title}</span>
                <span className="me-progress-bar" aria-hidden="true">
                  <span
                    className="me-progress-bar-fill"
                    style={{ width: `${p.readingProgressPercent}%` }}
                  />
                </span>
                <span className="me-project-meta">
                  <span>{p.readingProgressPercent}% through</span>
                  <span>· started {formatShortDate(p.startedAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <span className="me-section-label">Saved for later</span>
        <h2 className="me-section-title">Recent bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="me-empty">
            No bookmarks yet. Save tutorials from any page to come back to.
          </p>
        ) : (
          <div className="me-grid">
            {bookmarks.map((b) => {
              const card = mediaSrcSet(b.tutorial.hero, 'card', ['public'])
              return (
                <TutorialCard
                  key={b.id}
                  href={`/${b.tutorial.category.slug}/${b.tutorial.slug}`}
                  title={b.tutorial.title}
                  excerpt={b.tutorial.excerpt}
                  heroUrl={card?.src ?? null}
                  heroSrcSet={card?.srcSet}
                  difficulty={b.tutorial.difficulty}
                  season={b.tutorial.season}
                  categoryName={b.tutorial.category.name}
                  state={{
                    bookmarked: true,
                    projectStatus: null,
                    projectId: null,
                    projectProgressPercent: null,
                  }}
                />
              )
            })}
          </div>
        )}
        {counts.bookmarks > BOOKMARK_LIMIT && (
          <p style={{ marginTop: 16 }}>
            <Link href="/me/bookmarks" className="me-nav-link">
              All {counts.bookmarks} bookmarks →
            </Link>
          </p>
        )}
      </section>

      <section>
        <span className="me-section-label">Finished work</span>
        <h2 className="me-section-title">Recently completed</h2>
        {completed.length === 0 ? (
          <p className="me-empty">
            Once you mark a project complete it lands here as a small record
            of what you&apos;ve made.
          </p>
        ) : (
          <div className="me-grid">
            {completed.map((p) => (
              <Link
                key={p.id}
                href={`/${p.tutorial.category.slug}/${p.tutorial.slug}`}
                className="me-project-card"
              >
                <span className="me-project-eyebrow">
                  {p.tutorial.category.name}
                </span>
                <span className="me-project-title">{p.tutorial.title}</span>
                <span className="me-project-meta">
                  <span className="me-status-pill completed">Completed</span>
                  {p.completedAt && (
                    <span>· {formatShortDate(p.completedAt)}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function computeStats(rows: CompletedRow[]): Stats {
  const now = new Date()
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  )

  let recipesCookedThisMonth = 0
  const categoryTallies = new Map<
    string,
    { slug: string; name: string; count: number }
  >()
  const completionDays = new Set<string>()

  for (const row of rows) {
    if (!row.completedAt) continue

    if (
      row.tutorial.type === TutorialType.RECIPE &&
      row.completedAt >= monthStart
    ) {
      recipesCookedThisMonth += 1
    }

    const cat = row.tutorial.category
    const existing = categoryTallies.get(cat.slug)
    if (existing) {
      existing.count += 1
    } else {
      categoryTallies.set(cat.slug, { slug: cat.slug, name: cat.name, count: 1 })
    }

    completionDays.add(dayKey(row.completedAt))
  }

  const longestStreak = computeLongestStreak(completionDays)

  let mostCookedCategory: Stats['mostCookedCategory'] = null
  for (const cat of categoryTallies.values()) {
    if (!mostCookedCategory || cat.count > mostCookedCategory.count) {
      mostCookedCategory = cat
    }
  }

  return { recipesCookedThisMonth, longestStreak, mostCookedCategory }
}

function dayKey(d: Date): string {
  // UTC date key so streak logic doesn't drift with timezone-local renders.
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

function computeLongestStreak(days: Set<string>): number {
  if (days.size === 0) return 0
  const sorted = Array.from(days)
    .map((k) => {
      const [y, m, d] = k.split('-').map((n) => Number.parseInt(n, 10))
      return Date.UTC(y!, m!, d!)
    })
    .sort((a, b) => a - b)

  let longest = 1
  let current = 1
  const oneDay = 24 * 60 * 60 * 1000
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]!
    const cur = sorted[i]!
    if (cur - prev === oneDay) {
      current += 1
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }
  return longest
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
