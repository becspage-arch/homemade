import Link from 'next/link'
import { prisma, CreatorApplicationStatus, TutorialStatus } from '@homemade/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminCreatorsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === 'active' ? 'active' : 'applications'

  const [applications, active, pendingModerationCount] = await Promise.all([
    prisma.creatorProfile.findMany({
      where: { applicationStatus: CreatorApplicationStatus.APPLIED },
      orderBy: { appliedAt: 'asc' },
      include: {
        user: { select: { id: true, email: true, displayHandle: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        isCreator: true,
        creatorProfile: { applicationStatus: CreatorApplicationStatus.APPROVED },
      },
      orderBy: { creatorVerifiedAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        displayHandle: true,
        creatorVerifiedAt: true,
        creatorProfile: { select: { specialty: true } },
        _count: {
          select: {
            tutorialsCreated: {
              where: { status: TutorialStatus.PUBLISHED },
            },
          },
        },
      },
    }),
    prisma.tutorial.count({
      where: {
        status: TutorialStatus.PENDING_MODERATION,
        creatorId: { not: null },
      },
    }),
  ])

  return (
    <div>
      <div className="admin-page-header">
        <h1>Creators</h1>
        <p>
          {applications.length} application{applications.length === 1 ? '' : 's'} awaiting review ·{' '}
          {active.length} active creator{active.length === 1 ? '' : 's'} ·{' '}
          {pendingModerationCount} tutorial
          {pendingModerationCount === 1 ? '' : 's'} pending moderation
        </p>
      </div>

      <nav className="admin-tabs" aria-label="Creator tabs">
        <Link
          href="/admin/creators"
          className={`admin-tab ${tab === 'applications' ? 'active' : ''}`}
        >
          Applications ({applications.length})
        </Link>
        <Link
          href="/admin/creators?tab=active"
          className={`admin-tab ${tab === 'active' ? 'active' : ''}`}
        >
          Active creators ({active.length})
        </Link>
      </nav>

      {tab === 'applications' ? (
        applications.length === 0 ? (
          <p className="admin-empty">No applications waiting.</p>
        ) : (
          <ul className="admin-list">
            {applications.map((a) => (
              <li key={a.id} className="admin-list-row">
                <div>
                  <Link
                    href={`/admin/creators/${a.id}`}
                    className="admin-list-title"
                  >
                    {a.user.name ?? a.user.displayHandle ?? a.user.email}
                  </Link>
                  <div className="admin-list-meta">
                    {a.user.email}
                    {a.user.displayHandle && <> · @{a.user.displayHandle}</>}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-lora)',
                      fontStyle: 'italic',
                      color: 'var(--color-warm-taupe)',
                      marginTop: 6,
                    }}
                  >
                    {a.specialty}
                  </p>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-warm-taupe)' }}>
                  applied {a.appliedAt.toLocaleDateString('en-GB')}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : active.length === 0 ? (
        <p className="admin-empty">No approved creators yet.</p>
      ) : (
        <ul className="admin-list">
          {active.map((c) => (
            <li key={c.id} className="admin-list-row">
              <div>
                <Link
                  href={`/admin/users/${c.id}`}
                  className="admin-list-title"
                >
                  {c.name ?? c.displayHandle ?? c.email}
                </Link>
                <div className="admin-list-meta">
                  {c.email}
                  {c.displayHandle && <> · @{c.displayHandle}</>}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-lora)',
                    fontStyle: 'italic',
                    color: 'var(--color-warm-taupe)',
                    marginTop: 6,
                  }}
                >
                  {c.creatorProfile?.specialty}
                </p>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-warm-taupe)',
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span>{c._count.tutorialsCreated} published</span>
                {c.displayHandle && (
                  <Link
                    href={`/makers/${c.displayHandle}`}
                    style={{ color: 'var(--color-sage)' }}
                  >
                    public profile →
                  </Link>
                )}
                <Link
                  href={`/admin/creators/${c.id}/moderate-tutorials`}
                  className="admin-btn secondary"
                >
                  Moderate tutorials
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
