import Link from 'next/link'
import { prisma, PatternTestStatus, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

import './patterns.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function PatternsBoardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const categorySlug = params.category?.trim() || null

  const [tests, categories, user] = await Promise.all([
    prisma.patternTest.findMany({
      where: {
        status: PatternTestStatus.RECRUITING,
        ...(categorySlug
          ? {
              tutorial: {
                category: { slug: categorySlug },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tutorial: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            category: { select: { slug: true, name: true } },
          },
        },
        creator: { select: { name: true, displayHandle: true } },
        _count: {
          select: {
            assignments: {
              where: {
                status: {
                  in: [
                    TestAssignmentStatus.APPLIED,
                    TestAssignmentStatus.ACCEPTED,
                    TestAssignmentStatus.IN_PROGRESS,
                    TestAssignmentStatus.COMPLETED,
                  ],
                },
              },
            },
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true },
    }),
    getCurrentDbUser(),
  ])

  // If the user isn't a tester yet, encourage them to opt in.
  const promptJoin = user && !user.isPatternTester

  return (
    <div className="patterns-page">
      <header className="patterns-header">
        <span className="patterns-eyebrow">Pattern testing</span>
        <h1 className="patterns-title">Open pattern tests</h1>
        <p className="patterns-intro">
          Help a Homemade creator refine their tutorial by making it yourself
          and writing structured feedback. Self-paced — apply only when
          something speaks to you.
        </p>
        {promptJoin && (
          <p style={{ marginTop: 12 }}>
            <Link href="/me/tester/apply" className="me-button">
              Join the tester pool
            </Link>
          </p>
        )}
        {!user && (
          <p style={{ marginTop: 12 }}>
            <Link href="/sign-in" className="me-button">
              Sign in to apply
            </Link>
          </p>
        )}

        <nav className="patterns-filters" aria-label="Filter by category">
          <Link
            href="/patterns"
            className={`makers-filter ${!categorySlug ? 'active' : ''}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/patterns?category=${c.slug}`}
              className={`makers-filter ${categorySlug === c.slug ? 'active' : ''}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </header>

      {tests.length === 0 ? (
        <p className="makers-empty">
          {categorySlug
            ? 'No pattern tests recruiting in this category right now.'
            : 'No pattern tests recruiting right now. Check back soon.'}
        </p>
      ) : (
        <div className="patterns-grid">
          {tests.map((t) => {
            const remaining = Math.max(0, t.maxTesters - t._count.assignments)
            return (
              <Link key={t.id} href={`/patterns/${t.id}`} className="pattern-card">
                <span className="pattern-card-eyebrow">{t.tutorial.category.name}</span>
                <h2 className="pattern-card-title">{t.title}</h2>
                <p className="pattern-card-tutorial">
                  Tutorial: {t.tutorial.title}
                </p>
                <p className="pattern-card-brief">
                  {t.briefForTesters.slice(0, 220)}
                  {t.briefForTesters.length > 220 ? '…' : ''}
                </p>
                <div className="pattern-card-meta">
                  <span>
                    {remaining > 0
                      ? `${remaining} of ${t.maxTesters} spots open`
                      : 'Spots full — waitlist'}
                  </span>
                  {t.creator.displayHandle && (
                    <span>by @{t.creator.displayHandle}</span>
                  )}
                  {t.recruitingClosesAt && (
                    <span>closes {t.recruitingClosesAt.toLocaleDateString('en-GB')}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
