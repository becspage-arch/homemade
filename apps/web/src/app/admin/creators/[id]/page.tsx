import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, CreatorApplicationStatus } from '@homemade/db'
import { CreatorApplicationDecisionControls } from './decision-controls'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CreatorApplicationPage({ params }: PageProps) {
  const { id } = await params

  const profile = await prisma.creatorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          displayHandle: true,
          isCreator: true,
          isSuspended: true,
          isPublicMakerProfile: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              reviews: true,
              ugcPhotos: true,
              questions: true,
              tutorialsCreated: true,
            },
          },
        },
      },
      decidedBy: { select: { email: true, name: true } },
    },
  })

  if (!profile) notFound()

  const [recentReviews, recentPhotos, recentTutorials] = await Promise.all([
    prisma.review.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true } } },
    }),
    prisma.uGCPhoto.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tutorial: { select: { title: true } } },
    }),
    prisma.tutorial.findMany({
      where: { creatorId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{profile.user.name ?? profile.user.displayHandle ?? profile.user.email}</h1>
          <p>
            {profile.user.email}
            {profile.user.displayHandle && <> · @{profile.user.displayHandle}</>}
            {' · '}
            <span className={`admin-pill ${pillClass(profile.applicationStatus)}`}>
              {profile.applicationStatus.toLowerCase()}
            </span>
          </p>
        </div>
        <Link href="/admin/creators" className="admin-btn secondary">
          ← All applications
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Maker profile</div>
        {profile.user.displayHandle ? (
          profile.user.isPublicMakerProfile ? (
            <>
              <p>
                <Link
                  href={`/m/${profile.user.displayHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn"
                >
                  Open /m/{profile.user.displayHandle} ↗
                </Link>{' '}
                — this is the applicant&apos;s actual pitch. Read it before
                deciding.
              </p>
              <div
                style={{
                  marginTop: 12,
                  border: '0.5px solid var(--color-warm-taupe)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  height: 600,
                }}
              >
                <iframe
                  src={`/m/${profile.user.displayHandle}`}
                  title={`Maker profile: ${profile.user.displayHandle}`}
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--color-burnt-sienna)' }}>
              Applicant&apos;s profile is private — flip the public toggle to
              preview it.
            </p>
          )
        ) : (
          <p style={{ color: 'var(--color-burnt-sienna)' }}>
            Applicant has no handle yet.
          </p>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-eyebrow">Specialty</div>
        <p style={{ fontStyle: 'italic' }}>{profile.specialty}</p>
        <div className="admin-card-eyebrow" style={{ marginTop: 16 }}>Bio</div>
        <p className="admin-card-body">{profile.bio}</p>
        {profile.applicationNote && (
          <>
            <div className="admin-card-eyebrow" style={{ marginTop: 16 }}>
              Note to reviewers (private)
            </div>
            <p className="admin-card-body">{profile.applicationNote}</p>
          </>
        )}
        <div className="admin-card-eyebrow" style={{ marginTop: 16 }}>Socials</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {profile.websiteUrl && <li>Website: {profile.websiteUrl}</li>}
          {profile.instagramHandle && <li>Instagram: {profile.instagramHandle}</li>}
          {profile.youtubeHandle && <li>YouTube: {profile.youtubeHandle}</li>}
          {profile.tiktokHandle && <li>TikTok: {profile.tiktokHandle}</li>}
          {profile.pinterestHandle && <li>Pinterest: {profile.pinterestHandle}</li>}
          {profile.substackUrl && <li>Substack: {profile.substackUrl}</li>}
          {!profile.websiteUrl &&
            !profile.instagramHandle &&
            !profile.youtubeHandle &&
            !profile.tiktokHandle &&
            !profile.pinterestHandle &&
            !profile.substackUrl && (
              <li style={{ color: 'var(--color-warm-taupe)', fontStyle: 'italic' }}>
                None provided.
              </li>
            )}
        </ul>
        <div className="admin-card-meta" style={{ marginTop: 16 }}>
          <span>applied {profile.appliedAt.toLocaleDateString('en-GB')}</span>
          {profile.decidedAt && (
            <span>
              decided {profile.decidedAt.toLocaleDateString('en-GB')}
              {profile.decidedBy?.email ? ` by ${profile.decidedBy.email}` : ''}
            </span>
          )}
        </div>
        {profile.rejectionReason && (
          <p style={{ marginTop: 12, color: 'var(--color-burnt-sienna)', fontSize: 13 }}>
            Last rejection: {profile.rejectionReason}
          </p>
        )}
      </div>

      {profile.applicationStatus === CreatorApplicationStatus.APPLIED && (
        <CreatorApplicationDecisionControls profileId={profile.id} />
      )}

      <div className="admin-card">
        <div className="admin-card-eyebrow">Existing activity</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Joined Homemade {profile.user.createdAt.toLocaleDateString('en-GB')}</li>
          <li>
            {profile.user._count.projects} projects ·{' '}
            {profile.user._count.reviews} reviews ·{' '}
            {profile.user._count.ugcPhotos} photos ·{' '}
            {profile.user._count.questions} questions
          </li>
          <li>{profile.user._count.tutorialsCreated} creator tutorials so far</li>
          {profile.user.isSuspended && (
            <li style={{ color: 'var(--color-burnt-sienna)' }}>
              <strong>Account is currently suspended.</strong>
            </li>
          )}
        </ul>
      </div>

      {recentReviews.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Recent reviews</div>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
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
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {recentPhotos.map((p) => (
              <li key={p.id}>
                {p.tutorial.title} — {p.status.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentTutorials.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-eyebrow">Creator tutorials so far</div>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {recentTutorials.map((t) => (
              <li key={t.id}>
                {t.title} — {t.status.toLowerCase().replace('_', ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function pillClass(status: CreatorApplicationStatus): string {
  switch (status) {
    case CreatorApplicationStatus.APPLIED:
      return 'pending'
    case CreatorApplicationStatus.APPROVED:
      return 'approved'
    case CreatorApplicationStatus.REJECTED:
      return 'rejected'
    default:
      return ''
  }
}
