import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, PatternTestStatus, TestAssignmentStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export default async function CreatorPatternsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const tests = await prisma.patternTest.findMany({
    where: { creatorId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      tutorial: { select: { title: true, slug: true, category: { select: { slug: true } } } },
      _count: {
        select: {
          assignments: { where: { status: { in: [TestAssignmentStatus.APPLIED, TestAssignmentStatus.ACCEPTED, TestAssignmentStatus.IN_PROGRESS, TestAssignmentStatus.COMPLETED] } } },
        },
      },
    },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">Pattern tests</h2>
        <p className="me-section-description">
          Recruit testers from the Homemade community to make your tutorial,
          then read their structured feedback. Use it to refine before
          publishing — or after.
        </p>
        <Link href="/me/creator/patterns/new" className="me-button">
          New pattern test
        </Link>
      </section>

      <section>
        {tests.length === 0 ? (
          <p className="me-empty">No pattern tests yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'var(--font-lora)' }}>
            {tests.map((t) => (
              <li
                key={t.id}
                style={{
                  borderBottom: '0.5px solid var(--color-linen-grey)',
                  padding: '14px 0',
                }}
              >
                <Link
                  href={`/me/creator/patterns/${t.id}`}
                  style={{
                    color: 'var(--color-espresso)',
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 18,
                  }}
                >
                  {t.title}
                </Link>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-warm-taupe)',
                    marginTop: 4,
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span className={pillClassForStatus(t.status)}>
                    {t.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span>· tutorial: {t.tutorial.title}</span>
                  <span>· {t._count.assignments} of {t.maxTesters} testers</span>
                  {t.recruitingClosesAt && (
                    <span>· closes {t.recruitingClosesAt.toLocaleDateString('en-GB')}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function pillClassForStatus(status: PatternTestStatus): string {
  switch (status) {
    case PatternTestStatus.RECRUITING:
    case PatternTestStatus.IN_PROGRESS:
      return 'me-status-pill in-progress'
    case PatternTestStatus.COMPLETED:
      return 'me-status-pill completed'
    case PatternTestStatus.CANCELLED:
      return 'me-status-pill abandoned'
    default:
      return 'me-status-pill'
  }
}
