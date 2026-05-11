import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, PatternTestStatus, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { ApplyToPatternTestForm } from './apply-to-pattern-test'

import '../patterns.css'
import '../../makers/makers.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatternTestDetailPage({ params }: PageProps) {
  const { id } = await params
  const [test, user] = await Promise.all([
    prisma.patternTest.findUnique({
      where: { id },
      include: {
        tutorial: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            timeMinutes: true,
            difficulty: true,
            category: { select: { slug: true, name: true } },
          },
        },
        creator: {
          select: { name: true, displayHandle: true, creatorVerifiedAt: true },
        },
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
    getCurrentDbUser(),
  ])
  if (!test) notFound()
  if (
    test.status !== PatternTestStatus.RECRUITING &&
    test.status !== PatternTestStatus.IN_PROGRESS &&
    test.status !== PatternTestStatus.COMPLETED
  ) {
    notFound()
  }

  const existingAssignment = user
    ? await prisma.testAssignment.findUnique({
        where: { patternTestId_userId: { patternTestId: test.id, userId: user.id } },
      })
    : null

  const remaining = Math.max(0, test.maxTesters - test._count.assignments)

  return (
    <div className="pattern-detail">
      <p style={{ marginBottom: 16 }}>
        <Link href="/patterns" className="me-nav-link">
          ← all pattern tests
        </Link>
      </p>
      <span className="patterns-eyebrow">{test.tutorial.category.name}</span>
      <h1 className="patterns-title">{test.title}</h1>

      <div
        style={{
          fontFamily: 'var(--font-lora)',
          color: 'var(--color-warm-taupe)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 4,
        }}
      >
        <span className="me-status-pill">{test.status.toLowerCase().replace('_', ' ')}</span>
        {test.creator.displayHandle && (
          <span>
            by{' '}
            <Link
              href={`/makers/${test.creator.displayHandle}`}
              style={{ color: 'var(--color-sage)' }}
            >
              @{test.creator.displayHandle}
            </Link>
          </span>
        )}
        <span>· {test._count.assignments} of {test.maxTesters} testers</span>
        {test.recruitingClosesAt && (
          <span>· closes {test.recruitingClosesAt.toLocaleDateString('en-GB')}</span>
        )}
      </div>

      <section className="pattern-detail-section">
        <span className="patterns-eyebrow">Brief</span>
        <div className="pattern-detail-brief" style={{ marginTop: 10 }}>
          {test.briefForTesters}
        </div>
      </section>

      <section className="pattern-detail-section">
        <span className="patterns-eyebrow">Tutorial</span>
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontWeight: 400,
            fontSize: 22,
            color: 'var(--color-espresso)',
            margin: '8px 0',
          }}
        >
          <Link
            href={`/${test.tutorial.category.slug}/${test.tutorial.slug}`}
            style={{ color: 'var(--color-sage)' }}
          >
            {test.tutorial.title} →
          </Link>
        </h2>
        {test.tutorial.excerpt && (
          <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
            {test.tutorial.excerpt}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)', marginTop: 6 }}>
          {test.tutorial.difficulty.toLowerCase()}
          {test.tutorial.timeMinutes != null &&
            ` · about ${test.tutorial.timeMinutes} min`}
        </p>
      </section>

      <section className="pattern-detail-section">
        <span className="patterns-eyebrow">Take part</span>
        {test.status !== PatternTestStatus.RECRUITING ? (
          <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)', marginTop: 8 }}>
            Recruiting is closed for this test.
          </p>
        ) : remaining === 0 ? (
          <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)', marginTop: 8 }}>
            All slots are full. You can still apply — the creator may bump the
            cap or you might come off the waitlist.
          </p>
        ) : null}
        <ApplyCTA
          test={{ id: test.id, status: test.status }}
          user={user}
          existingAssignment={existingAssignment}
        />
      </section>
    </div>
  )
}

function ApplyCTA({
  test,
  user,
  existingAssignment,
}: {
  test: { id: string; status: PatternTestStatus }
  user: { id: string; isPatternTester: boolean; isSuspended: boolean } | null
  existingAssignment: { status: TestAssignmentStatus } | null
}) {
  if (test.status !== PatternTestStatus.RECRUITING) return null

  if (!user) {
    return (
      <p style={{ marginTop: 12 }}>
        <Link href="/sign-in" className="me-button">
          Sign in to apply
        </Link>
      </p>
    )
  }

  if (user.isSuspended) {
    return (
      <p style={{ marginTop: 12, fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
        Your account isn’t currently eligible to apply.
      </p>
    )
  }

  if (!user.isPatternTester) {
    return (
      <p style={{ marginTop: 12 }}>
        <Link href="/me/tester/apply" className="me-button">
          Join the tester pool first
        </Link>
      </p>
    )
  }

  if (existingAssignment) {
    return (
      <p style={{ marginTop: 12, fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
        You’ve already applied — status: {existingAssignment.status.toLowerCase().replace('_', ' ')}.{' '}
        <Link href="/me/tester/assignments" className="me-nav-link">
          See your assignments →
        </Link>
      </p>
    )
  }

  return <ApplyToPatternTestForm patternTestId={test.id} />
}
