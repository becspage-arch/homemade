import { prisma, UserPhotoStatus, PatternType } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import { UserPatternPhotoQueue } from './queue'

export const dynamic = 'force-dynamic'

const PATTERN_TYPE_FILTERS: { label: string; value: PatternType | 'ALL' }[] = [
  { label: 'All types', value: 'ALL' },
  { label: 'Cross stitch', value: PatternType.CROSS_STITCH },
  { label: 'Crochet', value: PatternType.CROCHET_CHART },
]

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string }>
}

const PAGE_SIZE = 20

export default async function AdminUserPatternPhotosPage({ searchParams }: PageProps) {
  const { page: pageParam, type: typeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) ?? 1)
  const patternTypeFilter =
    typeParam && typeParam !== 'ALL' ? (typeParam as PatternType) : undefined

  const where = {
    status: UserPhotoStatus.PENDING,
    ...(patternTypeFilter ? { patternType: patternTypeFilter } : {}),
  }

  const [photos, total] = await Promise.all([
    prisma.userPatternPhoto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, displayHandle: true } },
        media: { select: { id: true, r2Key: true, cloudflareId: true, alt: true } },
      },
    }),
    prisma.userPatternPhoto.count({ where }),
  ])

  const photosWithUrls = photos.map((p) => ({
    ...p,
    thumbUrl: mediaUrl(p.media, 'thumbnail'),
    fullUrl: mediaUrl(p.media, 'public'),
    createdAt: p.createdAt,
  }))

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>User pattern photos</h1>
          <p>
            Finished-piece photos submitted by Makers. Approve to publish, Feature to add to the
            gallery, Hero to use as the pattern card hero.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {PATTERN_TYPE_FILTERS.map((f) => (
          <a
            key={f.value}
            href={`/admin/user-pattern-photos?type=${f.value}`}
            className={`admin-pill ${!typeParam && f.value === 'ALL' ? 'active' : typeParam === f.value ? 'active' : ''}`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {photosWithUrls.length === 0 ? (
        <div className="admin-empty-state">
          <p>No pending user pattern photos.</p>
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--color-warm-taupe)' }}>
            Photos submitted by Makers will appear here once USER_SUBMISSION_ENABLED is turned on.
          </p>
        </div>
      ) : (
        <UserPatternPhotoQueue photos={photosWithUrls} />
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 24, alignItems: 'center' }}>
          {page > 1 && (
            <a
              href={`/admin/user-pattern-photos?page=${page - 1}&type=${typeParam ?? 'ALL'}`}
              className="admin-btn"
            >
              Previous
            </a>
          )}
          <span style={{ fontSize: 13, color: 'var(--color-warm-taupe)' }}>
            Page {page} of {totalPages} ({total} total)
          </span>
          {page < totalPages && (
            <a
              href={`/admin/user-pattern-photos?page=${page + 1}&type=${typeParam ?? 'ALL'}`}
              className="admin-btn"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
