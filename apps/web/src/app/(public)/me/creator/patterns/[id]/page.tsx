import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, PatternTestStatus, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PatternTestForm } from '../pattern-test-form'
import { PatternTestStatusControls } from './pattern-test-status-controls'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatternTestEditPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const test = await prisma.patternTest.findUnique({
    where: { id },
    include: {
      tutorial: { select: { id: true, title: true } },
      _count: {
        select: {
          assignments: { where: { status: TestAssignmentStatus.APPLIED } },
        },
      },
    },
  })
  if (!test) notFound()
  if (test.creatorId !== user.id) notFound()

  const tutorials = await prisma.tutorial.findMany({
    where: { creatorId: user.id },
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">{test.title}</h2>
        <div
          style={{
            fontFamily: 'var(--font-lora)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            color: 'var(--color-warm-taupe)',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <span className="me-status-pill">
            {test.status.toLowerCase().replace('_', ' ')}
          </span>
          <span>tutorial: {test.tutorial.title}</span>
          <Link href="/me/creator/patterns" className="me-nav-link">
            ← all pattern tests
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          <Link
            href={`/me/creator/patterns/${test.id}/applicants`}
            className="me-button secondary"
          >
            Applicants
            {test._count.assignments > 0 ? ` (${test._count.assignments} pending)` : ''}
          </Link>
          <Link
            href={`/me/creator/patterns/${test.id}/feedback`}
            className="me-button secondary"
          >
            Feedback
          </Link>
          {test.status === PatternTestStatus.RECRUITING && (
            <Link href={`/patterns/${test.id}`} className="me-button secondary">
              View public listing →
            </Link>
          )}
        </div>
      </section>

      <PatternTestStatusControls
        patternTestId={test.id}
        status={test.status}
      />

      <section>
        <span className="me-section-label">Details</span>
        <h2 className="me-section-title">Edit</h2>
        <PatternTestForm
          tutorials={tutorials}
          patternTestId={test.id}
          defaults={{
            tutorialId: test.tutorialId,
            title: test.title,
            briefForTesters: test.briefForTesters,
            maxTesters: test.maxTesters,
            recruitingClosesAt: test.recruitingClosesAt
              ? test.recruitingClosesAt.toISOString().slice(0, 10)
              : '',
          }}
        />
      </section>
    </>
  )
}
