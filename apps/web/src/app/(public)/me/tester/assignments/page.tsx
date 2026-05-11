import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export default async function TesterAssignmentsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isPatternTester) redirect('/me/tester/apply')

  const assignments = await prisma.testAssignment.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      patternTest: {
        select: {
          id: true,
          title: true,
          tutorial: { select: { title: true } },
        },
      },
    },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Pattern tester</span>
        <h2 className="me-section-title">Your assignments</h2>
        <p className="me-section-description">
          Every test you’ve applied to, accepted, completed, or withdrawn from.
        </p>
        <p style={{ marginBottom: 16 }}>
          <Link href="/patterns" className="me-nav-link">
            Browse open tests →
          </Link>
        </p>
      </section>

      <section>
        {assignments.length === 0 ? (
          <p className="me-empty">No assignments yet. Apply to an open pattern test to start.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'var(--font-lora)' }}>
            {assignments.map((a) => (
              <li
                key={a.id}
                style={{
                  borderBottom: '0.5px solid var(--color-linen-grey)',
                  padding: '14px 0',
                }}
              >
                <Link
                  href={`/me/tester/assignments/${a.id}`}
                  style={{
                    color: 'var(--color-espresso)',
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 18,
                  }}
                >
                  {a.patternTest.title}
                </Link>
                <div style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 4 }}>
                  <span className="me-status-pill">
                    {a.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span style={{ marginLeft: 8 }}>· {a.patternTest.tutorial.title}</span>
                  <span style={{ marginLeft: 8 }}>
                    · applied {a.appliedAt.toLocaleDateString('en-GB')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
