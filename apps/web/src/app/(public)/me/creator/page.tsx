import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  prisma,
  CreatorApplicationStatus,
  PatternTestStatus,
  TutorialStatus,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

export default async function CreatorHomePage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  })

  // No application yet → push to apply
  if (!profile) redirect('/me/creator/apply')

  // Application pending or rejected: show status, not dashboard
  if (profile.applicationStatus !== CreatorApplicationStatus.APPROVED || !user.isCreator) {
    return <ApplicationStatus profile={profile} />
  }

  // Approved → dashboard
  const [tutorialCounts, activeTests, recentActivity] = await Promise.all([
    prisma.tutorial.groupBy({
      by: ['status'],
      where: { creatorId: user.id },
      _count: { _all: true },
    }),
    prisma.patternTest.findMany({
      where: {
        creatorId: user.id,
        status: { in: [PatternTestStatus.RECRUITING, PatternTestStatus.IN_PROGRESS] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        _count: { select: { assignments: true } },
      },
    }),
    prisma.tutorial.findMany({
      where: { creatorId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        slug: true,
        category: { select: { slug: true } },
      },
    }),
  ])

  const countFor = (s: TutorialStatus) =>
    tutorialCounts.find((c) => c.status === s)?._count._all ?? 0

  return (
    <>
      <section>
        <span className="me-section-label">Your creator space</span>
        <h2 className="me-section-title">Dashboard</h2>
        <p className="me-section-description">
          Write tutorials in your voice, run pattern tests with real makers,
          and see your work alongside the Homemade library.
        </p>
        <div className="me-grid" style={{ marginTop: 24 }}>
          <DashCard
            label="Drafts"
            value={countFor(TutorialStatus.DRAFT)}
            href="/me/creator/tutorials?status=DRAFT"
          />
          <DashCard
            label="In review"
            value={countFor(TutorialStatus.PENDING_MODERATION)}
            href="/me/creator/tutorials?status=PENDING_MODERATION"
          />
          <DashCard
            label="Published"
            value={countFor(TutorialStatus.PUBLISHED)}
            href="/me/creator/tutorials?status=PUBLISHED"
          />
          <DashCard
            label="Active pattern tests"
            value={activeTests.length}
            href="/me/creator/patterns"
          />
        </div>
      </section>

      <section>
        <span className="me-section-label">Quick actions</span>
        <h2 className="me-section-title">Make something</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/me/creator/tutorials/new" className="me-button">
            New tutorial
          </Link>
          <Link href="/me/creator/patterns/new" className="me-button secondary">
            New pattern test
          </Link>
          <Link href="/me/creator/profile" className="me-button secondary">
            Edit profile
          </Link>
          {user.displayHandle && (
            <Link href={`/makers/${user.displayHandle}`} className="me-button secondary">
              View public profile
            </Link>
          )}
        </div>
      </section>

      {activeTests.length > 0 && (
        <section>
          <span className="me-section-label">Pattern tests</span>
          <h2 className="me-section-title">Running now</h2>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {activeTests.map((t) => (
              <li key={t.id} style={{ marginBottom: 8 }}>
                <Link
                  href={`/me/creator/patterns/${t.id}`}
                  style={{ color: 'var(--color-sage)' }}
                >
                  {t.title}
                </Link>{' '}
                — {t.status.toLowerCase().replace('_', ' ')} ·{' '}
                {t._count.assignments} applicant{t._count.assignments === 1 ? '' : 's'}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recentActivity.length > 0 && (
        <section>
          <span className="me-section-label">Recent</span>
          <h2 className="me-section-title">Activity</h2>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {recentActivity.map((t) => (
              <li key={t.id} style={{ marginBottom: 8 }}>
                <Link
                  href={`/me/creator/tutorials/${t.id}`}
                  style={{ color: 'var(--color-sage)' }}
                >
                  {t.title}
                </Link>{' '}
                — {t.status.toLowerCase().replace('_', ' ')} ·{' '}
                edited {t.updatedAt.toLocaleDateString('en-GB')}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function DashCard({
  label,
  value,
  href,
}: {
  label: string
  value: number
  href: string
}) {
  return (
    <Link href={href} className="me-project-card">
      <span className="me-project-eyebrow">{label}</span>
      <span
        className="me-project-title"
        style={{ fontSize: 38, color: 'var(--color-sage)' }}
      >
        {value}
      </span>
    </Link>
  )
}

function ApplicationStatus({
  profile,
}: {
  profile: {
    applicationStatus: CreatorApplicationStatus
    rejectionReason: string | null
    appliedAt: Date
  }
}) {
  if (profile.applicationStatus === CreatorApplicationStatus.APPLIED) {
    return (
      <section>
        <span className="me-section-label">Application</span>
        <h2 className="me-section-title">Under review</h2>
        <p className="me-empty">
          Your application landed on {profile.appliedAt.toLocaleDateString('en-GB')}.
          The Homemade team is reading through it. You’ll get a notification when there’s news.
        </p>
        <p style={{ marginTop: 16 }}>
          <Link href="/me/creator/apply" className="me-nav-link">
            View your application →
          </Link>
        </p>
      </section>
    )
  }

  if (profile.applicationStatus === CreatorApplicationStatus.REJECTED) {
    return (
      <section>
        <span className="me-section-label">Application</span>
        <h2 className="me-section-title">Not this round</h2>
        <p className="me-empty">
          Your application wasn’t taken this time.
          {profile.rejectionReason && (
            <>
              <br />
              <br />
              <strong>Note from the team:</strong> {profile.rejectionReason}
            </>
          )}
        </p>
        <p style={{ marginTop: 16 }}>
          <Link href="/me/creator/apply" className="me-nav-link">
            Update and re-apply →
          </Link>
        </p>
      </section>
    )
  }

  return null
}
