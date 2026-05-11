import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export default async function TesterHomePage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isPatternTester) redirect('/me/tester/apply')

  const [assignments, openTests] = await Promise.all([
    prisma.testAssignment.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: {
        patternTest: {
          select: {
            id: true,
            title: true,
            tutorial: { select: { title: true } },
          },
        },
      },
    }),
    prisma.patternTest.count({
      where: { status: 'RECRUITING' },
    }),
  ])

  const buckets = {
    active: assignments.filter(
      (a) =>
        a.status === TestAssignmentStatus.ACCEPTED ||
        a.status === TestAssignmentStatus.IN_PROGRESS,
    ),
    pending: assignments.filter((a) => a.status === TestAssignmentStatus.APPLIED),
    closed: assignments.filter(
      (a) =>
        a.status === TestAssignmentStatus.COMPLETED ||
        a.status === TestAssignmentStatus.WITHDRAWN ||
        a.status === TestAssignmentStatus.REJECTED,
    ),
  }

  return (
    <>
      <section>
        <span className="me-section-label">Pattern tester</span>
        <h2 className="me-section-title">Your tester space</h2>
        <p className="me-section-description">
          {openTests > 0 ? (
            <>
              {openTests} pattern test{openTests === 1 ? '' : 's'} recruiting right now.
            </>
          ) : (
            'No pattern tests recruiting at the moment.'
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/patterns" className="me-button">
            Browse open tests
          </Link>
          <Link href="/me/tester/assignments" className="me-button secondary">
            All assignments
          </Link>
        </div>
      </section>

      {buckets.active.length > 0 && (
        <section>
          <span className="me-section-label">Now</span>
          <h2 className="me-section-title">Active</h2>
          <AssignmentList rows={buckets.active} />
        </section>
      )}

      {buckets.pending.length > 0 && (
        <section>
          <span className="me-section-label">Waiting</span>
          <h2 className="me-section-title">Applications under review</h2>
          <AssignmentList rows={buckets.pending} />
        </section>
      )}

      {buckets.closed.length > 0 && (
        <section>
          <span className="me-section-label">Past</span>
          <h2 className="me-section-title">Recently closed</h2>
          <AssignmentList rows={buckets.closed.slice(0, 5)} />
        </section>
      )}
    </>
  )
}

function AssignmentList({
  rows,
}: {
  rows: Array<{
    id: string
    status: TestAssignmentStatus
    appliedAt: Date
    patternTest: { id: string; title: string; tutorial: { title: string } }
  }>
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'var(--font-lora)' }}>
      {rows.map((a) => (
        <li
          key={a.id}
          style={{
            borderBottom: '0.5px solid var(--color-linen-grey)',
            padding: '12px 0',
          }}
        >
          <Link
            href={`/me/tester/assignments/${a.id}`}
            style={{
              color: 'var(--color-espresso)',
              fontFamily: 'var(--font-fraunces)',
              fontSize: 17,
            }}
          >
            {a.patternTest.title}
          </Link>
          <div style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 4 }}>
            <span className="me-status-pill">{a.status.toLowerCase().replace('_', ' ')}</span>
            <span style={{ marginLeft: 8 }}>· {a.patternTest.tutorial.title}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
