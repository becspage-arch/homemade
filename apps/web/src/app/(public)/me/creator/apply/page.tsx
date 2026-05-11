import { redirect } from 'next/navigation'
import { prisma, CreatorApplicationStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CreatorApplicationForm } from './creator-application-form'

export const dynamic = 'force-dynamic'

export default async function CreatorApplyPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  })

  if (profile?.applicationStatus === CreatorApplicationStatus.APPROVED && user.isCreator) {
    redirect('/me/creator')
  }

  const isResubmit = !!profile

  return (
    <>
      <section>
        <span className="me-section-label">Creator program</span>
        <h2 className="me-section-title">
          {isResubmit ? 'Update your application' : 'Apply to be a creator'}
        </h2>
        <p className="me-section-description">
          Creators write tutorials in their own voice, run pattern tests with the
          Homemade community, and appear on the public makers directory once approved.
          The Homemade team reviews every application before anything goes public.
        </p>
        {profile?.applicationStatus === CreatorApplicationStatus.APPLIED && (
          <p className="me-empty" style={{ marginBottom: 20 }}>
            Your application is currently under review. You can update your
            details below and they’ll be saved against your application.
          </p>
        )}
        {profile?.applicationStatus === CreatorApplicationStatus.REJECTED &&
          profile.rejectionReason && (
            <p className="me-empty" style={{ marginBottom: 20 }}>
              <strong>Last decision:</strong> {profile.rejectionReason}
            </p>
          )}
      </section>

      <section>
        <CreatorApplicationForm
          defaults={{
            bio: profile?.bio ?? '',
            specialty: profile?.specialty ?? '',
            applicationNote: profile?.applicationNote ?? '',
            displayHandle: user.displayHandle ?? '',
            websiteUrl: profile?.websiteUrl ?? '',
            instagramHandle: profile?.instagramHandle ?? '',
            youtubeHandle: profile?.youtubeHandle ?? '',
            tiktokHandle: profile?.tiktokHandle ?? '',
            substackUrl: profile?.substackUrl ?? '',
            pinterestHandle: profile?.pinterestHandle ?? '',
          }}
          handleAlreadySet={Boolean(user.displayHandle)}
        />
      </section>
    </>
  )
}
