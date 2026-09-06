import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mediaUrl } from '@/lib/media'
import { resolveTarget } from '@/lib/maker-photo-target'
import { MyPhotoCard, type MyPhotoView } from './photo-card'

export const dynamic = 'force-dynamic'

export default async function MyPhotosPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  // Removed photos are gone from here too — removal is final, not an archive.
  const photos = await prisma.uGCPhoto.findMany({
    where: { userId: user.id, removedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      caption: true,
      status: true,
      rejectionReason: true,
      appealRequestedAt: true,
      tutorialId: true,
      patternId: true,
      patternType: true,
      media: { select: { cloudflareId: true, r2Key: true } },
    },
  })

  const views: MyPhotoView[] = await Promise.all(
    photos.map(async (p) => {
      const target = p.tutorialId
        ? ({ kind: 'tutorial', tutorialId: p.tutorialId } as const)
        : p.patternId && p.patternType
          ? ({ kind: 'pattern', patternId: p.patternId, patternType: p.patternType } as const)
          : null
      const resolved = target ? await resolveTarget(target) : null
      return {
        id: p.id,
        url: mediaUrl(p.media, 'card'),
        caption: p.caption,
        status: p.status as MyPhotoView['status'],
        rejectionReason: p.rejectionReason,
        appealRequested: p.appealRequestedAt !== null,
        itemTitle: resolved?.title ?? 'Your make',
        itemHref: resolved?.path ?? null,
      }
    }),
  )

  return (
    <section>
      <span className="me-section-label">Your photos</span>
      <h2 className="me-section-title">Photos</h2>
      <p className="me-section-description">
        Every photo you have uploaded. Removing one takes it off the site
        straight away. The full terms are on{' '}
        <Link href="/legal/photos" className="me-nav-link">
          Your photos on Homemade
        </Link>
        .
      </p>

      {views.length === 0 ? (
        <p className="me-empty">
          No photos yet. Open anything you have made and use Upload photo.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {views.map((v) => (
            <MyPhotoCard key={v.id} photo={v} />
          ))}
        </div>
      )}
    </section>
  )
}
