import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, SuspensionStatus, UserRole } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'
import { UserDetailControls } from './user-controls'
import { CreatorTesterControls } from './creator-tester-controls'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminUserDetail({ params }: PageProps) {
  const { userId } = await params
  const [actor, target] = await Promise.all([
    getCurrentDbUser(),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        suspensions: {
          orderBy: { createdAt: 'desc' },
          include: {
            suspendedBy: { select: { name: true, email: true } },
            liftedBy: { select: { name: true, email: true } },
          },
        },
        creatorProfile: true,
        _count: {
          select: {
            projects: true,
            reviews: true,
            ugcPhotos: true,
            questions: true,
            answers: true,
            errata: true,
            reportsFiled: true,
            tutorialsCreated: true,
            patternTests: true,
            testAssignments: true,
          },
        },
      },
    }),
  ])

  if (!target) notFound()

  const [recentReviews, recentPhotos, recentQuestions, recentProjects] = await Promise.all([
    prisma.review.findMany({
      where: { userId: target.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true, slug: true, category: { select: { slug: true } } } } },
    }),
    prisma.uGCPhoto.findMany({
      where: { userId: target.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true } } },
    }),
    prisma.question.findMany({
      where: { userId: target.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true } } },
    }),
    prisma.userProject.findMany({
      where: { userId: target.id },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true } } },
    }),
  ])

  const actorIsAdmin = isAdmin(actor)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{target.displayHandle ?? target.name ?? target.email}</h1>
          <p>
            {target.email}
            {' · '}
            <span className="admin-pill">{target.role.toLowerCase()}</span>
            {target.isSuspended && (
              <>
                {' '}
                <span className="admin-pill flagged">
                  suspended
                  {target.suspendedUntil
                    ? ` · until ${target.suspendedUntil.toLocaleDateString('en-GB')}`
                    : ' · indefinite'}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <UserDetailControls
        userId={target.id}
        currentRole={target.role}
        isSuspended={target.isSuspended}
        actorIsAdmin={actorIsAdmin}
        isSelf={actor?.id === target.id}
        targetIsAdmin={target.role === UserRole.ADMIN}
      />

      <CreatorTesterControls
        userId={target.id}
        isCreator={target.isCreator}
        isPatternTester={target.isPatternTester}
        creatorVerifiedAt={target.creatorVerifiedAt}
        actorIsAdmin={actorIsAdmin}
        isSelf={actor?.id === target.id}
        displayHandle={target.displayHandle}
        creatorProfileStatus={target.creatorProfile?.applicationStatus ?? null}
        creatorProfileId={target.creatorProfile?.id ?? null}
      />

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card-eyebrow">Activity</div>
        <ul style={{ fontFamily: 'var(--font-lora)', lineHeight: 1.7 }}>
          <li>{target._count.projects} projects started</li>
          <li>{target._count.reviews} reviews</li>
          <li>{target._count.ugcPhotos} photos uploaded</li>
          <li>{target._count.questions} questions, {target._count.answers} answers</li>
          <li>{target._count.errata} errata reports</li>
          <li>{target._count.reportsFiled} abuse reports filed</li>
          {target.isCreator && (
            <>
              <li>{target._count.tutorialsCreated} creator tutorials</li>
              <li>{target._count.patternTests} pattern tests run</li>
            </>
          )}
          {target.isPatternTester && (
            <li>{target._count.testAssignments} pattern test assignments</li>
          )}
          <li>Joined {target.createdAt.toLocaleDateString('en-GB')}</li>
        </ul>
      </div>

      {recentProjects.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Recent projects</div>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {recentProjects.map((p) => (
              <li key={p.id}>
                {p.tutorial.title} — {p.status.replace('_', ' ').toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentReviews.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Recent reviews</div>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {recentReviews.map((r) => (
              <li key={r.id}>
                ★{r.rating} on {r.tutorial.title} — {r.status.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentPhotos.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Recent photos</div>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {recentPhotos.map((p) => (
              <li key={p.id}>
                {p.tutorial.title} — {p.status.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentQuestions.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Recent questions</div>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {recentQuestions.map((q) => (
              <li key={q.id}>
                on {q.tutorial.title} — {q.status.replace('_', ' ').toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {target.suspensions.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Suspension history</div>
          <ul style={{ fontFamily: 'var(--font-lora)' }}>
            {target.suspensions.map((s) => (
              <li key={s.id} style={{ marginBottom: 8 }}>
                <strong>{s.status === SuspensionStatus.ACTIVE ? 'Active' : s.status.toLowerCase()}</strong>{' '}
                · started {s.startedAt.toLocaleDateString('en-GB')}
                {s.endsAt ? ` · until ${s.endsAt.toLocaleDateString('en-GB')}` : ' · indefinite'}
                {s.liftedAt ? ` · lifted ${s.liftedAt.toLocaleDateString('en-GB')}` : ''}
                <br />
                <span style={{ color: 'var(--color-warm-taupe)', fontSize: 13 }}>
                  Reason: {s.reason} · by {s.suspendedBy.email}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/admin/users" className="admin-btn secondary">
          Back to users
        </Link>
      </p>
    </div>
  )
}
