import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PENDING_MODERATION: 'In review',
  PUBLISHED: 'Published',
  HIDDEN: 'Hidden',
  REMOVED: 'Removed',
}

export default async function MyReviewsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tutorial: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  })

  return (
    <section>
      <span className="me-section-label">Your reviews</span>
      <h2 className="me-section-title">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="me-empty">
          You haven’t reviewed anything yet. Once you’ve marked a tutorial as
          made you can leave a review on it.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--color-cream)',
                border: '0.5px solid var(--color-linen-grey)',
                borderRadius: 4,
                padding: 18,
                fontFamily: 'var(--font-lora)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href={`/${r.tutorial.category.slug}/${r.tutorial.slug}`}
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 18,
                    color: 'var(--color-espresso)',
                    textDecoration: 'none',
                  }}
                >
                  {r.tutorial.title}
                </Link>
                <span className="me-status-pill">{STATUS_LABEL[r.status] ?? r.status}</span>
              </div>
              <div
                style={{
                  color: 'var(--color-sage)',
                  fontSize: 14,
                  margin: '4px 0',
                }}
              >
                {'★'.repeat(r.rating)}
                <span style={{ color: 'var(--color-linen-grey)' }}>{'★'.repeat(5 - r.rating)}</span>
              </div>
              {r.title && (
                <p style={{ margin: '6px 0 4px', fontWeight: 500 }}>{r.title}</p>
              )}
              <p style={{ margin: '4px 0', color: 'var(--color-espresso)' }}>{r.body}</p>
              {r.moderationNote && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-warm-taupe)',
                    fontStyle: 'italic',
                    marginTop: 6,
                  }}
                >
                  Moderator note: {r.moderationNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
