import Link from 'next/link'
import { prisma, UGCPhotoStatus } from '@homemade/db'
import { cloudflareDeliveryUrl } from '@/lib/media'
import { nsfwDecision } from '@/lib/nsfw-scan'
import { PhotoModerationCard } from './photo-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: UGCPhotoStatus | 'all' }[] = [
  { label: 'Pending', value: UGCPhotoStatus.PENDING_MODERATION },
  { label: 'Approved', value: UGCPhotoStatus.APPROVED },
  { label: 'Rejected', value: UGCPhotoStatus.REJECTED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminUgcPhotosPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? UGCPhotoStatus.PENDING_MODERATION
  const where = active === 'all' ? {} : { status: active as UGCPhotoStatus }

  const photos = await prisma.uGCPhoto.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, displayHandle: true } },
      tutorial: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { slug: true, name: true } },
        },
      },
      media: { select: { cloudflareId: true, alt: true } },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>UGC photos</h1>
          <p>
            Photos readers upload of their projects. Each one is scanned for
            inappropriate content before reaching this queue.
          </p>
        </div>
      </div>

      <div className="admin-notice">
        <strong>Heads-up:</strong> public user-photo uploads aren’t enabled
        until the legal terms session lands. The upload flow works for
        signed-in test accounts so this queue can be exercised.
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/ugc-photos?status=all'
                : `/admin/ugc-photos?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {photos.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing here.
        </p>
      ) : (
        <div className="admin-card-grid">
          {photos.map((p) => (
            <PhotoModerationCard
              key={p.id}
              photo={{
                ...p,
                thumbUrl: cloudflareDeliveryUrl(p.media.cloudflareId, 'card'),
                fullUrl: cloudflareDeliveryUrl(p.media.cloudflareId, 'public'),
                nsfwBucket: nsfwDecision(p.nsfwScore),
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
