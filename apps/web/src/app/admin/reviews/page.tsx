import Link from 'next/link'
import { prisma, ReviewStatus } from '@homemade/db'
import { ReviewModerationCard } from './review-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: ReviewStatus | 'all' }[] = [
  { label: 'Pending', value: ReviewStatus.PENDING_MODERATION },
  { label: 'Published', value: ReviewStatus.PUBLISHED },
  { label: 'Hidden', value: ReviewStatus.HIDDEN },
  { label: 'Removed', value: ReviewStatus.REMOVED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? ReviewStatus.PENDING_MODERATION
  const where =
    active === 'all'
      ? {}
      : { status: active as ReviewStatus }

  const reviews = await prisma.review.findMany({
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
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Reviews</h1>
          <p>Approve or hide reviews readers leave on tutorials they’ve made.</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/reviews?status=all'
                : `/admin/reviews?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="admin-card" style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}>
          Nothing here.
        </p>
      ) : (
        reviews.map((r) => <ReviewModerationCard key={r.id} review={r} />)
      )}
    </div>
  )
}
