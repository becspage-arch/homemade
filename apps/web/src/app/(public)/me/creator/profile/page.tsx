import { redirect } from 'next/navigation'
import { prisma, CreatorApplicationStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CreatorProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function CreatorProfilePage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile || profile.applicationStatus !== CreatorApplicationStatus.APPROVED) {
    redirect('/me/creator')
  }

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">Edit your profile</h2>
        <p className="me-section-description">
          What readers see at /makers/{user.displayHandle ?? '<handle>'}.
          Changes go live straight away.
        </p>
      </section>

      <section>
        <CreatorProfileForm
          defaults={{
            bio: profile.bio,
            specialty: profile.specialty,
            displayHandle: user.displayHandle ?? '',
            websiteUrl: profile.websiteUrl ?? '',
            instagramHandle: profile.instagramHandle ?? '',
            youtubeHandle: profile.youtubeHandle ?? '',
            tiktokHandle: profile.tiktokHandle ?? '',
            substackUrl: profile.substackUrl ?? '',
            pinterestHandle: profile.pinterestHandle ?? '',
          }}
        />
      </section>
    </>
  )
}
