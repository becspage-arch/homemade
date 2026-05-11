import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { AssignmentBody } from './assignment-body'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TesterAssignmentPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const assignment = await prisma.testAssignment.findUnique({
    where: { id },
    include: {
      patternTest: {
        include: {
          tutorial: {
            select: {
              id: true,
              title: true,
              slug: true,
              timeMinutes: true,
              category: { select: { slug: true } },
            },
          },
          creator: { select: { name: true, displayHandle: true } },
        },
      },
    },
  })
  if (!assignment) notFound()
  if (assignment.userId !== user.id) notFound()

  return (
    <>
      <section>
        <span className="me-section-label">Pattern test</span>
        <h2 className="me-section-title">{assignment.patternTest.title}</h2>
        <div
          style={{
            fontFamily: 'var(--font-lora)',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            color: 'var(--color-warm-taupe)',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <span className="me-status-pill">
            {assignment.status.toLowerCase().replace('_', ' ')}
          </span>
          <span>· tutorial: {assignment.patternTest.tutorial.title}</span>
          {assignment.patternTest.creator.displayHandle && (
            <span>
              · creator:{' '}
              <Link
                href={`/makers/${assignment.patternTest.creator.displayHandle}`}
                style={{ color: 'var(--color-sage)' }}
              >
                @{assignment.patternTest.creator.displayHandle}
              </Link>
            </span>
          )}
        </div>
        <p style={{ marginBottom: 16 }}>
          <Link href="/me/tester/assignments" className="me-nav-link">
            ← all your assignments
          </Link>
        </p>
      </section>

      <section>
        <span className="me-section-label">Brief</span>
        <h2 className="me-section-title">From the creator</h2>
        <p
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-espresso)',
            whiteSpace: 'pre-wrap',
            background: 'var(--color-soft-parchment)',
            border: '0.5px solid var(--color-linen-grey)',
            padding: 20,
            borderRadius: 4,
            maxWidth: '60ch',
          }}
        >
          {assignment.patternTest.briefForTesters}
        </p>
        <p style={{ marginTop: 14 }}>
          <Link
            href={`/${assignment.patternTest.tutorial.category.slug}/${assignment.patternTest.tutorial.slug}`}
            className="me-button secondary"
          >
            Open the tutorial →
          </Link>
        </p>
      </section>

      <AssignmentBody
        assignmentId={assignment.id}
        status={assignment.status}
        estimatedMinutes={assignment.patternTest.tutorial.timeMinutes}
        existingFeedback={
          assignment.feedback &&
          typeof assignment.feedback === 'object' &&
          !Array.isArray(assignment.feedback)
            ? (assignment.feedback as Record<string, unknown>)
            : null
        }
      />
    </>
  )
}
