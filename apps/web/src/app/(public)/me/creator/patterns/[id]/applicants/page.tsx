import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { ApplicantControls } from './applicant-controls'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicantsPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const test = await prisma.patternTest.findUnique({
    where: { id },
    select: { id: true, creatorId: true, title: true, maxTesters: true },
  })
  if (!test) notFound()
  if (test.creatorId !== user.id) notFound()

  const applicants = await prisma.testAssignment.findMany({
    where: { patternTestId: test.id },
    orderBy: [{ status: 'asc' }, { appliedAt: 'desc' }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayHandle: true,
          email: true,
          _count: {
            select: {
              projects: true,
              reviews: true,
            },
          },
        },
      },
    },
  })

  const acceptedCount = applicants.filter(
    (a) =>
      a.status === TestAssignmentStatus.ACCEPTED ||
      a.status === TestAssignmentStatus.IN_PROGRESS ||
      a.status === TestAssignmentStatus.COMPLETED,
  ).length
  const remaining = Math.max(0, test.maxTesters - acceptedCount)

  return (
    <>
      <section>
        <span className="me-section-label">Pattern test</span>
        <h2 className="me-section-title">Applicants — {test.title}</h2>
        <p className="me-section-description">
          {acceptedCount} accepted · {remaining} slot{remaining === 1 ? '' : 's'} open
          (of {test.maxTesters}).
        </p>
        <p style={{ marginBottom: 16 }}>
          <Link href={`/me/creator/patterns/${test.id}`} className="me-nav-link">
            ← back to pattern test
          </Link>
        </p>
      </section>

      <section>
        {applicants.length === 0 ? (
          <p className="me-empty">No applicants yet. Once recruiting opens they’ll land here.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'var(--font-lora)' }}>
            {applicants.map((a) => (
              <li
                key={a.id}
                style={{
                  borderBottom: '0.5px solid var(--color-linen-grey)',
                  padding: '18px 0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 240 }}>
                    <strong style={{ fontFamily: 'var(--font-fraunces)', fontSize: 18 }}>
                      {a.user.name ?? a.user.displayHandle ?? a.user.email}
                    </strong>
                    {a.user.displayHandle && (
                      <span style={{ color: 'var(--color-warm-taupe)', marginLeft: 8 }}>
                        @{a.user.displayHandle}
                      </span>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 4 }}>
                      <span className="me-status-pill">
                        {a.status.toLowerCase().replace('_', ' ')}
                      </span>
                      <span style={{ marginLeft: 10 }}>
                        applied {a.appliedAt.toLocaleDateString('en-GB')}
                      </span>
                      <span style={{ marginLeft: 10 }}>
                        · {a.user._count.projects} projects · {a.user._count.reviews} reviews
                      </span>
                    </div>
                    {a.applicationNote && (
                      <p
                        style={{
                          marginTop: 10,
                          color: 'var(--color-espresso)',
                          fontStyle: 'italic',
                          maxWidth: 600,
                        }}
                      >
                        “{a.applicationNote}”
                      </p>
                    )}
                  </div>
                  <div>
                    <ApplicantControls
                      assignmentId={a.id}
                      status={a.status}
                      slotsOpen={remaining > 0}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
