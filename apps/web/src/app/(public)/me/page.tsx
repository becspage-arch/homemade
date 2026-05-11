import Link from 'next/link'
import { prisma, UserProjectStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { redirect } from 'next/navigation'
import { TutorialCard } from '@/components/public/tutorial-card'
import { cloudflareDeliveryUrl } from '@/lib/media'
import { getReaderCounts } from '@/lib/user-state'

export const dynamic = 'force-dynamic'

const IN_PROGRESS_LIMIT = 3
const BOOKMARK_LIMIT = 6
const COMPLETED_LIMIT = 3

export default async function MeDashboard() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const [counts, inProgress, bookmarks, completed] = await Promise.all([
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
            hero: { select: { cloudflareId: true } },
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
            hero: { select: { cloudflareId: true } },
          },
        },
      },
    }),
    prisma.userProject.findMany({
      where: { userId: user.id, status: UserProjectStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      take: COMPLETED_LIMIT,
      include: {
        tutorial: {
          select: {
            slug: true,
            title: true,
            category: { select: { slug: true, name: true } },
          },
        },
      },
    }),
  ])

  return (
    <>
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
            {bookmarks.map((b) => (
              <TutorialCard
                key={b.id}
                href={`/${b.tutorial.category.slug}/${b.tutorial.slug}`}
                title={b.tutorial.title}
                excerpt={b.tutorial.excerpt}
                heroUrl={cloudflareDeliveryUrl(
                  b.tutorial.hero?.cloudflareId,
                  'card',
                )}
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
            ))}
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
            of what you've made.
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

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
